import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { Automation, Chat, Settings, Workspace } from '../types';

interface NeoDB extends DBSchema {
  chats: { key: string; value: Chat };
  workspaces: { key: string; value: Workspace };
  settings: { key: 'profile'; value: Settings };
  automations: { key: string; value: Automation };
}

let dbPromise: Promise<IDBPDatabase<NeoDB>> | null = null;

function db() {
  if (!dbPromise) {
    dbPromise = openDB<NeoDB>('neo-chat', 1, {
      upgrade(database) {
        database.createObjectStore('chats', { keyPath: 'id' });
        database.createObjectStore('workspaces', { keyPath: 'id' });
        database.createObjectStore('settings');
        database.createObjectStore('automations', { keyPath: 'id' });
      },
    });
  }
  return dbPromise;
}

export async function getAllChats() {
  return (await db()).getAll('chats');
}

export async function putChat(chat: Chat) {
  await (await db()).put('chats', chat);
}

export async function deleteChat(id: string) {
  await (await db()).delete('chats', id);
}

export async function getAllWorkspaces() {
  return (await db()).getAll('workspaces');
}

export async function putWorkspace(workspace: Workspace) {
  await (await db()).put('workspaces', workspace);
}

export async function deleteWorkspace(id: string) {
  await (await db()).delete('workspaces', id);
}

export async function getSettings() {
  return (await db()).get('settings', 'profile');
}

export async function putSettings(settings: Settings) {
  await (await db()).put('settings', settings, 'profile');
}

export async function getAllAutomations() {
  return (await db()).getAll('automations');
}

export async function putAutomation(automation: Automation) {
  await (await db()).put('automations', automation);
}

export async function deleteAutomation(id: string) {
  await (await db()).delete('automations', id);
}
