import { create } from 'zustand';
import type { ChatRequest } from '../../server/providers/types';
import { fetchHealth, streamChat } from '../lib/api';
import { chatToMarkdown, downloadText } from '../lib/export';
import {
  deleteAutomation as dbDeleteAutomation,
  deleteChat as dbDeleteChat,
  getAllAutomations,
  getAllChats,
  getAllWorkspaces,
  getSettings,
  putAutomation,
  putChat,
  putSettings,
  putWorkspace,
} from '../lib/db';
import { titleFromPrompt, uid } from '../lib/time';
import type {
  Attachment,
  Automation,
  Chat,
  ChatMessage,
  HealthStatus,
  Settings,
  Workspace,
} from '../types';

const defaultSettings = (): Settings => ({
  displayName: 'Nathan Deschamps',
  avatarLetter: 'N',
  theme: 'black',
  density: 'comfortable',
  locale: 'pt-BR',
  compareEnabled: false,
  compareModel: 'grok-4.3',
});

const defaultWorkspace = (): Workspace => ({
  id: 'ws_default',
  name: 'workspace',
  collapsed: false,
  createdAt: Date.now(),
});

function blankChat(workspaceId: string, settings?: Partial<Chat>): Chat {
  return {
    id: uid('chat'),
    workspaceId,
    title: 'Novo chat',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    provider: 'grok',
    model: 'grok-4.6',
    effort: 'high',
    research: false,
    mcp: true,
    messages: [],
    ...settings,
  };
}

function toRequest(chat: Chat, messages = chat.messages): ChatRequest {
  return {
    conversationId: chat.id,
    provider: chat.provider,
    model: chat.model,
    effort: chat.effort,
    research: chat.research,
    mcp: chat.mcp !== false,
    messages: messages.map((message) => ({
      role: message.role,
      content: message.content,
      attachments: message.attachments?.map((item) => ({
        name: item.name,
        type: item.type,
        dataUrl: item.dataUrl,
        text: item.text,
      })),
    })),
  };
}

interface PanelState {
  searchOpen: boolean;
  customizeOpen: boolean;
  automationsOpen: boolean;
  ideOpen: boolean;
  canvasOpen: boolean;
  artifactOpen: boolean;
  mcpOpen: boolean;
}

interface NeoState extends PanelState {
  ready: boolean;
  health: HealthStatus;
  settings: Settings;
  workspaces: Workspace[];
  chats: Chat[];
  automations: Automation[];
  activeChatId: string | null;
  streaming: boolean;
  compareStreaming: boolean;
  compareText: string;
  compareThought: string;
  abort: AbortController | null;
  compareAbort: AbortController | null;
  hydrate: () => Promise<void>;
  refreshHealth: () => Promise<void>;
  setSettings: (patch: Partial<Settings>) => void;
  newChat: (workspaceId?: string) => string;
  selectChat: (id: string) => void;
  renameChat: (id: string, title: string) => void;
  deleteChat: (id: string) => void;
  toggleWorkspace: (id: string) => void;
  addWorkspace: (name: string) => void;
  updateActive: (patch: Partial<Pick<Chat, 'provider' | 'model' | 'effort' | 'research' | 'mcp'>>) => void;
  send: (text: string, attachments?: Attachment[]) => Promise<void>;
  stop: () => void;
  regenerate: () => Promise<void>;
  fork: (messageId: string) => void;
  exportChat: (format: 'md' | 'json') => void;
  setPanel: (panel: keyof PanelState, open?: boolean) => void;
  upsertAutomation: (automation: Automation) => void;
  removeAutomation: (id: string) => void;
  runAutomation: (id: string) => Promise<void>;
}

async function persistChat(chat: Chat) {
  await putChat(chat);
}

