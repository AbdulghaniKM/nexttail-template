Techinical Rules :

- Always use tailwind v4 based on the docs : https://tailwindcss.com/
- Always use the Next.js App Router — Server Components by default, `'use client'` only where interactivity, browser APIs, or hooks require it
- Backend Flow should be :
  api-paths: define endpoints
  types: define the API response types with pagination config, then define every controller in a seperate type file, and use these types across the stores and services
  services: define methods using the api-paths endpoints
  stores: define bussiness logic and API functions using the services (Zustand)
  pages/components: use stores only
  - if there's no component/hook matches your need, create a new one under `src/components/ui/` or `src/hooks/`
  - always follow DRY principle (DON'T REPEAT YOURSELF)
  - every now and then check DESIGN_SYSTEM.MD to make sure you are designing using the right design system
- check swagger.json file for api endpoints to add them to api-paths
- Page config goes through `definePage` in `src/config/routes.ts` — it produces the Next `Metadata` and feeds the generated route registry
- Never hardcode colors, fonts, or app copy — they live in `src/config/app.config.ts` and `src/config/identity.ts`
- File naming (suffix convention — singular domain):
  - Feature files: `<domain>.<layer>.ts` — e.g. `product.service.ts`, `product.store.ts`, `resource.types.ts`
  - Shared base classes: PascalCase matching the class — `BaseApiService.ts`, `ThemePersistence.ts`
  - Hooks: `use*.ts` — `useTheme.ts`
  - Components: PascalCase `.tsx` — `AppButton.tsx`
  - Config files: `*.config.ts` — `app.config.ts`
  - Pure type modules only: `*.types.ts` — `resource.types.ts`, `form.types.ts`

Agent Rules :

- don't use too many tokens
- make your solutions precise and effective, don't fuck around and waste my tokens.
- ask before major edits and changes
- don't commit on github using your name, don't add any name or "calling"
- never delete files and folders without permission
