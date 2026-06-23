'use client';

import { Bell, Search } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { usePathname } from 'next/navigation';

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
  const { user } = useAuthStore();
  const title = pageTitles[pathname] ?? 'Dashboard';

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
      <h1 className="text-lg font-semibold text-slate-800">{title}</h1>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-1.5 text-sm text-slate-500">
          <Search size={14} />
          <span>Quick search…</span>
          <kbd className="text-xs bg-slate-200 px-1.5 py-0.5 rounded">⌘K</kbd>
        </div>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors">
          <Bell size={18} className="text-slate-600" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* Avatar */}
        {user && (
          <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold">
            {user.firstName[0]}{user.lastName[0]}
          </div>
        )}
      </div>
    </header>
  );
}
