'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ShieldCheck, Save, Check } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import toast from 'react-hot-toast';

type CheckKeys = 'guest' | 'children' | 'allDay' | 'qr' | 'freeze' | 'guestPass' | 'contractRequired';
type BookingKeys = 'advance' | 'cancel' | 'noShow' | 'maxPerWeek';

const ACCESS_RULES: { key: CheckKeys; label: string; desc: string }[] = [
  { key: 'qr',               label: 'QR code check-in required',    desc: 'All members must scan QR code to enter' },
  { key: 'freeze',           label: 'Freeze membership allowed',    desc: 'Allow members to pause their membership' },
  { key: 'guest',            label: 'Guest entry allowed',          desc: 'Allow non-members to enter as guests' },
  { key: 'guestPass',        label: 'Day pass available',           desc: 'Non-members can purchase a day pass' },
  { key: 'children',         label: 'Children allowed',             desc: 'Permit members under 16 with a guardian' },
  { key: 'allDay',           label: '24/7 access',                  desc: 'Enable round-the-clock gym access' },
  { key: 'contractRequired', label: 'Contract required',            desc: 'New members must sign a physical/digital contract' },
];

const POLICY_TEXTS: { key: string; label: string; default: string }[] = [
  { key: 'terms',   label: 'Membership Terms & Conditions', default: 'By joining our gym, members agree to follow all gym rules and safety procedures. Memberships are non-transferable and may not be shared with another person.' },
  { key: 'health',  label: 'Health & Safety Policy',         default: 'Members must disclose any health conditions that may affect their ability to exercise safely. The gym is not responsible for injuries arising from improper use of equipment.' },
  { key: 'refund',  label: 'Refund Policy',                  default: 'Membership fees are non-refundable after the first 7 days of the billing period. Refunds may be issued at management discretion in exceptional circumstances.' },
  { key: 'conduct', label: 'Code of Conduct',                default: 'Members are expected to treat staff and fellow members with respect. Please re-rack weights, wipe down equipment, and follow all posted gym rules. Inappropriate behavior may result in membership termination.' },
  { key: 'cancellation', label: 'Cancellation Policy',       default: 'Members may cancel their membership with 30 days written notice. Early cancellation fees may apply for members on fixed-term contracts.' },
];

export default function PoliciesPage() {
  const queryClient = useQueryClient();
  const [saved, setSaved] = useState(false);
  const [checks, setChecks] = useState<Record<CheckKeys, boolean>>({
    guest: false, children: true, allDay: false, qr: true, freeze: true,
    guestPass: true, contractRequired: false,
  });
  const [booking, setBooking] = useState<Record<BookingKeys, number>>({ advance: 7, cancel: 24, noShow: 5, maxPerWeek: 10 });
  const [texts, setTexts] = useState<Record<string, string>>(
    Object.fromEntries(POLICY_TEXTS.map(p => [p.key, p.default]))
  );

  const { data: policyResponse, isLoading } = useQuery({
    queryKey: ['gym-policies'],
    queryFn: () => api.get('/gyms/my/policies').then((r) => r.data),
  });

  useEffect(() => {
    const payload = policyResponse?.policies;
    if (!payload) return;

    if (payload.checks && typeof payload.checks === 'object') {
      setChecks((prev) => ({ ...prev, ...payload.checks }));
    }
    if (payload.booking && typeof payload.booking === 'object') {
      setBooking((prev) => ({ ...prev, ...payload.booking }));
    }
    if (payload.texts && typeof payload.texts === 'object') {
      setTexts((prev) => ({ ...prev, ...payload.texts }));
    }
  }, [policyResponse]);

  const saveMutation = useMutation({
    mutationFn: (payload: { checks: Record<CheckKeys, boolean>; booking: Record<BookingKeys, number>; texts: Record<string, string> }) =>
      api.patch('/gyms/my/policies', payload).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gym-policies'] });
      setSaved(true);
      toast.success('Policies saved successfully');
      setTimeout(() => setSaved(false), 2500);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message ?? 'Failed to save policies');
    },
  });

  const handleSave = () => {
    saveMutation.mutate({ checks, booking, texts });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><ShieldCheck size={22} /> Gym Policies</h1>
          <p className="text-sm text-slate-500 mt-0.5">Set access rules, booking limits, and define your policy text</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isLoading || saveMutation.isPending}
          className={cn(
            'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed',
            saved ? 'bg-green-600 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'
          )}
        >
          {saved ? <><Check size={16} /> Saved!</> : <><Save size={16} /> {saveMutation.isPending ? 'Saving...' : 'Save Policies'}</>}
        </button>
      </div>

      {isLoading && (
        <div className="rounded-2xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-700">
          Loading saved policy settings...
        </div>
      )}

      {/* Access control */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h2 className="font-semibold text-slate-800 mb-4">Access & Membership Rules</h2>
        <div className="space-y-0.5">
          {ACCESS_RULES.map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between py-3.5 border-b border-slate-100 last:border-0">
              <div>
                <p className="text-sm font-medium text-slate-700">{label}</p>
                <p className="text-xs text-slate-400">{desc}</p>
              </div>
              <button
                onClick={() => setChecks(c => ({ ...c, [key]: !c[key] }))}
                className={cn('relative inline-flex h-6 w-11 items-center rounded-full transition-colors', checks[key] ? 'bg-indigo-500' : 'bg-slate-200')}
              >
                <span className={cn('inline-block h-4 w-4 rounded-full bg-white shadow transition-transform', checks[key] ? 'translate-x-6' : 'translate-x-1')} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Booking rules */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h2 className="font-semibold text-slate-800 mb-4">Booking Rules</h2>
        <div className="grid grid-cols-2 gap-5">
          {([
            ['advance',    'Max advance booking (days)',   'How many days ahead members can book a class'],
            ['cancel',     'Cancellation window (hours)',  'Min hours before class to cancel without penalty'],
            ['noShow',     'No-show penalty ($)',          'Fee charged for no-shows when cancellation window passed'],
            ['maxPerWeek', 'Max class bookings per week',  'Maximum classes a member can book per week'],
          ] as [BookingKeys, string, string][]).map(([key, label, hint]) => (
            <label key={key} className="block">
              <span className="text-xs font-medium text-slate-600">{label}</span>
              <p className="text-xs text-slate-400 mb-1">{hint}</p>
              <input
                type="number"
                value={booking[key]}
                onChange={e => setBooking(b => ({ ...b, [key]: +e.target.value }))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </label>
          ))}
        </div>
      </div>

      {/* Policy text areas */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
        <h2 className="font-semibold text-slate-800">Policy Text</h2>
        <p className="text-xs text-slate-500 -mt-2">This text is shown to members during registration and on their profile page.</p>
        {POLICY_TEXTS.map(({ key, label }) => (
          <div key={key}>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">{label}</label>
            <textarea
              value={texts[key]}
              onChange={e => setTexts(t => ({ ...t, [key]: e.target.value }))}
              rows={3}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
            />
          </div>
        ))}
      </div>

      {/* Access control link */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 flex items-center justify-between">
        <div>
          <p className="font-medium text-indigo-800">Configure physical access control</p>
          <p className="text-xs text-indigo-600 mt-0.5">Set up QR code scanning, RFID readers, and check-in rules</p>
        </div>
        <Link href="/dashboard/access" className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
          Manage Access →
        </Link>
      </div>
    </div>
  );
}
