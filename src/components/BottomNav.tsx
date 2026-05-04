import { Link } from 'react-router-dom';
import { Book, Search, Settings, Download, BookOpen } from 'lucide-react';

export function BottomNav() {
  const items = [
    { to: '/', label: 'Read', icon: BookOpen },
    { to: '/books', label: 'Books', icon: Book },
    { to: '/search', label: 'Search', icon: Search },
    { to: '/install', label: 'Install', icon: Download },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/90 backdrop-blur-md shadow-soft"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="mx-auto flex max-w-2xl items-center justify-around">
        {items.map((it) => (
          <li key={it.to} className="flex-1">
            <Link
              to={it.to}
              className="flex flex-col items-center gap-1 py-2.5 text-muted-foreground transition-colors hover:text-primary"
            >
              <it.icon className="h-5 w-5" />
              <span className="text-[10px] font-medium uppercase tracking-wider">{it.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
