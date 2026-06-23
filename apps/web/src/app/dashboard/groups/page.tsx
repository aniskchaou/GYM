'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageCircle, Plus, Users } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function GroupsPage() {
  const qc = useQueryClient();
  const [active, setActive] = useState<any>(null);
  const [show, setShow] = useState(false);
  const [name, setName] = useState('');
  const [post, setPost] = useState('');

  const list = useQuery({ queryKey: ['groups'], queryFn: () => api.get('/groups').then((r) => r.data).catch(() => []) });
  const posts = useQuery({
    queryKey: ['group-posts', active?.id],
    enabled: !!active,
    queryFn: () => api.get(`/groups/${active.id}/posts`).then((r) => r.data).catch(() => []),
  });

  const create = useMutation({
    mutationFn: () => api.post('/groups', { name }).then((r) => r.data),
    onSuccess: () => { toast.success('Group created'); setShow(false); setName(''); qc.invalidateQueries({ queryKey: ['groups'] }); },
  });
  const join = useMutation({
    mutationFn: (id: string) => api.post(`/groups/${id}/join`).then((r) => r.data),
    onSuccess: () => { toast.success('Joined'); qc.invalidateQueries({ queryKey: ['groups'] }); },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Failed'),
  });
  const addPost = useMutation({
    mutationFn: () => api.post(`/groups/${active.id}/posts`, { content: post }).then((r) => r.data),
    onSuccess: () => { setPost(''); qc.invalidateQueries({ queryKey: ['group-posts', active.id] }); },
  });

  const groups: any[] = list.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Community Groups</h1>
          <p className="text-sm text-slate-500">Connect with members — chat, share, plan</p>
        </div>
        <button onClick={() => setShow(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2">
          <Plus size={16} /> New Group
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-slate-200 p-4 space-y-2 max-h-[70vh] overflow-y-auto">
          {groups.map((g) => (
            <button
              key={g.id}
              onClick={() => setActive(g)}
              className={`w-full text-left p-3 rounded-lg flex items-center gap-3 ${active?.id === g.id ? 'bg-indigo-50' : 'hover:bg-slate-50'}`}
            >
              <div className="bg-indigo-100 p-2 rounded-lg"><Users size={16} className="text-indigo-700" /></div>
              <div className="flex-1">
                <div className="text-sm font-medium">{g.name}</div>
                <div className="text-xs text-slate-500">{g._count?.members ?? 0} members</div>
              </div>
              <span className="text-xs text-indigo-600" onClick={(e) => { e.stopPropagation(); join.mutate(g.id); }}>Join</span>
            </button>
          ))}
          {groups.length === 0 && <p className="text-sm text-slate-500 p-3">No groups yet.</p>}
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6 min-h-[60vh]">
          {!active ? (
            <p className="text-slate-500 text-sm">Select a group to view posts.</p>
          ) : (
            <>
              <h2 className="font-semibold flex items-center gap-2 mb-4">
                <MessageCircle size={18} /> {active.name}
              </h2>
              <div className="flex gap-2 mb-4">
                <input
                  value={post}
                  onChange={(e) => setPost(e.target.value)}
                  placeholder="Share something with the group…"
                  className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  onKeyDown={(e) => e.key === 'Enter' && post.trim() && addPost.mutate()}
                />
                <button onClick={() => addPost.mutate()} disabled={!post.trim()} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50">Post</button>
              </div>
              <ul className="space-y-3">
                {(posts.data ?? []).map((p: any) => (
                  <li key={p.id} className="border border-slate-200 rounded-lg p-3">
                    <div className="text-sm">{p.content}</div>
                    <div className="text-xs text-slate-500 mt-1">
                      {p.author?.firstName} · {new Date(p.createdAt).toLocaleString()}
                    </div>
                  </li>
                ))}
                {(posts.data ?? []).length === 0 && <p className="text-sm text-slate-500">No posts yet.</p>}
              </ul>
            </>
          )}
        </div>
      </div>

      {show && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 space-y-3">
            <h2 className="font-semibold">New Group</h2>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Group name" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShow(false)} className="px-4 py-2 text-sm">Cancel</button>
              <button onClick={() => create.mutate()} disabled={!name.trim()} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50">Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
