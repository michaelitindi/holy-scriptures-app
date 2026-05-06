import { useEffect, useState } from 'react';
import { Scriptures } from '@/lib/scripture-types';
import { getOrBuildIndex, SearchIndex } from '@/lib/search-index';

export function useSearchIndex(data: Scriptures | null) {
  const [index, setIndex] = useState<SearchIndex | null>(null);
  const [building, setBuilding] = useState(false);

  useEffect(() => {
    if (!data) return;
    let alive = true;
    setBuilding(true);
    getOrBuildIndex(data)
      .then((i) => {
        if (alive) setIndex(i);
      })
      .finally(() => {
        if (alive) setBuilding(false);
      });
    return () => {
      alive = false;
    };
  }, [data]);

  return { index, building };
}
