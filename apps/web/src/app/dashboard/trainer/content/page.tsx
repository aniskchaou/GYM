'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import {
  Video, Music, FileText, Radio, Plus, Eye, EyeOff, Trash2, Edit2,
  Upload, Globe, Lock, Users, Clock, BarChart2, PlayCircle,
} from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';

const SAMPLE_CONTENT = [
  {
    id: 'sample-content-video-1',
    title: 'Foundations of Strength Training',
    category: 'Strength',
    type: 'VIDEO',
    visibility: 'MEMBERS_ONLY',
    isPublished: true,
    duration: 780,
    viewCount: 34,
    thumbnailUrl: '',
    isSample: true,
  },
  {
    id: 'sample-content-pdf-1',
    title: '7-Day Mobility Reset Guide',
    category: 'Mobility',
    type: 'PDF',
    visibility: 'PUBLIC',
    isPublished: true,
    duration: null,
    viewCount: 21,
    thumbnailUrl: '',
    isSample: true,
  },
  {
    id: 'sample-content-audio-1',
    title: 'Post-Workout Recovery Breathwork',
    category: 'Recovery',
    type: 'AUDIO',
    visibility: 'SUBSCRIBERS_ONLY',
    isPublished: false,
    duration: 420,
    viewCount: 9,
    thumbnailUrl: '',
    isSample: true,
  },
];

const TYPE_ICON: Record<string, any> = {
  VIDEO: Video,
  AUDIO: Music,
  PDF: FileText,
  LIVE_STREAM: Radio,
};

const TYPE_COLOR: Record<string, string> = {
  VIDEO: 'bg-blue-100 text-blue-700',
  AUDIO: 'bg-purple-100 text-purple-700',
  PDF: 'bg-orange-100 text-orange-700',
  LIVE_STREAM: 'bg-red-100 text-red-700',
};

const VIS_ICON: Record<string, any> = {
  PUBLIC: Globe,
  MEMBERS_ONLY: Users,
  SUBSCRIBERS_ONLY: Lock,
};

