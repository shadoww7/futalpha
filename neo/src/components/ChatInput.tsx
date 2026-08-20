import { ArrowUp, Mic, Paperclip, Plus, Square } from 'lucide-react';
import { useRef, useState } from 'react';
import { t } from '../i18n';
import { cn } from '../lib/cn';
import { createRecognizer } from '../lib/speech';
import { uid } from '../lib/time';
import { useNeoStore } from '../store/useNeoStore';
import type { Attachment } from '../types';
import { ModelPicker } from './ModelPicker';

export function ChatInput() {
  const send = useNeoStore((s) => s.send);
  const stop = useNeoStore((s) => s.stop);
  const streaming = useNeoStore((s) => s.streaming);
  const copy = t(useNeoStore((s) => s.settings.locale));
  const [value, setValue] = useState('');
  const [files, setFiles] = useState<Attachment[]>([]);
  const [listening, setListening] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const recRef = useRef<SpeechRecognition | null>(null);

  const onFiles = async (list: FileList | null) => {
    if (!list) return;
    const next: Attachment[] = [];
    for (const file of Array.from(list)) {
      if (file.type.startsWith('image/')) {
        const dataUrl = await readAsDataUrl(file);
        next.push({ id: uid('att'), name: file.name, type: file.type, dataUrl });
      } else if (file.size < 200_000) {
        const text = await file.text();
        next.push({ id: uid('att'), name: file.name, type: file.type || 'text/plain', text });
      }
    }
    setFiles((prev) => [...prev, ...next]);
  };

  const submit = async () => {
    const text = value;
    const attachments = files;
    setValue('');
    setFiles([]);
    await send(text, attachments);
  };

  const toggleMic = () => {
    if (listening) {
      recRef.current?.stop();
      setListening(false);
      return;
    }
    const rec = createRecognizer((text, final) => {
      setValue((prev) => {
        const base = prev.replace(/\s+$/, '');
        return final ? `${base} ${text}`.trim() : `${base} ${text}`.trim();
      });
    });
    if (!rec) return;
    rec.onend = () => setListening(false);
    recRef.current = rec;
    rec.start();
    setListening(true);
  };

  return (
    <div className="px-6 pb-4">
      <div className="mx-auto w-full max-w-3xl">
        {!!files.length && (
          <div className="mb-2 flex flex-wrap gap-2">
            {files.map((file) => (
              <button
                key={file.id}
                type="button"
                onClick={() => setFiles((prev) => prev.filter((item) => item.id !== file.id))}
                className="rounded-full border border-white/10 px-2 py-1 text-[11px] text-neo-muted"
              >
                {file.name} ×
              </button>
            ))}
          </div>
        )}
        <div className="rounded-[28px] border border-white/[0.08] bg-[#161616]/80 px-3 py-2 shadow-pill backdrop-blur-xl">
          <textarea
            value={value}
            rows={1}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                void submit();
              }
            }}
            placeholder={listening ? copy.listening : copy.placeholder}
            className="max-h-40 min-h-[44px] w-full bg-transparent px-2 py-2 text-[14.5px] text-neo-text outline-none placeholder:text-neo-faint"
          />
          <div className="flex items-center gap-1 pb-1">
            <button
              type="button"
              title={copy.attach}
              onClick={() => fileRef.current?.click()}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-neo-muted hover:bg-white/[0.05] hover:text-white"
            >
              <Plus className="h-4 w-4" />
            </button>
            <input
              ref={fileRef}
              type="file"
              multiple
              accept="image/*,.txt,.md,.json,.ts,.tsx,.js,.lua,.py,.css,.html"
              className="hidden"
              onChange={(e) => void onFiles(e.target.files)}
            />
            <ModelPicker />
            <div className="ml-auto flex items-center gap-1">
              <button
                type="button"
                title={copy.voice}
                onClick={toggleMic}
                className={cn(
                  'inline-flex h-8 w-8 items-center justify-center rounded-full text-neo-muted hover:bg-white/[0.05] hover:text-white',
                  listening && 'text-sky-400',
                )}
              >
                <Mic className="h-4 w-4" />
              </button>
              {streaming ? (
                <button
                  type="button"
                  title={copy.stop}
                  onClick={stop}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-black"
                >
                  <Square className="h-3.5 w-3.5 fill-current" />
                </button>
              ) : (
                <button
                  type="button"
                  title={copy.send}
                  onClick={() => void submit()}
                  disabled={!value.trim() && !files.length}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#3b82f6] text-white disabled:opacity-40"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="mt-2 flex items-center gap-2 px-1 text-[11px] text-neo-faint">
          <Paperclip className="h-3 w-3" />
          {copy.thisPc}
        </div>
      </div>
    </div>
  );
}

function readAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
