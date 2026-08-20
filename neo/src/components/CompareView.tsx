import { useNeoStore } from '../store/useNeoStore';
import { Markdown } from './Markdown';
import { ThoughtCard } from './ThoughtCard';

export function CompareView() {
  const chat = useNeoStore((s) => s.chats.find((item) => item.id === s.activeChatId));
  const compareText = useNeoStore((s) => s.compareText);
  const compareThought = useNeoStore((s) => s.compareThought);
  const compareModel = useNeoStore((s) => s.settings.compareModel);
  const last = [...(chat?.messages ?? [])].reverse().find((message) => message.role === 'assistant');

  return (
    <div className="grid min-h-0 flex-1 grid-cols-2 gap-px overflow-hidden bg-white/[0.04]">
      <Column title={chat?.model ?? 'A'} thought={last?.thought} body={last?.content ?? ''} />
      <Column title={compareModel} thought={compareThought} body={compareText || '…'} />
    </div>
  );
}

function Column({ title, thought, body }: { title: string; thought?: string; body: string }) {
  return (
    <div className="flex min-h-0 flex-col overflow-y-auto bg-black/35 px-5 py-5 backdrop-blur-sm">
      <div className="mb-4 text-[11px] uppercase tracking-[0.16em] text-neo-faint">{title}</div>
      <ThoughtCard text={thought} />
      <div className="mt-6">
        <Markdown content={body} />
      </div>
    </div>
  );
}
