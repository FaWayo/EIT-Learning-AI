import { Chat, Message, BackendQueryResponse } from '@/types';
import { apiPost } from './apiClient';

export async function getChats(): Promise<Chat[]> {
  // Chats are frontend-only; no backend persistence
  return [];
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
  // Frontend-only — no backend call needed
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

  const citations: Citation[] = response.citations || [];

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
