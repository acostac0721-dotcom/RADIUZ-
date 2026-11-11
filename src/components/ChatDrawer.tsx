import React, { useState, useRef, useEffect } from 'react';
import { NearbyPerson, ChatMessage, MeetupSpot, MeetupExpenseCharge } from '../types';
import { soundFx } from '../utils/audio';
import {
  Send,
  X,
  MapPin,
  Coffee,
  Sparkles,
  Clock,
  ShieldCheck,
  Compass,
  Car,
  Utensils,
  Wine,
  DollarSign,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

interface ChatDrawerProps {
  person: NearbyPerson;
  messages: ChatMessage[];
  isOpen: boolean;
  isTyping?: boolean;
  onClose: () => void;
  onSendMessage: (text: string) => void;
  onOpenIcebreakers: () => void;
  onOpenMeetupPicker: () => void;
  onRequestExpenseModal?: () => void;
  onRespondToExpense?: (chargeId: string, accepted: boolean) => void;
}

export const ChatDrawer: React.FC<ChatDrawerProps> = ({
  person,
  messages,
  isOpen,
  isTyping = false,
  onClose,
  onSendMessage,
  onOpenIcebreakers,
  onOpenMeetupPicker,
  onRequestExpenseModal,
  onRespondToExpense,
}) => {
  if (!isOpen) return null;

  const [input, setInput] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    soundFx.playPingSent();
    onSendMessage(input.trim());
    setInput('');
  };

  const handleQuickPhrase = (phrase: string) => {
    soundFx.playPingSent();
    onSendMessage(phrase);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden h-[90vh] flex flex-col">
        {/* Top Header */}
        <div className="p-3.5 sm:p-4 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-full overflow-hidden ring-1 ring-zinc-700 shrink-0">
              {person.avatarUrl ? (
                <img src={person.avatarUrl} alt={person.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-rose-900 flex items-center justify-center text-sm font-bold text-white">
                  {person.name[0]}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-zinc-100">{person.name}</h3>
                <span className="text-[10px] text-emerald-400 flex items-center gap-0.5">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Verified Near</span>
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                <span className="text-rose-400 font-mono-numbers">{person.distanceMiles} mi away</span>
                <span aria-hidden="true">·</span>
                <span className="text-zinc-300 font-mono-numbers">{person.distanceWalkingMin}m walk</span>
                <span aria-hidden="true">·</span>
                <span>{person.neighborhood}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onRequestExpenseModal && (
              <button
                onClick={onRequestExpenseModal}
                title="Request Lyft ride or food delivery coverage"
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-amber-300 bg-amber-500/15 border border-amber-500/30 rounded-lg hover:bg-amber-500/25 transition-colors cursor-pointer"
              >
                <Car className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Request Ride ($)</span>
              </button>
            )}
            <button
              onClick={onOpenMeetupPicker}
              title="Propose instant safe meetup spot"
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-rose-300 bg-rose-500/15 border border-rose-500/30 rounded-lg hover:bg-rose-500/25 transition-colors cursor-pointer"
            >
              <Coffee className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Meetup</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Proximity Fast-Track Banner */}
        <div className="px-4 py-2 bg-rose-950/20 border-b border-rose-900/30 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-rose-300">
            <Compass className="w-3.5 h-3.5 text-rose-400" />
            <span>Fast-track conversation: meet within walking distance today!</span>
          </div>
          <button
            onClick={onOpenIcebreakers}
            className="text-[11px] font-semibold text-rose-400 hover:text-rose-300 underline cursor-pointer"
          >
            Icebreaker prompts
          </button>
        </div>

        {/* Message Stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-zinc-900/60">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                <Sparkles className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-semibold text-zinc-200">
                Break the Ice with {person.name}
              </h4>
              <p className="text-xs text-zinc-400 max-w-xs">
                You're both {person.distanceWalkingMin} minutes apart in {person.neighborhood}. Skip the generic opener!
              </p>
              <button
                onClick={onOpenIcebreakers}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-xl transition-all cursor-pointer shadow-md shadow-rose-600/20"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Choose Proximity Icebreaker</span>
              </button>
            </div>
          ) : (
            messages.map(msg => {
              const isMe = msg.senderId === 'user-me';

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  {msg.isIcebreaker && (
                    <div className="flex items-center gap-1 text-[10px] text-rose-400 font-semibold uppercase tracking-wider mb-1 px-1">
                      <Sparkles className="w-3 h-3" />
                      <span>Icebreaker Question · {msg.icebreakerCategory || 'Proximity'}</span>
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                      isMe
                        ? 'bg-rose-600 text-white rounded-br-xs'
                        : 'bg-zinc-800 border border-zinc-700/70 text-zinc-100 rounded-bl-xs'
                    }`}
                  >
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    {msg.isMeetupInvite && msg.spotDetails && (
                      <div className="mt-2.5 p-2.5 bg-black/30 rounded-xl border border-white/10 text-xs space-y-1">
                        <div className="font-semibold text-amber-300 flex items-center gap-1">
                          <Coffee className="w-3.5 h-3.5" />
                          <span>Meetup Proposed: {msg.spotDetails.name}</span>
                        </div>
                        <div className="text-[11px] text-zinc-300">
                          {msg.spotDetails.address} (~{msg.spotDetails.walkTimeMin}m walk)
                        </div>
                      </div>
                    )}
                    {msg.expenseCharge && (
                      <div className="mt-2.5 p-3 bg-zinc-950/80 rounded-xl border border-zinc-700/80 text-xs space-y-2">
                        <div className="flex items-center justify-between gap-2 border-b border-zinc-800 pb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0">
                              {msg.expenseCharge.type === 'lyft_ride' ? (
                                <Car className="w-4 h-4 text-rose-400" />
                              ) : msg.expenseCharge.type === 'food_delivery' ? (
                                <Utensils className="w-4 h-4 text-amber-400" />
                              ) : msg.expenseCharge.type === 'drinks_round' ? (
                                <Wine className="w-4 h-4 text-purple-400" />
                              ) : (
                                <Coffee className="w-4 h-4 text-emerald-400" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold text-zinc-100 truncate">{msg.expenseCharge.title}</div>
                              <div className="text-[10px] text-zinc-400">
                                {msg.expenseCharge.requesterId === 'user-me' ? 'Requested by You' : `Requested by ${person.name}`}
                              </div>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-sm font-bold text-emerald-400 font-mono-numbers">
                              {msg.expenseCharge.currency}{msg.expenseCharge.amount.toFixed(2)}
                            </span>
                          </div>
                        </div>

                        {msg.expenseCharge.note && (
                          <p className="text-[11px] text-zinc-300 italic">
                            "{msg.expenseCharge.note}"
                          </p>
                        )}

                        {/* Status / Actions */}
                        {msg.expenseCharge.status === 'pending' ? (
                          msg.expenseCharge.requesterId === 'user-me' ? (
                            <div className="flex items-center gap-1.5 text-[11px] text-amber-400 font-medium pt-1">
                              <Clock className="w-3.5 h-3.5 animate-spin" />
                              <span>Pending confirmation from {person.name.split(' ')[0]}...</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 pt-1">
                              <button
                                onClick={() => onRespondToExpense?.(msg.expenseCharge!.id, true)}
                                className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold text-xs transition-colors cursor-pointer shadow-sm"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Approve & Cover</span>
                              </button>
                              <button
                                onClick={() => onRespondToExpense?.(msg.expenseCharge!.id, false)}
                                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-lg font-semibold text-xs transition-colors cursor-pointer"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Decline</span>
                              </button>
                            </div>
                          )
                        ) : msg.expenseCharge.status === 'accepted' ? (
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1.5 rounded-lg border border-emerald-500/20">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span>Covered & Dispatched ✓</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 bg-zinc-800/60 px-2.5 py-1.5 rounded-lg border border-zinc-700/60">
                            <XCircle className="w-4 h-4 text-zinc-400" />
                            <span>Request Declined</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-zinc-500 mt-1 px-1 font-mono-numbers">
                    {msg.timestamp}
                  </span>
                </div>
              );
            })
          )}

          {/* Real-Time Typing Indicator */}
          {isTyping && (
            <div className="flex items-end gap-2 animate-in fade-in duration-200">
              <div className="w-6 h-6 rounded-full overflow-hidden shrink-0 ring-1 ring-zinc-700">
                {person.avatarUrl ? (
                  <img src={person.avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-rose-900 flex items-center justify-center text-[10px] font-bold text-white">
                    {person.name[0]}
                  </div>
                )}
              </div>
              <div className="bg-zinc-800 border border-zinc-700/70 rounded-2xl rounded-bl-xs px-3.5 py-2 flex items-center gap-1.5 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-bounce" />
                <span className="text-[11px] text-zinc-400 font-medium ml-1">
                  {person.name.split(' ')[0]} is typing...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Canned Action Chips */}
        <div className="px-3 py-2 bg-zinc-950 border-t border-zinc-800/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {[
            'Right around the corner!',
            'Coffee sounds great!',
            'Where are you seated?',
            'Wearing a navy jacket',
            'Leaving in 5 mins',
          ].map(phrase => (
            <button
              key={phrase}
              onClick={() => handleQuickPhrase(phrase)}
              className="px-2.5 py-1 text-[11px] text-zinc-300 bg-zinc-800 hover:bg-zinc-700 rounded-lg whitespace-nowrap transition-colors cursor-pointer border border-zinc-700/60"
            >
              {phrase}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-3 bg-zinc-950 border-t border-zinc-800 flex items-center gap-2">
          <input
            type="text"
            placeholder={`Message ${person.name}...`}
            value={input}
            onChange={e => setInput(e.target.value)}
            className="flex-1 px-3.5 py-2.5 text-xs bg-zinc-900 border border-zinc-700/80 rounded-xl text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-rose-500"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="w-10 h-10 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-40 disabled:hover:bg-rose-600 text-white flex items-center justify-center transition-all cursor-pointer shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
