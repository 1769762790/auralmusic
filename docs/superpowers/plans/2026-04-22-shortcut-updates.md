# Shortcut Updates Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add configurable shortcuts for fullscreen toggle, search visibility toggle, navigation back/forward, and playback queue visibility toggle.

**Architecture:** Extend the shared shortcut action model so Settings, local shortcut dispatch, and global shortcut registration continue to use one source of truth. Reuse existing renderer stores where possible, add a focused playback queue drawer store for shared queue visibility, and route shortcut execution through the existing renderer bridge so UI buttons and shortcuts stay synchronized.

**Tech Stack:** TypeScript, React 19, React Router 7, zustand, Electron preload window API, node:test, ESLint

---

## File Map

- Modify: `tests/shortcut-keys.test.ts`
  Add failing coverage for the five new shortcut actions, their default bindings, and the updated global registration count.
- Modify: `tests/search-dialog-store.test.ts`
  Add failing coverage for `toggleDialog`.
- Create: `tests/playback-queue-drawer-store.test.ts`
  Cover the new queue drawer store open/close/toggle actions.
- Create: `tests/shortcut-updates-wiring.test.ts`
  Lock the renderer wiring by checking the bridge action handling and Settings labels in source.
- Modify: `src/shared/shortcut-keys.ts`
  Add the new action ids and default bindings.
- Modify: `src/renderer/types/core/store.types.ts`
  Extend `SearchDialogStoreState` and add the playback queue drawer store contract.
- Modify: `src/renderer/stores/search-dialog-store.ts`
  Add `toggleDialog`.
- Create: `src/renderer/stores/playback-queue-drawer-store.ts`
  Hold only the playback queue drawer visibility state.
- Modify: `src/renderer/components/SearchDialog/index.tsx`
  Reuse the shared search dialog store for toggle behavior.
- Modify: `src/renderer/components/PlaybackControl/index.tsx`
  Replace local queue drawer state with the shared queue drawer store.
- Modify: `src/renderer/components/PlaybackControl/PlaybackPreferenceControls.tsx`
  Keep the queue button calling the shared open action through the parent callback.
- Modify: `src/renderer/components/PlaybackShortcutBridge/index.tsx`
  Dispatch the new shortcut actions through store, router, and Electron window API.
- Modify: `src/renderer/pages/Settings/components/ShortcutKeySettings.tsx`
  Update action labels to match the new behavior and actions.

## Tasks

### Task 1: Extend shortcut contract tests first

**Files:**
- Modify: `tests/shortcut-keys.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
test('default shortcut bindings include the new navigation and visibility actions', () => {
  assert.equal(Object.keys(DEFAULT_SHORTCUT_BINDINGS).length, 13)
  assert.deepEqual(DEFAULT_SHORTCUT_BINDINGS.toggleFullscreen, {
    local: 'Ctrl+Shift+F',
    global: 'Alt+Ctrl+Shift+F',
  })
  assert.deepEqual(DEFAULT_SHORTCUT_BINDINGS.toggleSearch, {
    local: 'Ctrl+K',
    global: 'Alt+Ctrl+K',
  })
  assert.deepEqual(DEFAULT_SHORTCUT_BINDINGS.navigateBack, {
    local: 'Alt+ArrowLeft',
    global: 'Alt+Ctrl+ArrowLeft',
  })
  assert.deepEqual(DEFAULT_SHORTCUT_BINDINGS.navigateForward, {
    local: 'Alt+ArrowRight',
    global: 'Alt+Ctrl+ArrowRight',
  })
  assert.deepEqual(DEFAULT_SHORTCUT_BINDINGS.togglePlaylist, {
    local: 'Ctrl+Shift+L',
    global: 'Alt+Ctrl+Shift+L',
  })
})

test('resolveEnabledGlobalShortcutRegistrations includes the new global actions', () => {
  const registrations = resolveEnabledGlobalShortcutRegistrations({
    enabled: true,
    bindings: DEFAULT_SHORTCUT_BINDINGS,
  })

  assert.equal(
    registrations.some(item => item.actionId === 'toggleFullscreen'),
    true
  )
  assert.equal(
    registrations.some(item => item.actionId === 'toggleSearch'),
    true
  )
  assert.equal(
    registrations.some(item => item.actionId === 'navigateBack'),
    true
  )
  assert.equal(
    registrations.some(item => item.actionId === 'navigateForward'),
    true
  )
  assert.equal(
    registrations.some(item => item.actionId === 'togglePlaylist'),
    true
  )
  assert.equal(registrations.length, 12)
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/shortcut-keys.test.ts`
Expected: `FAIL` because `toggleFullscreen`, `toggleSearch`, `navigateBack`, `navigateForward`, and `togglePlaylist` do not exist yet.

