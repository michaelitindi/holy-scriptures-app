import { Link, useLocation } from 'react-router-dom';
import { Search, Settings, BookOpen } from 'lucide-react';

export function BottomNav() {
  const location = useLocation();
  const items = [
    { to: '/', label: 'Read', icon: BookOpen },
    { to: '/search', label: 'Search', icon: Search },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 backdrop-blur-md shadow-soft"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="mx-auto flex max-w-2xl items-center justify-around px-2">
        {items.map((it) => {
          const isActive = location.pathname === it.to;
          return (
            <li key={it.to} className="flex-1 py-1">
              <Link
                to={it.to}
                className={`flex flex-col items-center gap-1 py-1.5 rounded-xl transition-all duration-150 active:scale-95 ${
                  isActive 
                    ? 'text-primary bg-primary/5 font-semibold' 
                    : 'text-muted-foreground hover:text-primary hover:bg-secondary/40'
                }`}
              >
                <it.icon className={`h-5 w-5 transition-transform ${isActive ? 'scale-110 text-primary' : ''}`} />
                <span className="text-[10px] font-semibold uppercase tracking-wider">{it.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
