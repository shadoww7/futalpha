import { File, FolderOpen } from 'lucide-react';
import { useMemo, useState } from 'react';
import { t } from '../i18n';
import { uid } from '../lib/time';
import { useNeoStore } from '../store/useNeoStore';

interface IdeFile {
  path: string;
  name: string;
  text: string;
}

export function IdePanel() {
  const open = useNeoStore((s) => s.ideOpen);
  const send = useNeoStore((s) => s.send);
  const copy = t(useNeoStore((s) => s.settings.locale));
  const [files, setFiles] = useState<IdeFile[]>([]);
  const [activePath, setActivePath] = useState<string | null>(null);
  const [error, setError] = useState('');
  const active = useMemo(() => files.find((file) => file.path === activePath) ?? null, [files, activePath]);

  if (!open) return null;

  const loadFolder = async () => {
    setError('');
    const picker = (window as Window & { showDirectoryPicker?: () => Promise<FileSystemDirectoryHandle> })
      .showDirectoryPicker;
    if (!picker) {
      setError('Este navegador não tem File System Access API. Use Chrome/Edge, ou anexe arquivos no input.');
      return;
    }
    try {
      const root = await picker();
      const collected: IdeFile[] = [];
      await walk(root, '', collected, 0);
      setFiles(collected);
      setActivePath(collected[0]?.path ?? null);
    } catch (err) {
      if ((err as Error).name !== 'AbortError') setError((err as Error).message);
    }
  };

  const loadFallback = async (list: FileList | null) => {
    if (!list) return;
    const collected: IdeFile[] = [];
    for (const file of Array.from(list)) {
      if (file.size > 200_000) continue;
      collected.push({ path: file.name, name: file.name, text: await file.text() });
    }
    setFiles(collected);
    setActivePath(collected[0]?.path ?? null);
  };

  return (
    <aside className="flex w-[360px] shrink-0 flex-col border-l border-white/[0.05] bg-[#070707]/70 backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-white/[0.05] px-3 py-2">
        <div className="text-[12px] text-neo-muted">{copy.thisPc}</div>
        <div className="flex gap-2">
          <button type="button" onClick={() => void loadFolder()} className="inline-flex items-center gap-1 text-[11px] text-neo-muted">
            <FolderOpen className="h-3.5 w-3.5" /> {copy.openFolder}
          </button>
          <label className="cursor-pointer text-[11px] text-neo-faint">
            files
            <input
              type="file"
              multiple
              className="hidden"
              onChange={(e) => void loadFallback(e.target.files)}
            />
          </label>
        </div>
      </div>
      {error && <div className="px-3 py-2 text-[11px] text-amber-400">{error}</div>}
      <div className="grid min-h-0 flex-1 grid-rows-2">
        <div className="overflow-y-auto border-b border-white/[0.05] p-2">
          {files.length === 0 && <div className="px-2 py-6 text-[12px] text-neo-faint">{copy.noFolder}</div>}
          {files.map((file) => (
            <button
              key={file.path}
              type="button"
              onClick={() => setActivePath(file.path)}
              className={`flex w-full items-center gap-2 rounded-md px-2 py-1 text-left text-[12px] ${
                file.path === activePath ? 'bg-white/10' : 'text-neo-muted hover:bg-white/[0.04]'
              }`}
            >
              <File className="h-3 w-3" />
              <span className="truncate">{file.path}</span>
            </button>
          ))}
        </div>
        <div className="flex min-h-0 flex-col">
          <textarea
            value={active?.text ?? ''}
            onChange={(e) => {
              if (!active) return;
              setFiles((prev) => prev.map((file) => (file.path === active.path ? { ...file, text: e.target.value } : file)));
            }}
            className="min-h-0 flex-1 bg-transparent p-3 font-mono text-[12px] outline-none"
            placeholder="// arquivo"
          />
          <button
            type="button"
            disabled={!active}
            onClick={() => {
              if (!active) return;
              void send(`Revise este arquivo (${active.path}):\n\n\`\`\`\n${active.text.slice(0, 12000)}\n\`\`\``, [
                { id: uid('att'), name: active.name, type: 'text/plain', text: active.text },
              ]);
            }}
            className="m-2 rounded-lg bg-white/10 py-2 text-[12px] disabled:opacity-40"
          >
            {copy.sendFile}
          </button>
        </div>
      </div>
    </aside>
  );
}

const SKIP = new Set(['node_modules', '.git', 'dist', '.next']);

async function walk(
  dir: FileSystemDirectoryHandle,
  prefix: string,
  out: IdeFile[],
  depth: number,
) {
  if (depth > 3 || out.length > 80) return;
  for await (const [name, handle] of dir.entries()) {
    if (SKIP.has(name) || name.startsWith('.')) continue;
    const path = prefix ? `${prefix}/${name}` : name;
    if (handle.kind === 'directory') {
      await walk(handle, path, out, depth + 1);
    } else if (handle.kind === 'file' && /\.(ts|tsx|js|jsx|json|md|css|html|py|lua|txt)$/i.test(name)) {
      const file = await handle.getFile();
      if (file.size > 180_000) continue;
      out.push({ path, name, text: await file.text() });
    }
  }
}
