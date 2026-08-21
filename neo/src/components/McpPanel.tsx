import { Plug, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { t } from '../i18n';
import { addMcpServer, deleteMcpServer, fetchMcp, patchMcpServer } from '../lib/mcp';
import { useNeoStore } from '../store/useNeoStore';

function ChatMcpToggle() {
  const copy = t(useNeoStore((s) => s.settings.locale));
  const chat = useNeoStore((s) => s.chats.find((item) => item.id === s.activeChatId));
  const updateActive = useNeoStore((s) => s.updateActive);
  const on = chat?.mcp !== false;
  return (
    <button
      type="button"
      onClick={() => updateActive({ mcp: !on })}
      className={`mb-4 w-full rounded-xl border px-3 py-2 text-left text-[13px] ${
        on ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200' : 'border-white/10 text-neo-muted'
      }`}
    >
      {on ? copy.mcpOn : copy.mcpOff}
    </button>
  );
}
import type { McpServerStatus } from '../types';

export function McpPanel() {
  const open = useNeoStore((s) => s.mcpOpen);
  const setPanel = useNeoStore((s) => s.setPanel);
  const copy = t(useNeoStore((s) => s.settings.locale));
  const [servers, setServers] = useState<McpServerStatus[]>([]);
  const [name, setName] = useState('filesystem');
  const [command, setCommand] = useState('npx');
  const [args, setArgs] = useState('-y @modelcontextprotocol/server-filesystem /tmp');
  const [error, setError] = useState('');

  const refresh = async () => {
    try {
      const data = await fetchMcp();
      setServers(data.servers);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'MCP offline');
    }
  };

  useEffect(() => {
    if (open) void refresh();
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/50" onClick={() => setPanel('mcpOpen', false)}>
      <div className="h-full w-full max-w-md overflow-y-auto border-l border-white/10 bg-[#0c0c0c] p-5" onClick={(e) => e.stopPropagation()}>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-[15px] font-medium">
            <Plug className="h-4 w-4" /> {copy.mcp}
          </h2>
          <button type="button" onClick={() => setPanel('mcpOpen', false)}>
            <X className="h-4 w-4 text-neo-muted" />
          </button>
        </div>
        <ChatMcpToggle />

        <div className="mb-5 space-y-2 rounded-xl border border-white/10 p-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={copy.title}
            className="w-full rounded-lg bg-[#161616] px-3 py-2 text-[13px] outline-none"
          />
          <input
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            placeholder={copy.mcpCommand}
            className="w-full rounded-lg bg-[#161616] px-3 py-2 text-[13px] outline-none"
          />
          <input
            value={args}
            onChange={(e) => setArgs(e.target.value)}
            placeholder={copy.mcpArgs}
            className="w-full rounded-lg bg-[#161616] px-3 py-2 font-mono text-[12px] outline-none"
          />
          <button
            type="button"
            className="w-full rounded-lg bg-white/10 py-2 text-[13px]"
            onClick={() => {
              void addMcpServer({ name, command, args })
                .then((data) => setServers(data.servers))
                .catch((err: Error) => setError(err.message));
            }}
          >
            {copy.addMcp}
          </button>
        </div>

        {error && <div className="mb-3 text-[12px] text-amber-400">{error}</div>}

        <div className="space-y-3">
          {servers.map((server) => (
            <div key={server.id} className="rounded-xl border border-white/10 p-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="text-[13px]">{server.name}</div>
                  <div className="font-mono text-[11px] text-neo-faint">
                    {server.builtin ? 'builtin' : `${server.command} ${server.args.join(' ')}`}
                  </div>
                </div>
                <span className={`text-[11px] ${server.connected ? 'text-emerald-400' : 'text-neo-faint'}`}>
                  {server.connected ? copy.connect : copy.disconnect}
                </span>
              </div>
              {server.error && <div className="mt-1 text-[11px] text-red-400">{server.error}</div>}
              {!!server.tools.length && (
                <div className="mt-2 space-y-1">
                  <div className="text-[10px] uppercase tracking-[0.14em] text-neo-faint">{copy.tools}</div>
                  {server.tools.map((tool) => (
                    <div key={tool.name} className="text-[12px] text-neo-muted">
                      {tool.name}
                      <span className="ml-2 text-[11px] text-neo-faint">{tool.description}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-2 flex gap-2">
                {!server.builtin && (
                  <>
                    <button
                      type="button"
                      className="rounded-md bg-white/5 px-2 py-1 text-[11px]"
                      onClick={() => {
                        void patchMcpServer(server.id, { enabled: !server.enabled }).then((data) => setServers(data.servers));
                      }}
                    >
                      {server.enabled ? copy.enabled : 'off'}
                    </button>
                    <button
                      type="button"
                      className="rounded-md bg-white/5 px-2 py-1 text-[11px]"
                      onClick={() => {
                        void deleteMcpServer(server.id).then((data) => setServers(data.servers));
                      }}
                    >
                      {copy.deleteChat}
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
