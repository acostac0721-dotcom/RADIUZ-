import React, { useState } from 'react';
import { NearbyPerson, UserProfile } from '../types';
import { soundFx } from '../utils/audio';
import { calculateSmartMatchScore } from '../utils/matchScore';
import { MapPin, Navigation, EyeOff, Radio, Shield, Sparkles } from 'lucide-react';

interface RadarViewProps {
  user: UserProfile;
  nearbyPeople: NearbyPerson[];
  maxRadiusMiles: number;
  onMaxRadiusChange: (radius: number) => void;
  onSelectPerson: (person: NearbyPerson) => void;
  onOpenMatchIcebreaker: (person: NearbyPerson) => void;
  onToggleGhostMode: () => void;
  onOpenLocationPicker: () => void;
}

export const RadarView: React.FC<RadarViewProps> = ({
  user,
  nearbyPeople,
  maxRadiusMiles,
  onMaxRadiusChange,
  onSelectPerson,
  onOpenMatchIcebreaker,
  onToggleGhostMode,
  onOpenLocationPicker,
}) => {
  const [hoveredPerson, setHoveredPerson] = useState<NearbyPerson | null>(null);

  // Filter people within the selected radius
  const filteredPeople = nearbyPeople.filter(
    p => p.distanceMiles <= maxRadiusMiles
  );

  // Radar dimensions
  const radarSize = 360;
  const center = radarSize / 2;
  const maxPlotRadius = center - 32;

  // Polar coordinates to Cartesian (SVG space)
  const getBlipCoordinates = (distance: number, bearing: number) => {
    // Distance mapped to plot radius
    const normalizedDist = Math.min(distance / maxRadiusMiles, 1);
    const r = normalizedDist * maxPlotRadius;
    // Bearing (0 = North/Up, 90 = East/Right)
    const rad = ((bearing - 90) * Math.PI) / 180;
    const x = center + r * Math.cos(rad);
    const y = center + r * Math.sin(rad);
    return { x, y };
  };

  const handleBlipClick = (person: NearbyPerson) => {
    soundFx.playRadarBlip();
    onSelectPerson(person);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto">
      {/* Location & Presence Status Header */}
      <div className="w-full flex items-center justify-between mb-4 px-2">
        <button
          onClick={onOpenLocationPicker}
          className="flex items-center gap-2 group text-left cursor-pointer hover:opacity-90 transition-opacity"
        >
          <div className="w-8 h-8 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs text-zinc-400 flex items-center gap-1.5">
              <span>Your Current Area</span>
              <span className="text-[10px] text-rose-400 group-hover:underline">Change</span>
            </div>
            <div className="text-sm font-semibold text-zinc-100 flex items-center gap-1">
              <span>{user.neighborhood}</span>
              <span className="text-zinc-500">·</span>
              <span className="text-xs font-normal text-zinc-400">{user.city}</span>
            </div>
          </div>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleGhostMode}
            title={user.isGhostMode ? 'Ghost Mode active (hidden from radar)' : 'Radar visible to nearby singles'}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
              user.isGhostMode
                ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white'
            }`}
          >
            {user.isGhostMode ? (
              <>
                <EyeOff className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Ghost Active</span>
              </>
            ) : (
              <>
                <Radio className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden sm:inline">Broadcasting</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Radius Range Selector Segmented Tabs */}
      <div className="w-full flex items-center justify-between gap-1 p-1 bg-zinc-900/80 border border-zinc-800/80 rounded-xl mb-4">
        <span className="text-xs text-zinc-400 px-3 hidden sm:inline font-medium">Search Distance:</span>
        <div className="flex items-center gap-1 w-full sm:w-auto">
          {[0.5, 1.0, 3.0, 5.0].map(radius => (
            <button
              key={radius}
              onClick={() => onMaxRadiusChange(radius)}
              className={`flex-1 sm:flex-initial px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                maxRadiusMiles === radius
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
              }`}
            >
              {radius < 1 ? '0.5 mi (Walk)' : `${radius} mi`}
            </button>
          ))}
        </div>
      </div>

      {/* Main Radar Screen */}
      <div className="relative w-full aspect-square max-w-[360px] sm:max-w-[380px] bg-zinc-900/60 rounded-3xl border border-zinc-800 p-2 flex items-center justify-center overflow-hidden shadow-2xl">
        {/* Subtle background grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle, #fff 1px, transparent 1px)`,
            backgroundSize: '16px 16px',
          }}
        />

        {/* SVG Concentric Range Rings and Sweep */}
        <svg
          viewBox={`0 0 ${radarSize} ${radarSize}`}
          className="w-full h-full pointer-events-none select-none"
        >
          <defs>
            <radialGradient id="radarCenterGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="sweepGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.35" />
              <stop offset="60%" stopColor="#f43f5e" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Concentric distance circles */}
          <circle cx={center} cy={center} r={maxPlotRadius * 0.33} fill="none" stroke="#27272a" strokeWidth="1" strokeDasharray="3 3" />
          <circle cx={center} cy={center} r={maxPlotRadius * 0.66} fill="none" stroke="#27272a" strokeWidth="1" strokeDasharray="3 3" />
          <circle cx={center} cy={center} r={maxPlotRadius} fill="none" stroke="#3f3f46" strokeWidth="1.2" />

          {/* Crosshairs */}
          <line x1={center} y1="16" x2={center} y2={radarSize - 16} stroke="#27272a" strokeWidth="1" />
          <line x1="16" y1={center} x2={radarSize - 16} y2={center} stroke="#27272a" strokeWidth="1" />

          {/* Radar Sweep Arc */}
          <g className="animate-radar-sweep">
            <path
              d={`M ${center} ${center} L ${center} ${center - maxPlotRadius} A ${maxPlotRadius} ${maxPlotRadius} 0 0 1 ${center + maxPlotRadius * 0.7} ${center - maxPlotRadius * 0.7} Z`}
              fill="url(#sweepGradient)"
            />
          </g>

          {/* User Center Pulse */}
          <circle cx={center} cy={center} r="28" fill="url(#radarCenterGlow)" />
          <circle cx={center} cy={center} r="6" fill="#f43f5e" />
          <circle cx={center} cy={center} r="10" fill="none" stroke="#f43f5e" strokeWidth="1.5" className="animate-ping opacity-60" />

          {/* Distance Ring Labels */}
          <text x={center + 4} y={center - maxPlotRadius * 0.33 + 12} fill="#71717a" fontSize="9" fontFamily="monospace">
            {(maxRadiusMiles * 0.33).toFixed(1)}mi
          </text>
          <text x={center + 4} y={center - maxPlotRadius * 0.66 + 12} fill="#71717a" fontSize="9" fontFamily="monospace">
            {(maxRadiusMiles * 0.66).toFixed(1)}mi
          </text>
          <text x={center + 4} y={center - maxPlotRadius + 14} fill="#a1a1aa" fontSize="10" fontFamily="monospace" fontWeight="600">
            {maxRadiusMiles.toFixed(1)}mi
          </text>
        </svg>

        {/* You Anchor Badge */}
        <div
          className="absolute z-10 pointer-events-none flex flex-col items-center"
          style={{ top: `${(center / radarSize) * 100}%`, left: `${(center / radarSize) * 100}%`, transform: 'translate(-50%, 14px)' }}
        >
          <span className="text-[10px] font-semibold tracking-wider text-rose-400 uppercase bg-zinc-950/80 px-1.5 py-0.5 rounded border border-rose-500/30">
            You
          </span>
        </div>

        {/* Interactive Blips plotted on Radar */}
        {filteredPeople.map(person => {
          const { x, y } = getBlipCoordinates(person.distanceMiles, person.bearingDeg);
          const isHovered = hoveredPerson?.id === person.id;

          return (
            <div
              key={person.id}
              style={{
                position: 'absolute',
                left: `${(x / radarSize) * 100}%`,
                top: `${(y / radarSize) * 100}%`,
                transform: 'translate(-50%, -50%)',
              }}
              className="z-20 cursor-pointer"
              onMouseEnter={() => setHoveredPerson(person)}
              onMouseLeave={() => setHoveredPerson(null)}
              onClick={() => handleBlipClick(person)}
            >
              {/* Outer pulsing ring for walking distance */}
              {person.distanceWalkingMin <= 15 && (
                <div className="absolute inset-0 -m-1 rounded-full bg-rose-500/30 animate-ping pointer-events-none" />
              )}

              {/* Avatar Blip */}
              <div
                className={`relative w-10 h-10 rounded-full p-0.5 transition-all duration-200 overflow-hidden shadow-lg ${
                  isHovered
                    ? 'scale-125 ring-2 ring-rose-400 z-30 shadow-rose-500/40'
                    : 'ring-1 ring-zinc-700 bg-zinc-800 hover:ring-rose-400'
                }`}
              >
                {person.avatarUrl ? (
                  <img
                    src={person.avatarUrl}
                    alt={person.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gradient-to-tr from-rose-900 to-zinc-800 flex items-center justify-center text-xs font-semibold text-rose-200">
                    {person.name.charAt(0)}
                  </div>
                )}
              </div>

              {/* Proximity Distance Tag */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 pointer-events-none whitespace-nowrap">
                <span className="px-1.5 py-0.5 text-[9px] font-mono-numbers font-medium text-zinc-200 bg-zinc-950/90 rounded border border-zinc-800 shadow">
                  {person.distanceMiles}mi · {person.distanceWalkingMin}m
                </span>
              </div>
            </div>
          );
        })}

        {/* Hover / Active Preview Tooltip */}
        {hoveredPerson && (() => {
          const score = calculateSmartMatchScore(user, hoveredPerson);
          return (
            <div className="absolute bottom-3 left-3 right-3 z-30 p-2.5 bg-zinc-950/95 border border-zinc-700/80 rounded-xl shadow-xl flex items-center justify-between pointer-events-none backdrop-blur-md">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-zinc-700">
                  {hoveredPerson.avatarUrl ? (
                    <img src={hoveredPerson.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-rose-900 flex items-center justify-center text-xs font-bold text-white">
                      {hoveredPerson.name[0]}
                    </div>
                  )}
                </div>
                <div className="truncate">
                  <div className="text-xs font-semibold text-zinc-100 flex items-center gap-1.5">
                    <span>{hoveredPerson.name}, {hoveredPerson.age}</span>
                    <span className="text-[10px] text-rose-400 font-mono-numbers">{hoveredPerson.distanceWalkingMin}m walk</span>
                    <span className="text-zinc-600">·</span>
                    <span className="text-[10px] font-bold text-emerald-400 font-mono-numbers flex items-center gap-0.5">
                      <Sparkles className="w-2.5 h-2.5" />
                      <span>{score.totalScore}%</span>
                    </span>
                  </div>
                  <div className="text-[11px] text-zinc-400 truncate">
                    {hoveredPerson.rightNowStatus || hoveredPerson.occupation}
                  </div>
                </div>
              </div>
              <div className="text-[10px] font-medium text-rose-400 shrink-0 ml-2">
                Tap to view &rarr;
              </div>
            </div>
          );
        })()}
      </div>

      {/* Proximity Summary Bar */}
      <div className="w-full flex items-center justify-between text-xs text-zinc-400 mt-4 px-2">
        <div className="flex items-center gap-1.5">
          <Navigation className="w-3.5 h-3.5 text-rose-400" />
          <span>
            <strong className="text-zinc-200 font-mono-numbers">{filteredPeople.length}</strong> singles within {maxRadiusMiles} {maxRadiusMiles === 1 ? 'mile' : 'miles'}
          </span>
        </div>
        <div className="flex items-center gap-3 text-zinc-400">
          <span className="flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>Public verified spots only</span>
          </span>
        </div>
      </div>
    </div>
  );
};
