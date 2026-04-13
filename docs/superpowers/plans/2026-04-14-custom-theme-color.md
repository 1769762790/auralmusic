# Custom Theme Color Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a custom theme color control to Basic Settings using `ui/color-picker`, with immediate preview, immediate persistence, and linked `primary`, `accent`, and sidebar token updates.

**Architecture:** Extend the persisted config with a nullable `themeColor` field, then add a small renderer-side theme color module that normalizes a single hex input and derives the runtime CSS variable overrides. Keep theme mode and theme color separate: `useTheme` continues to control `light / dark / system`, while a dedicated helper applies and clears theme-color token overrides on the root element.

**Tech Stack:** TypeScript, React 19, zustand config store, Electron config persistence, CSS variables, node:test, ESLint

---

## File Map

- Create: `tests/theme-color.model.test.ts`
  Regression coverage for color normalization, derived token mapping, and clearing behavior.
- Create: `src/renderer/theme/theme-color.ts`
  Pure helper functions for hex normalization, contrast selection, token derivation, and DOM application/removal.
- Create: `src/renderer/pages/Settings/components/ThemeColorField.tsx`
  Focused settings UI for the trigger, popover, picker, hex input, preview, and reset action.
- Modify: `src/main/config/types.ts`
  Add `themeColor` to `AppConfig` and `defaultConfig`.
- Modify: `src/main/config/store.ts`
  Extend config schema validation/default hydration for `themeColor`.
- Modify: `src/renderer/stores/config-store.ts`
  Normalize persisted `themeColor` during renderer config hydration.
- Modify: `src/renderer/hooks/useTheme.ts`
  Apply or clear theme-color CSS overrides in response to config changes.
- Modify: `src/renderer/pages/Settings/components/BasicSettings.tsx`
  Mount the new `ThemeColorField` row below the existing appearance settings.

## Tasks

### Task 1: Add the failing theme-color model test

**Files:**

- Create: `tests/theme-color.model.test.ts`
- Test: `tests/theme-color.model.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import test from 'node:test'
import assert from 'node:assert/strict'

import {
  clearThemeColorOverrides,
  deriveThemeColorTokens,
  normalizeThemeColor,
} from '../src/renderer/theme/theme-color.ts'

test('normalizeThemeColor canonicalizes valid hex values and rejects invalid input', () => {
  assert.equal(normalizeThemeColor('#7c3aed'), '#7C3AED')
  assert.equal(normalizeThemeColor('7c3aed'), '#7C3AED')
  assert.equal(normalizeThemeColor('#7C3AED'), '#7C3AED')
  assert.equal(normalizeThemeColor('#zzz999'), null)
  assert.equal(normalizeThemeColor(''), null)
  assert.equal(normalizeThemeColor(null), null)
})

test('deriveThemeColorTokens returns linked primary accent and sidebar variables', () => {
  const tokens = deriveThemeColorTokens('#7C3AED')

  assert.equal(tokens['--primary'], '#7C3AED')
  assert.equal(typeof tokens['--primary-foreground'], 'string')
  assert.equal(typeof tokens['--accent'], 'string')
  assert.equal(typeof tokens['--accent-foreground'], 'string')
  assert.equal(typeof tokens['--ring'], 'string')
  assert.equal(tokens['--sidebar-primary'], '#7C3AED')
  assert.equal(typeof tokens['--sidebar-primary-foreground'], 'string')
  assert.equal(typeof tokens['--sidebar-accent'], 'string')
  assert.equal(typeof tokens['--sidebar-accent-foreground'], 'string')
})

test('clearThemeColorOverrides removes all linked theme color properties from the root style', () => {
  const style = {
    removed: [] as string[],
    removeProperty(name: string) {
      this.removed.push(name)
    },
  }

  clearThemeColorOverrides(style)

  assert.deepEqual(style.removed, [
    '--primary',
    '--primary-foreground',
    '--ring',
    '--accent',
    '--accent-foreground',
    '--sidebar-primary',
    '--sidebar-primary-foreground',
    '--sidebar-accent',
    '--sidebar-accent-foreground',
  ])
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node tests/theme-color.model.test.ts`

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `src/renderer/theme/theme-color.ts`

### Task 2: Implement the theme-color model

**Files:**

- Create: `src/renderer/theme/theme-color.ts`
- Test: `tests/theme-color.model.test.ts`

- [ ] **Step 1: Add the minimal implementation**

```ts
const THEME_COLOR_VARIABLES = [
  '--primary',
  '--primary-foreground',
  '--ring',
  '--accent',
  '--accent-foreground',
  '--sidebar-primary',
  '--sidebar-primary-foreground',
  '--sidebar-accent',
  '--sidebar-accent-foreground',
] as const

type ThemeColorVariableName = (typeof THEME_COLOR_VARIABLES)[number]

export type ThemeColorTokenMap = Record<ThemeColorVariableName, string>

function clampChannel(value: number) {
  return Math.max(0, Math.min(255, Math.round(value)))
}

function parseHexChannel(value: string, start: number) {
  return Number.parseInt(value.slice(start, start + 2), 16)
}

function hexToRgb(hex: string) {
  return {
    r: parseHexChannel(hex, 1),
    g: parseHexChannel(hex, 3),
    b: parseHexChannel(hex, 5),
  }
}

function toHexChannel(value: number) {
  return clampChannel(value).toString(16).padStart(2, '0').toUpperCase()
}

function rgbToHex(r: number, g: number, b: number) {
  return `#${toHexChannel(r)}${toHexChannel(g)}${toHexChannel(b)}`
}

