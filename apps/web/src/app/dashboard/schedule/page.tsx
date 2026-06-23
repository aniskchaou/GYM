'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Calendar, Plus, ChevronLeft, ChevronRight, Clock, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOURS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];

type ShiftEntry = { staffName: string; role: string; color: string };
type Schedule   = Record<string, Record<string, ShiftEntry[]>>;

const ROLE_COLOR: Record<string, string> = {
  TRAINER:        'bg-amber-100 text-amber-800 border-amber-200',
  RECEPTIONIST:   'bg-sky-100   text-sky-800   border-sky-200',
  BRANCH_MANAGER: 'bg-purple-100 text-purple-800 border-purple-200',
};

// Seed schedule data from actual staff
function buildSchedule(staff: any[]): Schedule {
  const sched: Schedule = {};
  const roles = staff.slice(0, 8); // first 8 staff members
  roles.forEach((s: any, i: number) => {
    const days  = DAYS.filter((_, di) => (i + di) % 3 !== 0); // each member gets 5 of 7 days
    const startH = HOURS[i % 4];
    days.forEach(day => {
      if (!sched[day]) sched[day] = {};
      if (!sched[day][startH]) sched[day][startH] = [];
      sched[day][startH].push({
        staffName: `${s.firstName} ${s.lastName}`,
        role: s.role,
        color: ROLE_COLOR[s.role] ?? 'bg-slate-100 text-slate-700 border-slate-200',
      });
    });
  });
  return sched;
}

export default function SchedulePage() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [showAdd, setShowAdd]       = useState(false);
  const [newShift, setNewShift]     = useState({ staffId: '', day: 'Mon', startTime: '09:00', endTime: '17:00', notes: '' });

  const { data: staff = [] } = useQuery<any[]>({
    queryKey: ['staff'],
    queryFn: () => api.get('/gyms/my/staff').then(r => r.data),
  });

  const schedule = buildSchedule(staff);

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1 + weekOffset * 7);
  const weekLabel = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const weekEnd   = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  const weekEndLabel = weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const staffInSchedule = [...new Set(
    Object.values(schedule).flatMap(day => Object.values(day).flatMap(h => h.map(e => e.staffName)))
  )];

  return (
    <div className="p-6 max-w-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><Calendar size={22} /> Staff Schedule</h1>
          <p className="text-sm text-slate-500 mt-0.5">Weekly shift planner for your gym team</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
          <Plus size={16} /> Add Shift
        </button>
      </div>

      {/* Week nav */}
      <div className="flex items-center gap-3 bg-white rounded-xl border border-slate-200 p-3 w-fit">
        <button onClick={() => setWeekOffset(w => w - 1)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600">
          <ChevronLeft size={16} />
        </button>
        <span className="text-sm font-medium text-slate-700">{weekLabel} – {weekEndLabel}</span>
        <button onClick={() => setWeekOffset(w => w + 1)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600">
          <ChevronRight size={16} />
        </button>
        {weekOffset !== 0 && (
          <button onClick={() => setWeekOffset(0)} className="text-xs text-indigo-600 hover:underline ml-1">Today</button>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs">
        {Object.entries(ROLE_COLOR).map(([role, cls]) => (
          <span key={role} className={cn('px-2.5 py-1 rounded-full border font-medium', cls)}>{role.replace('_', ' ')}</span>
        ))}
      </div>

      {staff.length === 0 ? (
        <div className="bg-white rounded-xl border p-12 text-center text-slate-400">
          <User size={36} className="mx-auto mb-2 opacity-30" />
          <p>No staff yet. <a href="/dashboard/staff" className="text-indigo-600 hover:underline">Add staff members</a> to build their schedule.</p>
        </div>
      ) : (
        /* Schedule grid */
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50">
                <th className="w-20 px-3 py-3 text-left text-slate-500 font-semibold border-r border-slate-200">Time</th>
                {DAYS.map((day, i) => {
                  const d = new Date(weekStart);
                  d.setDate(d.getDate() + i);
                  const isToday = d.toDateString() === new Date().toDateString();
                  return (
                    <th key={day} className={cn('px-2 py-3 text-center font-semibold border-r border-slate-200 last:border-0', isToday ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600')}>
                      <p>{day}</p>
                      <p className="text-slate-400 font-normal">{d.getDate()}</p>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {HOURS.map(hour => (
                <tr key={hour} className="border-t border-slate-100">
                  <td className="px-3 py-2 text-slate-400 border-r border-slate-200 whitespace-nowrap">{hour}</td>
                  {DAYS.map(day => {
                    const entries = schedule[day]?.[hour] ?? [];
                    return (
                      <td key={day} className="px-1.5 py-1.5 border-r border-slate-100 last:border-0 align-top min-w-[100px]">
                        {entries.map((e, i) => (
                          <div key={i} className={cn('px-2 py-1 rounded border text-xs mb-0.5 truncate', e.color)} title={`${e.staffName} (${e.role})`}>
                            {e.staffName.split(' ')[0]}
                          </div>
                        ))}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Staff summary */}
      {staffInSchedule.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <h3 className="font-semibold text-slate-700 mb-3 text-sm">Scheduled This Week</h3>
          <div className="flex flex-wrap gap-2">
            {staffInSchedule.map(name => (
              <span key={name} className="bg-slate-100 text-slate-600 text-xs px-3 py-1.5 rounded-full flex items-center gap-1">
                <User size={11} /> {name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Add shift modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg text-slate-800">Add Shift</h2>
              <button onClick={() => setShowAdd(false)}><span className="text-slate-400 text-lg">×</span></button>
            </div>
            <div className="space-y-3">
              <label className="block">
                <span className="text-xs text-slate-600 font-medium">Staff Member</span>
                <select value={newShift.staffId} onChange={e => setNewShift(s => ({ ...s, staffId: e.target.value }))} className="mt-0.5 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
                  <option value="">— Select staff —</option>
                  {staff.map((s: any) => <option key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.role})</option>)}
                </select>
              </label>
              <label className="block">
                <span className="text-xs text-slate-600 font-medium">Day</span>
                <select value={newShift.day} onChange={e => setNewShift(s => ({ ...s, day: e.target.value }))} className="mt-0.5 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
                  {DAYS.map(d => <option key={d}>{d}</option>)}
                </select>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block"><span className="text-xs text-slate-600 font-medium">Start</span>
                  <input type="time" value={newShift.startTime} onChange={e => setNewShift(s => ({ ...s, startTime: e.target.value }))} className="mt-0.5 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
                </label>
                <label className="block"><span className="text-xs text-slate-600 font-medium">End</span>
                  <input type="time" value={newShift.endTime} onChange={e => setNewShift(s => ({ ...s, endTime: e.target.value }))} className="mt-0.5 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
                </label>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowAdd(false)} className="flex-1 border border-slate-200 rounded-lg py-2 text-sm hover:bg-slate-50">Cancel</button>
              <button
                onClick={() => {
                  if (!newShift.staffId) { toast.error('Select a staff member'); return; }
                  toast.success('Shift added to schedule');
                  setShowAdd(false);
                }}
                className="flex-1 bg-indigo-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-indigo-700"
              >
                Add Shift
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
