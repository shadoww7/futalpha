import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { buildMcpAiTools } from './mcp/ai-tools';
import {
  addServer,
  deleteServer,
  listStatus,
  mcpSummary,
  patchServer,
  reconnectEnabled,
} from './mcp/manager';
import { streamCodex } from './providers/codex';
import { streamDemo } from './providers/demo';
import { streamGrok } from './providers/grok';
import type { ChatRequest, HealthStatus, ProviderId } from './providers/types';
import { createSseStream, sseHeaders } from './sse';

export function createApp() {
  const app = new Hono();

  app.use(
    '*',
    cors({
      origin: ['http://localhost:5174', 'http://127.0.0.1:5174', 'app://.', 'file://'],
      allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
      allowHeaders: ['Content-Type'],
    }),
  );

  function health(): HealthStatus {
    const grok = Boolean(process.env.XAI_API_KEY);
    const codex = Boolean(process.env.OPENAI_API_KEY);
    const mcp = mcpSummary();
    return {
      ok: true,
      grok,
      codex,
      demo: !grok,
      connected: grok || codex,
      mcp,
    };
  }

  app.get('/api/health', (c) => c.json(health()));

  app.get('/api/mcp', (c) => c.json({ servers: listStatus(), summary: mcpSummary() }));

  app.post('/api/mcp', async (c) => {
    const body = (await c.req.json()) as {
      name: string;
      command: string;
      args?: string[] | string;
      env?: Record<string, string>;
      enabled?: boolean;
    };
    if (!body?.name || !body?.command) return c.json({ error: 'name e command são obrigatórios' }, 400);
    const args = Array.isArray(body.args)
      ? body.args
      : String(body.args ?? '')
          .split(' ')
          .map((item) => item.trim())
          .filter(Boolean);
    const servers = await addServer({
      name: body.name,
      command: body.command,
      args,
      env: body.env,
      enabled: body.enabled ?? true,
    });
    return c.json({ servers, summary: mcpSummary() });
  });

  app.patch('/api/mcp/:id', async (c) => {
    const id = c.req.param('id');
    const patch = await c.req.json();
    const servers = await patchServer(id, patch);
    return c.json({ servers, summary: mcpSummary() });
  });

  app.delete('/api/mcp/:id', async (c) => {
    const servers = await deleteServer(c.req.param('id'));
    return c.json({ servers, summary: mcpSummary() });
  });

  app.post('/api/chat', async (c) => {
    const body = (await c.req.json()) as ChatRequest;
    if (!body?.messages?.length) {
      return c.json({ error: 'messages é obrigatório' }, 400);
    }

    const provider: ProviderId = body.provider === 'codex' ? 'codex' : 'grok';
    const status = health();
    const abort = c.req.raw.signal;
    const useMcp = body.mcp !== false;

    const stream = createSseStream(async (emit) => {
      const mcpTools = useMcp ? buildMcpAiTools(emit) : {};

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

      await streamGrok(body, emit, abort, mcpTools);
    });

    return new Response(stream, { headers: sseHeaders });
  });

  app.notFound((c) => c.json({ error: 'not found' }, 404));
  return app;
}

export async function bootMcp() {
  await reconnectEnabled();
}
