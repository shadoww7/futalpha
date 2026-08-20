import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { callBuiltin, builtinTools } from './builtin';
import { BUILTIN_ID, loadMcpConfigs, removeMcpConfig, upsertMcpConfig } from './store';
import type { McpServerConfig, McpServerStatus, McpToolInfo } from './types';

interface LiveClient {
  client: Client;
  transport: StdioClientTransport;
  tools: McpToolInfo[];
  error?: string;
}

const live = new Map<string, LiveClient>();

function sanitizeKey(serverId: string, name: string) {
  return `mcp_${serverId}_${name}`.replace(/[^a-zA-Z0-9_]/g, '_');
}

export function toolKey(tool: McpToolInfo) {
  return sanitizeKey(tool.serverId, tool.name);
}

export async function connectServer(config: McpServerConfig) {
  if (config.builtin || config.id === BUILTIN_ID) return;
  await disconnectServer(config.id);
  const transport = new StdioClientTransport({
    command: config.command,
    args: config.args,
    env: { ...process.env, ...config.env } as Record<string, string>,
    stderr: 'pipe',
  });
  const client = new Client({ name: 'illusions', version: '0.1.0' });
  try {
    await client.connect(transport);
    const listed = await client.listTools();
    const tools: McpToolInfo[] = (listed.tools ?? []).map((tool) => ({
      serverId: config.id,
      serverName: config.name,
      name: tool.name,
      description: tool.description || tool.name,
      inputSchema: (tool.inputSchema as Record<string, unknown> | undefined) ?? {
        type: 'object',
        properties: {},
      },
    }));
    live.set(config.id, { client, transport, tools });
  } catch (error) {
    live.set(config.id, {
      client,
      transport,
      tools: [],
      error: error instanceof Error ? error.message : 'falha ao conectar MCP',
    });
  }
}

export async function disconnectServer(id: string) {
  const current = live.get(id);
  if (!current) return;
  live.delete(id);
  try {
    await current.client.close();
  } catch {
    // ignore
  }
}

export async function reconnectEnabled() {
  const configs = loadMcpConfigs();
  for (const config of configs) {
    if (!config.enabled || config.builtin) continue;
    await connectServer(config);
  }
}

export function listStatus(): McpServerStatus[] {
  return loadMcpConfigs().map((config) => {
    if (config.builtin) {
      return { ...config, connected: true, tools: builtinTools };
    }
    const session = live.get(config.id);
    return {
      ...config,
      connected: Boolean(session && !session.error),
      tools: session?.tools ?? [],
      error: session?.error,
    };
  });
}

export function listActiveTools(): McpToolInfo[] {
  const tools: McpToolInfo[] = [];
  for (const status of listStatus()) {
    if (!status.enabled) continue;
    if (status.builtin || status.connected) tools.push(...status.tools);
  }
  return tools;
}

export async function callMcpTool(serverId: string, name: string, args: Record<string, unknown>) {
  if (serverId === BUILTIN_ID) return callBuiltin(name, args);
  const session = live.get(serverId);
  if (!session || session.error) throw new Error(`MCP ${serverId} não conectado`);
  const result = await session.client.callTool({ name, arguments: args });
  return result;
}

export async function addServer(input: Omit<McpServerConfig, 'id' | 'builtin'> & { id?: string }) {
  const id = input.id || `mcp_${Date.now().toString(36)}`;
  const config: McpServerConfig = { ...input, id, builtin: false };
  upsertMcpConfig(config);
  if (config.enabled) await connectServer(config);
  return listStatus();
}

export async function patchServer(id: string, patch: Partial<McpServerConfig>) {
  const current = loadMcpConfigs().find((server) => server.id === id);
  if (!current) throw new Error('servidor MCP não encontrado');
  const next = { ...current, ...patch, id, builtin: current.builtin };
  upsertMcpConfig(next);
  if (next.builtin) return listStatus();
  if (next.enabled) await connectServer(next);
  else await disconnectServer(id);
  return listStatus();
}

export async function deleteServer(id: string) {
  await disconnectServer(id);
  removeMcpConfig(id);
  return listStatus();
}

export function mcpSummary() {
  const status = listStatus();
  return {
    servers: status.length,
    connected: status.filter((item) => item.connected && item.enabled).length,
    tools: listActiveTools().length,
  };
}
