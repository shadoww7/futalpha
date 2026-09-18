export interface McpServerConfig {
  id: string;
  name: string;
  command: string;
  args: string[];
  env?: Record<string, string>;
  enabled: boolean;
  builtin?: boolean;
}

export interface McpToolInfo {
  serverId: string;
  serverName: string;
  name: string;
  description: string;
  inputSchema?: Record<string, unknown>;
}

export interface McpServerStatus extends McpServerConfig {
  connected: boolean;
  tools: McpToolInfo[];
  error?: string;
}
