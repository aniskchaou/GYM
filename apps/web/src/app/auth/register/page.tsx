'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Dumbbell, CheckCircle, Eye, EyeOff, ArrowLeft, ArrowRight, MapPin, Star, Users, Search } from 'lucide-react';

interface GymOption {
  id: string; name: string; slug: string; logoUrl: string | null;
  city: string | null; rating: number; reviewCount: number;
  _count: { users: number };
  membershipPlans: { id: string; name: string; price: number; currency: string; durationDays: number; type: string }[];
}

function RegisterForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const apiBaseRaw = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  const API = apiBaseRaw.endsWith('/api/v1')
    ? apiBaseRaw
    : `${apiBaseRaw.replace(/\/$/, '')}/api/v1`;

  const preGymId = searchParams.get('gymId') || '';
  const preGymName = searchParams.get('gymName') || '';
  const preGymSlug = searchParams.get('gymSlug') || '';
  const prePlanId = searchParams.get('planId') || '';
  const prePlanName = searchParams.get('planName') || '';

  const [step, setStep] = useState(preGymId ? 2 : 1);
  const [gyms, setGyms] = useState<GymOption[]>([]);
  const [gymSearch, setGymSearch] = useState('');
  const [loadingGyms, setLoadingGyms] = useState(false);
  const [selectedGym, setSelectedGym] = useState<GymOption | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState(prePlanId);
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '', phone: '', gender: '', dateOfBirth: '' });

  const searchGyms = async (q = '') => {
    setLoadingGyms(true);
    try {
      const params = new URLSearchParams({ limit: '20' });
      if (q) params.set('search', q);
      const res = await fetch(`${API}/gyms/discover?${params}`);
      if (res.ok) { const d = await res.json(); setGyms(d.gyms); }
    } finally { setLoadingGyms(false); }
  };

  const loadGymProfile = async (gymSlug: string) => {
    const res = await fetch(`${API}/gyms/profile/${gymSlug}`);
    if (!res.ok) throw new Error('Failed to load gym details');
    const data = await res.json();
    const normalizedGym: GymOption = {
      ...data,
      _count: data?._count ?? { users: 0 },
      membershipPlans: Array.isArray(data?.membershipPlans) ? data.membershipPlans : [],
    };
    setSelectedGym(normalizedGym);
    return normalizedGym;
  };

  useEffect(() => { if (step === 1) searchGyms(); }, [step]);

  useEffect(() => {
    if (preGymId && preGymSlug) {
      loadGymProfile(preGymSlug)
        .then(() => setStep(2))
        .catch(() => setError('Could not load selected gym'));
    }
  }, []);

  const set = (k: string) => (e: any) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGym) { setError('Please select a gym'); return; }
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return; }
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API}/gyms/register-member`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gymId: selectedGym.id, email: form.email, password: form.password, firstName: form.firstName, lastName: form.lastName, phone: form.phone || undefined, gender: form.gender || undefined, dateOfBirth: form.dateOfBirth || undefined, planId: selectedPlanId || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');
      setDone(true);
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  if (done) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle className="w-8 h-8 text-green-600" /></div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to {selectedGym?.name}!</h2>
        <p className="text-gray-600 mb-6">Your account has been created successfully.{selectedPlanId ? ' Visit the gym reception to activate your membership.' : ''}</p>
        <Link href="/auth/login" className="block w-full bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 font-medium">Sign in to your account</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/discover" className="flex items-center gap-1 text-gray-600 hover:text-gray-900 text-sm"><ArrowLeft className="w-4 h-4" /> Back</Link>
          <div className="flex items-center gap-2"><Dumbbell className="w-5 h-5 text-indigo-600" /><span className="font-bold text-gray-900">GymFlow</span></div>
          <Link href="/auth/login" className="text-sm text-indigo-600 hover:underline">Sign in</Link>
        </div>
      </div>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center mb-8">
          {[1,2,3].map((s, i) => (
            <div key={s} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step > s ? 'bg-green-500 text-white' : step === s ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'}`}>{step > s ? '✓' : s}</div>
              {i < 2 && <div className={`w-16 h-1 mx-1 rounded ${step > s ? 'bg-green-500' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div>
            <h1 className="text-2xl font-bold text-gray-900 text-center mb-1">Choose your gym</h1>
            <p className="text-gray-500 text-center mb-6">Select the gym you want to join</p>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input value={gymSearch} onChange={e => { setGymSearch(e.target.value); searchGyms(e.target.value); }} placeholder="Search gyms by name or city..." className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            {loadingGyms ? <div className="text-center py-8 text-gray-400">Loading gyms...</div> :
             gyms.length === 0 ? <div className="text-center py-8"><p className="text-gray-500">No gyms found</p></div> : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {gyms.map(g => (
                  <button key={g.id} onClick={async () => { setError(''); await loadGymProfile(g.slug); setStep(2); }} className={`w-full text-left p-4 rounded-xl border-2 transition-all hover:border-indigo-400 ${selectedGym?.id === g.id ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 bg-white'}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center overflow-hidden shrink-0">
                        {g.logoUrl ? <img src={g.logoUrl} alt="" className="w-full h-full object-cover" /> : <Dumbbell className="w-6 h-6 text-indigo-400" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900">{g.name}</p>
                        <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                          {g.city && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{g.city}</span>}
                          {g.rating > 0 && <span className="flex items-center gap-1 text-amber-500"><Star className="w-3 h-3 fill-amber-400" />{g.rating.toFixed(1)}</span>}
                          <span className="flex items-center gap-1"><Users className="w-3 h-3" />{g._count.users} members</span>
                        </div>
                      </div>
                      {g.membershipPlans.length > 0 && (
                        <div className="text-right shrink-0"><p className="text-xs text-gray-500">from</p><p className="font-bold text-indigo-600 text-sm">{g.membershipPlans[0].currency} {g.membershipPlans[0].price}</p></div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
            <p className="text-center text-sm text-gray-500 mt-6">Already have an account? <Link href="/auth/login" className="text-indigo-600 hover:underline">Sign in</Link></p>
          </div>
        )}

        {step === 2 && (
          <div>
            <h1 className="text-2xl font-bold text-gray-900 text-center mb-1">Your details</h1>
            <p className="text-gray-500 text-center mb-4">Joining: <span className="text-indigo-600 font-medium">{selectedGym?.name || preGymName}</span></p>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">First name *</label><input value={form.firstName} onChange={set('firstName')} required className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Last name *</label><input value={form.lastName} onChange={set('lastName')} required className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" /></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Email *</label><input type="email" value={form.email} onChange={set('email')} required className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Phone</label><input type="tel" value={form.phone} onChange={set('phone')} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Gender</label><select value={form.gender} onChange={set('gender')} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"><option value="">Prefer not to say</option><option value="MALE">Male</option><option value="FEMALE">Female</option><option value="OTHER">Other</option></select></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Date of birth</label><input type="date" value={form.dateOfBirth} onChange={set('dateOfBirth')} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" /></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Password *</label><div className="relative"><input type={showPw ? 'text' : 'password'} value={form.password} onChange={set('password')} required minLength={8} className="w-full px-3 py-2.5 pr-10 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" /><button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button></div></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Confirm password *</label><input type="password" value={form.confirmPassword} onChange={set('confirmPassword')} required className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" /></div>
            </div>
            {error && <p className="text-red-500 text-sm mt-3 text-center">{error}</p>}
            <div className="flex gap-3 mt-4">
              {!preGymId && <button onClick={() => setStep(1)} className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50"><ArrowLeft className="w-4 h-4" /> Back</button>}
              <button onClick={() => { if (!form.firstName || !form.lastName || !form.email || !form.password) { setError('Please fill in all required fields'); return; } setError(''); setStep(3); }} className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 font-medium">Continue <ArrowRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}

        {step === 3 && (
          <form onSubmit={handleSubmit}>
            <h1 className="text-2xl font-bold text-gray-900 text-center mb-1">Choose a plan</h1>
            <p className="text-gray-500 text-center mb-6">Optional — you can also choose at the gym</p>
            <div className="space-y-3 mb-6">
              <button type="button" onClick={() => setSelectedPlanId('')} className={`w-full p-4 rounded-xl border-2 text-left transition-all ${!selectedPlanId ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                <p className="font-semibold text-gray-900">No plan yet</p><p className="text-sm text-gray-500">I will choose a plan at the gym</p>
              </button>
              {(selectedGym?.membershipPlans || []).map(plan => (
                <button key={plan.id} type="button" onClick={() => setSelectedPlanId(plan.id)} className={`w-full p-4 rounded-xl border-2 text-left transition-all ${selectedPlanId === plan.id ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                  <div className="flex items-center justify-between"><div><p className="font-semibold text-gray-900">{plan.name}</p><p className="text-sm text-gray-500 capitalize">{plan.type.replace('_',' ').toLowerCase()} · {plan.durationDays} days</p></div><p className="font-bold text-indigo-600">{plan.currency} {plan.price}</p></div>
                </button>
              ))}
            </div>
            {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(2)} className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50"><ArrowLeft className="w-4 h-4" /> Back</button>
              <button type="submit" disabled={loading} className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 font-medium disabled:opacity-50">{loading ? 'Creating account...' : 'Create account'}{!loading && <CheckCircle className="w-4 h-4" />}</button>
            </div>
            <p className="text-center text-xs text-gray-500 mt-4">By registering you agree to the gym terms and conditions</p>
          </form>
        )}
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" /></div>}>
      <RegisterForm />
    </Suspense>
  );
}
