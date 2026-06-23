'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';

type Status = 'loading' | 'success' | 'error';

export default function StripeCallbackPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [status, setStatus] = useState<Status>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const code = params.get('code');
    const error = params.get('error');
    const errorDescription = params.get('error_description');

    if (error) {
      setStatus('error');
      setMessage(errorDescription ?? 'Stripe authorisation was denied or cancelled.');
      return;
    }

    if (!code) {
      setStatus('error');
      setMessage('No authorisation code received from Stripe.');
      return;
    }

    api
      .post('/gyms/my/stripe-connect/callback', { code })
      .then(() => {
        setStatus('success');
        // Redirect to billing settings after a short delay
        setTimeout(() => router.push('/dashboard/settings?tab=billing'), 2500);
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err.response?.data?.message ?? 'Failed to connect Stripe account.');
      });
  }, [params, router]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-10 max-w-md w-full text-center space-y-4">
        {status === 'loading' && (
          <>
            <Loader2 size={48} className="animate-spin text-indigo-500 mx-auto" />
            <h2 className="text-xl font-bold text-slate-800">Connecting your Stripe account…</h2>
            <p className="text-sm text-slate-500">Please wait while we complete the connection.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle size={48} className="text-green-500 mx-auto" />
            <h2 className="text-xl font-bold text-slate-800">Stripe connected!</h2>
            <p className="text-sm text-slate-500">
              Your Stripe account has been linked. Members can now pay online.
              Redirecting you back to settings…
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle size={48} className="text-red-400 mx-auto" />
            <h2 className="text-xl font-bold text-slate-800">Connection failed</h2>
            <p className="text-sm text-slate-500">{message}</p>
            <Link
              href="/dashboard/settings?tab=billing"
              className="inline-block mt-2 bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors"
            >
              Back to Settings
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
