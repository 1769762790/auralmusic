# Custom Theme Color Design

**Goal:** Add a custom theme color feature to Basic Settings using the existing `ui/color-picker`, with real-time preview and immediate persistence. The chosen color should drive the application's linked accent tokens, including `primary`, `accent`, and sidebar highlight colors.

**Context**

The current application already supports theme mode switching between `system`, `light`, and `dark`, but the actual semantic color tokens are still fixed in `src/renderer/styles/globals.css`. The repository already contains a reusable `ui/color-picker` implementation under `src/renderer/components/ui/color-picker.tsx`, and Basic Settings is the correct surface for appearance controls.

At the moment:

- theme mode is persisted in `AppConfig.theme`
- renderer theme application is handled by `useTheme`
- semantic colors are driven by CSS variables in `globals.css`
- there is no persisted user-configurable theme color in the config model

This means the new feature should extend the existing theme stack rather than creating a parallel styling system.

**Recommended Approach**

Add a single persisted `themeColor` config field and introduce a small renderer-side theme-color application layer that derives a linked set of CSS variables from one user-selected hex color. Keep theme mode and theme color as separate concerns: `useTheme` should continue to manage `light / dark / system`, while the new helper applies the computed token overrides to `document.documentElement.style`.

This keeps responsibilities clean:

- config persists the chosen color
- Basic Settings owns the user interaction
- a dedicated helper owns color normalization and variable derivation
- `globals.css` remains the fallback baseline when no custom color is selected

**Design**

1. Add `themeColor: string | null` to the persisted `AppConfig`.
2. Use `null` as the default value so the app continues to use the current built-in palette until the user explicitly selects a color.
3. Keep one shared custom theme color for both light and dark mode.
4. Add a new Basic Settings row under the existing appearance controls for “主题色”.
5. Use a compact trigger plus preview surface rather than permanently rendering the full color picker inline.
6. Open a small popover panel that contains:
   - a live color preview
   - `ColorPickerHex`
   - `ColorPickerInput`
   - a “恢复默认” action
7. Every valid color change should apply immediately and persist immediately through `setConfig('themeColor', nextHex)`.
8. “恢复默认” should set `themeColor` back to `null` and remove the runtime CSS overrides.

**UI Structure**

- `src/renderer/pages/Settings/components/BasicSettings.tsx`
  Add one more row in the existing settings layout.
- `src/renderer/pages/Settings/components/ThemeColorField.tsx`
  New focused presentation component for the color trigger, popover, picker, preview, and reset action.
- `src/renderer/components/ui/color-picker.tsx`
  Reuse as-is; do not fork another picker implementation unless an API gap is discovered.

The color field should visually fit the existing settings style:

- compact trigger in the right column
- circular or rounded swatch preview
- visible hex string
- popover panel with the full picker only when needed

**State Boundaries**

- `AppConfig.theme` remains responsible for light/dark/system mode.
- `AppConfig.themeColor` stores only the user's custom color override.
- `useTheme` remains responsible for dark-mode class synchronization only.
- a new renderer helper or hook applies semantic token overrides from `themeColor`.
- `ThemeColorField` handles only local interaction state such as popover open/close and input editing.

No new global store is needed; config persistence through the existing config store is sufficient.

**Color Derivation Rules**

Use one hex color as the source and derive only the linked accent tokens. Do not repaint the entire neutral foundation.

Required linked variables:

- `--primary`
- `--primary-foreground`
- `--ring`
- `--accent`
- `--accent-foreground`
- `--sidebar-primary`
- `--sidebar-primary-foreground`
- `--sidebar-accent`
- `--sidebar-accent-foreground`

Rules:

- `primary` uses the selected color directly
- foreground tokens choose dark or light text based on contrast
- `ring` uses a softened translucent version of the selected color
- `accent` uses a lighter background-style mix derived from the selected color
- sidebar tokens follow the same source color so navigation highlights stay in sync
- background, card, border, muted, input, and other neutral foundation tokens stay unchanged

This gives the app a visible color identity shift without destabilizing readability or layout surfaces.

**Application Mechanism**

Introduce a pure helper that:

- normalizes an incoming color value to a canonical hex string
- rejects invalid values
- computes the linked CSS token map
- applies those tokens to the root element
- removes those overrides when `themeColor` is `null`

The helper should be called from renderer initialization logic that already reacts to config changes, so updates remain immediate when:

- the app starts
- config finishes hydrating
- the user changes the theme color
- the user resets to default

**Error Handling**

- Invalid or incomplete input should not break the UI.
- Picker drag interactions should always produce valid values.
- Manual text input should normalize to a valid uppercase or lowercase hex format before persistence.
- Invalid input should either be ignored until valid or reverted to the last valid value; avoid persisting malformed color strings.
- `null` should always be treated as “use built-in defaults”.

**Testing**

Add focused model-level tests for the theme-color helper:

- valid hex normalization
- invalid input fallback behavior
- derived variable presence and stable foreground contrast choice
- `null` clearing behavior

Add minimal component or integration coverage only if the behavior is extracted cleanly enough to test without heavy DOM harnessing. Prefer pure-function tests over brittle UI tests.

Verification after implementation:

- run targeted model tests
- run `pnpm lint`
- manually verify in `pnpm dev` that:
  - the color updates immediately
  - the value persists after restart
  - reset restores the default palette
  - light and dark mode both use the same selected source color

**Out Of Scope**

- Separate light-mode and dark-mode custom colors
- Full theme preset management
- Editing background, card, border, or typography tokens
- Syncing theme color to Electron native titlebar colors
- Export/import of color themes
