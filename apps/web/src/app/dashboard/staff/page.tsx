'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Users, Plus, Search, Edit2, Trash2, X, Mail, Phone, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

const STAFF_ROLES = ['BRANCH_MANAGER', 'RECEPTIONIST', 'TRAINER'];
const ROLE_LABEL: Record<string, string> = {
  BRANCH_MANAGER: 'Branch Manager', RECEPTIONIST: 'Receptionist', TRAINER: 'Trainer',
};
const ROLE_COLOR: Record<string, string> = {
  BRANCH_MANAGER: 'bg-purple-100 text-purple-700',
  RECEPTIONIST:   'bg-sky-100    text-sky-700',
  TRAINER:        'bg-amber-100  text-amber-700',
};

const EMPTY = { firstName: '', lastName: '', email: '', phone: '', role: 'RECEPTIONIST', password: '', branchId: '' };

function getInitials(f?: string, l?: string) { return `${(f ?? '?')[0]}${(l ?? '')[0] ?? ''}`.toUpperCase(); }

export default function StaffPage() {
  const qc = useQueryClient();
  const [search, setSearch]         = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [showCreate, setShowCreate] = useState(false);
  const [editUser, setEditUser]     = useState<any>(null);
  const [delId, setDelId]           = useState<string | null>(null);
  const [form, setForm]             = useState({ ...EMPTY });

  const { data: staff = [], isLoading } = useQuery<any[]>({
    queryKey: ['staff'],
    queryFn: () => api.get('/gyms/my/staff').then(r => r.data),
  });

  const { data: branches = [] } = useQuery<any[]>({
    queryKey: ['branches'],
    queryFn: () => api.get('/branches').then(r => r.data),
  });

  const createMut = useMutation({
    mutationFn: (dto: any) => api.post('/gyms/my/staff', dto).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['staff'] }); toast.success('Staff member added'); setShowCreate(false); setForm({ ...EMPTY }); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed'),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, ...dto }: any) => api.patch(`/gyms/my/staff/${id}`, dto).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['staff'] }); toast.success('Updated'); setEditUser(null); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed'),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => api.delete(`/gyms/my/staff/${id}`).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['staff'] }); toast.success('Removed'); setDelId(null); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed'),
  });

  const visible = staff.filter(s =>
    (roleFilter === 'ALL' || s.role === roleFilter) &&
    (!search || `${s.firstName} ${s.lastName} ${s.email}`.toLowerCase().includes(search.toLowerCase()))
  );

  const byRole = (r: string) => staff.filter(s => s.role === r).length;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><Users size={22} /> Staff Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage your gym's team members and their roles</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
          <Plus size={16} /> Add Staff
        </button>
      </div>

      {/* Role stats */}
      <div className="grid grid-cols-3 gap-4">
        {STAFF_ROLES.map(r => (
          <div key={r} className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
            <p className="text-xs text-slate-500">{ROLE_LABEL[r]}s</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{byRole(r)}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48 max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search staff…" className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div className="flex gap-1 border border-slate-200 rounded-lg overflow-hidden text-xs">
          {['ALL', ...STAFF_ROLES].map(r => (
            <button key={r} onClick={() => setRoleFilter(r)} className={cn('px-3 py-2 font-medium', roleFilter === r ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50')}>
              {r === 'ALL' ? 'All' : ROLE_LABEL[r]}
            </button>
          ))}
        </div>
      </div>

      {/* Staff cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading && <p className="col-span-3 text-center text-slate-500 py-8">Loading…</p>}
        {!isLoading && visible.length === 0 && (
          <div className="col-span-3 bg-white rounded-xl border p-10 text-center text-slate-400">No staff found matching filters</div>
        )}
        {visible.map(s => (
          <div key={s.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-700 text-sm shrink-0">
                  {s.avatarUrl ? <img src={s.avatarUrl} className="w-10 h-10 rounded-full object-cover" alt="" /> : getInitials(s.firstName, s.lastName)}
                </div>
                <div>
                  <p className="font-semibold text-slate-800">{s.firstName} {s.lastName}</p>
                  <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', ROLE_COLOR[s.role])}>{ROLE_LABEL[s.role]}</span>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => setEditUser(s)} className="p-1.5 hover:bg-slate-100 rounded text-slate-400 hover:text-indigo-600"><Edit2 size={14} /></button>
                <button onClick={() => setDelId(s.id)} className="p-1.5 hover:bg-red-50 rounded text-slate-400 hover:text-red-500"><Trash2 size={14} /></button>
              </div>
            </div>
            <div className="space-y-1 text-xs text-slate-500">
              <div className="flex items-center gap-1.5"><Mail size={11} />{s.email}</div>
              {s.phone && <div className="flex items-center gap-1.5"><Phone size={11} />{s.phone}</div>}
              {s.branch && <div className="flex items-center gap-1.5"><Building2 size={11} />{s.branch.name}</div>}
              {s.role === 'TRAINER' && s.trainerProfile && (
                <div className="mt-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
                  Session: ${s.trainerProfile.sessionRate ?? '—'}/hr · Commission: {s.trainerProfile.commissionPercent ?? 0}%
                </div>
              )}
            </div>
            <div className={cn('mt-3 text-xs px-2 py-0.5 rounded-full w-fit', s.isEmailVerified ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700')}>
              {s.isEmailVerified ? 'Active' : 'Pending verification'}
            </div>
          </div>
        ))}
      </div>

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="font-bold text-lg text-slate-800">Add Staff Member</h2>
              <button onClick={() => setShowCreate(false)}><X size={20} className="text-slate-400" /></button>
            </div>
            <form onSubmit={e => { e.preventDefault(); createMut.mutate(form); }} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[['First Name','firstName'],['Last Name','lastName'],['Email','email'],['Phone','phone']].map(([label, key]) => (
                  <label key={key} className="block">
                    <span className="text-xs font-medium text-slate-600">{label}</span>
                    <input required={['firstName','lastName','email'].includes(key)} type={key === 'email' ? 'email' : 'text'} value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} className="mt-0.5 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </label>
                ))}
              </div>
              <label className="block">
                <span className="text-xs font-medium text-slate-600">Role</span>
                <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} className="mt-0.5 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  {STAFF_ROLES.map(r => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
                </select>
              </label>
              {branches.length > 0 && (
                <label className="block">
                  <span className="text-xs font-medium text-slate-600">Branch</span>
                  <select value={form.branchId} onChange={e => setForm(f => ({ ...f, branchId: e.target.value }))} className="mt-0.5 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
                    <option value="">— Any branch —</option>
                    {branches.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </label>
              )}
              <label className="block">
                <span className="text-xs font-medium text-slate-600">Temporary Password</span>
                <input required type="password" minLength={8} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Min 8 characters" className="mt-0.5 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </label>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCreate(false)} className="flex-1 border border-slate-200 rounded-lg py-2 text-sm text-slate-700 hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={createMut.isPending} className="flex-1 bg-indigo-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">{createMut.isPending ? 'Adding…' : 'Add Staff'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editUser && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg text-slate-800">Edit {editUser.firstName}</h2>
              <button onClick={() => setEditUser(null)}><X size={20} className="text-slate-400" /></button>
            </div>
            <div className="space-y-3">
              <label className="block">
                <span className="text-xs font-medium text-slate-600">Role</span>
                <select value={editUser.role} onChange={e => setEditUser((u: any) => ({ ...u, role: e.target.value }))} className="mt-0.5 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm">
                  {STAFF_ROLES.map(r => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
                </select>
              </label>
              {branches.length > 0 && (
                <label className="block">
                  <span className="text-xs font-medium text-slate-600">Branch</span>
                  <select value={editUser.branchId ?? ''} onChange={e => setEditUser((u: any) => ({ ...u, branchId: e.target.value }))} className="mt-0.5 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm">
                    <option value="">— Any branch —</option>
                    {branches.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </label>
              )}
              <label className="flex items-center gap-3 py-2">
                <input type="checkbox" checked={editUser.isEmailVerified} onChange={e => setEditUser((u: any) => ({ ...u, isEmailVerified: e.target.checked }))} className="w-4 h-4" />
                <span className="text-sm text-slate-700">Active / Verified</span>
              </label>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setEditUser(null)} className="flex-1 border border-slate-200 rounded-lg py-2 text-sm hover:bg-slate-50">Cancel</button>
              <button onClick={() => updateMut.mutate({ id: editUser.id, role: editUser.role, branchId: editUser.branchId, isEmailVerified: editUser.isEmailVerified })} disabled={updateMut.isPending} className="flex-1 bg-indigo-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">{updateMut.isPending ? 'Saving…' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {delId && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 size={22} className="text-red-600" /></div>
            <h2 className="font-bold text-lg text-slate-800 mb-2">Remove Staff Member?</h2>
            <p className="text-sm text-slate-500 mb-6">This will permanently remove this staff member. Their account will be deleted.</p>
            <div className="flex gap-3">
              <button onClick={() => setDelId(null)} className="flex-1 border border-slate-200 rounded-lg py-2 text-sm hover:bg-slate-50">Cancel</button>
              <button onClick={() => deleteMut.mutate(delId!)} disabled={deleteMut.isPending} className="flex-1 bg-red-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-red-700 disabled:opacity-50">{deleteMut.isPending ? 'Removing…' : 'Remove'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
