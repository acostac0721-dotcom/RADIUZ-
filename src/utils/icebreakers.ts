import { IcebreakerPrompt, NearbyPerson, MeetupSpot, UserProfile } from '../types';

/**
 * Dynamically generates tailored icebreaker questions based on:
 * - Real-time proximity & walking distance
 * - Shared interests and hobbies
 * - Current "right now" cravings & local spots
 */
export function generateIcebreakers(
  user: UserProfile,
  person: NearbyPerson,
  nearbySpots: MeetupSpot[]
): IcebreakerPrompt[] {
  const prompts: IcebreakerPrompt[] = [];

  // 1. Proximity & Neighborhood Starters
  const walkMinutes = person.distanceWalkingMin;
  const closestSpot = nearbySpots[0];

  if (walkMinutes <= 10) {
    prompts.push({
      id: `prox-1-${person.id}`,
      category: 'proximity',
      title: 'Walking Distance Spark',
      question: `We're literally an ${walkMinutes}-minute walk apart right now. If we meet halfway at ${closestSpot ? closestSpot.name : 'a cozy spot'}, what are you ordering?`,
      contextTag: `${person.distanceMiles} mi away · ${walkMinutes} min walk`,
      reason: 'Based on your immediate walking proximity',
    });
  } else {
    prompts.push({
      id: `prox-dist-${person.id}`,
      category: 'proximity',
      title: 'Neighborhood Local Test',
      question: `Since you're also hanging out around ${person.neighborhood}, what's your undisputed #1 favorite neighborhood spot?`,
      contextTag: `In ${person.neighborhood}`,
      reason: 'Based on shared neighborhood presence',
    });
  }

  prompts.push({
    id: `prox-vibe-${person.id}`,
    category: 'proximity',
    title: 'Spontaneous Meetup Dilemma',
    question: `Real-time check: Are you more of a "grab a quick 20-minute espresso" or "sit outside with drinks until sunset" person today?`,
    contextTag: 'Spontaneous Vibe',
    reason: 'Instant meetup compatibility',
  });

  // 2. Shared Interest Starters
  const commonInterests = person.interests.filter(interest =>
    user.interests.some(ui => ui.toLowerCase() === interest.toLowerCase())
  );

  const interestToQuestionMap: Record<string, string> = {
    'Specialty Coffee': `I see you love specialty coffee too! Single-origin pour-over or a creamy cortado?`,
    'Bouldering': `Fellow boulderer spotted! What's your current grade nemesis, or do you have a favorite local gym around here?`,
    'Indie Cinema': `A24 marathon or obscure foreign cinema? What was the last film that genuinely blew your mind?`,
    'Vinyl Records': `If I checked your turntable or Spotify queue right this second, what artist would be on repeat?`,
    'Art & Galleries': `Saw your photo at the gallery! What kind of exhibitions usually grab your attention most?`,
    'Live Jazz & Bars': `Cocktail of choice for a dim speakeasy corner: classic Negroni, spicy mezcal, or herbal gin?`,
    'Dogs & Parks': `Crucial compatibility question: Big goofy golden retriever energy or chill little park dog vibe?`,
    'Street Photography': `What's the best street corner in this city for people watching and candid lighting?`,
    'Architecture': `What building in this neighborhood do you always stop and admire when you walk past?`,
    'Books & Literature': `What book are you currently carrying around in your bag or reading on your commute?`,
  };

  if (commonInterests.length > 0) {
    const primaryInterest = commonInterests[0];
    const tailoredQuestion =
      interestToQuestionMap[primaryInterest] ||
      `We both share a passion for ${primaryInterest}! How did you first get into it?`;

    prompts.push({
      id: `interest-shared-${person.id}`,
      category: 'shared_interest',
      title: `Shared: ${primaryInterest}`,
      question: tailoredQuestion,
      contextTag: `Mutual Interest: ${primaryInterest}`,
      reason: `You and ${person.name} both love ${primaryInterest}`,
    });

    if (commonInterests.length > 1) {
      const secondaryInterest = commonInterests[1];
      prompts.push({
        id: `interest-sec-${person.id}`,
        category: 'shared_interest',
        title: `Shared: ${secondaryInterest}`,
        question:
          interestToQuestionMap[secondaryInterest] ||
          `Since we're both into ${secondaryInterest}, what's your ultimate insider recommendation nearby?`,
        contextTag: `Mutual Interest: ${secondaryInterest}`,
        reason: `Both into ${secondaryInterest}`,
      });
    }
  } else {
    // If no exact match, pick from their profile prompts or passions
    const fallbackInterest = person.interests[0];
    prompts.push({
      id: `interest-theirs-${person.id}`,
      category: 'shared_interest',
      title: `${fallbackInterest} Inquiry`,
      question:
        interestToQuestionMap[fallbackInterest] ||
        `I noticed you're passionate about ${fallbackInterest}! Teach me your favorite thing about it?`,
      contextTag: `Interest: ${fallbackInterest}`,
      reason: `Featured on ${person.name}'s profile`,
    });
  }

  // 3. Right Now Status / Craving Starters
  if (person.rightNowStatus) {
    prompts.push({
      id: `status-craving-${person.id}`,
      category: 'instant_meetup',
      title: 'Current Craving Vibe Check',
      question: `Your status says "${person.rightNowStatus}" — did you already find it, or do you need an accomplice to track it down?`,
      contextTag: `Right Now: ${person.rightNowStatus}`,
      reason: `Responding to their live status update`,
    });
  }

  // 4. Playful Icebreakers
  prompts.push({
    id: `playful-rapid-${person.id}`,
    category: 'playful',
    title: 'Rapid Two Truths & A Lie',
    question: `Two truths and a lie about our afternoon in ${person.neighborhood}. You go first or should I?`,
    contextTag: 'Playful Game',
    reason: 'Zero awkward small-talk guarantee',
  });

  prompts.push({
    id: `playful-meetup-${person.id}`,
    category: 'instant_meetup',
    title: 'The 15-Minute Rule Challenge',
    question: `Proposition: A strictly low-stakes 15-minute coffee at ${closestSpot?.name || 'a nearby bench'}. If the vibe is immaculate we stay; if not, no hard feelings! Deal?`,
    contextTag: 'Instant Meetup Challenge',
    reason: 'Designed for fast, zero-pressure meetups',
  });

  return prompts;
}
