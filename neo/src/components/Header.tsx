import { ChevronDown, Link2, Monitor, MoreHorizontal, SlidersHorizontal } from 'lucide-react';
import { t } from '../i18n';
import { cn } from '../lib/cn';
import { useNeoStore } from '../store/useNeoStore';
import { IconButton } from './IconButton';

export function Header() {
  const copy = t(useNeoStore((s) => s.settings.locale));
  const chat = useNeoStore((s) => s.chats.find((item) => item.id === s.activeChatId));
  const workspaces = useNeoStore((s) => s.workspaces);
  const ideOpen = useNeoStore((s) => s.ideOpen);
  const setPanel = useNeoStore((s) => s.setPanel);
  const exportChat = useNeoStore((s) => s.exportChat);
  const addWorkspace = useNeoStore((s) => s.addWorkspace);

  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-white/[0.05] px-4">
      <div className="flex min-w-0 items-center gap-4">
        <button
          type="button"
          className="flex items-center gap-1 text-[15px] font-medium tracking-tight"
          onClick={() => {
            const name = window.prompt(copy.workspace, 'workspace');
            if (name) addWorkspace(name);
          }}
        >
          Illusions
          <ChevronDown className="h-3.5 w-3.5 text-neo-faint" />
        </button>
        <div className="flex min-w-0 items-center gap-2 text-[13px] text-neo-muted">
          <Monitor className="h-3.5 w-3.5" />
          <span className="truncate">{chat?.title ?? copy.emptyPlan.split('.')[0]}</span>
        </div>
        <span className="hidden text-[11px] text-neo-faint sm:inline">{workspaces[0]?.name}</span>
      </div>
      <div className="flex items-center gap-1">
        <IconButton title={copy.customize} onClick={() => setPanel('customizeOpen', true)}>
          <SlidersHorizontal className="h-4 w-4" />
        </IconButton>
        <IconButton
          title={copy.exportMd}
          onClick={() => {
            const url = window.location.href;
            void navigator.clipboard.writeText(url);
          }}
        >
          <Link2 className="h-4 w-4" />
        </IconButton>
        <div className="relative">
          <details>
            <summary className="list-none">
              <IconButton>
                <MoreHorizontal className="h-4 w-4" />
              </IconButton>
            </summary>
            <div className="absolute right-0 z-20 mt-1 w-44 overflow-hidden rounded-lg border border-white/10 bg-[#111] py-1 text-[13px]">
              <button type="button" className="block w-full px-3 py-1.5 text-left hover:bg-white/[0.04]" onClick={() => exportChat('md')}>
                {copy.exportMd}
              </button>
              <button type="button" className="block w-full px-3 py-1.5 text-left hover:bg-white/[0.04]" onClick={() => exportChat('json')}>
                {copy.exportJson}
              </button>
            </div>
          </details>
        </div>
        <button
          type="button"
          onClick={() => setPanel('ideOpen')}
          className={cn(
            'ml-1 rounded-full border border-white/10 px-2.5 py-1 text-[11px] tracking-wide text-neo-muted',
            ideOpen && 'border-white/20 bg-white/10 text-white',
          )}
        >
          {copy.ide}
        </button>
      </div>
    </header>
  );
}
