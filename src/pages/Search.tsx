import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppShell } from '@/components/AppShell';
import { PageHeader } from '@/components/PageHeader';
import { useScriptures } from '@/hooks/use-scriptures';
import { useSearchIndex } from '@/hooks/use-search-index';
import { searchIndex } from '@/lib/search-index';
import { Search as SearchIcon } from 'lucide-react';

// Maps Roman-numeral prefixes used in our data to Arabic numbers (and vice-versa).
const ROMAN_TO_ARABIC: Record<string, string> = { 'i': '1', 'ii': '2', 'iii': '3' };
const ARABIC_TO_ROMAN: Record<string, string> = { '1': 'I', '2': 'II', '3': 'III' };

/** Convert a stored book name like "I Samuel" to "1 Samuel" for display. */
function displayBookName(name: string): string {
  return name.replace(/^(I{1,3})\s+/, (_, roman) => {
    const arabic = ROMAN_TO_ARABIC[roman.toLowerCase()];
    return arabic ? `${arabic} ` : `${roman} `;
  });
}

/** Given a user query like "1 sam" produce variants that also cover Roman-numeral prefixes. */
function bookQueryVariants(raw: string): string[] {
  const norm = raw.toLowerCase().replace(/[\s.]/g, '');
  const romanised = norm.replace(/^(\d)/, (_, d) => (ARABIC_TO_ROMAN[d] ?? d).toLowerCase());
  return Array.from(new Set([norm, romanised]));
}

const Search = () => {
  const { data, loading } = useScriptures();
  const { index, building } = useSearchIndex(data);
  const [q, setQ] = useState('');

  const hits = useMemo(() => {
    const term = q.trim();
    if (!data || term.length < 3) return [];

    // Parse citation reference: e.g., "Gen 1:1" or "Genesis 1" or "1 John 3:16"
    const refRegex = /^(\d?\s*[a-zA-Z\s\.\-]+?)\s*(\d+)(?:\s*[\:\s]\s*(\d+))?$/;
    const match = term.match(refRegex);

    if (match) {
      const variants = bookQueryVariants(match[1]);
      const chapter = parseInt(match[2], 10);
      const verse = match[3] ? parseInt(match[3], 10) : null;

      const book = data.books.find((b) => {
        const normName = b.name.toLowerCase().replace(/[\s.]/g, '');
        return variants.some((v) => normName.startsWith(v) || normName.includes(v));
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
          return chVerses.map((vText, idx) => ({
            book: book.name,
            chapter,
            verse: idx + 1,
            text: vText
          }));
        }
      }
    }

    // If index isn't ready or built yet, perform an immediate in-memory substring scan.
    // This makes sure searches are extremely comprehensive and return results right away.
    if (!index) {
      const fallbackHits: any[] = [];
      const lowerQuery = term.toLowerCase();
      outerFallback: for (let bi = 0; bi < data.books.length; bi++) {
        const b = data.books[bi];
        for (let ci = 0; ci < b.chapters.length; ci++) {
          const ch = b.chapters[ci];
          for (let vi = 0; vi < ch.length; vi++) {
            if (ch[vi].toLowerCase().includes(lowerQuery)) {
              fallbackHits.push({ book: b.name, chapter: ci + 1, verse: vi + 1, text: ch[vi] });
              if (fallbackHits.length >= 200) break outerFallback;
            }
          }
        }
      }
      return fallbackHits;
    }

    return searchIndex(index, data, term, 200);
  }, [data, index, q]);

  const highlight = (t: string) => {
    const term = q.trim();
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

  const showStatus = !loading && q.trim().length >= 3;

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
                {displayBookName(h.book)} {h.chapter}:{h.verse}
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
