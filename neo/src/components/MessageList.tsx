import { useEffect, useRef } from 'react';
import { useNeoStore } from '../store/useNeoStore';
import { ConnectionBanner } from './ConnectionBanner';
import { MessageBubble } from './MessageBubble';
import { ThoughtCard } from './ThoughtCard';

export function MessageList() {
  const chat = useNeoStore((s) => s.chats.find((item) => item.id === s.activeChatId) ?? null);
  const streaming = useNeoStore((s) => s.streaming);
  const bottom = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [chat?.messages, streaming]);

  const lastAssistant = [...(chat?.messages ?? [])].reverse().find((message) => message.role === 'assistant');

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6">
      <ConnectionBanner />
      <ThoughtCard text={lastAssistant?.thought} streaming={streaming && !lastAssistant?.content} />
      <div className="mt-8 space-y-8">
        {chat?.messages.map((message, index) => (
          <MessageBubble
            key={message.id}
            message={message}
            isLast={index === (chat.messages.length - 1) && message.role === 'assistant'}
          />
        ))}
      </div>
      <div ref={bottom} />
    </div>
  );
}
