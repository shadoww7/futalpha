export type ProviderId = 'grok' | 'codex';
export type Effort = 'low' | 'medium' | 'high' | 'xhigh';
export type ThemeId = 'black' | 'gray' | 'oled';
export type Density = 'comfortable' | 'compact';
export type Locale = 'pt-BR' | 'en';

export interface SourceLink {
  title: string;
  url: string;
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  dataUrl?: string;
  text?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  thought?: string;
  sources?: SourceLink[];
  attachments?: Attachment[];
  createdAt: number;
  error?: string;
  tools?: { name: string; status: 'start' | 'done' | 'error'; detail?: string }[];
}

export interface Chat {
  id: string;
  workspaceId: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  provider: ProviderId;
  model: string;
  effort: Effort;
  research: boolean;
  mcp: boolean;
  messages: ChatMessage[];
  forkedFrom?: string;
}

export interface Workspace {
  id: string;
  name: string;
  collapsed: boolean;
  createdAt: number;
}

export interface Settings {
  displayName: string;
  avatarLetter: string;
  theme: ThemeId;
  density: Density;
  locale: Locale;
  compareEnabled: boolean;
  compareModel: string;
  motionBg: boolean;
  sidebarOpen: boolean;
}

export interface Automation {
  id: string;
  title: string;
  prompt: string;
  intervalMs: number;
  enabled: boolean;
  lastRunAt?: number;
  nextRunAt?: number;
}

export interface HealthStatus {
  ok: boolean;
  grok: boolean;
  codex: boolean;
  demo: boolean;
  connected: boolean;
  mcp?: { servers: number; connected: number; tools: number };
}

export interface ModelOption {
  provider: ProviderId;
  id: string;
  label: string;
  hint: string;
  disabled?: boolean;
}

export type StreamEvent =
  | { type: 'reasoning'; delta: string }
  | { type: 'text'; delta: string }
  | { type: 'source'; title: string; url: string }
  | { type: 'tool'; name: string; status: 'start' | 'done' | 'error'; detail?: string }
  | { type: 'done' }
  | { type: 'error'; message: string };

export interface McpServerStatus {
  id: string;
  name: string;
  command: string;
  args: string[];
  enabled: boolean;
  builtin?: boolean;
  connected: boolean;
  error?: string;
  tools: { name: string; description: string; serverName: string }[];
}
