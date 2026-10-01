import { describe, expect, it } from 'vitest';
import { emptyState, parseState, readState, validURL, writeState } from './storage';
describe('saved data', () => {
  it('preserves ship-build URL fragments and queries', () => {
    const state = emptyState();
    state.bookmarks.push({ id: 'build', name: 'Mandalay', url: 'https://edsy.org/?build=one#ship=two', description: '', categories: ['Ships'], tags: ['range'] });
    expect(parseState(JSON.stringify(state))).toEqual(state);
  });
  it('accepts web URLs and rejects executable or local schemes', () => {
    expect(validURL('https://edsy.org/#build')).toBe(true);
    expect(validURL('http://example.com/')).toBe(true);
    for (const value of ['javascript:alert(1)', 'file:///etc/passwd', 'data:text/html,test', 'not a url']) expect(validURL(value)).toBe(false);
  });
  it('recovers from malformed JSON and invalid stored records', () => {
    for (const value of ['{broken', JSON.stringify({ ...emptyState(), bookmarks: [{ name: 'bad' }] }), JSON.stringify({ ...emptyState(), version: 99 })]) {
      const result = readState({ getItem: () => value });
      expect(result.state).toEqual(emptyState());
      expect(result.warning).toContain('could not be read');
    }
  });
  it('handles unavailable reads and full storage without crashing', () => {
    expect(readState({ getItem: () => { throw new Error('denied'); } }).warning).toBeTruthy();
    expect(writeState({ setItem: () => { throw new Error('quota'); } }, emptyState())).toContain('could not save');
  });
});
