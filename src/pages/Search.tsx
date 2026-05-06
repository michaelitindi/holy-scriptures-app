import { useDeferredValue, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppShell } from '@/components/AppShell';
import { PageHeader } from '@/components/PageHeader';
import { useScriptures } from '@/hooks/use-scriptures';
import { useSearchIndex } from '@/hooks/use-search-index';
import { searchIndex } from '@/lib/search-index';
import { Search as SearchIcon } from 'lucide-react';

const Search = () => {
  const { data, loading } = useScriptures();
  const { index, building } = useSearchIndex(data);
  const [q, setQ] = useState('');
  const deferredQ = useDeferredValue(q);

  const hits = useMemo(() => {
    const term = deferredQ.trim();
    if (!data || !index || term.length < 3) return [];
    return searchIndex(index, data, term, 200);
  }, [data, index, deferredQ]);

  const highlight = (t: string) => {
    const term = deferredQ.trim();
    if (term.length < 3) return t;
    const re = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'ig');
    const parts = t.split(re);
    return parts.map((p, i) =>
      i % 2 === 1 ? (
        <mark key={i} className="rounded bg-accent/40 px-0.5 text-accent-foreground">
          {p}
        </mark>
      ) : (
        <span key={i}>{p}</span>
      ),
    );
  };

  const showStatus = !loading && deferredQ.trim().length >= 3;

  return (
    <AppShell header={<PageHeader title="Search" subtitle="Across all scriptures" back="/" />}>
      <div className="sticky top-[60px] z-20 -mx-4 bg-background/85 px-4 pb-3 pt-3 backdrop-blur-md">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search verses (3+ characters)…"
            className="w-full rounded-full border border-border bg-card py-3 pl-10 pr-4 text-base text-foreground shadow-soft outline-none focus:border-primary"
          />
        </div>
      </div>

      {loading && <p className="pt-6 text-muted-foreground">Loading scriptures…</p>}
      {!loading && building && !index && (
        <p className="pt-6 text-muted-foreground">Preparing offline search index…</p>
      )}
      {showStatus && (
        <p className="px-1 pt-2 text-xs text-muted-foreground">
          {hits.length === 200 ? '200+' : hits.length} result{hits.length === 1 ? '' : 's'}
          {index ? ' · offline' : ''}
        </p>
      )}

      <ul className="space-y-2 pt-2">
        {hits.map((h, i) => (
          <li key={i}>
            <Link
              to={`/read/${encodeURIComponent(h.book)}/${h.chapter}?q=${encodeURIComponent(deferredQ.trim())}&v=${h.verse}`}
              className="block rounded-xl border border-border bg-card p-3 shadow-soft transition-colors hover:border-primary/40"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                {h.book} {h.chapter}:{h.verse}
              </p>
              <p className="font-scripture mt-1 text-base leading-snug text-foreground">
                {highlight(h.text)}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </AppShell>
  );
};

export default Search;
