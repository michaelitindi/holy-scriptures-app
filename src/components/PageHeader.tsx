import { Link } from 'react-router-dom';
import { ReactNode } from 'react';

export function PageHeader({
  title,
  subtitle,
  right,
  back,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  back?: string;
}) {
  return (
    <header
      className="sticky top-0 z-30 border-b border-border bg-card/85 backdrop-blur-md"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-3 min-w-0">
          {back && (
            <Link
              to={back}
              className="rounded-full px-2.5 py-1 text-sm text-muted-foreground hover:bg-secondary"
            >
              ←
            </Link>
          )}
          <div className="min-w-0">
            <h1 className="truncate font-scripture text-xl font-semibold text-foreground">
              {title}
            </h1>
            {subtitle && (
              <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </div>
        {right && <div className="flex items-center gap-2 shrink-0">{right}</div>}
      </div>
    </header>
  );
}
