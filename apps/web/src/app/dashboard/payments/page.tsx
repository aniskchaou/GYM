'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CreditCard, TrendingUp, ChevronLeft, ChevronRight, RotateCcw, X } from 'lucide-react';
import api from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

const STATUS_STYLES: Record<string, string> = {
  PAID: 'bg-green-50 text-green-600',
  PENDING: 'bg-yellow-50 text-yellow-600',
  FAILED: 'bg-red-50 text-red-500',
  REFUNDED: 'bg-purple-50 text-purple-600',
  PARTIALLY_REFUNDED: 'bg-orange-50 text-orange-500',
};

export default function PaymentsPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [refundId, setRefundId] = useState<string | null>(null);
  const [refundReason, setRefundReason] = useState('');
  const PAGE_SIZE = 15;

  const { data, isLoading } = useQuery({
    queryKey: ['payments', page],
    queryFn: () => api.get(`/payments/history?page=${page}&limit=${PAGE_SIZE}`).then((r) => r.data),
  });

  const refundMut = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      api.post(`/payments/${id}/refund`, { reason }).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payments'] });
      toast.success('Refund processed successfully');
      setRefundId(null);
      setRefundReason('');
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Refund failed'),
  });

  const payments: any[] = data?.payments ?? data?.data ?? data ?? [];
  const total: number = data?.total ?? payments.length;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const totalRevenue = payments.filter((p: any) => p.status === 'PAID').reduce((s: number, p: any) => s + (p.amount ?? 0), 0);

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center">
              <TrendingUp size={16} className="text-green-500" />
            </div>
            <p className="text-sm font-medium text-slate-600">This Page Revenue</p>
          </div>
          <p className="text-2xl font-bold text-slate-900">{formatCurrency(totalRevenue)}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center">
              <CreditCard size={16} className="text-indigo-500" />
            </div>
            <p className="text-sm font-medium text-slate-600">Total Transactions</p>
          </div>
          <p className="text-2xl font-bold text-slate-900">{total}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-yellow-50 rounded-xl flex items-center justify-center">
              <CreditCard size={16} className="text-yellow-500" />
            </div>
            <p className="text-sm font-medium text-slate-600">Pending</p>
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {payments.filter((p: any) => p.status === 'PENDING').length}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">Payment History</h3>
        </div>

        {isLoading ? (
          <div className="p-8 text-center animate-pulse text-slate-400">Loading...</div>
        ) : payments.length === 0 ? (
          <div className="p-12 text-center">
            <CreditCard size={40} className="mx-auto mb-3 text-slate-300" />
            <p className="text-slate-500">No payment records found.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide bg-slate-50">
                    <th className="px-5 py-3">Member</th>
                    <th className="px-5 py-3">Plan</th>
                    <th className="px-5 py-3">Amount</th>
                    <th className="px-5 py-3">Method</th>
                    <th className="px-5 py-3">Date</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {payments.map((p: any) => (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-slate-800">{p.member?.user?.firstName ?? ''} {p.member?.user?.lastName ?? '—'}</p>
                        <p className="text-xs text-slate-400">{p.member?.user?.email ?? ''}</p>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">{p.membership?.plan?.name ?? '—'}</td>
                      <td className="px-5 py-3.5 font-semibold text-slate-800">{formatCurrency(p.amount ?? 0)}</td>
                      <td className="px-5 py-3.5 text-slate-500 capitalize">{(p.method ?? p.paymentMethod ?? '—').toLowerCase().replace('_', ' ')}</td>
                      <td className="px-5 py-3.5 text-slate-500">{p.createdAt ? formatDate(p.createdAt) : '—'}</td>
                      <td className="px-5 py-3.5">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_STYLES[p.status] ?? 'bg-slate-50 text-slate-500'}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        {p.status === 'PAID' && (
                          <button
                            onClick={() => setRefundId(p.id)}
                            className="flex items-center gap-1 text-xs text-red-600 border border-red-200 px-2.5 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            <RotateCcw size={11} /> Refund
                          </button>
                        )}
                        {p.status === 'REFUNDED' && (
                          <span className="text-xs text-slate-400">Refunded</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100 text-xs text-slate-500">
                <span>Page {page} of {totalPages}</span>
                <div className="flex items-center gap-1">
                  <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-40">
                    <ChevronLeft size={14} />
                  </button>
                  <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-40">
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Refund modal */}
      {refundId && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg text-slate-800 flex items-center gap-2"><RotateCcw size={18} className="text-red-500" /> Process Refund</h2>
              <button onClick={() => setRefundId(null)}><X size={20} className="text-slate-400" /></button>
            </div>
            <p className="text-sm text-slate-600 mb-4">This will mark the payment as refunded. If Stripe is configured, the refund will be issued automatically.</p>
            <label className="block mb-4">
              <span className="text-xs font-medium text-slate-600">Reason (optional)</span>
              <input value={refundReason} onChange={e => setRefundReason(e.target.value)} placeholder="e.g. Member cancellation, duplicate charge…" className="mt-0.5 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400" />
            </label>
            <div className="flex gap-3">
              <button onClick={() => setRefundId(null)} className="flex-1 border border-slate-200 rounded-lg py-2 text-sm hover:bg-slate-50">Cancel</button>
              <button onClick={() => refundMut.mutate({ id: refundId!, reason: refundReason })} disabled={refundMut.isPending} className="flex-1 bg-red-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-red-700 disabled:opacity-50">{refundMut.isPending ? 'Processing…' : 'Confirm Refund'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
