import type { ChatRequest, StreamEmitter } from './types';

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function emitWords(emit: StreamEmitter, type: 'reasoning' | 'text', text: string, delay = 18) {
  const chunks = text.split(/(\s+)/);
  for (const chunk of chunks) {
    emit({ type, delta: chunk });
    await sleep(delay);
  }
}

export async function streamDemo(request: ChatRequest, emit: StreamEmitter) {
  const lastUser = [...request.messages].reverse().find((message) => message.role === 'user');
  const prompt = lastUser?.content?.trim() || 'olá';

  await emitWords(
    emit,
    'reasoning',
    'Sem chave da xAI. Vou responder em modo demo: alinhar o plano, depois escrever a resposta com o mesmo tom do Neo.\n',
    12,
  );

  const reply = [
    `Recebi: "${prompt.slice(0, 180)}"`,
    '',
    'O Neo está no ar, mas ainda **não conectado** à Grok.',
    '',
    '1. Crie uma key em https://console.x.ai',
    '2. Copie `neo/.env.example` para `neo/.env`',
    '3. Preencha `XAI_API_KEY` e rode `npm run dev` de novo',
    '',
    request.research
      ? 'O modo Research também precisa da key — as fontes reais vêm do `web_search` da xAI.'
      : 'Quando conectar, o bloco Thought passa a mostrar o raciocínio real do modelo.',
    '',
    request.provider === 'codex'
      ? 'Codex fica disponível quando `OPENAI_API_KEY` existir no servidor.'
      : `Modelo selecionado: \`${request.model}\` · esforço \`${request.effort}\`.`,
  ].join('\n');

  await emitWords(emit, 'text', reply);

  if (request.research) {
    emit({
      type: 'source',
      title: 'xAI Console',
      url: 'https://console.x.ai',
    });
    emit({
      type: 'source',
      title: 'Grok 4.6 docs',
      url: 'https://docs.x.ai/developers/grok-4-6',
    });
  }
}
