import { X } from 'lucide-react';
import { useState } from 'react';
import { t } from '../i18n';
import { uid } from '../lib/time';
import { useNeoStore } from '../store/useNeoStore';

const INTERVALS = [
  { label: '15 min', ms: 15 * 60_000 },
  { label: '1 h', ms: 60 * 60_000 },
  { label: '1 dia', ms: 24 * 60 * 60_000 },
];

export function AutomationsPanel() {
  const open = useNeoStore((s) => s.automationsOpen);
  const setPanel = useNeoStore((s) => s.setPanel);
  const automations = useNeoStore((s) => s.automations);
  const upsert = useNeoStore((s) => s.upsertAutomation);
  const remove = useNeoStore((s) => s.removeAutomation);
  const run = useNeoStore((s) => s.runAutomation);
  const copy = t(useNeoStore((s) => s.settings.locale));
  const [title, setTitle] = useState('Resumo diário');
  const [prompt, setPrompt] = useState('Resuma o que está em aberto no meu workspace.');
  const [intervalMs, setIntervalMs] = useState(INTERVALS[2].ms);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/50" onClick={() => setPanel('automationsOpen', false)}>
      <div className="h-full w-full max-w-md overflow-y-auto border-l border-white/10 bg-[#0c0c0c] p-5" onClick={(e) => e.stopPropagation()}>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-[15px] font-medium">{copy.automations}</h2>
          <button type="button" onClick={() => setPanel('automationsOpen', false)}>
            <X className="h-4 w-4 text-neo-muted" />
          </button>
        </div>
        <div className="space-y-3 rounded-xl border border-white/10 p-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={copy.title}
            className="w-full rounded-lg bg-[#161616] px-3 py-2 text-[13px] outline-none"
          />
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            className="w-full rounded-lg bg-[#161616] px-3 py-2 text-[13px] outline-none"
          />
          <div className="flex gap-2">
            {INTERVALS.map((item) => (
              <button
                key={item.ms}
                type="button"
                onClick={() => setIntervalMs(item.ms)}
                className={`rounded-full px-3 py-1 text-[12px] ${intervalMs === item.ms ? 'bg-white/10' : 'text-neo-muted'}`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="w-full rounded-lg bg-white/10 py-2 text-[13px]"
            onClick={() => {
              upsert({
                id: uid('auto'),
                title,
                prompt,
                intervalMs,
                enabled: true,
                nextRunAt: Date.now() + intervalMs,
              });
              void Notification.requestPermission?.();
            }}
          >
            {copy.addAutomation}
          </button>
        </div>
        <div className="mt-6 space-y-3">
          {automations.map((item) => (
            <div key={item.id} className="rounded-xl border border-white/10 p-3">
              <div className="flex items-center justify-between">
                <div className="text-[13px]">{item.title}</div>
                <button type="button" className="text-[11px] text-neo-faint" onClick={() => remove(item.id)}>
                  {copy.deleteChat}
                </button>
              </div>
              <p className="mt-1 line-clamp-2 text-[12px] text-neo-muted">{item.prompt}</p>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  className="rounded-md bg-white/5 px-2 py-1 text-[11px]"
                  onClick={() => upsert({ ...item, enabled: !item.enabled })}
                >
                  {item.enabled ? copy.enabled : 'off'}
                </button>
                <button type="button" className="rounded-md bg-white/5 px-2 py-1 text-[11px]" onClick={() => void run(item.id)}>
                  {copy.runNow}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
