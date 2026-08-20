# Neo

Chatbot dark minimalista com Grok (xAI). Codex entra quando `OPENAI_API_KEY` existir.

## Rodar

```bash
cd neo
cp .env.example .env
# opcional: cole XAI_API_KEY (https://console.x.ai)
npm install
npm run dev
```

- UI: http://localhost:5174
- API: http://127.0.0.1:8787

Sem key o app sobe em **modo demo**.

## Atalhos

- `Ctrl/Cmd + N` novo chat
- `Ctrl/Cmd + K` busca
- `Esc` para a geração
