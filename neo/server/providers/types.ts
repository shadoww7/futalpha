export type ProviderId = 'grok' | 'codex';
export type Effort = 'low' | 'medium' | 'high' | 'xhigh';

export interface ChatAttachment {
  name: string;
  type: string;
  dataUrl?: string;
  text?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  attachments?: ChatAttachment[];
}

export interface ChatRequest {
  conversationId: string;
  provider: ProviderId;
  model: string;
  effort: Effort;
  research?: boolean;
  messages: ChatMessage[];
}

export type StreamEvent =
  | { type: 'reasoning'; delta: string }
  | { type: 'text'; delta: string }
  | { type: 'source'; title: string; url: string }
  | { type: 'done' }
  | { type: 'error'; message: string };

export type StreamEmitter = (event: StreamEvent) => void;

export interface HealthStatus {
  ok: true;
  grok: boolean;
  codex: boolean;
  demo: boolean;
  connected: boolean;
}
