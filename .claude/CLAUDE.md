# payload-help-docs — Project Guide

## What This Project Is

A standalone Payload CMS used as a **centralised help documentation system** for MXM Studio client websites.

Each client site (built on the `payload-template`) has a custom Help & Guides page embedded in their Payload admin at `/admin/help`. That page currently fetches content from a Sanity CMS. This project **replaces Sanity** as the content source — the client admin pages will fetch from this Payload instance instead.

This project has no client-facing frontend. It is purely a content management tool — articles are written here, and served via the Payload REST API to wherever they're needed.

## Who I Am

I'm Michelle. I'm not a developer — I'm a former WordPress designer learning Next.js. I use Payload CMS hosted on Vercel. I need things explained in plain language (some technical terms are fine). I always want big changes confirmed before we go ahead. Don't just start rewriting files — walk me through what you're going to do first.

## Infrastructure Stack

- **Framework:** Next.js 15 + Payload v3
- **Database:** Neon PostgreSQL (dedicated project for this app)
- **Media storage:** Vercel Blob
- **Hosting:** Vercel
- **Package manager:** pnpm

## What's Being Built

### Two Collections

**HelpCategories**
- `title` — e.g. "Getting Started", "Blog", "Shop"
- `slug` — auto-generated from title
- `description` — short summary shown on the category card
- `order` — number controlling display order (lower = first)

**HelpArticles**
- `title` — article heading
- `slug` — auto-generated from title
- `excerpt` — one-liner shown on the article listing card (max 200 chars)
- `category` — relationship to a HelpCategory
- `order` — display order within the category
- `body` — Lexical rich text (headings, bold, italic, links, bullet/numbered lists, images with alt + caption)

### One API Endpoint

A public (no auth required) REST endpoint that returns all categories with their articles nested inside — the shape the `HelpView` component in the client template expects.

The endpoint shape:
```json
[
  {
    "id": "...",
    "title": "Getting Started",
    "slug": "getting-started",
    "description": "...",
    "order": 1,
    "articles": [
      {
        "id": "...",
        "title": "How to log in",
        "slug": "how-to-log-in",
        "excerpt": "...",
        "order": 1,
        "body": { ... } // Lexical JSON
      }
    ]
  }
]
```

## How the Client Template Consumes This

In the `payload-template` repo, three files need updating once this project is live:

1. `src/lib/help/sanityHelpClient.ts` → replaced with `payloadHelpClient.ts` that fetches from this project's API
2. `src/components/Help/PortableText.tsx` → replaced with a Lexical renderer (template already has `@payloadcms/richtext-lexical/react` available)
3. `src/components/Help/HelpView.tsx` → import updated to use new client

The API URL will be set via an environment variable in the template: `NEXT_PUBLIC_HELP_DOCS_URL`

## Tier Gating

The client `HelpView` already handles tier gating on the consumer side — it filters categories based on the client's tier (static/basic/full). This project does **not** need to know about tiers. All content is served; the client decides what to show.

Category slugs used for tier gating in the template (don't change these):
- `blog`
- `shop`
- `menu`
- `gallery`
- `pages-and-seo`

## Important Rules

- **Always confirm before creating or modifying files.** Tell me what you plan to do and why, then wait for my go-ahead.
- **One step at a time.** Each change should be working before moving on.
- **Explain what you're doing** as you go — not a wall of text, but enough that I understand the why.
- **Git — always use the Cursor terminal for commits and pushes.** Claude runs in a Linux sandbox with the project folder mounted from macOS — git can't properly clean up its lock files across that boundary, causing `fatal: Unable to create index.lock` errors.

## Current Status

- [ ] Scaffold fresh Payload project (`create-payload-app`)
- [ ] Create `HelpCategories` collection
- [ ] Create `HelpArticles` collection
- [ ] Create public API endpoint returning categories + nested articles
- [ ] Deploy to Vercel
- [ ] Migrate content from Sanity (22 articles across 8 categories)
- [ ] Update `payload-template` to fetch from this project instead of Sanity
- [ ] Test end-to-end on a client site
- [ ] Retire Sanity project
