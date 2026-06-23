'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, Clock, Users, X } from 'lucide-react';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

const STATUS_STYLES: Record<string, string> = {
  CONFIRMED: 'bg-green-50 text-green-600',
  WAITLISTED: 'bg-yellow-50 text-yellow-600',
  CANCELLED: 'bg-slate-50 text-slate-400 line-through',
  ATTENDED: 'bg-blue-50 text-blue-600',
  NO_SHOW: 'bg-red-50 text-red-500',
};

export default function BookingsPage() {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: () => api.get('/bookings/my').then((r) => r.data),
  });

  const { data: upcoming } = useQuery({
    queryKey: ['upcoming-classes'],
    queryFn: () => api.get('/bookings/classes/upcoming').then((r) => r.data),
  });

  const cancel = useMutation({
    mutationFn: (bookingId: string) => api.delete(`/bookings/${bookingId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-bookings'] });
      toast.success('Booking cancelled');
    },
    onError: () => toast.error('Could not cancel booking'),
  });

  const book = useMutation({
    mutationFn: (scheduleId: string) => api.post(`/bookings/classes/${scheduleId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-bookings'] });
      qc.invalidateQueries({ queryKey: ['upcoming-classes'] });
      toast.success('Booked!');
    },
    onError: (err: any) => toast.error(err.response?.data?.message ?? 'Booking failed'),
  });

  const bookings: any[] = data?.bookings ?? data ?? [];
  const upcomingClasses: any[] = upcoming?.classes ?? upcoming ?? [];

  return (
    <div className="space-y-6">
      {/* Upcoming classes to book */}
      {upcomingClasses.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <h3 className="font-semibold text-slate-800 mb-4">Available Classes This Week</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingClasses.map((cls: any) => (
              <div key={cls.id} className="border border-slate-100 rounded-xl p-4 hover:border-indigo-200 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-slate-800 text-sm">{cls.class?.name ?? cls.name}</h4>
                  <span className="text-xs text-slate-400">{cls.dayOfWeek}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
                  <span className="flex items-center gap-1"><Clock size={11} />{cls.startTime} - {cls.endTime}</span>
                  <span className="flex items-center gap-1"><Users size={11} />{cls.currentBookings}/{cls.capacity}</span>
                </div>
                <button
                  onClick={() => book.mutate(cls.id)}
                  disabled={book.isPending || cls.currentBookings >= cls.capacity}
                  className="w-full text-xs font-semibold bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white py-1.5 rounded-lg transition-colors"
                >
                  {cls.currentBookings >= cls.capacity ? 'Full' : 'Book'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* My bookings */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">My Bookings</h3>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-slate-400 animate-pulse">Loading...</div>
        ) : bookings.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar size={40} className="mx-auto mb-3 text-slate-300" />
            <p className="text-slate-500 font-medium">No bookings yet</p>
            <p className="text-slate-400 text-sm mt-1">Browse classes above and book your first session.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {bookings.map((b: any) => (
              <div key={b.id} className="flex items-center justify-between px-5 py-3.5">
                <div>
                  <p className="font-medium text-sm text-slate-800">{b.classSchedule?.class?.name ?? b.className ?? 'Class'}</p>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><Clock size={11} />{b.classSchedule?.startTime ?? '--'} - {b.classSchedule?.endTime ?? '--'}</span>
                    {b.createdAt && <span className="flex items-center gap-1"><Calendar size={11} />{formatDate(b.createdAt)}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_STYLES[b.status] ?? 'bg-slate-50 text-slate-500'}`}>
                    {b.status}
                  </span>
                  {b.status === 'CONFIRMED' && (
                    <button
                      onClick={() => cancel.mutate(b.id)}
                      className="text-slate-400 hover:text-red-400 transition-colors"
                      title="Cancel booking"
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
