import { useEffect, useRef, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { Link, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Bookmark as BookmarkIcon, Check, Compass, Download, Globe, LifeBuoy, Moon, Pencil, Plus, Search, SlidersHorizontal, Star, Sun, Trash2, X } from 'lucide-react';
import { CATEGORIES } from './types';
import type { Bookmark, Category, Resource } from './types';
import { resources, resourceById, tasks } from './data/catalog';
import { filterResources, initialFilters, matchesQuery } from './lib/filter';
import type { Filters } from './lib/filter';
import { validURL } from './lib/storage';
import { useAppState } from './state';

function ExternalLink({ url, children, className = '', label }: { url: string; children: ReactNode; className?: string; label?: string }) {
  return <a href={url} target="_blank" rel="noopener noreferrer" className={className} aria-label={label}>{children}<ArrowUpRight size={15} aria-hidden="true" /></a>;
}
function ResourceCard({ resource }: { resource: Resource }) {
  const { state, toggleFavorite } = useAppState();
  const favorite = state.favorites.includes(resource.id);
  const initials = resource.name.replace(/^r\//, '').split(/[\s:-]+/).slice(0, 2).map(word => word[0]).join('').toUpperCase();
  return <article className="resource-card" data-testid="resource-card">
    <div className="card-top">
      <div className={'lettermark tone-' + (resource.id.length % 5)} aria-hidden="true">{initials}</div>
      <span className="resource-type">{resource.type === 'Desktop tool' && <Download size={12} aria-hidden="true" />}{resource.type}</span>
      <button className={'icon-button favorite-button' + (favorite ? ' is-favorite' : '')} onClick={() => toggleFavorite(resource.id)} aria-label={(favorite ? 'Remove ' : 'Save ') + resource.name + (favorite ? ' from favorites' : ' to favorites')} aria-pressed={favorite}><Star size={18} fill={favorite ? 'currentColor' : 'none'} aria-hidden="true" /></button>
    </div>
    <h3>{resource.name}</h3>
    <p>{resource.description}</p>
    <div className="card-tags">{resource.categories.slice(0, 3).map(category => <span key={category}>{category}</span>)}{resource.categories.length > 3 && <span title={resource.categories.slice(3).join(', ')}>+{resource.categories.length - 3}</span>}</div>
    <div className="card-bottom"><span className="domain">{new URL(resource.url).hostname.replace(/^www\./, '')}</span><ExternalLink url={resource.url} className="open-link" label={'Open ' + resource.name + ' (new tab)'}>Open</ExternalLink></div>
  </article>;
}
function EmptyState({ title, description, children }: { title: string; description: string; children?: ReactNode }) {
  return <div className="empty-state"><Compass size={30} aria-hidden="true" /><h3>{title}</h3><p>{description}</p>{children}</div>;
}
function CategoryPicker({ selected, onChange, counts, label = 'Categories' }: { selected: Category[]; onChange: (categories: Category[]) => void; counts?: Map<Category, number>; label?: string }) {
  return <div className="category-list" role="group" aria-label={label}>
    <button className={'category-option' + (!selected.length ? ' selected' : '')} onClick={() => onChange([])} aria-pressed={!selected.length}><Globe size={16} aria-hidden="true" /><span>All resources</span>{counts && <span className="count">{resources.length}</span>}</button>
    {CATEGORIES.map(category => <button key={category} className={'category-option' + (selected.includes(category) ? ' selected' : '')} onClick={() => onChange(selected.includes(category) ? selected.filter(c => c !== category) : [...selected, category])} aria-pressed={selected.includes(category)}><span className="category-dot" aria-hidden="true" /><span>{category}</span>{counts && <span className="count">{counts.get(category) ?? 0}</span>}</button>)}
  </div>;
}
function Directory() {
  const { state } = useAppState();
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [mobileFilters, setMobileFilters] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const filtered = filterResources(resources, filters, state.favorites);
  const counts = new Map(CATEGORIES.map(category => [category, resources.filter(r => r.categories.includes(category)).length]));
  const active = Boolean(filters.query.trim() || filters.categories.length || filters.favoritesOnly);
  function reset() { setFilters(initialFilters); searchRef.current?.focus(); }
  useEffect(() => {
    const shortcut = (event: KeyboardEvent) => {
      if (event.key === '/' && !(event.target instanceof HTMLInputElement) && !(event.target instanceof HTMLTextAreaElement) && !(event.target instanceof HTMLSelectElement)) {
        event.preventDefault(); searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', shortcut); return () => window.removeEventListener('keydown', shortcut);
  }, []);
  return <>
    <section className="hero">
      <div><div className="eyebrow"><span />ELITE DANGEROUS · COMMUNITY TOOLKIT</div><h1>Your next jump<br />starts here<span className="accent">.</span></h1><p>A whole galaxy of useful links. Find the right tool,<br className="desktop-break" /> save your favorites, and get back to flying.</p><Link to="/tools" className="text-link">Prefer to start with a task? <ArrowRight size={16} aria-hidden="true" /></Link></div>
      <aside className="rescue-card"><div className="rescue-heading"><LifeBuoy size={20} aria-hidden="true" /><span>A little help out there</span></div><p>Stranded or running low?<br />The community has your back.</p><ExternalLink url="https://fuelrats.com/" label="Fuel Rats rescue (new tab)">Fuel Rats<span>Fuel rescue</span></ExternalLink><ExternalLink url="https://hullseals.space/" label="Hull Seals rescue (new tab)">Hull Seals<span>Hull repairs</span></ExternalLink></aside>
    </section>
    <div className="directory-layout">
      <aside className={'filters-panel' + (mobileFilters ? ' mobile-open' : '')}>
        <div className="filter-title"><span>Browse by activity</span><button className="icon-button mobile-only" aria-label="Close filters" onClick={() => setMobileFilters(false)}><X size={18} /></button></div>
        <CategoryPicker selected={filters.categories} onChange={categories => setFilters({ ...filters, categories })} counts={counts} />
        <div className="sidebar-note"><BookmarkIcon size={17} aria-hidden="true" /><p>Your favorite tools,<br />one star away.</p><Link to="/saved">View saved links <ArrowRight size={13} aria-hidden="true" /></Link></div>
      </aside>
      <section className="catalog" aria-label="Resource directory">
        <div className="search-row"><label className="search-box"><Search size={19} aria-hidden="true" /><input ref={searchRef} aria-label="Search resources" type="search" value={filters.query} placeholder="Search tools, websites, and guides…" onChange={e => setFilters({ ...filters, query: e.target.value })} /><kbd aria-hidden="true">/</kbd></label><button className="secondary-button mobile-only" aria-expanded={mobileFilters} onClick={() => setMobileFilters(!mobileFilters)}><SlidersHorizontal size={17} aria-hidden="true" />Filters</button></div>
        <div className="catalog-toolbar"><p role="status" aria-live="polite"><strong>{filtered.length}</strong> {active ? 'matching' : 'curated'} resources</p><div className="toolbar-controls"><button className={'favorite-filter' + (filters.favoritesOnly ? ' selected' : '')} aria-pressed={filters.favoritesOnly} onClick={() => setFilters({ ...filters, favoritesOnly: !filters.favoritesOnly })}><Star size={15} aria-hidden="true" />Favorites only</button><label className="sort-control"><span className="sr-only">Sort resources</span><select aria-label="Sort resources" value={filters.sort} onChange={e => setFilters({ ...filters, sort: e.target.value as Filters['sort'] })}><option value="favorites">Favorites first</option><option value="alphabetical">Name: A–Z</option></select></label></div></div>
        {active && <div className="active-filters">{filters.categories.map(category => <button key={category} onClick={() => setFilters({ ...filters, categories: filters.categories.filter(c => c !== category) })}>{category}<X size={12} aria-hidden="true" /><span className="sr-only">Remove filter</span></button>)}{filters.query.trim() && <span className="query-chip">“{filters.query.trim()}”</span>}<button className="clear-filters" onClick={reset}>Clear filters</button></div>}
        {filtered.length ? <div className="resource-grid">{filtered.map(resource => <ResourceCard key={resource.id} resource={resource} />)}</div> : <EmptyState title={filters.favoritesOnly && !state.favorites.length ? 'Your favorites start with a star' : 'No resources found'} description={filters.favoritesOnly && !state.favorites.length ? 'Save a resource using its star, then find it here or on your Saved page.' : 'Try a different search or clear a category to explore more.'}><button className="secondary-button" onClick={reset}>Clear filters</button></EmptyState>}
      </section>
    </div>
  </>;
}
function Tools() {
  const [categories, setCategories] = useState<Category[]>([]);
  const visible = tasks.filter(task => !categories.length || categories.some(category => task.categories.includes(category)));
  const available = CATEGORIES.filter(category => tasks.some(t => t.categories.includes(category)));
  return <section className="page-section"><div className="page-heading"><div className="eyebrow">A SHORTCUT TO YOUR NEXT ADVENTURE</div><h1>What are we doing today?</h1><p>Start with the task. We'll point you to the right tool.</p></div><div className="activity-chips" role="group" aria-label="Filter tasks"><button aria-pressed={!categories.length} className={!categories.length ? 'selected' : ''} onClick={() => setCategories([])}>All activities</button>{available.map(category => <button key={category} aria-pressed={categories.includes(category)} className={categories.includes(category) ? 'selected' : ''} onClick={() => setCategories(categories.includes(category) ? categories.filter(c => c !== category) : [...categories, category])}>{category}</button>)}</div><p className="section-caption" role="status">{visible.length} shortcuts · Opens the provider's website</p><div className="task-grid">{visible.map(task => <article className="task-card" key={task.id}><div className="task-category"><Compass size={16} aria-hidden="true" />{task.categories[0]}</div><h2>{task.label}</h2><p>{task.description}</p><div className="task-footer"><span>{resourceById.get(task.resourceId)?.name}</span><ExternalLink url={task.url} className="open-link" label={'Open tool: ' + task.label + ' (new tab)'}>Open tool</ExternalLink></div></article>)}</div></section>;
}
function BookmarkForm({ bookmark, onClose }: { bookmark?: Bookmark; onClose: () => void }) {
  const { saveBookmark } = useAppState();
  const dialog = useRef<HTMLDialogElement>(null);
  const [name, setName] = useState(bookmark?.name ?? '');
  const [url, setURL] = useState(bookmark?.url ?? '');
  const [description, setDescription] = useState(bookmark?.description ?? '');
  const [categories, setCategories] = useState<Category[]>(bookmark?.categories ?? []);
  const [tags, setTags] = useState(bookmark?.tags.join(', ') ?? '');
  const [error, setError] = useState('');
  useEffect(() => { dialog.current?.showModal(); return () => dialog.current?.close(); }, []);
  function submit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) { setError('Give your bookmark a name.'); return; }
    if (!validURL(url.trim())) { setError('Enter a full URL beginning with https:// or http://.'); return; }
    saveBookmark({ id: bookmark?.id ?? crypto.randomUUID(), name: name.trim(), url: url.trim(), description: description.trim(), categories, tags: [...new Set(tags.split(',').map(t => t.trim()).filter(Boolean))] });
    onClose();
  }
  return <dialog ref={dialog} className="bookmark-dialog" aria-labelledby="bookmark-dialog-title" onCancel={onClose}>
    <form onSubmit={submit} noValidate><div className="dialog-header"><h2 id="bookmark-dialog-title">{bookmark ? 'Edit bookmark' : 'Save a new link'}</h2><button type="button" className="icon-button" aria-label="Close bookmark form" onClick={onClose}><X size={20} /></button></div><p className="dialog-intro">A useful website, a ship build, or a link worth keeping.</p>
    <label className="form-field">Name <span aria-hidden="true">*</span><input autoFocus required maxLength={120} value={name} onChange={e => setName(e.target.value)} placeholder="My exploration build" /></label>
    <label className="form-field">URL <span aria-hidden="true">*</span><input required type="url" value={url} onChange={e => setURL(e.target.value)} placeholder="https://…" /></label>
    <label className="form-field">Description <textarea rows={3} maxLength={600} value={description} onChange={e => setDescription(e.target.value)} placeholder="What makes this link useful?" /></label>
    <fieldset className="form-categories"><legend>Categories <span>(optional)</span></legend><div className="activity-chips">{CATEGORIES.map(category => <button type="button" key={category} aria-pressed={categories.includes(category)} className={categories.includes(category) ? 'selected' : ''} onClick={() => setCategories(categories.includes(category) ? categories.filter(c => c !== category) : [...categories, category])}>{category}</button>)}</div></fieldset>
    <label className="form-field">Tags <input value={tags} onChange={e => setTags(e.target.value)} placeholder="Mandalay, long range, exploration" /><small>Separate tags with commas.</small></label>
    {error && <p className="form-error" role="alert">{error}</p>}
    <div className="dialog-actions"><button type="button" className="secondary-button" onClick={onClose}>Cancel</button><button type="submit" className="primary-button"><Check size={16} aria-hidden="true" />Save bookmark</button></div></form>
  </dialog>;
}
function Saved() {
  const { state, deleteBookmark } = useAppState();
  const [form, setForm] = useState<{ bookmark?: Bookmark } | null>(null);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<Category | ''>('');
  const [remove, setRemove] = useState<Bookmark | null>(null);
  const [notice, setNotice] = useState('');
  const favorites = filterResources(resources, { ...initialFilters, favoritesOnly: true, query, categories: category ? [category] : [] }, state.favorites);
  const bookmarks = state.bookmarks.filter(b => matchesQuery(b, query) && (!category || b.categories.includes(category))).sort((a, b) => a.name.localeCompare(b.name));
  const filtered = Boolean(query.trim() || category);
  return <section className="page-section"><div className="page-heading saved-heading"><div><div className="eyebrow">YOUR OWN CORNER OF THE GALAXY</div><h1>Keep the good ones close.</h1><p>Favorite resources and the links you've collected along the way.</p></div><button className="primary-button" onClick={() => setForm({})}><Plus size={18} aria-hidden="true" />Add bookmark</button></div><div className="storage-note"><BookmarkIcon size={16} aria-hidden="true" /><span>Saved in this browser. Your links stay here when you come back.</span></div>
    <div className="saved-search"><label className="search-box"><Search size={18} aria-hidden="true" /><input type="search" aria-label="Search saved links" placeholder="Search your saved links…" value={query} onChange={e => setQuery(e.target.value)} /></label><select aria-label="Filter saved links by category" value={category} onChange={e => setCategory(e.target.value as Category | '')}><option value="">All categories</option>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select>{filtered && <button className="text-button" onClick={() => { setQuery(''); setCategory(''); }}>Clear filters</button>}</div>
    {notice && <p className="saved-notice" role="status">{notice}</p>}
    <div className="section-title"><h2>Favorite resources</h2><span>{favorites.length}</span><Link to="/">Explore the directory <ArrowRight size={14} aria-hidden="true" /></Link></div>
    {favorites.length ? <div className="resource-grid">{favorites.map(resource => <ResourceCard key={resource.id} resource={resource} />)}</div> : <EmptyState title={filtered ? 'No favorite resources match' : 'Your favorites start with a star'} description={filtered ? 'Try another search or category.' : 'Star a resource in the directory to keep it within easy reach.'}>{!filtered && <Link to="/" className="secondary-button">Browse resources <ArrowRight size={15} aria-hidden="true" /></Link>}</EmptyState>}
    <div className="section-title bookmarks-title"><h2>Personal bookmarks</h2><span>{bookmarks.length}</span></div>
    {bookmarks.length ? <div className="bookmark-grid">{bookmarks.map(bookmark => <article className="bookmark-card" key={bookmark.id} data-testid="bookmark-card"><div className="bookmark-card-heading"><div className="lettermark tone-1"><BookmarkIcon size={20} aria-hidden="true" /></div><div><h3>{bookmark.name}</h3><span className="domain">{new URL(bookmark.url).hostname}</span></div><div className="bookmark-controls"><button className="icon-button" aria-label={'Edit ' + bookmark.name} onClick={() => setForm({ bookmark })}><Pencil size={16} /></button><button className="icon-button" aria-label={'Delete ' + bookmark.name} onClick={() => setRemove(bookmark)}><Trash2 size={16} /></button></div></div>{bookmark.description && <p>{bookmark.description}</p>}<div className="card-tags">{[...bookmark.categories, ...bookmark.tags].map((tag, i) => <span key={tag + i}>{tag}</span>)}</div><ExternalLink url={bookmark.url} className="open-link" label={'Open bookmark ' + bookmark.name + ' (new tab)'}>Open link</ExternalLink></article>)}</div> : <EmptyState title={filtered ? 'No personal bookmarks match' : 'A place for your own discoveries'} description={filtered ? 'Try another search or category.' : 'Save your ship builds, useful guides, and other website links.'}><button className="secondary-button" onClick={() => setForm({})}><Plus size={16} aria-hidden="true" />Add a bookmark</button></EmptyState>}
    {form && <BookmarkForm bookmark={form.bookmark} onClose={() => setForm(null)} />}
    {remove && <DeleteConfirmation name={remove.name} onCancel={() => setRemove(null)} onConfirm={() => { deleteBookmark(remove.id); setNotice('Deleted “' + remove.name + '”.'); setRemove(null); }} />}
  </section>;
}
function DeleteConfirmation({ name, onCancel, onConfirm }: { name: string; onCancel: () => void; onConfirm: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => { dialog.current?.showModal(); return () => dialog.current?.close(); }, []);
  return <dialog ref={dialog} className="bookmark-dialog delete-dialog" aria-labelledby="delete-title" onCancel={onCancel}><h2 id="delete-title">Delete this bookmark?</h2><p>“{name}” will be removed from your saved links.</p><div className="dialog-actions"><button className="secondary-button" onClick={onCancel} autoFocus>Keep bookmark</button><button className="danger-button" onClick={onConfirm}>Delete bookmark</button></div></dialog>;
}
function NotFound() { return <section className="page-section"><EmptyState title="A little off course?" description="This page doesn't exist. The directory will get you back on track."><Link className="primary-button" to="/">Back to directory <ArrowRight size={16} aria-hidden="true" /></Link></EmptyState></section>; }
export default function App() {
  const { state, warning, setTheme } = useAppState();
  const location = useLocation();
  const previousPath = useRef(location.pathname);
  useEffect(() => {
    const title = location.pathname === '/tools' ? 'Tools' : location.pathname === '/saved' ? 'Saved links' : location.pathname === '/' ? 'Directory' : 'Page not found';
    document.title = title + ' · Mini Elite Helper';
    if (previousPath.current !== location.pathname) {
      previousPath.current = location.pathname;
      window.scrollTo(0, 0);
      document.getElementById('main-content')?.focus();
    }
  }, [location.pathname]);
  return <><a href="#main-content" className="skip-link">Skip to content</a><header className="site-header"><div className="header-inner"><Link to="/" className="brand" aria-label="Mini Elite Helper home"><span className="brand-mark"><Compass size={22} aria-hidden="true" /></span><span>mini elite<span className="brand-helper">helper</span></span></Link><nav aria-label="Main navigation"><NavLink to="/" end>Directory</NavLink><NavLink to="/tools">Tools</NavLink><NavLink to="/saved">Saved{state.favorites.length + state.bookmarks.length > 0 && <span className="nav-count">{state.favorites.length + state.bookmarks.length}</span>}</NavLink></nav><label className="theme-control"><span className="sr-only">Color theme</span><Sun size={16} className="light-theme-icon" aria-hidden="true" /><Moon size={16} className="dark-theme-icon" aria-hidden="true" /><select aria-label="Color theme" value={state.theme} onChange={e => setTheme(e.target.value as 'system' | 'light' | 'dark')}><option value="system">Auto</option><option value="light">Light</option><option value="dark">Dark</option></select></label></div></header><main id="main-content" tabIndex={-1} className="site-main">{warning && <div className="storage-warning" role="alert">{warning}</div>}<Routes><Route path="/" element={<Directory />} /><Route path="/tools" element={<Tools />} /><Route path="/saved" element={<Saved />} /><Route path="*" element={<NotFound />} /></Routes></main><footer className="site-footer"><span>Made for the journey. <span className="footer-o7">o7</span></span><span>A community project · Unofficial Elite Dangerous companion</span><a href="https://github.com/masalaempire/WebEDHelper" target="_blank" rel="noopener noreferrer">Contribute on GitHub <ArrowUpRight size={13} aria-hidden="true" /></a></footer></>;
}
