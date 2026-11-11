import React, { useState } from 'react';
import { NearbyPerson, UserProfile, MeetupSpot, IcebreakerPrompt } from '../types';
import { generateIcebreakers } from '../utils/icebreakers';
import { soundFx } from '../utils/audio';
import {
  Sparkles,
  MapPin,
  Clock,
  Send,
  Shuffle,
  Coffee,
  Heart,
  Flame,
  MessageCircle,
  X,
  Compass,
} from 'lucide-react';

interface IcebreakerModalProps {
  person: NearbyPerson;
  user: UserProfile;
  nearbySpots: MeetupSpot[];
  isOpen: boolean;
  onClose: () => void;
  onSendIcebreaker: (question: string, category: string) => void;
  onProposeMeetup: (spot: MeetupSpot) => void;
}

export const IcebreakerModal: React.FC<IcebreakerModalProps> = ({
  person,
  user,
  nearbySpots,
  isOpen,
  onClose,
  onSendIcebreaker,
  onProposeMeetup,
}) => {
  if (!isOpen) return null;

  const [activeCategory, setActiveCategory] = useState<'all' | 'proximity' | 'shared_interest' | 'instant_meetup' | 'playful'>('all');
  const [selectedPrompt, setSelectedPrompt] = useState<IcebreakerPrompt | null>(null);
  const [customText, setCustomText] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [seed, setSeed] = useState<number>(0);

  // Generate icebreakers based on current context
  const allPrompts = generateIcebreakers(user, person, nearbySpots);

  // Common interests between the two
  const commonInterests = person.interests.filter(i =>
    user.interests.some(ui => ui.toLowerCase() === i.toLowerCase())
  );

  const filteredPrompts = allPrompts.filter(p => {
    if (activeCategory === 'all') return true;
    return p.category === activeCategory;
  });

  const handleSelectPrompt = (prompt: IcebreakerPrompt) => {
    soundFx.playRadarBlip();
    setSelectedPrompt(prompt);
    setCustomText(prompt.question);
    setIsEditing(false);
  };

  const handleSend = () => {
    soundFx.playPingSent();
    const textToSend = isEditing ? customText : (selectedPrompt?.question || allPrompts[0].question);
    const catToSend = selectedPrompt?.category || 'proximity';
    onSendIcebreaker(textToSend, catToSend);
    onClose();
  };

  const handleShuffle = () => {
    soundFx.playRadarBlip();
    setSeed(s => s + 1);
    setSelectedPrompt(null);
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Top Header / Match banner */}
        <div className="relative p-5 pb-4 bg-gradient-to-b from-rose-950/40 via-zinc-900 to-zinc-900 border-b border-zinc-800">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Mutual Proximity Banner */}
          <div className="flex items-center gap-2 text-xs font-semibold text-rose-400 uppercase tracking-wider mb-2">
            <Sparkles className="w-4 h-4" />
            <span>Instant Match & Proximity Connection</span>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="relative w-14 h-14 rounded-full overflow-hidden ring-2 ring-rose-500 shrink-0">
              {person.avatarUrl ? (
                <img src={person.avatarUrl} alt={person.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-rose-900 flex items-center justify-center text-lg font-bold text-white">
                  {person.name[0]}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
                <span>{person.name}, {person.age}</span>
              </h2>
              <div className="flex flex-wrap items-center gap-x-2 text-xs text-zinc-400 mt-0.5">
                <span className="flex items-center gap-1 text-rose-400 font-medium">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{person.distanceMiles} mi away</span>
                </span>
                <span aria-hidden="true">·</span>
                <span className="flex items-center gap-1 text-zinc-300">
                  <Clock className="w-3.5 h-3.5 text-zinc-500" />
                  <span>{person.distanceWalkingMin}m walk</span>
                </span>
                <span aria-hidden="true">·</span>
                <span>{person.neighborhood}</span>
              </div>
            </div>
          </div>

          {/* Shared compatibility points */}
          <div className="mt-3.5 pt-3 border-t border-zinc-800/80 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-400">
            <span className="text-zinc-500 font-medium">Common ground:</span>
            {commonInterests.length > 0 ? (
              commonInterests.map((interest, idx) => (
                <React.Fragment key={interest}>
                  <span className="text-rose-300 font-medium">{interest}</span>
                  {idx < commonInterests.length - 1 && <span aria-hidden="true">·</span>}
                </React.Fragment>
              ))
            ) : (
              <span>Both currently active in {person.neighborhood}</span>
            )}
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* Explanation Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-zinc-200">
                Choose an Icebreaker Question
              </h3>
              <p className="text-xs text-zinc-400">
                Skip "Hey". Start with an engaging question tailored to your distance & vibe.
              </p>
            </div>
            <button
              onClick={handleShuffle}
              className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 px-2.5 py-1.5 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>Shuffle</span>
            </button>
          </div>

          {/* Category Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {[
              { id: 'all', label: 'All Starters' },
              { id: 'proximity', label: '📍 Proximity' },
              { id: 'shared_interest', label: '🤝 Shared Passions' },
              { id: 'instant_meetup', label: '⚡ Instant Meetup' },
              { id: 'playful', label: '🎲 Playful' },
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id as any)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-zinc-100 text-zinc-950 font-semibold'
                    : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/80'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Icebreaker Cards List */}
          <div className="space-y-2.5">
            {filteredPrompts.map(prompt => {
              const isSelected = (selectedPrompt?.id === prompt.id) || (!selectedPrompt && prompt.id === filteredPrompts[0]?.id);

              return (
                <div
                  key={prompt.id + seed}
                  onClick={() => handleSelectPrompt(prompt)}
                  className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-rose-500/10 border-rose-500/60 shadow-sm ring-1 ring-rose-500/40'
                      : 'bg-zinc-800/50 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] mb-1.5">
                    <span className="font-semibold text-rose-400 flex items-center gap-1">
                      {prompt.category === 'proximity' && <Compass className="w-3 h-3" />}
                      {prompt.category === 'shared_interest' && <Heart className="w-3 h-3" />}
                      {prompt.category === 'instant_meetup' && <Flame className="w-3 h-3" />}
                      {prompt.category === 'playful' && <Sparkles className="w-3 h-3" />}
                      <span>{prompt.title}</span>
                    </span>
                    {prompt.contextTag && (
                      <span className="text-zinc-400 font-mono-numbers">{prompt.contextTag}</span>
                    )}
                  </div>

                  <p className="text-sm font-medium text-zinc-100 leading-relaxed">
                    "{prompt.question}"
                  </p>

                  {prompt.reason && (
                    <div className="mt-2 text-[10px] text-zinc-400 flex items-center gap-1">
                      <span>Reason:</span>
                      <span className="text-zinc-300">{prompt.reason}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Edit Customization Area */}
          <div className="pt-2">
            {!isEditing ? (
              <button
                onClick={() => {
                  if (!selectedPrompt) setSelectedPrompt(filteredPrompts[0]);
                  setIsEditing(true);
                }}
                className="text-xs text-zinc-400 hover:text-zinc-200 underline cursor-pointer"
              >
                Customize question or add your own twist...
              </button>
            ) : (
              <div className="space-y-2">
                <label className="text-xs text-zinc-400 font-medium">Customise your opening line:</label>
                <textarea
                  value={customText}
                  onChange={e => setCustomText(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 text-sm bg-zinc-950 border border-zinc-700 rounded-xl text-zinc-100 focus:outline-none focus:border-rose-500 resize-none"
                />
              </div>
            )}
          </div>

          {/* Instant Safe Meetup Fast Action */}
          {nearbySpots.length > 0 && (
            <div className="p-3 bg-zinc-950/70 border border-zinc-800 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                  <Coffee className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-zinc-200">
                    Skip texting? Meet halfway
                  </div>
                  <div className="text-[11px] text-zinc-400">
                    {nearbySpots[0].name} ({nearbySpots[0].walkTimeMin}m walk)
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  onProposeMeetup(nearbySpots[0]);
                  onClose();
                }}
                className="px-3 py-1.5 text-xs font-semibold text-amber-300 bg-amber-500/15 border border-amber-500/30 rounded-lg hover:bg-amber-500/25 transition-colors cursor-pointer"
              >
                Propose Spot
              </button>
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="p-4 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
          >
            Decide Later
          </button>

          <button
            onClick={handleSend}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-500 active:scale-[0.98] rounded-xl shadow-lg shadow-rose-600/20 transition-all cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Send Icebreaker & Open Chat</span>
          </button>
        </div>
      </div>
    </div>
  );
};
