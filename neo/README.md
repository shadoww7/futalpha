# Illusions

App desktop dark com Grok, Codex (opcional) e MCP.

## App (janela nativa)

```bash
cd neo
cp .env.example .env
npm install
npm run app
```

Isso sobe a API, o renderer e abre a janela do **Illusions** (Electron), não o navegador.

## MCP

O servidor builtin `Illusions` já vem ligado (`time_now`, `system_info`, `echo`).

No painel **MCP** você adiciona servidores stdio, por exemplo:

```
npx -y @modelcontextprotocol/server-filesystem /caminho
```

Configs ficam em `~/.illusions/mcp.json`.

## Gerar o .exe (Windows)

```bash
cd neo
npm install
npm run dist:win
```

O executável sai em:

`neo/release/Illusions.exe`

No Windows, clique duas vezes nesse arquivo. Para a key da Grok, coloque um `.env` na mesma pasta do exe ou em `%APPDATA%/illusions/.env`.

## Só API + site (dev)

```bash
npm run dev
```

- renderer: http://localhost:5174
- API: http://127.0.0.1:8787
