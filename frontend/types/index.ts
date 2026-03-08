// ─── Domain Types ─────────────────────────────────────────────────────────────

export type MessageRole = 'user' | 'assistant';
export type ResourceType = 'pdf' | 'txt' | 'md';
export type ResourceScope = 'chat' | 'global';
export type ProcessingStatus = 'queued' | 'processing' | 'processed' | 'failed';

export interface CitationLocation {
  page_number?: number | null;
  section_heading?: string | null;
  chunk_index?: number | null;
}

export interface Citation {
  id: number;
  document_id: string;
  document_title: string;
  snippet: string;
  similarity_score: number;
  location: CitationLocation;
}

export interface Message {
  id: string;
  chatId: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  citations?: Citation[];
}

export interface Chat {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  messages: Message[];
}

export interface Resource {
  id: string;
  backendId: string;
  chatId: string | null; // null = globally scoped
  name: string;
  type: ResourceType;
  size: number; // bytes
  status: ProcessingStatus;
  uploadedAt: Date;
}

// ─── Backend Response Types ──────────────────────────────────────────────────

export interface BackendDocument {
  id: string;
  title: string;
  content_type: string;
  status: string;
  num_chunks: number | null;
  created_at: string;
  updated_at: string;
}

export interface BackendUploadResponse {
  documents: Array<{
    id: string;
    title: string;
    status: string;
  }>;
}

export interface BackendDocumentStatus {
  id: string;
  title: string;
  status: string;
  num_chunks: number | null;
  error_message: string | null;
}

export interface BackendQueryResponse {
  answer: string;
  citations: Citation[];
}

// ─── Application State ────────────────────────────────────────────────────────

export interface AppState {
  chats: Chat[];
  activeChatId: string | null;
  resources: Resource[];
  isTyping: boolean;
  error: string | null;
  leftSidebarOpen: boolean;
  rightSidebarOpen: boolean;
}

// ─── Reducer Actions ─────────────────────────────────────────────────────────

export type AppAction =
  | { type: 'LOAD_CHATS'; payload: Chat[] }
  | { type: 'ADD_CHAT'; payload: Chat }
  | { type: 'DELETE_CHAT'; payload: string }
  | { type: 'SET_ACTIVE_CHAT'; payload: string | null }
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'SET_TYPING'; payload: boolean }
  | { type: 'LOAD_RESOURCES'; payload: Resource[] }
  | { type: 'ADD_RESOURCE'; payload: Resource }
  | { type: 'DELETE_RESOURCE'; payload: string }
  | { type: 'UPDATE_RESOURCE_STATUS'; payload: { id: string; status: ProcessingStatus } }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'TOGGLE_LEFT_SIDEBAR' }
  | { type: 'TOGGLE_RIGHT_SIDEBAR' };

// ─── Context Shape ────────────────────────────────────────────────────────────

export interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  handleSendMessage: (content: string) => Promise<string>;
  handleUploadResource: (file: File, scope: ResourceScope) => Promise<void>;
  handleDeleteChat: (chatId: string) => Promise<void>;
  handleDeleteResource: (resourceId: string) => Promise<void>;
}
