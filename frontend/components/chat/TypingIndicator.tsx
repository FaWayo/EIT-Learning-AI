'use client';

import { BotIcon } from 'lucide-react';

export function TypingIndicator() {
  return (
    <div className="msg-animate flex items-start gap-3">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
        style={{
          background: 'linear-gradient(135deg, #25ad91 0%, #1e9a80 100%)',
        }}
      >
        <BotIcon className="w-4 h-4 text-white" strokeWidth={2} />
      </div>
      <div className="flex items-center gap-1.5 h-8">
        <span className="typing-dot w-1.5 h-1.5 rounded-full bg-text-muted" />
        <span className="typing-dot w-1.5 h-1.5 rounded-full bg-text-muted" />
        <span className="typing-dot w-1.5 h-1.5 rounded-full bg-text-muted" />
      </div>
    </div>
  );
}
