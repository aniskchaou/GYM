'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import {
  Video, Music, FileText, Radio, Search, Clock, Eye, Filter,
  PlayCircle, Download, ExternalLink, Globe, Users, Lock,
} from 'lucide-react';
import api from '@/lib/api';

const TYPE_ICON: Record<string, any> = {
  VIDEO: Video, AUDIO: Music, PDF: FileText, LIVE_STREAM: Radio,
};
const TYPE_COLOR: Record<string, string> = {
  VIDEO: 'bg-blue-100 text-blue-700',
  AUDIO: 'bg-purple-100 text-purple-700',
  PDF: 'bg-orange-100 text-orange-700',
  LIVE_STREAM: 'bg-red-100 text-red-700',
};

function fmtDuration(sec?: number | null) {
  if (!sec) return null;
  const m = Math.floor(sec / 60), s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function MemberContentPage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [category, setCategory] = useState('');
  const [activeId, setActiveId] = useState<string | null>(null);

  const { data: items = [], isLoading } = useQuery<any[]>({
    queryKey: ['content-library', typeFilter, category, search],
    queryFn: () => {
      const params: Record<string, string> = {};
      if (typeFilter !== 'ALL') params.type = typeFilter;
      if (category) params.category = category;
      if (search) params.search = search;
      return api.get('/training-content', { params }).then((r) => r.data);
    },
  });

  const { data: categories = [] } = useQuery<string[]>({
    queryKey: ['content-categories'],
    queryFn: () => api.get('/training-content/categories').then((r) => r.data),
  });

  const viewMut = useMutation({
    mutationFn: ({ id, progress }: { id: string; progress: number }) =>
      api.post(`/training-content/${id}/view`, { progress }),
  });

  function openContent(item: any) {
    setActiveId(item.id);
    viewMut.mutate({ id: item.id, progress: 0 });
  }

  const activeItem = items.find((i) => i.id === activeId);
  const TYPES = ['ALL', 'VIDEO', 'AUDIO', 'PDF', 'LIVE_STREAM'];

  // Group items by category for display
  const featured = items.filter((i) => i.type === 'LIVE_STREAM');
  const rest = items.filter((i) => i.type !== 'LIVE_STREAM');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-800">Training Library</h1>
        <p className="text-sm text-slate-500 mt-0.5">Videos, audio sessions, guides and live classes from your trainers</p>
      </div>

      {/* Search + filter bar */}
      <div className="flex gap-2 flex-wrap">
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 flex-1 min-w-52 focus-within:border-indigo-400 transition-colors">
          <Search size={15} className="text-slate-400 shrink-0" />
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search content…"
            className="flex-1 text-sm text-slate-700 outline-none placeholder:text-slate-400 bg-transparent"
          />
        </div>
        <select
          value={category} onChange={(e) => setCategory(e.target.value)}
          className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-600 focus:outline-none focus:border-indigo-400 bg-white"
        >
          <option value="">All categories</option>
          {categories.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>

      {/* Type tabs */}
      <div className="flex gap-2 flex-wrap">
        {TYPES.map((t) => {
          const Icon = t === 'ALL' ? Filter : TYPE_ICON[t];
          return (
            <button key={t} onClick={() => setTypeFilter(t)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
                typeFilter === t
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
              }`}>
              {Icon && <Icon size={12} />}
              {t.replace('_', ' ')}
            </button>
          );
        })}
      </div>

      {/* Upcoming live streams */}
      {featured.length > 0 && typeFilter === 'ALL' && (
        <div className="bg-gradient-to-r from-red-600 to-rose-700 rounded-2xl p-5 text-white">
          <div className="flex items-center gap-2 mb-3">
            <Radio size={18} />
            <h2 className="font-bold">Upcoming Live Classes</h2>
          </div>
          <div className="space-y-2">
            {featured.map((item: any) => (
              <div key={item.id} className="bg-white/10 rounded-xl px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm">{item.title}</p>
                  <p className="text-red-200 text-xs mt-0.5">
                    {item.trainer?.firstName} {item.trainer?.lastName}
                    {item.liveStreamAt && ` · ${new Date(item.liveStreamAt).toLocaleString()}`}
                  </p>
                </div>
                {item.liveStreamUrl && (
                  <a href={item.liveStreamUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 bg-white text-red-700 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                    onClick={() => viewMut.mutate({ id: item.id, progress: 0 })}>
                    <ExternalLink size={12} /> Join
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content grid */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="bg-white rounded-2xl border border-slate-100 h-52 animate-pulse" />)}
        </div>
      ) : rest.length === 0 && featured.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 py-16 text-center">
          <PlayCircle size={40} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500 font-medium">No content available yet</p>
          <p className="text-sm text-slate-400 mt-1">Your trainers haven't published any content yet</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rest.map((item: any) => {
            const TypeIcon = TYPE_ICON[item.type] ?? FileText;
            const dur = fmtDuration(item.duration);
            const isActive = item.id === activeId;
            return (
              <div key={item.id}
                className={`bg-white rounded-2xl border shadow-sm overflow-hidden hover:shadow-md transition-all flex flex-col cursor-pointer ${isActive ? 'border-indigo-400 ring-2 ring-indigo-100' : 'border-slate-100'}`}
                onClick={() => openContent(item)}>
                {/* Thumbnail */}
                <div className="relative h-36 bg-slate-100 flex items-center justify-center overflow-hidden">
                  {item.thumbnailUrl
                    ? <img src={item.thumbnailUrl} alt={item.title} className="w-full h-full object-cover" />
                    : <TypeIcon size={40} className="text-slate-300" />}
                  <div className={`absolute top-2 left-2 flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${TYPE_COLOR[item.type]}`}>
                    <TypeIcon size={11} /> {item.type.replace('_', ' ')}
                  </div>
                  {item.type === 'VIDEO' && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 bg-black/40 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <PlayCircle size={28} className="text-white" />
                      </div>
                    </div>
                  )}
                  {dur && <span className="absolute bottom-2 right-2 text-xs bg-black/60 text-white px-2 py-0.5 rounded">{dur}</span>}
                </div>

                {/* Body */}
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-semibold text-slate-800 text-sm line-clamp-2">{item.title}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {item.trainer?.firstName} {item.trainer?.lastName}
                    {item.category && ` · ${item.category}`}
                  </p>
                  <div className="flex items-center gap-3 mt-auto pt-3 border-t border-slate-50 text-xs text-slate-400">
                    <span className="flex items-center gap-1"><Eye size={11} /> {item.viewCount ?? 0} views</span>
                    {item.type === 'PDF' && (
                      <a href={item.fileUrl} target="_blank" rel="noopener noreferrer"
                        className="ml-auto flex items-center gap-1 text-orange-600 hover:text-orange-700 font-medium"
                        onClick={(e) => e.stopPropagation()}>
                        <Download size={12} /> Download PDF
                      </a>
                    )}
                    {item.type === 'AUDIO' && isActive && (
                      <span className="ml-auto text-purple-600 font-medium">▶ Playing</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Inline media player (video/audio) */}
      {activeItem && activeItem.fileUrl && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-xl p-4 z-50">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="font-semibold text-sm text-slate-800">{activeItem.title}</p>
                <p className="text-xs text-slate-500">{activeItem.trainer?.firstName} {activeItem.trainer?.lastName}</p>
              </div>
              <button onClick={() => setActiveId(null)} className="text-slate-400 hover:text-slate-600 p-1">✕</button>
            </div>
            {activeItem.type === 'VIDEO' && (
              <video src={activeItem.fileUrl} controls autoPlay className="w-full max-h-72 rounded-xl bg-black"
                onTimeUpdate={(e) => {
                  const v = e.currentTarget;
                  if (v.duration) viewMut.mutate({ id: activeItem.id, progress: Math.round(v.currentTime / v.duration * 100) });
                }} />
            )}
            {activeItem.type === 'AUDIO' && (
              <audio src={activeItem.fileUrl} controls autoPlay className="w-full" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
