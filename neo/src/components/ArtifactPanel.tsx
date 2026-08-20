import { Check, Copy, X } from 'lucide-react';
import { useState } from 'react';
import { extractArtifacts } from '../lib/artifacts';
import { useNeoStore } from '../store/useNeoStore';

export function ArtifactPanel() {
  const open = useNeoStore((s) => s.artifactOpen);
  const setPanel = useNeoStore((s) => s.setPanel);
  const chat = useNeoStore((s) => s.chats.find((item) => item.id === s.activeChatId));
  const [copied, setCopied] = useState<string | null>(null);
  if (!open) return null;
  const last = [...(chat?.messages ?? [])].reverse().find((message) => message.role === 'assistant');
  const artifacts = extractArtifacts(last?.content ?? '');

  return (
    <aside className="flex w-[380px] shrink-0 flex-col border-l border-white/[0.05] bg-[#070707]">
      <div className="flex items-center justify-between border-b border-white/[0.05] px-3 py-2">
        <span className="text-[12px] text-neo-muted">Artifacts</span>
        <button type="button" onClick={() => setPanel('artifactOpen', false)}>
          <X className="h-4 w-4 text-neo-faint" />
        </button>
      </div>
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3">
        {artifacts.length === 0 && <div className="text-[12px] text-neo-faint">Nenhum bloco grande ainda.</div>}
        {artifacts.map((item) => (
          <div key={item.title + item.code.slice(0, 12)} className="rounded-xl border border-white/10">
            <div className="flex items-center justify-between px-3 py-2 text-[11px] text-neo-faint">
              {item.title}
              <button
                type="button"
                onClick={async () => {
                  await navigator.clipboard.writeText(item.code);
                  setCopied(item.title);
                  setTimeout(() => setCopied(null), 1000);
                }}
              >
                {copied === item.title ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
            <pre className="max-h-80 overflow-auto p-3 font-mono text-[11px] leading-relaxed text-[#d8d8d8]">
              {item.code}
            </pre>
          </div>
        ))}
      </div>
    </aside>
  );
}
