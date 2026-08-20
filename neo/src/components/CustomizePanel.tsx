import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import { t } from '../i18n';
import { CODEX_MODELS, GROK_MODELS } from '../lib/models';
import { useNeoStore } from '../store/useNeoStore';
import type { Density, Locale, ThemeId } from '../types';

export function CustomizePanel() {
  const open = useNeoStore((s) => s.customizeOpen);
  const setPanel = useNeoStore((s) => s.setPanel);
  const settings = useNeoStore((s) => s.settings);
  const setSettings = useNeoStore((s) => s.setSettings);
  const copy = t(settings.locale);
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/50" onClick={() => setPanel('customizeOpen', false)}>
      <div className="h-full w-full max-w-md border-l border-white/10 bg-[#0c0c0c] p-5" onClick={(e) => e.stopPropagation()}>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-[15px] font-medium">{copy.customize}</h2>
          <button type="button" onClick={() => setPanel('customizeOpen', false)}>
            <X className="h-4 w-4 text-neo-muted" />
          </button>
        </div>
        <label className="mb-4 block text-[12px] text-neo-muted">
          {copy.displayName}
          <input
            value={settings.displayName}
            onChange={(e) => setSettings({ displayName: e.target.value })}
            className="mt-1 w-full rounded-lg border border-white/10 bg-[#161616] px-3 py-2 text-[14px] text-white outline-none"
          />
        </label>
        <Field label={copy.theme}>
          {(['black', 'gray', 'oled'] as ThemeId[]).map((theme) => (
            <Chip key={theme} active={settings.theme === theme} onClick={() => setSettings({ theme })}>
              {copy[theme]}
            </Chip>
          ))}
        </Field>
        <Field label={copy.density}>
          {(['comfortable', 'compact'] as Density[]).map((density) => (
            <Chip key={density} active={settings.density === density} onClick={() => setSettings({ density })}>
              {copy[density]}
            </Chip>
          ))}
        </Field>
        <Field label={copy.language}>
          {(['pt-BR', 'en'] as Locale[]).map((locale) => (
            <Chip key={locale} active={settings.locale === locale} onClick={() => setSettings({ locale })}>
              {locale}
            </Chip>
          ))}
        </Field>
        <Field label={copy.compare}>
          <Chip active={settings.compareEnabled} onClick={() => setSettings({ compareEnabled: !settings.compareEnabled })}>
            {settings.compareEnabled ? 'on' : 'off'}
          </Chip>
          <select
            value={settings.compareModel}
            onChange={(e) => setSettings({ compareModel: e.target.value })}
            className="rounded-md border border-white/10 bg-[#161616] px-2 py-1 text-[12px]"
          >
            {[...GROK_MODELS, ...CODEX_MODELS].map((model) => (
              <option key={model.id} value={model.id}>
                {model.label}
              </option>
            ))}
          </select>
        </Field>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="mb-5">
      <div className="mb-2 text-[12px] text-neo-muted">{label}</div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Chip({ active, onClick, children }: { active?: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-[12px] ${active ? 'bg-white/10 text-white' : 'bg-white/[0.04] text-neo-muted'}`}
    >
      {children}
    </button>
  );
}
