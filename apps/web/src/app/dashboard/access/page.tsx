'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { QrCode, RefreshCcw } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function AccessPage() {
  const [qr, setQr] = useState<any>(null);
  const [scanInput, setScanInput] = useState('');
  const [scanResult, setScanResult] = useState<any>(null);

  const loadQr = async (rotate = false) => {
    try {
      const { data } = await api.get(`/access/my-qr${rotate ? '?rotate=true' : ''}`);
      setQr(data);
    } catch {
      /* role may not allow */
    }
  };

  useEffect(() => { loadQr(false); }, []);

  const logs = useQuery({
    queryKey: ['access-logs'],
    queryFn: () => api.get('/access/logs?take=20').then((r) => r.data).catch(() => []),
  });

  const submitScan = async () => {
    if (!scanInput.trim()) return;
    try {
      const { data } = await api.post('/access/scan', { qrCode: scanInput.trim() });
      setScanResult(data);
      toast.success('Access granted');
      setScanInput('');
      logs.refetch();
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'Access denied');
      setScanResult({ error: true });
    }
  };

  const code = qr?.qrCode ?? qr?.token ?? null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">QR Access</h1>
        <p className="text-sm text-slate-500">Generate your member QR or scan at the door</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-center">
          <h2 className="font-semibold text-slate-900 mb-4 flex items-center justify-center gap-2">
            <QrCode size={18} /> Your QR code
          </h2>
          {code ? (
            <div className="space-y-3">
              <div className="font-mono text-lg tracking-widest bg-slate-50 py-4 rounded-lg border border-dashed border-slate-300 break-all">
                {code}
              </div>
              <img
                alt="qr"
                src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(code)}`}
                className="mx-auto"
              />
              <button onClick={() => loadQr(true)} className="text-indigo-600 inline-flex items-center gap-1 text-sm">
                <RefreshCcw size={14} /> Rotate
              </button>
            </div>
          ) : (
            <p className="text-slate-500">No QR available for your role.</p>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900 mb-4">Door scan (staff)</h2>
          <div className="flex gap-2">
            <input
              value={scanInput}
              onChange={(e) => setScanInput(e.target.value)}
              placeholder="Paste / scan member QR"
              className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm"
            />
            <button onClick={submitScan} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm">
              Verify
            </button>
          </div>
          {scanResult && (
            <pre className="mt-4 bg-slate-50 rounded-lg p-3 text-xs overflow-x-auto">
              {JSON.stringify(scanResult, null, 2)}
            </pre>
          )}
          <h3 className="font-medium text-slate-700 mt-6 mb-2">Recent door events</h3>
          <ul className="text-sm divide-y divide-slate-100 max-h-64 overflow-y-auto">
            {(logs.data ?? []).slice(0, 12).map((l: any) => (
              <li key={l.id} className="py-2 flex justify-between">
                <span>{l.user?.firstName} {l.user?.lastName} · {l.direction ?? 'IN'}</span>
                <span className="text-slate-500">{new Date(l.createdAt).toLocaleTimeString()}</span>
              </li>
            ))}
            {(logs.data ?? []).length === 0 && <li className="text-slate-400 py-2">No recent activity</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}
