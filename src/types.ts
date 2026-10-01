export const CATEGORIES = [
  'Exploration', 'Exobiology', 'Routing', 'Ships', 'Engineering', 'Trading',
  'Mining', 'Combat', 'Fleet Carriers', 'Science', 'Rescue', 'Community', 'Utilities',
] as const;
export type Category = typeof CATEGORIES[number];
export type ResourceType = 'Website' | 'Guide' | 'Community' | 'Desktop tool';
export interface Resource {
  id: string; name: string; url: string; description: string;
  categories: Category[]; tags: string[]; keywords: string[]; type: ResourceType;
  checkedAt: string;
}
export interface Task {
  id: string; label: string; description: string; resourceId: string;
  url: string; categories: Category[];
}
export interface Bookmark {
  id: string; name: string; url: string; description: string;
  categories: Category[]; tags: string[];
}
export interface SavedState {
  version: 1; favorites: string[]; bookmarks: Bookmark[];
  theme: 'system' | 'light' | 'dark';
}
