import React from 'react';
import { NearbyPerson, UserProfile, MeetupSpot } from '../types';
import { calculateSmartMatchScore } from '../utils/matchScore';
import {
  MapPin,
  Clock,
  Sparkles,
  Coffee,
  X,
  MessageCircle,
  Flame,
  ShieldCheck,
  Compass,
  CheckCircle2,
  Zap,
  Car,
} from 'lucide-react';
import { soundFx } from '../utils/audio';

interface DaterProfileModalProps {
  person: NearbyPerson | null;
  user: UserProfile;
  nearbySpots: MeetupSpot[];
  isOpen: boolean;
  onClose: () => void;
  onOpenIcebreakers: (person: NearbyPerson) => void;
  onProposeMeetup: (person: NearbyPerson, spot: MeetupSpot) => void;
  onRequestExpense?: (person: NearbyPerson) => void;
}

export const DaterProfileModal: React.FC<DaterProfileModalProps> = ({
  person,
  user,
  nearbySpots,
  isOpen,
  onClose,
  onOpenIcebreakers,
  onProposeMeetup,
  onRequestExpense,
}) => {
  if (!isOpen || !person) return null;

  const matchScore = calculateSmartMatchScore(user, person);
  const commonInterests = matchScore.sharedInterests;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-zinc-950/70 hover:bg-zinc-900 text-zinc-300 hover:text-white flex items-center justify-center backdrop-blur-md border border-zinc-700/60 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1">
          {/* Main Hero Photo Container with Fallback */}
          <div className="relative aspect-[4/3] w-full bg-zinc-800">
            {person.avatarUrl ? (
              <img
                src={person.avatarUrl}
                alt={person.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-tr from-rose-950 via-zinc-900 to-zinc-800 flex items-center justify-center">
                <span className="text-6xl font-bold text-rose-500/40">{person.name[0]}</span>
              </div>
            )}

            {/* Gradient Scrim for Legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-black/30" />

            {/* Verified Distance Overlay */}
            <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-xs text-rose-300 font-semibold uppercase tracking-wider mb-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Verified In Neighborhood</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  {person.name}, <span className="font-normal text-zinc-300">{person.age}</span>
                </h1>
                <p className="text-xs text-zinc-300">{person.occupation}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  {person.dateIntent === 'quickie' ? (
                    <span className="text-[11px] font-semibold text-amber-300 flex items-center gap-1 bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded">
                      <Zap className="w-3 h-3 text-amber-400" />
                      <span>Seeking: Quickie / Quick Linkup</span>
                    </span>
                  ) : person.dateIntent === 'casual_date' ? (
                    <span className="text-[11px] font-semibold text-rose-300 flex items-center gap-1 bg-rose-950/60 border border-rose-500/30 px-2 py-0.5 rounded">
                      <Coffee className="w-3 h-3 text-rose-400" />
                      <span>Seeking: Casual Date</span>
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold text-purple-300 flex items-center gap-1 bg-purple-950/60 border border-purple-500/30 px-2 py-0.5 rounded">
                      <Sparkles className="w-3 h-3 text-purple-400" />
                      <span>Seeking: Open to Either</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="bg-zinc-950/90 border border-zinc-700/80 rounded-xl px-3 py-1.5 backdrop-blur-md text-right">
                <div className="text-xs font-bold text-rose-400 font-mono-numbers">
                  {person.distanceMiles} mi
                </div>
                <div className="text-[10px] text-zinc-400">
                  {person.distanceWalkingMin} min walk
                </div>
              </div>
            </div>
          </div>

          <div className="p-5 space-y-5">
            {/* Smart Match Score Card */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-zinc-900 to-rose-950/30 border border-rose-500/30 space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-rose-400 uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Smart Match Compatibility</span>
                  </div>
                  <div className="text-xs text-zinc-400 mt-0.5">
                    {matchScore.matchTier} Compatibility based on proximity & shared passions
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-bold text-white font-mono-numbers tracking-tight">
                    {matchScore.totalScore}%
                  </div>
                  <div className="text-[10px] text-rose-300 font-medium">
                    Overall Match
                  </div>
                </div>
              </div>

              {/* Visual Multi-Segment Progress Bar */}
              <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden flex">
                <div
                  style={{ width: `${(matchScore.interestScore / 100) * 100}%` }}
                  className="bg-rose-500 h-full"
                  title="Shared Interests factor"
                />
                <div
                  style={{ width: `${(matchScore.proximityScore / 100) * 100}%` }}
                  className="bg-amber-400 h-full"
                  title="Proximity factor"
                />
                <div
                  style={{ width: `${(matchScore.freshnessScore / 100) * 100}%` }}
                  className="bg-emerald-400 h-full"
                  title="Active freshness factor"
                />
              </div>

              {/* Factors Breakdown */}
              <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                <div className="p-2 rounded-lg bg-zinc-950/60 border border-zinc-800">
                  <div className="text-[10px] text-zinc-400">Passions</div>
                  <div className="text-xs font-bold text-rose-400 font-mono-numbers">
                    +{matchScore.interestScore}%
                  </div>
                  <div className="text-[9px] text-zinc-500 truncate">
                    {matchScore.sharedInterests.length} shared
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-zinc-950/60 border border-zinc-800">
                  <div className="text-[10px] text-zinc-400">Walking Dist</div>
                  <div className="text-xs font-bold text-amber-400 font-mono-numbers">
                    +{matchScore.proximityScore}%
                  </div>
                  <div className="text-[9px] text-zinc-500 truncate">
                    {person.distanceWalkingMin}m walk
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-zinc-950/60 border border-zinc-800">
                  <div className="text-[10px] text-zinc-400">Right Now</div>
                  <div className="text-xs font-bold text-emerald-400 font-mono-numbers">
                    +{matchScore.freshnessScore}%
                  </div>
                  <div className="text-[9px] text-zinc-500 truncate">
                    Active {person.activeMinutesAgo}m ago
                  </div>
                </div>
              </div>
            </div>

            {/* Real-Time "Right Now" Intent Box */}
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-rose-400 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5" />
                  <span>Active Right Now</span>
                </span>
                <span className="text-[11px] text-zinc-400">Updated {person.activeMinutesAgo}m ago</span>
              </div>
              <p className="text-sm font-medium text-zinc-100">
                "{person.rightNowStatus}"
              </p>
              {person.currentCraving && (
                <div className="text-xs text-zinc-400 pt-1">
                  Craving: <span className="text-zinc-200">{person.currentCraving}</span>
                </div>
              )}
            </div>

            {/* Neighborhood & Proximity Info */}
            <div className="flex items-center justify-between py-2 border-y border-zinc-800 text-xs text-zinc-400">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-rose-400" />
                <span className="text-zinc-200 font-medium">{person.neighborhood}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Coffee className="w-4 h-4 text-amber-400" />
                <span>Loves: <span className="text-zinc-200">{person.favoriteSpot}</span></span>
              </div>
            </div>

            {/* Bio */}
            <div>
              <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                About
              </h3>
              <p className="text-sm text-zinc-200 leading-relaxed">
                {person.bio}
              </p>
            </div>

            {/* Passions & Shared Common Ground */}
            <div>
              <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Passions & Vibes</span>
                {commonInterests.length > 0 && (
                  <span className="text-rose-400 text-[11px] font-normal normal-case">
                    {commonInterests.length} shared in common
                  </span>
                )}
              </h3>
              <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-300">
                {person.interests.map(interest => {
                  const isShared = user.interests.includes(interest);
                  return (
                    <span
                      key={interest}
                      className={`px-2.5 py-1 rounded-lg border text-xs ${
                        isShared
                          ? 'bg-rose-500/15 border-rose-500/40 text-rose-300 font-medium'
                          : 'bg-zinc-800 border-zinc-700/60 text-zinc-300'
                      }`}
                    >
                      {interest} {isShared && '★'}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Profile Prompts */}
            {person.prompts.map((prompt, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-zinc-800/60 border border-zinc-800 space-y-1">
                <div className="text-xs font-medium text-rose-400">
                  {prompt.question}
                </div>
                <div className="text-sm text-zinc-100">
                  {prompt.answer}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Action Bar */}
        <div className="p-4 bg-zinc-950 border-t border-zinc-800 flex flex-col sm:flex-row items-center gap-2.5">
          <button
            onClick={() => {
              soundFx.playMatchChime();
              onOpenIcebreakers(person);
            }}
            className="w-full sm:flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-semibold text-zinc-100 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-rose-400" />
            <span>Break Ice ({person.distanceWalkingMin}m)</span>
          </button>

          {onRequestExpense && (
            <button
              onClick={() => {
                soundFx.playRadarBlip();
                onRequestExpense(person);
              }}
              title="Request a Lyft ride or food delivery from them"
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-semibold text-amber-300 bg-amber-500/15 border border-amber-500/30 hover:bg-amber-500/25 rounded-xl transition-all cursor-pointer whitespace-nowrap"
            >
              <Car className="w-3.5 h-3.5" />
              <span>Request Ride ($)</span>
            </button>
          )}

          <button
            onClick={() => {
              soundFx.playPingSent();
              const spot = nearbySpots[0];
              if (spot) onProposeMeetup(person, spot);
            }}
            className="w-full sm:flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-lg shadow-rose-600/25 transition-all cursor-pointer"
          >
            <Coffee className="w-3.5 h-3.5" />
            <span>Instant Meetup</span>
          </button>
        </div>
      </div>
    </div>
  );
};
