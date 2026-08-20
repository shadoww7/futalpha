import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { t } from '../i18n';
import { useNeoStore } from '../store/useNeoStore';

export function ThoughtCard({ text, streaming }: { text?: string; streaming?: boolean }) {
  const locale = useNeoStore((s) => s.settings.locale);
  const copy = t(locale);
  const [open, setOpen] = useState(true);
  const body = text?.trim() || (streaming ? '…' : copy.emptyPlan);

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="rounded-2xl border border-white/[0.05] bg-[#161616] px-5 py-4 text-[13.5px] leading-relaxed text-[#c8c8c8]">
        {open ? body : body.slice(0, 90) + (body.length > 90 ? '…' : '')}
      </div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="mt-2 flex items-center gap-1 text-[12px] text-neo-faint hover:text-neo-muted"
      >
        {copy.thought}
        <ChevronDown className={`h-3 w-3 transition ${open ? 'rotate-180' : ''}`} />
        {streaming && <span className="ml-2 h-1.5 w-1.5 animate-pulse rounded-full bg-neo-accent" />}
      </button>
    </div>
  );
}
