export interface Coordinates {
  lat: number;
  lng: number;
}

export type DateIntent = 'casual_date' | 'quickie' | 'open_to_both';

export interface UserProfile {
  id: string;
  name: string;
  age: number;
  avatarUrl: string;
  neighborhood: string;
  city: string;
  occupation: string;
  coords: Coordinates;
  rightNowStatus: string;
  currentCraving: string;
  activeMinutesAgo: number;
  isGhostMode: boolean;
  privacyFuzzing: boolean; // true = fuzzy approx distance, false = exact
  interests: string[];
  dateIntent: DateIntent;
}

export interface NearbyPerson {
  id: string;
  name: string;
  age: number;
  avatarUrl: string;
  photos: string[];
  occupation: string;
  bio: string;
  neighborhood: string;
  distanceMiles: number;
  distanceWalkingMin: number;
  bearingDeg: number; // 0 to 360 for radar plot
  coords: Coordinates;
  rightNowStatus: string;
  currentCraving: string;
  activeMinutesAgo: number;
  verifiedHere: boolean;
  interests: string[];
  prompts: {
    question: string;
    answer: string;
  }[];
  favoriteSpot: string;
  dateIntent: DateIntent;
}

export interface MeetupSpot {
  id: string;
  name: string;
  category: 'cafe' | 'bar' | 'park' | 'gallery' | 'bookstore';
  address: string;
  distanceMiles: number;
  walkTimeMin: number;
  vibe: string;
  features: string[];
  isSafetyVerified: boolean;
  coords: Coordinates;
}

export interface IcebreakerPrompt {
  id: string;
  category: 'proximity' | 'shared_interest' | 'playful' | 'instant_meetup';
  title: string;
  question: string;
  contextTag?: string;
  reason?: string;
}

export interface MatchRecord {
  id: string;
  person: NearbyPerson;
  matchedAt: string;
  sharedInterests: string[];
  distanceAtMatchMiles: number;
  lastMessage?: string;
  unreadCount?: number;
}

export interface MeetupExpenseCharge {
  id: string;
  type: 'lyft_ride' | 'food_delivery' | 'coffee_tab' | 'drinks_round';
  title: string;
  amount: number;
  currency: string;
  note: string;
  status: 'pending' | 'accepted' | 'declined';
  requesterId: string;
  requesterName: string;
  payerId: string;
}

export interface ProximityPing {
  id: string;
  senderId: string;
  receiverId: string;
  receiverName: string;
  receiverAvatar: string;
  spot: MeetupSpot;
  meetupTime: string; // e.g. "In 20 mins"
  customNote?: string;
  status: 'pending' | 'accepted' | 'declined' | 'completed';
  createdAt: number;
  expiresInSeconds: number;
  codeWord?: string;
  expenseCharge?: MeetupExpenseCharge;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  isIcebreaker?: boolean;
  icebreakerCategory?: string;
  isLocationShare?: boolean;
  locationDetails?: string;
  isMeetupInvite?: boolean;
  spotDetails?: MeetupSpot;
  expenseCharge?: MeetupExpenseCharge;
}

