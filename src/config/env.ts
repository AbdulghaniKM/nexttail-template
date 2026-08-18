import { z } from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_API_URL: z
    .string()
    .default('/api')
    .refine(
      (url) => {
        // Relative paths (e.g. "/api") are always allowed. Absolute URLs must be
        // HTTPS in production: the bearer token rides in the Authorization header
        // and would otherwise be exposed to MITM over plain HTTP.
        if (!/^https?:\/\//i.test(url)) return true;
        if (process.env.NODE_ENV !== 'production') return true;
        return url.startsWith('https://');
      },
      { message: 'NEXT_PUBLIC_API_URL must use https:// in production.' },
    ),
  NEXT_PUBLIC_APP_URL: z.string().optional(),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

type AppEnv = z.infer<typeof envSchema>;

// Next inlines `process.env.NEXT_PUBLIC_*` only when referenced statically, so
// the object is spelled out rather than passed as `process.env`.
const parsed = envSchema.safeParse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NODE_ENV: process.env.NODE_ENV,
});

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((issue) => `  ${issue.path.join('.') || '(root)'}: ${issue.message}`)
    .join('\n');
  throw new Error(`[env] Invalid environment:\n${issues}`);
}

export const env: AppEnv = parsed.data;

export const isDev = (): boolean => env.NODE_ENV === 'development';
export const isProd = (): boolean => env.NODE_ENV === 'production';

export const getApiUrl = (): string => env.NEXT_PUBLIC_API_URL;

export const getAppUrl = (): string => {
  if (env.NEXT_PUBLIC_APP_URL) return env.NEXT_PUBLIC_APP_URL;
  if (typeof window !== 'undefined') return window.location.origin;
  return 'http://localhost:3000';
};
