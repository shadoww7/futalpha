import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import fs from 'node:fs';
import path from 'node:path';
import { bootMcp, createApp } from './app';

export async function startPackaged(options: { port: number; staticDir: string }) {
  await bootMcp();
  const app = createApp();
  const root = path.resolve(options.staticDir);

  app.use(
    '*',
    serveStatic({
      root,
      rewriteRequestPath: (p) => (p === '/' ? '/index.html' : p),
    }),
  );

  app.get('*', async (c) => {
    if (c.req.path.startsWith('/api')) return c.notFound();
    const index = path.join(root, 'index.html');
    return c.html(fs.readFileSync(index, 'utf8'));
  });

  await new Promise<void>((resolve, reject) => {
    try {
      serve({ fetch: app.fetch, port: options.port }, () => resolve());
    } catch (error) {
      reject(error);
    }
  });

  return `http://127.0.0.1:${options.port}`;
}
