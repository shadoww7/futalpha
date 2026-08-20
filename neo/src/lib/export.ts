import type { Chat } from '../types';

export function chatToMarkdown(chat: Chat) {
  const lines = [`# ${chat.title}`, '', `_modelo: ${chat.model} · ${new Date(chat.createdAt).toLocaleString()}_`, ''];
  for (const message of chat.messages) {
    lines.push(`## ${message.role === 'user' ? 'Você' : 'Neo'}`);
    if (message.thought) {
      lines.push('', '> ' + message.thought.replace(/\n/g, '\n> '), '');
    }
    lines.push(message.content, '');
    if (message.sources?.length) {
      lines.push('Fontes:');
      for (const source of message.sources) {
        lines.push(`- [${source.title}](${source.url})`);
      }
      lines.push('');
    }
  }
  return lines.join('\n');
}

export function downloadText(filename: string, text: string, type = 'text/plain') {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
