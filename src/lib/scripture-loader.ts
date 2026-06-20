import { Scriptures } from './scripture-types';
import { idbGet, idbSet } from './idb';

const SCRIPTURES_URL = '/data/scriptures.json';
const CACHE_KEY = 'scriptures-cache-v1';

// Module-level in-memory cache so route changes within a session are instant.
let memory: Scriptures | null = null;
let inflight: Promise<Scriptures> | null = null;
let revalidated = false;

async function fetchFresh(): Promise<Scriptures> {
  const r = await fetch(SCRIPTURES_URL, { cache: 'no-cache' });
  if (!r.ok) throw new Error('Failed to load scriptures');
  const data = (await r.json()) as Scriptures;
  memory = data;
  idbSet(CACHE_KEY, data);
  return data;
}

function revalidateInBackground() {
  if (revalidated) return;
  revalidated = true;
  // Fire-and-forget; if it fails we keep using the cached copy.
  fetchFresh().catch(() => {
    revalidated = false;
  });
}

/**
 * Cache-first scripture loader.
 * - In-memory hit: synchronous-feeling, instant.
 * - IndexedDB hit: returns immediately, then revalidates from network in the background.
 * - Cold start: fetches from network.
 */
export function loadScriptures(): Promise<Scriptures> {
  if (memory) {
    revalidateInBackground();
    return Promise.resolve(memory);
  }
  if (inflight) return inflight;

  inflight = (async () => {
    try {
      const cached = await idbGet<Scriptures>(CACHE_KEY);
      if (cached && cached.books?.length) {
        memory = cached;
        revalidateInBackground();
        return cached;
      }
    } catch {
      /* ignore and fall through to network */
    }
    return fetchFresh();
  })();

  // Clear inflight once settled so future calls use the memory cache path.
  inflight.finally(() => {
    inflight = null;
  });
  return inflight;
}
