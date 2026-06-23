'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import {
  Building2, Plus, Search, Edit2, Trash2, X, Check,
  Globe, Users, ChevronDown,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

interface Gym {
  id: string; name: string; slug: string; email: string; phone?: string;
  city?: string; country?: string; status: string; planTier: string;
  platformCommissionRate: number; address?: string;
  _count: { users: number; branches: number };
  createdAt: string;
}

const STATUS_OPTS = ['ACTIVE', 'TRIAL', 'SUSPENDED', 'CANCELLED'];
const PLAN_OPTS   = ['STARTER', 'PROFESSIONAL', 'ENTERPRISE'];

function Badge({ v, type }: { v: string; type: 'status' | 'plan' }) {
  const s = type === 'status'
    ? { ACTIVE: 'bg-green-100 text-green-700', TRIAL: 'bg-yellow-100 text-yellow-700', SUSPENDED: 'bg-red-100 text-red-700', CANCELLED: 'bg-slate-100 text-slate-500' }[v]
    : { STARTER: 'bg-sky-100 text-sky-700', PROFESSIONAL: 'bg-purple-100 text-purple-700', ENTERPRISE: 'bg-indigo-100 text-indigo-700' }[v];
  return <span className={cn('px-2 py-0.5 rounded text-xs font-semibold', s ?? 'bg-slate-100 text-slate-500')}>{v}</span>;
}

const EMPTY_FORM = { name: '', slug: '', email: '', ownerEmail: '', ownerFirstName: '', ownerLastName: '', ownerPassword: '', planTier: 'STARTER', city: '', country: '', phone: '', address: '' };

