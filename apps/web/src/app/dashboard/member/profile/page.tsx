'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/auth.store';
import { User, Save, Camera, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

const INPUT = 'w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300';

function Field({ label, error, children, className = '' }: { label: string; error?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="block text-xs font-medium text-slate-600 mb-1.5">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

export default function MemberProfilePage() {
  const { user, setAuth, accessToken } = useAuthStore();
  const qc = useQueryClient();
  const [saved, setSaved] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['member-card'],
    queryFn: () => api.get('/members/me/card').then(r => r.data),
  });

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      firstName: user?.firstName ?? '',
      lastName:  user?.lastName  ?? '',
      email:     user?.email     ?? '',
      phone:     '',
      gender:    '',
      dateOfBirth: '',
    },
  });

  const saveMut = useMutation({
    mutationFn: (data: any) => api.patch(`/users/${user?.id}`, data).then(r => r.data),
    onSuccess: (data) => {
      if (user && accessToken) setAuth({ ...user, firstName: data.firstName, lastName: data.lastName }, accessToken, '');
      qc.invalidateQueries({ queryKey: ['member-card'] });
      setSaved(true);
      toast.success('Profile updated');
      setTimeout(() => setSaved(false), 2500);
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to save'),
  });

  const initials = `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`.toUpperCase();

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><User size={22} /> My Profile</h1>
        <p className="text-sm text-slate-500 mt-0.5">View and update your personal information</p>
      </div>

      {/* Avatar + membership card */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white flex items-center gap-5">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold">
            {user?.avatarUrl ? <img src={user.avatarUrl} className="w-20 h-20 rounded-full object-cover" alt="" /> : initials}
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold">{user?.firstName} {user?.lastName}</h2>
          <p className="text-indigo-200 text-sm">{user?.email}</p>
          <div className="flex gap-2 mt-2">
            <span className="text-xs bg-white/20 px-2.5 py-0.5 rounded-full font-medium">MEMBER</span>
            {profile?.memberProfile?.memberNumber && (
              <span className="text-xs bg-white/20 px-2.5 py-0.5 rounded-full font-mono">{profile.memberProfile.memberNumber}</span>
            )}
          </div>
        </div>
      </div>

      {/* Edit form */}
      <form onSubmit={handleSubmit(d => saveMut.mutate(d))} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
        <h2 className="font-semibold text-slate-800">Personal Information</h2>
        <div className="grid grid-cols-2 gap-4">
          <Field label="First Name" error={errors.firstName?.message as string}>
            <input {...register('firstName', { required: 'Required' })} className={INPUT} />
          </Field>
          <Field label="Last Name" error={errors.lastName?.message as string}>
            <input {...register('lastName', { required: 'Required' })} className={INPUT} />
          </Field>
          <Field label="Email" error={errors.email?.message as string} className="col-span-2">
            <input {...register('email', { required: 'Required' })} type="email" className={INPUT} />
          </Field>
          <Field label="Phone">
            <input {...register('phone')} type="tel" placeholder="+1 555-0000" className={INPUT} />
          </Field>
          <Field label="Date of Birth">
            <input {...register('dateOfBirth')} type="date" className={INPUT} />
          </Field>
          <Field label="Gender">
            <select {...register('gender')} className={INPUT + ' bg-white'}>
              <option value="">— Select —</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
              <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
            </select>
          </Field>
        </div>
        <div className="flex justify-end">
          <button type="submit" disabled={saveMut.isPending} className={cn('flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors', saved ? 'bg-green-600 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50')}>
            {saved ? <><CheckCircle size={16} /> Saved!</> : <><Save size={16} /> {saveMut.isPending ? 'Saving…' : 'Save Changes'}</>}
          </button>
        </div>
      </form>

      {/* Fitness goals */}
      {profile?.memberProfile?.fitnessGoals?.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h2 className="font-semibold text-slate-800 mb-3">Fitness Goals</h2>
          <div className="flex flex-wrap gap-2">
            {profile.memberProfile.fitnessGoals.map((g: string) => (
              <span key={g} className="text-sm bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-full border border-indigo-100">{g}</span>
            ))}
          </div>
        </div>
      )}

      {/* QR Code */}
      {profile?.qrCode && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-5">
          <div>
            <h2 className="font-semibold text-slate-800 mb-1">Digital Check-in Card</h2>
            <p className="text-xs text-slate-400 mb-3">Show this QR code at reception to check in</p>
            <p className="font-mono text-sm text-slate-600">Member #: {profile.memberProfile?.memberNumber}</p>
          </div>
          <div className="ml-auto bg-slate-50 rounded-xl p-3 text-center">
            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(profile.qrCode)}`} alt="QR" className="w-28 h-28" />
            <p className="text-xs text-slate-400 mt-1">Tap to enlarge</p>
          </div>
        </div>
      )}
    </div>
  );
}
