import { useNavigate, useSearchParams } from 'react-router-dom';
import { AppShell } from '@/components/AppShell';
import { PageHeader } from '@/components/PageHeader';
import { useScriptures } from '@/hooks/use-scriptures';

const displayBookName = (name: string): string => {
  const parts = name.split(' ');
  if (parts[0] === 'I') return `1 ${parts.slice(1).join(' ')}`;
  if (parts[0] === 'II') return `2 ${parts.slice(1).join(' ')}`;
  if (parts[0] === 'III') return `3 ${parts.slice(1).join(' ')}`;
  return name;
};

const Books = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedBook = searchParams.get('book');
  const { data, loading, error } = useScriptures();

  const bookObj = selectedBook ? data?.books.find(b => b.name === selectedBook) : null;

  return (
    <AppShell 
      header={
        <PageHeader 
          title={selectedBook ? displayBookName(selectedBook) : "All Books"} 
          subtitle={selectedBook ? undefined : "Browse every book"} 
          back={selectedBook ? "#" : "/"} 
          onBackClick={selectedBook ? () => setSearchParams({}) : undefined}
        />
      }
    >

      {loading && <p className="pt-6 text-muted-foreground">Loading…</p>}
      {error && <p className="pt-6 text-destructive">{error}</p>}
      
      {selectedBook && bookObj && (
        <div className="pt-6 space-y-4">
          <div className="flex items-center justify-between border-b border-border/40 pb-2">
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
        </div>
      )}

      {data && !selectedBook && (
        <div className="pt-4">
          <ul className="overflow-hidden rounded-xl border border-border bg-card shadow-soft">
            {data.books.map((b, i) => (
              <li key={b.name} className={i > 0 ? 'border-t border-border' : ''}>
                <button
                  onClick={() => setSearchParams({ book: b.name })}
                  className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-secondary"
                >
                  <span className="font-scripture text-lg text-foreground">{displayBookName(b.name)}</span>
                  <span className="text-xs text-muted-foreground">
                    {b.chapters.length} ch
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </AppShell>
  );
};

export default Books;
