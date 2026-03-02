'use client';

import { useRef, useEffect, KeyboardEvent } from 'react';
import { ArrowUpIcon } from 'lucide-react';

interface ChatInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
  value: string;
  onChange: (value: string) => void;
}

export function ChatInput({ onSend, disabled = false, value, onChange }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 140) + 'px';
  }, [value]);

  function handleSubmit() {
    if (!value.trim() || disabled) return;
    onSend(value.trim());
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey && !disabled) {
      e.preventDefault();
      handleSubmit();
    }
  }

  const hasContent = value.trim().length > 0;

  return (
    <div
      className="flex items-end gap-3 px-4 py-3 rounded-2xl border transition-all duration-200"
      style={{
        background: 'rgba(14,14,14,0.90)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderColor: 'rgba(37,173,145,0.45)',
        boxShadow: '0 0 0 1px rgba(37,173,145,0.15), 0 0 20px rgba(37,173,145,0.10), 0 4px 20px rgba(0,0,0,0.40)',
      }}
    >
      <textarea
        ref={textareaRef}
        rows={1}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder="Ask anything about your course materials..."
        className="flex-1 resize-none text-text-primary placeholder:text-text-muted outline-none overflow-y-auto disabled:opacity-40 text-sm leading-relaxed"
        style={{ maxHeight: '140px', background: 'transparent' }}
      />
      <button
        type="button"
        onClick={handleSubmit}
        disabled={!hasContent || disabled}
        className="shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 disabled:cursor-not-allowed"
        style={{
          background: hasContent && !disabled
            ? 'linear-gradient(135deg, #25ad91 0%, #1e9a80 100%)'
            : 'transparent',
          border: hasContent && !disabled ? 'none' : '1px solid #2a2a2a',
          opacity: hasContent && !disabled ? 1 : 0.35,
          boxShadow: hasContent && !disabled
            ? '0 0 12px rgba(37,173,145,0.30)'
            : 'none',
        }}
      >
        <ArrowUpIcon
          className="w-4 h-4"
          style={{ color: hasContent && !disabled ? '#fff' : '#555' }}
        />
      </button>
    </div>
  );
}