export const useNeoStore = create<NeoState>((set, get) => ({
  ready: false,
  health: { ok: false, grok: false, codex: false, demo: true, connected: false },
  settings: defaultSettings(),
  workspaces: [],
  chats: [],
  automations: [],
  activeChatId: null,
  streaming: false,
  compareStreaming: false,
  compareText: '',
  compareThought: '',
  abort: null,
  compareAbort: null,
  searchOpen: false,
  customizeOpen: false,
  automationsOpen: false,
  ideOpen: false,
  canvasOpen: false,
  artifactOpen: false,
  mcpOpen: false,

  hydrate: async () => {
    const [settings, workspaces, chats, automations, health] = await Promise.all([
      getSettings(),
      getAllWorkspaces(),
      getAllChats(),
      getAllAutomations(),
      fetchHealth(),
    ]);

    let nextWorkspaces = workspaces;
    if (!nextWorkspaces.length) {
      const seed = defaultWorkspace();
      await putWorkspace(seed);
      nextWorkspaces = [seed];
    }

    const profile = settings ?? defaultSettings();
    if (!settings) await putSettings(profile);

    const sorted = [...chats].sort((a, b) => b.updatedAt - a.updatedAt);
    set({
      ready: true,
      settings: profile,
      workspaces: nextWorkspaces,
      chats: sorted,
      automations,
      health,
      activeChatId: sorted[0]?.id ?? null,
    });
  },

  refreshHealth: async () => {
    set({ health: await fetchHealth() });
  },

  setSettings: (patch) => {
    const settings = { ...get().settings, ...patch };
    if (patch.displayName && !patch.avatarLetter) {
      settings.avatarLetter = patch.displayName.trim().charAt(0).toUpperCase() || 'N';
    }
    set({ settings });
    void putSettings(settings);
  },

  newChat: (workspaceId) => {
    const ws = workspaceId ?? get().workspaces[0]?.id ?? 'ws_default';
    const current = get().chats.find((chat) => chat.id === get().activeChatId);
    const chat = blankChat(ws, {
      provider: current?.provider ?? 'grok',
      model: current?.model ?? 'grok-4.6',
      effort: current?.effort ?? 'high',
    });
    set((state) => ({ chats: [chat, ...state.chats], activeChatId: chat.id }));
    void persistChat(chat);
    return chat.id;
  },

  selectChat: (id) => set({ activeChatId: id, compareText: '', compareThought: '' }),

  renameChat: (id, title) => {
    set((state) => ({
      chats: state.chats.map((chat) => (chat.id === id ? { ...chat, title, updatedAt: Date.now() } : chat)),
    }));
    const chat = get().chats.find((item) => item.id === id);
    if (chat) void persistChat({ ...chat, title });
  },

  deleteChat: (id) => {
    const chats = get().chats.filter((chat) => chat.id !== id);
    set({
      chats,
      activeChatId: get().activeChatId === id ? (chats[0]?.id ?? null) : get().activeChatId,
    });
    void dbDeleteChat(id);
  },

  toggleWorkspace: (id) => {
    const workspaces = get().workspaces.map((ws) =>
      ws.id === id ? { ...ws, collapsed: !ws.collapsed } : ws,
    );
    set({ workspaces });
    const ws = workspaces.find((item) => item.id === id);
    if (ws) void putWorkspace(ws);
  },

  addWorkspace: (name) => {
    const workspace: Workspace = {
      id: uid('ws'),
      name: name.trim() || 'workspace',
      collapsed: false,
      createdAt: Date.now(),
    };
    set((state) => ({ workspaces: [...state.workspaces, workspace] }));
    void putWorkspace(workspace);
  },

  updateActive: (patch) => {
    const id = get().activeChatId;
    if (!id) {
      const created = get().newChat();
      const chat = get().chats.find((item) => item.id === created);
      if (!chat) return;
      const next = { ...chat, ...patch, updatedAt: Date.now() };
      set((state) => ({ chats: state.chats.map((item) => (item.id === next.id ? next : item)) }));
      void persistChat(next);
      return;
    }
    const chats = get().chats.map((chat) => (chat.id === id ? { ...chat, ...patch, updatedAt: Date.now() } : chat));
    set({ chats });
    const chat = chats.find((item) => item.id === id);
    if (chat) void persistChat(chat);
  },

  send: async (text, attachments = []) => {
    const trimmed = text.trim();
    if (!trimmed && !attachments.length) return;
    if (get().streaming) return;

    let chat = get().chats.find((item) => item.id === get().activeChatId);
    if (!chat) {
      get().newChat();
      chat = get().chats.find((item) => item.id === get().activeChatId);
    }
    if (!chat) return;

    const userMessage: ChatMessage = {
      id: uid('msg'),
      role: 'user',
      content: trimmed,
      attachments,
      createdAt: Date.now(),
    };
    const assistantMessage: ChatMessage = {
      id: uid('msg'),
      role: 'assistant',
      content: '',
      thought: '',
      sources: [],
      tools: [],
      createdAt: Date.now(),
    };

    const titled =
      chat.messages.length === 0 && chat.title === 'Novo chat'
        ? titleFromPrompt(trimmed || attachments[0]?.name || 'Novo chat')
        : chat.title;

    const nextChat: Chat = {
      ...chat,
      title: titled,
      updatedAt: Date.now(),
      messages: [...chat.messages, userMessage, assistantMessage],
    };

    set((state) => ({
      chats: [nextChat, ...state.chats.filter((item) => item.id !== nextChat.id)],
      streaming: true,
      compareText: '',
      compareThought: '',
    }));
    void persistChat(nextChat);

    const controller = new AbortController();
    set({ abort: controller });

    const applyAssistant = (patch: Partial<ChatMessage>) => {
      set((state) => ({
        chats: state.chats.map((item) => {
          if (item.id !== nextChat.id) return item;
          const messages = item.messages.map((message) =>
            message.id === assistantMessage.id ? { ...message, ...patch } : message,
          );
          return { ...item, messages, updatedAt: Date.now() };
        }),
      }));
    };

    let content = '';
    let thought = '';
    const sources = [...(assistantMessage.sources ?? [])];
    const tools = [...(assistantMessage.tools ?? [])];

    try {
      await streamChat(toRequest(nextChat, nextChat.messages.slice(0, -1)), {
        signal: controller.signal,
        onEvent: (event) => {
          if (event.type === 'reasoning') {
            thought += event.delta;
            applyAssistant({ thought });
          } else if (event.type === 'text') {
            content += event.delta;
            applyAssistant({ content });
          } else if (event.type === 'source') {
            if (!sources.some((item) => item.url === event.url)) {
              sources.push({ title: event.title, url: event.url });
              applyAssistant({ sources: [...sources] });
            }
          } else if (event.type === 'tool') {
            const existing = tools.findIndex((item) => item.name === event.name && item.status === 'start');
            if (existing >= 0 && event.status !== 'start') {
              tools[existing] = event;
            } else {
              tools.push({ name: event.name, status: event.status, detail: event.detail });
            }
            applyAssistant({ tools: [...tools] });
          } else if (event.type === 'error') {
            applyAssistant({ error: event.message, content: content || event.message });
          }
        },
      });
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        applyAssistant({
          error: error instanceof Error ? error.message : 'Falha ao gerar',
        });
      }
    }

    const saved = get().chats.find((item) => item.id === nextChat.id);
    if (saved) void persistChat(saved);
    set({ streaming: false, abort: null });

    if (get().settings.compareEnabled) {
      void runCompare(get, set, nextChat, userMessage);
    }
  },

  stop: () => {
    get().abort?.abort();
    get().compareAbort?.abort();
    set({ streaming: false, compareStreaming: false, abort: null, compareAbort: null });
  },

  regenerate: async () => {
    const chat = get().chats.find((item) => item.id === get().activeChatId);
    if (!chat || get().streaming) return;
    const lastUserIndex = [...chat.messages].map((m) => m.role).lastIndexOf('user');
    if (lastUserIndex < 0) return;
    const lastUser = chat.messages[lastUserIndex];
    const trimmed: Chat = {
      ...chat,
      messages: chat.messages.slice(0, lastUserIndex),
      updatedAt: Date.now(),
    };
    set((state) => ({
      chats: state.chats.map((item) => (item.id === trimmed.id ? trimmed : item)),
    }));
    await persistChat(trimmed);
    await get().send(lastUser.content, lastUser.attachments);
  },

  fork: (messageId) => {
    const chat = get().chats.find((item) => item.id === get().activeChatId);
    if (!chat) return;
    const index = chat.messages.findIndex((message) => message.id === messageId);
    if (index < 0) return;
    const forked = blankChat(chat.workspaceId, {
      title: `${chat.title} (fork)`,
      provider: chat.provider,
      model: chat.model,
      effort: chat.effort,
      research: chat.research,
      forkedFrom: chat.id,
      messages: chat.messages.slice(0, index + 1).map((message) => ({ ...message, id: uid('msg') })),
    });
    set((state) => ({ chats: [forked, ...state.chats], activeChatId: forked.id }));
    void persistChat(forked);
  },

  exportChat: (format) => {
    const chat = get().chats.find((item) => item.id === get().activeChatId);
    if (!chat) return;
    const slug = chat.title.replace(/[^\w\-]+/g, '_').slice(0, 40) || 'chat';
    if (format === 'md') {
      downloadText(`${slug}.md`, chatToMarkdown(chat), 'text/markdown');
      return;
    }
    downloadText(`${slug}.json`, JSON.stringify(chat, null, 2), 'application/json');
  },

  setPanel: (panel, open) => {
    set((state) => ({ [panel]: open ?? !state[panel] }) as Partial<NeoState>);
  },

  upsertAutomation: (automation) => {
    set((state) => {
      const exists = state.automations.some((item) => item.id === automation.id);
      return {
        automations: exists
          ? state.automations.map((item) => (item.id === automation.id ? automation : item))
          : [automation, ...state.automations],
      };
    });
    void putAutomation(automation);
  },

  removeAutomation: (id) => {
    set((state) => ({ automations: state.automations.filter((item) => item.id !== id) }));
    void dbDeleteAutomation(id);
  },

  runAutomation: async (id) => {
    const automation = get().automations.find((item) => item.id === id);
    if (!automation) return;
    get().newChat();
    const next = {
      ...automation,
      lastRunAt: Date.now(),
      nextRunAt: Date.now() + automation.intervalMs,
    };
    get().upsertAutomation(next);
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      new Notification('Illusions · automação', { body: automation.title });
    }
    await get().send(automation.prompt);
  },
}));

