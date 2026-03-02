'use client';

import { BotIcon } from 'lucide-react';

export function TypingIndicator() {
  return (
    <div className="msg-animate flex items-start gap-4">
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
        style={{
          background: 'linear-gradient(135deg, #25ad91 0%, #1e9a80 100%)',
        }}
      >
        <BotIcon className="w-5 h-5 text-white" strokeWidth={2} />
      </div>
      <div className="flex items-center gap-2 h-10">
        <span className="typing-dot w-2 h-2 rounded-full bg-text-muted" />
        <span className="typing-dot w-2 h-2 rounded-full bg-text-muted" />
        <span className="typing-dot w-2 h-2 rounded-full bg-text-muted" />
      </div>
    </div>
  );
}