function mixWithWhite(hex: string, ratio: number) {
  const { r, g, b } = hexToRgb(hex)
  return rgbToHex(
    r + (255 - r) * ratio,
    g + (255 - g) * ratio,
    b + (255 - b) * ratio
  )
}

function pickForegroundColor(hex: string) {
  const { r, g, b } = hexToRgb(hex)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000

  return brightness >= 160 ? '#111827' : '#FFFFFF'
}

export function normalizeThemeColor(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null
  }

  const normalized = value.trim().replace(/^#?/, '#').toUpperCase()

  return /^#[0-9A-F]{6}$/.test(normalized) ? normalized : null
}

export function deriveThemeColorTokens(color: string): ThemeColorTokenMap {
  const normalizedColor = normalizeThemeColor(color)

  if (!normalizedColor) {
    throw new Error('Invalid theme color')
  }

  const accentColor = mixWithWhite(normalizedColor, 0.82)
  const sidebarAccentColor = mixWithWhite(normalizedColor, 0.88)

  return {
    '--primary': normalizedColor,
    '--primary-foreground': pickForegroundColor(normalizedColor),
    '--ring': `${normalizedColor}66`,
    '--accent': accentColor,
    '--accent-foreground': pickForegroundColor(accentColor),
    '--sidebar-primary': normalizedColor,
    '--sidebar-primary-foreground': pickForegroundColor(normalizedColor),
    '--sidebar-accent': sidebarAccentColor,
    '--sidebar-accent-foreground': pickForegroundColor(sidebarAccentColor),
  }
}

export function applyThemeColorOverrides(
  style: Pick<CSSStyleDeclaration, 'setProperty'>,
  color: string
) {
  const tokens = deriveThemeColorTokens(color)

  for (const [name, value] of Object.entries(tokens)) {
    style.setProperty(name, value)
  }
}

export function clearThemeColorOverrides(
  style: Pick<CSSStyleDeclaration, 'removeProperty'>
) {
  for (const name of THEME_COLOR_VARIABLES) {
    style.removeProperty(name)
  }
}
```

- [ ] **Step 2: Run the model test to verify it passes**

Run: `node tests/theme-color.model.test.ts`

Expected: PASS with 3 passing tests

### Task 3: Add persisted config support

**Files:**

- Modify: `src/main/config/types.ts`
- Modify: `src/main/config/store.ts`
- Modify: `src/renderer/stores/config-store.ts`
- Test: `tests/theme-color.model.test.ts`

- [ ] **Step 1: Add `themeColor` to the config model**

Update `src/main/config/types.ts`:

```ts
export interface AppConfig {
  theme: 'light' | 'dark' | 'system'
  themeColor: string | null
  fontFamily: string
  // ...
}

export const defaultConfig: AppConfig = {
  theme: 'system',
  themeColor: null,
  fontFamily: 'Inter Variable',
  // ...
}
```

- [ ] **Step 2: Add store schema/default handling**

Update the config schema in `src/main/config/store.ts` to include:

```ts
themeColor: { type: ['string', 'null'] },
```

and make sure missing persisted values are initialized from `defaultConfig.themeColor`.

- [ ] **Step 3: Normalize persisted `themeColor` in the renderer config store**

Update `src/renderer/stores/config-store.ts` to import `normalizeThemeColor` and assign:

```ts
themeColor: normalizeThemeColor(config.themeColor),
```

inside `normalizeConfig`.

- [ ] **Step 4: Re-run the model test**

Run: `node tests/theme-color.model.test.ts`

Expected: PASS with 3 passing tests

### Task 4: Apply theme-color overrides in the renderer

**Files:**

- Modify: `src/renderer/hooks/useTheme.ts`
- Create or use: `src/renderer/theme/theme-color.ts`
- Test: `tests/theme-color.model.test.ts`

- [ ] **Step 1: Apply or clear CSS variable overrides in `useTheme`**

Update `src/renderer/hooks/useTheme.ts` to read `themeColor` from config and add an effect like:

```ts
useEffect(() => {
  if (isLoading) {
    return
  }

  const rootStyle = document.documentElement.style
  const normalizedColor = normalizeThemeColor(themeColor)

  if (!normalizedColor) {
    clearThemeColorOverrides(rootStyle)
    return
  }

  applyThemeColorOverrides(rootStyle, normalizedColor)
}, [themeColor, isLoading])
```

- [ ] **Step 2: Keep theme mode logic unchanged**

Do not mix `themeColor` into the existing `.dark` toggle effect. The dark-mode class effect and theme-color override effect should stay separate.

- [ ] **Step 3: Re-run the model test**

Run: `node tests/theme-color.model.test.ts`

Expected: PASS with 3 passing tests

### Task 5: Build the Basic Settings color field UI

**Files:**

- Create: `src/renderer/pages/Settings/components/ThemeColorField.tsx`
- Modify: `src/renderer/pages/Settings/components/BasicSettings.tsx`

- [ ] **Step 1: Create the focused color field component**

```tsx
import { RotateCcw } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  ColorPicker,
  ColorPickerHex,
  ColorPickerInput,
} from '@/components/ui/color-picker'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { normalizeThemeColor } from '@/renderer/theme/theme-color'
import { useConfigStore } from '@/stores/config-store'

