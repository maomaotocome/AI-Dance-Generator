# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an **AI Dance Generator** website built on [ShipAny Template Two](https://shipany.ai) - a Next.js 16 AI SaaS boilerplate. The site allows users to upload a photo, select a dance template, and generate AI-powered dance videos.

## Build & Development Commands

```bash
# Development
npm run dev              # Start dev server with Turbopack
npm run build            # Production build
npm run build:fast       # Build with 4GB Node memory
npm run start            # Start production server

# Code Quality
npm run lint             # ESLint
npm run format           # Format with Prettier
npm run format:check     # Check formatting

# Database (Drizzle ORM)
npm run db:generate      # Generate migrations
npm run db:migrate       # Run migrations
npm run db:push          # Push schema to database
npm run db:studio        # Open Drizzle Studio

# Auth & RBAC
npm run auth:generate    # Generate Better Auth config
npm run rbac:init        # Initialize roles/permissions

# Cloudflare Workers Deployment
npm run cf:deploy        # Deploy to Cloudflare
npm run cf:preview       # Preview deployment
```

## ShipAny Template Architecture

### Core Concepts

**1. Landing Page Configuration (JSON-Driven)**

Landing pages are configured via JSON in `src/config/locale/messages/{locale}/pages/`:
```json
{
  "page": {
    "show_sections": ["hero", "generator", "features", "faq", "cta"],
    "sections": {
      "hero": { "title": "...", "description": "..." },
      "generator": { "block": "dance-generator" },
      "features": { "block": "features", "items": [...] }
    }
  }
}
```
- `show_sections`: Controls which sections appear and their order
- `sections.{name}.block`: References a theme block by name
- `sections.{name}.component`: Can embed React component directly (for pages like `/ai-dance-generator`)

**2. Theme Block System**

Blocks are React components in `src/themes/{theme}/blocks/`:
- `getThemeBlock('block-name')` loads `blocks/block-name.tsx`
- Export must be PascalCase matching kebab-case filename: `dance-generator.tsx` → `DanceGeneratorBlock`
- Blocks receive `section` prop with JSON config data

**3. Dynamic Page Rendering**

`src/themes/default/pages/dynamic-page.tsx` iterates `page.sections` and renders each block:
```tsx
const DynamicBlock = await getThemeBlock(section.block);
return <DynamicBlock section={section} />;
```

### Directory Structure

```
src/
├── app/                          # Next.js App Router
│   ├── [locale]/                 # Locale-based routing (en, zh)
│   │   ├── (landing)/            # Landing pages group
│   │   │   ├── page.tsx          # Homepage (reads pages/index.json)
│   │   │   └── (ai)/             # AI tool pages
│   │   ├── (auth)/               # Auth pages
│   │   └── (admin)/              # Admin pages
│   └── api/                      # API routes
│       └── ai/generate/          # AI generation endpoint
├── config/
│   ├── dance-templates.ts        # Dance template definitions
│   ├── locale/messages/          # i18n translations by locale
│   │   ├── en/
│   │   │   ├── pages/index.json  # Homepage content
│   │   │   └── ai/dance.json     # Dance generator translations
│   │   └── zh/
│   └── db/schema.ts              # Database schema (Drizzle)
├── core/                         # Core infrastructure
│   ├── theme/index.ts            # getThemeBlock, getThemePage
│   └── i18n/                     # Internationalization
├── shared/
│   ├── blocks/generator/         # AI generator components
│   │   ├── dance.tsx             # Dance Generator (template-based)
│   │   └── video.tsx             # Video Generator (configurable)
│   ├── models/                   # Database queries
│   ├── services/                 # Business logic (ai.ts, payment.ts)
│   └── contexts/app.tsx          # App context (user, credits)
├── extensions/
│   └── ai/                       # AI providers
│       ├── fal.ts                # FAL AI (Kling, Seedance, etc.)
│       ├── replicate.ts          # Replicate
│       └── kie.ts                # KIE
└── themes/default/blocks/        # Theme blocks
    ├── dance-generator.tsx       # Dance generator wrapper
    ├── hero.tsx, features.tsx    # Landing page blocks
    └── index.tsx                 # Block exports
```

### Locale System

Translations are structured in `src/config/locale/`:
- `localeMessagesPaths` in `locale/index.ts` lists all message files to load
- Add new paths like `'ai/dance'` to register new translation files
- Use `t('key')` or `t.raw('key')` in components

### AI Provider Integration

**Adding a new AI scene:**
1. Add scene case in `src/app/api/ai/generate/route.ts`:
   ```typescript
   if (scene === 'dance-generation') {
     costCredits = 10;
   }
   ```
2. Configure provider in `src/shared/services/ai.ts`
3. FAL provider automatically maps `image_input` → `image_url`, `video_input` → `video_url`

**API Request Format:**
```typescript
POST /api/ai/generate
{
  mediaType: "video",
  scene: "dance-generation",
  provider: "fal",
  model: "fal-ai/kling-video/v2.6/pro/motion-control",
  prompt: "...",
  options: { image_input: [...], video_input: [...] }
}
```

### Adding New Landing Page Sections

1. **Create block** in `src/themes/default/blocks/my-block.tsx`:
   ```tsx
   export function MyBlock({ section }: { section: Section }) {
     return <div>{section.title}</div>;
   }
   ```
2. **Export block** in `src/themes/default/blocks/index.tsx`
3. **Configure section** in `pages/index.json`:
   ```json
   "my_section": { "block": "my-block", "title": "Hello" }
   ```
4. **Add to show_sections** array

### Key Patterns

- **API Responses**: Use `respData(data)` / `respErr(message)` for consistent `{ code, message, data }` format
- **Credits**: Check `getRemainingCredits()` before AI operations, deduct on task creation
- **Polling**: Long-running AI tasks use `POST /api/ai/query` with `taskId`
- **File Storage**: Upload to R2/S3 via `POST /api/storage/upload-image`

### Environment Variables

Key variables (see `.env.example`):
```
# App
NEXT_PUBLIC_APP_URL, NEXT_PUBLIC_APP_NAME

# Database
DATABASE_URL, DATABASE_PROVIDER (postgresql|mysql|sqlite)

# Auth
AUTH_SECRET  # openssl rand -base64 32

# AI Providers
FAL_KEY, REPLICATE_API_TOKEN, KIE_API_KEY

# Storage
S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, S3_BUCKET, S3_ENDPOINT

# Payment
STRIPE_SECRET_KEY, PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET
```

### Dance Generator Implementation

The AI Dance Generator uses:
- **Model**: `fal-ai/kling-video/v2.6/pro/motion-control` (FAL AI)
- **Template System**: Pre-defined dance videos in `src/config/dance-templates.ts`
- **Flow**: Upload photo → Select dance template → Generate video
- **Credits**: 10 credits per generation

Template videos should be uploaded to cloud storage and URLs configured in `dance-templates.ts`.
