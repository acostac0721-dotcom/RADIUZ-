import React, { useState, useEffect } from 'react';
import { ProximityPing, NearbyPerson, MeetupSpot } from '../types';
import { soundFx } from '../utils/audio';
import {
  Clock,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  Share2,
  AlertTriangle,
  X,
  Coffee,
  Navigation,
  Car,
} from 'lucide-react';

interface ActiveMeetupTrackerProps {
  ping: ProximityPing;
  person: NearbyPerson;
  spot: MeetupSpot;
  isOpen: boolean;
  onClose: () => void;
  onCompleteMeetup: () => void;
  onCancelMeetup: () => void;
}

export const ActiveMeetupTracker: React.FC<ActiveMeetupTrackerProps> = ({
  ping,
  person,
  spot,
  isOpen,
  onClose,
  onCompleteMeetup,
  onCancelMeetup,
}) => {
  if (!isOpen) return null;

  // 20-minute countdown (1200 seconds)
  const [secondsRemaining, setSecondsRemaining] = useState<number>(1200);
  const [hasArrived, setHasArrived] = useState<boolean>(false);
  const [copiedShare, setCopiedShare] = useState<boolean>(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsRemaining(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const codeWord = ping.codeWord || 'Golden Honeycomb';

  const handleShareSafetyDetails = () => {
    soundFx.playRadarBlip();
    const shareText = `RADIUZ Safe Meetup: Meeting ${person.name} (${person.neighborhood}) at ${spot.name} (${spot.address}) in approx ${spot.walkTimeMin} mins. Verification code: "${codeWord}".`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Top Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-rose-950/60 to-zinc-900 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
              <span>Live Proximity Meetup</span>
              <span className="text-xs font-normal text-rose-400">En Route</span>
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-5">
          {/* Countdown & ETA Clock */}
          <div className="text-center py-4 bg-zinc-950/70 rounded-2xl border border-zinc-800 space-y-1">
            <div className="text-xs font-semibold text-rose-400 uppercase tracking-widest">
              Estimated Arrival Countdown
            </div>
            <div className="text-4xl sm:text-5xl font-mono-numbers font-bold text-zinc-100 tracking-tight">
              {formatTimer(secondsRemaining)}
            </div>
            <div className="text-xs text-zinc-400 flex items-center justify-center gap-1.5 pt-1">
              <Navigation className="w-3.5 h-3.5 text-rose-400" />
              <span>You: ~{spot.walkTimeMin}m walk · {person.name}: ~{person.distanceWalkingMin}m walk</span>
            </div>
          </div>

          {/* Venue Card */}
          <div className="p-4 bg-zinc-800/60 border border-zinc-700/80 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                  <Coffee className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-100">{spot.name}</h3>
                  <p className="text-xs text-zinc-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-zinc-500" />
                    <span>{spot.address}</span>
                  </p>
                </div>
              </div>
              <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 bg-emerald-950/50 border border-emerald-800/50 px-2 py-0.5 rounded">
                <ShieldCheck className="w-3 h-3" />
                <span>Verified Public Venue</span>
              </span>
            </div>
            <p className="text-xs text-zinc-300 pt-1 border-t border-zinc-700/50">
              {spot.vibe}
            </p>
          </div>

          {/* Identity Verification Code Word */}
          <div className="p-3.5 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-between">
            <div>
              <div className="text-xs text-zinc-400 font-medium">Safe Verification Code-Word</div>
              <div className="text-sm font-bold text-amber-300 font-mono tracking-wider">
                "{codeWord}"
              </div>
              <div className="text-[11px] text-zinc-500">
                Mention this when meeting to confirm each other safely
              </div>
            </div>
            <div className="text-2xl">🤝</div>
          </div>

          {/* Active Covered Expense Charge if any */}
          {ping.expenseCharge && (
            <div className="p-3 bg-zinc-950/70 border border-zinc-800 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Car className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-zinc-200">{ping.expenseCharge.title}</div>
                  <div className="text-[10px] text-zinc-400 font-mono-numbers">Covered: ${ping.expenseCharge.amount.toFixed(2)}</div>
                </div>
              </div>
              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded">
                Covered & Dispatched ✓
              </span>
            </div>
          )}

          {/* Safety Actions */}
          <div className="space-y-2">
            <button
              onClick={handleShareSafetyDetails}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-zinc-200 bg-zinc-800 hover:bg-zinc-700 rounded-xl border border-zinc-700 transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-rose-400" />
              <span>{copiedShare ? 'Copied Meetup Details to Clipboard!' : 'Share Meetup Info with a Trusted Friend'}</span>
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between gap-3">
          <button
            onClick={onCancelMeetup}
            className="px-3.5 py-2 text-xs font-medium text-zinc-400 hover:text-red-400 transition-colors cursor-pointer"
          >
            Cancel Meetup
          </button>

          {!hasArrived ? (
            <button
              onClick={() => {
                soundFx.playMatchChime();
                setHasArrived(true);
              }}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-lg transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>I've Arrived at the Spot</span>
            </button>
          ) : (
            <button
              onClick={onCompleteMeetup}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-lg transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Met Up Successfully!</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
