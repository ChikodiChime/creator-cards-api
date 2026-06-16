# Creator Card Frontend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a dark-themed Next.js + Tailwind frontend (its own git repo, deployable to Vercel) that lets anyone create, view, and delete creator cards against the existing backend API.

**Architecture:** A single Next.js 14 App Router project with three pages (`/`, `/create`, `/c/[slug]`), a thin `apiFetch` wrapper that normalizes the backend's `{status, message, data, code}` response shape into a typed result object, a `localStorage`-backed helper so the browser remembers cards it created (slug + creator_reference), and a handful of shared dark-themed UI primitives. No server-side rendering of card data, no auth, no backend changes.

**Tech Stack:** Next.js 14 (App Router, TypeScript), Tailwind CSS, Vitest + @testing-library/jest-dom for unit-testing pure logic (`lib/`), no UI component library.

---

## Backend response shape (reference for all tasks)

Confirmed from `core/express/server.js`:

- Success: `{ "status": "success", "message": string, "data": <result> }`, HTTP 2xx.
- Error: `{ "status": "error", "message": string, "code": string | undefined, "errors": ..., "data": ... }`, HTTP 4xx/5xx.

A created/fetched card (`data`) shape, from `services/creator-cards/format-card.js`:

```ts
{
  id: string,
  title: string,
  description: string | null,
  slug: string,
  creator_reference: string,
  links: { title: string; url: string }[],
  service_rates: { currency: 'NGN'|'USD'|'GBP'|'GHS'; rates: { name: string; description?: string; amount: number }[] } | null,
  status: 'draft' | 'published',
  access_type: 'public' | 'private',
  created: string,
  updated: string,
  deleted: string | null,
  access_code?: string, // only present in the create response, never in get
}
```

---

## File structure

```
Desktop/
  node-template/                    <- existing backend (unchanged)
  creator-card-frontend/            <- new Next.js app (Tasks 2+)
    package.json
    tsconfig.json
    next.config.js
    tailwind.config.ts
    postcss.config.js
    vitest.config.ts
    .env.local.example
    .gitignore
    app/
      layout.tsx
      globals.css
      page.tsx                     <- Home
      create/
        page.tsx
      c/
        [slug]/
          page.tsx
    components/
      Button.tsx
      Input.tsx
      Card.tsx
      Badge.tsx
      ErrorBanner.tsx
    lib/
      api.ts
      local-cards.ts
      generate-reference.ts
      __tests__/
        api.test.ts
        local-cards.test.ts
        generate-reference.test.ts
```

---

### Task 1: ~~Move the backend repo~~ — skipped

The backend repo stays at `C:\Users\CHIKODI\Desktop\node-template` (the active session's working directory could not be safely moved — it's in use). The frontend is created as a sibling folder directly on the Desktop instead: `C:\Users\CHIKODI\Desktop\creator-card-frontend`.

---

### Task 2: Scaffold the Next.js project

**Files:**
- Create: `C:\Users\CHIKODI\Desktop\creator-card-frontend\` (entire scaffold via `create-next-app`)

- [ ] **Step 1: Scaffold with create-next-app**

Run:
```powershell
cd C:\Users\CHIKODI\Desktop
npx create-next-app@latest creator-card-frontend --typescript --tailwind --eslint --app --src-dir=false --import-alias "@/*" --use-npm
```
When prompted, accept defaults. Expected: a working Next.js app at `creator-card-frontend` with `app/`, `tailwind.config.ts`, `tsconfig.json` already present.

- [ ] **Step 2: Verify the dev server boots**

The backend already listens on port 3000 (see `.env`'s `PORT=3000`), so run the frontend on a different port to avoid a clash:
Run: `cd C:\Users\CHIKODI\Desktop\creator-card-frontend && npm run dev -- -p 3001`
Expected: server starts on `http://localhost:3001` with no errors. Stop it (Ctrl+C) once confirmed. Use port 3001 for the frontend in every later manual-verification step in this plan.

- [ ] **Step 3: Initialize git and make the first commit**

