import { NearbyPerson, UserProfile } from '../types';

export interface MatchScoreBreakdown {
  totalScore: number;
  interestScore: number; // Max 55
  proximityScore: number; // Max 35
  freshnessScore: number; // Max 10
  sharedInterests: string[];
  matchTier: 'Exceptional' | 'High' | 'Good';
  proximitySummary: string;
}

/**
 * Calculates a real-time Smart Match Score (percentage 0-100%) between
 * the current user and a nearby dater based on:
 * 1. Shared passions & common interests (up to 55%)
 * 2. Immediate physical walking proximity (up to 35%)
 * 3. Real-time availability & freshness (up to 10%)
 */
export function calculateSmartMatchScore(
  user: UserProfile,
  person: NearbyPerson
): MatchScoreBreakdown {
  // 1. Shared Interests Match (55% max)
  const sharedInterests = person.interests.filter(i =>
    user.interests.some(ui => ui.toLowerCase() === i.toLowerCase())
  );

  let interestScore = 0;
  if (sharedInterests.length >= 3) {
    interestScore = 55;
  } else if (sharedInterests.length === 2) {
    interestScore = 44;
  } else if (sharedInterests.length === 1) {
    interestScore = 32;
  } else {
    // Discovery base potential
    interestScore = 18;
  }

  // 2. Physical Proximity Weight (35% max)
  let proximityScore = 0;
  let proximitySummary = '';

  if (person.distanceMiles <= 0.4) {
    proximityScore = 35;
    proximitySummary = 'Instant walking distance (< 8 min walk)';
  } else if (person.distanceMiles <= 0.8) {
    proximityScore = 30;
    proximitySummary = 'Neighborhood stroll (< 15 min walk)';
  } else if (person.distanceMiles <= 1.5) {
    proximityScore = 24;
    proximitySummary = 'Short bike or quick walk (< 25 min)';
  } else if (person.distanceMiles <= 3.0) {
    proximityScore = 16;
    proximitySummary = 'Same district (< 3 miles)';
  } else {
    proximityScore = 8;
    proximitySummary = 'Within wider radius (< 5 miles)';
  }

  // 3. Real-Time Availability & Freshness (10% max)
  let freshnessScore = 0;
  if (person.activeMinutesAgo <= 5) {
    freshnessScore = 10;
  } else if (person.activeMinutesAgo <= 15) {
    freshnessScore = 8;
  } else if (person.activeMinutesAgo <= 30) {
    freshnessScore = 5;
  } else {
    freshnessScore = 2;
  }

  const rawTotal = interestScore + proximityScore + freshnessScore;
  const totalScore = Math.min(99, Math.max(52, rawTotal));

  let matchTier: 'Exceptional' | 'High' | 'Good' = 'Good';
  if (totalScore >= 88) {
    matchTier = 'Exceptional';
  } else if (totalScore >= 75) {
    matchTier = 'High';
  }

  return {
    totalScore,
    interestScore,
    proximityScore,
    freshnessScore,
    sharedInterests,
    matchTier,
    proximitySummary,
  };
}
