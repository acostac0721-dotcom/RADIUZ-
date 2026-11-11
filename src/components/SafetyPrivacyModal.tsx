import React from 'react';
import { UserProfile } from '../types';
import {
  ShieldCheck,
  EyeOff,
  Radio,
  Sliders,
  CheckCircle2,
  X,
  Lock,
} from 'lucide-react';
import { soundFx } from '../utils/audio';

interface SafetyPrivacyModalProps {
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onToggleGhostMode: () => void;
  onTogglePrivacyFuzzing: () => void;
}

export const SafetyPrivacyModal: React.FC<SafetyPrivacyModalProps> = ({
  user,
  isOpen,
  onClose,
  onToggleGhostMode,
  onTogglePrivacyFuzzing,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-100">
                Safety & Proximity Privacy
              </h2>
              <p className="text-xs text-zinc-400">
                You control how and when your location is shared.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5 flex-1">
          {/* Privacy Toggles */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Location Controls
            </h3>

            {/* Ghost Mode Toggle */}
            <div className="p-3.5 bg-zinc-950/70 border border-zinc-800 rounded-xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${user.isGhostMode ? 'bg-amber-500/10 text-amber-400' : 'bg-zinc-800 text-zinc-400'}`}>
                  <EyeOff className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-zinc-100">Ghost Mode (Incognito)</div>
                  <div className="text-[11px] text-zinc-400">
                    Disables your radar blip. You can browse nearby, but nobody sees you.
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  soundFx.playRadarBlip();
                  onToggleGhostMode();
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  user.isGhostMode
                    ? 'bg-amber-500 text-zinc-950'
                    : 'bg-zinc-800 text-zinc-300 hover:text-white'
                }`}
              >
                {user.isGhostMode ? 'Enabled' : 'Off'}
              </button>
            </div>

            {/* Distance Fuzzing Toggle */}
            <div className="p-3.5 bg-zinc-950/70 border border-zinc-800 rounded-xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${user.privacyFuzzing ? 'bg-rose-500/10 text-rose-400' : 'bg-zinc-800 text-zinc-400'}`}>
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-zinc-100">Distance Fuzzing (~0.5 mi buffer)</div>
                  <div className="text-[11px] text-zinc-400">
                    Never shows your exact building; rounds distance to the nearest neighborhood zone.
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  soundFx.playRadarBlip();
                  onTogglePrivacyFuzzing();
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  user.privacyFuzzing
                    ? 'bg-rose-500 text-white'
                    : 'bg-zinc-800 text-zinc-300 hover:text-white'
                }`}
              >
                {user.privacyFuzzing ? 'Fuzzy' : 'Exact'}
              </button>
            </div>
          </div>

          {/* Safety Protocols */}
          <div className="space-y-3 pt-2 border-t border-zinc-800">
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              RADIUZ Instant Meetup Safeguards
            </h3>

            <div className="space-y-2.5 text-xs text-zinc-300">
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-zinc-800/40 border border-zinc-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">100% Public Venues Only</strong>
                  All suggested meetup spots are vetted cafes, bookstores, parks, or open venues with staff and foot traffic.
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-zinc-800/40 border border-zinc-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Identity Verification Code-Word</strong>
                  Both daters receive an identical secret code word (e.g. "Golden Honeycomb") to verify each other on arrival.
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-zinc-800/40 border border-zinc-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Low-Pressure 15-Minute Protocol</strong>
                  Our design encourages quick, zero-obligation check-ins. If either dater needs to leave, there is zero expectation to stay.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-zinc-950 border-t border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-white bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
