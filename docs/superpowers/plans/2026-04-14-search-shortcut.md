# Search Shortcut Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a configurable shortcut action that opens the existing search dialog from Settings, local shortcuts, and global shortcuts.

**Architecture:** Extend the shared shortcut action model with a new `openSearch` action so Settings, renderer shortcut resolution, and main-process global registration continue to use one source of truth. Move only the search dialog visibility into a dedicated renderer store so the header trigger and shortcut bridge can reuse the same opening path without duplicating state.

**Tech Stack:** TypeScript, React 19, zustand, node:test, ESLint

---

## File Map

- Modify: `tests/shortcut-keys.test.ts`
  Cover the new `openSearch` default binding and updated global registration count.
- Create: `tests/search-dialog-store.test.ts`
  Verify the shared search dialog visibility actions.
- Modify: `src/shared/shortcut-keys.ts`
  Add `openSearch` to the action list and default bindings.
- Create: `src/renderer/stores/search-dialog-store.ts`
  Hold only the search dialog visibility state and actions.
- Modify: `src/renderer/components/SearchDialog/index.tsx`
  Read and update visibility through the shared store.
- Modify: `src/renderer/components/PlaybackShortcutBridge/index.tsx`
  Execute `openSearch` through the shared store.
- Modify: `src/renderer/pages/Settings/components/ShortcutKeySettings.tsx`
  Add the new action label.

## Tasks

### Task 1: Add failing tests

**Files:**

- Modify: `tests/shortcut-keys.test.ts`
- Create: `tests/search-dialog-store.test.ts`

- [ ] Write the failing tests for `openSearch` defaults and dialog visibility actions.
- [ ] Run `node tests/shortcut-keys.test.ts` and `node tests/search-dialog-store.test.ts`.
- [ ] Confirm the shortcut test fails because `openSearch` is missing and the store test fails because the store file does not exist.

### Task 2: Implement shared shortcut support

**Files:**

- Modify: `src/shared/shortcut-keys.ts`
- Modify: `src/renderer/pages/Settings/components/ShortcutKeySettings.tsx`

- [ ] Add `openSearch` to the shared action ids and default bindings with `Ctrl+K` and `Alt+Ctrl+K`.
- [ ] Add the Settings label for the new action row.
- [ ] Run `node tests/shortcut-keys.test.ts` and confirm the shortcut suite passes.

### Task 3: Implement shared dialog state and shortcut execution

**Files:**

- Create: `src/renderer/stores/search-dialog-store.ts`
- Modify: `src/renderer/components/SearchDialog/index.tsx`
- Modify: `src/renderer/components/PlaybackShortcutBridge/index.tsx`

- [ ] Add the minimal zustand store for search dialog visibility.
- [ ] Move `SearchDialog` visibility to the store while leaving search query/result state local to the component.
- [ ] Extend shortcut execution so `openSearch` opens the dialog through the same store action.
- [ ] Run `node tests/search-dialog-store.test.ts` and confirm it passes.

### Task 4: Verify targeted quality gates

**Files:**

- Modify: `tests/shortcut-keys.test.ts`
- Create: `tests/search-dialog-store.test.ts`
- Modify: `src/shared/shortcut-keys.ts`
- Create: `src/renderer/stores/search-dialog-store.ts`
- Modify: `src/renderer/components/SearchDialog/index.tsx`
- Modify: `src/renderer/components/PlaybackShortcutBridge/index.tsx`
- Modify: `src/renderer/pages/Settings/components/ShortcutKeySettings.tsx`

- [ ] Run `node tests/shortcut-keys.test.ts`.
- [ ] Run `node tests/search-dialog-store.test.ts`.
- [ ] Run `node_modules\\.bin\\eslint.cmd tests/shortcut-keys.test.ts tests/search-dialog-store.test.ts src/shared/shortcut-keys.ts src/renderer/stores/search-dialog-store.ts src/renderer/components/SearchDialog/index.tsx src/renderer/components/PlaybackShortcutBridge/index.tsx src/renderer/pages/Settings/components/ShortcutKeySettings.tsx`.

## Self-Review

- Spec coverage:
  - Settings shortcut row: Task 2
  - Local and global bindings: Task 2
  - Shared dialog opening path: Task 3
  - Verification: Task 4
- Placeholder scan:
  - No `TODO` / `TBD`
- Type consistency:
  - `openSearch` is the shared action id across tests, model, settings, and execution
