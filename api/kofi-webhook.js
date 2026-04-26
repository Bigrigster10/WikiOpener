import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Validate environment variables
if (!process.env.FIREBASE_PROJECT_ID) {
  console.warn('Missing FIREBASE_PROJECT_ID environment variable.');
}

// Initialize Firebase Admin (only once)
if (getApps().length === 0) {
  try {
    // For Vercel, you need to parse the private key because environment variables
    // can sometimes escape newlines incorrectly.
    let privateKey = process.env.FIREBASE_PRIVATE_KEY 
      ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
      : undefined;

    // If the user forgot to include the PEM header/footer, add it
    if (privateKey && !privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
      privateKey = `-----BEGIN PRIVATE KEY-----\n${privateKey}\n-----END PRIVATE KEY-----\n`;
    }

    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
      }),
    });
  } catch (error) {
    console.error('Firebase Admin initialization error', error);
  }
}

const db = getFirestore();
const auth = getAuth();

export default async function handler(req, res) {
  // Only allow POST requests for the webhook
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Ko-fi sends data as application/x-www-form-urlencoded with a 'data' field
    // containing the JSON stringification of the payment data.
    // Sometimes it's already parsed depending on body-parser setup.
    const payloadContent = req.body.data;
    
    if (!payloadContent) {
      return res.status(400).json({ error: 'No data payload found' });
    }

    let paymentData;
    try {
      // If it's a string, parse it. If it's already an object, use it directly.
      paymentData = typeof payloadContent === 'string' ? JSON.parse(payloadContent) : payloadContent;
    } catch (e) {
      return res.status(400).json({ error: 'Invalid JSON in data payload' });
    }

    // 1. Verify it's actually from Ko-fi
    // Ko-fi sends verification_token in the data object
    if (paymentData.verification_token !== process.env.KOFI_TOKEN) {
      console.error('Unauthorized webhook attempt');
      return res.status(401).send('Unauthorized');
    }

    const userEmail = paymentData.email;

    if (!userEmail) {
      console.warn("Ko-fi webhook received, but no email was provided.");
      return res.status(200).send('Success without email');
    }

    // 2. Update Firebase
    // Ko-fi doesn't give us the user's Firebase UID directly, just their email.
    // So we first need to look up the user by email using Firebase Auth Admin.
    try {
        const userRecord = await auth.getUserByEmail(userEmail);
        const uid = userRecord.uid;

        // Now update their profile document in Firestore to set adsRemoved to true
        const userRef = db.collection('users').doc(uid);
        
        await userRef.set({
            adsRemoved: true,
            updatedAt: new Date()
        }, { merge: true });

        console.log(`Successfully removed ads for user: ${userEmail}`);
    } catch (e) {
        if (e.code === 'auth/user-not-found') {
            console.log(`Donation received from ${userEmail}, but no matching Firebase user was found.`);
            // You might want to save this to a 'pending_donations' collection instead 
            // incase they create an account later.
        } else {
            console.error('Error updating user in Firebase:', e);
            throw e;
        }
    }

    return res.status(200).send('Success');
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
