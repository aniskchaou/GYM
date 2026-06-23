'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, CreditCard, Calendar, Dumbbell,
  BarChart2, Bell, Settings, LogOut, UserCheck, ShoppingBag,
  Building2, Globe, Percent, MessageSquare, Puzzle, Shield,
  UserCog, Clock, ChevronDown, ChevronRight,
  Package, KeyRound, DollarSign, Briefcase, ShieldCheck, FileText,
  Wrench, TrendingUp, CheckSquare, Plus, ClipboardList,
  User, Activity, Star,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { useRouter } from 'next/navigation';
import { cn, getInitials } from '@/lib/utils';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useState } from 'react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  roles: string[];
  group?: string;
}

const navItems: NavItem[] = [
  // ── Super Admin ──────────────────────────────────────────────────────
  { label: 'Overview',        href: '/dashboard/super-admin',              icon: LayoutDashboard, roles: ['SUPER_ADMIN'], group: 'Platform' },
  { label: 'Gym Organizations',href: '/dashboard/super-admin/gyms',        icon: Building2,       roles: ['SUPER_ADMIN'], group: 'Platform' },
  { label: 'Registrations',   href: '/dashboard/super-admin/registrations', icon: Clock,          roles: ['SUPER_ADMIN'], group: 'Platform' },
  { label: 'Subscription Plans',href: '/dashboard/super-admin/plans',      icon: CreditCard,      roles: ['SUPER_ADMIN'], group: 'Platform' },
  { label: 'All Users',       href: '/dashboard/super-admin/users',        icon: Users,           roles: ['SUPER_ADMIN'], group: 'Management' },
  { label: 'Support Tickets', href: '/dashboard/super-admin/support',      icon: MessageSquare,   roles: ['SUPER_ADMIN'], group: 'Management' },
  { label: 'Impersonate',     href: '/dashboard/super-admin/impersonate',  icon: UserCog,         roles: ['SUPER_ADMIN'], group: 'Management' },
  { label: 'Analytics',       href: '/dashboard/super-admin/analytics',    icon: BarChart2,       roles: ['SUPER_ADMIN'], group: 'Intelligence' },
  { label: 'Billing',         href: '/dashboard/super-admin/billing',      icon: ShoppingBag,     roles: ['SUPER_ADMIN'], group: 'Intelligence' },
  { label: 'Audit Logs',      href: '/dashboard/audit',                    icon: Shield,          roles: ['SUPER_ADMIN'], group: 'Intelligence' },
  { label: 'System Settings', href: '/dashboard/super-admin/settings',     icon: Settings,        roles: ['SUPER_ADMIN'], group: 'Config' },
  { label: 'Integrations',    href: '/dashboard/super-admin/integrations', icon: Puzzle,          roles: ['SUPER_ADMIN'], group: 'Config' },

  // ── Gym Owner / Branch Manager ───────────────────────────────────────
  { label: 'Dashboard',      href: '/dashboard/owner',         icon: LayoutDashboard, roles: ['GYM_OWNER', 'BRANCH_MANAGER'] },
  { label: 'My Gyms',        href: '/dashboard/owner/gyms',    icon: Building2,       roles: ['GYM_OWNER'] },
  { label: 'Members',        href: '/dashboard/members',       icon: Users,           roles: ['GYM_OWNER', 'BRANCH_MANAGER', 'RECEPTIONIST'] },
  { label: 'Approvals',      href: '/dashboard/approvals',     icon: CheckSquare,     roles: ['GYM_OWNER', 'BRANCH_MANAGER', 'RECEPTIONIST'] },
  { label: 'Staff',          href: '/dashboard/staff',         icon: Briefcase,       roles: ['GYM_OWNER', 'BRANCH_MANAGER'] },
  { label: 'Attendance',     href: '/dashboard/attendance',    icon: UserCheck,       roles: ['GYM_OWNER', 'BRANCH_MANAGER', 'RECEPTIONIST'] },
  { label: 'Classes',        href: '/dashboard/classes',       icon: Calendar,        roles: ['GYM_OWNER', 'BRANCH_MANAGER', 'RECEPTIONIST', 'TRAINER', 'MEMBER'] },
  { label: 'My Bookings',    href: '/dashboard/bookings',      icon: Calendar,        roles: ['MEMBER'] },
  { label: 'Trainers',       href: '/dashboard/trainers',      icon: Dumbbell,        roles: ['GYM_OWNER', 'BRANCH_MANAGER'] },
  { label: 'Memberships',    href: '/dashboard/memberships',   icon: CreditCard,      roles: ['GYM_OWNER', 'BRANCH_MANAGER', 'RECEPTIONIST'] },
  { label: 'My Membership',  href: '/dashboard/my-membership', icon: CreditCard,      roles: ['MEMBER'] },
  { label: 'Payments',       href: '/dashboard/payments',      icon: ShoppingBag,     roles: ['GYM_OWNER', 'BRANCH_MANAGER'] },
  { label: 'Payroll',        href: '/dashboard/payroll',       icon: DollarSign,      roles: ['GYM_OWNER', 'BRANCH_MANAGER'] },
  { label: 'Schedule',       href: '/dashboard/schedule',      icon: Clock,           roles: ['GYM_OWNER', 'BRANCH_MANAGER'] },
  { label: 'Analytics',      href: '/dashboard/reports',       icon: BarChart2,       roles: ['GYM_OWNER', 'BRANCH_MANAGER'] },
  { label: 'Branches',       href: '/dashboard/branches',      icon: Globe,           roles: ['GYM_OWNER'] },
  { label: 'Equipment',      href: '/dashboard/equipment',     icon: Dumbbell,        roles: ['GYM_OWNER', 'BRANCH_MANAGER'] },
  { label: 'Maintenance',    href: '/dashboard/maintenance',   icon: Wrench,          roles: ['GYM_OWNER', 'BRANCH_MANAGER'] },
  { label: 'Inventory',      href: '/dashboard/inventory',     icon: Package,         roles: ['GYM_OWNER', 'BRANCH_MANAGER'] },
  { label: 'Access Control', href: '/dashboard/access',        icon: KeyRound,        roles: ['GYM_OWNER', 'BRANCH_MANAGER'] },
  { label: 'Complaints',     href: '/dashboard/complaints',    icon: MessageSquare,   roles: ['GYM_OWNER', 'BRANCH_MANAGER'] },
  { label: 'Leads',          href: '/dashboard/leads',         icon: TrendingUp,      roles: ['GYM_OWNER', 'BRANCH_MANAGER'] },
  { label: 'Policies',       href: '/dashboard/policies',      icon: ShieldCheck,     roles: ['GYM_OWNER'] },
  { label: 'My Workouts',    href: '/dashboard/workouts',      icon: Dumbbell,        roles: ['MEMBER', 'TRAINER'] },
  { label: 'Notifications',  href: '/dashboard/notifications', icon: Bell,            roles: ['GYM_OWNER', 'BRANCH_MANAGER', 'RECEPTIONIST', 'TRAINER', 'MEMBER'] },
  { label: 'Settings',       href: '/dashboard/settings',      icon: Settings,        roles: ['GYM_OWNER', 'BRANCH_MANAGER'] },

  // ── Receptionist / Trainer ───────────────────────────────────────────
  { label: 'Dashboard',       href: '/dashboard/reception',      icon: LayoutDashboard, roles: ['RECEPTIONIST'] },
  { label: 'Check-in',        href: '/dashboard/attendance',     icon: UserCheck,       roles: ['RECEPTIONIST'] },
  { label: 'Visitors',        href: '/dashboard/visitors',       icon: UserCog,         roles: ['RECEPTIONIST'] },
  { label: 'Register Member', href: '/dashboard/members/new',    icon: Plus,            roles: ['RECEPTIONIST'] },
  { label: 'Members',         href: '/dashboard/members',        icon: Users,           roles: ['RECEPTIONIST'] },
  { label: 'Approvals',       href: '/dashboard/approvals',      icon: CheckSquare,     roles: ['RECEPTIONIST'] },
  { label: 'Memberships',     href: '/dashboard/memberships',    icon: CreditCard,      roles: ['RECEPTIONIST'] },
  { label: 'Classes',         href: '/dashboard/classes',        icon: Calendar,        roles: ['RECEPTIONIST'] },
  { label: 'Collect Payment', href: '/dashboard/collect-payment',icon: DollarSign,      roles: ['RECEPTIONIST'] },
  { label: 'Invoices',        href: '/dashboard/invoices',       icon: FileText,        roles: ['RECEPTIONIST'] },
  { label: 'Daily Report',    href: '/dashboard/daily-report',   icon: BarChart2,       roles: ['RECEPTIONIST'] },
  { label: 'Complaints',      href: '/dashboard/complaints',     icon: MessageSquare,   roles: ['RECEPTIONIST'] },
  { label: 'Notifications',   href: '/dashboard/notifications',  icon: Bell,            roles: ['RECEPTIONIST'] },

  { label: 'Dashboard',     href: '/dashboard/trainer',           icon: LayoutDashboard, roles: ['TRAINER'] },
  { label: 'My Clients',    href: '/dashboard/trainer/clients',   icon: Users,           roles: ['TRAINER'] },
  { label: 'PT Sessions',   href: '/dashboard/pt-sessions',       icon: Calendar,        roles: ['TRAINER'] },
  { label: 'Workout Plans', href: '/dashboard/workout-plans',     icon: Dumbbell,        roles: ['TRAINER'] },
  { label: 'Assessments',   href: '/dashboard/assessments',       icon: ClipboardList,   roles: ['TRAINER'] },
  { label: 'Progress',      href: '/dashboard/trainer/progress',  icon: TrendingUp,      roles: ['TRAINER'] },
  { label: 'Classes',       href: '/dashboard/classes',           icon: Calendar,        roles: ['TRAINER'] },
  { label: 'Attendance',    href: '/dashboard/attendance',        icon: UserCheck,       roles: ['TRAINER'] },
  { label: 'Messages',      href: '/dashboard/messages',          icon: MessageSquare,   roles: ['TRAINER'] },
  { label: 'My Workouts',   href: '/dashboard/workouts',          icon: Dumbbell,        roles: ['TRAINER'] },
  { label: 'Notifications', href: '/dashboard/notifications',     icon: Bell,            roles: ['TRAINER'] },

  { label: 'Dashboard',      href: '/dashboard/member',              icon: LayoutDashboard, roles: ['MEMBER'] },
  { label: 'My Profile',     href: '/dashboard/member/profile',      icon: User,            roles: ['MEMBER'] },
  { label: 'My Membership',  href: '/dashboard/my-membership',       icon: CreditCard,      roles: ['MEMBER'] },
  { label: 'My Progress',    href: '/dashboard/member/progress',     icon: TrendingUp,      roles: ['MEMBER'] },
  { label: 'Book Classes',   href: '/dashboard/bookings',            icon: Calendar,        roles: ['MEMBER'] },
  { label: 'Classes',        href: '/dashboard/classes',             icon: Calendar,        roles: ['MEMBER'] },
  { label: 'Workout Plans',  href: '/dashboard/workout-plans',       icon: Dumbbell,        roles: ['MEMBER'] },
  { label: 'Diet Plans',     href: '/dashboard/ai-diet',             icon: Activity,        roles: ['MEMBER'] },
  { label: 'My Workouts',    href: '/dashboard/workouts',            icon: Dumbbell,        roles: ['MEMBER'] },
  { label: 'My Invoices',    href: '/dashboard/member/invoices',     icon: FileText,        roles: ['MEMBER'] },
  { label: 'Messages',       href: '/dashboard/messages',            icon: MessageSquare,   roles: ['MEMBER'] },
  { label: 'Feedback',       href: '/dashboard/member/feedback',     icon: Star,            roles: ['MEMBER'] },
  { label: 'Notifications',  href: '/dashboard/notifications',       icon: Bell,            roles: ['MEMBER'] },
];

