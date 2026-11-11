import React, { useState } from 'react';
import { MeetupSpot, NearbyPerson } from '../types';
import { soundFx } from '../utils/audio';
import {
  Coffee,
  Wine,
  Trees,
  BookOpen,
  MapPin,
  Clock,
  ShieldCheck,
  Send,
  X,
  Compass,
} from 'lucide-react';

interface MeetupSpotPickerModalProps {
  person: NearbyPerson | null;
  spots: MeetupSpot[];
  isOpen: boolean;
  onClose: () => void;
  onConfirmProposal: (spot: MeetupSpot, customTime: string, note: string) => void;
}

export const MeetupSpotPickerModal: React.FC<MeetupSpotPickerModalProps> = ({
  person,
  spots,
  isOpen,
  onClose,
  onConfirmProposal,
}) => {
  if (!isOpen || !person) return null;

  const [selectedSpot, setSelectedSpot] = useState<MeetupSpot>(spots[0] || null);
  const [meetupTime, setMeetupTime] = useState<string>('In 20 mins');
  const [note, setNote] = useState<string>('');

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'cafe':
        return <Coffee className="w-4 h-4 text-amber-400" />;
      case 'bar':
        return <Wine className="w-4 h-4 text-rose-400" />;
      case 'park':
        return <Trees className="w-4 h-4 text-emerald-400" />;
      case 'bookstore':
        return <BookOpen className="w-4 h-4 text-blue-400" />;
      default:
        return <Compass className="w-4 h-4 text-zinc-400" />;
    }
  };

  const handleSend = () => {
    soundFx.playPingSent();
    onConfirmProposal(selectedSpot, meetupTime, note);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-rose-400 font-semibold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Verified Public Meetup Spot</span>
            </div>
            <h2 className="text-lg font-bold text-zinc-100">
              Propose Meetup with {person.name}
            </h2>
            <p className="text-xs text-zinc-400">
              Pick a public halfway spot within walking distance right now.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Spot Selection Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
            Select Halfway Spot ({person.distanceWalkingMin}m mutual radius)
          </label>

          <div className="space-y-2.5">
            {spots.map(spot => {
              const isSelected = selectedSpot?.id === spot.id;

              return (
                <div
                  key={spot.id}
                  onClick={() => {
                    soundFx.playRadarBlip();
                    setSelectedSpot(spot);
                  }}
                  className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-rose-500/10 border-rose-500/70 shadow-sm ring-1 ring-rose-500/40'
                      : 'bg-zinc-800/60 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0">
                        {getCategoryIcon(spot.category)}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                          <span>{spot.name}</span>
                          {spot.isSafetyVerified && (
                            <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-0.5">
                              <ShieldCheck className="w-3 h-3" />
                              <span>Safe</span>
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-zinc-400 flex items-center gap-1.5 mt-0.5">
                          <MapPin className="w-3 h-3 text-zinc-500" />
                          <span>{spot.address}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-bold text-rose-400 font-mono-numbers">
                        ~{spot.walkTimeMin}m walk
                      </div>
                      <div className="text-[10px] text-zinc-400">
                        {spot.distanceMiles} mi away
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-300 mt-2.5 pt-2 border-t border-zinc-800/80">
                    {spot.vibe}
                  </p>

                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    {spot.features.map(f => (
                      <span key={f} className="text-[10px] text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700/60">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Timing Selector */}
          <div className="space-y-2 pt-2">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
              When should we meet?
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['In 15 mins', 'In 30 mins', 'In 45 mins'].map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setMeetupTime(t)}
                  className={`py-2 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                    meetupTime === t
                      ? 'bg-rose-500 text-white border-rose-500 shadow-sm'
                      : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Note */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
              Quick note (optional):
            </label>
            <input
              type="text"
              placeholder="e.g. Grabbing a cortado, wearing a grey jacket!"
              value={note}
              onChange={e => setNote(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-rose-500"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-zinc-950 border-t border-zinc-800 flex items-center gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={!selectedSpot}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-lg shadow-rose-600/20 transition-all cursor-pointer disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send 20-Min Meetup Proposal</span>
          </button>
        </div>
      </div>
    </div>
  );
};
