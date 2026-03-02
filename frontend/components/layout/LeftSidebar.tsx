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
      className="w-64 h-full flex flex-col shrink-0 rounded-2xl overflow-hidden"
      style={{
        background: '#0a0a0a',
        border: '1px solid #1a1a1a',
      }}
    >
      {/* Brand header */}
      <div className="px-4 py-4 flex items-center gap-2.5">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: 'linear-gradient(135deg, #25ad91 0%, #1e9a80 100%)' }}
        >
          <GraduationCapIcon className="w-4 h-4 text-white" strokeWidth={2} />
        </div>
        <span className="font-semibold text-sm tracking-tight">
          <span className="text-white">EIT AI</span>
        </span>
      </div>

      {/* New Chat button */}
      <div className="px-3 pb-3">
        <button
          onClick={handleNewChat}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-white hover:text-white hover:bg-surface-2 transition-all duration-150 text-sm font-medium group"
          style={{ border: '1px solid #1a1a1a' }}
        >
          <span
            className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-colors"
            style={{ background: 'rgba(37,173,145,0.10)' }}
          >
            <PlusIcon className="w-3.5 h-3.5 text-brand" />
          </span>
          New Chat
        </button>
      </div>

      {/* Divider + section label */}
      <div className="px-4 pb-2">
        <p className="text-[10px] font-medium text-white/50 uppercase tracking-widest">
          Recent
        </p>
      </div>

      {/* Chat list */}
      <nav className="flex-1 overflow-y-auto px-2 pb-4 space-y-0.5">
        {state.chats.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-10 px-4">
            <MessagesSquareIcon className="w-5 h-5 text-text-faint" />
            <p className="text-white/40 text-xs text-center leading-relaxed">
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
                className="group relative flex items-center rounded-xl px-3 py-2 cursor-pointer transition-all duration-150"
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
                  className={`flex-1 truncate text-xs pr-6 leading-relaxed ${
                    isActive ? 'text-white' : 'text-white/70'
                  }`}
                >
                  {chat.title}
                </span>
                <button
                  onClick={(e) => handleDelete(e, chat.id)}
                  className="absolute right-2 opacity-0 group-hover:opacity-100 p-1 rounded-lg transition-all"
                  style={{ color: '#555' }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLElement).style.color = '#ef4444')
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLElement).style.color = '#555')
                  }
                  title="Delete chat"
                >
                  <Trash2Icon className="w-3 h-3" />
                </button>
              </div>
            );
          })
        )}
      </nav>
    </aside>
  );
}
