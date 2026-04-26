import { create } from 'zustand';
import { db, auth } from '../lib/firebase';
import { collection, doc, onSnapshot, getDocs, getDoc, setDoc, query, orderBy, limit, runTransaction, serverTimestamp, increment } from 'firebase/firestore';
import { User, onAuthStateChanged } from 'firebase/auth';
import { Preferences, UserProfile, Item } from '../types';

interface GameState {
  user: User | null;
  profile: UserProfile | null;
  inventory: Item[];
  leaderboard: UserProfile[];
  loading: boolean;
  theme: string;
  preferences: Preferences;
  devForcedRarity: string | null;
  devForcedShiny: string | null;
  showSecretCase: boolean;
  jackpot: number;
  lastJackpotWinner: string | null;
  setTheme: (theme: string) => void;
  setPreference: <K extends keyof Preferences>(key: K, value: Preferences[K]) => void;
  setDevForcedRarity: (rarityId: string | null) => void;
  setDevForcedShiny: (shinyType: string | null) => void;
  setSecretUnlocked: (unlocked: boolean) => void;
  init: () => void;
  openCase: (caseId: string, itemData: Item, costOverride?: number) => Promise<{ wonJackpot: boolean; winAmount: number }>;
  sellItem: (itemId: string, itemValue: number) => Promise<boolean>;
  upgradeItem: (burnItem: Item, targetMultiplier: number, newItem: Item) => Promise<boolean>;
  tradeUpItems: (burnItems: Item[], newItem: Item) => Promise<boolean>;
  executeBattle: (totalCost: number, amountOpened: number, wonItems: Item[], newPity: number, wonBattle: boolean, cashPrize?: number) => Promise<boolean>;
  fetchLeaderboard: (sortBy?: string) => Promise<void>;
  recordAdWatch: () => Promise<void>;
  purchaseRemoveAds: () => Promise<boolean>;
  addBotJackpotContribution: (simulatedValue: number, isExceedinglyRare?: boolean) => Promise<void>;
}

