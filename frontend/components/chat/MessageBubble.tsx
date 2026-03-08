'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { BotIcon, ChevronDownIcon, FileTextIcon } from 'lucide-react';
import { Message, Citation } from '@/types';

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

function CitationCard({ citation }: { citation: Citation }) {
  const score = Math.round(citation.similarity_score * 100);
  return (
    <div
      className="rounded-lg px-3 py-2.5 space-y-1"
      style={{ background: '#161616', border: '1px solid #1f1f1f' }}
    >
      <div className="flex items-center gap-2">
        <FileTextIcon className="w-3.5 h-3.5 shrink-0" style={{ color: '#25ad91' }} />
        <span className="text-xs font-medium text-white/80 truncate">
          {citation.document_title}
        </span>
        <span
          className="text-[10px] px-1.5 py-0.5 rounded font-mono shrink-0"
          style={{ color: '#25ad91', background: 'rgba(37,173,145,0.10)' }}
        >
          {score}%
        </span>
      </div>
      {citation.snippet && (
        <p className="text-[11px] text-white/50 leading-relaxed line-clamp-2">
          {citation.snippet}
        </p>
      )}
    </div>
  );
}

function CitationsSection({ citations }: { citations: Citation[] }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="mt-3">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 text-xs font-medium transition-colors"
        style={{ color: '#25ad91' }}
      >
        <ChevronDownIcon
          className={`w-3.5 h-3.5 transition-transform duration-200 ${expanded ? 'rotate-0' : '-rotate-90'}`}
        />
        {citations.length} source{citations.length !== 1 ? 's' : ''}
      </button>
      {expanded && (
        <div className="mt-2 space-y-1.5">
          {citations.map((c) => (
            <CitationCard key={c.id} citation={c} />
          ))}
        </div>
      )}
    </div>
  );
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
        <div className="prose prose-invert max-w-none text-base leading-relaxed">
          <ReactMarkdown
            components={{
              h1: ({ children }) => <h1 className="text-xl font-bold text-white mt-4 mb-2">{children}</h1>,
              h2: ({ children }) => <h2 className="text-lg font-bold text-white mt-3 mb-2">{children}</h2>,
              h3: ({ children }) => <h3 className="text-base font-semibold text-white mt-3 mb-1">{children}</h3>,
              p: ({ children }) => <p className="text-white/90 mb-3 leading-relaxed">{children}</p>,
              ul: ({ children }) => <ul className="list-disc pl-5 mb-3 space-y-1.5 text-white/90">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal pl-5 mb-3 space-y-1.5 text-white/90">{children}</ol>,
              li: ({ children }) => <li className="text-white/90 leading-relaxed">{children}</li>,
              strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
              em: ({ children }) => <em className="italic text-white/80">{children}</em>,
              code: ({ children, className }) => {
                const isBlock = className?.includes('language-');
                return isBlock ? (
                  <code className={`block rounded-lg p-3 my-2 text-sm overflow-x-auto ${className}`} style={{ background: '#161616' }}>
                    {children}
                  </code>
                ) : (
                  <code className="px-1.5 py-0.5 rounded text-sm font-mono" style={{ background: 'rgba(37,173,145,0.15)', color: '#25ad91' }}>
                    {children}
                  </code>
                );
              },
              pre: ({ children }) => <pre className="rounded-lg my-3 overflow-x-auto" style={{ background: '#161616' }}>{children}</pre>,
              blockquote: ({ children }) => (
                <blockquote className="border-l-2 pl-4 my-3 text-white/60" style={{ borderColor: '#25ad91' }}>
                  {children}
                </blockquote>
              ),
              hr: () => <hr className="my-4 border-white/10" />,
              a: ({ href, children }) => (
                <a href={href} target="_blank" rel="noopener noreferrer" className="underline" style={{ color: '#25ad91' }}>
                  {children}
                </a>
              ),
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>
        {message.citations && message.citations.length > 0 && (
          <CitationsSection citations={message.citations} />
        )}
        <time className="text-text-muted text-[11px] mt-2 block">
          {formatTimestamp(new Date(message.timestamp))}
        </time>
      </div>
    </div>
  );
}
