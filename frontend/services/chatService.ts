import { Chat, Message, BackendQueryResponse, Citation } from '@/types';
import { apiPost } from './apiClient';

const CHATS_STORAGE_KEY = 'eit-learning-ai-chats';

function loadChatsFromStorage(): Chat[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CHATS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return parsed.map((c: Record<string, unknown>) => ({
      ...c,
      createdAt: new Date(c.createdAt as string),
      updatedAt: new Date(c.updatedAt as string),
      messages: (c.messages as Record<string, unknown>[]).map((m) => ({
        ...m,
        timestamp: new Date(m.timestamp as string),
      })),
    }));
  } catch {
    return [];
  }
}

export function saveChatsToStorage(chats: Chat[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CHATS_STORAGE_KEY, JSON.stringify(chats));
  } catch {
    // Ignore quota errors
  }
}

export async function getChats(): Promise<Chat[]> {
  return loadChatsFromStorage();
}

export async function createChat(firstMessage: string): Promise<Chat> {
  const title =
    firstMessage.length > 40
      ? firstMessage.slice(0, 40) + '...'
      : firstMessage;
  const chat: Chat = {
    id: `chat-${Date.now()}`,
    title,
    createdAt: new Date(),
    updatedAt: new Date(),
    messages: [],
  };
  return chat;
}

export async function deleteChat(_chatId: string): Promise<void> {
  // Storage sync handled by AppContext effect
}

export async function sendMessage(
  chatId: string,
  content: string,
  documentIds?: string[],
): Promise<Message> {
  const body: Record<string, unknown> = {
    query: content,
    top_k: 5,
  };

  if (documentIds && documentIds.length > 0) {
    body.filters = { document_ids: documentIds };
  }

  const response = await apiPost<BackendQueryResponse>('/query', body);

  const citations: Citation[] = (response.citations || []);

  const message: Message = {
    id: `msg-${Date.now()}`,
    chatId,
    role: 'assistant',
    content: response.answer,
    timestamp: new Date(),
    citations: citations.length > 0 ? citations : undefined,
  };

  return message;
}
