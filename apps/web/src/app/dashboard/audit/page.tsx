'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Shield } from 'lucide-react';
import api from '@/lib/api';

export default function AuditPage() {
  const [entity, setEntity] = useState('');
  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs', entity],
    queryFn: () => api.get('/audit-logs', { params: entity ? { entity } : {} }).then((r) => r.data),
  });

  const rows: any[] = data ?? [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><Shield size={22} /> Audit Log</h1>
          <p className="text-sm text-slate-500">All mutations across the system</p>
        </div>
        <select value={entity} onChange={(e) => setEntity(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
          <option value="">All entities</option>
          {['Member', 'Trainer', 'Branch', 'Class', 'Booking', 'Membership', 'Payment', 'Coupon', 'Order', 'Product', 'WorkoutPlan', 'PtSession', 'Attendance', 'Gym'].map((e) => (
            <option key={e} value={e}>{e}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="text-left px-4 py-3">When</th>
              <th className="text-left px-4 py-3">User</th>
              <th className="text-left px-4 py-3">Action</th>
              <th className="text-left px-4 py-3">Entity</th>
              <th className="text-left px-4 py-3">IP</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={5} className="p-6 text-center text-slate-500">Loading…</td></tr>}
            {!isLoading && rows.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-slate-500">No log entries</td></tr>}
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-slate-100">
                <td className="px-4 py-3 whitespace-nowrap">{new Date(r.createdAt).toLocaleString()}</td>
                <td className="px-4 py-3">
                  {r.user ? <>{r.user.firstName} {r.user.lastName} <span className="text-xs text-slate-400">({r.user.role})</span></> : '—'}
                </td>
                <td className="px-4 py-3 font-mono text-xs">{r.action}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 rounded bg-slate-100 text-xs">{r.entity}</span>
                  {r.entityId && <span className="ml-2 text-xs text-slate-400">{r.entityId.slice(0, 8)}…</span>}
                </td>
                <td className="px-4 py-3 text-xs text-slate-500">{r.ipAddress ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
