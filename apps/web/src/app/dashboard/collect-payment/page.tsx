'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { DollarSign, Search, CreditCard, Banknote, CheckCircle, X, Receipt } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

const METHODS = [
  { value: 'CASH',          label: 'Cash',          icon: Banknote },
  { value: 'STRIPE',        label: 'Card',          icon: CreditCard },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer', icon: DollarSign },
];

export default function CollectPaymentPage() {
  const qc = useQueryClient();
  const [memberSearch, setMemberSearch] = useState('');
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [selectedMembership, setSelectedMembership] = useState<any>(null);
  const [amount, setAmount]     = useState('');
  const [method, setMethod]     = useState('CASH');
  const [description, setDesc]  = useState('');
  const [success, setSuccess]   = useState<any>(null);

  const { data: membersData } = useQuery({
    queryKey: ['members-search', memberSearch],
    queryFn: () => api.get(`/members?search=${memberSearch}&limit=5`).then(r => r.data),
    enabled: memberSearch.length > 1,
  });

  const { data: membershipsData } = useQuery({
    queryKey: ['member-memberships', selectedMember?.id],
    queryFn: () => api.get(`/memberships/member/${selectedMember.id}`).then(r => r.data),
    enabled: !!selectedMember,
  });

  const collectMut = useMutation({
    mutationFn: (dto: any) => api.post('/payments/collect', dto).then(r => r.data),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['payments'] });
      toast.success('Payment collected successfully');
      setSuccess(data);
      setSelectedMember(null);
      setSelectedMembership(null);
      setAmount('');
      setDesc('');
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Payment failed'),
  });

  const handleCollect = () => {
    if (!selectedMember || !amount) return;
    collectMut.mutate({
      memberId: selectedMember.id,
      amount: parseFloat(amount),
      method,
      description: description || `${method} payment collected by receptionist`,
      membershipId: selectedMembership?.id ?? undefined,
    });
  };

  const members: any[] = membersData?.data ?? [];
  const memberships: any[] = membershipsData ?? [];

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><DollarSign size={22} /> Collect Payment</h1>
        <p className="text-sm text-slate-500 mt-0.5">Process cash, card, or bank transfer payments from members</p>
      </div>

      {/* Success receipt */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle size={22} className="text-green-600" />
            <h2 className="font-bold text-green-800">Payment Collected!</h2>
          </div>
          <div className="text-sm text-green-700 space-y-1">
            <p><span className="font-medium">Member:</span> {success.user?.firstName} {success.user?.lastName}</p>
            <p><span className="font-medium">Amount:</span> ${success.amount}</p>
            <p><span className="font-medium">Method:</span> {success.method}</p>
            <p><span className="font-medium">Receipt #:</span> {success.id?.slice(0, 8).toUpperCase()}</p>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={() => window.print()} className="flex items-center gap-2 text-sm bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
              <Receipt size={14} /> Print Receipt
            </button>
            <button onClick={() => setSuccess(null)} className="text-sm text-green-700 border border-green-300 px-4 py-2 rounded-lg hover:bg-green-100">
              New Payment
            </button>
          </div>
        </div>
      )}

      {!success && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
          {/* Step 1: Member */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">1. Find Member</label>
            {selectedMember ? (
              <div className="flex items-center justify-between p-3 bg-indigo-50 border border-indigo-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                    {selectedMember.firstName[0]}{selectedMember.lastName[0]}
                  </div>
                  <div>
                    <p className="font-medium text-slate-800 text-sm">{selectedMember.firstName} {selectedMember.lastName}</p>
                    <p className="text-xs text-slate-500">{selectedMember.email}</p>
                  </div>
                </div>
                <button onClick={() => { setSelectedMember(null); setSelectedMembership(null); }} className="text-slate-400 hover:text-slate-700">
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={memberSearch}
                  onChange={e => setMemberSearch(e.target.value)}
                  placeholder="Search by name or email…"
                  className="pl-8 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm w-full focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
                {members.length > 0 && (
                  <div className="absolute z-10 top-full mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
                    {members.map((m: any) => (
                      <button
                        key={m.id}
                        onClick={() => { setSelectedMember(m); setMemberSearch(''); }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 text-left"
                      >
                        <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold shrink-0">
                          {m.firstName[0]}{m.lastName[0]}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-800">{m.firstName} {m.lastName}</p>
                          <p className="text-xs text-slate-400">{m.email}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Step 2: Link to membership (optional) */}
          {selectedMember && memberships.length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">2. Link to Membership (optional)</label>
              <select
                value={selectedMembership?.id ?? ''}
                onChange={e => setSelectedMembership(memberships.find(m => m.id === e.target.value) ?? null)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
              >
                <option value="">— Not linked to a membership —</option>
                {memberships.map((m: any) => (
                  <option key={m.id} value={m.id}>{m.plan?.name} — {m.status} — expires {m.endDate ? new Date(m.endDate).toLocaleDateString() : 'ongoing'}</option>
                ))}
              </select>
            </div>
          )}

          {/* Step 3: Payment details */}
          {selectedMember && (
            <>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">{selectedMember && memberships.length > 0 ? '3.' : '2.'} Payment Details</label>
                <div className="grid grid-cols-2 gap-4">
                  <label className="block">
                    <span className="text-xs text-slate-500 font-medium">Amount ($)</span>
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs text-slate-500 font-medium">Description</span>
                    <input
                      value={description}
                      onChange={e => setDesc(e.target.value)}
                      placeholder="Membership renewal, etc."
                      className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                  </label>
                </div>
              </div>

              {/* Payment method */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Payment Method</label>
                <div className="grid grid-cols-3 gap-3">
                  {METHODS.map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      onClick={() => setMethod(value)}
                      className={cn('flex flex-col items-center gap-2 p-4 border-2 rounded-xl transition-colors', method === value ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-600 hover:border-slate-300')}
                    >
                      <Icon size={20} />
                      <span className="text-xs font-medium">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleCollect}
                disabled={!amount || collectMut.isPending}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                <DollarSign size={18} />
                {collectMut.isPending ? 'Processing…' : `Collect $${amount || '0.00'} via ${METHODS.find(m => m.value === method)?.label}`}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