function fmtDuration(sec?: number | null) {
  if (!sec) return '—';
  const m = Math.floor(sec / 60), s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function TrainerContentPage() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<string>('ALL');

  const { data: items = [], isLoading } = useQuery<any[]>({
    queryKey: ['my-content'],
    queryFn: () => api.get('/training-content/my').then((r) => r.data).catch(() => []),
  });

  const publishMut = useMutation({
    mutationFn: (id: string) => api.post(`/training-content/${id}/publish`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-content'] }),
  });

  const unpublishMut = useMutation({
    mutationFn: (id: string) => api.post(`/training-content/${id}/unpublish`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-content'] }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => api.delete(`/training-content/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-content'] }),
  });

  const seededItems = items.length > 0 ? items : SAMPLE_CONTENT;
  const types = ['ALL', 'VIDEO', 'AUDIO', 'PDF', 'LIVE_STREAM'];
  const filtered = filter === 'ALL' ? seededItems : seededItems.filter((i) => i.type === filter);
  const stats = {
    total: seededItems.length,
    published: seededItems.filter((i) => i.isPublished).length,
    views: seededItems.reduce((s, i) => s + (i.viewCount ?? 0), 0),
    videos: seededItems.filter((i) => i.type === 'VIDEO').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">My Content Library</h1>
          <p className="text-sm text-slate-500 mt-0.5">Publish videos, audio sessions, PDFs and live streams for your clients</p>
        </div>
        <Link
          href="/dashboard/trainer/content/new"
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm"
        >
          <Plus size={16} /> Publish Content
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Items',  value: stats.total,     icon: Upload,     color: 'bg-slate-100 text-slate-600' },
          { label: 'Published',    value: stats.published, icon: Globe,      color: 'bg-green-100 text-green-600' },
          { label: 'Total Views',  value: stats.views,     icon: BarChart2,  color: 'bg-blue-100 text-blue-600' },
          { label: 'Videos',       value: stats.videos,    icon: PlayCircle, color: 'bg-purple-100 text-purple-600' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm text-center">
            <div className={`w-9 h-9 ${s.color} rounded-xl flex items-center justify-center mx-auto mb-2`}>
              <s.icon size={17} />
            </div>
            <p className="text-2xl font-bold text-slate-800">{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Type filter */}
      <div className="flex gap-2 flex-wrap">
        {types.map((t) => {
          const Icon = t === 'ALL' ? Upload : TYPE_ICON[t];
          return (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
                filter === t
                  ? 'bg-green-600 text-white border-green-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-green-300'
              }`}
            >
              {Icon && <Icon size={13} />}
              {t.replace('_', ' ')}
            </button>
          );
        })}
      </div>

      {/* Content grid */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 h-52 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 py-16 text-center">
          <Upload size={40} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500 font-medium">No content yet</p>
          <p className="text-sm text-slate-400 mt-1">Upload your first video, audio or PDF to get started</p>
          <Link
            href="/dashboard/trainer/content/new"
            className="inline-flex items-center gap-2 mt-4 bg-green-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-green-700 transition-colors"
          >
            <Plus size={15} /> Publish Content
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item: any) => {
            const TypeIcon = TYPE_ICON[item.type] ?? FileText;
            const VisIcon = VIS_ICON[item.visibility] ?? Globe;
            return (
              <div key={item.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                {/* Thumbnail */}
                <div className="relative h-36 bg-slate-100 flex items-center justify-center overflow-hidden">
                  {item.thumbnailUrl ? (
                    <img src={item.thumbnailUrl} alt={item.title} className="w-full h-full object-cover" />
                  ) : (
                    <TypeIcon size={40} className="text-slate-300" />
                  )}
                  <div className={`absolute top-2 left-2 flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${TYPE_COLOR[item.type]}`}>
                    <TypeIcon size={11} /> {item.type.replace('_', ' ')}
                  </div>
                  {item.isPublished ? (
                    <span className="absolute top-2 right-2 text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">Published</span>
                  ) : (
                    <span className="absolute top-2 right-2 text-xs bg-slate-100 text-slate-500 font-semibold px-2 py-0.5 rounded-full">Draft</span>
                  )}
                </div>

                {/* Body */}
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-semibold text-slate-800 text-sm line-clamp-2">{item.title}</h3>
                  {item.category && <p className="text-xs text-indigo-600 mt-0.5">{item.category}</p>}

                  <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                    <span className="flex items-center gap-1"><Eye size={11} /> {item.viewCount ?? item._count?.views ?? 0}</span>
                    {item.duration && <span className="flex items-center gap-1"><Clock size={11} /> {fmtDuration(item.duration)}</span>}
                    <span className="flex items-center gap-1"><VisIcon size={11} /> {item.visibility.replace('_', ' ')}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-auto pt-3 border-t border-slate-50">
                    <Link
                      href={`/dashboard/trainer/content/${item.id}/edit`}
                      className="flex items-center gap-1 text-xs text-slate-500 hover:text-indigo-600 transition-colors"
                    >
                      <Edit2 size={13} /> Edit
                    </Link>
                    <button
                      onClick={() => !item.isSample && (item.isPublished ? unpublishMut.mutate(item.id) : publishMut.mutate(item.id))}
                      className="flex items-center gap-1 text-xs text-slate-500 hover:text-green-600 transition-colors"
                    >
                      {item.isPublished ? <EyeOff size={13} /> : <Eye size={13} />}
                      {item.isPublished ? 'Unpublish' : 'Publish'}
                    </button>
                    <button
                      onClick={() => !item.isSample && confirm('Delete this content?') && deleteMut.mutate(item.id)}
                      className="flex items-center gap-1 text-xs text-slate-500 hover:text-red-500 transition-colors ml-auto"
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
