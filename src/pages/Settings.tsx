import { AppShell } from '@/components/AppShell';
import { PageHeader } from '@/components/PageHeader';
import { useTheme } from '@/components/theme-provider';
import { Moon, Sun } from 'lucide-react';

const Settings = () => {
  const { theme, setTheme, fontSize, setFontSize } = useTheme();
  return (
    <AppShell header={<PageHeader title="Settings" back="/" />}>
      <div className="space-y-6 pt-6">
        <section className="rounded-xl border border-border bg-card p-4 shadow-soft">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Theme
          </h2>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setTheme('light')}
              className={`flex items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition-colors ${
                theme === 'light'
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-secondary text-secondary-foreground'
              }`}
            >
              <Sun className="h-4 w-4" /> Light
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`flex items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition-colors ${
                theme === 'dark'
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-secondary text-secondary-foreground'
              }`}
            >
              <Moon className="h-4 w-4" /> Dark
            </button>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-4 shadow-soft">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Reading size
            </h2>
            <span className="text-sm text-muted-foreground">{fontSize}px</span>
          </div>
          <input
            type="range"
            min={14}
            max={28}
            value={fontSize}
            onChange={(e) => setFontSize(parseInt(e.target.value, 10))}
            className="w-full accent-[hsl(var(--primary))]"
          />
          <p
            className="font-scripture mt-3 rounded-lg bg-background p-3 leading-relaxed"
            style={{ fontSize: `${fontSize}px` }}
          >
            <sup className="verse-num">1</sup>In the beginning God created the heaven and the
            earth.
          </p>
        </section>

        <section className="rounded-xl border border-border bg-card p-4 shadow-soft">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            About
          </h2>
          <p className="font-scripture text-base text-foreground">Holy Scriptures</p>
          <p className="mt-1 text-sm text-muted-foreground">
            King James Version with the Apocrypha (KJVA) and the Book of Jasher (1840 translation).
            Public domain texts.
          </p>
        </section>
      </div>
    </AppShell>
  );
};

export default Settings;
