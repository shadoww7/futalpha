import { GitFork, RefreshCw } from 'lucide-react';
import { t } from '../i18n';
import { useNeoStore } from '../store/useNeoStore';
import type { ChatMessage } from '../types';
import { Markdown } from './Markdown';

export function MessageBubble({ message, isLast }: { message: ChatMessage; isLast: boolean }) {
  const copy = t(useNeoStore((s) => s.settings.locale));
  const fork = useNeoStore((s) => s.fork);
  const regenerate = useNeoStore((s) => s.regenerate);
  const streaming = useNeoStore((s) => s.streaming);

  if (message.role === 'user') {
    return (
      <div className="mx-auto flex w-full max-w-3xl justify-end">
        <div className="max-w-[80%] rounded-2xl bg-[#1d1d1d] px-4 py-2.5 text-[14.5px] text-[#ececec]">
          {message.content}
          {!!message.attachments?.length && (
            <div className="mt-2 flex flex-wrap gap-2">
              {message.attachments.map((file) =>
                file.dataUrl && file.type.startsWith('image/') ? (
                  <img key={file.id} src={file.dataUrl} alt={file.name} className="h-16 w-16 rounded-lg object-cover" />
                ) : (
                  <span key={file.id} className="rounded-md bg-white/5 px-2 py-1 text-[11px] text-neo-muted">
                    {file.name}
                  </span>
                ),
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      {message.content ? <Markdown content={message.content} /> : streaming && isLast ? (
        <span className="inline-block h-4 w-4 animate-pulse rounded-full bg-white/20" />
      ) : null}
      {!!message.sources?.length && (
        <div className="mt-3 space-y-1 text-[12px]">
          <div className="text-neo-faint">{copy.sources}</div>
          {message.sources.map((source) => (
            <a
              key={source.url}
              href={source.url}
              target="_blank"
              rel="noreferrer"
              className="block truncate text-sky-400/90 hover:underline"
            >
              {source.title}
            </a>
          ))}
        </div>
      )}
      {message.error && <div className="mt-2 text-[12px] text-red-400">{message.error}</div>}
      <div className="mt-3 flex gap-1">
        <button
          type="button"
          onClick={() => fork(message.id)}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-neo-faint hover:bg-white/[0.04] hover:text-neo-muted"
        >
          <GitFork className="h-3 w-3" /> {copy.fork}
        </button>
        {isLast && (
          <button
            type="button"
            disabled={streaming}
            onClick={() => void regenerate()}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-neo-faint hover:bg-white/[0.04] hover:text-neo-muted"
          >
            <RefreshCw className="h-3 w-3" /> {copy.regenerate}
          </button>
        )}
      </div>
    </div>
  );
}
