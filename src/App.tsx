import React, { useState, useEffect } from 'react';
import { APIProvider } from '@vis.gl/react-google-maps';
import {
  UserProfile,
  NearbyPerson,
  MeetupSpot,
  MatchRecord,
  ChatMessage,
  ProximityPing,
  Coordinates,
  DateIntent,
  MeetupExpenseCharge,
} from './types';
import {
  CURRENT_USER,
  INITIAL_NEARBY_PEOPLE,
  CURATED_MEETUP_SPOTS,
  INITIAL_MATCHES,
} from './data/mockData';
import { RadarView } from './components/RadarView';
import { GoogleMapView } from './components/GoogleMapView';
import { DaterProfileModal } from './components/DaterProfileModal';
import { IcebreakerModal } from './components/IcebreakerModal';
import { MeetupSpotPickerModal } from './components/MeetupSpotPickerModal';
import { ChatDrawer } from './components/ChatDrawer';
import { ActiveMeetupTracker } from './components/ActiveMeetupTracker';
import { LocationPickerModal } from './components/LocationPickerModal';
import { SafetyPrivacyModal } from './components/SafetyPrivacyModal';
import { MapsAgentScout } from './components/MapsAgentScout';
import { ExpenseChargeModal } from './components/ExpenseChargeModal';
import { soundFx } from './utils/audio';
import { calculateSmartMatchScore } from './utils/matchScore';
import {
  Radio,
  MapPin,
  MessageCircle,
  Clock,
  Sparkles,
  Shield,
  Volume2,
  VolumeX,
  Compass,
  Navigation,
  Coffee,
  Footprints,
  Flame,
  Zap,
  Car,
  DollarSign,
  CheckCircle2,
} from 'lucide-react';

