# UserData Store Location Design

## Summary

This change moves the project's three local persistent stores out of the repository root and into the Electron user data directory.

Scope is intentionally narrow:

- keep using `electron-store`
- change only the storage location
- cover the three existing stores:
  - auth session store
  - app config store
  - download task store

This change does not redesign the persistence abstraction, add token encryption, or migrate legacy repository-root data.

## Problem

The current implementation writes local JSON-backed stores into the project directory by forcing `electron-store` to use `cwd: process.cwd()`.

That produces files such as:

- `aural-music-auth.json`
- `aural-music-config.json`
- `aural-music-downloads.json`

This is not an acceptable storage location for an installed desktop app:

- it leaks runtime state into the source tree
- it is easy to commit or expose by mistake
- it does not follow normal desktop app data conventions

## Scope

### In scope

- stop using `process.cwd()` as the store directory
- move auth/config/download stores to `app.getPath('userData')`
- centralize store path resolution in one main-process helper
- preserve existing store APIs and runtime behavior
- add focused tests for the new directory resolution behavior

### Out of scope

- migrating old repository-root JSON data
- deleting old repository-root JSON files
- secure credential storage or OS keychain integration
- changing auth/config/download store schemas
- changing IPC contracts

## Design Choice

### Chosen approach

Keep `electron-store` and introduce one shared main-process store path helper used by all three stores.

### Why this approach

- smallest safe fix for the current problem
- keeps behavior stable above the storage layer
- avoids duplicating path logic in three separate modules
- prepares the codebase for a later auth-security upgrade without coupling that work to this cleanup

### Rejected alternatives

#### Keep per-store path logic inline

Rejected because it spreads platform path decisions across three modules and makes future changes harder to audit.

#### Replace auth with secure storage now

Rejected for this change because the current problem is incorrect storage location, not a full credential-storage redesign. Combining both would expand risk and scope without user need right now.

#### Full persistence abstraction for every store

Rejected because it is architectural overreach for a targeted cleanup.

## Architecture

### Shared path resolution

Add a small main-process helper module dedicated to store directory resolution.

Responsibilities:

- read `app.getPath('userData')`
- return the directory that should be used as `electron-store` `cwd`
- optionally create the target directory if needed

The helper should not know anything about auth, config, or downloads. It only resolves the application store root.

### Store integration

Three existing stores will consume the shared helper:

- `src/main/auth/store.ts`
- `src/main/config/store.ts`
- `src/main/download/store.ts`

Each store keeps:

- the same store name
- the same schema/defaults
- the same exported API

Only the underlying directory changes.

## Storage Result

After this change, these files should no longer be created in the project root:

- `aural-music-auth.json`
- `aural-music-config.json`
- `aural-music-downloads.json`

They should instead be written under the Electron user data directory for the app.

On Windows this will typically resolve under the roaming app-data area, but the implementation must always rely on `app.getPath('userData')` instead of hardcoding a platform path.

## Behavior Rules

- No legacy migration logic
- No fallback reads from the repository root
- No automatic cleanup of old project-root JSON files
- New builds only read/write from the `userData` location

That means old root-level JSON files may remain on disk but become ignored by the app.

## File-Level Change Plan

### Create

- `src/main/storage/store-path.ts`
  - resolve the app store directory from Electron `userData`
  - expose a small helper for `electron-store` initialization

### Modify

- `src/main/auth/store.ts`
  - replace `cwd: process.cwd()` with the shared store path helper

- `src/main/config/store.ts`
  - replace `cwd: process.cwd()` with the shared store path helper

- `src/main/download/store.ts`
  - replace `cwd: process.cwd()` with the shared store path helper

### Tests

- add or update store-related tests to verify:
  - path resolution no longer depends on `process.cwd()`
  - all three stores use the shared `userData`-based directory
  - existing read/write semantics remain intact

## Error Handling

The path helper should fail loudly if Electron cannot provide `userData`, because silent fallback to `process.cwd()` would reintroduce the original problem.

For testability, the helper should allow path resolution to be stubbed or injected where necessary.

## Testing Strategy

Automated tests should cover:

- shared path helper returns a `userData`-derived path
- auth/config/download store creation uses the shared helper
- store APIs still behave the same after initialization

Manual validation should cover:

1. start the app
2. perform login, config changes, and download-list changes
3. verify new JSON files appear under `userData`
4. verify repository root no longer receives updated JSON files

## Risks

### Fresh-state behavior for current testers

Because this change does not migrate existing project-root data, the app will behave like a fresh local environment after the switch. This is acceptable for the current testing phase.

### Hidden debug assumptions

If any local debugging workflow directly inspects root-level JSON files, that workflow will need to switch to the `userData` path.

## Success Criteria

This change is successful if:

- auth/config/download persistence no longer writes to the repository root
- all three stores resolve through one shared `userData`-based helper
- no IPC or upper-layer behavior regresses
- targeted tests pass
- `pnpm lint` still passes
