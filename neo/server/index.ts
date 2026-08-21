import 'dotenv/config';
import { serve } from '@hono/node-server';
import { bootMcp, createApp } from './app';

const port = Number(process.env.ILLUSIONS_PORT || process.env.NEO_PORT || 8787);

async function main() {
  await bootMcp();
  const app = createApp();
  serve({ fetch: app.fetch, port }, () => {
    console.log(`[illusions] api em http://127.0.0.1:${port}`);
    console.log(
      `[illusions] grok=${process.env.XAI_API_KEY ? 'on' : 'demo'}  codex=${process.env.OPENAI_API_KEY ? 'on' : 'off'}`,
    );
  });
}

void main();
