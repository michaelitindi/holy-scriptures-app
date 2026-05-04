import { useNavigate } from 'react-router-dom';
import { AppShell } from '@/components/AppShell';
import { PageHeader } from '@/components/PageHeader';
import { useScriptures } from '@/hooks/use-scriptures';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { ChevronRight } from 'lucide-react';

type LastRead = { book: string; chapter: number };

const Reader = () => {
  const navigate = useNavigate();
  const { data, loading, error } = useScriptures();
  const [last] = useLocalStorage<LastRead>('hs-last-read', { book: 'Genesis', chapter: 1 });

  return (
    <AppShell
      header={
        <PageHeader
          title="Holy Scriptures"
          subtitle="KJV · Apocrypha · Jasher"
        />
      }
    >
      <section className="pt-8 pb-6">
        <div className="rounded-2xl bg-card p-6 shadow-elegant">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Continue reading
          </p>
          <h2 className="mt-2 font-scripture text-3xl font-semibold gold-text">
            {last.book}
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

      {loading && <p className="text-muted-foreground">Loading scriptures…</p>}
      {error && <p className="text-destructive">{error}</p>}

      {data && (
        <section className="space-y-6 pb-6">
          {(['Old Testament', 'Apocrypha', 'New Testament', 'Other Sacred Texts'] as const).map(
            (section) => {
              const books = data.books.filter((b) => b.section === section);
              if (books.length === 0) return null;
              return (
                <div key={section}>
                  <h3 className="mb-2 px-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    {section}
                  </h3>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {books.map((b) => (
                      <button
                        key={b.name}
                        onClick={() => navigate(`/read/${encodeURIComponent(b.name)}/1`)}
                        className="rounded-xl border border-border bg-card p-3 text-left shadow-soft transition-all hover:border-primary/40 hover:shadow-elegant"
                      >
                        <p className="font-scripture text-base font-semibold text-foreground leading-tight">
                          {b.name}
                        </p>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                          {b.chapters.length} chapter{b.chapters.length === 1 ? '' : 's'}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              );
            },
          )}
        </section>
      )}
    </AppShell>
  );
};

export default Reader;
