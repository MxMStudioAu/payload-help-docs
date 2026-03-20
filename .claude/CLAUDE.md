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
        "helpRefs": ["dashboard.login", "gettingStarted.overview"], // flat string array
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

- [x] Scaffold fresh Payload project (`create-payload-app`)
- [x] Create `HelpCategories` collection
- [x] Create `HelpArticles` collection
- [x] Create public API endpoint returning categories + nested articles
- [x] Deploy to Vercel
- [x] Migrate content from Sanity (22 articles across 8 categories)
- [x] Update `payload-template` to fetch from this project instead of Sanity
- [x] Test end-to-end on a client site
- [x] Retire Sanity project
- [x] Add `helpRefs` field to HelpArticles (for future tooltip integration in the template)

---

## Help Doc Content Plan

> **Remove this section once all articles are written.**
>
> Articles written before many features existed and need rewriting are marked with ✏️. Brand new articles are unmarked. Tick each one off as it's done.
>
> **Tone guide:** Short sentences. Practical. Tells the client *why*, not just *how*. Doesn't assume CMS knowledge but doesn't talk down to them either. See the "How to reorder your gallery" example written in the March 2026 session as a style reference.
>
> **helpRefs:** When writing each article, add ref keys to the Help References field using a `section.thing` pattern (e.g. `gallery.sortOrder`, `media.photoEditor`). These are used later to wire up contextual tooltips in the admin. You decide what makes sense — one article can have multiple refs.

### Getting Started
- [ ] ✏️ How to log in and find your way around
- [ ] ✏️ How to save and publish changes
- [ ] ✏️ Understanding draft vs published — and why the list says "Published" even when you have unsaved changes
- [ ] Understanding your plan — why some features aren't visible
- [ ] The visible toggle — hiding content without deleting it
- [ ] Marking content as featured
- [ ] Scheduling content to publish at a future date
- [ ] How to preview your site before publishing (Live Preview)
- [ ] How versions work — viewing and restoring older saves

### Your Dashboard *(new category)*
- [ ] Understanding your dashboard — what everything means at a glance
- [ ] The site progress bar — how your setup score is calculated
- [ ] Site Health — what essentials, recommended, and suggestions mean
- [ ] Search Readiness — understanding your SEO check results
- [ ] The Unpublished Drafts card
- [ ] Quick Actions — what each card does
- [ ] Site Views — understanding your visitor analytics

### Site Manager *(new category)*
- [ ] Overview of the Site Manager
- [ ] Setting up your header navigation (including dropdowns)
- [ ] Setting up your footer navigation
- [ ] Setting up and managing redirects
- [ ] Creating contact forms and viewing submissions
- [ ] Adding and managing admin users
- [ ] User roles — what admin, editor, and viewer can do
- [ ] Permissions — locking down layouts and navigation
- [ ] Toggling content features on and off (Features tab)

### Media & Images *(new category)*
- [ ] Uploading images — file types, sizes, and what happens on upload
- [ ] Browsing and organising your media library
- [ ] Media categories and tags — keeping things tidy
- [ ] Writing good alt text (and why it matters)
- [ ] SEO filenames — what they are and why they help
- [ ] Captions — where they appear on the site
- [ ] Setting a focal point — how it affects image cropping
- [ ] Using the Photo Editor — rotation, brightness, contrast, and filters

### AI Writing Assistant *(new category)*
- [ ] What the AI writing assistant can do
- [ ] How your brand voice settings shape AI suggestions
- [ ] Using AI on meta titles and descriptions
- [ ] Using AI on alt text and SEO filenames
- [ ] Tips for getting better results — when to accept, edit, or try again

### Testimonials
- [ ] ✏️ Adding and editing testimonials
- [ ] ✏️ Star ratings and how they appear on the site
- [ ] Marking a testimonial as featured
- [ ] Hiding a testimonial without deleting it (visible toggle)

### Blog *(tier-gated — slug: `blog`)*
- [ ] ✏️ Writing and publishing a blog post
- [ ] ✏️ Adding a hero image to a post
- [ ] ✏️ Blog categories — setting them up and assigning posts
- [ ] Adding related posts
- [ ] Marking a post as featured
- [ ] Hiding a post without deleting it (visible toggle)

### Shop *(tier-gated — slug: `shop`)*
- [ ] ✏️ Adding and editing shop items
- [ ] ✏️ Shop categories
- [ ] Controlling display order
- [ ] Marking an item as featured
- [ ] Hiding an item without deleting it (visible toggle)

### Menu *(tier-gated — slug: `menu`)*
- [ ] ✏️ Adding and editing menu items
- [ ] ✏️ Menu categories
- [ ] Controlling display order
- [ ] Marking an item as featured
- [ ] Hiding an item without deleting it (visible toggle)

### Gallery *(tier-gated — slug: `gallery`)*
- [ ] ✏️ Adding images to your gallery
- [ ] ✏️ Gallery categories
- [ ] Controlling display order
- [ ] Marking an image as featured
- [ ] Hiding an image without deleting it (visible toggle)

### Pages & SEO *(tier-gated — slug: `pages-and-seo`)*
- [ ] ✏️ Editing your homepage
- [ ] ✏️ Writing good meta titles and descriptions
- [ ] Hero options — choosing image, heading, subheading, buttons, and size
- [ ] Adding and arranging content blocks
- [ ] Block styling — background colours, images, overlays, and padding
- [ ] Scroll animations — choosing how blocks appear on screen
- [ ] SEO share images — what they are and how they look on social media
- [ ] Creating new pages (full tier)
- [ ] Managing navigation (full tier)
- [ ] Setting up redirects (full tier)
