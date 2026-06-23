'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Building2, Bell, CreditCard, Save, X, CheckCircle, ExternalLink, AlertCircle, Zap, ShieldCheck } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/auth.store';
import toast from 'react-hot-toast';

// ─── Shared helpers ────────────────────────────────────────────────────────

const FALLBACK_PLANS = [
  { tier: 'STARTER',      name: 'Starter',      price: 29,  popular: false, features: ['Up to 100 members', '1 branch', 'Attendance tracking', 'Class scheduling'] },
  { tier: 'PROFESSIONAL', name: 'Professional',  price: 99,  popular: true,  features: ['Up to 1,000 members', '5 branches', 'Stripe payments', 'Advanced analytics'] },
  { tier: 'ENTERPRISE',   name: 'Enterprise',    price: 299, popular: false, features: ['Unlimited members', '100 branches', 'White-label', 'Priority support'] },
];

const INPUT = 'w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white';

function Field({ label, error, children, className = '' }: { label: string; error?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="block text-xs font-medium text-slate-600 mb-1.5">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

// ─── Tab definitions ───────────────────────────────────────────────────────

const TABS = [
  { id: 'profile',       label: 'Profile',      icon: User },
  { id: 'gym',           label: 'Gym Info',      icon: Building2 },
  { id: 'policies',      label: 'Policies',      icon: ShieldCheck },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'billing',       label: 'Billing',       icon: CreditCard },
];

// ─── Form schemas ──────────────────────────────────────────────────────────

const profileSchema = z.object({
  firstName: z.string().min(1),
  lastName:  z.string().min(1),
  email:     z.string().email(),
  phone:     z.string().optional(),
});

const gymSchema = z.object({
  name:    z.string().min(1),
  website: z.string().url().optional().or(z.literal('')),
  phone:   z.string().optional(),
  address: z.string().optional(),
  city:    z.string().optional(),
  country: z.string().optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;
type GymForm     = z.infer<typeof gymSchema>;

// ─── Main component ────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [tab, setTab]             = useState('profile');
  const [stripeModal, setStripeModal] = useState(false);
  const [stripeKey, setStripeKey] = useState('');
  const { user } = useAuthStore();
  const qc = useQueryClient();

  const { data: gymData, refetch: refetchGym } = useQuery({
    queryKey: ['my-gym'],
    queryFn: () => api.get('/gyms/my').then(r => r.data).catch(() => null),
    enabled: tab === 'gym' || tab === 'billing',
  });

  const { data: plans } = useQuery({
    queryKey: ['pricing-plans'],
    queryFn: () => api.get('/gyms/pricing').then(r => r.data),
    enabled: tab === 'billing',
  });

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { firstName: user?.firstName ?? '', lastName: user?.lastName ?? '', email: user?.email ?? '', phone: '' },
  });

  const gymForm = useForm<GymForm>({
    resolver: zodResolver(gymSchema),
    values: gymData ? { name: gymData.name ?? '', website: gymData.website ?? '', phone: gymData.phone ?? '', address: gymData.address ?? '', city: gymData.city ?? '', country: gymData.country ?? '' } : undefined,
  });

  const saveProfile = useMutation({
    mutationFn: (d: ProfileForm) => api.patch(`/users/${user?.id}`, d),
    onSuccess: () => toast.success('Profile saved'),
    onError: () => toast.error('Failed to save'),
  });

  const saveGym = useMutation({
    mutationFn: (d: GymForm) => api.patch('/gyms/my', d),
    onSuccess: () => { toast.success('Gym info saved'); qc.invalidateQueries({ queryKey: ['my-gym'] }); },
    onError: () => toast.error('Failed to save'),
  });

  // ── Stripe Connect ─────────────────────────────────────────────────────
  const connectStripe = async () => {
    try {
      const { data } = await api.get('/gyms/my/stripe-connect/url');
      window.location.href = data.url;
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to start Stripe Connect');
    }
  };

  const disconnectStripe = useMutation({
    mutationFn: () => api.delete('/gyms/my/stripe-connect'),
    onSuccess: () => { toast.success('Stripe disconnected'); refetchGym(); },
    onError: () => toast.error('Failed to disconnect'),
  });

  const isConnected  = !!(gymData as any)?.stripeConnectAccountId;
  const currentPlan  = gymData?.planTier ?? 'STARTER';
  const isTrialing   = gymData?.status === 'TRIAL';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Settings</h2>
        <p className="text-sm text-slate-500 mt-0.5">Manage your account and gym preferences</p>
      </div>

      <div className="flex gap-6 flex-col lg:flex-row">
        {/* Sidebar nav */}
        <nav className="lg:w-48 shrink-0">
          <ul className="space-y-1">
            {TABS.map(({ id, label, icon: Icon }) => (
              <li key={id}>
                <button
                  onClick={() => setTab(id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    tab === id ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Icon size={16} />
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Tab content */}
        <div className="flex-1 min-w-0">

          {/* ── Profile ─────────────────────────────────────────────────── */}
          {tab === 'profile' && (
            <form onSubmit={profileForm.handleSubmit(d => saveProfile.mutate(d))} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-5">
              <h3 className="font-semibold text-slate-800">Personal Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <Field label="First Name" error={profileForm.formState.errors.firstName?.message}>
                  <input {...profileForm.register('firstName')} className={INPUT} />
                </Field>
                <Field label="Last Name" error={profileForm.formState.errors.lastName?.message}>
                  <input {...profileForm.register('lastName')} className={INPUT} />
                </Field>
                <Field label="Email" error={profileForm.formState.errors.email?.message} className="col-span-2">
                  <input {...profileForm.register('email')} type="email" className={INPUT} />
                </Field>
                <Field label="Phone" className="col-span-2">
                  <input {...profileForm.register('phone')} type="tel" className={INPUT} />
                </Field>
              </div>
              <div className="flex justify-end">
                <button type="submit" disabled={saveProfile.isPending} className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
                  <Save size={14} /> {saveProfile.isPending ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}

          {/* ── Gym Info ────────────────────────────────────────────────── */}
          {tab === 'gym' && (
            <form onSubmit={gymForm.handleSubmit(d => saveGym.mutate(d))} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-5">
              <h3 className="font-semibold text-slate-800">Gym Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Gym Name" error={gymForm.formState.errors.name?.message} className="col-span-2">
                  <input {...gymForm.register('name')} className={INPUT} />
                </Field>
                <Field label="Website" error={gymForm.formState.errors.website?.message} className="col-span-2">
                  <input {...gymForm.register('website')} type="url" placeholder="https://" className={INPUT} />
                </Field>
                <Field label="Phone">
                  <input {...gymForm.register('phone')} type="tel" className={INPUT} />
                </Field>
                <Field label="City">
                  <input {...gymForm.register('city')} className={INPUT} />
                </Field>
                <Field label="Address" className="col-span-2">
                  <input {...gymForm.register('address')} className={INPUT} />
                </Field>
                <Field label="Country">
                  <input {...gymForm.register('country')} className={INPUT} />
                </Field>
              </div>
              <div className="flex justify-end">
                <button type="submit" disabled={saveGym.isPending} className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
                  <Save size={14} /> {saveGym.isPending ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}

          {/* ── Policies ────────────────────────────────────────────────── */}
          {tab === 'policies' && <GymPoliciesSection />}

          {/* ── Notifications ───────────────────────────────────────────── */}
          {tab === 'notifications' && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-4">
              <h3 className="font-semibold text-slate-800">Notification Preferences</h3>
              {[
                { label: 'Class reminders',    desc: 'Get notified 1 hour before a booked class',      key: 'classReminders' },
                { label: 'Payment due',         desc: 'Reminder when membership is about to expire',    key: 'paymentDue' },
                { label: 'Promotions & offers', desc: 'News about new plans and special offers',        key: 'promotions' },
                { label: 'Attendance alerts',   desc: 'Confirmation when you check in',                 key: 'attendance' },
              ].map(({ label, desc, key }) => (
                <div key={key} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-slate-700">{label}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-10 h-5 bg-slate-200 peer-checked:bg-indigo-500 rounded-full transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:w-4 after:h-4 after:rounded-full after:transition-transform peer-checked:after:translate-x-5" />
                  </label>
                </div>
              ))}
            </div>
          )}

          {/* ── Billing ─────────────────────────────────────────────────── */}
          {tab === 'billing' && (
            <div className="space-y-6">

              {/* Trial banner */}
              {isTrialing && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
                  <AlertCircle size={18} className="text-amber-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">You&apos;re on a free trial</p>
                    <p className="text-xs text-amber-600 mt-0.5">
                      Trial ends{gymData?.trialEndsAt ? ` on ${new Date(gymData.trialEndsAt).toLocaleDateString()}` : ' soon'}.
                      Subscribe below to keep full access.
                    </p>
                  </div>
                </div>
              )}

              {/* Stripe Connect — for accepting member payments */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-4">
                <div>
                  <h3 className="font-semibold text-slate-800">Stripe Connect</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Connect your Stripe account so your members can pay online for memberships and classes.
                  </p>
                </div>
                {isConnected ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl">
                      <CheckCircle size={16} className="text-green-600" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-green-700">Stripe account connected</p>
                        <p className="text-xs text-green-500 truncate">ID: {(gymData as any)?.stripeConnectAccountId}</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <a href="https://dashboard.stripe.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-500 font-medium">
                        <ExternalLink size={14} /> Open Stripe Dashboard
                      </a>
                      <button onClick={() => disconnectStripe.mutate()} disabled={disconnectStripe.isPending} className="text-sm text-red-500 hover:text-red-400 font-medium disabled:opacity-50">
                        Disconnect
                      </button>
                    </div>
                  </div>
                ) : (
                  <button onClick={connectStripe} className="flex items-center gap-2 bg-[#635BFF] hover:bg-[#4F48CC] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
                    <svg width="16" height="16" viewBox="0 0 32 32" fill="none"><path d="M16 0C7.163 0 0 7.163 0 16s7.163 16 16 16 16-7.163 16-16S24.837 0 16 0z" fill="#fff" fillOpacity=".2"/><path d="M18.227 13.208c0-.724.595-1.002 1.581-1.002 1.41 0 3.192.428 4.603 1.19V9.653c-1.541-.613-3.065-.856-4.603-.856-3.76 0-6.263 1.966-6.263 5.246 0 5.115 7.04 4.296 7.04 6.502 0 .857-.745 1.134-1.784 1.134-1.543 0-3.518-.635-5.08-1.487v3.796c1.73.748 3.474 1.065 5.08 1.065 3.865 0 6.524-1.914 6.524-5.24-.015-5.524-7.098-4.54-7.098-6.605z" fill="#fff"/></svg>
                    Connect with Stripe
                  </button>
                )}
              </div>

              {/* GymFlow Platform Subscription */}
              <OwnerBillingTab
                gymData={gymData}
                plans={plans}
                stripeModal={stripeModal}
                setStripeModal={setStripeModal}
                stripeKey={stripeKey}
                setStripeKey={setStripeKey}
              />
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// ─── Gym Policies Section ──────────────────────────────────────────────────

type CheckKeys   = 'guest' | 'children' | 'allDay' | 'qr' | 'freeze' | 'guestPass' | 'contractRequired';
type BookingKeys = 'advance' | 'cancel' | 'noShow' | 'maxPerWeek';

const ACCESS_RULES: { key: CheckKeys; label: string; desc: string }[] = [
  { key: 'qr',               label: 'QR code check-in required',  desc: 'All members must scan QR code to enter' },
  { key: 'freeze',           label: 'Freeze membership allowed',  desc: 'Allow members to pause their membership' },
  { key: 'guest',            label: 'Guest entry allowed',        desc: 'Allow non-members to enter as guests' },
  { key: 'guestPass',        label: 'Day pass available',         desc: 'Non-members can purchase a day pass' },
  { key: 'children',         label: 'Children allowed',           desc: 'Permit members under 16 with a guardian' },
  { key: 'allDay',           label: '24/7 access',                desc: 'Enable round-the-clock gym access' },
  { key: 'contractRequired', label: 'Contract required',          desc: 'New members must sign a contract' },
];

function GymPoliciesSection() {
  const [saved, setSaved] = useState(false);
  const [checks, setChecks] = useState<Record<CheckKeys, boolean>>({
    guest: false, children: true, allDay: false, qr: true, freeze: true, guestPass: true, contractRequired: false,
  });
  const [booking, setBooking] = useState<Record<BookingKeys, number>>({ advance: 7, cancel: 24, noShow: 5, maxPerWeek: 10 });
  const [texts, setTexts] = useState({
    terms:   'By joining our gym, members agree to follow all gym rules and safety procedures. Memberships are non-transferable.',
    health:  'Members must disclose any health conditions that may affect their ability to exercise safely.',
    refund:  'Membership fees are non-refundable after the first 7 days. Refunds may be issued at management discretion.',
    conduct: 'Members are expected to treat staff and fellow members with respect. Please re-rack weights and clean equipment after use.',
    cancel:  'Members may cancel their membership with 30 days written notice. Early cancellation fees may apply.',
  });
  const save = () => { setSaved(true); toast.success('Policies saved'); setTimeout(() => setSaved(false), 2500); };

  return (
    <div className="space-y-6">
      {/* Access rules */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-4">
        <div>
          <h3 className="font-semibold text-slate-800 flex items-center gap-2"><ShieldCheck size={16} /> Access Rules</h3>
          <p className="text-xs text-slate-500 mt-0.5">Configure who can enter and how access is managed</p>
        </div>
        {ACCESS_RULES.map(({ key, label, desc }) => (
          <div key={key} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
            <div>
              <p className="text-sm font-medium text-slate-700">{label}</p>
              <p className="text-xs text-slate-400">{desc}</p>
            </div>
            <button
              onClick={() => setChecks(c => ({ ...c, [key]: !c[key] }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checks[key] ? 'bg-indigo-500' : 'bg-slate-200'}`}
            >
              <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${checks[key] ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        ))}
      </div>

      {/* Booking rules */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-4">
        <h3 className="font-semibold text-slate-800">Booking Rules</h3>
        <div className="grid grid-cols-2 gap-5">
          {([
            ['advance',    'Max advance booking (days)',   'How many days ahead members can book a class'],
            ['cancel',     'Cancellation window (hours)',  'Min hours before class to cancel without penalty'],
            ['noShow',     'No-show penalty ($)',          'Fee charged for no-shows after cancellation window'],
            ['maxPerWeek', 'Max bookings per week',        'Maximum classes a member can book per week'],
          ] as [BookingKeys, string, string][]).map(([key, label, hint]) => (
            <label key={key} className="block">
              <span className="text-xs font-medium text-slate-600">{label}</span>
              <p className="text-xs text-slate-400 mb-1">{hint}</p>
              <input type="number" value={booking[key]} onChange={e => setBooking(b => ({ ...b, [key]: +e.target.value }))} className={INPUT} />
            </label>
          ))}
        </div>
      </div>

      {/* Policy text */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-5">
        <h3 className="font-semibold text-slate-800">Policy Text</h3>
        {([
          ['terms',   'Membership Terms & Conditions'],
          ['health',  'Health & Safety Policy'],
          ['refund',  'Refund Policy'],
          ['conduct', 'Code of Conduct'],
          ['cancel',  'Cancellation Policy'],
        ] as [keyof typeof texts, string][]).map(([key, label]) => (
          <div key={key}>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">{label}</label>
            <textarea value={texts[key]} onChange={e => setTexts(t => ({ ...t, [key]: e.target.value }))} rows={3} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none" />
          </div>
        ))}
      </div>

      <button onClick={save} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${saved ? 'bg-green-600 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>
        {saved ? '✓ Saved' : 'Save Policies'}
      </button>
    </div>
  );
}

// ─── Owner Billing Tab ─────────────────────────────────────────────────────

const PLAN_META: Record<string, { color: string; badge: string; price: number; features: string[] }> = {
  STARTER:      { color: 'border-sky-200 bg-sky-50',                              badge: 'bg-sky-100 text-sky-700',       price: 29,  features: ['Up to 100 members', '1 branch', 'Attendance & classes', 'Basic reports'] },
  PROFESSIONAL: { color: 'border-purple-300 bg-purple-50 ring-2 ring-purple-200', badge: 'bg-purple-100 text-purple-700', price: 99,  features: ['Up to 1,000 members', '5 branches', 'Stripe payments', 'Advanced analytics', 'Trainer management'] },
  ENTERPRISE:   { color: 'border-indigo-200 bg-indigo-50',                        badge: 'bg-indigo-100 text-indigo-700', price: 299, features: ['Unlimited members', '100 branches', 'White-label', 'Priority support', 'Custom integrations'] },
};

const STATUS_BADGE: Record<string, string> = {
  PAID: 'bg-green-100 text-green-700', PENDING: 'bg-amber-100 text-amber-700',
  FAILED: 'bg-red-100 text-red-700',   REFUNDED: 'bg-purple-100 text-purple-600',
};

function OwnerBillingTab({ gymData, plans, stripeModal, setStripeModal, stripeKey, setStripeKey }: {
  gymData: any; plans: any;
  stripeModal: boolean; setStripeModal: (v: boolean) => void;
  stripeKey: string;    setStripeKey: (v: string) => void;
}) {
  const currentPlan = gymData?.planTier ?? 'STARTER';
  const isTrialing  = gymData?.status === 'TRIAL';

  const { data: invoiceData } = useQuery<{ invoices: any[] }>({
    queryKey: ['saas-invoices'],
    queryFn: () => api.get('/gyms/my/billing/invoices').then(r => r.data),
  });
  const invoices = invoiceData?.invoices ?? [];

  const subscribeToPlan = async (planTier: string) => {
    try {
      const { data } = await api.post('/gyms/my/billing/checkout', { planTier });
      window.location.href = data.url;
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Stripe is not configured');
    }
  };

  const openBillingPortal = async () => {
    try {
      const { data } = await api.post('/gyms/my/billing/portal');
      window.open(data.url, '_blank');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Stripe is not configured');
    }
  };

  const displayPlans = plans ?? FALLBACK_PLANS;

  return (
    <div className="space-y-6">
      {/* Current plan summary */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500 mb-1">GymFlow Platform Subscription</p>
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded-full text-sm font-bold ${PLAN_META[currentPlan]?.badge ?? 'bg-slate-100 text-slate-600'}`}>
              {currentPlan}
            </span>
            {!isTrialing && <span className="text-sm text-slate-600">${PLAN_META[currentPlan]?.price ?? 0}/month</span>}
            {isTrialing  && <span className="text-xs text-amber-600 font-medium">Free trial</span>}
          </div>
        </div>
        {gymData?.stripeSubId && (
          <button onClick={openBillingPortal} className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-500 font-medium border border-indigo-200 px-3 py-1.5 rounded-lg">
            <ExternalLink size={12} /> Manage billing
          </button>
        )}
      </div>

      {/* Plan switcher */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">Change Plan</h3>
          <p className="text-xs text-slate-400">Billed monthly · Cancel anytime</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {displayPlans.map((plan: any) => {
            const meta      = PLAN_META[plan.tier];
            const isCurrent = plan.tier === currentPlan && !isTrialing;
            return (
              <div key={plan.tier} className={`relative border rounded-2xl p-4 flex flex-col gap-3 ${meta?.color ?? 'border-slate-200 bg-white'}`}>
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-xs font-semibold px-3 py-0.5 rounded-full flex items-center gap-1">
                    <Zap size={10} /> Popular
                  </span>
                )}
                <div>
                  <p className="font-semibold text-slate-800">{plan.name}</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">${plan.price}<span className="text-sm font-normal text-slate-500">/mo</span></p>
                </div>
                <ul className="space-y-1.5 flex-1">
                  {plan.features.map((f: string) => (
                    <li key={f} className="flex items-start gap-2 text-xs text-slate-600">
                      <CheckCircle size={12} className="text-green-500 mt-0.5 shrink-0" />{f}
                    </li>
                  ))}
                </ul>
                {isCurrent ? (
                  <span className="w-full text-center text-xs font-semibold text-green-700 bg-green-100 py-2 rounded-xl">✓ Current plan</span>
                ) : (
                  <button onClick={() => subscribeToPlan(plan.tier)} className={`w-full text-sm font-semibold py-2 rounded-xl transition-colors ${plan.popular ? 'bg-indigo-500 hover:bg-indigo-400 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-800'}`}>
                    {isTrialing ? 'Subscribe' : 'Switch plan'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Payment method */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2"><CreditCard size={16} /> Payment Method</h3>
        {gymData?.stripeCustomerId ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-4 border border-slate-200 rounded-xl bg-slate-50">
              <div className="w-10 h-7 bg-gradient-to-r from-slate-700 to-slate-900 rounded-md flex items-center justify-center">
                <span className="text-white text-xs font-bold">CARD</span>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">Credit / Debit card on file</p>
                <p className="text-xs text-slate-400">Managed securely via Stripe</p>
              </div>
            </div>
            <button onClick={openBillingPortal} className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium">
              <ExternalLink size={14} /> Update payment method via Stripe portal
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-slate-500">No payment method on file. Subscribe to a plan to add your payment details.</p>
            <button onClick={() => subscribeToPlan(currentPlan)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
              <CreditCard size={14} /> Add payment method
            </button>
          </div>
        )}
      </div>

      {/* Invoice history */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b">
          <h3 className="font-semibold text-slate-800">Invoice History</h3>
          {gymData?.stripeSubId && (
            <button onClick={openBillingPortal} className="flex items-center gap-1.5 text-xs text-indigo-600 hover:underline font-medium">
              <ExternalLink size={11} /> All invoices
            </button>
          )}
        </div>
        {invoices.length === 0 ? (
          <div className="p-10 text-center text-slate-400">
            <CreditCard size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">No invoices yet.</p>
            <p className="text-xs mt-1">Your subscription invoices will appear here once you subscribe.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
              <tr>
                {['Date', 'Amount', 'Currency', 'Status', 'Receipt'].map(h => (
                  <th key={h} className="text-left px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv: any) => (
                <tr key={inv.id} className="border-t border-slate-100 hover:bg-slate-50/50">
                  <td className="px-5 py-3 text-slate-700">{new Date(inv.createdAt).toLocaleDateString()}</td>
                  <td className="px-5 py-3 font-semibold text-slate-800">${inv.amount.toLocaleString()}</td>
                  <td className="px-5 py-3 text-slate-500">{inv.currency.toUpperCase()}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[inv.status] ?? 'bg-slate-100 text-slate-600'}`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    {inv.stripeInvId ? (
                      <a href={`https://dashboard.stripe.com/invoices/${inv.stripeInvId}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-indigo-600 hover:underline">
                        <ExternalLink size={11} /> View
                      </a>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Stripe Connect Modal (for publishable key) */}
      {stripeModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-slate-800">Connect Stripe</h4>
              <button onClick={() => setStripeModal(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
            </div>
            <p className="text-sm text-slate-500">
              Enter your Stripe Publishable Key from the{' '}
              <a href="https://dashboard.stripe.com/apikeys" target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline">Stripe Dashboard</a>.
            </p>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Stripe Publishable Key</label>
              <input value={stripeKey} onChange={e => setStripeKey(e.target.value)} placeholder="pk_live_..." className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
              <p className="text-xs text-slate-400 mt-1">Only pk_live_ or pk_test_ keys.</p>
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setStripeModal(false)} className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50">Cancel</button>
              <button
                disabled={!stripeKey.startsWith('pk_')}
                onClick={async () => {
                  try { await api.patch('/gyms/my', { stripePublishableKey: stripeKey }); toast.success('Stripe connected!'); setStripeModal(false); } catch { toast.error('Failed'); }
                }}
                className="px-4 py-2 text-sm font-semibold bg-slate-900 disabled:opacity-50 hover:bg-slate-800 text-white rounded-xl transition-colors"
              >
                Connect
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