const isDevMode = typeof window !== 'undefined' && (window.location.hostname.includes('.run.app') || window.location.hostname === 'localhost');
const mockUserId = 'dev-studio-user';

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
    devForcedRarity: null,
    devForcedShiny: null,
    showSecretCase: false,
    jackpot: 0,
    lastJackpotWinner: null,
    
    setTheme: (theme: string) => {
      localStorage.setItem('site-theme', theme);
      document.documentElement.setAttribute('data-theme', theme);
      set({ theme });
    },

    setDevForcedRarity: (rarityId: string | null) => set({ devForcedRarity: rarityId }),
    setDevForcedShiny: (shinyType: string | null) => set({ devForcedShiny: shinyType }),
    setSecretUnlocked: (unlocked: boolean) => set({ showSecretCase: unlocked }),

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

    if (isDevMode) {
      console.log("DEV MODE BINDING: Bypassing Firebase for local storage.");
      const loadStr = localStorage.getItem('dev-mock-profile');
      const profile = loadStr ? JSON.parse(loadStr) : {
        userId: mockUserId, displayName: 'AI Studio Dev', photoURL: '', credits: 10000, netWorth: 10000, casesOpened: 0, battleWins: 0
      };
      const invStr = localStorage.getItem('dev-mock-inventory');
      const inventory = invStr ? JSON.parse(invStr) : [];
      
      set({ user: { uid: mockUserId, displayName: 'AI Studio Dev' } as any, profile, inventory, loading: false });
      
      // Load mock jackpot
      const jackStr = localStorage.getItem('dev-mock-jackpot');
      if (jackStr) {
        const data = JSON.parse(jackStr);
        set({ jackpot: data.jackpot, lastJackpotWinner: data.lastWinnerName });
      }
      return;
    }

    onAuthStateChanged(auth, async (user) => {
      set({ user });
      if (user) {
        try {
          // Subscribe to global stats
          const statsRef = doc(db, 'stats', 'global');
          onSnapshot(statsRef, (snap) => {
            if (snap.exists()) {
              const data = snap.data();
              set({ jackpot: data.jackpot || 0, lastJackpotWinner: data.lastWinnerName || null });
            } else {
              // Initial stats if not exists
              setDoc(statsRef, { jackpot: 5000, updatedAt: serverTimestamp() }, { merge: true });
            }
          });

          // Ensure user doc exists
          const userRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userRef);
          
          if (!userSnap.exists()) {
            await setDoc(userRef, {
              userId: user.uid,
              displayName: user.displayName || (user.email ? user.email.split('@')[0] : 'Anonymous'),
              photoURL: user.photoURL || '',
              credits: 0,
              netWorth: 0,
              casesOpened: 0,
              battleWins: 0,
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

    openCase: async (caseId: string, itemData: Item, costOverride?: number) => {
    const { user, profile } = get();
    if (!user || !profile) return { wonJackpot: false, winAmount: 0 };

    if (isDevMode) {
        const cases = (await import('../lib/gameLogic')).CASES;
        const caseCost = costOverride !== undefined ? costOverride : (cases.find(c => c.id === caseId)?.cost || 0);
        if (profile.credits < caseCost) throw new Error("Not enough credits");
        
        const isHighTier = ['Classified', 'Covert', 'Exceedingly Rare'].includes(itemData.rarity);
        const newPityCounter = isHighTier ? 0 : ((profile.pityCounter || 0) + 1);

        const newItem = { ...itemData, id: itemData.id || ('mock-' + Date.now()), acquiredAt: Date.now() };
        const newInv = [newItem, ...get().inventory];
        let newCredits = profile.credits - caseCost;
        
        // Jackpot logic for dev mode
        const jackStr = localStorage.getItem('dev-mock-jackpot');
        let jackpotData = jackStr ? JSON.parse(jackStr) : { jackpot: 5000, lastWinnerName: null };
        const contribution = caseCost * 0.02;
        jackpotData.jackpot += contribution;

        let wonJackpot = false;
        let winAmount = 0;
        if (itemData.rarity === 'Exceedingly Rare') {
          if (Math.random() < 0.05) { // 5% chance
            wonJackpot = true;
            winAmount = jackpotData.jackpot;
            newCredits += winAmount;
            jackpotData.lastWinnerName = profile.displayName;
            jackpotData.jackpot = 5000; // Reset to seed
          }
        }
        
        const newNetWorth = newCredits + newInv.reduce((acc, i) => acc + i.value, 0);
        const newProfile = { 
            ...profile, 
            credits: newCredits, 
            netWorth: newNetWorth, 
            casesOpened: profile.casesOpened + 1,
            pityCounter: newPityCounter 
        };
        
        localStorage.setItem('dev-mock-profile', JSON.stringify(newProfile));
        localStorage.setItem('dev-mock-inventory', JSON.stringify(newInv));
        localStorage.setItem('dev-mock-jackpot', JSON.stringify(jackpotData));
        
        set({ profile: newProfile, inventory: newInv, jackpot: jackpotData.jackpot, lastJackpotWinner: jackpotData.lastWinnerName });
        return { wonJackpot, winAmount };
    }

    const userRef = doc(db, 'users', user.uid);
    const itemRef = itemData.id 
      ? doc(db, `users/${user.uid}/inventory`, itemData.id)
      : doc(collection(db, `users/${user.uid}/inventory`));
    
    // Ensure itemData doesn't clash with Firestore auto-id if we didn't have one
    const finalItemData = { ...itemData, id: itemRef.id };

    let jackpotResult = { wonJackpot: false, winAmount: 0 };

    // We update stats directly
    try {
      await runTransaction(db, async (t) => {
        const userDoc = await t.get(userRef);
        if (!userDoc.exists()) throw new Error("No user");
        const data = userDoc.data();
        
        const cases = (await import('../lib/gameLogic')).CASES;
        const caseCost = costOverride !== undefined ? costOverride : (cases.find(c => c.id === caseId)?.cost || 0);
        
        if (data.credits < caseCost) {
            throw new Error("Not enough credits");
        }

        const EXCEEDINGLY_RARE_NAME = 'Exceedingly Rare';
        let wonJackpot = false;
        let finalJackpotWin = 0;

        const isHighTier = ['Classified', 'Covert', 'Exceedingly Rare'].includes(itemData.rarity);
        const currentPity = data.pityCounter || 0;
        const newPityCounter = isHighTier ? 0 : currentPity + 1;

        const statsRef = doc(db, 'stats', 'global');
        const statsSnap = await t.get(statsRef);
        let currentJackpot = statsSnap.exists() ? (statsSnap.data().jackpot || 0) : 5000;
        const contribution = caseCost * 0.02;
        let nextJackpot = currentJackpot + contribution;

        if (itemData.rarity === EXCEEDINGLY_RARE_NAME) {
           const roll = Math.random();
           if (roll < 0.05) { // 5% chance
              wonJackpot = true;
              finalJackpotWin = currentJackpot;
              nextJackpot = 5000; // Reset
           }
        }

        jackpotResult = { wonJackpot, winAmount: finalJackpotWin };

        const newCredits = data.credits - caseCost + finalJackpotWin;
        const newNetWorth = newCredits + itemData.value + get().inventory.reduce((acc, i) => acc + i.value, 0); // Not perfect (doesn't account for live inventory state in txn) but okay for this simple app

        t.update(userRef, {
          credits: newCredits,
          netWorth: newNetWorth,
          casesOpened: (data.casesOpened || 0) + 1,
          pityCounter: newPityCounter,
          updatedAt: serverTimestamp()
        });

        t.set(statsRef, {
          jackpot: nextJackpot,
          lastWinnerName: wonJackpot ? profile.displayName : (statsSnap.exists() ? statsSnap.data().lastWinnerName : null),
          updatedAt: serverTimestamp()
        }, { merge: true });

        t.set(itemRef, {
          ...finalItemData,
          acquiredAt: serverTimestamp()
        });
      });
      return jackpotResult;
    } catch (e) {
      console.error(e);
      throw e;
    }
  },

  sellItem: async (itemId: string, itemValue: number) => {
    const { user, profile, inventory } = get();
    if (!user) return false;

    if (isDevMode && profile) {
        const newInv = inventory.filter(i => i.id !== itemId);
        const newCredits = profile.credits + itemValue;
        const newNetWorth = newCredits + newInv.reduce((acc, i) => acc + i.value, 0);
        const newProfile = { ...profile, credits: newCredits, netWorth: newNetWorth };
        
        localStorage.setItem('dev-mock-profile', JSON.stringify(newProfile));
        localStorage.setItem('dev-mock-inventory', JSON.stringify(newInv));
        set({ profile: newProfile, inventory: newInv });
        return true;
    }

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

  upgradeItem: async (burnItem: Item, targetMultiplier: number, newItem: Item) => {
    const { user, profile, inventory } = get();
    if (!user || !profile) return false;

    // Roll probability
    const probability = (1 / targetMultiplier) * 0.90; // 10% house edge
    const isWin = Math.random() < probability;

    if (isDevMode) {
        // Destroy old item
        let newInv = inventory.filter(i => i.id !== burnItem.id);
        
        if (isWin) {
            newInv = [newItem, ...newInv];
        }

        // Adjust net worth
        // Re-calculate
        const newNetWorth = profile.credits + newInv.reduce((acc, i) => acc + i.value, 0);
        const newProfile = { ...profile, netWorth: newNetWorth };
        
        localStorage.setItem('dev-mock-profile', JSON.stringify(newProfile));
        localStorage.setItem('dev-mock-inventory', JSON.stringify(newInv));
        set({ profile: newProfile, inventory: newInv });
        return isWin;
    }

    const burnItemRef = doc(db, `users/${user.uid}/inventory`, burnItem.id!);
    const userRef = doc(db, 'users', user.uid);
    const newItemRef = doc(db, `users/${user.uid}/inventory`, newItem.id!);

    try {
      await runTransaction(db, async (t) => {
        const userDoc = await t.get(userRef);
        if (!userDoc.exists()) throw new Error("User docs not found");
        const data = userDoc.data();

        // Approximate net worth update
        let newNetWorth = data.netWorth - burnItem.value;
        if (isWin) newNetWorth += newItem.value;

        // Ensure safe updates
        t.update(userRef, {
            netWorth: newNetWorth,
            updatedAt: serverTimestamp()
        });

        // Delete burned item
        t.delete(burnItemRef);

        // Add new item if won
        if (isWin) {
            t.set(newItemRef, {
                ...newItem,
                acquiredAt: serverTimestamp()
            });
        }
      });
      return isWin;
    } catch(e) {
      console.error(e);
      return false;
    }
  },

  tradeUpItems: async (burnItems: Item[], newItem: Item) => {
    const { user, profile, inventory } = get();
    if (!user || !profile) return false;

    const burnIds = burnItems.map(i => i.id!);

    if (isDevMode) {
        // Destroy old items
        let newInv = inventory.filter(i => !burnIds.includes(i.id!));
        newInv = [newItem, ...newInv];

        // Re-calculate net worth
        const newNetWorth = profile.credits + newInv.reduce((acc, i) => acc + i.value, 0);
        const newProfile = { ...profile, netWorth: newNetWorth };
        
        localStorage.setItem('dev-mock-profile', JSON.stringify(newProfile));
        localStorage.setItem('dev-mock-inventory', JSON.stringify(newInv));
        set({ profile: newProfile, inventory: newInv });
        return true;
    }

    const burnItemRefs = burnIds.map(id => doc(db, `users/${user.uid}/inventory`, id));
    const userRef = doc(db, 'users', user.uid);
    const newItemRef = doc(db, `users/${user.uid}/inventory`, newItem.id!);

    try {
      await runTransaction(db, async (t) => {
        const userDoc = await t.get(userRef);
        if (!userDoc.exists()) throw new Error("User docs not found");
        const data = userDoc.data();

        // Calculate value subtracted
        const burnedValue = burnItems.reduce((acc, i) => acc + i.value, 0);

        // Approximate net worth update
        let newNetWorth = data.netWorth - burnedValue + newItem.value;

        // Ensure safe updates
        t.update(userRef, {
            netWorth: newNetWorth,
            updatedAt: serverTimestamp()
        });

        // Delete burned items
        for (const ref of burnItemRefs) {
            t.delete(ref);
        }

        // Add new item
        t.set(newItemRef, {
            ...newItem,
            acquiredAt: serverTimestamp()
        });
      });
      return true;
    } catch(e) {
      console.error(e);
      return false;
    }
  },

  executeBattle: async (totalCost: number, amountOpened: number, wonItems: Item[], newPity: number, wonBattle: boolean, cashPrize: number = 0) => {
    const { user, profile, inventory } = get();
    if (!user || !profile) return false;

    if (isDevMode) {
         if (profile.credits < totalCost) return false;
         const addedValue = wonItems.reduce((acc, i) => acc + i.value, 0);
         const newCredits = profile.credits - totalCost + cashPrize;
         const newNetWorth = newCredits + addedValue + get().inventory.reduce((acc, i) => acc + i.value, 0);
         const newProfile = { 
           ...profile, 
           credits: newCredits, 
           netWorth: newNetWorth, 
           casesOpened: (profile.casesOpened || 0) + amountOpened, 
           pityCounter: newPity,
           battleWins: (profile.battleWins || 0) + (wonBattle ? 1 : 0)
         };
         const newInv = [...wonItems, ...inventory];

         localStorage.setItem('dev-mock-profile', JSON.stringify(newProfile));
         localStorage.setItem('dev-mock-inventory', JSON.stringify(newInv));
         set({ profile: newProfile, inventory: newInv });
         return true;
    }

    const userRef = doc(db, 'users', user.uid);
    try {
        await runTransaction(db, async (t) => {
            const userDoc = await t.get(userRef);
            if (!userDoc.exists()) throw new Error("No user");
            const data = userDoc.data();
            if (data.credits < totalCost) throw new Error("Not enough credits");

            const addedValue = wonItems.reduce((acc, i) => acc + i.value, 0);
            const newCredits = data.credits - totalCost + cashPrize;
            const newNetWorth = newCredits + addedValue + get().inventory.reduce((acc, i) => acc + i.value, 0);

            t.update(userRef, {
                credits: newCredits,
                casesOpened: (data.casesOpened || 0) + amountOpened,
                battleWins: (data.battleWins || 0) + (wonBattle ? 1 : 0),
                netWorth: newNetWorth,
                pityCounter: newPity,
                updatedAt: serverTimestamp()
            });

            for (const item of wonItems) {
                const itemRef = doc(collection(db, `users/${user.uid}/inventory`));
                t.set(itemRef, {
                    ...item,
                    id: itemRef.id,
                    acquiredAt: serverTimestamp()
                });
            }
        });
        return true;
    } catch (e) {
        console.error("Execution failed", e);
        return false;
    }
  },

  fetchLeaderboard: async (sortBy: string = 'netWorth') => {
    if (isDevMode) {
       const { profile } = get();
       if (profile) set({ leaderboard: [profile] });
       return;
    }
    
    try {
      const q = query(collection(db, 'users'), orderBy(sortBy, 'desc'), limit(15));
      const snaps = await getDocs(q);
      const top: UserProfile[] = [];
      snaps.forEach(s => top.push(s.data() as UserProfile));
      set({ leaderboard: top });
    } catch (e) {
      console.error("Failed to fetch leaderboard", e);
    }
  },

  recordAdWatch: async () => {
    const { user, profile } = get();
    if (!user) return;
    
    if (isDevMode && profile) {
        const newProfile = { ...profile, lastAdWatchedAt: Date.now() };
        localStorage.setItem('dev-mock-profile', JSON.stringify(newProfile));
        set({ profile: newProfile });
        return;
    }

    const userRef = doc(db, 'users', user.uid);
    try {
      await setDoc(userRef, { lastAdWatchedAt: Date.now(), updatedAt: serverTimestamp() }, { merge: true });
    } catch (error) {
      console.error("Failed to record ad watch: ", error);
    }
  },

  purchaseRemoveAds: async () => {
    const { user, profile } = get();
    if (!user) return false;

    if (isDevMode && profile) {
        const newProfile = { ...profile, adsRemoved: true };
        localStorage.setItem('dev-mock-profile', JSON.stringify(newProfile));
        set({ profile: newProfile });
        return true;
    }

    const userRef = doc(db, 'users', user.uid);
    try {
      await setDoc(userRef, { adsRemoved: true, updatedAt: serverTimestamp() }, { merge: true });
      return true;
    } catch (error) {
      console.error("Failed to purchase remove ads: ", error);
      return false;
    }
  },

  addBotJackpotContribution: async (simulatedValue: number, isExceedinglyRare?: boolean) => {
    const { user } = get();
    if (!user) return;
    
    // If it's incredibly rare, deposit a much larger portion (e.g. 5%) into the jackpot
    // Otherwise, just a tiny fraction
    const contribution = isExceedinglyRare ? simulatedValue * 0.05 : simulatedValue * 0.0005;

    if (isDevMode) {
      const jackStr = localStorage.getItem('dev-mock-jackpot');
      let jackpotData = jackStr ? JSON.parse(jackStr) : { jackpot: 5000, lastWinnerName: null };
      jackpotData.jackpot += contribution;
      localStorage.setItem('dev-mock-jackpot', JSON.stringify(jackpotData));
      // update state without overwriting lastWinnerName
      set({ jackpot: jackpotData.jackpot });
      return;
    }

    try {
      const statsRef = doc(db, 'stats', 'global');
      await setDoc(statsRef, { 
        jackpot: increment(contribution),
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (error) {
       // silently fail for bot contributions
    }
  }

};
});
