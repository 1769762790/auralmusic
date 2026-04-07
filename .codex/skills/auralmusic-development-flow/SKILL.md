---
name: auralmusic-development-flow
description: Use when working in the auralmusic repository on renderer-side feature development, especially when adding pages, registering routes, creating or extending API modules, wiring page data fetching, adding loading or skeleton states, installing shadcn UI components, or following this project's local development conventions.
---

# Auralmusic Development Flow

## Overview

Follow this skill when implementing features in the `auralmusic` repository. Treat the repo-root `项目开发流程说明文档.md` as the authoritative process document, and use this skill as the execution guide for applying those conventions consistently.

Keep changes centered in `src/renderer` unless the task explicitly needs Electron windowing, preload bridging, or local API bootstrapping.

## Core Rules

- Read `项目开发流程说明文档.md` in the repo root before substantial work.
- Default all feature work to `src/renderer`.
- Put page containers in `src/renderer/pages/<Feature>/index.tsx`.
- Split page-private UI into `src/renderer/pages/<Feature>/components`.
- Put reusable business components in `src/renderer/components`.
- Put UI primitives and shadcn output in `src/renderer/components/ui`.
- Add or extend API functions under `src/renderer/api`; never call `axios` directly from page files.
- Route all HTTP requests through `src/renderer/lib/request.ts`.
- Prefer local page state first; use `zustand` only for genuinely shared state.
- Prefer section-level loading and skeletons over whole-page blocking loaders.

## Repo Map

- `src/main`: Electron main process, window creation, local Music API startup.
- `src/preload`: Safe bridge for exposing Electron capabilities to the renderer.
- `src/renderer/main.tsx`: React entry, global styles, router bootstrap.
- `src/renderer/router/router.config.tsx`: Route registration source of truth.
- `src/renderer/layout/AppLayout.tsx`: Shared shell with `Header`, `KeepAliveRouteOutlet`, and scroll helper.
- `src/renderer/api`: Thin service layer for business endpoints.
- `src/renderer/lib/request.ts`: Shared axios instance and retry behavior.
- `src/renderer/hooks/useLoadMore.ts`: Infinite scroll / sentinel pagination hook.
- `components.json`: shadcn generation paths; current `ui` target is `@/components/ui`.

## Workflow

### 1. Classify the task

- New business page: create a new page directory under `src/renderer/pages`.
- Existing page enhancement: keep new logic near that page and split private subcomponents if the file grows.
- Cross-page business UI: move to `src/renderer/components`.
- Pure primitive or shadcn extension: use `src/renderer/components/ui`.
- Electron capability work: only then touch `src/main` or `src/preload`.

### 2. Add a page the project way

When creating a new page:

1. Create `src/renderer/pages/<Feature>/index.tsx`.
2. Add `components/` and page-local type files before the page becomes large.
3. Register the route in `src/renderer/router/router.config.tsx`.
4. Set `meta.title`, and keep `meta.hidden` false if the page should appear in navigation.
5. Let the page render inside `AppLayout`; do not build a parallel shell unless the task truly needs it.

### 3. Add or extend an interface

When connecting data:

1. Add a thin function in `src/renderer/api/*.ts`.
2. Keep request construction in the API layer only.
3. Fetch in the page container with `useEffect` or `useEffectEvent + useEffect`.
4. Use `Promise.all` when requests are independent.
5. Keep each section's loading state independent when the UI has multiple regions.
6. Add skeletons near the page when loading states are visually important.

### 4. Reuse existing patterns before inventing new ones

- Use `Home` as the pattern for multi-section pages with independent loading states.
- Use `Charts` as the pattern for aggregate pages that combine list and detail requests.
- Use `PlayList` plus `useIntersectionLoadMore` as the pattern for category filters and infinite scroll.

### 5. Handle shadcn correctly

- Check `components.json` before installing or moving shadcn components.
- Expect shadcn UI files to land in `src/renderer/components/ui`.
- Do not infer shadcn paths from `electron.vite.config.ts`; `components.json` is authoritative.

## Validation

- Run `pnpm lint` after meaningful changes.
- Use `pnpm dev` for functional verification in the Electron app.
- Run `pnpm build` only when you need full build verification, and report the actual result.
- Do not claim `pnpm build` passes unless you ran it fresh.

## Current Repo Constraints

- The repo currently has pre-existing TypeScript strict-mode errors outside many feature changes.
- `pnpm lint` currently completes with warnings.
- `pnpm build` is currently blocked by existing errors in files such as `src/renderer/api/list.ts`, `src/renderer/components/CoverCard/index.tsx`, `src/renderer/components/Header/index.tsx`, `src/renderer/lib/request.ts`, and `src/renderer/pages/PlayList/components/AllPlayList/CategoriesPanel.tsx`.
- Do not describe the repository as fully green unless you have freshly verified otherwise.

## Common Mistakes

- Writing page requests directly inside JSX or bypassing `src/renderer/api`.
- Putting page-private components into `src/renderer/components`.
- Adding global store state for data that only one page uses.
- Installing shadcn components and assuming Vite alias config controls the output path.
- Reporting build success when only `pnpm lint` or `pnpm dev` was checked.