export default function SAGymsPage() {
  const qc = useQueryClient();
  const [search, setSearch]         = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editGym, setEditGym]       = useState<Gym | null>(null);
  const [form, setForm]             = useState({ ...EMPTY_FORM });
  const [editForm, setEditForm]     = useState<any>({});
  const [delId, setDelId]           = useState<string | null>(null);

  const { data, isLoading } = useQuery<Gym[]>({
    queryKey: ['sa-gyms-full'],
    queryFn: () => api.get('/gyms').then(r => r.data),
  });

  const createMut = useMutation({
    mutationFn: (dto: any) => api.post('/gyms', dto).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['sa-gyms-full'] }); qc.invalidateQueries({ queryKey: ['sa-gyms'] }); toast.success('Gym created'); setShowCreate(false); setForm({ ...EMPTY_FORM }); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to create gym'),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, ...dto }: any) => api.patch(`/gyms/${id}`, dto).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['sa-gyms-full'] }); qc.invalidateQueries({ queryKey: ['sa-gyms'] }); toast.success('Gym updated'); setEditGym(null); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed'),
  });

  const statusMut = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => api.patch(`/gyms/${id}`, { status }).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['sa-gyms-full'] }); qc.invalidateQueries({ queryKey: ['sa-gyms'] }); toast.success('Status updated'); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed'),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => api.delete(`/gyms/${id}`).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['sa-gyms-full'] }); qc.invalidateQueries({ queryKey: ['sa-gyms'] }); toast.success('Gym deleted'); setDelId(null); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to delete'),
  });

  const gyms = (data ?? []).filter(g =>
    !search || g.name.toLowerCase().includes(search.toLowerCase()) ||
    g.email.toLowerCase().includes(search.toLowerCase()) ||
    (g.city ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const openEdit = (g: Gym) => { setEditGym(g); setEditForm({ name: g.name, email: g.email, phone: g.phone ?? '', city: g.city ?? '', country: g.country ?? '', address: g.address ?? '', status: g.status, planTier: g.planTier }); };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><Building2 size={22} /> Gym Organizations</h1>
          <p className="text-sm text-slate-500 mt-0.5">Create, edit, and manage all gym tenants</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
          <Plus size={16} /> Add Gym
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search gyms…" className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-indigo-500" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wide">
            <tr>
              {['Gym', 'City', 'Status', 'Plan', 'Members / Branches', 'Commission', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={7} className="p-6 text-center text-slate-500">Loading…</td></tr>}
            {!isLoading && gyms.length === 0 && <tr><td colSpan={7} className="p-6 text-center text-slate-500">No gyms found</td></tr>}
            {gyms.map(g => (
              <tr key={g.id} className="border-t border-slate-100 hover:bg-slate-50/50 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-semibold text-slate-800">{g.name}</p>
                  <p className="text-xs text-slate-400">{g.email}</p>
                  <p className="text-xs text-slate-400 font-mono">/{g.slug}</p>
                </td>
                <td className="px-4 py-3 text-slate-600">{g.city ?? '—'}</td>
                <td className="px-4 py-3">
                  <select value={g.status} onChange={e => statusMut.mutate({ id: g.id, status: e.target.value })} className="text-xs border rounded px-1 py-0.5 bg-transparent focus:outline-none">
                    {STATUS_OPTS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </td>
                <td className="px-4 py-3"><Badge v={g.planTier} type="plan" /></td>
                <td className="px-4 py-3">
                  <span className="flex items-center gap-1 text-slate-600"><Users size={13} />{g._count.users}</span>
                  <span className="flex items-center gap-1 text-slate-400 text-xs"><Globe size={11} />{g._count.branches} branch{g._count.branches !== 1 ? 'es' : ''}</span>
                </td>
                <td className="px-4 py-3 text-slate-600">{g.platformCommissionRate ?? 20}%</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEdit(g)} className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-indigo-600" title="Edit"><Edit2 size={14} /></button>
                    <button onClick={() => setDelId(g.id)} className="p-1.5 hover:bg-red-50 rounded text-slate-500 hover:text-red-600" title="Delete"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="font-bold text-lg text-slate-800">Create New Gym</h2>
              <button onClick={() => setShowCreate(false)}><X size={20} className="text-slate-400 hover:text-slate-700" /></button>
            </div>
            <form onSubmit={e => { e.preventDefault(); createMut.mutate(form); }} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[['Gym Name', 'name', 'text'], ['Slug', 'slug', 'text'], ['Gym Email', 'email', 'email'], ['Phone', 'phone', 'tel'], ['City', 'city', 'text'], ['Country', 'country', 'text']].map(([label, key, type]) => (
                  <label key={key} className="block">
                    <span className="text-xs font-medium text-slate-600">{label}</span>
                    <input type={type} required={['name','slug','email'].includes(key)} value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} className="mt-0.5 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </label>
                ))}
              </div>
              <label className="block">
                <span className="text-xs font-medium text-slate-600">Plan</span>
                <select value={form.planTier} onChange={e => setForm(f => ({ ...f, planTier: e.target.value }))} className="mt-0.5 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  {PLAN_OPTS.map(p => <option key={p}>{p}</option>)}
                </select>
              </label>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide pt-1">Owner Account</p>
              <div className="grid grid-cols-2 gap-3">
                {[['First Name', 'ownerFirstName'], ['Last Name', 'ownerLastName'], ['Owner Email', 'ownerEmail'], ['Password', 'ownerPassword']].map(([label, key]) => (
                  <label key={key} className="block">
                    <span className="text-xs font-medium text-slate-600">{label}</span>
                    <input type={key === 'ownerPassword' ? 'password' : key.includes('Email') ? 'email' : 'text'} required value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} className="mt-0.5 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </label>
                ))}
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCreate(false)} className="flex-1 border border-slate-200 rounded-lg py-2 text-sm text-slate-700 hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={createMut.isPending} className="flex-1 bg-indigo-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">{createMut.isPending ? 'Creating…' : 'Create Gym'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editGym && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="font-bold text-lg text-slate-800">Edit — {editGym.name}</h2>
              <button onClick={() => setEditGym(null)}><X size={20} className="text-slate-400 hover:text-slate-700" /></button>
            </div>
            <form onSubmit={e => { e.preventDefault(); updateMut.mutate({ id: editGym.id, ...editForm }); }} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[['Name', 'name'], ['Email', 'email'], ['Phone', 'phone'], ['City', 'city'], ['Country', 'country'], ['Address', 'address']].map(([label, key]) => (
                  <label key={key} className="block">
                    <span className="text-xs font-medium text-slate-600">{label}</span>
                    <input value={editForm[key] ?? ''} onChange={e => setEditForm((f: any) => ({ ...f, [key]: e.target.value }))} className="mt-0.5 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </label>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-xs font-medium text-slate-600">Status</span>
                  <select value={editForm.status} onChange={e => setEditForm((f: any) => ({ ...f, status: e.target.value }))} className="mt-0.5 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
                    {STATUS_OPTS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="text-xs font-medium text-slate-600">Plan</span>
                  <select value={editForm.planTier} onChange={e => setEditForm((f: any) => ({ ...f, planTier: e.target.value }))} className="mt-0.5 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
                    {PLAN_OPTS.map(p => <option key={p}>{p}</option>)}
                  </select>
                </label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditGym(null)} className="flex-1 border border-slate-200 rounded-lg py-2 text-sm text-slate-700 hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={updateMut.isPending} className="flex-1 bg-indigo-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">{updateMut.isPending ? 'Saving…' : 'Save Changes'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {delId && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 size={22} className="text-red-600" /></div>
            <h2 className="font-bold text-lg text-slate-800 mb-2">Delete Gym?</h2>
            <p className="text-sm text-slate-500 mb-6">This will permanently delete the gym and all its data. This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDelId(null)} className="flex-1 border border-slate-200 rounded-lg py-2 text-sm hover:bg-slate-50">Cancel</button>
              <button onClick={() => deleteMut.mutate(delId!)} disabled={deleteMut.isPending} className="flex-1 bg-red-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-red-700 disabled:opacity-50">{deleteMut.isPending ? 'Deleting…' : 'Delete'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
