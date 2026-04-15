# Tray Controller Design

## Goal

Refactor tray setup out of `src/main/index.ts` into a focused module, and expand the tray menu so it can control playback and open Settings while keeping menu state synchronized with the renderer playback store.

## Scope

- Move tray icon creation, menu construction, click handling, and lifecycle helpers into a dedicated main-process tray module.
- Remove the old tray menu items for minimizing, desktop lyrics, and lyric lock.
- Add tray actions for play/pause, previous track, next track, playback mode selection, settings, and quit.
- Keep the renderer as the source of truth for playback state and route navigation.

## Architecture

### Main Process

- `src/main/tray/tray-controller.ts`
  Owns tray instance creation, context menu rebuilding, tray icon, click/double-click behavior, and action callbacks.
- `src/main/ipc/tray-ipc.ts`
  Accepts tray state updates from the renderer and pushes tray commands back to the active window.
- `src/main/index.ts`
  Only wires the tray controller and tray IPC into the app bootstrap lifecycle.

### Shared Contracts

- `src/shared/ipc/tray.ts`
  Defines IPC channel/event names for tray state sync and tray commands.
- `src/shared/tray.ts`
  Defines the tray state payload and tray command identifiers shared by main, preload, and renderer.

### Preload + Renderer

- `src/preload/api/tray-api.ts`
  Exposes a minimal `electronTray` bridge for syncing state and receiving commands.
- `src/renderer/components/TrayCommandBridge/index.tsx`
  Subscribes to the playback store, syncs tray state to the main process, and reacts to incoming tray commands by calling store actions or navigating to `/settings`.
- `src/renderer/layout/AppLayout.tsx`
  Mounts the new bridge once at the app shell level.

## Menu Design

The tray context menu will contain:

1. Disabled current track label
2. `播放` or `暂停`
3. `上一首`
4. `下一首`
5. `单曲循环`
   - `列表循环`
   - `随机播放`
   - `单曲循环`
6. `设置`
7. `退出`

`最小化`、`打开桌面歌词`、`锁定桌面歌词` are intentionally removed.

## Data Flow

1. Renderer observes playback store state changes.
2. Renderer sends a compact tray state payload to the main process through preload.
3. Main updates the tray menu labels, enabled states, and playback-mode checkmarks.
4. User clicks a tray action.
5. Main emits a tray command event to the renderer.
6. Renderer executes the corresponding playback action or route navigation.

## Guardrails

- If there is no active window, tray actions that require the renderer do nothing safely.
- If there is no current track, previous/next/play entries are disabled as appropriate.
- Settings command always shows the main window before navigating.
