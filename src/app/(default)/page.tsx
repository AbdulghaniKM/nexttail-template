import { AppIcon } from '@/components/ui/AppIcon';
import { appConfig } from '@/config/app.config';
import { definePage } from '@/config/routes';

export const metadata = definePage({
  head: 'Home',
  layout: 'default',
});

const STACK = ['Next.js 16', 'Tailwind v4', 'TypeScript', 'Zustand', 'App Router'];

export default function HomePage() {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center gap-6 bg-background px-4 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10">
        <AppIcon name="icon-[logos--nextjs-icon]" className="size-8" />
      </div>

      <div className="space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tight text-text sm:text-5xl">
          {appConfig.app.name}
        </h1>
        <p className="mx-auto max-w-sm text-base text-text-secondary">
          Next.js + Tailwind v4 + TypeScript. Clean and ready to build.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-2 text-xs text-text-secondary">
        {STACK.map((item) => (
          <span key={item} className="rounded-full bg-muted px-3 py-1.5 font-medium">
            {item}
          </span>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-surface p-5 text-left">
        <p className="mb-3 text-xs font-semibold tracking-wider text-text-secondary uppercase">
          Add components on demand
        </p>
        <pre className="text-sm leading-relaxed text-text">
          <code>
            <span className="text-success">$</span> pnpm add-component AppButton{'\n'}
            <span className="text-success">$</span> pnpm add-component AppModal{'\n'}
            <span className="text-success">$</span> pnpm add-hook useAuth
          </code>
        </pre>
      </div>
    </div>
  );
}
