import { CATEGORIES } from '../types';
import type { Bookmark, SavedState } from '../types';
export const STORAGE_KEY = 'mini-elite-helper:v1';
export function emptyState(): SavedState { return { version: 1, favorites: [], bookmarks: [], theme: 'system' }; }
export function validURL(value: string) {
  try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) && Boolean(url.hostname); }
  catch { return false; }
}
export function validBookmark(value: unknown): value is Bookmark {
  if (!value || typeof value !== 'object') return false;
  const b = value as Bookmark;
  return typeof b.id === 'string' && typeof b.name === 'string' && Boolean(b.name.trim()) &&
    typeof b.url === 'string' && validURL(b.url) && typeof b.description === 'string' &&
    Array.isArray(b.categories) && b.categories.every(c => CATEGORIES.includes(c)) &&
    Array.isArray(b.tags) && b.tags.every(t => typeof t === 'string');
}
export function parseState(raw: string | null): SavedState {
  if (!raw) return emptyState();
  const value = JSON.parse(raw);
  if (!value || value.version !== 1 || !Array.isArray(value.favorites) ||
    !value.favorites.every((id: unknown) => typeof id === 'string') ||
    !Array.isArray(value.bookmarks) || !value.bookmarks.every(validBookmark) ||
    !['system', 'light', 'dark'].includes(value.theme)) throw new Error('Invalid saved data');
  return { ...value, favorites: [...new Set<string>(value.favorites)] };
}
export function readState(storage: Pick<Storage, 'getItem'>): { state: SavedState; warning: string } {
  try { return { state: parseState(storage.getItem(STORAGE_KEY)), warning: '' }; }
  catch { return { state: emptyState(), warning: 'Your saved data could not be read. You can keep browsing; new changes will start a fresh collection.' }; }
}
export function writeState(storage: Pick<Storage, 'setItem'>, state: SavedState): string {
  try { storage.setItem(STORAGE_KEY, JSON.stringify(state)); return ''; }
  catch { return 'Changes are available for this visit, but this browser could not save them.'; }
}
