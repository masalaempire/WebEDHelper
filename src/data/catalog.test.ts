import { expect, it } from 'vitest';
import { CATEGORIES } from '../types';
import { resources, resourceById, tasks } from './catalog';
import { validURL } from '../lib/storage';
it('keeps a distinct, complete resource catalog and valid task references', () => {
  expect(resources.length).toBeGreaterThanOrEqual(40); expect(resources.length).toBeLessThanOrEqual(60);
  expect(new Set(resources.map(r => r.id)).size).toBe(resources.length);
  expect(new Set(resources.map(r => r.url)).size).toBe(resources.length);
  for (const resource of resources) {
    expect(validURL(resource.url)).toBe(true);
    expect(resource.name.trim()).not.toBe('');
    expect(resource.description.trim()).not.toBe('');
    expect(resource.categories.length).toBeGreaterThan(0);
    expect(resource.categories.every(c => CATEGORIES.includes(c))).toBe(true);
  }
  for (const category of CATEGORIES) expect(resources.some(r => r.categories.includes(category))).toBe(true);
  expect(tasks.length).toBeGreaterThanOrEqual(12); expect(tasks.length).toBeLessThanOrEqual(16);
  for (const task of tasks) { expect(resourceById.has(task.resourceId)).toBe(true); expect(validURL(task.url)).toBe(true); }
});
