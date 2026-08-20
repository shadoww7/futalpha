import { ChevronRight, FlaskConical, Pencil, Plug, Search, Settings, SlidersHorizontal, Zap } from 'lucide-react';
import { t } from '../i18n';
import { cn } from '../lib/cn';
import { modelLabel } from '../lib/models';
import { relativeTime } from '../lib/time';
import { useNeoStore } from '../store/useNeoStore';

export function Sidebar() {
  const copy = t(useNeoStore((s) => s.settings.locale));
  const settings = useNeoStore((s) => s.settings);
  const workspaces = useNeoStore((s) => s.workspaces);
  const chats = useNeoStore((s) => s.chats);
  const activeChatId = useNeoStore((s) => s.activeChatId);
  const health = useNeoStore((s) => s.health);
  const newChat = useNeoStore((s) => s.newChat);
  const selectChat = useNeoStore((s) => s.selectChat);
  const toggleWorkspace = useNeoStore((s) => s.toggleWorkspace);
  const setPanel = useNeoStore((s) => s.setPanel);
  const updateActive = useNeoStore((s) => s.updateActive);
  const renameChat = useNeoStore((s) => s.renameChat);
  const deleteChat = useNeoStore((s) => s.deleteChat);
  const chat = chats.find((item) => item.id === activeChatId);

  const nav = [
    { id: 'new', label: copy.newChat, icon: Pencil, run: () => newChat() },
    { id: 'search', label: copy.search, icon: Search, run: () => setPanel('searchOpen', true) },
    {
      id: 'research',
      label: copy.research,
      icon: FlaskConical,
      run: () => updateActive({ research: !chat?.research }),
      active: !!chat?.research,
    },
    { id: 'mcp', label: copy.mcp, icon: Plug, run: () => setPanel('mcpOpen', true), active: chat?.mcp !== false },
    { id: 'auto', label: copy.automations, icon: Zap, run: () => setPanel('automationsOpen', true) },
    { id: 'custom', label: copy.customize, icon: SlidersHorizontal, run: () => setPanel('customizeOpen', true) },
  ];

  return (
    <aside className="flex w-[280px] shrink-0 flex-col border-l border-white/[0.05] bg-black">
      <nav className="space-y-0.5 px-3 py-3">
        {nav.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={item.run}
            className={cn(
              'flex w-full items-center gap-3 rounded-lg px-2 py-2 text-[13.5px] text-[#d4d4d4] hover:bg-white/[0.04]',
              item.active && 'bg-white/[0.05] text-white',
            )}
          >
            <item.icon className="h-4 w-4 text-neo-muted" strokeWidth={1.5} />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="px-5 pb-2 pt-3 text-[11px] font-medium tracking-[0.18em] text-neo-faint">{copy.chats}</div>
      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-3">
        {workspaces.map((workspace) => {
          const items = chats.filter((item) => item.workspaceId === workspace.id);
          return (
            <div key={workspace.id} className="mb-2">
              <button
                type="button"
                onClick={() => toggleWorkspace(workspace.id)}
                className="flex w-full items-center gap-1 px-2 py-1 text-[12.5px] text-neo-muted"
              >
                <ChevronRight className={cn('h-3.5 w-3.5 transition', !workspace.collapsed && 'rotate-90')} />
                {workspace.name}
              </button>
              {!workspace.collapsed &&
                items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => selectChat(item.id)}
                    onDoubleClick={() => {
                      const title = window.prompt(copy.rename, item.title);
                      if (title) renameChat(item.id, title);
                    }}
                    onContextMenu={(event) => {
                      event.preventDefault();
                      if (window.confirm(copy.deleteChat + '?')) deleteChat(item.id);
                    }}
                    className={cn(
                      'flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-[13px] text-[#cfcfcf] hover:bg-white/[0.04]',
                      item.id === activeChatId && 'bg-white/[0.05] text-white',
                    )}
                  >
                    <span className="truncate pr-2">{item.title}</span>
                    <span className="shrink-0 text-[11px] text-neo-faint">{relativeTime(item.updatedAt)}</span>
                  </button>
                ))}
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-3 border-t border-white/[0.05] px-3 py-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2a2a2a] text-[13px] font-medium">
          {settings.avatarLetter}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13px]">{settings.displayName}</div>
          <div className="truncate text-[11px] text-neo-faint">
            {health.connected ? modelLabel(chat?.model ?? 'grok-4.6') : 'Demo'}
            {chat?.effort === 'xhigh' ? ' Super Heavy' : ''}
            {health.mcp?.tools ? ` · MCP ${health.mcp.tools}` : ''}
          </div>
        </div>
        <button type="button" onClick={() => setPanel('customizeOpen', true)} className="text-neo-faint hover:text-white">
          <Settings className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
}
