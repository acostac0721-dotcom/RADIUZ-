import React, { useState } from 'react';
import { MeetupExpenseCharge, NearbyPerson } from '../types';
import { soundFx } from '../utils/audio';
import {
  Car,
  Utensils,
  Coffee,
  Wine,
  DollarSign,
  X,
  Send,
  ShieldCheck,
  Check,
} from 'lucide-react';

interface ExpenseChargeModalProps {
  person: NearbyPerson;
  isOpen: boolean;
  onClose: () => void;
  onSubmitCharge: (charge: MeetupExpenseCharge) => void;
}

export const ExpenseChargeModal: React.FC<ExpenseChargeModalProps> = ({
  person,
  isOpen,
  onClose,
  onSubmitCharge,
}) => {
  if (!isOpen) return null;

  const [type, setType] = useState<'lyft_ride' | 'food_delivery' | 'coffee_tab' | 'drinks_round'>('lyft_ride');
  const [amount, setAmount] = useState<number>(12);
  const [customAmount, setCustomAmount] = useState<string>('12');
  const [note, setNote] = useState<string>('Calling a Lyft so I can make it to our spot in 6 mins!');

  const presets = [
    { type: 'lyft_ride', title: 'Lyft / Rideshare Ride', defaultAmount: 12, icon: <Car className="w-4 h-4 text-rose-400" />, desc: 'Rideshare fare to expedite arrival' },
    { type: 'food_delivery', title: 'Food Delivery / Bites', defaultAmount: 16, icon: <Utensils className="w-4 h-4 text-amber-400" />, desc: 'Pre-order food or snacks to the venue' },
    { type: 'coffee_tab', title: 'Coffee & Treat Order', defaultAmount: 8, icon: <Coffee className="w-4 h-4 text-emerald-400" />, desc: 'Coffee, matcha, or pastry order' },
    { type: 'drinks_round', title: 'Drink Tab / Round', defaultAmount: 22, icon: <Wine className="w-4 h-4 text-purple-400" />, desc: 'First round of cocktails or drinks' },
  ];

  const handleTypeSelect = (selectedType: typeof type, defaultAmt: number) => {
    soundFx.playRadarBlip();
    setType(selectedType);
    setAmount(defaultAmt);
    setCustomAmount(defaultAmt.toString());
    if (selectedType === 'lyft_ride') {
      setNote(`Calling a Lyft to meet up at the spot in ~${person.distanceWalkingMin} mins!`);
    } else if (selectedType === 'food_delivery') {
      setNote('Ordering some appetizers or bites to our table!');
    } else if (selectedType === 'coffee_tab') {
      setNote('Ordering our specialty coffees & pastries ahead of time!');
    } else {
      setNote('Covering our first round of drinks at the bar!');
    }
  };

  const handleAmountClick = (val: number) => {
    soundFx.playRadarBlip();
    setAmount(val);
    setCustomAmount(val.toString());
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9.]/g, '');
    setCustomAmount(val);
    const num = parseFloat(val);
    if (!isNaN(num)) setAmount(num);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;
    soundFx.playPingSent();

    const selectedPreset = presets.find(p => p.type === type);
    const charge: MeetupExpenseCharge = {
      id: `charge-${Date.now()}`,
      type,
      title: selectedPreset ? selectedPreset.title : 'Meetup Expense',
      amount: Math.round(amount * 100) / 100,
      currency: '$',
      note: note.trim() || 'Meetup expense request',
      status: 'pending',
      requesterId: 'user-me',
      requesterName: 'You',
      payerId: person.id,
    };

    onSubmitCharge(charge);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-rose-400 font-semibold uppercase tracking-wider">
              <DollarSign className="w-3.5 h-3.5" />
              <span>Meetup Expense & Ride Request</span>
            </div>
            <h2 className="text-base font-bold text-zinc-100">
              Request Expense from {person.name}
            </h2>
            <p className="text-xs text-zinc-400">
              Ask them to cover your Lyft rideshare or food delivery to make meeting up instant and easy.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* Category Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
              Expense Category
            </label>
            <div className="grid grid-cols-2 gap-2">
              {presets.map(item => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => handleTypeSelect(item.type as any, item.defaultAmount)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    type === item.type
                      ? 'bg-rose-500/10 border-rose-500/80 text-white ring-1 ring-rose-500/30'
                      : 'bg-zinc-950/60 border-zinc-800 text-zinc-300 hover:bg-zinc-800/60 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    {item.icon}
                    <span className="text-xs font-bold text-rose-300 font-mono-numbers">
                      ~${item.defaultAmount}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-zinc-100">{item.title}</div>
                  <div className="text-[10px] text-zinc-400 line-clamp-1">{item.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Amount Quick Chips & Custom Input */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
              Amount to Request ($ USD)
            </label>
            <div className="flex items-center gap-2">
              {[8, 12, 18, 25].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleAmountClick(val)}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer font-mono-numbers ${
                    amount === val
                      ? 'bg-rose-600 text-white border-rose-600 shadow'
                      : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-white'
                  }`}
                >
                  ${val}
                </button>
              ))}
            </div>

            <div className="relative mt-2">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400 font-bold">$</span>
              <input
                type="text"
                value={customAmount}
                onChange={handleCustomChange}
                placeholder="Custom amount"
                className="w-full pl-7 pr-4 py-2 text-sm font-mono-numbers font-semibold bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          {/* Note / Explanation */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
              Note to {person.name}
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Explain what this covers (e.g. Lyft ride so I arrive in 5 mins)"
              className="w-full px-3 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 focus:outline-none focus:border-rose-500 resize-none"
            />
          </div>

          {/* Safety & Transparency Guarantee */}
          <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800 flex items-start gap-2.5 text-xs text-zinc-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-zinc-200 block">Transparent Meetup Agreement</strong>
              {person.name} will be shown the exact request, amount, and note in chat with an option to approve or decline before meeting up.
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={amount <= 0}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-40 rounded-xl shadow-lg shadow-rose-600/20 transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send ${amount.toFixed(2)} Request to {person.name.split(' ')[0]}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
