'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Wrench, Calendar } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function EquipmentPage() {
  const qc = useQueryClient();
  const [picked, setPicked] = useState<any>(null);
  const [start, setStart] = useState('');
  const [duration, setDuration] = useState(30);

  const list = useQuery({
    queryKey: ['equipment'],
    queryFn: () => api.get('/equipment').then((r) => r.data).catch(() => []),
  });
  const mine = useQuery({
    queryKey: ['equipment-mine'],
    queryFn: () => api.get('/equipment/bookings/mine').then((r) => r.data).catch(() => []),
  });

  const book = useMutation({
    mutationFn: () => api.post('/equipment/bookings', {
      equipmentId: picked.id,
      startTime: new Date(start).toISOString(),
      durationMinutes: duration,
    }).then((r) => r.data),
    onSuccess: (d) => {
      toast.success(d.status === 'WAITLISTED' ? 'Waitlisted' : 'Booked');
      qc.invalidateQueries({ queryKey: ['equipment-mine'] });
      setPicked(null);
      setStart('');
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Failed'),
  });

  const cancel = useMutation({
    mutationFn: (id: string) => api.post(`/equipment/bookings/${id}/cancel`).then((r) => r.data),
    onSuccess: () => {
      toast.success('Cancelled');
      qc.invalidateQueries({ queryKey: ['equipment-mine'] });
    },
  });

  const equipment: any[] = list.data ?? [];
  const myList: any[] = mine.data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Equipment Booking</h1>
        <p className="text-sm text-slate-500">Reserve machines & weights — auto-waitlist on conflict</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-900 mb-4">My bookings</h2>
        {myList.length === 0 ? (
          <p className="text-sm text-slate-500">No bookings yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100 text-sm">
            {myList.map((b) => (
              <li key={b.id} className="py-2 flex justify-between items-center">
                <span>
                  {b.equipment?.name} · {new Date(b.startTime).toLocaleString()} →{' '}
                  {new Date(b.endTime).toLocaleTimeString()}
                </span>
                <span className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    b.status === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-700' :
                    b.status === 'WAITLISTED' ? 'bg-amber-50 text-amber-700' :
                    'bg-slate-100 text-slate-500'
                  }`}>{b.status}</span>
                  <button onClick={() => cancel.mutate(b.id)} className="text-red-600 text-xs">Cancel</button>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-900 mb-4">Available equipment</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {equipment.map((e) => (
            <button
              key={e.id}
              onClick={() => setPicked(e)}
              className={`text-left border rounded-lg p-4 transition ${
                picked?.id === e.id ? 'border-indigo-500 ring-2 ring-indigo-100' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-2 font-medium text-slate-900">
                <Wrench size={16} /> {e.name}
              </div>
              <p className="text-xs text-slate-500 mt-1">{e.category ?? 'General'}</p>
              <p className="text-xs mt-2 text-slate-400">Status: {e.status ?? 'AVAILABLE'}</p>
            </button>
          ))}
        </div>
      </div>

      {picked && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Calendar size={18} /> Book {picked.name}
            </h2>
            <label className="block text-sm text-slate-600 mb-1">Start time</label>
            <input
              type="datetime-local"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm mb-3"
            />
            <label className="block text-sm text-slate-600 mb-1">Duration (min)</label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm mb-4"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setPicked(null)} className="px-4 py-2 text-sm">Cancel</button>
              <button
                disabled={!start}
                onClick={() => book.mutate()}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
              >
                Book
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