- [ ] **Step 3: Write minimal implementation**

```ts
export const SHORTCUT_ACTIONS = [
  'playPause',
  'nextTrack',
  'previousTrack',
  'volumeUp',
  'volumeDown',
  'likeSong',
  'togglePlayer',
  'toggleFullscreen',
  'toggleSearch',
  'navigateBack',
  'navigateForward',
  'togglePlaylist',
] as const

export const DEFAULT_SHORTCUT_BINDINGS: ShortcutBindings = {
  // existing bindings...
  toggleFullscreen: {
    local: 'Ctrl+Shift+F',
    global: 'Alt+Ctrl+Shift+F',
  },
  toggleSearch: {
    local: 'Ctrl+K',
    global: 'Alt+Ctrl+K',
  },
  navigateBack: {
    local: 'Alt+ArrowLeft',
    global: 'Alt+Ctrl+ArrowLeft',
  },
  navigateForward: {
    local: 'Alt+ArrowRight',
    global: 'Alt+Ctrl+ArrowRight',
  },
  togglePlaylist: {
    local: 'Ctrl+Shift+L',
    global: 'Alt+Ctrl+Shift+L',
  },
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/shortcut-keys.test.ts`
Expected: `PASS` for the new default binding and registration assertions.

- [ ] **Step 5: Commit**

```bash
git add tests/shortcut-keys.test.ts src/shared/shortcut-keys.ts
git commit -m "test: cover shortcut action contract updates"
```

### Task 2: Add failing store tests and shared state

**Files:**
- Modify: `tests/search-dialog-store.test.ts`
- Create: `tests/playback-queue-drawer-store.test.ts`
- Modify: `src/renderer/types/core/store.types.ts`
- Modify: `src/renderer/stores/search-dialog-store.ts`
- Create: `src/renderer/stores/playback-queue-drawer-store.ts`

- [ ] **Step 1: Write the failing tests**

```ts
test('search dialog store toggles dialog visibility', () => {
  useSearchDialogStore.setState({ open: false })

  useSearchDialogStore.getState().toggleDialog()
  assert.equal(useSearchDialogStore.getState().open, true)

  useSearchDialogStore.getState().toggleDialog()
  assert.equal(useSearchDialogStore.getState().open, false)
})
```

```ts
import { usePlaybackQueueDrawerStore } from '../src/renderer/stores/playback-queue-drawer-store.ts'

test('playback queue drawer store exposes explicit and toggle actions', () => {
  usePlaybackQueueDrawerStore.setState({ open: false })

  usePlaybackQueueDrawerStore.getState().openDrawer()
  assert.equal(usePlaybackQueueDrawerStore.getState().open, true)

  usePlaybackQueueDrawerStore.getState().toggleDrawer()
  assert.equal(usePlaybackQueueDrawerStore.getState().open, false)

  usePlaybackQueueDrawerStore.getState().setOpen(true)
  assert.equal(usePlaybackQueueDrawerStore.getState().open, true)

  usePlaybackQueueDrawerStore.getState().closeDrawer()
  assert.equal(usePlaybackQueueDrawerStore.getState().open, false)
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test tests/search-dialog-store.test.ts tests/playback-queue-drawer-store.test.ts`
Expected: `FAIL` because `toggleDialog` and `playback-queue-drawer-store.ts` do not exist yet.

- [ ] **Step 3: Write minimal implementation**

```ts
export interface SearchDialogStoreState {
  open: boolean
  setOpen: (open: boolean) => void
  openDialog: () => void
  closeDialog: () => void
  toggleDialog: () => void
}

export interface PlaybackQueueDrawerStoreState {
  open: boolean
  setOpen: (open: boolean) => void
  openDrawer: () => void
  closeDrawer: () => void
  toggleDrawer: () => void
}
```