const SA_GROUPS = ['Platform', 'Management', 'Intelligence', 'Config'];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const isSA = user?.role === 'SUPER_ADMIN';
  const visible = navItems.filter((n) => user && n.roles.includes(user.role));

  const handleLogout = async () => {
    try { await api.post('/auth/logout'); } finally {
      clearAuth();
      router.replace('/auth/login');
      toast.success('Logged out');
    }
  };

  const toggleGroup = (g: string) => setCollapsed(c => ({ ...c, [g]: !c[g] }));

  return (
    <aside className="w-64 bg-slate-900 flex flex-col h-full shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-6 py-5 border-b border-slate-800">
        <div className="bg-indigo-500 p-1.5 rounded-lg">
          <Dumbbell size={18} className="text-white" />
        </div>
        <span className="text-lg font-bold text-white">GymFlow</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {isSA ? (
          // ── Grouped SA navigation ──────────────────────────────────
          SA_GROUPS.map(group => {
            const items = visible.filter(n => n.group === group);
            if (items.length === 0) return null;
            const isOpen = !collapsed[group];
            return (
              <div key={group}>
                <button onClick={() => toggleGroup(group)} className="flex items-center justify-between w-full px-2 py-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hover:text-slate-300">
                  {group}
                  {isOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                </button>
                {isOpen && items.map(item => {
                  const active = pathname === item.href || (item.href !== '/dashboard/super-admin' && pathname.startsWith(item.href + '/'));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ml-1',
                        active ? 'bg-indigo-500/20 text-indigo-300' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800',
                      )}
                    >
                      <item.icon size={15} className={active ? 'text-indigo-400' : ''} />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            );
          })
        ) : (
          // ── Flat navigation for other roles ────────────────────────
          visible.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={`${item.href}-${item.label}`}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  active ? 'bg-indigo-500/20 text-indigo-300' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800',
                )}
              >
                <item.icon size={16} className={active ? 'text-indigo-400' : ''} />
                {item.label}
              </Link>
            );
          })
        )}
      </nav>

      {/* User footer */}
      {user && (
        <div className="px-3 pb-4 border-t border-slate-800 pt-3">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold">
              {getInitials(user.firstName, user.lastName)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.firstName} {user.lastName}</p>
              <p className="text-xs text-slate-400 truncate">{user.role.replace(/_/g, ' ')}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors mt-1"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      )}
    </aside>
  );
}
