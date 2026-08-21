import { app, BrowserWindow, shell } from 'electron';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEV_URL = process.env.ILLUSIONS_DEV_URL || 'http://127.0.0.1:5174';

function loadEnv() {
  const candidates = [
    path.join(app.getPath('userData'), '.env'),
    path.join(process.cwd(), '.env'),
    path.join(__dirname, '../.env'),
  ];
  for (const file of candidates) {
    if (!fs.existsSync(file)) continue;
    for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
      const eq = trimmed.indexOf('=');
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim();
      if (key && process.env[key] === undefined) process.env[key] = value;
    }
  }
}

async function findPort(start = 8787) {
  const { createServer } = await import('node:net');
  for (let port = start; port < start + 20; port += 1) {
    const free = await new Promise((resolve) => {
      const server = createServer();
      server.once('error', () => resolve(false));
      server.listen(port, '127.0.0.1', () => {
        server.close(() => resolve(true));
      });
    });
    if (free) return port;
  }
  return start;
}

async function startPackagedApi() {
  const port = Number(process.env.ILLUSIONS_PORT || (await findPort()));
  const staticDir = path.join(__dirname, '../dist');
  const serverPath = path.join(__dirname, '../dist-server/index.js');
  const mod = await import(pathToFileURL(serverPath).href);
  const url = await mod.startPackaged({ port, staticDir });
  return url;
}

async function createWindow(url) {
  const win = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 960,
    minHeight: 640,
    title: 'Illusions',
    backgroundColor: '#000000',
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  win.once('ready-to-show', () => win.show());
  win.webContents.setWindowOpenHandler(({ url: next }) => {
    void shell.openExternal(next);
    return { action: 'deny' };
  });
  await win.loadURL(url);
}

app.whenReady().then(async () => {
  loadEnv();
  const url = app.isPackaged ? await startPackagedApi() : DEV_URL;
  await createWindow(url);
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) void createWindow(url);
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
