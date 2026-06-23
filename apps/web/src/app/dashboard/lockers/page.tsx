'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Lock, LockOpen } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function LockersPage() {
  const qc = useQueryClient();
  const [minutes, setMinutes] = useState(60);

  const lockers = useQuery({
    queryKey: ['lockers'],
    queryFn: () => api.get('/lockers').then((r) => r.data).catch(() => []),
  });
  const mine = useQuery({
    queryKey: ['lockers-mine'],
    queryFn: () => api.get('/lockers/mine').then((r) => r.data).catch(() => []),
  });

  const book = useMutation({
    mutationFn: (lockerId?: string) =>
      api.post('/lockers/book', { lockerId, expectedMinutes: minutes }).then((r) => r.data),
    onSuccess: () => {
      toast.success('Locker booked');
      qc.invalidateQueries({ queryKey: ['lockers'] });
      qc.invalidateQueries({ queryKey: ['lockers-mine'] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Failed'),
  });

  const release = useMutation({
    mutationFn: (bookingId: string) =>
      api.post(`/lockers/${bookingId}/release`).then((r) => r.data),
    onSuccess: () => {
      toast.success('Released');
      qc.invalidateQueries({ queryKey: ['lockers'] });
      qc.invalidateQueries({ queryKey: ['lockers-mine'] });
    },
  });

  const list: any[] = lockers.data ?? [];
  const myList: any[] = mine.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Smart Lockers</h1>
          <p className="text-sm text-slate-500">Book and release lockers in real time</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-600">Duration (min)</label>
          <input
            type="number"
            value={minutes}
            onChange={(e) => setMinutes(Number(e.target.value))}
            className="border border-slate-300 rounded-lg px-2 py-1 text-sm w-20"
          />
          <button
            onClick={() => book.mutate(undefined)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm"
          >
            Auto-assign
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-900 mb-4">My active lockers</h2>
        {myList.length === 0 ? (
          <p className="text-sm text-slate-500">No active locker bookings.</p>
        ) : (
          <ul className="space-y-2">
            {myList.map((b) => (
              <li key={b.id} className="flex justify-between items-center border border-slate-200 rounded-lg px-3 py-2">
                <span className="text-sm">
                  Locker <b>{b.locker?.code ?? b.lockerId}</b> · expires{' '}
                  {b.expectedReleaseAt ? new Date(b.expectedReleaseAt).toLocaleTimeString() : '—'}
                </span>
                <button
                  onClick={() => release.mutate(b.id)}
                  className="text-xs text-red-600 hover:text-red-700 inline-flex items-center gap-1"
                >
                  <LockOpen size={14} /> Release
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-900 mb-4">All lockers</h2>
        {lockers.isLoading ? (
          <p className="text-sm text-slate-500">Loading…</p>
        ) : list.length === 0 ? (
          <p className="text-sm text-slate-500">No lockers configured.</p>
        ) : (
          <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-10 gap-2">
            {list.map((l) => {
              const free = l.status === 'AVAILABLE' || !l.status;
              return (
                <button
                  key={l.id}
                  disabled={!free}
                  onClick={() => book.mutate(l.id)}
                  className={`aspect-square flex flex-col items-center justify-center rounded-lg text-xs font-semibold border ${
                    free
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                      : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Lock size={14} />
                  {l.code ?? l.id.slice(-3)}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
