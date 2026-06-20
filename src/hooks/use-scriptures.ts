import { useEffect, useState } from 'react';
import { Scriptures } from '@/lib/scripture-types';
import { loadScriptures } from '@/lib/scripture-loader';

// Module-level cache so navigating between routes shows scripture instantly
// — no "Loading…" flash after the first read in a session.
let cached: Scriptures | null = null;

export function useScriptures() {
  const [data, setData] = useState<Scriptures | null>(cached);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    if (cached) return;
    loadScriptures()
      .then((d) => {
        cached = d;
        if (alive) setData(d);
      })
      .catch((e) => alive && setError(e?.message ?? 'Error'));
    return () => {
      alive = false;
    };
  }, []);
  return { data, error, loading: !data && !error };
}

