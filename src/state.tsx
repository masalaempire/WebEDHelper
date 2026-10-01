import { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { Bookmark, SavedState } from './types';
import { emptyState, readState, STORAGE_KEY, writeState } from './lib/storage';
function initialSnapshot() {
  try { return readState(window.localStorage); }
  catch { return { state: emptyState(), warning: 'Browser storage is unavailable. Changes will last for this visit.' }; }
}
interface AppContext {
  state: SavedState; warning: string;
  toggleFavorite: (id: string) => void;
  saveBookmark: (bookmark: Bookmark) => void;
  deleteBookmark: (id: string) => void;
  setTheme: (theme: SavedState['theme']) => void;
}
const Context = createContext<AppContext | null>(null);
export function AppProvider({ children }: { children: ReactNode }) {
  const [snapshot, setSnapshot] = useState(initialSnapshot);
  const current = useRef(snapshot.state);
  function update(transform: (state: SavedState) => SavedState) {
    const next = transform(current.current);
    current.current = next;
    let warning = '';
    try { warning = writeState(window.localStorage, next); }
    catch { warning = 'Changes are available for this visit, but this browser could not save them.'; }
    setSnapshot({ state: next, warning });
  }
  useEffect(() => {
    const media = matchMedia('(prefers-color-scheme: dark)');
    const apply = () => { document.documentElement.dataset.theme = snapshot.state.theme === 'system' ? (media.matches ? 'dark' : 'light') : snapshot.state.theme; };
    apply();
    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, [snapshot.state.theme]);
  useEffect(() => {
    const sync = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY && event.key !== null) return;
      const next = initialSnapshot(); current.current = next.state; setSnapshot(next);
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);
  return <Context.Provider value={{
    state: snapshot.state, warning: snapshot.warning,
    toggleFavorite: id => update(s => ({ ...s, favorites: s.favorites.includes(id) ? s.favorites.filter(x => x !== id) : [...s.favorites, id] })),
    saveBookmark: bookmark => update(s => ({ ...s, bookmarks: s.bookmarks.some(b => b.id === bookmark.id) ? s.bookmarks.map(b => b.id === bookmark.id ? bookmark : b) : [bookmark, ...s.bookmarks] })),
    deleteBookmark: id => update(s => ({ ...s, bookmarks: s.bookmarks.filter(b => b.id !== id) })),
    setTheme: theme => update(s => ({ ...s, theme })),
  }}>{children}</Context.Provider>;
}
export function useAppState() {
  const context = useContext(Context);
  if (!context) throw new Error('AppProvider is missing');
  return context;
}
