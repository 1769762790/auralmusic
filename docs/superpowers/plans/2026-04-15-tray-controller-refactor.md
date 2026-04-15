# Tray Controller Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extract tray setup from the Electron main entry and add tray playback/settings commands synchronized with renderer playback state.

**Architecture:** Introduce shared tray contracts, a preload tray bridge, a dedicated main tray controller, and a renderer bridge component that syncs playback state and handles tray commands. Keep playback and navigation state owned by the renderer.

**Tech Stack:** Electron, React, TypeScript, Zustand, node:test

---

### Task 1: Define tray contracts and preload API

**Files:**

- Create: `src/shared/ipc/tray.ts`
- Create: `src/shared/tray.ts`
- Create: `src/preload/api/tray-api.ts`
- Modify: `src/preload/index.ts`
- Modify: `src/renderer/types/electron.d.ts`
- Modify: `tests/shared-ipc-channels.test.ts`
- Create: `tests/tray-api.test.ts`

### Task 2: Build and test the main tray controller

**Files:**

- Create: `src/main/tray/tray-controller.ts`
- Create: `tests/tray-controller.test.ts`

### Task 3: Add tray IPC wiring between renderer and main

**Files:**

- Create: `src/main/ipc/tray-ipc.ts`
- Modify: `src/main/index.ts`
- Create: `tests/tray-ipc.test.ts`

### Task 4: Add renderer tray bridge and hook it into the app shell

**Files:**

- Create: `src/renderer/components/TrayCommandBridge/index.tsx`
- Modify: `src/renderer/layout/AppLayout.tsx`

### Task 5: Verify end-to-end tray behavior

**Files:**

- Verify: `src/main/index.ts`
- Verify: `src/main/tray/tray-controller.ts`
- Verify: `src/renderer/components/TrayCommandBridge/index.tsx`
