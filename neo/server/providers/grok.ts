import { stepCountIs, streamText, type ModelMessage, type Tool } from 'ai';
import { xai } from '@ai-sdk/xai';
import type { ChatAttachment, ChatRequest, StreamEmitter } from './types';

const ALLOWED_MODELS = new Set(['grok-4.6', 'grok-4.5', 'grok-4.3', 'grok-build-0.1']);

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

export async function streamGrok(
  request: ChatRequest,
  emit: StreamEmitter,
  signal?: AbortSignal,
  mcpTools: Record<string, Tool> = {},
) {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) {
    throw new Error('XAI_API_KEY ausente');
  }

  const model = ALLOWED_MODELS.has(request.model) ? request.model : 'grok-4.6';
  const messages = toModelMessages(request);
  const tools = {
    ...mcpTools,
    ...(request.research ? { web_search: xai.tools.webSearch() } : {}),
  };

  const result = streamText({
    model: xai.responses(model),
    system:
      'Você é o Illusions, um assistente de workspace dark e direto, com MCP. Responda em português do Brasil salvo se o usuário pedir outro idioma. Use markdown. Quando fizer pesquisa ou chamar tools MCP, explique o que fez.',
    messages,
    abortSignal: signal,
    tools: Object.keys(tools).length ? tools : undefined,
    stopWhen: stepCountIs(8),
    providerOptions: {
      xai: {
        reasoningEffort: request.effort,
      },
    },
    headers: {
      'x-grok-conv-id': request.conversationId,
    },
  });

  const seenSources = new Set<string>();

  for await (const part of result.fullStream) {
    if (part.type === 'reasoning-delta' && 'text' in part && part.text) {
      emit({ type: 'reasoning', delta: part.text });
    } else if (part.type === 'text-delta' && 'text' in part && part.text) {
      emit({ type: 'text', delta: part.text });
    } else if (part.type === 'source') {
      const url = 'url' in part && typeof part.url === 'string' ? part.url : '';
      const title =
        'title' in part && typeof part.title === 'string' && part.title
          ? part.title
          : url;
      if (url && !seenSources.has(url)) {
        seenSources.add(url);
        emit({ type: 'source', title, url });
      }
    } else if (part.type === 'tool-call') {
      const name = 'toolName' in part ? String(part.toolName) : 'tool';
      emit({ type: 'tool', name, status: 'start' });
    } else if (part.type === 'tool-result') {
      const name = 'toolName' in part ? String(part.toolName) : 'tool';
      emit({ type: 'tool', name, status: 'done' });
    }
  }
}
