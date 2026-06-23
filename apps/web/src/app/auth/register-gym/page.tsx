'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Dumbbell, Loader2, CheckCircle, ChevronRight, ChevronLeft, Zap } from 'lucide-react';
import api from '@/lib/api';

const PLANS = [
  {
    tier: 'STARTER',
    name: 'Starter',
    price: 29,
    popular: false,
    features: ['Up to 100 members', '1 branch', 'Attendance tracking', 'Class scheduling', 'Basic reports'],
  },
  {
    tier: 'PROFESSIONAL',
    name: 'Professional',
    price: 99,
    popular: true,
    features: ['Up to 1,000 members', '5 branches', 'All Starter features', 'Advanced analytics', 'Stripe payments', 'Trainer management'],
  },
  {
    tier: 'ENTERPRISE',
    name: 'Enterprise',
    price: 299,
    popular: false,
    features: ['Unlimited members', '100 branches', 'All Professional features', 'White-label', 'Priority support', 'Custom integrations'],
  },
];

const gymSchema = z.object({
  gymName: z.string().min(2, 'Gym name must be at least 2 characters'),
  slug: z.string().min(3).regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, hyphens'),
  gymEmail: z.string().email('Invalid gym email'),
});

const ownerSchema = z.object({
  ownerFirstName: z.string().min(1, 'Required'),
  ownerLastName: z.string().min(1, 'Required'),
  ownerEmail: z.string().email('Invalid email'),
  ownerPassword: z.string().min(8, 'At least 8 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.ownerPassword === d.confirmPassword, {
  message: 'Passwords do not match', path: ['confirmPassword'],
});

type GymForm = z.infer<typeof gymSchema>;
type OwnerForm = z.infer<typeof ownerSchema>;

export default function RegisterGymPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [gymData, setGymData] = useState<GymForm | null>(null);
  const [ownerData, setOwnerData] = useState<OwnerForm | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string>('PROFESSIONAL');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const gymForm = useForm<GymForm>({
    resolver: zodResolver(gymSchema),
    defaultValues: gymData ?? {},
  });

  const ownerForm = useForm<OwnerForm>({
    resolver: zodResolver(ownerSchema),
    defaultValues: ownerData ?? {},
  });

  const handleGymNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    gymForm.setValue('gymName', name);
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    gymForm.setValue('slug', slug);
  };

  const onGymSubmit = (d: GymForm) => { setGymData(d); setStep(2); };
  const onOwnerSubmit = (d: OwnerForm) => { setOwnerData(d); setStep(3); };

  const submit = async () => {
    if (!gymData || !ownerData) return;
    setSubmitting(true);
    try {
      await api.post('/gyms/register', {
        name: gymData.gymName,
        slug: gymData.slug,
        email: gymData.gymEmail,
        ownerEmail: ownerData.ownerEmail,
        ownerFirstName: ownerData.ownerFirstName,
        ownerLastName: ownerData.ownerLastName,
        ownerPassword: ownerData.ownerPassword,
        planTier: selectedPlan,
      });
      setDone(true);
      toast.success('Gym registered! Sign in to start your trial.');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  const INPUT = 'w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500';
  const LABEL = 'block text-sm font-medium text-slate-300 mb-1.5';
  const ERROR = 'text-red-400 text-xs mt-1';

  if (done) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 rounded-2xl p-10 shadow-xl border border-slate-700 text-center max-w-md w-full">
          <CheckCircle size={48} className="text-green-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">You're all set!</h2>
          <p className="text-slate-400 text-sm mb-1">
            Your 14-day free trial has started on the{' '}
            <span className="text-indigo-400 font-medium">
              {PLANS.find((p) => p.tier === selectedPlan)?.name}
            </span>{' '}
            plan.
          </p>
          <p className="text-slate-400 text-sm mb-6">Sign in with your owner account to get started.</p>
          <Link
            href="/auth/login"
            className="inline-block bg-indigo-500 hover:bg-indigo-400 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors"
          >
            Go to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="bg-indigo-500 p-2 rounded-xl">
            <Dumbbell size={24} className="text-white" />
          </div>
          <span className="text-2xl font-bold text-white">GymFlow</span>
        </div>

        {/* Step progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                step > s ? 'bg-green-500 text-white' : step === s ? 'bg-indigo-500 text-white' : 'bg-slate-700 text-slate-400'
              }`}>
                {step > s ? <CheckCircle size={16} /> : s}
              </div>
              <span className={`text-xs font-medium ${step >= s ? 'text-slate-200' : 'text-slate-500'}`}>
                {['Gym Details', 'Your Account', 'Choose Plan'][s - 1]}
              </span>
              {s < 3 && <div className="w-8 h-px bg-slate-600 mx-1" />}
            </div>
          ))}
        </div>

        <div className="bg-slate-800 rounded-2xl p-8 shadow-xl border border-slate-700">
          {/* â”€ Step 1: Gym details â”€ */}
          {step === 1 && (
            <form onSubmit={gymForm.handleSubmit(onGymSubmit)} className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-white">Tell us about your gym</h2>
                <p className="text-slate-400 text-sm mt-1">This info will appear on your member-facing pages.</p>
              </div>
              <div>
                <label className={LABEL}>Gym Name</label>
                <input {...gymForm.register('gymName')} onChange={handleGymNameChange} placeholder="Iron Paradise Gym" className={INPUT} />
                {gymForm.formState.errors.gymName && <p className={ERROR}>{gymForm.formState.errors.gymName.message}</p>}
              </div>
              <div>
                <label className={LABEL}>
                  URL Slug{' '}
                  <span className="text-slate-500 font-normal">
                    (gymflow.app/<span className="text-indigo-400">{gymForm.watch('slug') || 'your-gym'}</span>)
                  </span>
                </label>
                <input {...gymForm.register('slug')} placeholder="iron-paradise" className={INPUT} />
                {gymForm.formState.errors.slug && <p className={ERROR}>{gymForm.formState.errors.slug.message}</p>}
              </div>
              <div>
                <label className={LABEL}>Gym Email</label>
                <input {...gymForm.register('gymEmail')} type="email" placeholder="info@yourgym.com" className={INPUT} />
                {gymForm.formState.errors.gymEmail && <p className={ERROR}>{gymForm.formState.errors.gymEmail.message}</p>}
              </div>
              <button type="submit" className="w-full flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white font-semibold py-2.5 rounded-xl transition-colors">
                Continue <ChevronRight size={16} />
              </button>
            </form>
          )}

          {/* â”€ Step 2: Owner account â”€ */}
          {step === 2 && (
            <form onSubmit={ownerForm.handleSubmit(onOwnerSubmit)} className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-white">Create your owner account</h2>
                <p className="text-slate-400 text-sm mt-1">You'll use these credentials to sign in and manage your gym.</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={LABEL}>First Name</label>
                  <input {...ownerForm.register('ownerFirstName')} placeholder="John" className={INPUT} />
                  {ownerForm.formState.errors.ownerFirstName && <p className={ERROR}>{ownerForm.formState.errors.ownerFirstName.message}</p>}
                </div>
                <div>
                  <label className={LABEL}>Last Name</label>
                  <input {...ownerForm.register('ownerLastName')} placeholder="Doe" className={INPUT} />
                  {ownerForm.formState.errors.ownerLastName && <p className={ERROR}>{ownerForm.formState.errors.ownerLastName.message}</p>}
                </div>
              </div>
              <div>
                <label className={LABEL}>Email Address</label>
                <input {...ownerForm.register('ownerEmail')} type="email" placeholder="you@example.com" className={INPUT} />
                {ownerForm.formState.errors.ownerEmail && <p className={ERROR}>{ownerForm.formState.errors.ownerEmail.message}</p>}
              </div>
              <div>
                <label className={LABEL}>Password</label>
                <input {...ownerForm.register('ownerPassword')} type="password" placeholder="At least 8 characters" className={INPUT} />
                {ownerForm.formState.errors.ownerPassword && <p className={ERROR}>{ownerForm.formState.errors.ownerPassword.message}</p>}
              </div>
              <div>
                <label className={LABEL}>Confirm Password</label>
                <input {...ownerForm.register('confirmPassword')} type="password" placeholder="Repeat password" className={INPUT} />
                {ownerForm.formState.errors.confirmPassword && <p className={ERROR}>{ownerForm.formState.errors.confirmPassword.message}</p>}
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)} className="flex items-center gap-1.5 px-4 py-2.5 text-sm text-slate-400 border border-slate-600 rounded-xl hover:bg-slate-700 transition-colors">
                  <ChevronLeft size={16} /> Back
                </button>
                <button type="submit" className="flex-1 flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white font-semibold py-2.5 rounded-xl transition-colors">
                  Continue <ChevronRight size={16} />
                </button>
              </div>
            </form>
          )}

          {/* â”€ Step 3: Plan selection â”€ */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-white">Choose your plan</h2>
                <p className="text-slate-400 text-sm mt-1">All plans include a 14-day free trial. No credit card required to start.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {PLANS.map((plan) => (
                  <button
                    key={plan.tier}
                    type="button"
                    onClick={() => setSelectedPlan(plan.tier)}
                    className={`relative text-left border rounded-2xl p-4 transition-all ${
                      selectedPlan === plan.tier
                        ? 'border-indigo-500 bg-indigo-500/10 ring-2 ring-indigo-500/40'
                        : 'border-slate-600 bg-slate-700/50 hover:border-slate-500'
                    }`}
                  >
                    {plan.popular && (
                      <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <Zap size={9} /> Popular
                      </span>
                    )}
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-white">{plan.name}</span>
                      {selectedPlan === plan.tier && <CheckCircle size={16} className="text-indigo-400" />}
                    </div>
                    <p className="text-2xl font-bold text-white mb-3">
                      ${plan.price}<span className="text-sm font-normal text-slate-400">/mo</span>
                    </p>
                    <ul className="space-y-1">
                      {plan.features.slice(0, 3).map((f) => (
                        <li key={f} className="flex items-center gap-1.5 text-xs text-slate-300">
                          <CheckCircle size={10} className="text-green-400 shrink-0" /> {f}
                        </li>
                      ))}
                    </ul>
                  </button>
                ))}
              </div>

              <p className="text-xs text-center text-slate-500">
                You won't be charged until your 14-day trial ends. Cancel anytime.
              </p>

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(2)} className="flex items-center gap-1.5 px-4 py-2.5 text-sm text-slate-400 border border-slate-600 rounded-xl hover:bg-slate-700 transition-colors">
                  <ChevronLeft size={16} /> Back
                </button>
                <button
                  onClick={submit}
                  disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-400 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl transition-colors"
                >
                  {submitting && <Loader2 size={16} className="animate-spin" />}
                  Start 14-Day Free Trial
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-slate-400 text-sm mt-6">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-indigo-400 hover:text-indigo-300 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
