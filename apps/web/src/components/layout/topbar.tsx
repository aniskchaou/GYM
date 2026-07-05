'use client';

import { useEffect, useMemo, useState } from 'react';
import { Bell, Search } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { usePathname, useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const pageTitles: Record<string, string> = {
  '/dashboard/owner': 'Owner Dashboard',
  '/dashboard/reception': 'Reception Dashboard',
  '/dashboard/trainer': 'Trainer Dashboard',
  '/dashboard/member': 'Member Dashboard',
  '/dashboard/members': 'Members',
  '/dashboard/attendance': 'Attendance',
  '/dashboard/classes': 'Classes & Schedule',
  '/dashboard/bookings': 'My Bookings',
  '/dashboard/trainers': 'Trainers',
  '/dashboard/memberships': 'Memberships',
  '/dashboard/my-membership': 'My Membership',
  '/dashboard/payments': 'Payments',
  '/dashboard/reports': 'Analytics & Reports',
  '/dashboard/branches': 'Branches',
  '/dashboard/workouts': 'Workouts',
  '/dashboard/notifications': 'Notifications',
  '/dashboard/settings': 'Settings',
};

export function TopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();
  const [openSearch, setOpenSearch] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);
  const [query, setQuery] = useState('');
  const title = pageTitles[pathname] ?? 'Dashboard';

  const quickLinks = useMemo(() => {
    const links = [
      { label: 'Dashboard', href: '/dashboard/owner' },
      { label: 'Members', href: '/dashboard/members' },
      { label: 'Attendance', href: '/dashboard/attendance' },
      { label: 'Payments', href: '/dashboard/payments' },
      { label: 'Notifications', href: '/dashboard/notifications' },
      { label: 'Change Password', href: '/dashboard/change-password' },
    ];

    if (user?.role === 'MEMBER') {
      return [
        { label: 'Member Dashboard', href: '/dashboard/member' },
        { label: 'My Profile', href: '/dashboard/member/profile' },
        { label: 'My Membership', href: '/dashboard/my-membership' },
        { label: 'Book Classes', href: '/dashboard/bookings' },
        { label: 'Notifications', href: '/dashboard/notifications' },
        { label: 'Change Password', href: '/dashboard/change-password' },
      ];
    }

    if (user?.role === 'TRAINER') {
      return [
        { label: 'Trainer Dashboard', href: '/dashboard/trainer' },
        { label: 'My Clients', href: '/dashboard/trainer/clients' },
        { label: 'PT Sessions', href: '/dashboard/pt-sessions' },
        { label: 'Classes', href: '/dashboard/classes' },
        { label: 'Notifications', href: '/dashboard/notifications' },
        { label: 'Change Password', href: '/dashboard/change-password' },
      ];
    }

    if (user?.role === 'RECEPTIONIST') {
      return [
        { label: 'Reception Dashboard', href: '/dashboard/reception' },
        { label: 'Collect Payment', href: '/dashboard/collect-payment' },
        { label: 'Approvals', href: '/dashboard/approvals' },
        { label: 'Attendance', href: '/dashboard/attendance' },
        { label: 'Notifications', href: '/dashboard/notifications' },
        { label: 'Change Password', href: '/dashboard/change-password' },
      ];
    }

    return links;
  }, [user?.role]);

  const filteredLinks = useMemo(() => {
    if (!query.trim()) return quickLinks;
    return quickLinks.filter((l) => l.label.toLowerCase().includes(query.toLowerCase()));
  }, [quickLinks, query]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpenSearch(true);
      }
      if (e.key === 'Escape') {
        setOpenSearch(false);
        setOpenMenu(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const go = (href: string) => {
    router.push(href);
    setOpenSearch(false);
    setOpenMenu(false);
    setQuery('');
  };

  const signOut = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      clearAuth();
      router.replace('/auth/login');
      toast.success('Logged out');
    }
  };

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
      <h1 className="text-lg font-semibold text-slate-800">{title}</h1>

      <div className="flex items-center gap-3">
        {/* Search */}
        <button
          type="button"
          onClick={() => setOpenSearch(true)}
          className="hidden md:flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-1.5 text-sm text-slate-500 hover:bg-slate-200 transition-colors"
        >
          <Search size={14} />
          <span>Quick search…</span>
          <kbd className="text-xs bg-slate-200 px-1.5 py-0.5 rounded">Ctrl+K</kbd>
        </button>

        {/* Notifications */}
        <button
          type="button"
          onClick={() => router.push('/dashboard/notifications')}
          className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="Open notifications"
        >
          <Bell size={18} className="text-slate-600" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* Avatar */}
        {user && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenMenu((v) => !v)}
              className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold"
              aria-label="Open profile menu"
            >
              {user.firstName[0]}{user.lastName[0]}
            </button>
            {openMenu && (
              <div className="absolute right-0 mt-2 w-44 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-50">
                <button type="button" onClick={() => go(user.role === 'MEMBER' ? '/dashboard/member/profile' : '/dashboard/settings')} className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">Profile / Settings</button>
                <button type="button" onClick={() => go('/dashboard/change-password')} className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">Change Password</button>
                <button type="button" onClick={signOut} className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50">Sign out</button>
              </div>
            )}
          </div>
        )}
      </div>

      {openSearch && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-start justify-center p-4" onClick={() => setOpenSearch(false)}>
          <div className="w-full max-w-xl bg-white rounded-xl shadow-xl border border-slate-200" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 border-b border-slate-100 px-3 py-2">
              <Search size={16} className="text-slate-500" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search pages..."
                className="w-full text-sm py-1.5 focus:outline-none"
              />
            </div>
            <div className="max-h-80 overflow-y-auto py-1">
              {filteredLinks.length === 0 ? (
                <p className="px-3 py-2 text-sm text-slate-400">No matching pages</p>
              ) : (
                filteredLinks.map((link) => (
                  <button
                    key={link.href}
                    type="button"
                    onClick={() => go(link.href)}
                    className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    {link.label}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
