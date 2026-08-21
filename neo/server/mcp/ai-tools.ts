import { jsonSchema, tool, type Tool } from 'ai';
import type { StreamEmitter } from '../providers/types';
import { callMcpTool, listActiveTools, toolKey } from './manager';

export function buildMcpAiTools(emit?: StreamEmitter) {
  const tools: Record<string, Tool> = {};

  for (const item of listActiveTools()) {
    const key = toolKey(item);
    const schema = item.inputSchema ?? { type: 'object', properties: {} };
    tools[key] = tool({
      description: `[${item.serverName}] ${item.description}`,
      inputSchema: jsonSchema(schema as Parameters<typeof jsonSchema>[0]),
      execute: async (args: Record<string, unknown>) => {
        emit?.({ type: 'tool', name: `${item.serverName}/${item.name}`, status: 'start' });
        try {
          const result = await callMcpTool(item.serverId, item.name, args ?? {});
          const detail = typeof result === 'string' ? result : JSON.stringify(result);
          emit?.({
            type: 'tool',
            name: `${item.serverName}/${item.name}`,
            status: 'done',
            detail: detail.slice(0, 2000),
          });
          return result;
        } catch (error) {
          const message = error instanceof Error ? error.message : 'erro MCP';
          emit?.({ type: 'tool', name: `${item.serverName}/${item.name}`, status: 'error', detail: message });
          return { error: message };
        }
      },
    });
  }

  return tools;
}
