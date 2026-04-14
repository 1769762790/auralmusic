# Download Default Directory Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make download storage default to the OS downloads directory in production, stop creating `downloads` under the project root by default, and migrate legacy project-root download settings safely.

**Architecture:** Keep the source of truth in the Electron main process. Treat `config.downloadDir === ''` as "use system downloads directory", and only persist a non-empty path when the user explicitly chooses a custom folder. Migrate legacy `process.cwd()/downloads` values to `''` during config normalization so existing users move to the new behavior automatically.

**Tech Stack:** Electron main/preload/renderer, React, Zustand config store, Node test runner, ESLint

---

## File Map

- Modify: `src/main/config/types.ts`
  Normalize `downloadDir` so empty string means "system default", and migrate legacy project-root `downloads` values to empty string.

- Modify: `src/main/ipc/download-ipc.ts`
  Replace the project-root default directory source with `app.getPath('downloads')`, expose dependency injection for tests, and keep all main-process download directory resolution centralized here.

- Modify: `src/main/download/download-service.ts`
  Ensure the service consistently interprets empty `downloadDir` as "use injected default root directory" for enqueue/open operations.

- Modify: `src/renderer/pages/Settings/components/DownloadSettings.tsx`
  Stop auto-persisting the resolved default directory back into config on first load. Display the resolved directory for UX, but preserve empty config until the user explicitly picks a custom folder. Add a "restore system default" action if needed.

- Modify: `tests/download-service.test.ts`
  Update expectations from project-root `downloads` to system downloads semantics.

- Modify: `tests/download-ipc.test.ts`
  Inject `app.getPath('downloads')` behavior into `createDownloadIpc` tests and assert the dialog/open-directory code uses the system default when config is empty.

- Modify: `tests/config-types.test.ts`
  Add normalization coverage for legacy `process.cwd()/downloads` migration to empty string.

---

### Task 1: Normalize Config Semantics

**Files:**

- Modify: `src/main/config/types.ts`
- Test: `tests/config-types.test.ts`

- [ ] **Step 1: Write the failing config normalization test**

```ts
test('normalizeDownloadDir migrates legacy project downloads path to empty string', () => {
  const legacyPath = path.join(process.cwd(), 'downloads')
  assert.equal(normalizeDownloadDir(legacyPath), '')
})

test('normalizeDownloadDir preserves custom absolute directories', () => {
  assert.equal(normalizeDownloadDir('D:\\Music'), 'D:\\Music')
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/config-types.test.ts`
Expected: FAIL because `normalizeDownloadDir()` currently returns the legacy path unchanged.

- [ ] **Step 3: Implement minimal normalization**

```ts
export function normalizeDownloadDir(value: unknown) {
  if (typeof value !== 'string') {
    return defaultConfig.downloadDir
  }

  const trimmed = value.trim()
  if (!trimmed) {
    return ''
  }

  const legacyProjectDownloads = path.join(process.cwd(), 'downloads')
  if (path.resolve(trimmed) === path.resolve(legacyProjectDownloads)) {
    return ''
  }

  return value
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/config-types.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/main/config/types.ts tests/config-types.test.ts
git commit -m "fix(config): migrate legacy download dir to system default"
```

### Task 2: Replace Main-Process Default Directory Source

**Files:**

- Modify: `src/main/ipc/download-ipc.ts`
- Test: `tests/download-ipc.test.ts`

- [ ] **Step 1: Write the failing IPC test**

```ts
test('download ipc uses app downloads directory when config dir is empty', async () => {
  const ipc = createDownloadIpc({
    appGetPath: name => {
      assert.equal(name, 'downloads')
      return 'C:\\Users\\tester\\Downloads'
    },
  })

  assert.equal(
    await handlers[DOWNLOAD_IPC_CHANNELS.GET_DEFAULT_DIRECTORY](),
    'C:\\Users\\tester\\Downloads'
  )
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/download-ipc.test.ts`
Expected: FAIL because the default service still uses `path.join(process.cwd(), 'downloads')`.

- [ ] **Step 3: Implement main-process default directory injection**

```ts
type DownloadIpcRegistrationOptions = {
  appGetPath?: (name: 'downloads') => string
  // existing injected dependencies...
}

const defaultDownloadService = new DownloadService({
  defaultRootDir: electron.app.getPath('downloads'),
  readConfig: () => ({
    downloadDir: getConfig('downloadDir'),
    // ...
  }),
})
```

If the file already supports test injection, prefer:

```ts
const appGetPath = options.appGetPath ?? (name => electron.app.getPath(name))
const defaultDownloadService = new DownloadService({
  defaultRootDir: appGetPath('downloads'),
  // ...
})
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/download-ipc.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/main/ipc/download-ipc.ts tests/download-ipc.test.ts
git commit -m "fix(download): source default dir from system downloads"
```

### Task 3: Keep Download Service Semantics Consistent

**Files:**

- Modify: `src/main/download/download-service.ts`
- Test: `tests/download-service.test.ts`