Run:
```powershell
cd C:\Users\CHIKODI\Desktop\creator-card-frontend
git init
git add -A
git commit -m "chore: scaffold Next.js app with TypeScript and Tailwind"
```
Expected: a new repo with one commit. Do not push yet — no remote configured.

---

### Task 3: Add env config and dark theme base layout

**Files:**
- Create: `.env.local.example`
- Modify: `.gitignore` (verify `.env*.local` is already ignored — `create-next-app` includes this by default)
- Modify: `app/globals.css`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Add the example env file**

Create `C:\Users\CHIKODI\Desktop\creator-card-frontend\.env.local.example`:
```
NEXT_PUBLIC_API_URL=http://localhost:3000
```

Then create a real `.env.local` (not committed) pointing at wherever the backend actually runs locally — check the backend's port in `C:\Users\CHIKODI\Desktop\node-template\.env` or `app.js` before filling this in; do not hardcode a guessed port without checking.

- [ ] **Step 2: Confirm `.env.local` is gitignored**

Run: `cd C:\Users\CHIKODI\Desktop\creator-card-frontend && git check-ignore .env.local`
Expected: prints `.env.local` (confirming it's ignored). If it prints nothing, add `.env*.local` to `.gitignore` manually.

- [ ] **Step 3: Replace `app/globals.css` with the dark theme base**

Replace contents of `app/globals.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  color-scheme: dark;
}

body {
  background-color: #09090b;
  color: #f4f4f5;
}
```

- [ ] **Step 4: Replace `app/layout.tsx` with a minimal dark shell**

Replace contents of `app/layout.tsx`:
```tsx
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Creator Cards',
  description: 'Create and share a simple creator card.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-zinc-950 text-zinc-100 antialiased">
        <div className="mx-auto max-w-2xl px-4 py-10">
          <header className="mb-8">
            <a href="/" className="text-lg font-semibold text-zinc-100 hover:text-indigo-400">
              Creator Cards
            </a>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
```

- [ ] **Step 5: Commit**

```powershell
cd C:\Users\CHIKODI\Desktop\creator-card-frontend
git add .env.local.example .gitignore app/globals.css app/layout.tsx
git commit -m "feat: add dark theme base layout and env config"
```

---

### Task 4: Set up Vitest for testing `lib/`

**Files:**
- Create: `vitest.config.ts`
- Modify: `package.json` (add `test` script and devDependencies)

- [ ] **Step 1: Install test dependencies**

Run:
```powershell
cd C:\Users\CHIKODI\Desktop\creator-card-frontend
npm install -D vitest @testing-library/jest-dom jsdom
```

- [ ] **Step 2: Create `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
  },
});
```

- [ ] **Step 3: Add the `test` script to `package.json`**

In the `"scripts"` block, add:
```json
"test": "vitest run"
```

- [ ] **Step 4: Verify the test runner works with a throwaway test**

Create a temporary file `lib/__tests__/sanity.test.ts`:
```ts
import { describe, it, expect } from 'vitest';

describe('sanity', () => {
  it('runs', () => {
    expect(1 + 1).toBe(2);
  });
});
```
Run: `npm test`
Expected: 1 test passes. Then delete this file — it was only to confirm the harness works; real tests are written in the following tasks.

- [ ] **Step 5: Commit**

```powershell
git add vitest.config.ts package.json package-lock.json
git commit -m "chore: set up Vitest for lib unit tests"
```

---

### Task 5: `lib/generate-reference.ts` — client-side creator_reference generator

The backend requires `creator_reference` to be a trimmed string of exactly 20 characters. The frontend generates this client-side at create time (the user never types it).

**Files:**
- Create: `lib/generate-reference.ts`
- Test: `lib/__tests__/generate-reference.test.ts`

- [ ] **Step 1: Write the failing test**

Create `lib/__tests__/generate-reference.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { generateCreatorReference } from '../generate-reference';

describe('generateCreatorReference', () => {
  it('returns a string of exactly 20 characters', () => {
    const ref = generateCreatorReference();
    expect(ref).toHaveLength(20);
  });

  it('only contains alphanumeric characters', () => {
    const ref = generateCreatorReference();
    expect(ref).toMatch(/^[a-zA-Z0-9]{20}$/);
  });

  it('returns a different value on each call', () => {
    const a = generateCreatorReference();
    const b = generateCreatorReference();
    expect(a).not.toBe(b);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test`
Expected: FAIL — `Cannot find module '../generate-reference'`.

- [ ] **Step 3: Implement `lib/generate-reference.ts`**

```ts
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

export function generateCreatorReference(): string {
  let result = '';
  for (let i = 0; i < 20; i += 1) {
    result += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return result;
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test`
Expected: all 3 tests pass.

- [ ] **Step 5: Commit**

```powershell
git add lib/generate-reference.ts lib/__tests__/generate-reference.test.ts
git commit -m "feat: add client-side creator_reference generator"
```

---

### Task 6: `lib/api.ts` — typed fetch wrapper

**Files:**
- Create: `lib/api.ts`
- Test: `lib/__tests__/api.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `lib/__tests__/api.test.ts`:
```ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { apiFetch } from '../api';

const originalFetch = global.fetch;

beforeEach(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://api.test';
});

