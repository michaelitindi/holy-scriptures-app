import { Scriptures } from './scripture-types';

let cache: Promise<Scriptures> | null = null;

export function loadScriptures(): Promise<Scriptures> {
  if (!cache) {
    cache = fetch('/data/scriptures.json').then((r) => {
      if (!r.ok) throw new Error('Failed to load scriptures');
      return r.json();
    });
  }
  return cache;
}
