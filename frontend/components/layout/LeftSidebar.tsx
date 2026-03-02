'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { PlusIcon, Trash2Icon, MessagesSquareIcon, GraduationCapIcon } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export function LeftSidebar() {
  const { state, dispatch, handleDeleteChat } = useApp();
  const router = useRouter();
  const pathname = usePathname();

  // Sync activeChatId with URL (handles browser back/forward)
  useEffect(() => {
    const match = pathname.match(/^\/chat\/(.+)$/);
    const urlChatId = match ? match[1] : null;
    if (urlChatId !== state.activeChatId) {
      dispatch({ type: 'SET_ACTIVE_CHAT', payload: urlChatId });
    }
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleNewChat() {
    dispatch({ type: 'SET_ACTIVE_CHAT', payload: null });
    router.push('/chat');
  }

  function handleSelectChat(chatId: string) {
    dispatch({ type: 'SET_ACTIVE_CHAT', payload: chatId });
    router.push(`/chat/${chatId}`);
  }

  async function handleDelete(e: React.MouseEvent, chatId: string) {
    e.stopPropagation();
    await handleDeleteChat(chatId);
    if (state.activeChatId === chatId) {
      router.push('/chat');
    }
  }

  return (
    <aside
      className="w-72 h-full flex flex-col shrink-0 rounded-2xl overflow-hidden"
      style={{
        background: '#0a0a0a',
        border: '1px solid #1a1a1a',
      }}
    >
      {/* Brand header */}
      <div className="px-5 py-5 flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: 'linear-gradient(135deg, #25ad91 0%, #1e9a80 100%)' }}
        >
          <GraduationCapIcon className="w-5 h-5 text-white" strokeWidth={2} />
        </div>
        <span className="font-semibold text-base tracking-tight">
          <span className="text-white">EIT AI</span>
        </span>
      </div>

      {/* New Chat button */}
      <div className="px-4 pb-4">
        <button
          onClick={handleNewChat}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white hover:text-white hover:bg-surface-2 transition-all duration-150 text-sm font-medium group"
          style={{ border: '1px solid #1a1a1a' }}
        >
          <span
            className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 transition-colors"
            style={{ background: 'rgba(37,173,145,0.10)' }}
          >
            <PlusIcon className="w-4 h-4 text-brand" />
          </span>
          New Chat
        </button>
      </div>

      {/* Divider + section label */}
      <div className="px-5 pb-2">
        <p className="text-[11px] font-medium text-white/50 uppercase tracking-widest">
          Recent
        </p>
      </div>

      {/* Chat list */}
      <nav className="flex-1 overflow-y-auto px-3 pb-4 space-y-1">
        {state.chats.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-12 px-4">
            <MessagesSquareIcon className="w-6 h-6 text-text-faint" />
            <p className="text-white/40 text-sm text-center leading-relaxed">
              No conversations yet
            </p>
          </div>
        ) : (
          state.chats.map((chat) => {
            const isActive = chat.id === state.activeChatId;
            return (
              <div
                key={chat.id}
                onClick={() => handleSelectChat(chat.id)}
                className="group relative flex items-center rounded-xl px-4 py-3 cursor-pointer transition-all duration-150"
                style={{
                  background: isActive ? 'rgba(37,173,145,0.06)' : 'transparent',
                  borderLeft: isActive ? '2px solid rgba(37,173,145,0.60)' : '2px solid transparent',
                  paddingLeft: '10px',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) (e.currentTarget as HTMLElement).style.background = '#131313';
                }}
                onMouseLeave={(e) => {
                  if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent';
                }}
              >
                <span
                  className={`flex-1 truncate text-sm pr-7 leading-relaxed ${
                    isActive ? 'text-white' : 'text-white/70'
                  }`}
                >
                  {chat.title}
                </span>
                <button
                  onClick={(e) => handleDelete(e, chat.id)}
                  className="absolute right-3 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg transition-all"
                  style={{ color: '#555' }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLElement).style.color = '#ef4444')
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLElement).style.color = '#555')
                  }
                  title="Delete chat"
                >
                  <Trash2Icon className="w-4 h-4" />
                </button>
              </div>
            );
          })
        )}
      </nav>
    </aside>
  );
}
