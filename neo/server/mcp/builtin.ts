import os from 'node:os';
import type { McpToolInfo } from './types';
import { BUILTIN_ID } from './store';

export const builtinTools: McpToolInfo[] = [
  {
    serverId: BUILTIN_ID,
    serverName: 'Illusions',
    name: 'time_now',
    description: 'Retorna data e hora atuais do computador.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
  },
  {
    serverId: BUILTIN_ID,
    serverName: 'Illusions',
    name: 'system_info',
    description: 'Informações básicas do app e do SO (sem segredos).',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
  },
  {
    serverId: BUILTIN_ID,
    serverName: 'Illusions',
    name: 'echo',
    description: 'Devolve o texto enviado. Útil para testar MCP.',
    inputSchema: {
      type: 'object',
      properties: { text: { type: 'string', description: 'Texto para ecoar' } },
      required: ['text'],
    },
  },
];

export async function callBuiltin(name: string, args: Record<string, unknown>) {
  if (name === 'time_now') {
    return { iso: new Date().toISOString(), locale: new Date().toLocaleString('pt-BR') };
  }
  if (name === 'system_info') {
    return {
      app: 'Illusions',
      platform: os.platform(),
      arch: os.arch(),
      node: process.version,
      home: os.homedir(),
    };
  }
  if (name === 'echo') {
    return { text: String(args.text ?? '') };
  }
  throw new Error(`tool builtin desconhecida: ${name}`);
}
