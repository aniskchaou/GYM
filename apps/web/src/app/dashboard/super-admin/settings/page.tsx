'use client';

import { useState } from 'react';
import { Settings, Globe, Bell, Shield, Mail, DollarSign, Save, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

const TABS = [
  { id: 'general',       label: 'General',       icon: Globe },
  { id: 'billing',       label: 'Billing',        icon: DollarSign },
  { id: 'notifications', label: 'Notifications',  icon: Bell },
  { id: 'security',      label: 'Security',       icon: Shield },
  { id: 'email',         label: 'Email',          icon: Mail },
];

function Field({ label, value, onChange, type = 'text', hint }: { label: string; value: string; onChange: (v: string) => void; type?: string; hint?: string }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {hint && <span className="ml-2 text-xs text-slate-400">{hint}</span>}
      <input type={type} value={value} onChange={e => onChange(e.target.value)} className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
    </label>
  );
}

function Toggle({ label, checked, onChange, desc }: { label: string; checked: boolean; onChange: (v: boolean) => void; desc?: string }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
      <div>
        <p className="text-sm font-medium text-slate-700">{label}</p>
        {desc && <p className="text-xs text-slate-400 mt-0.5">{desc}</p>}
      </div>
      <button onClick={() => onChange(!checked)} className={cn('relative inline-flex h-6 w-11 items-center rounded-full transition-colors', checked ? 'bg-indigo-600' : 'bg-slate-200')}>
        <span className={cn('inline-block h-4 w-4 rounded-full bg-white shadow transition-transform', checked ? 'translate-x-6' : 'translate-x-1')} />
      </button>
    </div>
  );
}

