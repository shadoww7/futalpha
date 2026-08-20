import { Check, Copy } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';
import { useNeoStore } from '../store/useNeoStore';

function CodeBlock({ className, children }: { className?: string; children?: ReactNode }) {
  const [copied, setCopied] = useState(false);
  const text = String(children ?? '').replace(/\n$/, '');
  const language = /language-(\w+)/.exec(className || '')?.[1] ?? '';
  const setPanel = useNeoStore((s) => s.setPanel);

  return (
    <div className="group relative my-3 overflow-hidden rounded-xl border border-white/[0.06] bg-[#0c0c0c]">
      <div className="flex items-center justify-between border-b border-white/[0.04] px-3 py-1.5 text-[11px] text-neo-faint">
        <span>{language || 'code'}</span>
        <div className="flex gap-2">
          {text.length > 80 && (
            <button type="button" className="hover:text-neo-text" onClick={() => setPanel('artifactOpen', true)}>
              artifact
            </button>
          )}
          <button
            type="button"
            className="hover:text-neo-text"
            onClick={async () => {
              await navigator.clipboard.writeText(text);
              setCopied(true);
              setTimeout(() => setCopied(false), 1200);
            }}
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>
      <pre className="overflow-x-auto p-3 text-[12.5px] leading-relaxed">
        <code className={className}>{children}</code>
      </pre>
    </div>
  );
}

export function Markdown({ content }: { content: string }) {
  return (
    <div className="prose-neo text-[14.5px] leading-7 text-[#e4e4e4]">
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeHighlight]}
      components={{
        a: ({ href, children }) => (
          <a href={href} target="_blank" rel="noreferrer" className="text-sky-400 hover:underline">
            {children}
          </a>
        ),
        p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
        ul: ({ children }) => <ul className="mb-3 list-disc space-y-1 pl-5">{children}</ul>,
        ol: ({ children }) => <ol className="mb-3 list-decimal space-y-1 pl-5">{children}</ol>,
        h1: ({ children }) => <h1 className="mb-2 mt-4 text-xl font-semibold">{children}</h1>,
        h2: ({ children }) => <h2 className="mb-2 mt-4 text-lg font-semibold">{children}</h2>,
        h3: ({ children }) => <h3 className="mb-2 mt-3 text-base font-semibold">{children}</h3>,
        blockquote: ({ children }) => (
          <blockquote className="my-3 border-l-2 border-white/10 pl-3 text-neo-muted">{children}</blockquote>
        ),
        code: ({ className, children, ...props }) => {
          const inline = !className;
          if (inline) {
            return (
              <code className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[12.5px]" {...props}>
                {children}
              </code>
            );
          }
          return <CodeBlock className={className}>{children}</CodeBlock>;
        },
        pre: ({ children }) => <>{children}</>,
      }}
    >
      {content}
    </ReactMarkdown>
    </div>
  );
}
