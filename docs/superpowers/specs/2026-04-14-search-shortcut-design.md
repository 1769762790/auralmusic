# Search Shortcut Design

**Goal:** Add a configurable shortcut in Settings that summons the existing search dialog, with support for both in-window and global shortcuts.

**Context**

The repository already has a centralized shortcut system:

- shortcut action ids and default bindings live in `src/shared/shortcut-keys.ts`
- Settings renders shortcut rows from that shared model
- global shortcuts are registered in `src/main/shortcuts/global-shortcuts.ts`
- renderer shortcut execution is handled by `src/renderer/components/PlaybackShortcutBridge`

The existing search dialog is mounted from `Header`, but it owns its open state internally. That makes it impossible for the shortcut bridge to open the dialog without coupling directly to the component instance.

**Recommended Approach**

Add `openSearch` as a first-class shortcut action and move the search dialog open state into a tiny renderer store dedicated to this dialog. Keep shortcut registration and conflict detection unchanged by extending the existing shared model. Let both the header button and shortcut bridge call the same store actions.

This is the lowest-coupling option because it preserves the current shortcut architecture and avoids introducing a parallel config field or ad-hoc DOM events.

**Design**

1. Add `openSearch` to the shared shortcut action list and default bindings.
2. Use `Ctrl+K` as the default local binding and `Alt+Ctrl+K` as the default global binding.
3. Add the new action label to Settings so the shortcut appears automatically in the existing shortcut table.
4. Introduce a focused `search-dialog-store` in `src/renderer/stores` with explicit `open`, `setOpen`, `openDialog`, and `closeDialog` actions.
5. Update `SearchDialog` to consume store state instead of owning its own `open` flag.
6. Update the search trigger button to call `openDialog`.
7. Extend `PlaybackShortcutBridge` to dispatch `openSearch` by calling the same store action.
8. Keep all existing conflict detection, formatting, and global shortcut registration behavior unchanged by relying on the shared shortcut model.

**State Boundaries**

- `src/shared/shortcut-keys.ts` remains the source of truth for shortcut actions and bindings.
- `ShortcutKeySettings` remains a pure settings UI over the shared shortcut model.
- `SearchDialog` owns search query/type/result state, but not the cross-component open state.
- `search-dialog-store` owns only dialog visibility and nothing related to search results.
- `PlaybackShortcutBridge` continues to be the single renderer execution point for shortcut actions.

**Testing**

- Extend `tests/shortcut-keys.test.ts` to cover the new default binding and registration count.
- Add `tests/search-dialog-store.test.ts` to verify the shared open-state actions.
- Run targeted node tests before and after implementation.
- Run targeted ESLint on modified files.

**Out Of Scope**

- New search result behavior
- Search history
- Search route/page work
- Keyboard navigation inside the dialog
