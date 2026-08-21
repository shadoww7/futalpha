import type { McpServerStatus } from '../types';

export async function fetchMcp() {
  const res = await fetch('/api/mcp');
  if (!res.ok) throw new Error('falha ao listar MCP');
  return (await res.json()) as {
    servers: McpServerStatus[];
    summary: { servers: number; connected: number; tools: number };
  };
}

export async function addMcpServer(input: { name: string; command: string; args: string }) {
  const res = await fetch('/api/mcp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(await res.text());
  return (await res.json()) as { servers: McpServerStatus[] };
}

export async function patchMcpServer(id: string, patch: Partial<McpServerStatus>) {
  const res = await fetch(`/api/mcp/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error(await res.text());
  return (await res.json()) as { servers: McpServerStatus[] };
}

export async function deleteMcpServer(id: string) {
  const res = await fetch(`/api/mcp/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(await res.text());
  return (await res.json()) as { servers: McpServerStatus[] };
}
