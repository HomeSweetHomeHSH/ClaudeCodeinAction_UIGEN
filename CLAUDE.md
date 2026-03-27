# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# First-time setup
npm run setup          # install deps + generate Prisma client + run migrations

# Development
npm run dev            # Next.js dev server with Turbopack at http://localhost:3000

# Build & production
npm run build
npm run start

# Testing
npm run test           # Vitest (all tests)

# Linting
npm run lint

# Database
npx prisma generate    # Regenerate Prisma client after schema changes
npx prisma migrate dev # Apply new migrations
npm run db:reset       # Force reset database
```

Set `ANTHROPIC_API_KEY` in `.env` to use real Claude AI; leave it empty to use the built-in mock provider.

## Architecture

**UIGen** is an AI-powered React component generator. Users describe components in chat; Claude AI generates and edits files in an in-memory virtual file system; a live preview renders the result via in-browser Babel/JSX compilation in an iframe.

### Data flow

1. User types in `ChatInterface` → POST to `/api/chat`
2. `/api/chat/route.ts` calls Claude via Vercel AI SDK (`streamText`) with two tools: `str_replace_editor` (file edits) and `file_manager` (file/dir ops)
3. Tool calls update the `VirtualFileSystem` (in-memory, `src/lib/file-system.ts`) via `FileSystemContext`
4. `PreviewFrame` picks up changed files and re-executes JSX using Babel Standalone in an iframe
5. If the user is authenticated, the project (messages + file system JSON) is persisted to SQLite via Prisma server actions

### Key modules

- **`src/lib/file-system.ts`** — `VirtualFileSystem` class: all file CRUD in memory, serializes to/from JSON for DB storage
- **`src/lib/provider.ts`** — Returns real Anthropic model or `MockLanguageModel` (4-step canned response) when no API key is set
- **`src/lib/tools/`** — AI tool definitions (`str_replace_editor`, `file_manager`)
- **`src/lib/prompts/`** — System prompt for the AI
- **`src/lib/contexts/`** — `FileSystemContext` and `ChatContext` share state across the panel layout
- **`src/app/api/chat/route.ts`** — Streaming AI endpoint; bridges tool calls to file system mutations
- **`src/app/main-content.tsx`** — Top-level layout: wraps providers and `ResizablePanelGroup` (chat left, preview/editor right)
- **`src/components/preview/`** — `PreviewFrame` renders files in an isolated iframe with Babel transpilation
- **`src/actions/`** — Server actions for project CRUD (read, create, update, delete)

### Auth

JWT (HS256) stored in an httpOnly cookie (7-day expiry). `src/lib/auth.ts` is server-only. `src/middleware.ts` protects `/api/projects/*` and `/api/filesystem/*`. Anonymous users can generate components; projects are only persisted when signed in.

### Database

SQLite via Prisma. Schema is the source of truth for all stored data — always reference `prisma/schema.prisma` when working with anything database-related. Two models: `User` (email + hashed password) and `Project` (name, optional userId, `messages` JSON, `data` JSON for the serialized file system).

## Code style

Use comments sparingly — only for logic that is genuinely non-obvious.

### Testing

Vitest + jsdom + `@testing-library/react`. Test files live in `__tests__/` directories colocated with source. The vitest config (`vitest.config.mts`) resolves the `@/*` path alias.
