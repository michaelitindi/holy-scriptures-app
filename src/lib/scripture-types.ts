export type Book = {
  name: string;
  section: 'Old Testament' | 'Apocrypha' | 'New Testament' | 'Other Sacred Texts';
  chapters: string[][]; // chapters -> verses
};

export type Scriptures = { books: Book[] };
