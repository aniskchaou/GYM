'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dumbbell, Filter, ChevronDown } from 'lucide-react';
import api from '@/lib/api';

const CATEGORIES = ['ALL', 'STRENGTH', 'CARDIO', 'FLEXIBILITY', 'BALANCE', 'CORE', 'HIIT', 'YOGA', 'PILATES'];

const DIFFICULTY_BADGE: Record<string, string> = {
  BEGINNER: 'bg-green-50 text-green-600',
  INTERMEDIATE: 'bg-yellow-50 text-yellow-600',
  ADVANCED: 'bg-red-50 text-red-500',
  EXPERT: 'bg-purple-50 text-purple-600',
};

const CATEGORY_COLORS: Record<string, string> = {
  STRENGTH: 'bg-red-50 text-red-600',
  CARDIO: 'bg-orange-50 text-orange-600',
  FLEXIBILITY: 'bg-green-50 text-green-600',
  BALANCE: 'bg-blue-50 text-blue-600',
  CORE: 'bg-indigo-50 text-indigo-600',
  HIIT: 'bg-pink-50 text-pink-600',
  YOGA: 'bg-teal-50 text-teal-600',
  PILATES: 'bg-purple-50 text-purple-600',
};

export default function WorkoutsPage() {
  const [category, setCategory] = useState('ALL');

  const { data, isLoading } = useQuery({
    queryKey: ['workouts', category],
    queryFn: () => api.get(`/workouts${category !== 'ALL' ? `?category=${category}` : ''}`).then((r) => r.data),
  });

  const workouts: any[] = data?.workouts ?? data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Workout Library</h2>
          <p className="text-sm text-slate-500 mt-0.5">{workouts.length} exercise{workouts.length !== 1 ? 's' : ''} available</p>
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-slate-400" />
          <div className="relative">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="text-sm border border-slate-200 rounded-xl px-3 py-2 pr-8 appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
            >
              {CATEGORIES.map((c) => <option key={c} value={c}>{c === 'ALL' ? 'All Categories' : c}</option>)}
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
          {Array.from({ length: 9 }).map((_, i) => <div key={i} className="bg-white rounded-2xl h-40 shadow-sm" />)}
        </div>
      ) : workouts.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-100">
          <Dumbbell size={40} className="mx-auto mb-3 text-slate-300" />
          <p className="text-slate-500 font-medium">No workouts found</p>
          <p className="text-slate-400 text-sm mt-1">
            {category !== 'ALL' ? `No workouts in the ${category} category.` : 'The workout library is empty.'}
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {workouts.map((w: any) => (
            <div key={w.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                  <Dumbbell size={18} className="text-slate-500" />
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${DIFFICULTY_BADGE[w.difficultyLevel] ?? 'bg-slate-50 text-slate-500'}`}>
                  {w.difficultyLevel ?? 'All levels'}
                </span>
              </div>

              <h3 className="font-semibold text-slate-800">{w.name}</h3>
              {w.description && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{w.description}</p>}

              <div className="flex flex-wrap gap-1.5 mt-3">
                {w.category && (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[w.category] ?? 'bg-slate-50 text-slate-500'}`}>
                    {w.category}
                  </span>
                )}
                {w.muscleGroups?.slice(0, 2).map((mg: string) => (
                  <span key={mg} className="text-xs bg-slate-50 text-slate-500 px-2 py-0.5 rounded-full">{mg}</span>
                ))}
              </div>

              {(w.sets || w.reps || w.duration) && (
                <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-50 text-xs text-slate-500">
                  {w.sets && <span>{w.sets} sets</span>}
                  {w.reps && <span>{w.reps} reps</span>}
                  {w.duration && <span>{w.duration} min</span>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
