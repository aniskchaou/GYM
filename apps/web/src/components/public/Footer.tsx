'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Dumbbell, Facebook, Instagram, Twitter, Youtube, Mail, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const SECTIONS = [
  {
    title: 'Product',
    links: [
      { href: '/pricing', label: 'Pricing' },
      { href: '/memberships', label: 'Memberships' },
      { href: '/free-trial', label: 'Free trial' },
      { href: '/auth/login', label: 'Sign in' },
    ],
  },
  {
    title: 'Explore',
    links: [
      { href: '/classes', label: 'Classes' },
      { href: '/trainers', label: 'Trainers' },
      { href: '/programs', label: 'Programs' },
      { href: '/nutrition', label: 'Nutrition' },
    ],
  },
  {
    title: 'Company',
    links: [
      { href: '/about', label: 'About' },
      { href: '/locations', label: 'Locations' },
      { href: '/events', label: 'Events' },
      { href: '/contact', label: 'Contact' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { href: '/blog', label: 'Blog' },
      { href: '/faq', label: 'FAQ' },
      { href: '/contact', label: 'Support' },
    ],
  },
];

export default function PublicFooter() {
  const [email, setEmail] = useState('');
  const subscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) return toast.error('Please enter a valid email');
    try {
      const subs = JSON.parse(localStorage.getItem('gf_subscribers') || '[]');
      subs.push({ email, ts: Date.now() });
      localStorage.setItem('gf_subscribers', JSON.stringify(subs));
    } catch {}
    toast.success('Subscribed! Check your inbox.');
    setEmail('');
  };

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-10 mb-12">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-indigo-500 p-1.5 rounded-lg">
                <Dumbbell size={18} className="text-white" />
              </div>
              <span className="text-lg font-bold text-white">GymFlow</span>
            </div>
            <p className="text-sm text-slate-400 mb-5 max-w-xs">
              Train smarter. Live stronger. Join thousands of members across our European network.
            </p>
            <form onSubmit={subscribe} className="flex gap-2 max-w-sm">
              <div className="flex-1 relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <button
                type="submit"
                className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 rounded-lg flex items-center justify-center"
                aria-label="Subscribe"
              >
                <ArrowRight size={16} />
              </button>
            </form>
            <div className="flex gap-3 mt-5">
              {[Instagram, Facebook, Twitter, Youtube].map((Icon, i) => (
                <a key={i} href="#" aria-label="social" className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center">
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {SECTIONS.map((s) => (
            <div key={s.title}>
              <h4 className="text-white font-semibold text-sm mb-4">{s.title}</h4>
              <ul className="space-y-2.5 text-sm">
                {s.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-slate-400 hover:text-white transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <span>© {new Date().getFullYear()} GymFlow. All rights reserved.</span>
          <div className="flex gap-5">
            <a href="#" className="hover:text-white">Privacy</a>
            <a href="#" className="hover:text-white">Terms</a>
            <a href="#" className="hover:text-white">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
