'use client';

import { useState } from 'react';
import { Puzzle, Check, X, ExternalLink, Zap, Mail, MessageSquare, BarChart2, CreditCard, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface Integration {
  id: string; name: string; description: string; category: string;
  status: 'connected' | 'available' | 'coming_soon';
  icon: React.ElementType; color: string; docsUrl?: string;
}

const INTEGRATIONS: Integration[] = [
  { id: 'stripe',      name: 'Stripe',          description: 'Payment processing for subscriptions and member fees',  category: 'Payments',       status: 'connected',    icon: CreditCard,    color: 'bg-purple-100 text-purple-700', docsUrl: 'https://stripe.com/docs' },
  { id: 'mailgun',     name: 'Mailgun',          description: 'Transactional email delivery for notifications',        category: 'Email',          status: 'available',    icon: Mail,          color: 'bg-sky-100 text-sky-700',       docsUrl: 'https://mailgun.com/docs' },
  { id: 'sendgrid',    name: 'SendGrid',         description: 'Email marketing and transactional email platform',      category: 'Email',          status: 'available',    icon: Mail,          color: 'bg-blue-100 text-blue-700' },
  { id: 'slack',       name: 'Slack',            description: 'Real-time alerts and support notifications to Slack',   category: 'Notifications',  status: 'available',    icon: MessageSquare, color: 'bg-amber-100 text-amber-700' },
  { id: 'analytics',   name: 'Google Analytics', description: 'Track platform usage and funnel analytics',            category: 'Analytics',      status: 'available',    icon: BarChart2,     color: 'bg-orange-100 text-orange-700' },
  { id: 'zapier',      name: 'Zapier',           description: 'Connect GymFlow to 5,000+ apps via automation',        category: 'Automation',     status: 'coming_soon',  icon: Zap,           color: 'bg-yellow-100 text-yellow-700' },
  { id: 'hubspot',     name: 'HubSpot CRM',      description: 'Sync gym leads and owners to HubSpot CRM',             category: 'CRM',            status: 'coming_soon',  icon: Globe,         color: 'bg-rose-100 text-rose-700' },
  { id: 'twilio',      name: 'Twilio SMS',       description: 'SMS notifications to gym owners and members',          category: 'Notifications',  status: 'coming_soon',  icon: MessageSquare, color: 'bg-red-100 text-red-700' },
];

const CATEGORY_OPTS = ['All', 'Payments', 'Email', 'Notifications', 'Analytics', 'Automation', 'CRM'];

export default function SAIntegrationsPage() {
  const [cat, setCat]       = useState('All');
  const [connected, setConnected] = useState<Record<string, boolean>>({ stripe: true });

  const visible = INTEGRATIONS.filter(i => cat === 'All' || i.category === cat);

  const toggle = (id: string) => {
    const now = !connected[id];
    setConnected(c => ({ ...c, [id]: now }));
    toast.success(now ? `${INTEGRATIONS.find(i => i.id === id)?.name} connected` : `${INTEGRATIONS.find(i => i.id === id)?.name} disconnected`);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><Puzzle size={22} /> Integrations</h1>
        <p className="text-sm text-slate-500 mt-0.5">Connect third-party services to the GymFlow platform</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Connected',     value: Object.values(connected).filter(Boolean).length, color: 'bg-green-50 border-green-200 text-green-700' },
          { label: 'Available',     value: INTEGRATIONS.filter(i => i.status === 'available').length,    color: 'bg-sky-50 border-sky-200 text-sky-700' },
          { label: 'Coming Soon',   value: INTEGRATIONS.filter(i => i.status === 'coming_soon').length, color: 'bg-slate-50 border-slate-200 text-slate-600' },
        ].map(s => (
          <div key={s.label} className={cn('rounded-xl border p-4', s.color)}>
            <p className="text-xs opacity-70">{s.label}</p>
            <p className="text-2xl font-bold mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Category filter */}
      <div className="flex gap-1 border border-slate-200 rounded-xl p-1 w-fit text-xs bg-slate-50">
        {CATEGORY_OPTS.map(c => (
          <button key={c} onClick={() => setCat(c)} className={cn('px-3 py-1.5 rounded-lg font-medium transition-colors', cat === c ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-800')}>
            {c}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {visible.map(i => {
          const isConnected = !!connected[i.id];
          const isComingSoon = i.status === 'coming_soon';
          return (
            <div key={i.id} className={cn('bg-white rounded-2xl border shadow-sm p-5 flex flex-col gap-3', isConnected ? 'border-indigo-200' : 'border-slate-200')}>
              <div className="flex items-start justify-between">
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', i.color)}>
                  <i.icon size={20} />
                </div>
                {isConnected && <span className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full"><Check size={11} /> Connected</span>}
                {isComingSoon && <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">Coming Soon</span>}
              </div>
              <div>
                <p className="font-semibold text-slate-800">{i.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">{i.description}</p>
                <span className="inline-block mt-1.5 text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded">{i.category}</span>
              </div>
              <div className="flex items-center gap-2 mt-auto">
                {!isComingSoon && (
                  <button
                    onClick={() => toggle(i.id)}
                    className={cn('flex-1 py-2 rounded-lg text-xs font-medium transition-colors', isConnected ? 'border border-red-200 text-red-600 hover:bg-red-50' : 'bg-indigo-600 text-white hover:bg-indigo-700')}
                  >
                    {isConnected ? 'Disconnect' : 'Connect'}
                  </button>
                )}
                {isComingSoon && (
                  <button disabled className="flex-1 py-2 rounded-lg text-xs font-medium bg-slate-100 text-slate-400 cursor-not-allowed">
                    Not Yet Available
                  </button>
                )}
                {i.docsUrl && (
                  <a href={i.docsUrl} target="_blank" rel="noopener noreferrer" className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:text-indigo-600 hover:border-indigo-200 transition-colors">
                    <ExternalLink size={14} />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
