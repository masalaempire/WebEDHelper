import type { Category, Resource } from '../types';
export interface Filters { query: string; categories: Category[]; favoritesOnly: boolean; sort: 'favorites' | 'alphabetical' }
export const initialFilters: Filters = { query: '', categories: [], favoritesOnly: false, sort: 'favorites' };
export function matchesQuery(item: { name: string; description: string; categories: readonly string[]; tags: string[]; keywords?: string[] }, query: string) {
  const haystack = [item.name, item.description, ...item.categories, ...item.tags, ...(item.keywords ?? [])].join(' ').toLocaleLowerCase();
  return query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean).every(term => haystack.includes(term));
}
export function filterResources(resources: Resource[], filters: Filters, favorites: string[]) {
  const favoriteSet = new Set(favorites);
  return resources.filter(item =>
    matchesQuery(item, filters.query) &&
    (!filters.categories.length || filters.categories.some(category => item.categories.includes(category))) &&
    (!filters.favoritesOnly || favoriteSet.has(item.id))
  ).sort((a, b) =>
    (filters.sort === 'favorites' ? Number(favoriteSet.has(b.id)) - Number(favoriteSet.has(a.id)) : 0) ||
    a.name.localeCompare(b.name)
  );
}
