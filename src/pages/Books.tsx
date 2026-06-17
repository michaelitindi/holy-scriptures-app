import { useNavigate } from 'react-router-dom';
import { AppShell } from '@/components/AppShell';
import { PageHeader } from '@/components/PageHeader';
import { useScriptures } from '@/hooks/use-scriptures';

const Books = () => {
  const navigate = useNavigate();
  const { data, loading, error } = useScriptures();
  return (
    <AppShell header={<PageHeader title="All Books" subtitle="Browse every book" back="/" />}>
      {loading && <p className="pt-6 text-muted-foreground">Loading…</p>}
      {error && <p className="pt-6 text-destructive">{error}</p>}
      {data && (
        <div className="pt-4">
          <ul className="overflow-hidden rounded-xl border border-border bg-card shadow-soft">
            {data.books.map((b, i) => (
              <li key={b.name} className={i > 0 ? 'border-t border-border' : ''}>
                <button
                  onClick={() => navigate(`/read/${encodeURIComponent(b.name)}/1`)}
                  className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-secondary"
                >
                  <span className="font-scripture text-lg text-foreground">{b.name}</span>
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