export default function SASettingsPage() {
  const [tab, setTab] = useState('general');
  const [saved, setSaved] = useState(false);

  const [general, setGeneral] = useState({ platformName: 'GymFlow', supportEmail: 'support@gymflow.com', defaultTimezone: 'UTC', defaultCurrency: 'USD', maintenanceMode: false });
  const [billing, setBilling] = useState({ trialDays: '14', defaultCommission: '20', starterPrice: '29', proPrice: '99', enterprisePrice: '299', stripeWebhookSecret: '' });
  const [notif, setNotif] = useState({ emailOnRegistration: true, emailOnPayment: true, slackWebhook: '', emailDigestFrequency: 'daily' });
  const [security, setSecurity] = useState({ requireEmailVerification: true, maxLoginAttempts: '5', sessionTimeoutMinutes: '60', twoFactorForAdmins: false, ipWhitelist: '' });
  const [email, setEmail] = useState({ smtpHost: 'smtp.mailgun.org', smtpPort: '587', smtpUser: '', smtpPassword: '', fromName: 'GymFlow', fromEmail: 'noreply@gymflow.com' });

  const handleSave = () => {
    toast.success('Settings saved');
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><Settings size={22} /> System Settings</h1>
        <p className="text-sm text-slate-500 mt-0.5">Configure platform-wide settings and defaults</p>
      </div>

      <div className="flex gap-6">
        {/* Tab nav */}
        <nav className="w-48 shrink-0 space-y-1">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} className={cn('flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors', tab === t.id ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50')}>
              <t.icon size={16} /> {t.label}
            </button>
          ))}
        </nav>

        {/* Tab content */}
        <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
          {tab === 'general' && <>
            <h2 className="font-semibold text-slate-800 text-lg">General Settings</h2>
            <Field label="Platform Name" value={general.platformName} onChange={v => setGeneral(g => ({ ...g, platformName: v }))} />
            <Field label="Support Email" value={general.supportEmail} onChange={v => setGeneral(g => ({ ...g, supportEmail: v }))} type="email" />
            <div className="grid grid-cols-2 gap-4">
              <Field label="Default Timezone" value={general.defaultTimezone} onChange={v => setGeneral(g => ({ ...g, defaultTimezone: v }))} hint="e.g. UTC, America/New_York" />
              <Field label="Default Currency" value={general.defaultCurrency} onChange={v => setGeneral(g => ({ ...g, defaultCurrency: v }))} hint="ISO 4217 code" />
            </div>
            <Toggle label="Maintenance Mode" checked={general.maintenanceMode} onChange={v => setGeneral(g => ({ ...g, maintenanceMode: v }))} desc="Show a maintenance page to all non-admin visitors" />
          </>}

          {tab === 'billing' && <>
            <h2 className="font-semibold text-slate-800 text-lg">Billing Configuration</h2>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Trial Period (days)" value={billing.trialDays} onChange={v => setBilling(b => ({ ...b, trialDays: v }))} type="number" />
              <Field label="Default Commission (%)" value={billing.defaultCommission} onChange={v => setBilling(b => ({ ...b, defaultCommission: v }))} type="number" hint="Applied to new gyms" />
              <Field label="Starter Plan Price ($)" value={billing.starterPrice} onChange={v => setBilling(b => ({ ...b, starterPrice: v }))} type="number" />
              <Field label="Professional Plan Price ($)" value={billing.proPrice} onChange={v => setBilling(b => ({ ...b, proPrice: v }))} type="number" />
              <Field label="Enterprise Plan Price ($)" value={billing.enterprisePrice} onChange={v => setBilling(b => ({ ...b, enterprisePrice: v }))} type="number" />
            </div>
            <Field label="Stripe Webhook Secret" value={billing.stripeWebhookSecret} onChange={v => setBilling(b => ({ ...b, stripeWebhookSecret: v }))} type="password" hint="whsec_..." />
          </>}

          {tab === 'notifications' && <>
            <h2 className="font-semibold text-slate-800 text-lg">Notification Settings</h2>
            <Toggle label="Email on New Registration" checked={notif.emailOnRegistration} onChange={v => setNotif(n => ({ ...n, emailOnRegistration: v }))} desc="Send admin email when a new gym registers" />
            <Toggle label="Email on Payment" checked={notif.emailOnPayment} onChange={v => setNotif(n => ({ ...n, emailOnPayment: v }))} desc="Notify admin on successful subscription payments" />
            <Field label="Slack Webhook URL" value={notif.slackWebhook} onChange={v => setNotif(n => ({ ...n, slackWebhook: v }))} hint="For alerts and notifications" />
            <div>
              <label className="text-sm font-medium text-slate-700">Digest Frequency</label>
              <select value={notif.emailDigestFrequency} onChange={e => setNotif(n => ({ ...n, emailDigestFrequency: e.target.value }))} className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                {['realtime', 'daily', 'weekly', 'never'].map(v => <option key={v}>{v}</option>)}
              </select>
            </div>
          </>}

          {tab === 'security' && <>
            <h2 className="font-semibold text-slate-800 text-lg">Security Settings</h2>
            <Toggle label="Require Email Verification" checked={security.requireEmailVerification} onChange={v => setSecurity(s => ({ ...s, requireEmailVerification: v }))} desc="Block login until email is verified" />
            <Toggle label="2FA for Admins" checked={security.twoFactorForAdmins} onChange={v => setSecurity(s => ({ ...s, twoFactorForAdmins: v }))} desc="Enforce two-factor authentication for SUPER_ADMIN accounts" />
            <div className="grid grid-cols-2 gap-4 pt-2">
              <Field label="Max Login Attempts" value={security.maxLoginAttempts} onChange={v => setSecurity(s => ({ ...s, maxLoginAttempts: v }))} type="number" />
              <Field label="Session Timeout (minutes)" value={security.sessionTimeoutMinutes} onChange={v => setSecurity(s => ({ ...s, sessionTimeoutMinutes: v }))} type="number" />
            </div>
            <Field label="IP Whitelist" value={security.ipWhitelist} onChange={v => setSecurity(s => ({ ...s, ipWhitelist: v }))} hint="Comma-separated, leave blank to allow all" />
          </>}

          {tab === 'email' && <>
            <h2 className="font-semibold text-slate-800 text-lg">Email (SMTP)</h2>
            <div className="grid grid-cols-2 gap-4">
              <Field label="SMTP Host" value={email.smtpHost} onChange={v => setEmail(e => ({ ...e, smtpHost: v }))} />
              <Field label="SMTP Port" value={email.smtpPort} onChange={v => setEmail(e => ({ ...e, smtpPort: v }))} type="number" />
              <Field label="SMTP Username" value={email.smtpUser} onChange={v => setEmail(e => ({ ...e, smtpUser: v }))} />
              <Field label="SMTP Password" value={email.smtpPassword} onChange={v => setEmail(e => ({ ...e, smtpPassword: v }))} type="password" />
              <Field label="From Name" value={email.fromName} onChange={v => setEmail(e => ({ ...e, fromName: v }))} />
              <Field label="From Email" value={email.fromEmail} onChange={v => setEmail(e => ({ ...e, fromEmail: v }))} type="email" />
            </div>
          </>}

          <div className="pt-2 border-t border-slate-100">
            <button onClick={handleSave} className={cn('flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors', saved ? 'bg-green-600 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700')}>
              {saved ? <><Check size={16} /> Saved!</> : <><Save size={16} /> Save Settings</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
