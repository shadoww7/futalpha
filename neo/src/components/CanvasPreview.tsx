import { X } from 'lucide-react';
import { extractArtifacts, htmlFromArtifacts } from '../lib/artifacts';
import { useNeoStore } from '../store/useNeoStore';

export function CanvasPreview() {
  const open = useNeoStore((s) => s.canvasOpen);
  const setPanel = useNeoStore((s) => s.setPanel);
  const chat = useNeoStore((s) => s.chats.find((item) => item.id === s.activeChatId));
  if (!open) return null;
  const last = [...(chat?.messages ?? [])].reverse().find((message) => message.role === 'assistant');
  const html = htmlFromArtifacts(extractArtifacts(last?.content ?? ''));

  return (
    <div className="flex h-72 shrink-0 flex-col border-t border-white/[0.05] bg-[#070707]">
      <div className="flex items-center justify-between px-3 py-2 text-[12px] text-neo-muted">
        Canvas
        <button type="button" onClick={() => setPanel('canvasOpen', false)}>
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      {html ? (
        <iframe title="canvas" sandbox="allow-scripts" className="min-h-0 flex-1 bg-white" srcDoc={html} />
      ) : (
        <div className="flex flex-1 items-center justify-center text-[12px] text-neo-faint">
          Gere um bloco ```html para ver o preview.
        </div>
      )}
    </div>
  );
}
