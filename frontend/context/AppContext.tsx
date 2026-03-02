'use client';

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
} from 'react';
import { AppState, AppAction, AppContextValue, ResourceScope } from '@/types';
import {
  getChats,
  createChat,
  deleteChat,
  sendMessage,
} from '@/services/chatService';
import {
  getResources,
  uploadResource,
  deleteResource,
} from '@/services/resourceService';

// ─── Initial State ────────────────────────────────────────────────────────────
const initialState: AppState = {
  chats: [],
  activeChatId: null,
  resources: [],
  isTyping: false,
  leftSidebarOpen: true,
  rightSidebarOpen: true,
};

// ─── Reducer ──────────────────────────────────────────────────────────────────
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'LOAD_CHATS':
      return { ...state, chats: action.payload };

    case 'ADD_CHAT':
      return { ...state, chats: [action.payload, ...state.chats] };

    case 'DELETE_CHAT':
      return {
        ...state,
        chats: state.chats.filter((c) => c.id !== action.payload),
        activeChatId:
          state.activeChatId === action.payload ? null : state.activeChatId,
      };

    case 'SET_ACTIVE_CHAT':
      return { ...state, activeChatId: action.payload };

    case 'ADD_MESSAGE': {
      const msg = action.payload;
      return {
        ...state,
        chats: state.chats.map((chat) =>
          chat.id === msg.chatId
            ? {
                ...chat,
                messages: [...chat.messages, msg],
                updatedAt: new Date(),
              }
            : chat,
        ),
      };
    }

    case 'SET_TYPING':
      return { ...state, isTyping: action.payload };

    case 'LOAD_RESOURCES':
      return { ...state, resources: action.payload };

    case 'ADD_RESOURCE':
      return { ...state, resources: [action.payload, ...state.resources] };

    case 'DELETE_RESOURCE':
      return {
        ...state,
        resources: state.resources.filter((r) => r.id !== action.payload),
      };

    case 'TOGGLE_LEFT_SIDEBAR':
      return { ...state, leftSidebarOpen: !state.leftSidebarOpen };

    case 'TOGGLE_RIGHT_SIDEBAR':
      return { ...state, rightSidebarOpen: !state.rightSidebarOpen };

    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────
const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load initial data on mount
  useEffect(() => {
    getChats().then((chats) =>
      dispatch({ type: 'LOAD_CHATS', payload: chats }),
    );
    getResources().then((resources) =>
      dispatch({ type: 'LOAD_RESOURCES', payload: resources }),
    );
  }, []);

  // ─── Async convenience actions ──────────────────────────────────────────────

  // Returns the chatId (new or existing) so callers can navigate
  const handleSendMessage = useCallback(
    async (content: string): Promise<string> => {
      let chatId = state.activeChatId;

      if (!chatId) {
        const newChat = await createChat(content);
        dispatch({ type: 'ADD_CHAT', payload: newChat });
        dispatch({ type: 'SET_ACTIVE_CHAT', payload: newChat.id });
        chatId = newChat.id;
      }

      const userMsg = {
        id: `msg-${Date.now()}-u`,
        chatId,
        role: 'user' as const,
        content,
        timestamp: new Date(),
      };
      dispatch({ type: 'ADD_MESSAGE', payload: userMsg });
      dispatch({ type: 'SET_TYPING', payload: true });

      try {
        const assistantMsg = await sendMessage(chatId, content);
        dispatch({ type: 'ADD_MESSAGE', payload: assistantMsg });
      } finally {
        dispatch({ type: 'SET_TYPING', payload: false });
      }

      return chatId;
    },
    [state.activeChatId],
  );

  const handleUploadResource = useCallback(
    async (file: File, scope: ResourceScope) => {
      const resource = await uploadResource(file, state.activeChatId, scope);
      dispatch({ type: 'ADD_RESOURCE', payload: resource });
    },
    [state.activeChatId],
  );

  const handleDeleteChat = useCallback(async (chatId: string) => {
    await deleteChat(chatId);
    dispatch({ type: 'DELETE_CHAT', payload: chatId });
  }, []);

  const handleDeleteResource = useCallback(async (resourceId: string) => {
    await deleteResource(resourceId);
    dispatch({ type: 'DELETE_RESOURCE', payload: resourceId });
  }, []);

  return (
    <AppContext.Provider
      value={{
        state,
        dispatch,
        handleSendMessage,
        handleUploadResource,
        handleDeleteChat,
        handleDeleteResource,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
