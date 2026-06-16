# Creator Card Frontend — Design

## Goal

Build a simple, dark-themed, public demo UI for the existing creator-cards API (create, view, delete) using Next.js + Tailwind, deployable to Vercel independently of the backend.

## Repo layout

Move the existing backend repo and add a sibling frontend, both under one parent folder:

```
Desktop/creator-card/
  backend/    <- moved from Desktop/node-template, git history preserved
  frontend/   <- new Next.js app, own git repo
```

The `backend` move is a plain filesystem move (not a git operation) — the existing `.git` history travels with it. The `frontend` folder is a brand-new git repo, initialized separately, and pushed to its own GitHub remote for Vercel deployment.

## Stack

- Next.js 14 (App Router), TypeScript
- Tailwind CSS, dark theme only (no light/dark toggle)
- No component library, no state management library — local component state + `localStorage` for remembering created cards
- No auth — every endpoint used is public; `/login` is intentionally not used

## API surface consumed

Backend exposes (no auth required):

- `POST /creator-cards` — create. Body: `title`, `description?`, `slug?`, `creator_reference` (exactly 20 chars, client-generated), `links[]?`, `service_rates?`, `status` (`draft|published`), `access_type?` (`public|private`), `access_code?` (6 alphanumeric, required if private).
- `GET /creator-cards/:slug?access_code=` — fetch by slug. Private cards require matching `access_code`.
- `DELETE /creator-cards/:slug` — body: `creator_reference`. Only succeeds if it matches the card's stored reference.

Error responses are JSON `{ message, code }` with a non-2xx HTTP status. The frontend treats `message` as the user-facing string in all cases.

## Pages

### `/` — Home
- Short intro + "Create a card" button → `/create`.
- A "Find a card" input (slug) that navigates to `/c/[slug]`.

### `/create` — Create a card
- Form fields: title, description, slug (optional, helper text explains auto-generation if blank), links (repeatable title+url rows), service_rates (currency + repeatable rate rows, optional section), status (draft/published), access_type (public/private — toggling reveals access_code field), access_code.
- `creator_reference` is generated client-side (random 20-char alphanumeric string) and is **not** a user-facing field — shown only after creation.
- On submit: calls `POST /creator-cards`. On success, shows a confirmation panel with the resulting `slug` and `creator_reference`, a copy-to-clipboard button for each, and a clear warning: "Save this reference code — you'll need it to delete this card later, and we don't store it for you beyond this browser." Also appends `{slug, creator_reference, title}` to a `localStorage` list (`creator-cards:mine`) so the current browser can find it again later.
- On error: renders the API's `message` in a shared `ErrorBanner`, inline above the submit button. Validation-style errors (e.g. invalid slug format, missing access_code) map 1:1 to the message text — no client-side re-derivation of validation rules beyond basic required-field checks, since the backend is the source of truth.

### `/c/[slug]` — View a card
- On load, `GET /creator-cards/:slug`.
- If the response is `ACCESS_CODE_MISSING` or `ACCESS_CODE_INVALID` (or any error containing those messages), render an inline access-code prompt form instead of an error page; submitting re-fetches with `?access_code=`.
- If `CARD_NOT_FOUND` (or any other error), render the `ErrorBanner` with the message and a link back home.
- On success, render: title, status badge, description, links list (opens in new tab), service rates table (if present).
- "Manage this card" collapsible section: a `creator_reference` input (pre-filled if this slug exists in the `creator-cards:mine` localStorage list) + a "Delete card" button with a confirm step. Calls `DELETE /creator-cards/:slug`; success shows a confirmation message and removes the entry from localStorage; failure shows the API's error message (e.g. "You are not authorized to delete this card") via `ErrorBanner`.

No separate delete route — folded into the card view page per above.

## Shared pieces

- `lib/api.ts` — `apiFetch(path, options)` wrapper around `fetch` using `NEXT_PUBLIC_API_URL`. Never throws for handled API errors: returns `{ ok: boolean, status: number, data?: T, message?: string, code?: string }`. Only throws for genuine network failures, which callers catch and show as a generic "Something went wrong — check your connection" message.
- `components/ErrorBanner.tsx` — consistent red-bordered, dark-themed error display, takes a `message` string.
- `components/Card.tsx`, `Button.tsx`, `Input.tsx`, `Badge.tsx` — small shared UI primitives, Tailwind-only, no external UI library.
- `lib/local-cards.ts` — typed helpers around the `creator-cards:mine` localStorage list (get, add, remove, find by slug).

## Styling

Dark theme via Tailwind: `bg-zinc-950` / `text-zinc-100` base, `indigo-500` accent for buttons/links, `red-500`-ish tones for errors, `emerald-500`-ish for success confirmations. No theme toggle — dark only, per requirement.

## Config

Single env var: `NEXT_PUBLIC_API_URL` (e.g. `http://localhost:3000` locally, the deployed backend URL in Vercel env settings for production).

## Out of scope

- Auth / login UI (API has no auth-gated card endpoints to justify it)
- Listing/searching all cards (no such backend endpoint exists)
- Editing a card after creation (no update endpoint exists)
- Server-side rendering of card data for SEO (acceptable as a client-fetched demo UI; can revisit later)
