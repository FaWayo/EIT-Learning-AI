import { Chat, Message } from '@/types';

// ─── Delay helper ─────────────────────────────────────────────────────────────
const delay = (ms: number) => new Promise<void>((res) => setTimeout(res, ms));

// ─── Seed data ────────────────────────────────────────────────────────────────
const MOCK_CHATS: Chat[] = [
  {
    id: 'chat-1',
    title: 'What is retrieval-augmented gen...',
    createdAt: new Date('2026-02-28T09:00:00'),
    updatedAt: new Date('2026-02-28T09:05:00'),
    messages: [
      {
        id: 'msg-1',
        chatId: 'chat-1',
        role: 'user',
        content: 'What is retrieval-augmented generation?',
        timestamp: new Date('2026-02-28T09:00:00'),
      },
      {
        id: 'msg-2',
        chatId: 'chat-1',
        role: 'assistant',
        content:
          'Retrieval-Augmented Generation (RAG) is an AI architecture that combines information retrieval with text generation. Instead of relying solely on knowledge encoded in model weights, RAG retrieves relevant documents from an external knowledge base and injects them into the model context before generating a response. This allows the model to answer questions grounded in specific, up-to-date information from your course materials.',
        timestamp: new Date('2026-02-28T09:00:04'),
      },
    ],
  },
  {
    id: 'chat-2',
    title: 'How do vector embeddings work?',
    createdAt: new Date('2026-03-01T14:00:00'),
    updatedAt: new Date('2026-03-01T14:03:00'),
    messages: [
      {
        id: 'msg-3',
        chatId: 'chat-2',
        role: 'user',
        content: 'How do vector embeddings work?',
        timestamp: new Date('2026-03-01T14:00:00'),
      },
      {
        id: 'msg-4',
        chatId: 'chat-2',
        role: 'assistant',
        content:
          'Vector embeddings are numerical representations of text in a high-dimensional space. Words or sentences with similar meanings are placed close together geometrically. In RAG systems, both documents and queries are embedded using the same model, and cosine similarity search is used to find the most relevant document chunks for a given query. Your course notes cover this in the NLP fundamentals section.',
        timestamp: new Date('2026-03-01T14:00:03'),
      },
    ],
  },
  {
    id: 'chat-3',
    title: 'Explain the lean startup methodol...',
    createdAt: new Date('2026-03-01T16:30:00'),
    updatedAt: new Date('2026-03-01T16:35:00'),
    messages: [
      {
        id: 'msg-5',
        chatId: 'chat-3',
        role: 'user',
        content: 'Explain the lean startup methodology',
        timestamp: new Date('2026-03-01T16:30:00'),
      },
      {
        id: 'msg-6',
        chatId: 'chat-3',
        role: 'assistant',
        content:
          'The Lean Startup methodology, popularized by Eric Ries, is an approach to building businesses and products. The core idea is the Build-Measure-Learn feedback loop: you build a Minimum Viable Product (MVP), measure how customers respond, and learn whether to pivot or persevere. This reduces waste by avoiding building features nobody wants. According to the EIT course materials uploaded, MEST applies this framework extensively in its product development curriculum.',
        timestamp: new Date('2026-03-01T16:30:05'),
      },
    ],
  },
];

// ─── Mock AI responses ────────────────────────────────────────────────────────
const MOCK_RESPONSES = [
  'Based on the uploaded course materials, this concept is covered in depth. The key idea here is that knowledge builds incrementally — you first need to understand the foundational theory before applying it to real-world scenarios. Your lecture notes outline three core principles that are worth reviewing.',
  "That's an important question for your coursework. According to the documents in your knowledge base, there are several frameworks to consider. The most relevant one covered in your materials is the structured approach that MEST uses across its entrepreneurship program.",
  'I found relevant information across your uploaded resources. The answer connects the theoretical framework from your lecture notes with the practical case studies in the PDF you uploaded. The short version: this concept operates on two levels — strategic and operational.',
  'Looking at your course materials, this topic is approached by first establishing a clear problem definition, then systematically applying the design thinking process. Your uploaded notes specifically mention this in the context of customer discovery.',
  'Great question! Your uploaded materials address this directly. The framework described in Chapter 2 of your course pack applies here. The three-step model outlined there gives you a solid mental model for approaching this kind of problem.',
];

function generateMockResponse(userMessage: string): string {
  const idx = Math.floor(Math.random() * MOCK_RESPONSES.length);
  const snippet =
    userMessage.length > 40
      ? userMessage.slice(0, 40) + '...'
      : userMessage;
  return (
    MOCK_RESPONSES[idx] +
    `\n\n*This response is based on the documents in your knowledge base. Query: "${snippet}"*`
  );
}

// ─── Service functions ────────────────────────────────────────────────────────

export async function getChats(): Promise<Chat[]> {
  await delay(300);
  return MOCK_CHATS.map((c) => ({
    ...c,
    messages: c.messages.map((m) => ({ ...m })),
  }));
}

export async function createChat(firstMessage: string): Promise<Chat> {
  await delay(200);
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
  MOCK_CHATS.unshift(chat);
  return { ...chat, messages: [] };
}

export async function deleteChat(chatId: string): Promise<void> {
  await delay(200);
  const idx = MOCK_CHATS.findIndex((c) => c.id === chatId);
  if (idx !== -1) MOCK_CHATS.splice(idx, 1);
}

export async function sendMessage(
  chatId: string,
  content: string,
): Promise<Message> {
  await delay(1500);
  const message: Message = {
    id: `msg-${Date.now()}`,
    chatId,
    role: 'assistant',
    content: generateMockResponse(content),
    timestamp: new Date(),
  };
  const chat = MOCK_CHATS.find((c) => c.id === chatId);
  if (chat) {
    chat.messages.push(message);
    chat.updatedAt = new Date();
  }
  return { ...message };
}