afterEach(() => {
  global.fetch = originalFetch;
  vi.restoreAllMocks();
});

describe('apiFetch', () => {
  it('returns ok:true with data on a successful response', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ status: 'success', message: 'ok', data: { slug: 'abc' } }),
    }) as unknown as typeof fetch;

    const result = await apiFetch<{ slug: string }>('/creator-cards/abc');

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.slug).toBe('abc');
    }
  });

  it('returns ok:false with the backend message on an error response', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({ status: 'error', message: 'Creator card not found', code: 'NF01' }),
    }) as unknown as typeof fetch;

    const result = await apiFetch('/creator-cards/missing');

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toBe('Creator card not found');
      expect(result.code).toBe('NF01');
      expect(result.status).toBe(404);
    }
  });

  it('returns a generic message when fetch itself throws (network failure)', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('network down')) as unknown as typeof fetch;

    const result = await apiFetch('/creator-cards/abc');

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toBe('Something went wrong — check your connection.');
      expect(result.status).toBe(0);
    }
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test`
Expected: FAIL — `Cannot find module '../api'`.

- [ ] **Step 3: Implement `lib/api.ts`**

```ts
export type ApiSuccess<T> = { ok: true; status: number; data: T };
export type ApiFailure = { ok: false; status: number; message: string; code?: string };
export type ApiResult<T> = ApiSuccess<T> | ApiFailure;

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<ApiResult<T>> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  let res: Response;

  try {
    res = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    });
  } catch {
    return { ok: false, status: 0, message: 'Something went wrong — check your connection.' };
  }

  let body: { status?: string; message?: string; data?: T; code?: string } | null = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }

  if (!res.ok) {
    return {
      ok: false,
      status: res.status,
      message: body?.message || 'Something went wrong.',
      code: body?.code,
    };
  }

  return { ok: true, status: res.status, data: (body?.data as T) ?? (body as T) };
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test`
Expected: all tests pass (4 total counting Task 5's).

- [ ] **Step 5: Commit**

```powershell
git add lib/api.ts lib/__tests__/api.test.ts
git commit -m "feat: add typed apiFetch wrapper for the backend API"
```

---

### Task 7: `lib/local-cards.ts` — localStorage helper for "my cards"

**Files:**
- Create: `lib/local-cards.ts`
- Test: `lib/__tests__/local-cards.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `lib/__tests__/local-cards.test.ts`:
```ts
import { describe, it, expect, beforeEach } from 'vitest';
import { getMyCards, addMyCard, removeMyCard, findMyCard } from '../local-cards';

beforeEach(() => {
  window.localStorage.clear();
});

describe('local-cards', () => {
  it('returns an empty array when nothing has been saved', () => {
    expect(getMyCards()).toEqual([]);
  });

  it('adds a card and retrieves it', () => {
    addMyCard({ slug: 'my-card', creator_reference: 'a'.repeat(20), title: 'My Card' });
    expect(getMyCards()).toEqual([{ slug: 'my-card', creator_reference: 'a'.repeat(20), title: 'My Card' }]);
  });

  it('finds a saved card by slug', () => {
    addMyCard({ slug: 'find-me', creator_reference: 'b'.repeat(20), title: 'Find Me' });
    expect(findMyCard('find-me')?.creator_reference).toBe('b'.repeat(20));
    expect(findMyCard('does-not-exist')).toBeUndefined();
  });

  it('removes a saved card by slug', () => {
    addMyCard({ slug: 'remove-me', creator_reference: 'c'.repeat(20), title: 'Remove Me' });
    removeMyCard('remove-me');
    expect(findMyCard('remove-me')).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test`
