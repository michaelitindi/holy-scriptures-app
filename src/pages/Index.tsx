import { useNavigate } from 'react-router-dom';
import { AppShell } from '@/components/AppShell';
import { PageHeader } from '@/components/PageHeader';
import { useScriptures } from '@/hooks/use-scriptures';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { ChevronRight } from 'lucide-react';

import { useState } from 'react';

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
  const { data, loading, error } = useScriptures();
  const [last] = useLocalStorage<LastRead>('hs-last-read', { book: 'Genesis', chapter: 1 });
  const [selectedBook, setSelectedBook] = useState<string | null>(null);

  const bookObj = selectedBook ? data?.books.find(b => b.name === selectedBook) : null;

  return (
    <AppShell
      header={
        <PageHeader 
          title="Holy Scriptures" 
          // If a book is selected, handle the header title and add a back button to reset selection
          {...(selectedBook ? {
            title: displayBookName(selectedBook),
            back: "#",
            onBackClick: () => setSelectedBook(null)
          } : {})}
        />
      }
    >

      {!selectedBook && (
        <section className="pt-8 pb-6">
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
          <div className="flex items-center justify-between mb-4 border-b border-border/40 pb-2">
            <h3 className="font-scripture text-2xl font-semibold text-foreground">
              Chapters
            </h3>
          </div>
          <div className="grid grid-cols-5 gap-2 sm:grid-cols-8">
            {bookObj.chapters.map((_, idx) => {
              const chNum = idx + 1;
              if (bookObj.name === 'Additions to Esther' && chNum < 10) return null;
              return (
                <button
                  key={chNum}
                  onClick={() => navigate(`/read/${encodeURIComponent(bookObj.name)}/${chNum}`)}
                  className="rounded-lg bg-card border border-border p-3 text-center font-semibold text-sm hover:border-primary/40 hover:bg-secondary transition-all"
                >
                  {chNum}
                </button>
              );
            })}
          </div>
        </section>
      )}

      {data && !selectedBook && (
        <section className="pb-6">
          <h3 className="font-scripture text-xl font-semibold text-foreground mb-4">Books</h3>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {data.books.map((b) => (
              <button
                key={b.name}
                onClick={() => setSelectedBook(b.name)}
                className="rounded-xl border border-border bg-card p-3 text-left shadow-soft transition-all hover:border-primary/40 hover:shadow-elegant"
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
        </section>
      )}
    </AppShell>
  );
};

export default Reader;
