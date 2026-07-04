'use client';

import { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  Video, Music, FileText, Radio, Upload, X, Check, ArrowLeft,
  Globe, Users, Lock, Loader2,
} from 'lucide-react';
import api from '@/lib/api';

const TYPES = [
  { value: 'VIDEO',       label: 'Video',       icon: Video,    color: 'border-blue-300 bg-blue-50 text-blue-700',   accept: 'video/mp4,video/quicktime,video/webm',      endpoint: '/uploads/video' },
  { value: 'AUDIO',       label: 'Audio',       icon: Music,    color: 'border-purple-300 bg-purple-50 text-purple-700', accept: 'audio/mpeg,audio/wav,audio/mp4',          endpoint: '/uploads/audio' },
  { value: 'PDF',         label: 'PDF Guide',   icon: FileText, color: 'border-orange-300 bg-orange-50 text-orange-700', accept: 'application/pdf',                         endpoint: '/uploads/pdf' },
  { value: 'LIVE_STREAM', label: 'Live Stream', icon: Radio,    color: 'border-red-300 bg-red-50 text-red-700',     accept: null,                                        endpoint: null },
];

const CATEGORIES = [
  'Strength Training', 'HIIT', 'Yoga', 'Pilates', 'Cardio', 'CrossFit',
  'Boxing', 'Nutrition', 'Mobility', 'Meditation', 'Running', 'Cycling',
  'Swimming', 'Dance', 'Rehabilitation', 'Mental Wellness', 'Other',
];

const VISIBILITY = [
  { value: 'PUBLIC',          label: 'Public',          desc: 'Anyone can find and view this',            icon: Globe },
  { value: 'MEMBERS_ONLY',    label: 'Members Only',    desc: 'Only your gym members can access this',    icon: Users },
  { value: 'SUBSCRIBERS_ONLY', label: 'Subscribers',   desc: 'Only paying subscribers can access this',  icon: Lock },
];

