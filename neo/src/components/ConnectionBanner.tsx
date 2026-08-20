import { t } from '../i18n';
import { useNeoStore } from '../store/useNeoStore';

export function ConnectionBanner() {
  const health = useNeoStore((s) => s.health);
  const locale = useNeoStore((s) => s.settings.locale);
  const copy = t(locale);
  if (health.connected) return null;
  return (
    <div className="mx-auto mb-4 w-full max-w-3xl rounded-xl border border-white/[0.06] bg-[#161616] px-4 py-3 text-[13px] text-neo-muted">
      {copy.disconnected}
    </div>
  );
}
