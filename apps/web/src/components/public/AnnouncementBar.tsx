'use client';

import Link from 'next/link';
import { useState } from 'react';
import { X, ArrowRight } from 'lucide-react';

export default function AnnouncementBar() {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;

  return (
    <div className="bg-indigo-600 text-white text-sm">
      <div className="max-w-7xl mx-auto px-4 h-9 flex items-center justify-center gap-3 relative">
        <span className="hidden sm:inline font-medium">
          🏋️ Own a gym? Register it free and start getting new members today.
        </span>
        <span className="sm:hidden font-medium">Own a gym? Register free.</span>
        <Link
          href="/auth/register-gym"
          className="inline-flex items-center gap-1 bg-white text-indigo-700 font-bold text-xs px-3 py-1 rounded-full hover:bg-indigo-50 transition-colors shrink-0"
        >
          Get started free <ArrowRight className="w-3 h-3" />
        </Link>
        <button
          onClick={() => setVisible(false)}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/20 rounded-md transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