```ts
export const useSearchDialogStore = create<SearchDialogStoreState>(set => ({
  open: false,
  setOpen: open => set({ open }),
  openDialog: () => set({ open: true }),
  closeDialog: () => set({ open: false }),
  toggleDialog: () => set(state => ({ open: !state.open })),
}))
```

```ts
export const usePlaybackQueueDrawerStore =
  create<PlaybackQueueDrawerStoreState>(set => ({
    open: false,
    setOpen: open => set({ open }),
    openDrawer: () => set({ open: true }),
    closeDrawer: () => set({ open: false }),
    toggleDrawer: () => set(state => ({ open: !state.open })),
  }))
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test tests/search-dialog-store.test.ts tests/playback-queue-drawer-store.test.ts`
Expected: `PASS`.

- [ ] **Step 5: Commit**

```bash
git add tests/search-dialog-store.test.ts tests/playback-queue-drawer-store.test.ts src/renderer/types/core/store.types.ts src/renderer/stores/search-dialog-store.ts src/renderer/stores/playback-queue-drawer-store.ts
git commit -m "feat: add shared shortcut visibility stores"
```

### Task 3: Add failing wiring tests and implement renderer integration

**Files:**
- Create: `tests/shortcut-updates-wiring.test.ts`
- Modify: `src/renderer/components/SearchDialog/index.tsx`
- Modify: `src/renderer/components/PlaybackControl/index.tsx`
- Modify: `src/renderer/components/PlaybackShortcutBridge/index.tsx`
- Modify: `src/renderer/pages/Settings/components/ShortcutKeySettings.tsx`

- [ ] **Step 1: Write the failing test**

```ts
test('shortcut bridge dispatches the new shortcut actions', async () => {
  const bridgeSource = await readFile(
    new URL('../src/renderer/components/PlaybackShortcutBridge/index.tsx', import.meta.url),
    'utf8'
  )

  assert.match(bridgeSource, /actionId === 'toggleFullscreen'/)
  assert.match(bridgeSource, /actionId === 'toggleSearch'/)
  assert.match(bridgeSource, /actionId === 'navigateBack'/)
  assert.match(bridgeSource, /actionId === 'navigateForward'/)
  assert.match(bridgeSource, /actionId === 'togglePlaylist'/)
})

test('settings labels expose the renamed and new shortcut actions', async () => {
  const settingsSource = await readFile(
    new URL('../src/renderer/pages/Settings/components/ShortcutKeySettings.tsx', import.meta.url),
    'utf8'
  )

  assert.match(settingsSource, /toggleSearch: '显示\\/隐藏搜索'/)
  assert.match(settingsSource, /toggleFullscreen: '全屏\\/非全屏'/)
  assert.match(settingsSource, /navigateBack: '后退'/)
  assert.match(settingsSource, /navigateForward: '前进'/)
  assert.match(settingsSource, /togglePlaylist: '显示\\/隐藏播放列表'/)
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/shortcut-updates-wiring.test.ts`
Expected: `FAIL` because the bridge does not dispatch the new actions and Settings labels are missing.

- [ ] **Step 3: Write minimal implementation**

```ts
if (actionId === 'toggleSearch') {
  useSearchDialogStore.getState().toggleDialog()
  return
}

if (actionId === 'togglePlaylist') {
  usePlaybackQueueDrawerStore.getState().toggleDrawer()
  return
}

if (actionId === 'navigateBack') {
  void router.navigate(-1)
  return
}

if (actionId === 'navigateForward') {
  void router.navigate(1)
  return
}

if (actionId === 'toggleFullscreen') {
  void getElectronWindowApi()?.toggleFullScreen()
  return
}
```

```ts
const open = usePlaybackQueueDrawerStore(state => state.open)
const setOpen = usePlaybackQueueDrawerStore(state => state.setOpen)
const openDrawer = usePlaybackQueueDrawerStore(state => state.openDrawer)
```

