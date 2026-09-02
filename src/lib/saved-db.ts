import { idbGet, idbSet } from './idb';

export type Bookmark = {
  id: string; // "BookName-Chapter-Verse"
  book: string;
  chapter: number;
  verse: number;
  text: string;
  createdAt: number;
};

export type Note = {
  id: string; // "BookName-Chapter-Verse"
  book: string;
  chapter: number;
  verse: number;
  text: string;
  note: string;
  updatedAt: number;
};

const BOOKMARKS_KEY = 'saved-bookmarks-v1';
const NOTES_KEY = 'saved-notes-v1';

export async function getBookmarks(): Promise<Record<string, Bookmark>> {
  const data = await idbGet<Record<string, Bookmark>>(BOOKMARKS_KEY);
  return data || {};
}

export async function saveBookmark(book: string, chapter: number, verse: number, text: string): Promise<void> {
  const id = `${book}-${chapter}-${verse}`;
  const bookmarks = await getBookmarks();
  bookmarks[id] = {
    id,
    book,
    chapter,
    verse,
    text,
    createdAt: Date.now(),
  };
  await idbSet(BOOKMARKS_KEY, bookmarks);
}

export async function removeBookmark(book: string, chapter: number, verse: number): Promise<void> {
  const id = `${book}-${chapter}-${verse}`;
  const bookmarks = await getBookmarks();
  if (bookmarks[id]) {
    delete bookmarks[id];
    await idbSet(BOOKMARKS_KEY, bookmarks);
  }
}

export async function getNotes(): Promise<Record<string, Note>> {
  const data = await idbGet<Record<string, Note>>(NOTES_KEY);
  return data || {};
}

export async function saveNote(book: string, chapter: number, verse: number, text: string, noteText: string): Promise<void> {
  const id = `${book}-${chapter}-${verse}`;
  const notes = await getNotes();
  if (!noteText.trim()) {
    // If the note text is empty, delete it
    if (notes[id]) {
      delete notes[id];
      await idbSet(NOTES_KEY, notes);
    }
    return;
  }
  notes[id] = {
    id,
    book,
    chapter,
    verse,
    text,
    note: noteText,
    updatedAt: Date.now(),
  };
  await idbSet(NOTES_KEY, notes);
}

export async function removeNote(book: string, chapter: number, verse: number): Promise<void> {
  const id = `${book}-${chapter}-${verse}`;
  const notes = await getNotes();
  if (notes[id]) {
    delete notes[id];
    await idbSet(NOTES_KEY, notes);
  }
}
