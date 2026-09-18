import type { ChatRequest } from '../../server/providers/types';
import type { HealthStatus, StreamEvent } from '../types';

export async function fetchHealth(): Promise<HealthStatus> {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) throw new Error('health failed');
    return (await res.json()) as HealthStatus;
  } catch {
    return { ok: false, grok: false, codex: false, demo: true, connected: false, mcp: { servers: 0, connected: 0, tools: 0 } };
  }
}

export async function streamChat(
  payload: ChatRequest,
  handlers: {
    signal?: AbortSignal;
    onEvent: (event: StreamEvent) => void;
  },
) {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal: handlers.signal,
  });

  if (!res.ok || !res.body) {
    const text = await res.text().catch(() => '');
    handlers.onEvent({ type: 'error', message: text || `HTTP ${res.status}` });
    handlers.onEvent({ type: 'done' });
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const chunks = buffer.split('\n\n');
    buffer = chunks.pop() ?? '';
    for (const chunk of chunks) {
      const line = chunk
        .split('\n')
        .filter((row) => row.startsWith('data:'))
        .map((row) => row.slice(5).trim())
        .join('');
      if (!line) continue;
      try {
        handlers.onEvent(JSON.parse(line) as StreamEvent);
      } catch {
        // ignore malformed frames
      }
    }
  }
}