Expected: FAIL — `Cannot find module '../local-cards'`.

- [ ] **Step 3: Implement `lib/local-cards.ts`**

```ts
const STORAGE_KEY = 'creator-cards:mine';

export type MyCard = {
  slug: string;
  creator_reference: string;
  title: string;
};

export function getMyCards(): MyCard[] {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function addMyCard(card: MyCard): void {
  const existing = getMyCards().filter((c) => c.slug !== card.slug);
  existing.push(card);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
}

export function removeMyCard(slug: string): void {
  const remaining = getMyCards().filter((c) => c.slug !== slug);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(remaining));
}

export function findMyCard(slug: string): MyCard | undefined {
  return getMyCards().find((c) => c.slug === slug);
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test`
Expected: all tests pass (8 total counting prior tasks).

- [ ] **Step 5: Commit**

```powershell
git add lib/local-cards.ts lib/__tests__/local-cards.test.ts
git commit -m "feat: add localStorage helper for remembering created cards"
```

---

### Task 8: Shared UI primitives

**Files:**
- Create: `components/Button.tsx`
- Create: `components/Input.tsx`
- Create: `components/Card.tsx`
- Create: `components/Badge.tsx`
- Create: `components/ErrorBanner.tsx`

These are presentational only — no unit tests (no logic to test beyond prop pass-through); they get exercised through the pages built in Tasks 9-11 and manual browser testing in Task 12.

- [ ] **Step 1: Create `components/Button.tsx`**

```tsx
import { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'danger';

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: 'bg-indigo-600 hover:bg-indigo-500 text-white',
  secondary: 'bg-zinc-800 hover:bg-zinc-700 text-zinc-100',
  danger: 'bg-red-600 hover:bg-red-500 text-white',
};

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant };

export function Button({ variant = 'primary', className = '', ...rest }: Props) {
  return (
    <button
      className={`rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${VARIANT_CLASSES[variant]} ${className}`}
      {...rest}
    />
  );
}
```

- [ ] **Step 2: Create `components/Input.tsx`**

```tsx
import { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';

type InputProps = InputHTMLAttributes<HTMLInputElement> & { label?: string };

export function Input({ label, id, className = '', ...rest }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-sm text-zinc-400">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-indigo-500 focus:outline-none ${className}`}
        {...rest}
      />
    </div>
  );
}

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string };

export function Textarea({ label, id, className = '', ...rest }: TextareaProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-sm text-zinc-400">
          {label}
        </label>
      )}
      <textarea
        id={id}
        className={`rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-indigo-500 focus:outline-none ${className}`}
        {...rest}
      />
    </div>
  );
}
```

- [ ] **Step 3: Create `components/Card.tsx`**

```tsx
import { ReactNode } from 'react';

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-lg border border-zinc-800 bg-zinc-900/50 p-6 ${className}`}>
      {children}
    </div>
  );
}
```

- [ ] **Step 4: Create `components/Badge.tsx`**