async function runCompare(
  get: () => NeoState,
  set: (partial: Partial<NeoState>) => void,
  chat: Chat,
  userMessage: ChatMessage,
) {
  const compareModel = get().settings.compareModel;
  if (!compareModel || compareModel === chat.model) return;

  const controller = new AbortController();
  set({ compareStreaming: true, compareAbort: controller, compareText: '', compareThought: '' });

  let text = '';
  let thought = '';
  const payload: ChatRequest = {
    conversationId: `${chat.id}-compare`,
    provider: compareModel.startsWith('gpt') || compareModel.startsWith('o') ? 'codex' : 'grok',
    model: compareModel,
    effort: chat.effort,
    research: false,
    messages: [
      ...chat.messages
        .filter((message) => message.id !== userMessage.id && message.role === 'user')
        .slice(0, -1)
        .map((message) => ({ role: message.role, content: message.content })),
      { role: 'user', content: userMessage.content, attachments: userMessage.attachments },
    ],
  };

  try {
    await streamChat(payload, {
      signal: controller.signal,
      onEvent: (event) => {
        if (event.type === 'text') {
          text += event.delta;
          set({ compareText: text });
        } else if (event.type === 'reasoning') {
          thought += event.delta;
          set({ compareThought: thought });
        }
      },
    });
  } catch {
    // ignore abort
  }
  set({ compareStreaming: false, compareAbort: null });
}

export function activeChat() {
  const { chats, activeChatId } = useNeoStore.getState();
  return chats.find((chat) => chat.id === activeChatId) ?? null;
}
