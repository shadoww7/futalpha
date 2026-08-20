import 'dotenv/config';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { streamCodex } from './providers/codex';
import { streamDemo } from './providers/demo';
import { streamGrok } from './providers/grok';
import type { ChatRequest, HealthStatus, ProviderId } from './providers/types';
import { createSseStream, sseHeaders } from './sse';

const app = new Hono();
const port = Number(process.env.NEO_PORT || 8787);

app.use(
  '*',
  cors({
    origin: ['http://localhost:5174', 'http://127.0.0.1:5174'],
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: ['Content-Type'],
  }),
);

function health(): HealthStatus {
  const grok = Boolean(process.env.XAI_API_KEY);
  const codex = Boolean(process.env.OPENAI_API_KEY);
  return {
    ok: true,
    grok,
    codex,
    demo: !grok,
    connected: grok || codex,
  };
}

app.get('/api/health', (c) => c.json(health()));

app.post('/api/chat', async (c) => {
  const body = (await c.req.json()) as ChatRequest;
  if (!body?.messages?.length) {
    return c.json({ error: 'messages é obrigatório' }, 400);
  }

  const provider: ProviderId = body.provider === 'codex' ? 'codex' : 'grok';
  const status = health();
  const abort = c.req.raw.signal;

  const stream = createSseStream(async (emit) => {
    if (provider === 'codex') {
      if (!status.codex) {
        await streamDemo({ ...body, provider: 'codex' }, emit);
        return;
      }
      await streamCodex(body, emit, abort);
      return;
    }

    if (!status.grok) {
      await streamDemo(body, emit);
      return;
    }

    await streamGrok(body, emit, abort);
  });

  return new Response(stream, { headers: sseHeaders });
});

app.notFound((c) => c.json({ error: 'not found' }, 404));

serve({ fetch: app.fetch, port }, () => {
  const status = health();
  console.log(`[neo] api em http://127.0.0.1:${port}`);
  console.log(
    `[neo] grok=${status.grok ? 'on' : 'demo'}  codex=${status.codex ? 'on' : 'off'}`,
  );
});
