'use client';

import { useState } from 'react';
import {
  GraduationCapIcon,
  BarChart2Icon,
  TrendingUpIcon,
  FileTextIcon,
  LightbulbIcon,
  ArrowRightIcon,
} from 'lucide-react';
import { ChatInput } from './ChatInput';

const SUGGESTIONS = [
  {
    icon: BarChart2Icon,
    text: 'Explain the PEST analysis framework from the course',
  },
  {
    icon: TrendingUpIcon,
    text: 'What are the key stages of the entrepreneurship lifecycle?',
  },
  {
    icon: FileTextIcon,
    text: 'Summarize the latest uploaded lecture notes',
  },
  {
    icon: LightbulbIcon,
    text: 'How does design thinking apply to product development?',
  },
];

interface WelcomeScreenProps {
  onSend: (content: string) => void;
  isTyping?: boolean;
}

export function WelcomeScreen({ onSend, isTyping = false }: WelcomeScreenProps) {
  const [inputValue, setInputValue] = useState('');

  function handleSend(content: string) {
    setInputValue('');
    onSend(content);
  }

  return (
    <div className="flex flex-col items-center justify-center h-full px-6 gap-12 overflow-y-auto py-14">
      {/* Logo + heading */}
      <div className="text-center space-y-6">
        <div className="relative inline-flex mx-auto">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #25ad91 0%, #1e9a80 100%)',
            }}
          >
            <GraduationCapIcon className="w-10 h-10 text-white" strokeWidth={1.8} />
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-5xl font-semibold tracking-tight">
            <span className="gradient-text">Hello, MEST Student</span>
          </h1>
          <p className="text-text-muted text-lg max-w-md mx-auto leading-relaxed">
            Ask anything about your course materials. Upload PDFs, notes, or markdown files to get started.
          </p>
        </div>
      </div>

      {/* Suggestion cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
        {SUGGESTIONS.map(({ icon: Icon, text }) => (
          <button
            key={text}
            onClick={() => handleSend(text)}
            disabled={isTyping}
            className="group flex items-start gap-3.5 text-left p-5 rounded-2xl border border-transparent hover:border-border-bright transition-all duration-200 text-base disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: '#1c1c1c' }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = '#222222')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = '#1c1c1c')}
          >
            <span className="mt-0.5 p-2 rounded-lg bg-brand-muted text-brand shrink-0">
              <Icon className="w-4 h-4" />
            </span>
            <span className="flex-1 text-text-secondary group-hover:text-text-primary transition-colors leading-snug">
              {text}
            </span>
            <ArrowRightIcon className="w-4 h-4 text-text-muted opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200 shrink-0 mt-1" />
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="w-full max-w-2xl">
        <ChatInput
          onSend={handleSend}
          disabled={isTyping}
          value={inputValue}
          onChange={setInputValue}
        />
        <p className="text-center text-sm text-text-muted mt-4">
          Press{' '}
          <kbd className="px-2 py-1 rounded-md bg-surface-3 text-text-secondary font-mono text-xs">Enter</kbd>
          {' '}to send ·{' '}
          <kbd className="px-2 py-1 rounded-md bg-surface-3 text-text-secondary font-mono text-xs">Shift+Enter</kbd>
          {' '}for new line
        </p>
      </div>
    </div>
  );
}
