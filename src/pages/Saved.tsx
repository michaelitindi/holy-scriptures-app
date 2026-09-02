import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '@/components/AppShell';
import { PageHeader } from '@/components/PageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getBookmarks, getNotes, removeBookmark, removeNote, Bookmark, Note } from '@/lib/saved-db';
import { Trash2, BookMarked, FileText, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

const displayBookName = (name: string): string => {
  const parts = name.split(' ');
  if (parts[0] === 'I') return `1 ${parts.slice(1).join(' ')}`;
  if (parts[0] === 'II') return `2 ${parts.slice(1).join(' ')}`;
  if (parts[0] === 'III') return `3 ${parts.slice(1).join(' ')}`;
  return name;
};

const Saved = () => {
  const navigate = useNavigate();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const bData = await getBookmarks();
      const nData = await getNotes();
      
      // Convert records to sorted arrays (newest first)
      const bArray = Object.values(bData).sort((a, b) => b.createdAt - a.createdAt);
      const nArray = Object.values(nData).sort((a, b) => b.updatedAt - a.updatedAt);
      
      setBookmarks(bArray);
      setNotes(nArray);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load saved items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteBookmark = async (e: React.MouseEvent, book: string, chapter: number, verse: number) => {
    e.stopPropagation();
    await removeBookmark(book, chapter, verse);
    toast.success('Bookmark removed');
    loadData();
  };

  const handleDeleteNote = async (e: React.MouseEvent, book: string, chapter: number, verse: number) => {
    e.stopPropagation();
    await removeNote(book, chapter, verse);
    toast.success('Note deleted');
    loadData();
  };

  return (
    <AppShell header={<PageHeader title="Saved Items" subtitle="Bookmarks and personal notes" back="/" />}>
      <div className="w-full pt-6">
        <Tabs defaultValue="bookmarks" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="bookmarks" className="flex items-center gap-2">
              <BookMarked className="h-4 w-4" />
              Bookmarks ({bookmarks.length})
            </TabsTrigger>
            <TabsTrigger value="notes" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Notes ({notes.length})
            </TabsTrigger>
          </TabsList>

          {loading ? (
            <p className="text-muted-foreground text-center pt-8">Loading saved items...</p>
          ) : (
            <>
              <TabsContent value="bookmarks" className="space-y-3">
                {bookmarks.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-border rounded-2xl bg-card p-6">
                    <BookMarked className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
                    <p className="text-foreground font-semibold">No bookmarks yet</p>
                    <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
                      Tap a verse in the scripture reader to add it to your bookmarks.
                    </p>
                  </div>
                ) : (
                  bookmarks.map((b) => (
                    <div
                      key={b.id}
                      onClick={() => navigate(`/read/${encodeURIComponent(b.book)}/${b.chapter}?v=${b.verse}`)}
                      className="group flex flex-col rounded-xl border border-border bg-card p-4 shadow-soft transition-all hover:border-primary/40 active:scale-[0.99] cursor-pointer"
                    >
                      <div className="flex items-center justify-between border-b border-border/40 pb-2 mb-3">
                        <span className="text-sm font-semibold uppercase tracking-wider text-primary">
                          {displayBookName(b.book)} {b.chapter}:{b.verse}
                        </span>
                        <button
                          onClick={(e) => handleDeleteBookmark(e, b.book, b.chapter, b.verse)}
                          className="text-muted-foreground hover:text-destructive p-1 rounded-full hover:bg-secondary/80 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="font-scripture text-base leading-relaxed text-foreground line-clamp-3 select-none">
                        {b.text}
                      </p>
                      <div className="flex items-center justify-end text-xs font-semibold text-primary/70 mt-2">
                        Go to verse <ChevronRight className="h-3 w-3 ml-0.5" />
                      </div>
                    </div>
                  ))
                )}
              </TabsContent>

              <TabsContent value="notes" className="space-y-3">
                {notes.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-border rounded-2xl bg-card p-6">
                    <FileText className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
                    <p className="text-foreground font-semibold">No notes yet</p>
                    <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
                      Tap a verse in the scripture reader to write notes on it.
                    </p>
                  </div>
                ) : (
                  notes.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => navigate(`/read/${encodeURIComponent(n.book)}/${n.chapter}?v=${n.verse}`)}
                      className="group flex flex-col rounded-xl border border-border bg-card p-4 shadow-soft transition-all hover:border-primary/40 active:scale-[0.99] cursor-pointer"
                    >
                      <div className="flex items-center justify-between border-b border-border/40 pb-2 mb-3">
                        <span className="text-sm font-semibold uppercase tracking-wider text-primary">
                          {displayBookName(n.book)} {n.chapter}:{n.verse}
                        </span>
                        <button
                          onClick={(e) => handleDeleteNote(e, n.book, n.chapter, n.verse)}
                          className="text-muted-foreground hover:text-destructive p-1 rounded-full hover:bg-secondary/80 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="bg-secondary/30 rounded-lg p-3 border border-border/40 mb-3 font-scripture text-sm text-muted-foreground leading-relaxed line-clamp-2 select-none">
                        "{n.text}"
                      </div>
                      <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap select-none font-medium">
                        {n.note}
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-3 pt-2 border-t border-border/20">
                        <span>Updated {new Date(n.updatedAt).toLocaleDateString()}</span>
                        <span className="flex items-center font-semibold text-primary/70">
                          Go to verse <ChevronRight className="h-3 w-3 ml-0.5" />
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </AppShell>
  );
};

export default Saved;
