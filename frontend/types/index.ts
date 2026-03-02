// ─── Domain Types ─────────────────────────────────────────────────────────────

export type MessageRole = 'user' | 'assistant';
export type ResourceType = 'pdf' | 'txt' | 'md';
export type ResourceScope = 'chat' | 'global';

export interface Message {
  id: string;
  chatId: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
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
  chatId: string | null; // null = globally scoped
  name: string;
  type: ResourceType;
  size: number; // bytes
  uploadedAt: Date;
}

// ─── Application State ────────────────────────────────────────────────────────

export interface AppState {
  chats: Chat[];
  activeChatId: string | null;
  resources: Resource[];
  isTyping: boolean;
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
