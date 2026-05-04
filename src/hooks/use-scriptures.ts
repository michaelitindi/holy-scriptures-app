import { useEffect, useState } from 'react';
import { Scriptures } from '@/lib/scripture-types';
import { loadScriptures } from '@/lib/scripture-loader';

export function useScriptures() {
  const [data, setData] = useState<Scriptures | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    loadScriptures()
      .then((d) => alive && setData(d))
      .catch((e) => alive && setError(e?.message ?? 'Error'));
    return () => {
      alive = false;
    };
  }, []);
  return { data, error, loading: !data && !error };
}
