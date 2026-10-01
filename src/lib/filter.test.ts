import { describe, expect, it } from 'vitest';
import { resources } from '../data/catalog';
import { filterResources, initialFilters, matchesQuery } from './filter';
describe('resource discovery', () => {
  it('matches all terms across fields while ignoring case and whitespace', () => {
    const result = filterResources(resources, { ...initialFilters, query: '  CARRIER   TRITIUM  ' }, []);
    expect(result.map(r => r.id)).toContain('spansh');
    expect(result.map(r => r.id)).toContain('inara');
    expect(result.map(r => r.id)).not.toContain('edsy');
  });
  it('combines category OR with search and favorite AND', () => {
    const result = filterResources(resources, { ...initialFilters, query: 'engineering', categories: ['Ships', 'Mining'], favoritesOnly: true }, ['edsy', 'edtools']);
    expect(result.map(r => r.id)).toEqual(['edsy']);
  });
  it('pins favorites before alphabetic resources and can switch ordering', () => {
    expect(filterResources(resources, initialFilters, ['spansh'])[0].id).toBe('spansh');
    const alphabetic = filterResources(resources, { ...initialFilters, sort: 'alphabetical' }, ['spansh']);
    expect(alphabetic[0].id).toBe('axi');
  });
  it('returns an empty result for an unknown term', () => {
    expect(filterResources(resources, { ...initialFilters, query: 'zz-unfindable-zz' }, [])).toEqual([]);
  });
  it('searches custom bookmark tags', () => {
    expect(matchesQuery({ name: 'My build', description: '', categories: [], tags: ['Mandalay'] }, 'mandalay')).toBe(true);
  });
});
