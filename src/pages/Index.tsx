import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AppShell } from '@/components/AppShell';
import { PageHeader } from '@/components/PageHeader';
import { useScriptures } from '@/hooks/use-scriptures';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { ChevronRight, Search as SearchIcon, X } from 'lucide-react';

type LastRead = { book: string; chapter: number };

const displayBookName = (name: string): string => {
  const parts = name.split(' ');
  if (parts[0] === 'I') return `1 ${parts.slice(1).join(' ')}`;
  if (parts[0] === 'II') return `2 ${parts.slice(1).join(' ')}`;
  if (parts[0] === 'III') return `3 ${parts.slice(1).join(' ')}`;
  return name;
};

const Reader = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedBook = searchParams.get('book');
  const { data, loading, error } = useScriptures();
  const [last] = useLocalStorage<LastRead>('hs-last-read', { book: 'Genesis', chapter: 1 });
  const [bookSearchQuery, setBookSearchQuery] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  const selectedChapter = searchParams.get('chapter');
  const selectedChapterNum = selectedChapter ? parseInt(selectedChapter, 10) : null;
  const bookObj = selectedBook ? data?.books.find((b) => b.name === selectedBook) ?? null : null;

  const filteredBooks = useMemo(() => {
    if (!data) return [];
    const query = bookSearchQuery.trim().toLowerCase();
    if (!query) return data.books;
    return data.books.filter(b => 
      b.name.toLowerCase().includes(query) || 
      displayBookName(b.name).toLowerCase().includes(query)
    );
  }, [data, bookSearchQuery]);

  return (
    <AppShell
      header={
        <PageHeader 
          title="Holy Scriptures" 
          {...(selectedBook ? {
            title: displayBookName(selectedBook) + (selectedChapter ? ` ${selectedChapter}` : ''),
            subtitle: selectedChapter ? 'Select Verse' : 'Select Chapter',
            back: '#',
            onBackClick: () => {
              if (selectedChapter) {
                setSearchParams({ book: selectedBook });
              } else {
                setSearchParams({});
              }
            }
          } : {})}
        />
      }
    >

      {!selectedBook && (
        <section className="pt-6 pb-6">
          <div className="rounded-2xl bg-card p-6 shadow-elegant">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Continue reading
            </p>
            <h2 className="mt-2 font-scripture text-3xl font-semibold gold-text">
              {displayBookName(last.book)}
            </h2>
            <p className="mt-1 text-muted-foreground">Chapter {last.chapter}</p>
            <button
              onClick={() => navigate(`/read/${encodeURIComponent(last.book)}/${last.chapter}`)}
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-gradient-gold px-5 py-2.5 text-sm font-semibold text-accent-foreground shadow-soft transition-transform hover:scale-[1.02]"
            >
              Open <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </section>
      )}

      {loading && <p className="text-muted-foreground">Loading scriptures…</p>}
      {error && <p className="text-destructive">{error}</p>}

      {selectedBook && bookObj && (
        <section className="pb-6 pt-6">
          {selectedChapterNum ? (
            // Render Verses Selection
            <div key={`verses-view-${bookObj.name}-${selectedChapterNum}`}>
              <div className="flex items-center justify-between mb-4 border-b border-border/40 pb-2">
                <h3 className="font-scripture text-2xl font-semibold text-foreground">
                  Verses
                </h3>
              </div>
              <div key={`verses-grid-${bookObj.name}-${selectedChapterNum}`} className="grid grid-cols-5 gap-2 sm:grid-cols-8">
                {Array.from({ length: bookObj.chapters[selectedChapterNum - 1]?.length || 0 }).map((_, idx) => {
                  const vNum = idx + 1;
                  return (
                    <button
                      key={`verse-btn-${vNum}`}
                      onClick={() => navigate(`/read/${encodeURIComponent(bookObj.name)}/${selectedChapterNum}?goto=${vNum}`)}
                      className="rounded-lg bg-card border border-border p-3 text-center font-semibold text-sm hover:border-primary/40 hover:bg-secondary active:scale-95 transition-all"
                    >
                      {vNum}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            // Render Chapters Selection
            <div key={`chapters-view-${bookObj.name}`}>
              <div className="flex items-center justify-between mb-4 border-b border-border/40 pb-2">
                <h3 className="font-scripture text-2xl font-semibold text-foreground">
                  Chapters
                </h3>
              </div>
              <div key={`chapters-grid-${bookObj.name}`} className="grid grid-cols-5 gap-2 sm:grid-cols-8">
                {bookObj.chapters.map((_, idx) => {
                  const chNum = idx + 1;
                  if (bookObj.name === 'Additions to Esther' && chNum < 10) return null;
                  return (
                    <button
                      key={`chapter-btn-${chNum}`}
                      onClick={() => setSearchParams({ book: selectedBook, chapter: String(chNum) })}
                      className="rounded-lg bg-card border border-border p-3 text-center font-semibold text-sm hover:border-primary/40 hover:bg-secondary active:scale-95 transition-all"
                    >
                      {chNum}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      )}

      {data && !selectedBook && (
        <section className="pb-6">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h3 className="font-scripture text-xl font-semibold text-foreground">Books</h3>
            <div className="flex items-center gap-2 flex-1 justify-end max-w-xs sm:max-w-sm">
              <div className={`relative flex-1 transition-all duration-200 origin-right ${isSearchVisible ? 'opacity-100 scale-x-100 max-w-full' : 'opacity-0 scale-x-0 max-w-0 pointer-events-none'}`}>
                <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={bookSearchQuery}
                  onChange={(e) => setBookSearchQuery(e.target.value)}
                  placeholder="Search for book..."
                  className="w-full rounded-full border border-border bg-card py-1.5 pl-8 pr-8 text-xs text-foreground outline-none focus:border-primary transition-all"
                />
                {bookSearchQuery && (
                  <button
                    onClick={() => setBookSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <button
                onClick={() => {
                  setIsSearchVisible(!isSearchVisible);
                  if (isSearchVisible) setBookSearchQuery('');
                }}
                className="rounded-full p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-all duration-150 shrink-0"
              >
                {isSearchVisible ? <X className="h-5 w-5" /> : <SearchIcon className="h-5 w-5" />}
              </button>
            </div>
          </div>
          {filteredBooks.length === 0 ? (
            <p className="text-sm text-muted-foreground pt-2">No matching books found.</p>
          ) : (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {filteredBooks.map((b) => (
                <button
                  key={b.name}
                  onClick={() => setSearchParams({ book: b.name })}
                  className="rounded-xl border border-border bg-card p-3 text-left shadow-soft transition-all hover:border-primary/40 hover:shadow-elegant active:scale-[0.98]"
                >
                  <p className="font-scripture text-base font-semibold text-foreground leading-tight">
                    {displayBookName(b.name)}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {b.chapters.length} chapter{b.chapters.length === 1 ? '' : 's'}
                  </p>
                </button>
              ))}
            </div>
          )}
        </section>
      )}
    </AppShell>
  );
};

export default Reader;
