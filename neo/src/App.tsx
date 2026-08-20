import { useEffect } from 'react';
import { ArtifactPanel } from './components/ArtifactPanel';
import { AutomationsPanel } from './components/AutomationsPanel';
import { CanvasPreview } from './components/CanvasPreview';
import { ChatInput } from './components/ChatInput';
import { CommandPalette } from './components/CommandPalette';
import { CompareView } from './components/CompareView';
import { CustomizePanel } from './components/CustomizePanel';
import { Header } from './components/Header';
import { IdePanel } from './components/IdePanel';
import { McpPanel } from './components/McpPanel';
import { MessageList } from './components/MessageList';
import { Sidebar } from './components/Sidebar';
import { VideoBackground } from './components/VideoBackground';
import { useAutomations } from './hooks/useAutomations';
import { useKeyboard } from './hooks/useKeyboard';
import { extractArtifacts, htmlFromArtifacts } from './lib/artifacts';
import { useNeoStore } from './store/useNeoStore';

export function App() {
  const hydrate = useNeoStore((s) => s.hydrate);
  const refreshHealth = useNeoStore((s) => s.refreshHealth);
  const ready = useNeoStore((s) => s.ready);
  const settings = useNeoStore((s) => s.settings);
  const compareEnabled = settings.compareEnabled;
  const chat = useNeoStore((s) => s.chats.find((item) => item.id === s.activeChatId));
  const canvasOpen = useNeoStore((s) => s.canvasOpen);
  const setPanel = useNeoStore((s) => s.setPanel);

  useKeyboard();
  useAutomations();

  useEffect(() => {
    void hydrate();
    const timer = window.setInterval(() => void refreshHealth(), 15_000);
    return () => window.clearInterval(timer);
  }, [hydrate, refreshHealth]);

  useEffect(() => {
    document.documentElement.dataset.theme = settings.theme;
  }, [settings.theme]);

  useEffect(() => {
    const last = [...(chat?.messages ?? [])].reverse().find((message) => message.role === 'assistant');
    const html = htmlFromArtifacts(extractArtifacts(last?.content ?? ''));
    if (html && !canvasOpen) setPanel('canvasOpen', true);
  }, [chat?.messages, canvasOpen, setPanel]);

  const motionBg = settings.motionBg !== false;

  if (!ready) {
    return (
      <div className="relative grid h-full place-items-center text-[13px] text-neo-faint">
        {motionBg && <VideoBackground />}
        <span className="relative z-10">Illusions</span>
      </div>
    );
  }

  return (
    <div
      className={`relative flex h-full flex-col text-neo-text ${motionBg ? 'bg-transparent' : 'bg-neo-bg'} ${settings.density === 'compact' ? 'text-[13px]' : ''}`}
    >
      {motionBg && <VideoBackground />}
      <div className="relative z-10 flex h-full min-h-0 flex-col">
      <Header />
      <div className="flex min-h-0 flex-1">
        <main className="flex min-w-0 flex-1 flex-col">
          {compareEnabled ? (
            <CompareView />
          ) : (
            <>
              <MessageList />
              <CanvasPreview />
            </>
          )}
          <ChatInput />
        </main>
        <IdePanel />
        <ArtifactPanel />
        <Sidebar />
      </div>
      <CommandPalette />
      <CustomizePanel />
      <AutomationsPanel />
      <McpPanel />
      </div>
    </div>
  );
}
