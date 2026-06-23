'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { FileText, Printer, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function MemberInvoicesPage() {
  const { data = [], isLoading } = useQuery<any[]>({
    queryKey: ['my-payments'],
    queryFn: () => api.get('/payments/my').then(r => r.data ?? []),
  });

  const STATUS_STYLES: Record<string, string> = {
    PAID:     'bg-green-100 text-green-700',
    PENDING:  'bg-amber-100 text-amber-700',
    FAILED:   'bg-red-100   text-red-700',
    REFUNDED: 'bg-purple-100 text-purple-600',
  };

  const handlePrint = (p: any) => {
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`
      <html><head><title>Invoice #${p.id?.slice(0,8).toUpperCase()}</title>
      <style>body{font-family:sans-serif;max-width:600px;margin:40px auto;padding:24px}
      h1{color:#1e293b;font-size:24px}p{color:#64748b;font-size:14px}
      table{width:100%;border-collapse:collapse;margin:20px 0}
      td,th{border:1px solid #e2e8f0;padding:12px;text-align:left;font-size:14px}
      th{background:#f8fafc;font-weight:600;color:#475569}
      .total{font-size:18px;font-weight:700;color:#1e293b}
      .badge{display:inline-block;padding:4px 10px;border-radius:20px;font-size:12px;font-weight:600;background:#dcfce7;color:#16a34a}
      .footer{margin-top:40px;font-size:12px;color:#94a3b8;border-top:1px solid #e2e8f0;padding-top:16px}</style></head>
      <body>
        <h1>Invoice</h1>
        <p>Receipt #: <strong>${p.id?.slice(0,8).toUpperCase()}</strong></p>
        <p>Date: ${new Date(p.createdAt).toLocaleDateString()}</p>
        <table>
          <thead><tr><th>Description</th><th>Amount</th></tr></thead>
          <tbody><tr><td>${p.description ?? 'Membership Payment'}</td><td>$${p.amount}</td></tr></tbody>
        </table>
        <p class="total">Total: $${p.amount} ${(p.currency ?? 'USD').toUpperCase()}</p>
        <p>Payment method: ${p.method ?? '—'}</p>
        <p>Status: <span class="badge">${p.status}</span></p>
        <div class="footer">GymFlow · Thank you for your payment</div>
      </body></html>
    `);
    w.document.close();
    w.print();
  };

  const total = (data as any[]).filter(p => p.status === 'PAID').reduce((s, p) => s + (p.amount ?? 0), 0);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><FileText size={22} /> My Invoices</h1>
        <p className="text-sm text-slate-500 mt-0.5">Download or print your payment receipts</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
          <p className="text-xs text-slate-500">Total Paid</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">${total.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
          <p className="text-xs text-slate-500">Total Transactions</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{(data as any[]).length}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
            <tr>{['Invoice #', 'Description', 'Amount', 'Date', 'Status', 'Download'].map(h => (
              <th key={h} className="text-left px-4 py-3">{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={6} className="p-8 text-center text-slate-500">Loading…</td></tr>}
            {!isLoading && (data as any[]).length === 0 && (
              <tr><td colSpan={6} className="p-10 text-center text-slate-400">
                <FileText size={28} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">No invoices yet. Your payment receipts will appear here.</p>
              </td></tr>
            )}
            {(data as any[]).map((p: any) => (
              <tr key={p.id} className="border-t border-slate-100 hover:bg-slate-50/50">
                <td className="px-4 py-3 font-mono text-xs text-slate-500">#{p.id?.slice(0,8).toUpperCase()}</td>
                <td className="px-4 py-3 text-slate-700 max-w-[200px] truncate">{p.description ?? 'Membership'}</td>
                <td className="px-4 py-3 font-semibold text-slate-800">${p.amount}</td>
                <td className="px-4 py-3 text-slate-500 text-xs">{new Date(p.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', STATUS_STYLES[p.status] ?? 'bg-slate-100 text-slate-600')}>{p.status}</span>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => handlePrint(p)} className="flex items-center gap-1 text-xs text-indigo-600 border border-indigo-200 px-2.5 py-1.5 rounded-lg hover:bg-indigo-50">
                    <Printer size={11} /> Print
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
