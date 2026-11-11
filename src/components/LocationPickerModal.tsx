import React, { useState } from 'react';
import { UserProfile, DateIntent } from '../types';
import { PRESET_LOCATIONS, PresetLocation } from '../utils/geo';
import { soundFx } from '../utils/audio';
import {
  MapPin,
  Navigation,
  Check,
  X,
  Compass,
  Sparkles,
  Coffee,
  Zap,
} from 'lucide-react';

interface LocationPickerModalProps {
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onSelectPreset: (preset: PresetLocation) => void;
  onUseRealGps: () => void;
  onUpdateStatus: (status: string, craving: string, dateIntent: DateIntent) => void;
}

export const LocationPickerModal: React.FC<LocationPickerModalProps> = ({
  user,
  isOpen,
  onClose,
  onSelectPreset,
  onUseRealGps,
  onUpdateStatus,
}) => {
  if (!isOpen) return null;

  const [statusInput, setStatusInput] = useState<string>(user.rightNowStatus);
  const [cravingInput, setCravingInput] = useState<string>(user.currentCraving);
  const [intentInput, setIntentInput] = useState<DateIntent>(user.dateIntent || 'casual_date');
  const [isGpsLoading, setIsGpsLoading] = useState<boolean>(false);

  const handleGps = () => {
    setIsGpsLoading(true);
    soundFx.playRadarBlip();
    onUseRealGps();
    setTimeout(() => {
      setIsGpsLoading(false);
      onClose();
    }, 1200);
  };

  const handleSaveStatus = (e: React.FormEvent) => {
    e.preventDefault();
    soundFx.playPingSent();
    onUpdateStatus(statusInput, cravingInput, intentInput);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
              <Compass className="w-5 h-5 text-rose-500" />
              <span>Location & Availability</span>
            </h2>
            <p className="text-xs text-zinc-400">
              RADIUZ matches you with people physically within walking distance right now.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5 flex-1">
          {/* Live GPS Button */}
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-2">
              Real-Time GPS
            </label>
            <button
              onClick={handleGps}
              disabled={isGpsLoading}
              className="w-full flex items-center justify-between p-3.5 rounded-xl border border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/15 text-rose-300 font-medium text-xs transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Navigation className={`w-4 h-4 text-rose-400 ${isGpsLoading ? 'animate-spin' : ''}`} />
                <div className="text-left">
                  <div className="font-semibold text-white">Use My Current Real GPS Location</div>
                  <div className="text-[11px] text-zinc-400">Request browser HTML5 location for high-precision radar</div>
                </div>
              </div>
              <span className="text-xs font-semibold text-rose-400">&rarr;</span>
            </button>
          </div>

          {/* Preset Neighborhoods */}
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-2">
              Or Explore Neighborhoods
            </label>
            <div className="space-y-2">
              {PRESET_LOCATIONS.map(preset => {
                const isSelected = user.neighborhood.toLowerCase().includes(preset.neighborhood.toLowerCase());

                return (
                  <button
                    key={preset.id}
                    onClick={() => {
                      soundFx.playRadarBlip();
                      onSelectPreset(preset);
                      onClose();
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-zinc-800 border-rose-500/50 text-white ring-1 ring-rose-500/30'
                        : 'bg-zinc-950/60 border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <MapPin className="w-4 h-4 text-rose-400" />
                      <div>
                        <div className="text-xs font-semibold text-zinc-100">{preset.name}</div>
                        <div className="text-[11px] text-zinc-400">{preset.city}</div>
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-rose-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* "Right Now" Intent / Status Update */}
          <form onSubmit={handleSaveStatus} className="pt-2 border-t border-zinc-800 space-y-4">
            {/* Date Intent Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
                What are you looking for right now?
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playRadarBlip();
                    setIntentInput('casual_date');
                  }}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                    intentInput === 'casual_date'
                      ? 'bg-rose-500/15 border-rose-500 text-white ring-1 ring-rose-500/40 shadow-sm'
                      : 'bg-zinc-950/70 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                  }`}
                >
                  <Coffee className="w-4 h-4 mx-auto mb-1 text-amber-400" />
                  <div className="text-xs font-semibold text-zinc-100">Casual Date</div>
                  <div className="text-[10px] text-zinc-500 mt-0.5">Coffee or drinks</div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    soundFx.playRadarBlip();
                    setIntentInput('quickie');
                  }}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                    intentInput === 'quickie'
                      ? 'bg-rose-500/15 border-rose-500 text-white ring-1 ring-rose-500/40 shadow-sm'
                      : 'bg-zinc-950/70 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                  }`}
                >
                  <Zap className="w-4 h-4 mx-auto mb-1 text-rose-400" />
                  <div className="text-xs font-semibold text-zinc-100">Quickie</div>
                  <div className="text-[10px] text-zinc-500 mt-0.5">Fast linkup now</div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    soundFx.playRadarBlip();
                    setIntentInput('open_to_both');
                  }}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                    intentInput === 'open_to_both'
                      ? 'bg-rose-500/15 border-rose-500 text-white ring-1 ring-rose-500/40 shadow-sm'
                      : 'bg-zinc-950/70 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                  }`}
                >
                  <Sparkles className="w-4 h-4 mx-auto mb-1 text-purple-400" />
                  <div className="text-xs font-semibold text-zinc-100">Open to Either</div>
                  <div className="text-[10px] text-zinc-500 mt-0.5">See where it goes</div>
                </button>
              </div>
            </div>

            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
              Broadcast Your "Right Now" Vibe
            </label>

            <div className="space-y-1.5">
              <span className="text-xs text-zinc-400">What are you up to right this minute?</span>
              <input
                type="text"
                value={statusInput}
                onChange={e => setStatusInput(e.target.value)}
                placeholder="e.g. Coffee at Sey Roastery for 30 mins"
                className="w-full px-3.5 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="space-y-1.5">
              <span className="text-xs text-zinc-400">Current craving or drink of choice:</span>
              <input
                type="text"
                value={cravingInput}
                onChange={e => setCravingInput(e.target.value)}
                placeholder="e.g. Cortado or Iced Matcha"
                className="w-full px-3.5 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 focus:outline-none focus:border-rose-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 text-xs font-semibold text-white bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl transition-colors cursor-pointer"
            >
              Update Live Broadcast Status
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
