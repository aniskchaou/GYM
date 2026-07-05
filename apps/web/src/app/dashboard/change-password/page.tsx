'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { KeyRound, Save } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const INPUT = 'w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white';

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const changeMut = useMutation({
    mutationFn: (dto: { currentPassword: string; newPassword: string }) =>
      api.post('/auth/change-password', dto).then((r) => r.data),
    onSuccess: () => {
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed to change password'),
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill all password fields');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New password and confirm password do not match');
      return;
    }

    changeMut.mutate({ currentPassword, newPassword });
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <KeyRound size={22} />
          Change Password
        </h1>
        <p className="text-sm text-slate-500 mt-1">Update your account password securely.</p>
      </div>

      <form onSubmit={onSubmit} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">Current Password</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className={INPUT}
            autoComplete="current-password"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className={INPUT}
            autoComplete="new-password"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">Confirm New Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={INPUT}
            autoComplete="new-password"
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={changeMut.isPending}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
          >
            <Save size={15} />
            {changeMut.isPending ? 'Saving...' : 'Update Password'}
          </button>
        </div>
      </form>
    </div>
  );
}
