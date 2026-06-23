'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { ArrowLeft, UserPlus } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function NewMemberPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
  });

  const create = useMutation({
    mutationFn: (data: typeof form) => api.post('/auth/register', data).then((r) => r.data),
    onSuccess: () => {
      toast.success('Member added successfully');
      router.push('/dashboard/members');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? 'Failed to add member');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    create.mutate(form);
  };

  const field = (label: string, key: keyof typeof form, type = 'text', placeholder = '') => (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      <input
        type={type}
        value={form[key]}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        placeholder={placeholder}
        required={key !== 'phone'}
        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400"
      />
    </div>
  );

  return (
    <div className="max-w-lg space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/members"
          className="p-2 rounded-lg hover:bg-slate-200 transition-colors text-slate-500"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Add New Member</h2>
          <p className="text-sm text-slate-500">Create a new gym member account</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {field('First Name', 'firstName', 'text', 'John')}
          {field('Last Name', 'lastName', 'text', 'Doe')}
        </div>
        {field('Email', 'email', 'email', 'john@example.com')}
        {field('Password', 'password', 'password', 'Min 8 characters')}
        {field('Phone (optional)', 'phone', 'tel', '+31 6 00000000')}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={create.isPending}
            className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
          >
            <UserPlus size={16} />
            {create.isPending ? 'Adding…' : 'Add Member'}
          </button>
          <Link
            href="/dashboard/members"
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
