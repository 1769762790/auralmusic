# Font List System Fonts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace renderer-side `queryLocalFonts()` usage with a main/preload `font-list` bridge for system font enumeration.

**Architecture:** Add a dedicated shared IPC contract and preload API for system fonts, implement the main-process handler with `font-list`, and keep renderer logic limited to font list merging plus UI status mapping. Remove Blink local-font browser capability wiring because the app will no longer depend on Chromium local font access.

**Tech Stack:** Electron, React, TypeScript, node:test, `font-list`

---

### Task 1: Lock the renderer font-query contract

**Files:**

- Create: `tests/settings-fonts.test.ts`
- Modify: `src/renderer/pages/Settings/settings-fonts.ts`

- [ ] **Step 1: Write the failing test**

```ts
test('querySystemFontFamilies reads fonts from preload api and normalizes duplicates', async () => {
  ;(
    globalThis as typeof globalThis & {
      window?: { electronSystemFonts?: { getAll: () => Promise<string[]> } }
    }
  ).window = {
    electronSystemFonts: {
      getAll: async () => ['  Inter  ', 'Noto Sans SC', 'Inter'],
    },
  }

  const { querySystemFontFamilies } =
    await import('../src/renderer/pages/Settings/settings-fonts.ts')

  const result = await querySystemFontFamilies()

  assert.deepEqual(result, {
    fonts: ['Inter', 'Noto Sans SC'],
    status: 'ok',
    message: undefined,
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/settings-fonts.test.ts`
Expected: FAIL because `querySystemFontFamilies()` still reads `window.queryLocalFonts`.

- [ ] **Step 3: Write minimal implementation**

Replace renderer local-font querying with a preload bridge lookup:

```ts
const systemFontsApi = window.electronSystemFonts

if (!systemFontsApi) {
  return {
    fonts: [],
    status: 'unsupported',
    message: '当前运行环境不支持读取系统字体。',
  }
}

const fonts = normalizeFontFamilies(await systemFontsApi.getAll())
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/settings-fonts.test.ts`
Expected: PASS

### Task 2: Add the system-font IPC contract and preload bridge

**Files:**

- Create: `src/shared/ipc/system-fonts.ts`
- Create: `src/preload/api/system-fonts-api.ts`
- Modify: `src/preload/index.ts`
- Modify: `src/renderer/types/electron.d.ts`
- Create: `tests/system-fonts-api.test.ts`
- Modify: `tests/shared-ipc-channels.test.ts`

- [ ] **Step 1: Write the failing tests**

Add tests that expect:

```ts
assert.deepEqual(SYSTEM_FONT_IPC_CHANNELS, {
  GET_ALL: 'system-fonts:get-all',
})
```

and:

```ts
const result = await api.getAll()
assert.deepEqual(result, ['Inter', 'Noto Sans SC'])
assert.deepEqual(invocations, [
  { channel: SYSTEM_FONT_IPC_CHANNELS.GET_ALL, args: [] },
])
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test tests/shared-ipc-channels.test.ts tests/system-fonts-api.test.ts`
Expected: FAIL because the new shared IPC module and preload API do not exist yet.

- [ ] **Step 3: Write minimal implementation**

Add the channel constant, preload API, and global window typing:

```ts
export const SYSTEM_FONT_IPC_CHANNELS = {
  GET_ALL: 'system-fonts:get-all',
} as const
```

```ts
export type SystemFontsApi = {
  getAll: () => Promise<string[]>
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test tests/shared-ipc-channels.test.ts tests/system-fonts-api.test.ts`
Expected: PASS

### Task 3: Implement the main-process `font-list` handler

**Files:**

- Create: `src/main/ipc/system-fonts-ipc.ts`
- Modify: `src/main/index.ts`
- Create: `tests/system-fonts-ipc.test.ts`
- Modify: `package.json`

- [ ] **Step 1: Write the failing test**

Add a test that expects the registered handler to normalize whitespace and duplicates from the font provider:

```ts
assert.deepEqual(await handlers.get(SYSTEM_FONT_IPC_CHANNELS.GET_ALL)?.(), [
  'Inter',
  'Noto Sans SC',
])
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/system-fonts-ipc.test.ts`
Expected: FAIL because the IPC module does not exist yet.

- [ ] **Step 3: Write minimal implementation**

Create `createSystemFontsIpc()` with an injectable `getFonts` dependency and register it from `src/main/index.ts`:

```ts
const getFonts =
  options.getFonts ?? (() => import('font-list').then(mod => mod.getFonts()))
ipcMain.handle(SYSTEM_FONT_IPC_CHANNELS.GET_ALL, async () => {
  const fonts = await getFonts({ disableQuoting: true })
  return normalizeFontFamilies(fonts)
})
```

Also add the runtime dependency:

```json
"font-list": "^1.5.1"
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/system-fonts-ipc.test.ts`
Expected: PASS

### Task 4: Remove browser-local-font assumptions and verify end to end

**Files:**

- Modify: `src/main/index.ts`
- Modify: `src/renderer/pages/Settings/settings-fonts.ts`
- Verify: `src/renderer/pages/Settings/components/SystemSettings.tsx`

- [ ] **Step 1: Remove obsolete browser-local-font wiring**

Delete the `local-fonts` permission allowance and remove `enableBlinkFeatures: 'LocalFontAccess'` from `BrowserWindow` creation.

- [ ] **Step 2: Run targeted verification**

Run: `node --test tests/settings-fonts.test.ts tests/shared-ipc-channels.test.ts tests/system-fonts-api.test.ts tests/system-fonts-ipc.test.ts`
Expected: PASS

- [ ] **Step 3: Run lint on touched files**

Run: `pnpm exec eslint src/main/index.ts src/main/ipc/system-fonts-ipc.ts src/preload/index.ts src/preload/api/system-fonts-api.ts src/shared/ipc/system-fonts.ts src/renderer/pages/Settings/settings-fonts.ts src/renderer/types/electron.d.ts tests/settings-fonts.test.ts tests/system-fonts-api.test.ts tests/system-fonts-ipc.test.ts tests/shared-ipc-channels.test.ts`
Expected: exit code 0