```ts
const SHORTCUT_ACTION_LABELS = {
  playPause: '播放/暂停',
  nextTrack: '下一首',
  previousTrack: '上一首',
  volumeUp: '增加音量',
  volumeDown: '减少音量',
  likeSong: '喜欢歌曲',
  togglePlayer: '隐藏/显示播放器',
  toggleFullscreen: '全屏/非全屏',
  toggleSearch: '显示/隐藏搜索',
  navigateBack: '后退',
  navigateForward: '前进',
  togglePlaylist: '显示/隐藏播放列表',
} as Record<ShortcutActionId, string>
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test tests/shortcut-updates-wiring.test.ts`
Expected: `PASS`.

- [ ] **Step 5: Commit**

```bash
git add tests/shortcut-updates-wiring.test.ts src/renderer/components/SearchDialog/index.tsx src/renderer/components/PlaybackControl/index.tsx src/renderer/components/PlaybackShortcutBridge/index.tsx src/renderer/pages/Settings/components/ShortcutKeySettings.tsx
git commit -m "feat: wire shortcut action integrations"
```

### Task 4: Run targeted verification

**Files:**
- Modify: `tests/shortcut-keys.test.ts`
- Modify: `tests/search-dialog-store.test.ts`
- Create: `tests/playback-queue-drawer-store.test.ts`
- Create: `tests/shortcut-updates-wiring.test.ts`
- Modify: `src/shared/shortcut-keys.ts`
- Modify: `src/renderer/types/core/store.types.ts`
- Modify: `src/renderer/stores/search-dialog-store.ts`
- Create: `src/renderer/stores/playback-queue-drawer-store.ts`
- Modify: `src/renderer/components/SearchDialog/index.tsx`
- Modify: `src/renderer/components/PlaybackControl/index.tsx`
- Modify: `src/renderer/components/PlaybackShortcutBridge/index.tsx`
- Modify: `src/renderer/pages/Settings/components/ShortcutKeySettings.tsx`

- [ ] **Step 1: Run the focused tests**

Run: `node --test tests/shortcut-keys.test.ts tests/search-dialog-store.test.ts tests/playback-queue-drawer-store.test.ts tests/shortcut-updates-wiring.test.ts`
Expected: `PASS`.

- [ ] **Step 2: Run targeted lint**

Run: `pnpm exec eslint tests/shortcut-keys.test.ts tests/search-dialog-store.test.ts tests/playback-queue-drawer-store.test.ts tests/shortcut-updates-wiring.test.ts src/shared/shortcut-keys.ts src/renderer/types/core/store.types.ts src/renderer/stores/search-dialog-store.ts src/renderer/stores/playback-queue-drawer-store.ts src/renderer/components/SearchDialog/index.tsx src/renderer/components/PlaybackControl/index.tsx src/renderer/components/PlaybackShortcutBridge/index.tsx src/renderer/pages/Settings/components/ShortcutKeySettings.tsx`
Expected: `0 problems` or only pre-existing unrelated warnings outside the target file list.

- [ ] **Step 3: Commit**

```bash
git add tests/shortcut-keys.test.ts tests/search-dialog-store.test.ts tests/playback-queue-drawer-store.test.ts tests/shortcut-updates-wiring.test.ts src/shared/shortcut-keys.ts src/renderer/types/core/store.types.ts src/renderer/stores/search-dialog-store.ts src/renderer/stores/playback-queue-drawer-store.ts src/renderer/components/SearchDialog/index.tsx src/renderer/components/PlaybackControl/index.tsx src/renderer/components/PlaybackShortcutBridge/index.tsx src/renderer/pages/Settings/components/ShortcutKeySettings.tsx
git commit -m "feat: add shortcut action updates"
```

## Self-Review

- Spec coverage:
  - 全屏/非全屏快捷键: Task 1, Task 3
  - 搜索切换与文案更名: Task 1, Task 2, Task 3
  - 前进/后退快捷键: Task 1, Task 3
  - 播放列表显示/隐藏快捷键: Task 1, Task 2, Task 3
  - 设置页配置与展示: Task 1, Task 3
  - 目标验证: Task 4
- Placeholder scan:
  - No `TODO`, `TBD`, or implicit “handle appropriately” steps remain.
- Type consistency:
  - Shared action ids are `toggleFullscreen`, `toggleSearch`, `navigateBack`, `navigateForward`, and `togglePlaylist`.
  - Shared store methods are `toggleDialog` and `toggleDrawer`.
