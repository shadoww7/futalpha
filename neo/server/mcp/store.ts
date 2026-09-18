import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { McpServerConfig } from './types';

export const BUILTIN_ID = 'illusions';

const builtin: McpServerConfig = {
  id: BUILTIN_ID,
  name: 'Illusions',
  command: 'builtin',
  args: [],
  enabled: true,
  builtin: true,
};

function homeDir() {
  return process.env.ILLUSIONS_HOME || path.join(os.homedir(), '.illusions');
}

function configPath() {
  return path.join(homeDir(), 'mcp.json');
}

function ensureHome() {
  fs.mkdirSync(homeDir(), { recursive: true });
}

export function loadMcpConfigs(): McpServerConfig[] {
  ensureHome();
  try {
    const raw = fs.readFileSync(configPath(), 'utf8');
    const parsed = JSON.parse(raw) as { servers?: McpServerConfig[] };
    const extra = (parsed.servers ?? []).filter((server) => server.id !== BUILTIN_ID);
    return [builtin, ...extra];
  } catch {
    return [builtin];
  }
}

export function saveMcpConfigs(servers: McpServerConfig[]) {
  ensureHome();
  const extra = servers.filter((server) => !server.builtin && server.id !== BUILTIN_ID);
  fs.writeFileSync(configPath(), JSON.stringify({ servers: extra }, null, 2));
}

export function upsertMcpConfig(next: McpServerConfig) {
  const servers = loadMcpConfigs();
  const index = servers.findIndex((server) => server.id === next.id);
  if (index >= 0) servers[index] = { ...servers[index], ...next };
  else servers.push(next);
  saveMcpConfigs(servers);
  return loadMcpConfigs();
}

export function removeMcpConfig(id: string) {
  if (id === BUILTIN_ID) return loadMcpConfigs();
  saveMcpConfigs(loadMcpConfigs().filter((server) => server.id !== id));
  return loadMcpConfigs();
}
