'use client';

import { usePathname } from 'next/navigation';
import { Bot, CornerDownLeft, MessageCircle, RotateCcw, Send, Sparkles, X } from 'lucide-react';
import { FormEvent, KeyboardEvent, useEffect, useMemo, useState } from 'react';

type Message = {
  id: number;
  role: 'assistant' | 'user';
  text: string;
};

const QUICK_PROMPTS = [
  'Find a gym near me',
  'How do I join a membership?',
  'I want to register my gym',
  'Where can I see classes?',
];

const createWelcomeMessages = (pathname: string): Message[] => {
  const pageHint = pathname.startsWith('/auth/register-gym')
    ? 'I can guide you through listing your gym, membership setup, and launch steps.'
    : pathname.startsWith('/auth/register')
      ? 'I can help with choosing a gym, comparing plans, and finishing your sign-up.'
      : 'Ask about gyms, plans, classes, trainers, or getting started with GymFlow.';

  return [
    {
      id: 1,
      role: 'assistant',
      text: 'Welcome to GymFlow support. I am here to help you move from browsing to booking without leaving the page.',
    },
    {
      id: 2,
      role: 'assistant',
      text: pageHint,
    },
  ];
};

function buildAssistantReply(input: string, pathname: string) {
  const query = input.trim().toLowerCase();

  if (!query) {
    return 'Send a question and I will help with gyms, classes, plans, registration, or owner onboarding.';
  }

  if (query.includes('register my gym') || query.includes('owner') || query.includes('list my gym')) {
    return 'Use the For Gyms flow to create your owner account, add your club details, and publish plans for members. If you are already on the gym registration page, finish the form and GymFlow will handle the onboarding steps.';
  }

  if (query.includes('near me') || query.includes('find') || query.includes('gym')) {
    return 'Start on Discover and search by gym name, city, or workout category. Open any gym card to compare plans, facilities, and trainers before joining.';
  }

  if (query.includes('membership') || query.includes('plan') || query.includes('price')) {
    return 'Each gym profile shows its membership plans, pricing, and included perks. If you are registering as a member, select your gym first and the available plans will load automatically.';
  }

  if (query.includes('class') || query.includes('schedule') || query.includes('program')) {
    return 'You can browse public Classes, Programs, and Nutrition pages from the top menu. Inside a gym profile, look for class schedules and coach-led training options to compare what is available.';
  }

  if (query.includes('trainer') || query.includes('coach')) {
    return 'Trainer details are available from the public Trainers page and individual gym profiles. Check specialties, coaching focus, and whether the gym offers personal training sessions.';
  }

  if (query.includes('login') || query.includes('sign in') || query.includes('account')) {
    return 'Use Sign in if you already have an account. New members should register after choosing a gym, while gym owners should use the For Gyms registration flow.';
  }

  if (pathname.startsWith('/auth/register-gym')) {
    return 'From this page, complete your owner details first, then add gym information, contact info, and launch preferences. If something blocks you, tell me which step you are on.';
  }

  if (pathname.startsWith('/auth/register')) {
    return 'From member registration, choose the gym first, then select the membership plan that fits your goals. After that, complete your profile and submit to finish joining.';
  }

  return 'I can help you find gyms, compare memberships, understand classes, or choose the right registration flow. Try asking about gyms near you, membership plans, or owner onboarding.';
}

export default function FloatingChatButton() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>(() => createWelcomeMessages(pathname));

  const nextMessageId = useMemo(
    () => (messages.length ? Math.max(...messages.map((message) => message.id)) + 1 : 1),
    [messages]
  );

  const submitMessage = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      return;
    }

    const userMessage: Message = {
      id: nextMessageId,
      role: 'user',
      text: trimmed,
    };
    const assistantMessage: Message = {
      id: nextMessageId + 1,
      role: 'assistant',
      text: buildAssistantReply(trimmed, pathname),
    };

    setMessages((current) => [...current, userMessage, assistantMessage]);
    setInput('');
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submitMessage(input);
  };

  const resetConversation = () => {
    setMessages(createWelcomeMessages(pathname));
    setInput('');
  };

  useEffect(() => {
    setMessages(createWelcomeMessages(pathname));
    setInput('');
  }, [pathname]);

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      submitMessage(input);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex max-w-[calc(100vw-1rem)] flex-col items-end gap-3 sm:bottom-5 sm:right-5 sm:max-w-none">
      {open && (
        <div className="w-[22rem] max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-[1.75rem] border border-indigo-100 bg-white shadow-2xl shadow-indigo-950/15">
          <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-sky-600 px-4 py-4 text-white">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20 backdrop-blur">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold">GymFlow Assistant</p>
                    <span className="rounded-full bg-amber-300/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-amber-100">
                      Live guide
                    </span>
                  </div>
                  <p className="text-xs text-indigo-100">Answers for members and gym owners in one place</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={resetConversation}
                  className="rounded-full p-2 text-white/75 transition-colors hover:bg-white/10 hover:text-white"
                  aria-label="Reset chat conversation"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-full p-2 text-white/75 transition-colors hover:bg-white/10 hover:text-white"
                  aria-label="Close chat window"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => submitMessage(prompt)}
                  className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-white/20"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          <div className="max-h-96 space-y-3 overflow-y-auto bg-gradient-to-b from-white via-white to-indigo-50/40 px-4 py-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={
                    message.role === 'user'
                      ? 'max-w-[85%] rounded-[1.35rem] rounded-br-md bg-indigo-600 px-4 py-3 text-sm text-white shadow-lg shadow-indigo-900/10'
                      : 'max-w-[88%] rounded-[1.35rem] rounded-bl-md border border-indigo-100 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm'
                  }
                >
                  {message.role === 'assistant' && (
                    <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-indigo-500">
                      <Sparkles className="h-3.5 w-3.5" /> Assistant
                    </div>
                  )}
                  <p className="leading-6">{message.text}</p>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="border-t border-indigo-100 bg-white p-3">
            <div className="flex items-end gap-2 rounded-[1.35rem] border border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-indigo-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-100">
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                placeholder="Ask about gyms, plans, trainers, or registration..."
                className="max-h-24 min-h-[2.5rem] flex-1 resize-none bg-transparent py-1 text-sm text-slate-700 outline-none placeholder:text-slate-400"
                aria-label="Type your message to GymFlow assistant"
              />
              <button
                type="submit"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-400 text-slate-950 transition-colors hover:bg-amber-300"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-2 flex items-center gap-2 px-1 text-[11px] text-slate-400">
              <CornerDownLeft className="h-3.5 w-3.5" />
              Press Enter to send. Shift+Enter adds a new line.
            </div>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="group flex items-center gap-2 rounded-full bg-slate-950 px-3 py-2.5 text-white shadow-xl shadow-indigo-950/25 transition-all hover:-translate-y-0.5 hover:bg-slate-900"
        aria-expanded={open}
        aria-label="Open GymFlow assistant"
      >
        <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 via-sky-400 to-indigo-500">
          <MessageCircle className="h-4.5 w-4.5" />
          <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-slate-950 bg-emerald-400" />
        </div>
        <div className="hidden text-left sm:block">
          <p className="text-[10px] uppercase tracking-[0.16em] text-amber-200">GymFlow support</p>
          <p className="text-xs font-semibold">Need help?</p>
        </div>
      </button>
    </div>
  );
}
