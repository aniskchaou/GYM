'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dumbbell, Users, Star, Plus, X } from 'lucide-react';
import api from '@/lib/api';
import { getInitials } from '@/lib/utils';
import toast from 'react-hot-toast';

const EMPTY_TRAINER = { firstName: '', lastName: '', email: '', phone: '', password: '', bio: '', specialties: '' };

function normalizeStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string').map((item) => item.trim()).filter(Boolean);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) {
      return [];
    }

    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.filter((item): item is string => typeof item === 'string').map((item) => item.trim()).filter(Boolean);
      }
    } catch {
      // Fall back to comma-separated values when JSON parsing fails.
    }

    return trimmed.split(',').map((item) => item.trim()).filter(Boolean);
  }

  return [];
}

export default function TrainersPage() {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_TRAINER);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['trainers'],
    queryFn: () => api.get('/trainers').then((r) => r.data),
  });

  const create = useMutation({
    mutationFn: (payload: any) => api.post('/trainers', payload).then((r) => r.data),
    onSuccess: () => {
      toast.success('Trainer added successfully');
      qc.invalidateQueries({ queryKey: ['trainers'] });
      setShowModal(false);
      setForm(EMPTY_TRAINER);
    },
    onError: (err: any) => toast.error(err?.response?.data?.message ?? 'Failed to add trainer'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      specialties: form.specialties ? form.specialties.split(',').map((s) => s.trim()).filter(Boolean) : [],
    };
    create.mutate(payload);
  };

  const trainers: any[] = data?.trainers ?? data ?? [];

  if (isLoading) {
    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse">
        {Array.from({ length: 6 }).map((_, i) => <div key={i} className="bg-white rounded-2xl h-48 shadow-sm" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-slate-800 text-lg">Add Trainer</h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-slate-100"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {(['firstName', 'lastName'] as const).map((k) => (
                  <div key={k}>
                    <label className="block text-xs font-medium text-slate-600 mb-1">{k === 'firstName' ? 'First Name' : 'Last Name'}</label>
                    <input required value={form[k]} onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-400" />
                  </div>
                ))}
              </div>
              {([['email', 'Email', 'email'], ['password', 'Password (leave blank for default)', 'password'], ['phone', 'Phone (optional)', 'tel'], ['bio', 'Bio (optional)', 'text']] as const).map(([k, label, type]) => (
                <div key={k}>
                  <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
                  <input type={type} required={k === 'email'} value={form[k]} onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-400" />
                </div>
              ))}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Specialties (comma-separated)</label>
                <input value={form.specialties} onChange={(e) => setForm((f) => ({ ...f, specialties: e.target.value }))}
                  placeholder="Yoga, HIIT, Strength" className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-400" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={create.isPending} className="flex-1 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold disabled:opacity-60">
                  {create.isPending ? 'Adding…' : 'Add Trainer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Trainers</h2>
          <p className="text-sm text-slate-500 mt-0.5">{trainers.length} trainer{trainers.length !== 1 ? 's' : ''} at this location</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
          <Plus size={16} /> Add Trainer
        </button>
      </div>

      {trainers.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-100">
          <Dumbbell size={40} className="mx-auto mb-3 text-slate-300" />
          <p className="text-slate-500 font-medium">No trainers yet</p>
          <p className="text-slate-400 text-sm mt-1">Add your first trainer to assign classes.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {trainers.map((t: any) => {
            const user = t.user ?? {};
            const name = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || 'Trainer';
            const specialties = normalizeStringArray(t.specialties);
            return (
              <div key={t.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
                    {getInitials(user.firstName ?? name, user.lastName ?? '')}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">{name}</p>
                    <p className="text-xs text-slate-400">{user.email}</p>
                  </div>
                </div>

                {specialties.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {specialties.slice(0, 4).map((s) => (
                      <span key={s} className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">{s}</span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-slate-500 mt-2">
                  <span className="flex items-center gap-1">
                    <Users size={12} /> {t._count?.clients ?? t.clientCount ?? 0} clients
                  </span>
                  <span className="flex items-center gap-1">
                    <Star size={12} className="text-yellow-400" /> {t.rating ? t.rating.toFixed(1) : 'New'}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full font-medium ${t.isActive !== false ? 'bg-green-50 text-green-600' : 'bg-slate-50 text-slate-400'}`}>
                    {t.isActive !== false ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
