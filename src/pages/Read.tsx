import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { AppShell } from '@/components/AppShell';
import { PageHeader } from '@/components/PageHeader';
import { useScriptures } from '@/hooks/use-scriptures';
import { useTheme } from '@/components/theme-provider';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { ChevronLeft, ChevronRight, Bookmark, FileText, X } from 'lucide-react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter, DrawerClose } from '@/components/ui/drawer';
import { getBookmarks, getNotes, saveBookmark, removeBookmark, saveNote } from '@/lib/saved-db';
import { toast } from 'sonner';

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
  const targetVerse = parseInt(params.get('v') ?? '', 10);   // from search – scrolls + highlights
  const gotoVerse  = parseInt(params.get('goto') ?? '', 10); // from verse grid – scrolls only
  const scrollVerse = Number.isFinite(gotoVerse) && gotoVerse > 0 ? gotoVerse : targetVerse;
  const { data, loading, error } = useScriptures();
  const { fontSize } = useTheme();
  const [, setLast] = useLocalStorage('hs-last-read', { book: 'Genesis', chapter: 1 });

  const verseRefs = useRef<Record<number, HTMLSpanElement | null>>({});

  const bookObj = useMemo(
    () => data?.books.find((b) => b.name === book) ?? null,
    [data, book],
  );
  const verses = bookObj?.chapters[chapterNum - 1] ?? [];
  const totalChapters = bookObj?.chapters.length ?? 0;
  const firstChapter = bookObj?.name === 'Additions to Esther' ? 10 : 1;

  const [selectedVerse, setSelectedVerse] = useState<number | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [bookmarks, setBookmarks] = useState<Record<string, any>>({});
  const [notes, setNotes] = useState<Record<string, any>>({});

  const loadSavedData = async () => {
    const b = await getBookmarks();
    const n = await getNotes();
    setBookmarks(b);
    setNotes(n);
  };

  useEffect(() => {
    loadSavedData();
  }, [book, chapterNum]);

  useEffect(() => {
    if (selectedVerse !== null && bookObj) {
      const key = `${bookObj.name}-${chapterNum}-${selectedVerse}`;
      setIsBookmarked(!!bookmarks[key]);
      setNoteText(notes[key]?.note || '');
    }
  }, [selectedVerse, bookmarks, notes, bookObj, chapterNum]);

  useEffect(() => {
    if (bookObj) setLast({ book: bookObj.name, chapter: chapterNum });
  }, [bookObj, chapterNum, setLast]);

  useEffect(() => {
    if (!bookObj) return;
    if (Number.isFinite(scrollVerse) && scrollVerse > 0) {
      const el = verseRefs.current[scrollVerse];
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
    }
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [bookObj, chapterNum, scrollVerse]);

  const handleToggleBookmark = async () => {
    if (!bookObj || selectedVerse === null) return;
    const verseText = verses[selectedVerse - 1];
    if (isBookmarked) {
      await removeBookmark(bookObj.name, chapterNum, selectedVerse);
      setIsBookmarked(false);
      toast.success('Bookmark removed');
    } else {
      await saveBookmark(bookObj.name, chapterNum, selectedVerse, verseText);
      setIsBookmarked(true);
      toast.success('Bookmark added');
    }
    loadSavedData();
  };

  const handleSaveNote = async (text: string) => {
    if (!bookObj || selectedVerse === null) return;
    const verseText = verses[selectedVerse - 1];
    await saveNote(bookObj.name, chapterNum, selectedVerse, verseText, text);
    setNoteText(text);
    toast.success('Note saved');
    loadSavedData();
  };

  const handleCopyVerse = () => {
    if (!bookObj || selectedVerse === null) return;
    const verseText = verses[selectedVerse - 1];
    const fullText = `${displayBookName(bookObj.name)} ${chapterNum}:${selectedVerse} - "${verseText}"`;
    navigator.clipboard.writeText(fullText);
    toast.success('Verse copied to clipboard');
  };

  const highlightRe = useMemo(
    () => (query.length >= 2 ? new RegExp(`(${escapeRegExp(query)})`, 'ig') : null),
    [query],
  );

  const renderVerse = (text: string) => {
    if (!highlightRe) return text;
    const parts = text.split(highlightRe);
    return parts.map((p, i) =>
      i % 2 === 1 ? (
        <mark key={i} className="rounded bg-amber-500/30 text-amber-950 dark:text-amber-100 px-0.5 font-medium">
          {p}
        </mark>
      ) : (
        <span key={i}>{p}</span>
      ),
    );
  };

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
      {loading && <p className="pt-8 text-muted-foreground">Loading...</p>}
      {error && <p className="pt-8 text-destructive">{error}</p>}
      {!loading && !bookObj && (
        <p className="pt-8 text-muted-foreground">Book not found.</p>
      )}

      {bookObj && (
        <div className="w-full pt-6">
          <article
            className="font-scripture pt-6 leading-[1.8] text-foreground"
            style={{ fontSize: `${fontSize}px` }}
          >
            <h2 className="mb-4 text-center text-3xl font-semibold gold-text">
              Chapter {chapterNum}
            </h2>
            <div className="select-text">
              {verses.map((v, i) => {
                const num = i + 1;
                const isTarget = num === scrollVerse;
                const isSelected = num === selectedVerse;
                const key = `${bookObj.name}-${chapterNum}-${num}`;
                const hasBookmark = !!bookmarks[key];
                const hasNote = !!notes[key];
                return (
                  <span
                    key={i}
                    ref={(el) => (verseRefs.current[num] = el)}
                    onClick={() => setSelectedVerse(num)}
                    className={`inline cursor-pointer rounded px-1 py-0.5 transition-all duration-150 active:scale-[0.99] hover:bg-secondary/40 ${
                      isTarget
                        ? 'bg-amber-500/25 dark:bg-amber-400/30 ring-1 ring-amber-500/50 font-medium'
                        : ''
                    } ${
                      isSelected ? 'bg-primary/10 ring-1 ring-primary/30 font-medium' : ''
                    } ${
                      hasBookmark ? 'border-b-2 border-dashed border-primary/50' : ''
                    }`}
                  >
                    <sup className="verse-num select-none">
                      {num}
                      {hasNote && (
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary ml-0.5 -translate-y-1" />
                      )}
                    </sup>
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

      <Drawer open={selectedVerse !== null} onOpenChange={(open) => { if (!open) setSelectedVerse(null); }}>
        <DrawerContent className="max-h-[85vh] p-4 flex flex-col gap-4">
          <DrawerHeader>
            <DrawerTitle className="font-scripture text-lg flex items-center justify-between">
              <span>
                {bookObj && selectedVerse !== null
                  ? `${displayBookName(bookObj.name)} ${chapterNum}:${selectedVerse}`
                  : ''}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleToggleBookmark}
                  className={`p-2 rounded-full border transition-all active:scale-95 ${
                    isBookmarked
                      ? 'bg-primary/10 border-primary text-primary'
                      : 'bg-card border-border text-muted-foreground hover:text-foreground'
                  }`}
                  title="Bookmark"
                >
                  <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
                </button>
                <DrawerClose className="p-2 rounded-full border border-border bg-card text-muted-foreground hover:text-foreground transition-all active:scale-95">
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </DrawerClose>
              </div>
            </DrawerTitle>
          </DrawerHeader>

          <div className="bg-secondary/40 border border-border rounded-xl p-4">
            <p className="font-scripture text-base leading-relaxed text-foreground select-text">
              {selectedVerse !== null ? verses[selectedVerse - 1] : ''}
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5" />
              Personal Notes
            </label>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Write your thoughts, reflections, or notes on this scripture..."
              className="w-full min-h-[100px] rounded-xl border border-border bg-card p-3 text-sm text-foreground outline-none focus:border-primary transition-all resize-none"
            />
          </div>

          <DrawerFooter className="flex flex-row justify-end gap-2 pt-0">
            <button
              onClick={() => handleSaveNote(noteText)}
              className="rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Save Note
            </button>
            <button
              onClick={handleCopyVerse}
              className="rounded-full bg-secondary px-4 py-1.5 text-xs font-semibold text-secondary-foreground hover:bg-secondary/80 transition-colors"
            >
              Copy Verse
            </button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </AppShell>
  );
};

export default Read;