- [ ] **Step 1: Write the failing service test**

```ts
test('DownloadService resolves system default directory when config dir is empty', async () => {
  const service = new DownloadService({
    defaultRootDir: 'C:\\Users\\tester\\Downloads',
    readConfig: () => ({
      downloadDir: '',
      // other required config
    }),
  })

  assert.equal(service.getDefaultDirectory(''), 'C:\\Users\\tester\\Downloads')
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/download-service.test.ts`
Expected: FAIL if service logic still assumes project-root `downloads`.

- [ ] **Step 3: Implement minimal service fix**

```ts
getDefaultDirectory(directory?: string) {
  const resolved = (directory || '').trim()
  return resolved || this.defaultRootDir
}
```

Make sure enqueue/open-directory/open-file-folder all reuse this path resolution rather than duplicating logic.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/download-service.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/main/download/download-service.ts tests/download-service.test.ts
git commit -m "fix(download): treat empty config dir as system default"
```

### Task 4: Stop Persisting the Default Directory from Renderer

**Files:**

- Modify: `src/renderer/pages/Settings/components/DownloadSettings.tsx`

- [ ] **Step 1: Add a failing UI behavior note in code review form**

```ts
// Existing bug to remove:
if (!downloadDir.trim() && !hasSyncedDefaultDirRef.current) {
  hasSyncedDefaultDirRef.current = true
  await setConfig('downloadDir', directory)
}
```

This is the behavior to delete, because it persists the main-process default path into config even when the user never chose a custom directory.

- [ ] **Step 2: Run targeted manual verification before changing code**

Run: `pnpm dev`
Expected current bug: open settings, empty `downloadDir` becomes a stored absolute path after initial load.

- [ ] **Step 3: Implement minimal renderer change**

```ts
useEffect(() => {
  const electronDownload = getElectronDownloadApi()
  let cancelled = false

  if (!electronDownload) {
    return
  }

  const loadDefaultDirectory = async () => {
    setLoadingDefaultDir(true)
    try {
      const directory = await electronDownload.getDefaultDirectory()
      if (!cancelled) {
        setDefaultDownloadDir(directory)
      }
    } finally {
      if (!cancelled) {
        setLoadingDefaultDir(false)
      }
    }
  }

  void loadDefaultDirectory()
  return () => {
    cancelled = true
  }
}, [])
```

Keep:

```ts
const resolvedDownloadDir = downloadDir.trim() || defaultDownloadDir.trim()
```

Do not write `resolvedDownloadDir` back into config automatically.

- [ ] **Step 4: Add restore-to-system-default button**

```tsx
<Button
  type='button'
  variant='outline'
  disabled={!downloadDir.trim()}
  onClick={() => void setConfig('downloadDir', '')}
>
  恢复系统默认
</Button>
```

- [ ] **Step 5: Run manual verification**

Run: `pnpm dev`
Expected:

- empty config shows system downloads directory in UI
- app does not persist it automatically
- picking a custom directory still persists
- clicking "恢复系统默认" resets config to `''`

- [ ] **Step 6: Commit**

```bash
git add src/renderer/pages/Settings/components/DownloadSettings.tsx
git commit -m "fix(settings): keep system download dir implicit by default"
```

### Task 5: Run Full Targeted Regression Set

**Files:**

- Verify: `tests/config-types.test.ts`
- Verify: `tests/download-ipc.test.ts`
- Verify: `tests/download-service.test.ts`
- Verify: `src/renderer/pages/Settings/components/DownloadSettings.tsx`

- [ ] **Step 1: Run targeted tests**

Run:

```bash
node --test tests/config-types.test.ts tests/download-ipc.test.ts tests/download-service.test.ts
```

Expected: PASS

- [ ] **Step 2: Run targeted lint**

Run:

```bash
pnpm exec eslint src/main/config/types.ts src/main/ipc/download-ipc.ts src/main/download/download-service.ts src/renderer/pages/Settings/components/DownloadSettings.tsx
```

Expected: PASS

- [ ] **Step 3: Run manual production-path scenarios**

Run: `pnpm dev`

Verify:

- New user with empty config downloads into OS downloads directory
- Custom directory still works
- Open directory opens the effective directory
- Legacy config containing `<project>/downloads` is normalized to system default on next launch

- [ ] **Step 4: Commit**

```bash
git add src/main/config/types.ts src/main/ipc/download-ipc.ts src/main/download/download-service.ts src/renderer/pages/Settings/components/DownloadSettings.tsx tests/config-types.test.ts tests/download-ipc.test.ts tests/download-service.test.ts
git commit -m "fix(download): default to system downloads directory"
```

---

## Self-Review

- Spec coverage: covered default source, empty-string semantics, legacy migration, renderer UX, and targeted regression tests.
- Placeholder scan: no `TODO`/`TBD` placeholders remain.
- Type consistency: `downloadDir === ''` is consistently treated as "system default" across config, main, renderer, and tests.
