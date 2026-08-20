import { ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { t } from '../i18n';
import { cn } from '../lib/cn';
import { CODEX_MODELS, EFFORTS, GROK_MODELS, selectorLabel } from '../lib/models';
import { useNeoStore } from '../store/useNeoStore';
import type { Effort, ProviderId } from '../types';

export function ModelPicker() {
  const chat = useNeoStore((s) => s.chats.find((item) => item.id === s.activeChatId));
  const health = useNeoStore((s) => s.health);
  const updateActive = useNeoStore((s) => s.updateActive);
  const copy = t(useNeoStore((s) => s.settings.locale));
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const model = chat?.model ?? 'grok-4.6';
  const effort = chat?.effort ?? 'high';
  const provider = chat?.provider ?? 'grok';

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const pick = (nextProvider: ProviderId, id: string) => {
    updateActive({ provider: nextProvider, model: id });
    setOpen(false);
  };

  const pickEffort = (id: Effort) => {
    updateActive({ effort: id });
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex max-w-[260px] items-center gap-1 truncate rounded-full px-2 py-1 text-[13px] text-neo-text hover:bg-white/[0.04]"
      >
        <span className="truncate">{selectorLabel(model, effort)}</span>
        <ChevronDown className="h-3.5 w-3.5 text-neo-faint" />
      </button>
      {open && (
        <div className="absolute bottom-10 left-0 z-30 w-72 overflow-hidden rounded-xl border border-white/[0.08] bg-[#111] py-2 shadow-pill">
          <p className="px-3 pb-1 text-[10px] uppercase tracking-[0.16em] text-neo-faint">Grok</p>
          {GROK_MODELS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => pick('grok', item.id)}
              className={cn(
                'flex w-full items-center justify-between px-3 py-1.5 text-left text-[13px] hover:bg-white/[0.04]',
                provider === 'grok' && model === item.id && 'text-white',
              )}
            >
              <span>{item.label}</span>
              <span className="text-[11px] text-neo-faint">{item.hint}</span>
            </button>
          ))}
          <p className="mt-2 px-3 pb-1 text-[10px] uppercase tracking-[0.16em] text-neo-faint">Codex</p>
          {CODEX_MODELS.map((item) => (
            <button
              key={item.id}
              type="button"
              disabled={!health.codex}
              onClick={() => pick('codex', item.id)}
              className="flex w-full items-center justify-between px-3 py-1.5 text-left text-[13px] hover:bg-white/[0.04] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <span>{health.codex ? item.label : copy.codexSoon}</span>
              <span className="text-[11px] text-neo-faint">{item.hint}</span>
            </button>
          ))}
          <div className="mt-2 flex gap-1 border-t border-white/[0.06] px-3 pt-2">
            {EFFORTS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => pickEffort(item.id)}
                className={cn(
                  'rounded-full px-2 py-0.5 text-[11px] text-neo-muted hover:bg-white/[0.05]',
                  effort === item.id && 'bg-white/10 text-white',
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
