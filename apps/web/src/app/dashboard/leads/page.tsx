'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Users, TrendingUp, Phone, Mail, Plus, Search, X, CheckCircle, Clock, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

type LeadStatus = 'NEW' | 'CONTACTED' | 'TRIAL' | 'CONVERTED' | 'LOST';

interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  source: string;
  status: LeadStatus;
  notes?: string;
  createdAt: string;
  interest?: string;
}

const STATUS_META: Record<LeadStatus, { label: string; color: string; icon: React.ElementType }> = {
  NEW:       { label: 'New',        color: 'bg-sky-100 text-sky-700',       icon: Clock },
  CONTACTED: { label: 'Contacted',  color: 'bg-amber-100 text-amber-700',   icon: MessageSquare },
  TRIAL:     { label: 'Trial',      color: 'bg-purple-100 text-purple-700', icon: Users },
  CONVERTED: { label: 'Converted',  color: 'bg-green-100 text-green-700',   icon: CheckCircle },
  LOST:      { label: 'Lost',       color: 'bg-red-100 text-red-600',       icon: X },
};

const SOURCES = ['Website', 'Walk-in', 'Referral', 'Social Media', 'Ad Campaign', 'Cold Call', 'Event', 'Other'];
const INTERESTS = ['Weight Loss', 'Muscle Gain', 'Fitness', 'Yoga', 'CrossFit', 'Boxing', 'General Health', 'Other'];

const EMPTY_LEAD: Omit<Lead, 'id' | 'createdAt'> = { name: '', email: '', phone: '', source: 'Website', status: 'NEW', notes: '', interest: 'General Health' };

