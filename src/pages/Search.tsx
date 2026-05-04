import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppShell } from '@/components/AppShell';
import { PageHeader } from '@/components/PageHeader';
import { useScriptures } from '@/hooks/use-scriptures';
import { Search as SearchIcon } from 'lucide-react';

type Hit = { book: string; chapter: number; verse: number; text: string };

const Search = () => {
  const { data, loading } = useScriptures();
  const [q, setQ] = useState('');

  const hits = useMemo<Hit[]>(() => {
    const term = q.trim().toLowerCase();
    if (!data || term.length < 3) return [];
    const out: Hit[] = [];
    outer: for (const b of data.books) {
      for (let ci = 0; ci < b.chapters.length; ci++) {
        const ch = b.chapters[ci];
        for (let vi = 0; vi < ch.length; vi++) {
          const t = ch[vi];
          if (t.toLowerCase().includes(term)) {
            out.push({ book: b.name, chapter: ci + 1, verse: vi + 1, text: t });
            if (out.length >= 200) break outer;
          }
        }
      }
    }
    return out;
  }, [data, q]);

  const highlight = (t: string) => {
    if (q.trim().length < 3) return t;
    const re = new RegExp(`(${q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'ig');
    const parts = t.split(re);
    return parts.map((p, i) =>
      re.test(p) && i % 2 === 1 ? (
        <mark key={i} className="rounded bg-accent/40 px-0.5 text-accent-foreground">
          {p}
        </mark>
      ) : (
        <span key={i}>{p}</span>
      ),
    );
  };

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

      {loading && <p className="pt-6 text-muted-foreground">Loading…</p>}
      {!loading && q.trim().length >= 3 && (
        <p className="px-1 pt-2 text-xs text-muted-foreground">
          {hits.length === 200 ? '200+' : hits.length} result{hits.length === 1 ? '' : 's'}
        </p>
      )}

      <ul className="space-y-2 pt-2">
        {hits.map((h, i) => (
          <li key={i}>
            <Link
              to={`/read/${encodeURIComponent(h.book)}/${h.chapter}?q=${encodeURIComponent(q.trim())}&v=${h.verse}`}
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
