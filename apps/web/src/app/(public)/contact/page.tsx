'use client';

import { useState, FormEvent } from 'react';
import { Mail, MapPin, Phone, MessageCircle, Send, Bot } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', topic: 'general', message: '' });
  const [sending, setSending] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error('Please fill in all required fields.');
      return;
    }
    setSending(true);
    setTimeout(() => {
      try {
        const list = JSON.parse(localStorage.getItem('gf_contacts') || '[]');
        list.push({ ...form, at: new Date().toISOString() });
        localStorage.setItem('gf_contacts', JSON.stringify(list));
      } catch {}
      toast.success('Got it — we’ll reply within 1 business day.');
      setForm({ name: '', email: '', topic: 'general', message: '' });
      setSending(false);
    }, 700);
  };

  return (
    <div>
      <section className="pt-20 pb-10 px-6 text-center bg-gradient-to-b from-slate-50 to-white">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">Get in touch</h1>
        <p className="text-slate-500 max-w-xl mx-auto">Questions about plans, classes, or partnerships? We&apos;re here.</p>
      </section>

      <section className="px-6 pb-20">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6">
            <form onSubmit={submit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <label className="text-xs font-semibold text-slate-600">
                  Name *
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-normal"
                  />
                </label>
                <label className="text-xs font-semibold text-slate-600">
                  Email *
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-normal"
                  />
                </label>
              </div>
              <label className="text-xs font-semibold text-slate-600 block">
                Topic
                <select
                  value={form.topic}
                  onChange={(e) => setForm({ ...form, topic: e.target.value })}
                  className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-normal"
                >
                  <option value="general">General question</option>
                  <option value="membership">Membership & billing</option>
                  <option value="trainer">Personal training</option>
                  <option value="partnership">Partnership / press</option>
                  <option value="support">Technical support</option>
                </select>
              </label>
              <label className="text-xs font-semibold text-slate-600 block">
                Message *
                <textarea
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-normal resize-none"
                />
              </label>
              <button
                disabled={sending}
                type="submit"
                className="inline-flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white font-semibold px-5 py-2.5 rounded-xl text-sm"
              >
                <Send size={14} /> {sending ? 'Sending…' : 'Send message'}
              </button>
            </form>
          </div>

          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5">
              <h3 className="font-bold text-sm text-slate-900 mb-3">Reach us</h3>
              <div className="text-sm text-slate-600 space-y-2.5">
                <div className="flex items-center gap-2">
                  <Mail size={14} className="text-indigo-500" /> hello@gymflow.io
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-indigo-500" /> +31 20 555 0100
                </div>
                <div className="flex items-start gap-2">
                  <MapPin size={14} className="text-indigo-500 mt-0.5" /> Damrak 102, Amsterdam
                </div>
              </div>
            </div>
            <a
              href="https://wa.me/31205550100"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-green-500 hover:bg-green-600 text-white p-4 rounded-2xl font-semibold text-sm"
            >
              <MessageCircle size={18} /> Chat on WhatsApp
            </a>
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <Bot size={18} />
                <h3 className="font-bold text-sm">Ask Flo, our AI coach</h3>
              </div>
              <p className="text-xs text-indigo-100 mb-3">Instant answers about classes, schedules, and pricing — 24/7.</p>
              <button
                onClick={() => toast('Flo is launching soon!', { icon: '🤖' })}
                className="w-full bg-white/15 hover:bg-white/25 text-white text-xs font-semibold py-2 rounded-lg"
              >
                Open chat
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