export default function App() {
  // App state
  const [user, setUser] = useState<UserProfile>(CURRENT_USER);
  const [nearbyPeople, setNearbyPeople] = useState<NearbyPerson[]>(INITIAL_NEARBY_PEOPLE);
  const [meetupSpots, setMeetupSpots] = useState<MeetupSpot[]>(CURATED_MEETUP_SPOTS);
  const [matches, setMatches] = useState<MatchRecord[]>(INITIAL_MATCHES);
  const [activeTab, setActiveTab] = useState<'radar' | 'map' | 'nearby' | 'matches'>('radar');

  // Search radius filter in miles
  const [maxRadiusMiles, setMaxRadiusMiles] = useState<number>(3.0);

  // Date Intent Filter ('all' | 'casual_date' | 'quickie')
  const [selectedIntentFilter, setSelectedIntentFilter] = useState<'all' | DateIntent>('all');

  // Selected entities for modals
  const [selectedPerson, setSelectedPerson] = useState<NearbyPerson | null>(null);
  const [profileModalOpen, setProfileModalOpen] = useState<boolean>(false);
  const [icebreakerModalOpen, setIcebreakerModalOpen] = useState<boolean>(false);
  const [meetupPickerOpen, setMeetupPickerOpen] = useState<boolean>(false);
  const [locationPickerOpen, setLocationPickerOpen] = useState<boolean>(false);
  const [safetyModalOpen, setSafetyModalOpen] = useState<boolean>(false);
  const [scoutAgentOpen, setScoutAgentOpen] = useState<boolean>(false);

  // Expense charge modal state
  const [expenseChargeModalOpen, setExpenseChargeModalOpen] = useState<boolean>(false);
  const [expenseTargetPerson, setExpenseTargetPerson] = useState<NearbyPerson | null>(null);

  // Active chat state
  const [activeChatPerson, setActiveChatPerson] = useState<NearbyPerson | null>(null);
  const [isTypingByPerson, setIsTypingByPerson] = useState<Record<string, boolean>>({});
  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>({
    'dater-sophie': [
      {
        id: 'msg-1',
        senderId: 'dater-sophie',
        text: 'Hey! I see we are both hanging out in the Village right now!',
        timestamp: '10:42 AM',
      },
      {
        id: 'msg-2',
        senderId: 'dater-sophie',
        text: 'Coffee at Sey or a quick stroll around Washington Square?',
        timestamp: '10:43 AM',
      },
    ],
  });

  // Active live meetup state
  const [activePing, setActivePing] = useState<ProximityPing | null>(null);
  const [activeMeetupSpot, setActiveMeetupSpot] = useState<MeetupSpot | null>(null);
  const [activeMeetupTrackerOpen, setActiveMeetupTrackerOpen] = useState<boolean>(false);

  // Route destination for Google Map Polyline
  const [routeDestination, setRouteDestination] = useState<Coordinates | null>(null);

  // Audio mute state
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Quota defense state per Section 8 Case A
  const [quotaExceeded, setQuotaExceeded] = useState<boolean>(false);

  useEffect(() => {
    const handleQuotaExceeded = () => {
      setQuotaExceeded(true);
    };
    window.addEventListener('gmp-quota-exceeded', handleQuotaExceeded);
    return () => {
      window.removeEventListener('gmp-quota-exceeded', handleQuotaExceeded);
    };
  }, []);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  // Audio mute toggle
  const toggleAudio = () => {
    soundFx.isMuted = !isMuted;
    setIsMuted(!isMuted);
  };

  // Open Icebreaker for a specific person
  const handleOpenIcebreakers = (person: NearbyPerson) => {
    setSelectedPerson(person);
    setProfileModalOpen(false);
    setIcebreakerModalOpen(true);
  };

  // Open Chat with a specific person
  const handleOpenChat = (person: NearbyPerson) => {
    setActiveChatPerson(person);
    setProfileModalOpen(false);
  };

  // Send Icebreaker Question to Chat
  const handleSendIcebreaker = (question: string, category: string) => {
    if (!selectedPerson) return;
    const targetPerson = selectedPerson;

    // Check if match exists, otherwise add to matches
    if (!matches.some(m => m.person.id === targetPerson.id)) {
      const newMatch: MatchRecord = {
        id: `match-${targetPerson.id}`,
        person: targetPerson,
        matchedAt: 'Just now',
        sharedInterests: targetPerson.interests.filter(i => user.interests.includes(i)),
        distanceAtMatchMiles: targetPerson.distanceMiles,
        lastMessage: question,
      };
      setMatches(prev => [newMatch, ...prev]);
    }

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: 'user-me',
      text: question,
      timestamp: 'Just now',
      isIcebreaker: true,
      icebreakerCategory: category,
    };

    setChatMessages(prev => ({
      ...prev,
      [targetPerson.id]: [...(prev[targetPerson.id] || []), newMsg],
    }));

    setActiveChatPerson(targetPerson);

    // Simulate other user seeing the icebreaker and typing
    setTimeout(() => {
      setIsTypingByPerson(prev => ({ ...prev, [targetPerson.id]: true }));
    }, 600);

    setTimeout(() => {
      setIsTypingByPerson(prev => ({ ...prev, [targetPerson.id]: false }));
      const replies = [
        `Haha love this icebreaker! Definitely single-origin pour-over.`,
        `Now that's how you break the ice! Let's do it.`,
        `I was literally just craving this right now!`,
      ];
      const botMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        senderId: targetPerson.id,
        text: replies[Math.floor(Math.random() * replies.length)],
        timestamp: 'Just now',
      };
      setChatMessages(prev => ({
        ...prev,
        [targetPerson.id]: [...(prev[targetPerson.id] || []), botMsg],
      }));
    }, 2800);
  };

  // Send regular message to chat
  const handleSendMessage = (text: string) => {
    if (!activeChatPerson) return;
    const currentPersonId = activeChatPerson.id;
    const currentPersonWalkingMin = activeChatPerson.distanceWalkingMin;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: 'user-me',
      text,
      timestamp: 'Just now',
    };
    setChatMessages(prev => ({
      ...prev,
      [currentPersonId]: [...(prev[currentPersonId] || []), newMsg],
    }));

    // Trigger typing indicator shortly after user sends a message
    setTimeout(() => {
      setIsTypingByPerson(prev => ({ ...prev, [currentPersonId]: true }));
    }, 450);

    // Automated friendly local response after 2.2 seconds
    setTimeout(() => {
      setIsTypingByPerson(prev => ({ ...prev, [currentPersonId]: false }));
      const replies = [
        `Sounds fantastic! I'm only ${currentPersonWalkingMin} minutes away.`,
        `Deal! I'll head over right now.`,
        `Awesome, looking forward to meeting!`,
        `I was just thinking the exact same thing!`,
      ];
      const botMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        senderId: currentPersonId,
        text: replies[Math.floor(Math.random() * replies.length)],
        timestamp: 'Just now',
      };
      setChatMessages(prev => ({
        ...prev,
        [currentPersonId]: [...(prev[currentPersonId] || []), botMsg],
      }));
    }, 2400);
  };

  // Propose Meetup
  const handleProposeMeetup = (spot: MeetupSpot, customTime: string = 'In 20 mins', note: string = '') => {
    const target = selectedPerson || activeChatPerson || nearbyPeople[0];
    const ping: ProximityPing = {
      id: `ping-${Date.now()}`,
      senderId: 'user-me',
      receiverId: target.id,
      receiverName: target.name,
      receiverAvatar: target.avatarUrl,
      spot,
      meetupTime: customTime,
      customNote: note,
      status: 'accepted',
      createdAt: Date.now(),
      expiresInSeconds: 1200,
      codeWord: 'Golden Honeycomb',
    };

    setActivePing(ping);
    setActiveMeetupSpot(spot);
    setRouteDestination(spot.coords);
    setActiveMeetupTrackerOpen(true);

    // Also add to chat
    const inviteMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: 'user-me',
      text: `Let's meet at ${spot.name}! (${spot.address}) ${note ? `Note: "${note}"` : ''}`,
      timestamp: 'Just now',
      isMeetupInvite: true,
      spotDetails: spot,
    };
    setChatMessages(prev => ({
      ...prev,
      [target.id]: [...(prev[target.id] || []), inviteMsg],
    }));
  };

  // Filtered people based on Date Intent selection
  const filteredPeople = nearbyPeople.filter(person => {
    if (selectedIntentFilter === 'all') return true;
    if (person.dateIntent === 'open_to_both') return true;
    return person.dateIntent === selectedIntentFilter;
  });

  // Handle sending expense charge (e.g. for Lyft ride or food delivery)
  const handleSendExpenseCharge = (charge: MeetupExpenseCharge) => {
    const targetId = charge.payerId;
    const targetPerson = nearbyPeople.find(p => p.id === targetId) || selectedPerson;

    const expenseMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: 'user-me',
      text: `Requested ${charge.currency}${charge.amount.toFixed(2)} for ${charge.title}.${charge.note ? ` "${charge.note}"` : ''}`,
      timestamp: 'Just now',
      expenseCharge: charge,
    };

    setChatMessages(prev => ({
      ...prev,
      [targetId]: [...(prev[targetId] || []), expenseMsg],
    }));

    if (targetPerson) {
      setActiveChatPerson(targetPerson);
    }

    // Simulate match responding and approving the charge
    setTimeout(() => {
      setIsTypingByPerson(prev => ({ ...prev, [targetId]: true }));
    }, 600);

    setTimeout(() => {
      setIsTypingByPerson(prev => ({ ...prev, [targetId]: false }));
      soundFx.playMatchChime();

      // Update message charge status to accepted
      setChatMessages(prev => {
        const msgs = prev[targetId] || [];
        return {
          ...prev,
          [targetId]: msgs.map(m =>
            m.expenseCharge && m.expenseCharge.id === charge.id
              ? { ...m, expenseCharge: { ...m.expenseCharge, status: 'accepted' } }
              : m
          ),
        };
      });

      const confirmMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        senderId: targetId,
        text: `Got you covered! Approved $${charge.amount.toFixed(2)} for ${charge.title.toLowerCase()} 🙌 See you very soon!`,
        timestamp: 'Just now',
      };

      setChatMessages(prev => ({
        ...prev,
        [targetId]: [...(prev[targetId] || []), confirmMsg],
      }));
    }, 2800);
  };

  // Handle responding to an incoming expense request
  const handleRespondToExpense = (chargeId: string, accepted: boolean) => {
    if (!activeChatPerson) return;
    const personId = activeChatPerson.id;

    if (accepted) {
      soundFx.playMatchChime();
    } else {
      soundFx.playRadarBlip();
    }

    setChatMessages(prev => {
      const msgs = prev[personId] || [];
      return {
        ...prev,
        [personId]: msgs.map(m =>
          m.expenseCharge && m.expenseCharge.id === chargeId
            ? { ...m, expenseCharge: { ...m.expenseCharge, status: accepted ? 'accepted' : 'declined' } }
            : m
        ),
      };
    });

    const replyMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: 'user-me',
      text: accepted
        ? `Payment approved and covered! Can't wait to see you.`
        : `Sorry, I can't cover that right now, let's meet up directly!`,
      timestamp: 'Just now',
    };

    setChatMessages(prev => ({
      ...prev,
      [personId]: [...(prev[personId] || []), replyMsg],
    }));
  };

  // Set route destination from Scout agent
  const handleSelectRouteFromScout = (coords: Coordinates, label: string) => {
    setRouteDestination(coords);
    setActiveTab('map');
  };

  return (
    <APIProvider apiKey={apiKey} libraries={['places', 'routes', 'geometry']}>
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
        {/* Tier 2 Quota Exceeded Sticky Banner per Section 8 Case A */}
        {quotaExceeded && (
          <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
            <span>
              Google Maps Platform quota reached. If you are the app owner, visit{' '}
              <a
                href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-semibold text-amber-950 hover:text-amber-800"
              >
                maps developer site
              </a>{' '}
              for instructions to update your account.
            </span>
          </div>
        )}

        {/* Top Bar Contract (§2 from Frontend Design Constitution) */}
        <header className="flex items-center justify-between gap-8 px-4 sm:px-6 py-3.5 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-md sticky top-0 z-40">
          {/* Zone 1: Single text element wordmark with official app icon */}
          <div className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
            <div className="relative w-8 h-8 rounded-xl overflow-hidden ring-1 ring-rose-500/40 shadow-sm shrink-0 bg-zinc-900 flex items-center justify-center">
              <img
                src="/assets/aistudio/1794421978723_8fe4e49b.jpg"
                alt="RADIUZ Icon"
                className="w-full h-full object-cover"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-rose-500 ring-1 ring-zinc-950 animate-pulse" />
            </div>
            <div className="flex flex-col">
              <a href="/" className="font-display text-lg font-black tracking-wider text-white hover:text-rose-400 transition-colors leading-none">
                RADIUZ
              </a>
              <span className="text-[8.5px] font-bold tracking-widest text-zinc-400 uppercase mt-0.5 font-mono">
                YOUR WORLD YOUR RADIUS
              </span>
            </div>
          </div>

          {/* Zone 2: 4-5 concise single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-zinc-400">
            <button
              onClick={() => setActiveTab('radar')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'radar' ? 'text-rose-400 underline underline-offset-4' : ''
              }`}
            >
              Proximity Radar
            </button>
            <button
              onClick={() => setActiveTab('map')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'map' ? 'text-rose-400 underline underline-offset-4' : ''
              }`}
            >
              Live Google Map
            </button>
            <button
              onClick={() => setActiveTab('nearby')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'nearby' ? 'text-rose-400 underline underline-offset-4' : ''
              }`}
            >
              Nearby Singles ({nearbyPeople.length})
            </button>
            <button
              onClick={() => setActiveTab('matches')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'matches' ? 'text-rose-400 underline underline-offset-4' : ''
              }`}
            >
              Matches & Chats
            </button>
            <button
              onClick={() => setSafetyModalOpen(true)}
              className="hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer text-zinc-400"
            >
              Safety Rules
            </button>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={toggleAudio}
              title={isMuted ? 'Unmute Sound FX' : 'Mute Sound FX'}
              className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-rose-400" />}
            </button>

            <button
              onClick={() => setScoutAgentOpen(true)}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg shadow-sm shadow-rose-600/30 transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Ask Maps Scout</span>
            </button>
          </div>
        </header>

        {/* Live Active Meetup Notification Bar (if an instant meetup is happening) */}
        {activePing && activeMeetupSpot && (
          <div
            onClick={() => setActiveMeetupTrackerOpen(true)}
            className="w-full bg-gradient-to-r from-rose-950 via-zinc-900 to-rose-950 border-b border-rose-800/40 px-4 py-2 flex items-center justify-between text-xs cursor-pointer hover:opacity-95 transition-opacity"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-semibold text-rose-300">
                Instant Meetup Active: {activePing.receiverName} @ {activeMeetupSpot.name}
              </span>
              <span className="text-zinc-400 hidden sm:inline">
                ({activeMeetupSpot.walkTimeMin}m walk)
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-rose-400 font-semibold">
              <span>View Countdown Tracker &rarr;</span>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 w-full max-w-6xl mx-auto p-3 sm:p-6 pb-20 md:pb-6">
          {/* Sub-Header / Current Broadcast Banner */}
          <div className="mb-6 p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
                <Flame className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <div className="text-xs text-zinc-400 flex items-center gap-1.5">
                  <span>Your Live Vibe in {user.neighborhood}</span>
                  <button
                    onClick={() => setLocationPickerOpen(true)}
                    className="text-[10px] text-rose-400 underline font-medium cursor-pointer"
                  >
                    Edit
                  </button>
                </div>
                <div className="text-sm font-semibold text-zinc-100">
                  "{user.rightNowStatus}"
                </div>
              </div>
            </div>

            {/* Quick Mode Switch Tabs (Mobile & Desktop) */}
            <div className="flex items-center gap-1 p-1 bg-zinc-950 rounded-xl border border-zinc-800 self-start sm:self-auto">
              <button
                onClick={() => setActiveTab('radar')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'radar'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Radio className="w-3.5 h-3.5" />
                <span>Radar</span>
              </button>
              <button
                onClick={() => setActiveTab('map')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'map'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Google Map</span>
              </button>
              <button
                onClick={() => setActiveTab('nearby')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'nearby'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Footprints className="w-3.5 h-3.5" />
                <span>List ({nearbyPeople.length})</span>
              </button>
            </div>
          </div>

          {/* TAB 1: RADAR VIEW */}
          {activeTab === 'radar' && (
            <div className="space-y-6">
              <RadarView
                user={user}
                nearbyPeople={nearbyPeople}
                maxRadiusMiles={maxRadiusMiles}
                onMaxRadiusChange={setMaxRadiusMiles}
                onSelectPerson={person => {
                  setSelectedPerson(person);
                  setProfileModalOpen(true);
                }}
                onOpenMatchIcebreaker={handleOpenIcebreakers}
                onToggleGhostMode={() => {
                  setUser(prev => ({ ...prev, isGhostMode: !prev.isGhostMode }));
                }}
                onOpenLocationPicker={() => setLocationPickerOpen(true)}
              />

              {/* Horizontal Strip of Closest Singles */}
              <div className="pt-4 border-t border-zinc-800">
                <div className="flex items-center justify-between mb-3 px-1">
                  <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Instant Walking Distance Singles
                  </h3>
                  <button
                    onClick={() => setActiveTab('nearby')}
                    className="text-xs text-rose-400 hover:underline cursor-pointer"
                  >
                    View all &rarr;
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {nearbyPeople.slice(0, 4).map(person => (
                    <div
                      key={person.id}
                      onClick={() => {
                        setSelectedPerson(person);
                        setProfileModalOpen(true);
                      }}
                      className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer flex items-center gap-3 group"
                    >
                      <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 border border-zinc-700 group-hover:ring-2 group-hover:ring-rose-400">
                        {person.avatarUrl ? (
                          <img
                            src={person.avatarUrl}
                            alt={person.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-rose-900 flex items-center justify-center font-bold text-white">
                            {person.name[0]}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        {(() => {
                          const score = calculateSmartMatchScore(user, person);
                          return (
                            <>
                              <div className="flex items-center justify-between gap-1">
                                <div className="text-sm font-semibold text-zinc-100 truncate flex items-center gap-1.5">
                                  <span>{person.name.split(' ')[0]}, {person.age}</span>
                                  <span className="text-[10px] text-rose-400 font-mono-numbers">{person.distanceWalkingMin}m walk</span>
                                </div>
                                <span className="text-[11px] font-bold text-rose-400 font-mono-numbers shrink-0">
                                  {score.totalScore}%
                                </span>
                              </div>
                              <div className="text-xs text-zinc-400 truncate">
                                {person.rightNowStatus || person.occupation}
                              </div>
                              <div className="text-[10px] text-zinc-500 mt-0.5 flex items-center gap-1">
                                <span>{person.neighborhood}</span>
                                <span aria-hidden="true">·</span>
                                <span className="text-zinc-400">{score.matchTier} Match</span>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LIVE GOOGLE MAP VIEW */}
          {activeTab === 'map' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
                <div className="flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-rose-400" />
                  <span>Interactive Real-Time Google Maps Platform view</span>
                </div>
                {routeDestination && (
                  <button
                    onClick={() => setRouteDestination(null)}
                    className="text-xs text-rose-400 hover:underline cursor-pointer"
                  >
                    Clear Active Route
                  </button>
                )}
              </div>

              <div className="w-full h-[520px] rounded-3xl overflow-hidden shadow-2xl border border-zinc-800">
                <GoogleMapView
                  user={user}
                  nearbyPeople={nearbyPeople}
                  spots={meetupSpots}
                  selectedPerson={selectedPerson}
                  selectedSpot={activeMeetupSpot}
                  onSelectPerson={person => {
                    setSelectedPerson(person);
                    setProfileModalOpen(true);
                  }}
                  onSelectSpot={spot => {
                    handleProposeMeetup(spot);
                  }}
                  routeDestination={routeDestination}
                />
              </div>
            </div>
          )}

          {/* TAB 3: NEARBY SINGLES FEED */}
          {activeTab === 'nearby' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
                <div>
                  <h2 className="text-lg font-bold text-zinc-100">
                    Singles in {user.neighborhood} Right Now
                  </h2>
                  <p className="text-xs text-zinc-400">
                    Sorted by physical proximity. Filter by what you are looking for today.
                  </p>
                </div>

                {/* Date Intent Selector Filter Pills */}
                <div className="flex items-center gap-1.5 p-1 bg-zinc-900 border border-zinc-800 rounded-xl self-start sm:self-auto">
                  <button
                    onClick={() => {
                      soundFx.playRadarBlip();
                      setSelectedIntentFilter('all');
                    }}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                      selectedIntentFilter === 'all'
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    All ({nearbyPeople.length})
                  </button>
                  <button
                    onClick={() => {
                      soundFx.playRadarBlip();
                      setSelectedIntentFilter('casual_date');
                    }}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                      selectedIntentFilter === 'casual_date'
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <Coffee className="w-3 h-3 text-rose-400" />
                    <span>Casual Date</span>
                  </button>
                  <button
                    onClick={() => {
                      soundFx.playRadarBlip();
                      setSelectedIntentFilter('quickie');
                    }}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                      selectedIntentFilter === 'quickie'
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <Zap className="w-3 h-3 text-amber-400" />
                    <span>Quickie</span>
                  </button>
                </div>
              </div>

              {filteredPeople.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2">
                  <p className="text-sm text-zinc-300 font-semibold">No singles matching this intent right now.</p>
                  <button
                    onClick={() => setSelectedIntentFilter('all')}
                    className="text-xs text-rose-400 underline font-medium cursor-pointer"
                  >
                    Show all singles ({nearbyPeople.length})
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredPeople.map(person => {
                    const score = calculateSmartMatchScore(user, person);

                    return (
                      <div
                        key={person.id}
                        className="rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden flex flex-col shadow-md hover:border-zinc-700 transition-colors"
                      >
                        {/* Photo header */}
                        <div
                          onClick={() => {
                            setSelectedPerson(person);
                            setProfileModalOpen(true);
                          }}
                          className="relative aspect-[4/3] w-full bg-zinc-800 cursor-pointer overflow-hidden group"
                        >
                          {person.avatarUrl ? (
                            <img
                              src={person.avatarUrl}
                              alt={person.name}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-tr from-rose-950 to-zinc-800 flex items-center justify-center text-4xl font-bold text-rose-400/40">
                              {person.name[0]}
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />

                          <div className="absolute top-3 left-3 bg-zinc-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-zinc-700/60 text-xs font-semibold text-rose-400 font-mono-numbers">
                            {person.distanceMiles} mi · {person.distanceWalkingMin}m walk
                          </div>

                          {/* Smart Match Score Badge */}
                          <div className="absolute top-3 right-3 bg-zinc-950/85 backdrop-blur-md px-2.5 py-1 rounded-lg border border-rose-500/40 text-xs font-bold text-rose-300 font-mono-numbers flex items-center gap-1 shadow-md">
                            <Sparkles className="w-3 h-3 text-rose-400" />
                            <span>{score.totalScore}% Match</span>
                          </div>

                          <div className="absolute bottom-3 left-3 right-3 text-white">
                            <div className="text-base font-bold">
                              {person.name}, {person.age}
                            </div>
                            <div className="text-xs text-zinc-300">
                              {person.neighborhood} · {person.occupation}
                            </div>
                          </div>
                        </div>

                        {/* Right Now Intent & Prompts */}
                        <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                          {/* Smart Match Breakdown strip */}
                          <div className="flex items-center justify-between text-xs pb-1 border-b border-zinc-800/80">
                            <span className="text-[11px] font-semibold text-rose-400 flex items-center gap-1">
                              <Sparkles className="w-3 h-3" />
                              <span>{score.matchTier} Compatibility</span>
                            </span>
                            <span className="text-[11px] text-zinc-400 font-mono-numbers">
                              {score.sharedInterests.length > 0 ? `${score.sharedInterests.length} shared passions` : `${person.distanceWalkingMin}m walk`}
                            </span>
                          </div>

                          <div className="p-2.5 rounded-xl bg-zinc-950/70 border border-zinc-800/80 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-semibold text-rose-400 uppercase tracking-wider">
                                Right Now Vibe:
                              </span>
                              {person.dateIntent === 'quickie' ? (
                                <span className="text-[10px] font-semibold text-amber-300 flex items-center gap-1 bg-amber-950/70 border border-amber-500/30 px-1.5 py-0.5 rounded">
                                  <Zap className="w-2.5 h-2.5 text-amber-400" />
                                  <span>Quickie</span>
                                </span>
                              ) : person.dateIntent === 'casual_date' ? (
                                <span className="text-[10px] font-semibold text-rose-300 flex items-center gap-1 bg-rose-950/70 border border-rose-500/30 px-1.5 py-0.5 rounded">
                                  <Coffee className="w-2.5 h-2.5 text-rose-400" />
                                  <span>Casual Date</span>
                                </span>
                              ) : (
                                <span className="text-[10px] font-semibold text-purple-300 flex items-center gap-1 bg-purple-950/70 border border-purple-500/30 px-1.5 py-0.5 rounded">
                                  <Sparkles className="w-2.5 h-2.5 text-purple-400" />
                                  <span>Either</span>
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-zinc-200">
                              "{person.rightNowStatus}"
                            </p>
                          </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 pt-2 border-t border-zinc-800/80">
                          <button
                            onClick={() => handleOpenIcebreakers(person)}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 text-xs font-semibold text-rose-300 bg-rose-500/15 border border-rose-500/30 rounded-xl hover:bg-rose-500/25 transition-colors cursor-pointer"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Icebreaker</span>
                          </button>
                          <button
                            onClick={() => {
                              setExpenseTargetPerson(person);
                              setExpenseChargeModalOpen(true);
                            }}
                            title="Request Lyft ride or food delivery from them"
                            className="p-2 text-xs font-semibold text-amber-300 bg-amber-500/15 border border-amber-500/30 hover:bg-amber-500/25 rounded-xl transition-colors cursor-pointer"
                          >
                            <Car className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedPerson(person);
                              setMeetupPickerOpen(true);
                            }}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-xl transition-colors cursor-pointer"
                          >
                            <Coffee className="w-3.5 h-3.5" />
                            <span>Meetup</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

          {/* TAB 4: MATCHES & CHATS */}
          {activeTab === 'matches' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-zinc-100">
                  Your Proximity Matches & Chats
                </h2>
                <p className="text-xs text-zinc-400">
                  Direct connections with people within your radius. Skip waiting days to meet up!
                </p>
              </div>

              <div className="space-y-2.5">
                {matches.map(match => (
                  <div
                    key={match.id}
                    onClick={() => handleOpenChat(match.person)}
                    className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 flex items-center justify-between gap-3 cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 ring-1 ring-zinc-700">
                        {match.person.avatarUrl ? (
                          <img src={match.person.avatarUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-rose-900 flex items-center justify-center font-bold text-white">
                            {match.person.name[0]}
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-zinc-100">{match.person.name}</h3>
                          <span className="text-[11px] text-rose-400 font-mono-numbers">
                            {match.person.distanceMiles} mi · {match.person.distanceWalkingMin}m walk
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 truncate mt-0.5">
                          {match.lastMessage || match.person.rightNowStatus}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          handleOpenIcebreakers(match.person);
                        }}
                        className="px-3 py-1.5 text-xs font-semibold text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-lg hover:bg-rose-500/20 transition-colors"
                      >
                        Icebreakers
                      </button>
                      <button className="px-3 py-1.5 text-xs font-semibold text-white bg-zinc-800 rounded-lg">
                        Chat &rarr;
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>

        {/* Fixed Mobile Bottom Tab Bar (Ergonomic thumb zone per §3 Pattern 1) */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/90 backdrop-blur-md border-t border-zinc-800 grid grid-cols-4 items-center h-16 pb-safe">
          <button
            onClick={() => setActiveTab('radar')}
            className={`flex flex-col items-center justify-center min-h-[44px] cursor-pointer ${
              activeTab === 'radar' ? 'text-rose-500' : 'text-zinc-400'
            }`}
          >
            <Radio className="w-5 h-5" />
            <span className="text-[10px] font-medium tracking-tight mt-1">Radar</span>
          </button>

          <button
            onClick={() => setActiveTab('map')}
            className={`flex flex-col items-center justify-center min-h-[44px] cursor-pointer ${
              activeTab === 'map' ? 'text-rose-500' : 'text-zinc-400'
            }`}
          >
            <Navigation className="w-5 h-5" />
            <span className="text-[10px] font-medium tracking-tight mt-1">Map</span>
          </button>

          <button
            onClick={() => setActiveTab('nearby')}
            className={`flex flex-col items-center justify-center min-h-[44px] cursor-pointer ${
              activeTab === 'nearby' ? 'text-rose-500' : 'text-zinc-400'
            }`}
          >
            <Footprints className="w-5 h-5" />
            <span className="text-[10px] font-medium tracking-tight mt-1">Singles</span>
          </button>

          <button
            onClick={() => setActiveTab('matches')}
            className={`flex flex-col items-center justify-center min-h-[44px] cursor-pointer ${
              activeTab === 'matches' ? 'text-rose-500' : 'text-zinc-400'
            }`}
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-[10px] font-medium tracking-tight mt-1">Matches</span>
          </button>
        </div>

        {/* Modals & Drawers */}
        <DaterProfileModal
          person={selectedPerson}
          user={user}
          nearbySpots={meetupSpots}
          isOpen={profileModalOpen}
          onClose={() => setProfileModalOpen(false)}
          onOpenIcebreakers={handleOpenIcebreakers}
          onProposeMeetup={(person, spot) => {
            setSelectedPerson(person);
            setProfileModalOpen(false);
            setMeetupPickerOpen(true);
          }}
          onRequestExpense={person => {
            setExpenseTargetPerson(person);
            setExpenseChargeModalOpen(true);
          }}
        />

        <IcebreakerModal
          person={selectedPerson || nearbyPeople[0]}
          user={user}
          nearbySpots={meetupSpots}
          isOpen={icebreakerModalOpen}
          onClose={() => setIcebreakerModalOpen(false)}
          onSendIcebreaker={handleSendIcebreaker}
          onProposeMeetup={spot => {
            handleProposeMeetup(spot);
          }}
        />

        <MeetupSpotPickerModal
          person={selectedPerson || nearbyPeople[0]}
          spots={meetupSpots}
          isOpen={meetupPickerOpen}
          onClose={() => setMeetupPickerOpen(false)}
          onConfirmProposal={(spot, customTime, note) => {
            handleProposeMeetup(spot, customTime, note);
          }}
        />

        {activeChatPerson && (
          <ChatDrawer
            person={activeChatPerson}
            messages={chatMessages[activeChatPerson.id] || []}
            isOpen={Boolean(activeChatPerson)}
            isTyping={Boolean(isTypingByPerson[activeChatPerson.id])}
            onClose={() => setActiveChatPerson(null)}
            onSendMessage={handleSendMessage}
            onOpenIcebreakers={() => {
              setSelectedPerson(activeChatPerson);
              setIcebreakerModalOpen(true);
            }}
            onOpenMeetupPicker={() => {
              setSelectedPerson(activeChatPerson);
              setMeetupPickerOpen(true);
            }}
            onRequestExpenseModal={() => {
              setExpenseTargetPerson(activeChatPerson);
              setExpenseChargeModalOpen(true);
            }}
            onRespondToExpense={handleRespondToExpense}
          />
        )}

        {expenseTargetPerson && (
          <ExpenseChargeModal
            person={expenseTargetPerson}
            isOpen={expenseChargeModalOpen}
            onClose={() => setExpenseChargeModalOpen(false)}
            onSubmitCharge={handleSendExpenseCharge}
          />
        )}

        {activePing && activeMeetupSpot && (
          <ActiveMeetupTracker
            ping={activePing}
            person={selectedPerson || nearbyPeople[0]}
            spot={activeMeetupSpot}
            isOpen={activeMeetupTrackerOpen}
            onClose={() => setActiveMeetupTrackerOpen(false)}
            onCompleteMeetup={() => {
              setActiveMeetupTrackerOpen(false);
              setActivePing(null);
              setActiveMeetupSpot(null);
              setRouteDestination(null);
            }}
            onCancelMeetup={() => {
              setActiveMeetupTrackerOpen(false);
              setActivePing(null);
              setActiveMeetupSpot(null);
              setRouteDestination(null);
            }}
          />
        )}

        <LocationPickerModal
          user={user}
          isOpen={locationPickerOpen}
          onClose={() => setLocationPickerOpen(false)}
          onSelectPreset={preset => {
            setUser(prev => ({
              ...prev,
              neighborhood: preset.neighborhood,
              city: preset.city,
              coords: preset.coords,
            }));
          }}
          onUseRealGps={() => {
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                pos => {
                  setUser(prev => ({
                    ...prev,
                    neighborhood: 'Current Live GPS Area',
                    coords: {
                      lat: pos.coords.latitude,
                      lng: pos.coords.longitude,
                    },
                  }));
                },
                () => {
                  // Fallback to default
                }
              );
            }
          }}
          onUpdateStatus={(status, craving, dateIntent) => {
            setUser(prev => ({
              ...prev,
              rightNowStatus: status,
              currentCraving: craving,
              dateIntent,
            }));
          }}
        />

        <SafetyPrivacyModal
          user={user}
          isOpen={safetyModalOpen}
          onClose={() => setSafetyModalOpen(false)}
          onToggleGhostMode={() => {
            setUser(prev => ({ ...prev, isGhostMode: !prev.isGhostMode }));
          }}
          onTogglePrivacyFuzzing={() => {
            setUser(prev => ({ ...prev, privacyFuzzing: !prev.privacyFuzzing }));
          }}
        />

        <MapsAgentScout
          user={user}
          nearbyPeople={nearbyPeople}
          existingSpots={meetupSpots}
          isOpen={scoutAgentOpen}
          onClose={() => setScoutAgentOpen(false)}
          onSelectRouteDestination={handleSelectRouteFromScout}
          onProposeSpotAsMeetup={spot => {
            handleProposeMeetup(spot);
          }}
        />
      </div>
    </APIProvider>
  );
}
