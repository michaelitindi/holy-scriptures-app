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
    if (!data || term.length < 3) return [];

    // Parse citation reference: e.g., "Gen 1:1" or "Genesis 1" or "1 John 3:16"
    // Regex matches: (Book Name with numbers/spaces) (Chapter Number) [optional: (separator) (Verse Number)]
    const refRegex = /^(\d?\s*[a-zA-Z\s\.\-]+?)\s*(\d+)(?:\s*[\:\s]\s*(\d+))?$/;
    const match = term.match(refRegex);

    if (match) {
      const bookQuery = match[1].toLowerCase().replace(/[\s\.]/g, '');
      const chapter = parseInt(match[2], 10);
      const verse = match[3] ? parseInt(match[3], 10) : null;

      // Find best matching book name
      // Genesis matches gen, genesis, etc. 1 John matches 1jn, 1john, etc.
      const book = data.books.find((b) => {
        const normName = b.name.toLowerCase().replace(/[\s\.]/g, '');
        return normName.startsWith(bookQuery) || normName.includes(bookQuery);
      });

      if (book && chapter >= 1 && chapter <= book.chapters.length) {
        const chVerses = book.chapters[chapter - 1];
        if (verse !== null) {
          if (verse >= 1 && verse <= chVerses.length) {
            return [{
              book: book.name,
              chapter,
              verse,
              text: chVerses[verse - 1]
            }];
          }
        } else {
          // If no verse specified, return all verses of that chapter
          return chVerses.map((vText, idx) => ({
            book: book.name,
            chapter,
            verse: idx + 1,
            text: vText
          }));
        }
      }
    }

    // Fallback to standard tokenized search index
    if (!index) return [];
    return searchIndex(index, data, term, 200);
  }, [data, index, deferredQ]);

  const highlight = (t: string) => {
    const term = deferredQ.trim();
    if (term.length < 3) return t;
    
    // If it's a citation query, we don't highlight generic chapter/verse numbers
    if (/^\d?\s*[a-zA-Z\s\.\-]+?\s*\d+(?:\s*[\:\s]\s*\d+)?$/.test(term)) {
      return t;
    }

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
            placeholder="Search across all scriptures..."
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

      <ul className="space-y-3 pt-2">
        {hits.map((h, i) => (
          <li key={i} className="rounded-xl border border-border bg-card p-4 shadow-soft">
            <div className="flex items-center justify-between gap-3 border-b border-border/60 pb-2">
              <p className="text-sm font-semibold uppercase tracking-wider text-primary">
                {h.book} {h.chapter}:{h.verse}
              </p>
              <Link
                to={`/read/${encodeURIComponent(h.book)}/${h.chapter}?v=${h.verse}`}
                className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-colors shrink-0"
              >
                Read Full Chapter
              </Link>
            </div>
            <p className="font-scripture mt-3 text-base leading-relaxed text-foreground select-text">
              {highlight(h.text)}
            </p>
          </li>
        ))}
      </ul>
    </AppShell>
  );
};

export default Search;