export default function PublishContentPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const thumbRef = useRef<HTMLInputElement>(null);

  const [type, setType] = useState('VIDEO');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [visibility, setVisibility] = useState('MEMBERS_ONLY');
  const [fileUrl, setFileUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [duration, setDuration] = useState('');
  const [liveStreamAt, setLiveStreamAt] = useState('');
  const [liveStreamUrl, setLiveStreamUrl] = useState('');
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const [fileName, setFileName] = useState('');

  const selectedType = TYPES.find((t) => t.value === type)!;

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>, kind: 'file' | 'thumb') {
    const file = e.target.files?.[0];
    if (!file) return;
    const isThumb = kind === 'thumb';
    isThumb ? setUploadingThumb(true) : setUploadingFile(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const endpoint = isThumb ? '/uploads/image' : selectedType.endpoint!;
      const res = await api.post(endpoint, form, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (isThumb) {
        setThumbnailUrl(res.data.url);
      } else {
        setFileUrl(res.data.url);
        setFileName(file.name);
      }
    } finally {
      isThumb ? setUploadingThumb(false) : setUploadingFile(false);
    }
  }

  const createMut = useMutation({
    mutationFn: (publish: boolean) =>
      api.post('/training-content', {
        type,
        title,
        description: description || undefined,
        category: category || undefined,
        tags: tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        visibility,
        fileUrl: fileUrl || undefined,
        thumbnailUrl: thumbnailUrl || undefined,
        duration: duration ? parseInt(duration) : undefined,
        liveStreamAt: liveStreamAt || undefined,
        liveStreamUrl: liveStreamUrl || undefined,
      }).then((res) => {
        if (publish) return api.post(`/training-content/${res.data.id}/publish`);
        return res;
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-content'] });
      router.push('/dashboard/trainer/content');
    },
  });

  const isLive = type === 'LIVE_STREAM';
  const canSubmit = title.trim() && (isLive ? liveStreamAt : fileUrl);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-800">Publish Content</h1>
          <p className="text-sm text-slate-500">Upload or schedule training content for your clients</p>
        </div>
      </div>

      {/* Content type */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-slate-700 mb-3">Content Type</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => { setType(t.value); setFileUrl(''); setFileName(''); }}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                type === t.value ? t.color + ' shadow-sm' : 'border-slate-200 text-slate-500 hover:border-slate-300'
              }`}
            >
              <t.icon size={22} />
              <span className="text-xs font-semibold">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* File upload (not for LIVE_STREAM) */}
      {!isLive && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-3">Upload File</h2>
          {fileUrl ? (
            <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-xl">
              <Check size={18} className="text-green-600 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-green-800 truncate">{fileName}</p>
                <p className="text-xs text-green-600 truncate">{fileUrl}</p>
              </div>
              <button onClick={() => { setFileUrl(''); setFileName(''); }} className="text-slate-400 hover:text-red-500">
                <X size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploadingFile}
              className="w-full border-2 border-dashed border-slate-300 hover:border-green-400 rounded-xl p-8 flex flex-col items-center gap-2 text-slate-400 hover:text-green-600 transition-colors disabled:opacity-50"
            >
              {uploadingFile ? <Loader2 size={28} className="animate-spin" /> : <Upload size={28} />}
              <span className="text-sm font-medium">{uploadingFile ? 'Uploading…' : `Click to upload ${selectedType.label}`}</span>
              <span className="text-xs">{selectedType.accept?.split(',').join(', ')}</span>
            </button>
          )}
          <input ref={fileRef} type="file" accept={selectedType.accept ?? ''} className="hidden"
            onChange={(e) => handleFileUpload(e, 'file')} />
        </div>
      )}

      {/* Live stream fields */}
      {isLive && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-700">Live Stream Details</h2>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Scheduled Date & Time *</label>
            <input type="datetime-local" value={liveStreamAt} onChange={(e) => setLiveStreamAt(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-400" />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Stream URL (Zoom, YouTube Live, etc.)</label>
            <input type="url" placeholder="https://zoom.us/j/..." value={liveStreamUrl}
              onChange={(e) => setLiveStreamUrl(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-400" />
          </div>
        </div>
      )}

      {/* Metadata */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
        <h2 className="text-sm font-semibold text-slate-700">Details</h2>

        <div>
          <label className="block text-xs text-slate-500 mb-1">Title *</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. 30-Min Full Body HIIT"
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-400" />
        </div>

        <div>
          <label className="block text-xs text-slate-500 mb-1">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
            placeholder="What will clients learn or achieve?"
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-400 resize-none" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-slate-500 mb-1">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-400">
              <option value="">Select category</option>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Duration (seconds)</label>
            <input type="number" value={duration} onChange={(e) => setDuration(e.target.value)}
              placeholder="e.g. 1800"
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-400" />
          </div>
        </div>

        <div>
          <label className="block text-xs text-slate-500 mb-1">Tags (comma-separated)</label>
          <input value={tags} onChange={(e) => setTags(e.target.value)}
            placeholder="hiit, beginner, no-equipment"
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-400" />
        </div>

        {/* Thumbnail */}
        <div>
          <label className="block text-xs text-slate-500 mb-1">Thumbnail (optional)</label>
          <div className="flex items-center gap-3">
            {thumbnailUrl && (
              <img src={thumbnailUrl} alt="thumb" className="w-16 h-16 rounded-xl object-cover border border-slate-200" />
            )}
            <button onClick={() => thumbRef.current?.click()} disabled={uploadingThumb}
              className="flex items-center gap-2 text-xs text-slate-500 hover:text-indigo-600 border border-slate-200 rounded-xl px-3 py-2 transition-colors">
              {uploadingThumb ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
              {uploadingThumb ? 'Uploading…' : 'Upload thumbnail'}
            </button>
          </div>
          <input ref={thumbRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
            onChange={(e) => handleFileUpload(e, 'thumb')} />
        </div>
      </div>

      {/* Visibility */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-slate-700 mb-3">Audience</h2>
        <div className="space-y-2">
          {VISIBILITY.map((v) => (
            <label key={v.value} className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
              visibility === v.value ? 'border-green-400 bg-green-50' : 'border-slate-200 hover:border-slate-300'
            }`}>
              <input type="radio" name="visibility" value={v.value} checked={visibility === v.value}
                onChange={() => setVisibility(v.value)} className="mt-0.5" />
              <div>
                <div className="flex items-center gap-1.5">
                  <v.icon size={14} className={visibility === v.value ? 'text-green-600' : 'text-slate-400'} />
                  <span className="text-sm font-medium text-slate-700">{v.label}</span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{v.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pb-8">
        <button
          onClick={() => createMut.mutate(false)}
          disabled={!canSubmit || createMut.isPending}
          className="flex-1 border border-slate-300 text-slate-700 font-semibold py-3 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50"
        >
          Save as Draft
        </button>
        <button
          onClick={() => createMut.mutate(true)}
          disabled={!canSubmit || createMut.isPending}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
        >
          {createMut.isPending ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
          Publish Now
        </button>
      </div>
    </div>
  );
}
