import { create } from 'zustand';
import { db, auth } from '../lib/firebase';
import { collection, doc, onSnapshot, getDocs, getDoc, setDoc, query, orderBy, limit, runTransaction, serverTimestamp } from 'firebase/firestore';
import { User, onAuthStateChanged } from 'firebase/auth';

interface Preferences {
  fastOpen: boolean;
  streamerMode: boolean;
  sound: boolean;
  currency: 'USD' | 'CR';
}

interface GameState {
  user: User | null;
  profile: UserProfile | null;
  inventory: Item[];
  leaderboard: UserProfile[];
  loading: boolean;
  theme: string;
  preferences: Preferences;
  setTheme: (theme: string) => void;
  setPreference: <K extends keyof Preferences>(key: K, value: Preferences[K]) => void;
  init: () => void;
  openCase: (caseId: string, itemData: Item) => Promise<void>;
  sellItem: (itemId: string, itemValue: number) => Promise<boolean>;
  fetchLeaderboard: () => Promise<void>;
  recordAdWatch: () => Promise<void>;
}

export interface UserProfile {
  userId: string;
  displayName: string;
  photoURL: string;
  credits: number;
  netWorth: number;
  casesOpened: number;
  lastAdWatchedAt?: number;
  updatedAt?: any;
  createdAt?: any;
}

export interface Item {
  id?: string;
  title: string;
  image: string;
  rarity: string;
  wear: string;
  durability: number;
  value: number;
  pageId?: number;
  caseType: string;
  acquiredAt?: any;
  timestamp?: number;
}

export const useGameStore = create<GameState>((set, get) => {
  const getInitialPreferences = (): Preferences => {
    try {
      const saved = localStorage.getItem('site-prefs');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      fastOpen: false,
      streamerMode: false,
      sound: true,
      currency: 'USD'
    };
  };

  return {
    user: null,
    profile: null,
    inventory: [],
    leaderboard: [],
    loading: true,
    theme: localStorage.getItem('site-theme') || 'frosted-glass',
    preferences: getInitialPreferences(),

    setTheme: (theme: string) => {
      localStorage.setItem('site-theme', theme);
      document.documentElement.setAttribute('data-theme', theme);
      set({ theme });
    },

    setPreference: <K extends keyof Preferences>(key: K, value: Preferences[K]) => {
      set((state) => {
        const newPrefs = { ...state.preferences, [key]: value };
        localStorage.setItem('site-prefs', JSON.stringify(newPrefs));
        return { preferences: newPrefs };
      });
    },

    init: () => {
    const savedTheme = localStorage.getItem('site-theme') || 'frosted-glass';
    document.documentElement.setAttribute('data-theme', savedTheme);

    onAuthStateChanged(auth, async (user) => {
      set({ user });
      if (user) {
        try {
          // Ensure user doc exists
          const userRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userRef);
          
          if (!userSnap.exists()) {
            await setDoc(userRef, {
              userId: user.uid,
              displayName: user.displayName || 'Anonymous',
              photoURL: user.photoURL || '',
              credits: 0,
              netWorth: 0,
              casesOpened: 0,
              updatedAt: serverTimestamp(),
              createdAt: serverTimestamp() // Rule requires createdAt == request.time on create
            });
          }

          // Subscribe to profile
          onSnapshot(userRef, (docSnap) => {
            if (docSnap.exists()) {
              set({ profile: docSnap.data() as UserProfile });
            }
          });

          // Subscribe to inventory
          const invRef = collection(db, `users/${user.uid}/inventory`);
          onSnapshot(invRef, (snap) => {
            const inv: Item[] = [];
            snap.forEach(d => inv.push({ ...(d.data() as Item), id: d.id }));
            inv.sort((a, b) => b.value - a.value); // Sort high value first
            set({ inventory: inv });
          });
          
          get().fetchLeaderboard();
        } catch (error) {
          console.error("Initialization error:", error);
        }
      } else {
        set({ profile: null, inventory: [] });
      }
      set({ loading: false });
    });
  },

  openCase: async (caseId: string, itemData: Item) => {
    const { user, profile } = get();
    if (!user || !profile) return;

    const userRef = doc(db, 'users', user.uid);
    const itemRef = itemData.id 
      ? doc(db, `users/${user.uid}/inventory`, itemData.id)
      : doc(collection(db, `users/${user.uid}/inventory`));
    
    // Ensure itemData doesn't clash with Firestore auto-id if we didn't have one
    const finalItemData = { ...itemData, id: itemRef.id };

    // We update stats directly
    try {
      await runTransaction(db, async (t) => {
        const userDoc = await t.get(userRef);
        if (!userDoc.exists()) throw new Error("No user");
        const data = userDoc.data();
        
        // This transaction logic calculates the case cost outside in the UI but let's re-verify here
        // Actually, cost deduction is passed. We just assume for now the user can afford it.
        // Wait, UI should check, but transaction ensures it
        const cases = (await import('../lib/gameLogic')).CASES;
        const caseCost = cases.find(c => c.id === caseId)?.cost || 0;
        
        if (data.credits < caseCost) {
            throw new Error("Not enough credits");
        }

        const newCredits = data.credits - caseCost;
        const newNetWorth = newCredits + itemData.value + get().inventory.reduce((acc, i) => acc + i.value, 0); // Not perfect (doesn't account for live inventory state in txn) but okay for this simple app

        t.update(userRef, {
          credits: newCredits,
          netWorth: newNetWorth,
          casesOpened: (data.casesOpened || 0) + 1,
          updatedAt: serverTimestamp()
        });

        t.set(itemRef, {
          ...finalItemData,
          acquiredAt: serverTimestamp()
        });
      });
    } catch (e) {
      console.error(e);
      throw e;
    }
  },

  sellItem: async (itemId: string, itemValue: number) => {
    const { user } = get();
    if (!user) return false;

    const userRef = doc(db, 'users', user.uid);
    const itemRef = doc(db, `users/${user.uid}/inventory`, itemId);

    try {
      await runTransaction(db, async (t) => {
        const userDoc = await t.get(userRef);
        const itemDoc = await t.get(itemRef);
        
        if (!userDoc.exists() || !itemDoc.exists()) throw new Error("Missing doc");
        
        const data = userDoc.data();
        
        // Delete item
        t.delete(itemRef);
        
        // Update user
        const newCredits = data.credits + itemValue;
        // netWorth actually stays the same since it just converts item value to credits!
        const newNetWorth = newCredits + get().inventory.reduce((acc, i) => i.id !== itemId ? acc + i.value : acc, 0);
        
        t.update(userRef, {
          credits: newCredits,
          netWorth: newNetWorth,
          updatedAt: serverTimestamp()
        });
      });
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  },

  fetchLeaderboard: async () => {
    try {
      const q = query(collection(db, 'users'), orderBy('netWorth', 'desc'), limit(15));
      const snaps = await getDocs(q);
      const top: UserProfile[] = [];
      snaps.forEach(s => top.push(s.data() as UserProfile));
      set({ leaderboard: top });
    } catch (e) {
      console.error("Failed to fetch leaderboard", e);
    }
  },

  recordAdWatch: async () => {
    const { user } = get();
    if (!user) return;
    
    const userRef = doc(db, 'users', user.uid);
    try {
      await setDoc(userRef, { lastAdWatchedAt: Date.now(), updatedAt: serverTimestamp() }, { merge: true });
    } catch (error) {
      console.error("Failed to record ad watch: ", error);
    }
  }

};
});