export default function LeadsPage() {
  const [search, setSearch]     = useState('');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'ALL'>('ALL');
  const [showForm, setShowForm] = useState(false);
  const [editLead, setEditLead] = useState<Lead | null>(null);
  const [form, setForm]         = useState<Omit<Lead, 'id' | 'createdAt'>>({ ...EMPTY_LEAD });
  // Local state since there's no API for leads yet
  const [leads, setLeads] = useState<Lead[]>([
    { id: '1', name: 'Alex Johnson',   email: 'alex@example.com',   phone: '+1 555-0101', source: 'Website',      status: 'NEW',       interest: 'Weight Loss',    createdAt: new Date(Date.now() - 86400000 * 1).toISOString() },
    { id: '2', name: 'Maria Garcia',   email: 'maria@example.com',  phone: '+1 555-0102', source: 'Walk-in',      status: 'CONTACTED', interest: 'Yoga',           createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
    { id: '3', name: 'James Wilson',   email: 'james@example.com',  phone: '+1 555-0103', source: 'Referral',     status: 'TRIAL',     interest: 'CrossFit',       createdAt: new Date(Date.now() - 86400000 * 3).toISOString() },
    { id: '4', name: 'Sarah Lee',      email: 'sarah@example.com',  phone: '+1 555-0104', source: 'Social Media', status: 'CONVERTED', interest: 'General Health', createdAt: new Date(Date.now() - 86400000 * 5).toISOString() },
    { id: '5', name: 'Tom Brown',      email: 'tom@example.com',    phone: '+1 555-0105', source: 'Ad Campaign',  status: 'LOST',      interest: 'Boxing',         createdAt: new Date(Date.now() - 86400000 * 7).toISOString() },
    { id: '6', name: 'Emma Davis',     email: 'emma@example.com',   phone: '+1 555-0106', source: 'Event',        status: 'NEW',       interest: 'Muscle Gain',    createdAt: new Date(Date.now() - 86400000 * 0).toISOString() },
  ]);

  const addLead = () => {
    const lead: Lead = { ...form, id: `lead-${Date.now()}`, createdAt: new Date().toISOString() };
    setLeads(prev => [lead, ...prev]);
    toast.success('Lead added');
    setShowForm(false);
    setForm({ ...EMPTY_LEAD });
  };

  const updateStatus = (id: string, status: LeadStatus) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l));
    toast.success(`Lead marked as ${status}`);
  };

  const deleteLead = (id: string) => {
    setLeads(prev => prev.filter(l => l.id !== id));
    toast.success('Lead removed');
  };

  const visible = leads.filter(l =>
    (statusFilter === 'ALL' || l.status === statusFilter) &&
    (!search || l.name.toLowerCase().includes(search.toLowerCase()) || l.email.toLowerCase().includes(search.toLowerCase()))
  );

  const countByStatus = (s: LeadStatus) => leads.filter(l => l.status === s).length;
  const conversionRate = leads.length ? Math.round((countByStatus('CONVERTED') / leads.length) * 100) : 0;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><TrendingUp size={22} /> Lead Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">Track prospects and convert them to gym members</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
          <Plus size={16} /> Add Lead
        </button>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {(Object.entries(STATUS_META) as [LeadStatus, typeof STATUS_META[LeadStatus]][]).map(([status, meta]) => (
          <div key={status} className={cn('rounded-xl p-3 text-center border', meta.color.replace('text-', 'border-').replace(/\w+-\d+$/, '200'), meta.color.replace(/text-\w+/, 'bg-white'))}>
            <p className={cn('text-xl font-bold', meta.color.split(' ')[1])}>{countByStatus(status)}</p>
            <p className="text-xs text-slate-500 mt-0.5">{meta.label}</p>
          </div>
        ))}
      </div>

      {/* Conversion bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4">
        <div className="flex-1">
          <div className="flex justify-between text-xs text-slate-600 mb-1.5">
            <span>Conversion rate</span><span className="font-bold text-slate-800">{conversionRate}%</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full"><div className="h-2 bg-green-500 rounded-full" style={{ width: `${conversionRate}%` }} /></div>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-slate-800">{leads.length}</p>
          <p className="text-xs text-slate-500">Total leads</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search leads…" className="pl-8 pr-4 py-2 border border-slate-200 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-indigo-400" />
        </div>
        <div className="flex gap-1 border border-slate-200 rounded-lg overflow-hidden text-xs">
          {(['ALL', ...Object.keys(STATUS_META)] as (LeadStatus | 'ALL')[]).map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} className={cn('px-3 py-2 font-medium', statusFilter === s ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50')}>
              {s === 'ALL' ? 'All' : STATUS_META[s as LeadStatus].label}
            </button>
          ))}
        </div>
      </div>

      {/* Lead cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {visible.length === 0 && (
          <div className="col-span-3 bg-white rounded-xl border p-10 text-center text-slate-400">No leads found</div>
        )}
        {visible.map(lead => {
          const meta = STATUS_META[lead.status];
          return (
            <div key={lead.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-slate-800">{lead.name}</p>
                  <p className="text-xs text-slate-400">{lead.source} · {new Date(lead.createdAt).toLocaleDateString()}</p>
                </div>
                <span className={cn('px-2 py-0.5 rounded-full text-xs font-semibold', meta.color)}>{meta.label}</span>
              </div>
              <div className="space-y-1 text-xs text-slate-500">
                <div className="flex items-center gap-1.5"><Mail size={11} />{lead.email}</div>
                {lead.phone && <div className="flex items-center gap-1.5"><Phone size={11} />{lead.phone}</div>}
                {lead.interest && <div className="flex items-center gap-1.5"><CheckCircle size={11} className="text-indigo-400" />Interested in: {lead.interest}</div>}
              </div>
              {lead.notes && <p className="text-xs text-slate-400 italic border-t border-slate-100 pt-2">{lead.notes}</p>}
              <div className="flex items-center gap-2 pt-1">
                <select
                  value={lead.status}
                  onChange={e => updateStatus(lead.id, e.target.value as LeadStatus)}
                  className="flex-1 text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none bg-white"
                >
                  {Object.entries(STATUS_META).map(([s, m]) => <option key={s} value={s}>{m.label}</option>)}
                </select>
                {lead.status !== 'CONVERTED' && lead.status !== 'LOST' && (
                  <a href={`mailto:${lead.email}`} className="p-1.5 border border-slate-200 rounded-lg text-slate-500 hover:text-indigo-600 hover:border-indigo-200" title="Send email">
                    <Mail size={14} />
                  </a>
                )}
                <button onClick={() => deleteLead(lead.id)} className="p-1.5 border border-slate-200 rounded-lg text-slate-500 hover:text-red-500 hover:border-red-200" title="Remove lead">
                  <X size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add lead modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="font-bold text-lg text-slate-800">Add New Lead</h2>
              <button onClick={() => setShowForm(false)}><X size={20} className="text-slate-400" /></button>
            </div>
            <div className="p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {([['Name *','name','text'],['Email *','email','email'],['Phone','phone','tel']] as [string,string,string][]).map(([label,key,type]) => (
                  <label key={key} className={cn('block', key === 'name' ? 'col-span-2' : '')}>
                    <span className="text-xs font-medium text-slate-600">{label}</span>
                    <input type={type} required={label.includes('*')} value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} className="mt-0.5 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                  </label>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-xs font-medium text-slate-600">Source</span>
                  <select value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))} className="mt-0.5 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
                    {SOURCES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="text-xs font-medium text-slate-600">Interest</span>
                  <select value={form.interest} onChange={e => setForm(f => ({ ...f, interest: e.target.value }))} className="mt-0.5 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
                    {INTERESTS.map(i => <option key={i}>{i}</option>)}
                  </select>
                </label>
              </div>
              <label className="block">
                <span className="text-xs font-medium text-slate-600">Notes</span>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} className="mt-0.5 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none resize-none" />
              </label>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowForm(false)} className="flex-1 border border-slate-200 rounded-lg py-2 text-sm hover:bg-slate-50">Cancel</button>
                <button onClick={addLead} className="flex-1 bg-indigo-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-indigo-700">Add Lead</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