```tsx
type Tone = 'neutral' | 'success' | 'warning';

const TONE_CLASSES: Record<Tone, string> = {
  neutral: 'bg-zinc-800 text-zinc-300',
  success: 'bg-emerald-900 text-emerald-300',
  warning: 'bg-amber-900 text-amber-300',
};

export function Badge({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: Tone }) {
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${TONE_CLASSES[tone]}`}>
      {children}
    </span>
  );
}
```

- [ ] **Step 5: Create `components/ErrorBanner.tsx`**

```tsx
export function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="rounded-md border border-red-800 bg-red-950/50 px-4 py-3 text-sm text-red-300">
      {message}
    </div>
  );
}
```

- [ ] **Step 6: Commit**

```powershell
git add components
git commit -m "feat: add shared dark-theme UI primitives"
```

---

### Task 9: Home page (`/`)

**Files:**
- Modify: `app/page.tsx` (replace the `create-next-app` boilerplate)

- [ ] **Step 1: Replace `app/page.tsx`**

```tsx
'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';

export default function HomePage() {
  const router = useRouter();
  const [slug, setSlug] = useState('');

  function handleFind(event: FormEvent) {
    event.preventDefault();
    const trimmed = slug.trim();
    if (trimmed) {
      router.push(`/c/${trimmed}`);
    }
  }

  return (
    <main className="flex flex-col gap-8">
      <Card>
        <h1 className="text-xl font-semibold text-zinc-100">Share who you are in one link</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Create a simple public card with your links and service rates, then share the link.
        </p>
        <a href="/create" className="mt-4 inline-block">
          <Button>Create a card</Button>
        </a>
      </Card>

      <Card>
        <h2 className="text-sm font-medium text-zinc-300">Find a card</h2>
        <form onSubmit={handleFind} className="mt-3 flex gap-2">
          <Input
            aria-label="Card slug"
            placeholder="card-slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" variant="secondary">
            View
          </Button>
        </form>
      </Card>
    </main>
  );
}
```

- [ ] **Step 2: Verify manually**

Run: `npm run dev -- -p 3001`, open `http://localhost:3001`.
Expected: dark page with "Create a card" button and a "Find a card" box. Typing a slug and clicking View navigates to `/c/<slug>` (will 404/error until Task 11 exists — that's expected at this point).

- [ ] **Step 3: Commit**

```powershell
git add app/page.tsx
git commit -m "feat: add home page with create CTA and find-by-slug"
```

---

### Task 10: Create page (`/create`)

**Files:**
- Create: `app/create/page.tsx`

- [ ] **Step 1: Create `app/create/page.tsx`**

```tsx
'use client';

import { useState, FormEvent } from 'react';
import { apiFetch } from '@/lib/api';
import { generateCreatorReference } from '@/lib/generate-reference';
import { addMyCard } from '@/lib/local-cards';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input, Textarea } from '@/components/Input';
import { ErrorBanner } from '@/components/ErrorBanner';

type LinkRow = { title: string; url: string };

type CreatedCard = { slug: string; creator_reference: string };

export default function CreatePage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [slug, setSlug] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('published');
  const [accessType, setAccessType] = useState<'public' | 'private'>('public');
  const [accessCode, setAccessCode] = useState('');
  const [links, setLinks] = useState<LinkRow[]>([{ title: '', url: '' }]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<CreatedCard | null>(null);

  function updateLink(index: number, field: keyof LinkRow, value: string) {
    setLinks((prev) => prev.map((link, i) => (i === index ? { ...link, [field]: value } : link)));
  }

  function addLinkRow() {
    setLinks((prev) => [...prev, { title: '', url: '' }]);
  }

  function removeLinkRow(index: number) {
    setLinks((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    const creatorReference = generateCreatorReference();
    const cleanLinks = links.filter((l) => l.title.trim() && l.url.trim());

    const result = await apiFetch<{ slug: string }>('/creator-cards', {
      method: 'POST',
      body: JSON.stringify({
        title,
        description: description || undefined,
        slug: slug || undefined,
        creator_reference: creatorReference,
        links: cleanLinks.length ? cleanLinks : undefined,
        status,
        access_type: accessType,
        access_code: accessType === 'private' ? accessCode : undefined,
      }),
    });

    setSubmitting(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    addMyCard({ slug: result.data.slug, creator_reference: creatorReference, title });
    setCreated({ slug: result.data.slug, creator_reference: creatorReference });
  }

  if (created) {
    return (
      <main>
        <Card>
          <h1 className="text-lg font-semibold text-emerald-300">Card created</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Save your reference code now — you will need it to delete this card later, and it is
            only remembered in this browser.
          </p>
          <dl className="mt-4 space-y-3">
            <div>
              <dt className="text-xs text-zinc-500">Slug</dt>
              <dd className="font-mono text-sm text-zinc-100">{created.slug}</dd>
            </div>
            <div>
              <dt className="text-xs text-zinc-500">Reference code</dt>
              <dd className="font-mono text-sm text-zinc-100">{created.creator_reference}</dd>
            </div>
          </dl>
          <a href={`/c/${created.slug}`} className="mt-6 inline-block">
            <Button>View your card</Button>
          </a>
        </Card>
      </main>
    );
  }

  return (
    <main>
      <Card>
        <h1 className="text-lg font-semibold text-zinc-100">Create a card</h1>
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          <Input
            label="Title"
            required
            minLength={3}
            maxLength={100}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Textarea
            label="Description"
            maxLength={500}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Input
            label="Custom slug (optional)"
            placeholder="leave blank to auto-generate"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
          />

          <div>
            <p className="text-sm text-zinc-400">Links</p>
            <div className="mt-2 flex flex-col gap-2">
              {links.map((link, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="Title"
                    value={link.title}
                    onChange={(e) => updateLink(index, 'title', e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    placeholder="https://..."
                    value={link.url}
                    onChange={(e) => updateLink(index, 'url', e.target.value)}
                    className="flex-1"
                  />
                  <Button type="button" variant="secondary" onClick={() => removeLinkRow(index)}>
                    Remove
                  </Button>
                </div>
              ))}
            </div>
            <Button type="button" variant="secondary" className="mt-2" onClick={addLinkRow}>
              Add link
            </Button>
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm text-zinc-300">
              <input
                type="radio"
                name="status"
                checked={status === 'published'}
                onChange={() => setStatus('published')}
              />
              Published
            </label>
            <label className="flex items-center gap-2 text-sm text-zinc-300">
              <input
                type="radio"
                name="status"
                checked={status === 'draft'}
                onChange={() => setStatus('draft')}
              />
              Draft
            </label>
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm text-zinc-300">
              <input
                type="radio"
                name="access_type"
                checked={accessType === 'public'}
                onChange={() => setAccessType('public')}
              />
              Public
            </label>
            <label className="flex items-center gap-2 text-sm text-zinc-300">
              <input
                type="radio"
                name="access_type"
                checked={accessType === 'private'}
                onChange={() => setAccessType('private')}
              />
              Private
            </label>
          </div>

          {accessType === 'private' && (
            <Input
              label="Access code (6 alphanumeric characters)"
              required
              maxLength={6}
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
            />
          )}

          {error && <ErrorBanner message={error} />}

          <Button type="submit" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create card'}
          </Button>
        </form>
      </Card>
    </main>
  );
}
```

- [ ] **Step 2: Verify manually against the running backend**

Run the backend (`cd C:\Users\CHIKODI\Desktop\node-template && node app.js`, port 3000) and the frontend (`npm run dev -- -p 3001`) side by side. Open `http://localhost:3001/create`, fill in a title, submit.
Expected: success screen shows a slug and a 20-character reference code. Submitting with a duplicate slug shows the `ErrorBanner` with "Slug is already taken".

- [ ] **Step 3: Commit**

```powershell
git add app/create/page.tsx
git commit -m "feat: add create-card page with link rows and access-type toggle"
```

---

### Task 11: View/manage page (`/c/[slug]`)

**Files:**
- Create: `app/c/[slug]/page.tsx`

- [ ] **Step 1: Create `app/c/[slug]/page.tsx`**

```tsx
'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useParams } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { findMyCard, removeMyCard } from '@/lib/local-cards';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Badge } from '@/components/Badge';
import { ErrorBanner } from '@/components/ErrorBanner';

type CardData = {
  title: string;
  description: string | null;
  slug: string;
  links: { title: string; url: string }[];
  service_rates: { currency: string; rates: { name: string; description?: string; amount: number }[] } | null;
  status: 'draft' | 'published';
  access_type: 'public' | 'private';
};

const ACCESS_CODE_NEEDED_CODES = ['AC03', 'AC04'];

export default function CardViewPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const [card, setCard] = useState<CardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [needsAccessCode, setNeedsAccessCode] = useState(false);
  const [accessCode, setAccessCode] = useState('');

  const [creatorReference, setCreatorReference] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleted, setDeleted] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  async function load(code?: string) {
    setLoading(true);
    setError(null);
    setNeedsAccessCode(false);

    const query = code ? `?access_code=${encodeURIComponent(code)}` : '';
    const result = await apiFetch<CardData>(`/creator-cards/${slug}${query}`);

    setLoading(false);

    if (!result.ok) {
      if (result.code && ACCESS_CODE_NEEDED_CODES.includes(result.code)) {
        setNeedsAccessCode(true);
        if (result.code === 'AC04') {
          setError(result.message);
        }
        return;
      }
      setError(result.message);
      return;
    }

    setCard(result.data);
  }

  useEffect(() => {
    load();
    const saved = findMyCard(slug);
    if (saved) {
      setCreatorReference(saved.creator_reference);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  function handleAccessCodeSubmit(event: FormEvent) {
    event.preventDefault();
    load(accessCode);
  }

  async function handleDelete() {
    setDeleting(true);
    setDeleteError(null);

    const result = await apiFetch(`/creator-cards/${slug}`, {
      method: 'DELETE',
      body: JSON.stringify({ creator_reference: creatorReference }),
    });

    setDeleting(false);

    if (!result.ok) {
      setDeleteError(result.message);
      return;
    }

    removeMyCard(slug);
    setDeleted(true);
  }

  if (loading) {
    return <p className="text-sm text-zinc-400">Loading...</p>;
  }

  if (needsAccessCode) {
    return (
      <Card>
        <h1 className="text-lg font-semibold text-zinc-100">This card is private</h1>
        <p className="mt-2 text-sm text-zinc-400">Enter the access code to view it.</p>
        <form onSubmit={handleAccessCodeSubmit} className="mt-4 flex gap-2">
          <Input
            aria-label="Access code"
            maxLength={6}
            value={accessCode}
            onChange={(e) => setAccessCode(e.target.value)}
          />
          <Button type="submit">Unlock</Button>
        </form>
        {error && <div className="mt-3"><ErrorBanner message={error} /></div>}
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <ErrorBanner message={error} />
        <a href="/" className="mt-4 inline-block text-sm text-indigo-400 hover:underline">
          Back home
        </a>
      </Card>
    );
  }

  if (!card) {
    return null;
  }

  if (deleted) {
    return (
      <Card>
        <p className="text-sm text-emerald-300">This card has been deleted.</p>
        <a href="/" className="mt-4 inline-block text-sm text-indigo-400 hover:underline">
          Back home
        </a>
      </Card>
    );
  }

  return (
    <main className="flex flex-col gap-6">
      <Card>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold text-zinc-100">{card.title}</h1>
          <Badge tone={card.status === 'published' ? 'success' : 'warning'}>{card.status}</Badge>
        </div>
        {card.description && <p className="mt-2 text-sm text-zinc-400">{card.description}</p>}

        {card.links.length > 0 && (
          <ul className="mt-4 flex flex-col gap-1">
            {card.links.map((link) => (
              <li key={link.url}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-indigo-400 hover:underline"
                >
                  {link.title}
                </a>
              </li>
            ))}
          </ul>
        )}

        {card.service_rates && (
          <div className="mt-4">
            <p className="text-sm text-zinc-400">Service rates ({card.service_rates.currency})</p>
            <ul className="mt-2 flex flex-col gap-1">
              {card.service_rates.rates.map((rate) => (
                <li key={rate.name} className="text-sm text-zinc-300">
                  {rate.name} — {rate.amount} {card.service_rates!.currency}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>

      <Card>
        <h2 className="text-sm font-medium text-zinc-300">Manage this card</h2>
        <div className="mt-3 flex flex-col gap-3">
          <Input
            label="Reference code"
            value={creatorReference}
            onChange={(e) => setCreatorReference(e.target.value)}
          />
          {!confirmingDelete ? (
            <Button variant="danger" onClick={() => setConfirmingDelete(true)}>
              Delete card
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-sm text-zinc-400">Are you sure?</span>
              <Button variant="danger" disabled={deleting} onClick={handleDelete}>
                {deleting ? 'Deleting...' : 'Yes, delete'}
              </Button>
              <Button variant="secondary" onClick={() => setConfirmingDelete(false)}>
                Cancel
              </Button>
            </div>
          )}
          {deleteError && <ErrorBanner message={deleteError} />}
        </div>
      </Card>
    </main>
  );
}
```

- [ ] **Step 2: Verify manually against the running backend**

With both servers running, visit `/c/<slug>` for a card created in Task 10.
Expected: card renders with title/description/links/status badge. Test the private-card path by creating a private card and confirming the access-code prompt appears, then unlocks with the right code and shows an error with the wrong one. Test delete: with the correct reference code pre-filled (from localStorage, same browser), click Delete card → Yes, delete → see "This card has been deleted." With a wrong reference code, expect `ErrorBanner` showing "You are not authorized to delete this card".

- [ ] **Step 3: Commit**

```powershell
git add app/c
git commit -m "feat: add card view page with access-code gate and delete flow"
```

---

### Task 12: Full manual verification pass and README

**Files:**
- Create: `README.md`

- [ ] **Step 1: Write `README.md`**

```markdown
# Creator Cards Frontend

Simple dark-themed Next.js UI for the creator-cards API: create, view, and delete public/private creator cards.

## Setup

\`\`\`bash
npm install
cp .env.local.example .env.local
# edit .env.local to point NEXT_PUBLIC_API_URL at your running backend
npm run dev
\`\`\`

## Testing

\`\`\`bash
npm test
\`\`\`

## Deployment

Deploy to Vercel as a standalone project. Set `NEXT_PUBLIC_API_URL` in the Vercel project's environment variables to the deployed backend URL.
```

- [ ] **Step 2: Run the full test suite**

Run: `npm test`
Expected: all unit tests (Tasks 5-7) pass.

- [ ] **Step 3: Run a production build**

Run: `npm run build`
Expected: build completes with no type errors.

- [ ] **Step 4: Manual end-to-end pass with the real backend running**

With the backend (`C:\Users\CHIKODI\Desktop\node-template`, running `node app.js`) and `NEXT_PUBLIC_API_URL` pointed at it:
1. Home → Create a card → fill form, submit → see slug + reference code.
2. Click "View your card" → confirm rendering.
3. Go back to Home, paste the slug into "Find a card" → confirms navigation works from a fresh load (simulates a different visit).
4. On the card page, delete with the correct reference code → confirm deletion succeeds and the page shows the deleted message.
5. Try viewing the now-deleted slug again → confirm `ErrorBanner` shows "Creator card not found".
6. Create a private card, view it in an incognito/different browser context (no localStorage) → confirm the access-code prompt appears and gates the content correctly.

- [ ] **Step 5: Commit**

```powershell
git add README.md
git commit -m "docs: add frontend README with setup and deployment notes"
```

---

## Self-review notes

- Every page/flow from the design spec (home, create, view, access-code gate, delete) has a corresponding task.
- `apiFetch`'s `ApiResult<T>` type, `MyCard` type, and the card `data` shape are defined once (Tasks 6-7) and reused with matching field names in Tasks 9-11 — no renamed duplicates.
- No task contains placeholder text; every code-bearing step has complete, runnable code.
- Login/auth, card listing, and editing are explicitly out of scope per the design spec and have no tasks here.