const ThemeColorField = () => {
  const themeColor = useConfigStore(state => state.config.themeColor)
  const setConfig = useConfigStore(state => state.setConfig)
  const [draftValue, setDraftValue] = useState(themeColor ?? '#7C3AED')

  useEffect(() => {
    setDraftValue(themeColor ?? '#7C3AED')
  }, [themeColor])

  const handleColorChange = (value: string) => {
    const normalized = normalizeThemeColor(value)
    setDraftValue(value)

    if (!normalized) {
      return
    }

    void setConfig('themeColor', normalized)
  }

  const handleReset = () => {
    setDraftValue('#7C3AED')
    void setConfig('themeColor', null)
  }

  const displayColor = themeColor ?? '#7C3AED'

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type='button'
          variant='outline'
          className='bg-muted/60 h-9 w-full justify-between rounded-xl border-none px-3 shadow-none'
        >
          <span className='flex items-center gap-3'>
            <span
              className='size-4 rounded-full border'
              style={{ backgroundColor: displayColor }}
            />
            <span>{themeColor ?? '默认主题色'}</span>
          </span>
          <span className='text-muted-foreground text-xs'>点击调整</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align='end' className='w-[320px] rounded-2xl p-4'>
        <div className='flex flex-col gap-4'>
          <div className='flex items-center justify-between'>
            <div className='space-y-1'>
              <p className='text-sm font-medium'>主题色</p>
              <p className='text-muted-foreground text-xs'>
                实时影响主色、强调色和侧边栏高亮
              </p>
            </div>
            <Button
              type='button'
              variant='ghost'
              size='sm'
              onClick={handleReset}
            >
              <RotateCcw data-icon='inline-start' />
              恢复默认
            </Button>
          </div>
          <ColorPicker className='w-full rounded-[20px] border-none bg-transparent shadow-none'>
            <ColorPickerHex color={displayColor} onChange={handleColorChange} />
          </ColorPicker>
          <div className='rounded-xl border px-3 py-2'>
            <ColorPickerInput
              value={draftValue}
              onChange={event => handleColorChange(event.target.value)}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default ThemeColorField
```

- [ ] **Step 2: Mount the field in `BasicSettings.tsx`**

Add:

```tsx
import ThemeColorField from './ThemeColorField'
```

and insert a new settings row after the existing appearance theme selector:

```tsx
<div className='grid grid-cols-[minmax(0,1fr)_minmax(180px,240px)] items-center gap-6 py-3'>
  <div className='space-y-1'>
    <div className='text-muted-foreground text-sm font-medium'>主题色</div>
    <p className='text-muted-foreground text-xs'>
      自定义应用的主色、强调色和侧边栏高亮颜色。
    </p>
  </div>
  <ThemeColorField />
</div>
<Separator />
```

### Task 6: Verify implementation

**Files:**

- Create: `tests/theme-color.model.test.ts`
- Create: `src/renderer/theme/theme-color.ts`
- Create: `src/renderer/pages/Settings/components/ThemeColorField.tsx`
- Modify: `src/main/config/types.ts`
- Modify: `src/main/config/store.ts`
- Modify: `src/renderer/stores/config-store.ts`
- Modify: `src/renderer/hooks/useTheme.ts`
- Modify: `src/renderer/pages/Settings/components/BasicSettings.tsx`

- [ ] **Step 1: Run targeted model tests**

Run: `node tests/theme-color.model.test.ts`

Expected: PASS with 3 passing tests

- [ ] **Step 2: Run lint**

Run: `pnpm lint`

Expected: exit code `0`, with only the repository's pre-existing warnings if they still exist

- [ ] **Step 3: Manual verification in Electron**

Run: `pnpm dev`

Verify:

- changing the color in Basic Settings updates the UI immediately
- the chosen color persists after relaunch
- clicking “恢复默认” restores the built-in palette
- the same chosen source color applies in both light and dark mode

## Self-Review

- Spec coverage:
  - persisted `themeColor`: Tasks 3 and 4
  - `ui/color-picker` in Basic Settings: Task 5
  - linked `primary / accent / sidebar` updates: Tasks 2 and 4
  - real-time apply and persistence: Tasks 4 and 5
  - reset to defaults: Tasks 2 and 5
- Placeholder scan:
  - No `TODO` / `TBD`
- Type consistency:
  - `themeColor`, `normalizeThemeColor`, `deriveThemeColorTokens`, `applyThemeColorOverrides`, and `ThemeColorField` are used consistently across the plan
