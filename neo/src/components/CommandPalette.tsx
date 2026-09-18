import { Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { t } from '../i18n';
import { useNeoStore } from '../store/useNeoStore';

export function CommandPalette() {
  const open = useNeoStore((s) => s.searchOpen);
  const setPanel = useNeoStore((s) => s.setPanel);
  const chats = useNeoStore((s) => s.chats);
  const selectChat = useNeoStore((s) => s.selectChat);
  const newChat = useNeoStore((s) => s.newChat);
  const copy = t(useNeoStore((s) => s.settings.locale));
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!open) setQuery('');
  }, [open]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return chats.slice(0, 8).map((chat) => ({
        id: chat.id,
        title: chat.title,
        snippet: chat.messages[0]?.content?.slice(0, 80) ?? '',
      }));
    }
    const hits: { id: string; title: string; snippet: string }[] = [];
    for (const chat of chats) {
      if (chat.title.toLowerCase().includes(q)) {
        hits.push({ id: chat.id, title: chat.title, snippet: 'chat' });
      }
      for (const message of chat.messages) {
        if (message.content.toLowerCase().includes(q)) {
          hits.push({
            id: chat.id,
            title: chat.title,
            snippet: message.content.slice(0, 100),
          });
          break;
        }
      }
    }
    return hits.slice(0, 20);
  }, [chats, query]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 pt-[14vh]" onClick={() => setPanel('searchOpen', false)}>
      <div
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-white/10 bg-[#111] shadow-pill"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b border-white/[0.06] px-3 py-3">
          <Search className="h-4 w-4 text-neo-faint" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={copy.commandHint}
            className="w-full bg-transparent text-[14px] outline-none"
          />
        </div>
        <div className="max-h-80 overflow-y-auto py-1">
          <button
            type="button"
            className="block w-full px-4 py-2 text-left text-[13px] text-neo-muted hover:bg-white/[0.04]"
            onClick={() => {
              newChat();
              setPanel('searchOpen', false);
            }}
          >
            {copy.newChat}
          </button>
          {results.length === 0 && <div className="px-4 py-6 text-center text-[13px] text-neo-faint">{copy.noResults}</div>}
          {results.map((item, index) => (
            <button
              key={`${item.id}-${index}`}
              type="button"
              className="block w-full px-4 py-2 text-left hover:bg-white/[0.04]"
              onClick={() => {
                selectChat(item.id);
                setPanel('searchOpen', false);
              }}
            >
              <div className="truncate text-[13px]">{item.title}</div>
              {item.snippet && <div className="truncate text-[11px] text-neo-faint">{item.snippet}</div>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
