import { Scriptures } from './scripture-types';
import { idbGet, idbSet } from './idb';

const SCRIPTURES_URL = '/data/scriptures.json';
const CACHE_KEY = 'scriptures-cache-v1';

let cache: Promise<Scriptures> | null = null;

async function fetchAndCache(): Promise<Scriptures> {
  const r = await fetch(SCRIPTURES_URL);
  if (!r.ok) throw new Error('Failed to load scriptures');
  const data = (await r.json()) as Scriptures;
  // Persist for offline use.
  idbSet(CACHE_KEY, data);
  return data;
}

export function loadScriptures(): Promise<Scriptures> {
  if (!cache) {
    cache = (async () => {
      // Try network first; on failure fall back to cached copy.
      try {
        return await fetchAndCache();
      } catch (err) {
        const cached = await idbGet<Scriptures>(CACHE_KEY);
        if (cached) return cached;
        throw err;
      }
    })();
  }
  return cache;
}
