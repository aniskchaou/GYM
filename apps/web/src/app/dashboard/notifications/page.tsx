'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCheck, Info, AlertTriangle, CreditCard, Calendar, Megaphone } from 'lucide-react';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

const TYPE_ICON: Record<string, React.ReactNode> = {
  INFO: <Info size={16} className="text-blue-400" />,
  WARNING: <AlertTriangle size={16} className="text-yellow-400" />,
  PAYMENT_DUE: <CreditCard size={16} className="text-red-400" />,
  CLASS_REMINDER: <Calendar size={16} className="text-indigo-400" />,
  PROMOTION: <Megaphone size={16} className="text-green-400" />,
};

export default function NotificationsPage() {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get('/notifications').then((r) => r.data),
  });

  const markAllRead = useMutation({
    mutationFn: () => api.patch('/notifications/mark-all-read'),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('All marked as read');
    },
  });

  const markRead = useMutation({
    mutationFn: (id: string) => api.patch(`/notifications/${id}/read`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const notifications: any[] = data?.notifications ?? data ?? [];
  const unreadCount = notifications.filter((n: any) => !n.isRead).length;

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Notifications</h2>
          {unreadCount > 0 && (
            <p className="text-sm text-slate-500 mt-0.5">{unreadCount} unread</p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllRead.mutate()}
            className="flex items-center gap-1.5 text-sm text-indigo-500 hover:text-indigo-700 font-medium transition-colors"
          >
            <CheckCheck size={15} /> Mark all read
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center animate-pulse text-slate-400">Loading...</div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center">
            <Bell size={40} className="mx-auto mb-3 text-slate-300" />
            <p className="text-slate-500 font-medium">All caught up!</p>
            <p className="text-slate-400 text-sm mt-1">No notifications at the moment.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {notifications.map((n: any) => (
              <div
                key={n.id}
                onClick={() => !n.isRead && markRead.mutate(n.id)}
                className={cn(
                  'flex items-start gap-4 px-5 py-4 cursor-pointer hover:bg-slate-50/60 transition-colors',
                  !n.isRead && 'bg-indigo-50/30'
                )}
              >
                <div className="w-8 h-8 rounded-full bg-white border border-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                  {TYPE_ICON[n.type] ?? <Bell size={14} className="text-slate-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn('text-sm text-slate-800', !n.isRead && 'font-semibold')}>{n.title ?? n.message}</p>
                  {n.title && n.message && (
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                  )}
                  <p className="text-xs text-slate-400 mt-1">{n.createdAt ? formatDate(n.createdAt) : ''}</p>
                </div>
                {!n.isRead && (
                  <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2 shrink-0" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
