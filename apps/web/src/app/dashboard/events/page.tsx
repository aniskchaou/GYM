'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PartyPopper, Plus, QrCode } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function EventsPage() {
  const qc = useQueryClient();
  const [show, setShow] = useState(false);
  const [scan, setScan] = useState('');
  const [form, setForm] = useState<any>({ title: '', description: '', startTime: '', endTime: '', capacity: 50 });

  const list = useQuery({ queryKey: ['gym-events'], queryFn: () => api.get('/gym-events').then((r) => r.data).catch(() => []) });
  const mine = useQuery({ queryKey: ['gym-events-mine'], queryFn: () => api.get('/gym-events/mine').then((r) => r.data).catch(() => []) });

  const create = useMutation({
    mutationFn: () => api.post('/gym-events', form).then((r) => r.data),
    onSuccess: () => { toast.success('Event created'); setShow(false); qc.invalidateQueries({ queryKey: ['gym-events'] }); },
  });
  const register = useMutation({
    mutationFn: (id: string) => api.post(`/gym-events/${id}/register`).then((r) => r.data),
    onSuccess: () => { toast.success('Registered — check your QR'); qc.invalidateQueries({ queryKey: ['gym-events-mine'] }); },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Failed'),
  });
  const cancel = useMutation({
    mutationFn: (id: string) => api.post(`/gym-events/${id}/cancel`).then((r) => r.data),
    onSuccess: () => { toast.success('Cancelled'); qc.invalidateQueries({ queryKey: ['gym-events-mine'] }); },
  });
  const checkInScan = useMutation({
    mutationFn: () => api.post('/gym-events/scan', { qrCode: scan }).then((r) => r.data),
    onSuccess: () => { toast.success('Checked in'); setScan(''); },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Invalid'),
  });

  const events: any[] = list.data ?? [];
  const myEvents: any[] = mine.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gym Events</h1>
          <p className="text-sm text-slate-500">Workshops, competitions, social meetups</p>
        </div>
        <button onClick={() => setShow(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2">
          <Plus size={16} /> New Event
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="font-semibold mb-4 flex items-center gap-2"><QrCode size={16} /> Door check-in</h2>
        <div className="flex gap-2">
          <input value={scan} onChange={(e) => setScan(e.target.value)} placeholder="Scan event QR" className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm" />
          <button onClick={() => checkInScan.mutate()} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm">Check in</button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="font-semibold mb-4">My registrations</h2>
        {myEvents.length === 0 ? <p className="text-sm text-slate-500">Not registered for any event.</p> : (
          <ul className="divide-y divide-slate-100 text-sm">
            {myEvents.map((r: any) => (
              <li key={r.id} className="py-2 flex justify-between items-center">
                <span><b>{r.event?.title}</b> · {new Date(r.event?.startTime).toLocaleString()}</span>
                <span className="flex items-center gap-3">
                  {r.qrCode && <code className="text-xs bg-slate-100 px-2 py-0.5 rounded">{r.qrCode}</code>}
                  <button onClick={() => cancel.mutate(r.eventId)} className="text-xs text-red-600">Cancel</button>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="font-semibold mb-4">Upcoming</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((e) => (
            <div key={e.id} className="border border-slate-200 rounded-lg p-4">
              <div className="font-semibold flex items-center gap-2"><PartyPopper size={16} className="text-pink-500" /> {e.title}</div>
              <p className="text-xs text-slate-500 mt-1">{new Date(e.startTime).toLocaleString()}</p>
              <p className="text-xs mt-1">Capacity: {e.capacity ?? '∞'} · Registered: {e._count?.registrations ?? 0}</p>
              <button onClick={() => register.mutate(e.id)} className="mt-3 w-full bg-indigo-50 text-indigo-700 py-1.5 rounded text-sm hover:bg-indigo-100">
                Register
              </button>
            </div>
          ))}
        </div>
      </div>

      {show && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-3">
            <h2 className="font-semibold">New Event</h2>
            <input placeholder="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
            <textarea placeholder="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
            <label className="text-xs text-slate-500">Start</label>
            <input type="datetime-local" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
            <label className="text-xs text-slate-500">End</label>
            <input type="datetime-local" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
            <input type="number" placeholder="capacity" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShow(false)} className="px-4 py-2 text-sm">Cancel</button>
              <button onClick={() => create.mutate()} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm">Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
