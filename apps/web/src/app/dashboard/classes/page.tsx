'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, Clock, Users, Dumbbell, Plus, X } from 'lucide-react';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth.store';
import toast from 'react-hot-toast';

const CLASS_CATEGORIES = ['yoga', 'hiit', 'crossfit', 'cycling', 'zumba', 'strength', 'cardio', 'pilates', 'boxing', 'general'];
const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'];
const EMPTY_CLASS = { name: '', description: '', category: 'general', duration: '60', difficulty: '' };

const DAY_COLORS: Record<string, string> = {
  MONDAY: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  TUESDAY: 'bg-blue-50 text-blue-700 border-blue-200',
  WEDNESDAY: 'bg-green-50 text-green-700 border-green-200',
  THURSDAY: 'bg-purple-50 text-purple-700 border-purple-200',
  FRIDAY: 'bg-orange-50 text-orange-700 border-orange-200',
  SATURDAY: 'bg-pink-50 text-pink-700 border-pink-200',
  SUNDAY: 'bg-rose-50 text-rose-700 border-rose-200',
};

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

export default function ClassesPage() {
  const { user } = useAuthStore();
  const isStaff = user && ['GYM_OWNER', 'BRANCH_MANAGER', 'RECEPTIONIST'].includes(user.role);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_CLASS);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['classes'],
    queryFn: () => api.get('/classes').then((r) => r.data),
  });

  const create = useMutation({
    mutationFn: (payload: any) => api.post('/classes', payload).then((r) => r.data),
    onSuccess: () => {
      toast.success('Class created');
      qc.invalidateQueries({ queryKey: ['classes'] });
      setShowModal(false);
      setForm(EMPTY_CLASS);
    },
    onError: (err: any) => toast.error(err?.response?.data?.message ?? 'Failed to create class'),
  });

  const classes: any[] = data?.classes ?? data ?? [];

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl h-24 shadow-sm" />
        ))}
      </div>
    );
  }

  // Group by day of week
  const byDay: Record<string, any[]> = {};
  for (const cls of classes) {
    const schedules: any[] = cls.schedules ?? [];
    for (const sch of schedules) {
      const day = sch.dayOfWeek ?? 'MONDAY';
      if (!byDay[day]) byDay[day] = [];
      byDay[day].push({ ...sch, className: cls.name, trainerName: cls.trainer ? `${cls.trainer.user?.firstName ?? ''} ${cls.trainer.user?.lastName ?? ''}`.trim() : null, capacity: cls.capacity, classId: cls.id });
    }
    if (!schedules.length) {
      if (!byDay['MONDAY']) byDay['MONDAY'] = [];
      byDay['MONDAY'].push({ className: cls.name, startTime: cls.startTime ?? '09:00', endTime: cls.endTime ?? '10:00', trainerName: null, capacity: cls.capacity, currentBookings: 0, classId: cls.id });
    }
  }

  // Fallback: show raw class cards if no schedules
  const hasSchedules = Object.keys(byDay).some((d) => byDay[d].length > 0);

  return (
    <div className="space-y-6">
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-slate-800 text-lg">Add Class</h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-slate-100"><X size={18} /></button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); create.mutate(form); }} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Class Name *</label>
                <input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Morning Yoga" className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-400" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Description</label>
                <textarea rows={2} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-400 resize-none" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Category</label>
                  <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-400 bg-white">
                    {CLASS_CATEGORIES.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Duration (min)</label>
                  <input type="number" min="5" max="300" value={form.duration} onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-400" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Difficulty</label>
                  <select value={form.difficulty} onChange={(e) => setForm((f) => ({ ...f, difficulty: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-400 bg-white">
                    <option value="">Any</option>
                    {DIFFICULTIES.map((d) => <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={create.isPending} className="flex-1 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold disabled:opacity-60">
                  {create.isPending ? 'Creating…' : 'Create Class'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Class Schedule</h2>
          <p className="text-sm text-slate-500 mt-0.5">Weekly timetable for all classes</p>
        </div>
        {isStaff && (
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
            <Plus size={16} /> Add Class
          </button>
        )}
      </div>

      {hasSchedules ? (
        <div className="space-y-6">
          {DAYS.filter((d) => byDay[d]?.length).map((day) => (
            <div key={day}>
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">{day.charAt(0) + day.slice(1).toLowerCase()}</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {byDay[day].map((s, i) => (
                  <ClassCard key={i} schedule={s} colorClass={DAY_COLORS[day]} isStaff={!!isStaff} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.length === 0 ? (
            <div className="col-span-3 text-center py-16 text-slate-400">
              <Calendar size={40} className="mx-auto mb-3 opacity-30" />
              <p>No classes found. Add your first class to get started.</p>
            </div>
          ) : (
            classes.map((cls: any) => (
              <div key={cls.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                    <Dumbbell size={18} className="text-indigo-500" />
                  </div>
                  <span className="text-xs font-medium bg-green-50 text-green-600 px-2 py-1 rounded-full">Active</span>
                </div>
                <h3 className="font-semibold text-slate-800">{cls.name}</h3>
                {cls.description && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{cls.description}</p>}
                <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><Users size={12} /> {cls.capacity ?? '?'} max</span>
                  {cls.duration && <span className="flex items-center gap-1"><Clock size={12} /> {cls.duration} min</span>}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function ClassCard({ schedule, colorClass, isStaff }: { schedule: any; colorClass: string; isStaff: boolean }) {
  const pct = schedule.capacity ? Math.round(((schedule.currentBookings ?? 0) / schedule.capacity) * 100) : 0;

  const fmtTime = (raw: string | undefined) => {
    if (!raw) return '—';
    // Already a short time string like "09:00"
    if (/^\d{1,2}:\d{2}$/.test(raw)) return raw;
    // ISO datetime
    try {
      return new Date(raw).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch { return raw; }
  };

  const timeLabel = `${fmtTime(schedule.startTime)} – ${fmtTime(schedule.endTime)}`;
  return (
    <div className={cn('bg-white rounded-2xl p-5 shadow-sm border hover:shadow-md transition-shadow', colorClass.split(' ').find((c) => c.startsWith('border')) ?? 'border-slate-100')}>
      <div className="flex items-start justify-between mb-3">
        <span className={cn('text-xs font-semibold px-2 py-1 rounded-full border', colorClass)}>{timeLabel}</span>
      </div>
      <h3 className="font-semibold text-slate-800">{schedule.className}</h3>
      {schedule.trainerName && <p className="text-xs text-slate-500 mt-0.5">{schedule.trainerName}</p>}
      {schedule.capacity && (
        <div className="mt-3">
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span className="flex items-center gap-1"><Users size={11} /> {schedule.currentBookings ?? 0}/{schedule.capacity}</span>
            <span>{pct}% full</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5">
            <div className={cn('h-1.5 rounded-full', pct >= 90 ? 'bg-red-400' : pct >= 70 ? 'bg-yellow-400' : 'bg-green-400')} style={{ width: `${pct}%` }} />
          </div>
        </div>
      )}
      {!isStaff && (
        <button className="mt-3 w-full text-center text-xs font-semibold bg-indigo-500 hover:bg-indigo-600 text-white py-1.5 rounded-lg transition-colors">
          Book spot
        </button>
      )}
    </div>
  );
}
