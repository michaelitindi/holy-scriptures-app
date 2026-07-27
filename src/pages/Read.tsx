import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { AppShell } from '@/components/AppShell';
import { PageHeader } from '@/components/PageHeader';
import { useScriptures } from '@/hooks/use-scriptures';
import { useTheme } from '@/components/theme-provider';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { ChevronLeft, ChevronRight, Minus, Plus, List } from 'lucide-react';

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const displayBookName = (name: string): string => {
  const parts = name.split(' ');
  if (parts[0] === 'I') return `1 ${parts.slice(1).join(' ')}`;
  if (parts[0] === 'II') return `2 ${parts.slice(1).join(' ')}`;
  if (parts[0] === 'III') return `3 ${parts.slice(1).join(' ')}`;
  return name;
};

const Read = () => {
  const { book = '', chapter = '1' } = useParams();
  const chapterNum = Math.max(1, parseInt(chapter, 10) || 1);
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const query = (params.get('q') ?? '').trim();
  const targetVerse = parseInt(params.get('v') ?? '', 10);
  const { data, loading, error } = useScriptures();
  const { fontSize, setFontSize } = useTheme();
  const [, setLast] = useLocalStorage('hs-last-read', { book: 'Genesis', chapter: 1 });
  const [pickerOpen, setPickerOpen] = useState(false);
  const verseRefs = useRef<Record<number, HTMLSpanElement | null>>({});

  const bookObj = useMemo(
    () => data?.books.find((b) => b.name === book) ?? null,
    [data, book],
  );

  useEffect(() => {
    if (bookObj) setLast({ book: bookObj.name, chapter: chapterNum });
  }, [bookObj, chapterNum, setLast]);

  useEffect(() => {
    if (!bookObj) return;
    if (Number.isFinite(targetVerse) && targetVerse > 0) {
      const el = verseRefs.current[targetVerse];
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
    }
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [bookObj, chapterNum, targetVerse]);

  const highlightRe = useMemo(
    () => (query.length >= 2 ? new RegExp(`(${escapeRegExp(query)})`, 'ig') : null),
    [query],
  );

  const renderVerse = (text: string) => {
    if (!highlightRe) return text;
    const parts = text.split(highlightRe);
    return parts.map((p, i) =>
      i % 2 === 1 ? (
        <mark
          key={i}
          className="rounded bg-accent/40 px-0.5 text-accent-foreground"
        >
          {p}
        </mark>
      ) : (
        <span key={i}>{p}</span>
      ),
    );
  };

  const verses = bookObj?.chapters[chapterNum - 1] ?? [];
  const totalChapters = bookObj?.chapters.length ?? 0;
  const firstChapter = bookObj?.name === 'Additions to Esther' ? 10 : 1;

  const go = (dir: number) => {
    const next = chapterNum + dir;
    if (next >= firstChapter && next <= totalChapters && bookObj) {
      navigate(`/read/${encodeURIComponent(bookObj.name)}/${next}`);
    }
  };

  return (
    <AppShell
      header={
        <PageHeader
          title={bookObj ? displayBookName(bookObj.name) : book}
          subtitle={
            bookObj 
              ? bookObj.name === 'Additions to Esther'
                ? `Chapter ${chapterNum} of 10-16`
                : `Chapter ${chapterNum} of ${totalChapters}` 
              : undefined
          }
          back={bookObj ? `/?book=${encodeURIComponent(bookObj.name)}` : '/'}
          right={
            <div className="flex items-center gap-1.5 select-none">
              <button
                onClick={() => go(-1)}
                disabled={chapterNum <= firstChapter}
                className="rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold text-secondary-foreground hover:bg-secondary/80 disabled:opacity-40 transition-colors"
              >
                Prev
              </button>
              <button
                onClick={() => go(1)}
                disabled={chapterNum >= totalChapters}
                className="rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold text-secondary-foreground hover:bg-secondary/80 disabled:opacity-40 transition-colors"
              >
                Next
              </button>
            </div>
          }
        />
      }
    >
      {loading && <p className="pt-8 text-muted-foreground">Loading…</p>}
      {error && <p className="pt-8 text-destructive">{error}</p>}
      {!loading && !bookObj && (
        <p className="pt-8 text-muted-foreground">Book not found.</p>
      )}

      {bookObj && (
        <div className="w-full pt-6">
          <article className="font-scripture pt-6 leading-[1.8] text-foreground" style={{ fontSize: `${fontSize}px` }}>
            <h2 className="mb-4 text-center text-3xl font-semibold gold-text">
              Chapter {chapterNum}
            </h2>
            <div className="select-text">
              {verses.map((v, i) => {
                const num = i + 1;
                const isTarget = num === targetVerse;
                return (
                  <span
                    key={i}
                    ref={(el) => (verseRefs.current[num] = el)}
                    className={
                      isTarget
                        ? 'rounded-md bg-accent/15 px-1 py-0.5 ring-1 ring-accent/40'
                        : undefined
                    }
                  >
                    <sup className="verse-num">{num}</sup>
                    {renderVerse(v)}{' '}
                  </span>
                );
              })}
            </div>

            <div className="mt-10 flex items-center justify-between border-t border-border pt-5 select-none">
              <button
                onClick={() => go(-1)}
                disabled={chapterNum <= firstChapter}
                className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" /> Previous
              </button>
              <button
                onClick={() => go(1)}
                disabled={chapterNum >= totalChapters}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-40"
              >
                Next <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </article>
        </div>
      )}
    </AppShell>
  );
};

export default Read;
