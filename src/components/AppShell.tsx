import { ReactNode } from 'react';
import { BottomNav } from './BottomNav';

export function AppShell({ children, header }: { children: ReactNode; header?: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-warm">
      {header}
      <main
        className="mx-auto max-w-4xl px-4"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 5rem)' }}
      >
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
