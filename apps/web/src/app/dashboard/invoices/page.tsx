'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { FileText, Search, Download, Printer, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function InvoicesPage() {
  const [search, setSearch]     = useState('');
  const [statusFilter, setStatus] = useState('ALL');
  const [page, setPage]         = useState(1);
  const PAGE_SIZE = 20;

  const { data, isLoading } = useQuery({
    queryKey: ['invoices', search, statusFilter, page],
    queryFn: () =>
      api.get(`/payments/history?page=${page}&limit=${PAGE_SIZE}`).then(r => r.data),
  });

  const payments: any[] = data?.data ?? data?.payments ?? data ?? [];
  const total: number = data?.total ?? payments.length;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const STATUS_STYLES: Record<string, string> = {
    PAID: 'bg-green-100 text-green-700', PENDING: 'bg-amber-100 text-amber-700',
    FAILED: 'bg-red-100 text-red-700',   REFUNDED: 'bg-purple-100 text-purple-600',
  };

  const filtered = payments.filter(p => {
    const matchSearch = !search ||
      `${p.user?.firstName} ${p.user?.lastName} ${p.user?.email}`.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handlePrint = (payment: any) => {
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`
      <html><head><title>Invoice #${payment.id?.slice(0,8).toUpperCase()}</title>
      <style>body{font-family:sans-serif;max-width:600px;margin:40px auto;padding:20px}
      h1{color:#1e293b}.meta{color:#64748b;font-size:14px}table{width:100%;border-collapse:collapse;margin:20px 0}
      td,th{border:1px solid #e2e8f0;padding:10px;text-align:left}th{background:#f8fafc}
      .total{font-size:18px;font-weight:bold}.footer{margin-top:40px;color:#94a3b8;font-size:12px}</style></head>
      <body>
        <h1>Invoice</h1>
        <p class="meta">Receipt #: ${payment.id?.slice(0,8).toUpperCase()}<br>
        Date: ${new Date(payment.createdAt).toLocaleDateString()}</p>
        <table>
          <tr><th>Description</th><th>Amount</th></tr>
          <tr><td>${payment.description ?? payment.membership?.plan?.name ?? 'Membership payment'}</td><td>$${payment.amount}</td></tr>
        </table>
        <p>Billed to: <strong>${payment.user?.firstName} ${payment.user?.lastName}</strong> (${payment.user?.email})</p>
        <p class="total">Total: $${payment.amount} ${payment.currency?.toUpperCase() ?? 'USD'}</p>
        <p>Method: ${payment.method ?? '—'} &nbsp;|&nbsp; Status: <strong>${payment.status}</strong></p>
        <p class="footer">GymFlow — Thank you for your payment</p>
      </body></html>
    `);
    w.document.close();
    w.print();
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><FileText size={22} /> Invoices</h1>
          <p className="text-sm text-slate-500 mt-0.5">View and print payment invoices for members</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search member…" className="pl-8 pr-4 py-2 border border-slate-200 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-indigo-400" />
        </div>
        <div className="flex gap-1 border border-slate-200 rounded-lg overflow-hidden text-xs">
          {['ALL', 'PAID', 'PENDING', 'FAILED', 'REFUNDED'].map(s => (
            <button key={s} onClick={() => setStatus(s)} className={cn('px-3 py-2 font-medium', statusFilter === s ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50')}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
            <tr>{['Invoice #', 'Member', 'Description', 'Amount', 'Method', 'Date', 'Status', 'Actions'].map(h => (
              <th key={h} className="text-left px-4 py-3 whitespace-nowrap">{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={8} className="p-8 text-center text-slate-500">Loading…</td></tr>}
            {!isLoading && filtered.length === 0 && <tr><td colSpan={8} className="p-8 text-center text-slate-400">No invoices found</td></tr>}
            {filtered.map((p: any) => (
              <tr key={p.id} className="border-t border-slate-100 hover:bg-slate-50/50">
                <td className="px-4 py-3 font-mono text-xs text-slate-500">#{p.id?.slice(0,8).toUpperCase()}</td>
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-800 text-xs">{p.user?.firstName} {p.user?.lastName}</p>
                  <p className="text-xs text-slate-400">{p.user?.email}</p>
                </td>
                <td className="px-4 py-3 text-slate-600 text-xs max-w-[150px] truncate">
                  {p.description ?? p.membership?.plan?.name ?? 'Membership'}
                </td>
                <td className="px-4 py-3 font-semibold text-slate-800">${p.amount}</td>
                <td className="px-4 py-3 text-slate-500 text-xs capitalize">{(p.method ?? '—').toLowerCase()}</td>
                <td className="px-4 py-3 text-slate-500 text-xs">{p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '—'}</td>
                <td className="px-4 py-3">
                  <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', STATUS_STYLES[p.status] ?? 'bg-slate-100 text-slate-600')}>{p.status}</span>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handlePrint(p)}
                    className="flex items-center gap-1 text-xs text-indigo-600 border border-indigo-200 px-2.5 py-1.5 rounded-lg hover:bg-indigo-50"
                    title="Print invoice"
                  >
                    <Printer size={11} /> Print
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 text-xs text-slate-500">
            <span>Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40">Prev</button>
              <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
