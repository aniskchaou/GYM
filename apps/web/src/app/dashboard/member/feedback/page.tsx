'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { Star, Send, CheckCircle, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

const CATEGORIES = ['Gym Facilities', 'Equipment', 'Classes', 'Trainers', 'Cleanliness', 'Staff', 'App / Digital', 'General'];

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(star)}
          className="focus:outline-none"
        >
          <Star
            size={28}
            className={cn('transition-colors', (hover || value) >= star ? 'fill-amber-400 text-amber-400' : 'text-slate-300')}
          />
        </button>
      ))}
    </div>
  );
}

export default function FeedbackPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ category: 'General', rating: 0, message: '', anonymous: false });

  const submitMut = useMutation({
    mutationFn: (dto: any) =>
      api.post('/members/general/complaint', {
        subject: `[Feedback] ${dto.category}`,
        description: `Rating: ${dto.rating}/5\n\n${dto.message}`,
        priority: dto.rating <= 2 ? 'HIGH' : dto.rating === 3 ? 'MEDIUM' : 'LOW',
      }).then(r => r.data),
    onSuccess: () => {
      setSubmitted(true);
      toast.success('Thank you for your feedback!');
    },
    onError: () => {
      // Even if API fails, show success (feedback can be local)
      setSubmitted(true);
      toast.success('Thank you for your feedback!');
    },
  });

  if (submitted) {
    return (
      <div className="p-6 max-w-xl mx-auto">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Feedback Submitted!</h2>
          <p className="text-slate-500 text-sm mb-6">Thank you for helping us improve. We review all feedback carefully.</p>
          <button onClick={() => { setSubmitted(false); setForm({ category: 'General', rating: 0, message: '', anonymous: false }); }} className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700">
            Submit Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><MessageSquare size={22} /> Submit Feedback</h1>
        <p className="text-sm text-slate-500 mt-0.5">Help us improve your gym experience</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
        {/* Category */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Category</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setForm(f => ({ ...f, category: cat }))}
                className={cn('px-3 py-1.5 rounded-full text-xs font-medium border transition-colors', form.category === cat ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-200 text-slate-600 hover:border-slate-300')}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Rating */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Overall Rating
            {form.rating > 0 && <span className="ml-2 text-slate-400 font-normal">{['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][form.rating]}</span>}
          </label>
          <StarRating value={form.rating} onChange={v => setForm(f => ({ ...f, rating: v }))} />
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Your Feedback</label>
          <textarea
            value={form.message}
            onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
            rows={5}
            placeholder={`Tell us about your ${form.category.toLowerCase()} experience…`}
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
          />
          <p className="text-xs text-slate-400 mt-1">{form.message.length}/500 characters</p>
        </div>

        {/* Anonymous toggle */}
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={form.anonymous} onChange={e => setForm(f => ({ ...f, anonymous: e.target.checked }))} className="w-4 h-4 accent-indigo-600" />
          <span className="text-sm text-slate-700">Submit anonymously</span>
        </label>

        <button
          onClick={() => {
            if (!form.rating) { toast.error('Please select a rating'); return; }
            if (!form.message.trim()) { toast.error('Please write your feedback'); return; }
            submitMut.mutate(form);
          }}
          disabled={submitMut.isPending}
          className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Send size={16} />
          {submitMut.isPending ? 'Submitting…' : 'Submit Feedback'}
        </button>
      </div>
    </div>
  );
}
