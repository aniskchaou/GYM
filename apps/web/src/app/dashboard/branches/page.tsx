'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Building2, Users, Activity, MapPin, Plus, X } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const EMPTY_BRANCH = { name: '', address: '', city: '', phone: '', email: '', capacity: '' };

export default function BranchesPage() {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_BRANCH);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['branches'],
    queryFn: () => api.get('/branches').then((r) => r.data),
  });

  const create = useMutation({
    mutationFn: (payload: any) => api.post('/branches', payload).then((r) => r.data),
    onSuccess: () => {
      toast.success('Branch created');
      qc.invalidateQueries({ queryKey: ['branches'] });
      setShowModal(false);
      setForm(EMPTY_BRANCH);
    },
    onError: (err: any) => toast.error(err?.response?.data?.message ?? 'Failed to create branch'),
  });

  const branches: any[] = data?.branches ?? data ?? [];

  if (isLoading) {
    return (
      <div className="grid sm:grid-cols-2 gap-5 animate-pulse">
        {Array.from({ length: 4 }).map((_, i) => <div key={i} className="bg-white rounded-2xl h-52 shadow-sm" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-slate-800 text-lg">Add Branch</h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-slate-100"><X size={18} /></button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); create.mutate(form); }} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Branch Name *</label>
                <input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Downtown Branch" className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-400" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Address</label>
                  <input value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-400" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">City</label>
                  <input value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-400" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Phone</label>
                  <input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-400" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Email</label>
                  <input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-400" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Capacity</label>
                <input type="number" min="1" value={form.capacity} onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))}
                  placeholder="100" className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-400" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={create.isPending} className="flex-1 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold disabled:opacity-60">
                  {create.isPending ? 'Creating…' : 'Create Branch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Branches</h2>
          <p className="text-sm text-slate-500 mt-0.5">{branches.length} location{branches.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
          <Plus size={16} /> Add Branch
        </button>
      </div>

      {branches.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-100">
          <Building2 size={40} className="mx-auto mb-3 text-slate-300" />
          <p className="text-slate-500 font-medium">No branches yet</p>
          <p className="text-slate-400 text-sm mt-1">Add your first branch location to get started.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-5">
          {branches.map((b: any) => (
            <div key={b.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                    <Building2 size={18} className="text-indigo-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">{b.name}</h3>
                    {b.isMain && <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full font-medium">Main</span>}
                  </div>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${b.isActive !== false ? 'bg-green-50 text-green-600' : 'bg-slate-50 text-slate-400'}`}>
                  {b.isActive !== false ? 'Active' : 'Inactive'}
                </span>
              </div>

              {(b.address || b.city) && (
                <p className="text-sm text-slate-500 flex items-center gap-1.5 mb-4">
                  <MapPin size={13} className="text-slate-400" />
                  {[b.address, b.city, b.state].filter(Boolean).join(', ')}
                </p>
              )}

              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-50">
                <div className="text-center">
                  <p className="text-lg font-bold text-slate-900">{b._count?.members ?? b.memberCount ?? '—'}</p>
                  <p className="text-xs text-slate-400 flex items-center justify-center gap-1"><Users size={10} /> Members</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-slate-900">{b._count?.classes ?? b.classCount ?? '—'}</p>
                  <p className="text-xs text-slate-400 flex items-center justify-center gap-1"><Activity size={10} /> Classes</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-slate-900">{b.capacity ?? '—'}</p>
                  <p className="text-xs text-slate-400">Capacity</p>
                </div>
              </div>

              {b.phone && (
                <p className="text-xs text-slate-400 mt-3">{b.phone}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
