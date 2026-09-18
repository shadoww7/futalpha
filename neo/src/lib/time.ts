export function relativeTime(ts: number) {
  const delta = Date.now() - ts;
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;
  if (delta < minute) return 'agora';
  if (delta < hour) return `${Math.floor(delta / minute)}m`;
  if (delta < day) return `${Math.floor(delta / hour)}h`;
  if (delta < 7 * day) return `${Math.floor(delta / day)}d`;
  return new Date(ts).toLocaleDateString();
}

export function uid(prefix = 'id') {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}

export function titleFromPrompt(text: string) {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (!clean) return 'Novo chat';
  return clean.length > 42 ? `${clean.slice(0, 42).trim()}…` : clean;
}
