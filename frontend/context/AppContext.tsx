'use client';

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import { AppState, AppAction, AppContextValue, ResourceScope, ProcessingStatus } from '@/types';
import {
  createChat,
  deleteChat,
  sendMessage,
  getChats,
  saveChatsToStorage,
} from '@/services/chatService';
import {
  getResources,
  uploadResource,
  deleteResource,
  getDocumentStatus,
} from '@/services/resourceService';

// ─── Initial State ────────────────────────────────────────────────────────────
const initialState: AppState = {
  chats: [],
  activeChatId: null,
  resources: [],
  isTyping: false,
  error: null,
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

    case 'UPDATE_RESOURCE_STATUS':
      return {
        ...state,
        resources: state.resources.map((r) =>
          r.id === action.payload.id
            ? { ...r, status: action.payload.status }
            : r,
        ),
      };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

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
  const pollingTimers = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Load chats from localStorage on mount
  useEffect(() => {
    getChats().then((chats) => {
      dispatch({ type: 'LOAD_CHATS', payload: chats });
    });
  }, []);

  // Persist chats to localStorage whenever they change
  useEffect(() => {
    saveChatsToStorage(state.chats);
  }, [state.chats]);

  // Load initial resources from backend on mount
  useEffect(() => {
    getResources()
      .then((resources) => {
        dispatch({ type: 'LOAD_RESOURCES', payload: resources });
        // Start polling for any resources that are still processing
        resources.forEach((r) => {
          if (r.status === 'queued' || r.status === 'processing') {
            startPolling(r.backendId);
          }
        });
      })
      .catch((err) => {
        console.error('Failed to load resources:', err);
      });

    return () => {
      // Cleanup all polling timers on unmount
      pollingTimers.current.forEach((timer) => clearInterval(timer));
      pollingTimers.current.clear();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Poll document status until processed or failed
  function startPolling(documentId: string) {
    if (pollingTimers.current.has(documentId)) return;

    const timer = setInterval(async () => {
      try {
        const status: ProcessingStatus = await getDocumentStatus(documentId);
        dispatch({
          type: 'UPDATE_RESOURCE_STATUS',
          payload: { id: documentId, status },
        });

        if (status === 'processed' || status === 'failed') {
          clearInterval(pollingTimers.current.get(documentId));
          pollingTimers.current.delete(documentId);
        }
      } catch {
        // If polling fails, stop silently
        clearInterval(pollingTimers.current.get(documentId));
        pollingTimers.current.delete(documentId);
      }
    }, 3000);

    pollingTimers.current.set(documentId, timer);
  }

  // ─── Async convenience actions ──────────────────────────────────────────────

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
      dispatch({ type: 'SET_ERROR', payload: null });

      try {
        // Collect document IDs from processed resources
        const documentIds = state.resources
          .filter((r) => r.status === 'processed')
          .map((r) => r.backendId);

        const assistantMsg = await sendMessage(chatId, content, documentIds);
        dispatch({ type: 'ADD_MESSAGE', payload: assistantMsg });
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to get a response. Please try again.';
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
        // Add an error message as assistant response so the user sees it in chat
        const errorMsg = {
          id: `msg-${Date.now()}-err`,
          chatId,
          role: 'assistant' as const,
          content: `Sorry, I couldn't process your request. ${errorMessage}`,
          timestamp: new Date(),
        };
        dispatch({ type: 'ADD_MESSAGE', payload: errorMsg });
      } finally {
        dispatch({ type: 'SET_TYPING', payload: false });
      }

      return chatId;
    },
    [state.activeChatId, state.resources],
  );

  const handleUploadResource = useCallback(
    async (file: File, scope: ResourceScope) => {
      try {
        const resource = await uploadResource(file, state.activeChatId, scope);
        dispatch({ type: 'ADD_RESOURCE', payload: resource });
        // Start polling for ingestion status
        startPolling(resource.backendId);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to upload file.';
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
      }
    },
    [state.activeChatId], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const handleDeleteChat = useCallback(async (chatId: string) => {
    await deleteChat(chatId);
    dispatch({ type: 'DELETE_CHAT', payload: chatId });
  }, []);

  const handleDeleteResource = useCallback(async (resourceId: string) => {
    await deleteResource(resourceId);
    dispatch({ type: 'DELETE_RESOURCE', payload: resourceId });
    // Stop polling if running
    const timer = pollingTimers.current.get(resourceId);
    if (timer) {
      clearInterval(timer);
      pollingTimers.current.delete(resourceId);
    }
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
