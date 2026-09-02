import { Scriptures } from './scripture-types';
import { idbGet, idbSet } from './idb';

// Inverted index: token -> packed array of verse ids.
// A verse id = bookIndex * 2^20 + chapterIndex * 2^10 + verseIndex.
// (chapters/verses comfortably fit; books also fit easily.)
export type SearchIndex = {
  version: number;
  contentHash: string;
  books: string[];
  // token -> Uint32Array of verse ids
  postings: Record<string, number[]>;
};

const INDEX_KEY = 'search-index-v2';
const INDEX_VERSION = 8;

const STOPWORDS = new Set([
  'the','and','of','to','in','that','he','for','i','his','a','they','be','is','with','it','not','him','as','their','my','was','but','shall','from','thou','thy','thee','ye','this','have','will','are','all','which','unto','said','them','were','me','one','our','then','so','if','by','on','at','an','or','we','no','what','when','out','up','your','also','do','who','these','o','her','she','than','its','am','any','may','more','some','can','into','because','therefore','yet','even','now',
]);

function tokenize(s: string): string[] {
  return s.toLowerCase().match(/[a-z]+/g) ?? [];
}

export function packId(b: number, c: number, v: number): number {
  return (b << 20) | (c << 10) | v;
}
export function unpackId(id: number): { b: number; c: number; v: number } {
  return { b: id >>> 20, c: (id >>> 10) & 0x3ff, v: id & 0x3ff };
}

// Fast, non-cryptographic 32-bit string hash (FNV-1a variant).
// Used only to detect when scripture content changes so we can rebuild
// the search index automatically — no security properties required.
export function computeContentHash(data: Scriptures): string {
  let h1 = 0x811c9dc5 | 0;
  let h2 = 0xdeadbeef | 0;
  let totalVerses = 0;
  for (let bi = 0; bi < data.books.length; bi++) {
    const b = data.books[bi];
    // Mix book name
    for (let i = 0; i < b.name.length; i++) {
      h1 ^= b.name.charCodeAt(i);
      h1 = Math.imul(h1, 0x01000193);
    }
    for (let ci = 0; ci < b.chapters.length; ci++) {
      const ch = b.chapters[ci];
      for (let vi = 0; vi < ch.length; vi++) {
        const text = ch[vi];
        totalVerses++;
        for (let i = 0; i < text.length; i++) {
          h1 ^= text.charCodeAt(i);
          h1 = Math.imul(h1, 0x01000193);
          h2 = (h2 + text.charCodeAt(i)) | 0;
          h2 = Math.imul(h2, 0x85ebca6b);
        }
      }
    }
  }
  return `${(h1 >>> 0).toString(16)}-${(h2 >>> 0).toString(16)}-${totalVerses}`;
}

export function buildIndex(data: Scriptures): SearchIndex {
  const postings: Record<string, number[]> = {};
  data.books.forEach((book, bi) => {
    book.chapters.forEach((ch, ci) => {
      ch.forEach((text, vi) => {
        const id = packId(bi, ci, vi);
        const seen = new Set<string>();
        for (const tok of tokenize(text)) {
          if (tok.length < 3) continue;
          if (seen.has(tok)) continue;
          seen.add(tok);
          (postings[tok] ||= []).push(id);
        }
      });
    });
  });
  return {
    version: INDEX_VERSION,
    contentHash: computeContentHash(data),
    books: data.books.map((b) => b.name),
    postings,
  };
}

export async function getOrBuildIndex(data: Scriptures): Promise<SearchIndex> {
  const cached = await idbGet<SearchIndex>(INDEX_KEY);
  const hash = computeContentHash(data);
  if (
    cached &&
    cached.version === INDEX_VERSION &&
    cached.contentHash === hash &&
    cached.books.length === data.books.length &&
    cached.books.every((n, i) => n === data.books[i].name)
  ) {
    return cached;
  }
  const idx = buildIndex(data);
  // Persist asynchronously; don't block.
  idbSet(INDEX_KEY, idx);
  return idx;
}

export type SearchHit = {
  book: string;
  chapter: number;
  verse: number;
  text: string;
};

// Search: AND across all query tokens (>=3 chars). Falls back to a substring
// scan when no tokens qualify (e.g. very short query).
export function searchIndex(
  index: SearchIndex,
  data: Scriptures,
  query: string,
  limit = 200,
): SearchHit[] {
  const term = query.trim().toLowerCase();
  if (!term) return [];

  const tokens = tokenize(term).filter((t) => t.length >= 3 && !STOPWORDS.has(t));
  let candidates: number[] | null = null;

  if (tokens.length > 0) {
    // Collect all lists for tokens that actually exist in the index
    const listsWithTokens = tokens
      .map((t) => ({ token: t, list: index.postings[t] }))
      .filter((item): item is { token: string; list: number[] } => Array.isArray(item.list) && item.list.length > 0);

    if (listsWithTokens.length > 0) {
      // Score candidates by how many of the query tokens they match
      const counts = new Map<number, number>();
      for (const { list } of listsWithTokens) {
        for (const id of list) {
          counts.set(id, (counts.get(id) || 0) + 1);
        }
      }

      // We prefer candidates matching more tokens.
      // If we have multiple tokens, require matching at least 50% of the query tokens to be a candidate.
      const minMatch = Math.max(1, Math.floor(tokens.length * 0.5));
      candidates = Array.from(counts.entries())
        .filter(([_, count]) => count >= minMatch)
        .sort((a, b) => b[1] - a[1]) // Sort by highest match count first
        .map(([id]) => id);
    }
  }

  const out: SearchHit[] = [];
  // Verify and rank hits
  if (candidates && candidates.length > 0) {
    const cleanTerm = term.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, "").replace(/\s+/g, " ");
    for (const id of candidates) {
      const { b, c, v } = unpackId(id);
      const text = data.books[b]?.chapters[c]?.[v];
      if (!text) continue;
      const cleanText = text.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, "").replace(/\s+/g, " ");
      
      // If the exact normalized phrase is found, it gets top priority
      if (cleanText.includes(cleanTerm)) {
        out.push({ book: data.books[b].name, chapter: c + 1, verse: v + 1, text });
        if (out.length >= limit) break;
      }
    }

    // If we didn't fill the limit with exact phrase matches, fill the rest with the best keyword matches
    if (out.length < limit) {
      const seen = new Set(out.map(h => `${h.book}-${h.chapter}-${h.verse}`));
      for (const id of candidates) {
        const { b, c, v } = unpackId(id);
        const key = `${data.books[b]?.name}-${c + 1}-${v + 1}`;
        if (seen.has(key)) continue;
        const text = data.books[b]?.chapters[c]?.[v];
        if (!text) continue;
        
        out.push({ book: data.books[b].name, chapter: c + 1, verse: v + 1, text });
        if (out.length >= limit) break;
      }
    }
    
    if (out.length > 0) return out;
  }

  // Fallback substring scan for very short queries.
  outer: for (let bi = 0; bi < data.books.length; bi++) {
    const b = data.books[bi];
    for (let ci = 0; ci < b.chapters.length; ci++) {
      const ch = b.chapters[ci];
      for (let vi = 0; vi < ch.length; vi++) {
        if (ch[vi].toLowerCase().includes(term)) {
          out.push({ book: b.name, chapter: ci + 1, verse: vi + 1, text: ch[vi] });
          if (out.length >= limit) break outer;
        }
      }
    }
  }
  return out;
}
