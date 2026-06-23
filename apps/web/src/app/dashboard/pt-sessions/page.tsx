'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ClipboardList, Plus, X, Check, Ban } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/auth.store';
import toast from 'react-hot-toast';

const EMPTY = { trainerId: '', memberId: '', startTime: '', endTime: '', branchId: '', notes: '' };

export default function PtSessionsPage() {
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const [show, setShow] = useState(false);
  const [form, setForm] = useState<any>(EMPTY);

  const isStaff = ['GYM_OWNER', 'BRANCH_MANAGER', 'TRAINER', 'SUPER_ADMIN'].includes(user?.role ?? '');

  const { data: sessions } = useQuery({
    queryKey: ['pt-sessions'],
    queryFn: () => api.get('/pt-sessions').then((r) => r.data),
  });

  const { data: trainers } = useQuery({
    queryKey: ['trainers'],
    queryFn: () => api.get('/trainers').then((r) => r.data),
    enabled: isStaff && show,
  });

  const { data: members } = useQuery({
    queryKey: ['members', { limit: 100 }],
    queryFn: () => api.get('/members', { params: { limit: 100 } }).then((r) => r.data),
    enabled: isStaff && show,
  });

  const { data: branches } = useQuery({
    queryKey: ['branches'],
    queryFn: () => api.get('/branches').then((r) => r.data),
    enabled: isStaff && show,
  });

  const create = useMutation({
    mutationFn: (p: any) => api.post('/pt-sessions', p).then((r) => r.data),
    onSuccess: () => {
      toast.success('Session scheduled');
      qc.invalidateQueries({ queryKey: ['pt-sessions'] });
      setShow(false);
      setForm(EMPTY);
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Failed'),
  });

  const cancel = useMutation({
    mutationFn: (id: string) => api.patch(`/pt-sessions/${id}/cancel`, {}).then((r) => r.data),
    onSuccess: () => { toast.success('Cancelled'); qc.invalidateQueries({ queryKey: ['pt-sessions'] }); },
  });
  const complete = useMutation({
    mutationFn: (id: string) => api.patch(`/pt-sessions/${id}/complete`, {}).then((r) => r.data),
    onSuccess: () => { toast.success('Completed'); qc.invalidateQueries({ queryKey: ['pt-sessions'] }); },
  });

  const rows: any[] = Array.isArray(sessions) ? sessions : sessions?.data ?? [];
  const trainersList: any[] = Array.isArray(trainers) ? trainers : trainers?.data ?? [];
  const membersList: any[] = Array.isArray(members) ? members : members?.data ?? [];
  const branchesList: any[] = Array.isArray(branches) ? branches : branches?.branches ?? branches?.data ?? [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Personal Training Sessions</h1>
          <p className="text-sm text-slate-500">1:1 trainer bookings</p>
        </div>
        {isStaff && (
          <button onClick={() => setShow(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <Plus size={16} /> Schedule
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="text-left px-4 py-3">When</th>
              <th className="text-left px-4 py-3">Trainer</th>
              <th className="text-left px-4 py-3">Member</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-right px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => {
              const tName = s.trainer?.user ? `${s.trainer.user.firstName} ${s.trainer.user.lastName}` : '—';
              const mName = s.member?.user ? `${s.member.user.firstName} ${s.member.user.lastName}` : '—';
              return (
                <tr key={s.id} className="border-t border-slate-100">
                  <td className="px-4 py-3">{new Date(s.startTime).toLocaleString()}</td>
                  <td className="px-4 py-3">{tName}</td>
                  <td className="px-4 py-3">{mName}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      s.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700'
                        : s.status === 'CANCELLED' ? 'bg-red-50 text-red-700'
                          : 'bg-blue-50 text-blue-700'}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    {isStaff && s.status === 'SCHEDULED' && (
                      <>
                        <button onClick={() => complete.mutate(s.id)} className="text-emerald-600 inline-flex items-center gap-1 text-xs"><Check size={14} /> Complete</button>
                        <button onClick={() => cancel.mutate(s.id)} className="text-red-600 inline-flex items-center gap-1 text-xs"><Ban size={14} /> Cancel</button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-slate-500">No sessions</td></tr>}
          </tbody>
        </table>
      </div>

      {show && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h2 className="font-semibold flex items-center gap-2"><ClipboardList size={18} /> Schedule PT Session</h2>
              <button onClick={() => setShow(false)}><X size={18} /></button>
            </div>
            <div className="p-6 space-y-3">
              <select className="w-full border rounded-lg px-3 py-2 text-sm" value={form.trainerId} onChange={(e) => setForm({ ...form, trainerId: e.target.value })}>
                <option value="">Select trainer…</option>
                {trainersList.map((t: any) => {
                  const u = t.user ?? t;
                  return <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>;
                })}
              </select>
              <select className="w-full border rounded-lg px-3 py-2 text-sm" value={form.memberId} onChange={(e) => setForm({ ...form, memberId: e.target.value })}>
                <option value="">Select member…</option>
                {membersList.map((m: any) => <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>)}
              </select>
              <select className="w-full border rounded-lg px-3 py-2 text-sm" value={form.branchId} onChange={(e) => setForm({ ...form, branchId: e.target.value })}>
                <option value="">Select branch…</option>
                {branchesList.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-3">
                <input type="datetime-local" className="border rounded-lg px-3 py-2 text-sm" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
                <input type="datetime-local" className="border rounded-lg px-3 py-2 text-sm" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
              </div>
              <textarea placeholder="Notes (optional)" className="w-full border rounded-lg px-3 py-2 text-sm" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
            <div className="flex justify-end gap-2 px-6 py-4 border-t">
              <button onClick={() => setShow(false)} className="px-4 py-2 text-sm">Cancel</button>
              <button
                onClick={() => {
                  if (!form.trainerId || !form.memberId || !form.startTime || !form.endTime) return toast.error('Fill all required fields');
                  create.mutate(form);
                }}
                disabled={create.isPending}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm"
              >
                {create.isPending ? 'Saving…' : 'Schedule'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
