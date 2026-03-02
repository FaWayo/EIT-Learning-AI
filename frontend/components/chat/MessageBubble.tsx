'use client';

import { BotIcon } from 'lucide-react';
import { Message } from '@/types';

function formatTimestamp(date: Date): string {
  const now = new Date();
  const isToday =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  if (isToday) return `${hours}:${minutes}`;

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[date.getMonth()]} ${date.getDate()}, ${hours}:${minutes}`;
}

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  if (message.role === 'user') {
    return (
      <div className="msg-animate flex justify-end">
        <div
          className="max-w-[78%] rounded-2xl rounded-br-md px-5 py-4"
          style={{
            background: '#1c1c1c',
            border: '1px solid #252525',
          }}
        >
          <p className="text-white text-base whitespace-pre-wrap leading-relaxed">
            {message.content}
          </p>
          <time className="text-text-muted text-[11px] mt-2 block text-right">
            {formatTimestamp(new Date(message.timestamp))}
          </time>
        </div>
      </div>
    );
  }

  return (
    <div className="msg-animate flex items-start gap-4">
      {/* Avatar with glow */}
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 pt-0.5"
        style={{
          background: 'linear-gradient(135deg, #25ad91 0%, #1e9a80 100%)',
        }}
      >
        <BotIcon className="w-5 h-5 text-white" strokeWidth={2} />
      </div>

      {/* Message content */}
      <div className="flex-1 min-w-0 pt-1">
        <p className="text-white text-base leading-relaxed whitespace-pre-wrap">
          {message.content}
        </p>
        <time className="text-text-muted text-[11px] mt-2 block">
          {formatTimestamp(new Date(message.timestamp))}
        </time>
      </div>
    </div>
  );
}
