import { User } from 'firebase/auth';

export interface Preferences {
  fastOpen: boolean;
  streamerMode: boolean;
  sound: boolean;
  currency: 'USD' | 'CR';
}

export interface UserProfile {
  userId: string;
  displayName: string;
  photoURL: string;
  credits: number;
  netWorth: number;
  casesOpened: number;
  battleWins?: number;
  pityCounter?: number;
  lastAdWatchedAt?: number;
  adsRemoved?: boolean;
  updatedAt?: any;
  createdAt?: any;
}

export type ShinyType = 'None' | 'Shiny' | 'Glimmering' | 'Radiant' | 'Rainbow' | 'Prismatic' | 'Celestial' | 'Dark Matter' | 'Dev';

export interface Item {
  id: string;
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
  shinyType?: ShinyType;
}
