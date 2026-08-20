import { streamText, type ModelMessage } from 'ai';
import { openai } from '@ai-sdk/openai';
import type { ChatAttachment, ChatRequest, StreamEmitter } from './types';

const ALLOWED_MODELS = new Set(['gpt-4.1', 'o4-mini', 'o3-mini', 'gpt-4o']);

function toParts(content: string, attachments?: ChatAttachment[]) {
  const parts: Array<
    | { type: 'text'; text: string }
    | { type: 'image'; image: string }
  > = [];

  if (content.trim()) {
    parts.push({ type: 'text', text: content });
  }

  for (const attachment of attachments ?? []) {
    if (attachment.dataUrl && attachment.type.startsWith('image/')) {
      parts.push({ type: 'image', image: attachment.dataUrl });
    } else if (attachment.text) {
      parts.push({
        type: 'text',
        text: `\n\n[arquivo: ${attachment.name}]\n\`\`\`\n${attachment.text}\n\`\`\`\n`,
      });
    }
  }

  return parts.length ? parts : [{ type: 'text' as const, text: content || ' ' }];
}

function toModelMessages(request: ChatRequest): ModelMessage[] {
  return request.messages
    .filter((message) => message.role !== 'system')
    .map((message) => {
      if (message.role === 'assistant') {
        return { role: 'assistant' as const, content: message.content };
      }
      return {
        role: 'user' as const,
        content: toParts(message.content, message.attachments),
      };
    });
}

export async function streamCodex(request: ChatRequest, emit: StreamEmitter, signal?: AbortSignal) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('Codex ainda não está conectado. Configure OPENAI_API_KEY no servidor.');
  }

  const fallback = process.env.CODEX_MODEL || 'gpt-4.1';
  const model = ALLOWED_MODELS.has(request.model) ? request.model : fallback;

  const result = streamText({
    model: openai(model),
    system:
      'Você é o Codex dentro do Neo: um assistente de código preciso. Responda em português do Brasil salvo se o usuário pedir outro idioma. Prefira diffs e exemplos concretos.',
    messages: toModelMessages(request),
    abortSignal: signal,
  });

  for await (const part of result.fullStream) {
    if (part.type === 'reasoning-delta' && 'text' in part && part.text) {
      emit({ type: 'reasoning', delta: part.text });
    } else if (part.type === 'text-delta' && 'text' in part && part.text) {
      emit({ type: 'text', delta: part.text });
    }
  }
}
