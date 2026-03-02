'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { ChatInput } from './ChatInput';
import { WelcomeScreen } from './WelcomeScreen';

interface ChatAreaProps {
  chatId: string | null;
}

export function ChatArea({ chatId }: ChatAreaProps) {
  const { state, handleSendMessage } = useApp();
  const router = useRouter();
  const [inputValue, setInputValue] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const prevActiveChatIdRef = useRef<string | null>(state.activeChatId);

  const chat = chatId
    ? state.chats.find((c) => c.id === chatId) ?? null
    : null;
  const messages = chat?.messages ?? [];

  // Navigate to new chat when one is created from the welcome screen
  useEffect(() => {
    if (
      state.activeChatId &&
      state.activeChatId !== chatId &&
      prevActiveChatIdRef.current !== state.activeChatId
    ) {
      router.push(`/chat/${state.activeChatId}`);
    }
    prevActiveChatIdRef.current = state.activeChatId;
  }, [state.activeChatId, chatId, router]);

  // Auto-scroll to bottom on new message or typing change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, state.isTyping]);

  async function handleSend(content: string) {
    setInputValue('');
    await handleSendMessage(content);
  }

  if (!chatId) {
    return <WelcomeScreen onSend={handleSend} isTyping={state.isTyping} />;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Message list */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-7">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-20">
              <p className="text-text-muted text-sm">
                Start the conversation below
              </p>
            </div>
          ) : (
            messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))
          )}
          {state.isTyping && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input bar */}
      <div
        className="shrink-0 px-4 pb-5 pt-3"
        style={{
          background: 'linear-gradient(to top, #0e0e0e 60%, transparent)',
        }}
      >
        <div className="max-w-3xl mx-auto space-y-2">
          <ChatInput
            onSend={handleSend}
            disabled={state.isTyping}
            value={inputValue}
            onChange={setInputValue}
          />
          <p className="text-center text-[11px] text-text-muted">
            AI responses are based on your uploaded course materials.
          </p>
        </div>
      </div>
    </div>
  );
}
