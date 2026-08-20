import type { StreamEvent } from './providers/types';

export function createSseStream(run: (emit: (event: StreamEvent) => void) => Promise<void>) {
  const encoder = new TextEncoder();
  return new ReadableStream<Uint8Array>({
    async start(controller) {
      const emit = (event: StreamEvent) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      };
      try {
        await run(emit);
        emit({ type: 'done' });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Falha desconhecida';
        emit({ type: 'error', message });
      } finally {
        controller.close();
      }
    },
  });
}

export const sseHeaders = {
  'Content-Type': 'text/event-stream; charset=utf-8',
  'Cache-Control': 'no-cache, no-transform',
  Connection: 'keep-alive',
};
