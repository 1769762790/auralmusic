# Font List System Fonts Design

## Goal

Replace the Settings page system font enumeration flow so it uses the third-party `font-list` library through Electron instead of relying on the browser `queryLocalFonts()` capability.

## Current State

- `src/renderer/pages/Settings/settings-fonts.ts` calls `window.queryLocalFonts()`.
- The app enables Blink `LocalFontAccess` in `src/main/index.ts` and grants the `local-fonts` permission.
- The renderer owns capability detection and maps browser permission errors into status messages.

This makes system font loading depend on Chromium runtime support, permission state, and secure-context behavior even though the app already runs inside Electron.

## Proposed Design

### Architecture

Move system font enumeration to the Electron main process and expose it to the renderer through a dedicated preload API.

- `main` owns querying installed fonts via `font-list`.
- `preload` exposes a focused `electronSystemFonts.getAll()` bridge.
- `renderer` keeps the existing UI behavior but switches its data source from `window.queryLocalFonts()` to the preload API.

### File Responsibilities

- `src/shared/ipc/system-fonts.ts`
  Define the IPC channel contract for system font queries.
- `src/main/ipc/system-fonts-ipc.ts`
  Register the main-process handler that calls `font-list`, normalizes values, and returns a string list.
- `src/preload/api/system-fonts-api.ts`
  Expose the renderer-facing preload bridge for reading font families.
- `src/preload/index.ts`
  Register the new preload API.
- `src/renderer/types/electron.d.ts`
  Add the new preload API to the global `Window` typing.
- `src/renderer/pages/Settings/settings-fonts.ts`
  Replace browser-local-font querying with the preload API and keep renderer-side merge/status behavior focused on UI needs.
- `src/main/index.ts`
  Remove Blink `LocalFontAccess` configuration and permission handling that are no longer needed for system font enumeration.

## Data Flow

1. Settings page opens the font selector.
2. `querySystemFontFamilies()` calls `window.electronSystemFonts.getAll()`.
3. Preload forwards the request through IPC.
4. Main process calls `font-list` and returns normalized family names.
5. Renderer merges built-in fonts, current selection, and returned system fonts for display.

## Error Handling

- Missing preload bridge returns `unsupported`.
- Empty `font-list` result returns `empty`.
- Main-process or library failures return `error` with the surfaced message.
- Browser-specific statuses such as `not-allowed` and `security-error` are removed because they no longer match the new architecture.

## Testing

- Add a renderer-side model test for `querySystemFontFamilies()` and `mergeFontFamilies()`.
- Add a main-process IPC test that verifies `createSystemFontsIpc()` registers the query handler and normalizes `font-list` output.
- Add a preload API test that verifies the new bridge proxies IPC calls.
- Extend the shared IPC channel contract test with the new channel constant.
