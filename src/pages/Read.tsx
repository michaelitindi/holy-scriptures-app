import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { AppShell } from '@/components/AppShell';
import { PageHeader } from '@/components/PageHeader';
import { useScriptures } from '@/hooks/use-scriptures';
import { useTheme } from '@/components/theme-provider';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { ChevronLeft, ChevronRight, Minus, Plus, List } from 'lucide-react';

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

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

  const go = (delta: number) => {
    const next = chapterNum + delta;
    if (next >= 1 && next <= totalChapters && bookObj)
      navigate(`/read/${encodeURIComponent(bookObj.name)}/${next}`);
  };

  return (
    <AppShell
      header={
        <PageHeader
          title={bookObj?.name ?? book}
          subtitle={bookObj ? `Chapter ${chapterNum} of ${totalChapters}` : undefined}
          back="/"
          right={
            <>
              <button
                onClick={() => setFontSize(Math.max(14, fontSize - 1))}
                className="rounded-full p-2 text-muted-foreground hover:bg-secondary"
                aria-label="Decrease font size"
              >
                <Minus className="h-4 w-4" />
              </button>
              <button
                onClick={() => setFontSize(Math.min(28, fontSize + 1))}
                className="rounded-full p-2 text-muted-foreground hover:bg-secondary"
                aria-label="Increase font size"
              >
                <Plus className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPickerOpen((v) => !v)}
                className="rounded-full p-2 text-muted-foreground hover:bg-secondary"
                aria-label="Choose chapter"
              >
                <List className="h-4 w-4" />
              </button>
            </>
          }
        />
      }
    >
      {loading && <p className="pt-8 text-muted-foreground">Loading…</p>}
      {error && <p className="pt-8 text-destructive">{error}</p>}
      {!loading && !bookObj && (
        <p className="pt-8 text-muted-foreground">Book not found.</p>
      )}

      {pickerOpen && bookObj && (
        <div className="my-4 rounded-xl border border-border bg-card p-3 shadow-soft">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Chapter
          </p>
          <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-8">
            {Array.from({ length: totalChapters }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => {
                  setPickerOpen(false);
                  navigate(`/read/${encodeURIComponent(bookObj.name)}/${n}`);
                }}
                className={`rounded-md py-2 text-sm font-medium transition-colors ${
                  n === chapterNum
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      )}

      {bookObj && (
        <article
          className="font-scripture pt-6 leading-[1.8] text-foreground"
          style={{ fontSize: `${fontSize}px` }}
        >
          <h2 className="mb-4 text-center text-3xl font-semibold gold-text">
            Chapter {chapterNum}
          </h2>
          <div>
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

          <div className="mt-10 flex items-center justify-between border-t border-border pt-5">
            <button
              onClick={() => go(-1)}
              disabled={chapterNum <= 1}
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
      )}
    </AppShell>
  );
};

export default Read;
