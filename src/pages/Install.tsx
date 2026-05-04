import { AppShell } from '@/components/AppShell';
import { PageHeader } from '@/components/PageHeader';
import { Download, Smartphone, Github } from 'lucide-react';

const Install = () => {
  return (
    <AppShell header={<PageHeader title="Install on Android" back="/" />}>
      <div className="space-y-5 pt-6">
        <section className="rounded-2xl bg-card p-6 shadow-elegant">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-gold text-accent-foreground shadow-soft">
              <Smartphone className="h-6 w-6" />
            </div>
            <div>
              <h2 className="font-scripture text-2xl font-semibold gold-text">
                Get the APK
              </h2>
              <p className="text-sm text-muted-foreground">
                Build a native Android app from this project
              </p>
            </div>
          </div>

          <p className="mt-4 text-sm leading-relaxed text-foreground">
            This app is configured with <span className="font-semibold">Capacitor</span>, which
            wraps the experience as a native Android app you can install as an{' '}
            <span className="font-semibold">.apk</span> file.
          </p>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <h3 className="font-scripture text-xl font-semibold text-foreground">
            Build the APK
          </h3>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-foreground">
            <li>
              In Lovable, click <span className="font-semibold">GitHub → Connect</span> and
              transfer this project to your own GitHub repository.
            </li>
            <li>
              <span className="font-semibold">Git clone</span> the repository to your computer.
            </li>
            <li>
              Run <code className="rounded bg-secondary px-1.5 py-0.5">npm install</code>.
            </li>
            <li>
              Add Android: <code className="rounded bg-secondary px-1.5 py-0.5">npx cap add android</code>.
            </li>
            <li>
              Build the web bundle:{' '}
              <code className="rounded bg-secondary px-1.5 py-0.5">npm run build</code>.
            </li>
            <li>
              Sync to native:{' '}
              <code className="rounded bg-secondary px-1.5 py-0.5">npx cap sync android</code>.
            </li>
            <li>
              Open in Android Studio:{' '}
              <code className="rounded bg-secondary px-1.5 py-0.5">npx cap open android</code>,
              then <span className="font-semibold">Build → Build Bundle(s) / APK(s) → Build APK(s)</span>.
            </li>
            <li>
              The signed-debug{' '}
              <code className="rounded bg-secondary px-1.5 py-0.5">app-debug.apk</code> appears in{' '}
              <code className="rounded bg-secondary px-1.5 py-0.5">
                android/app/build/outputs/apk/debug/
              </code>
              . Install it on your phone.
            </li>
          </ol>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <h3 className="font-scripture text-xl font-semibold text-foreground">
            Try it instantly
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-foreground">
            Add this app to your Android home screen right now: open the menu in Chrome and tap{' '}
            <span className="font-semibold">Add to Home screen</span>. It will open like a native
            app — no APK build needed.
          </p>
          <a
            href="https://docs.lovable.dev/"
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            <Github className="h-4 w-4" /> Read the docs
          </a>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <div className="flex items-start gap-3">
            <Download className="mt-1 h-5 w-5 text-primary" />
            <p className="text-sm leading-relaxed text-foreground">
              Tip: For Play-Store distribution, generate a release keystore and run{' '}
              <span className="font-semibold">Build → Generate Signed Bundle / APK</span> in
              Android Studio.
            </p>
          </div>
        </section>
      </div>
    </AppShell>
  );
};

export default Install;
