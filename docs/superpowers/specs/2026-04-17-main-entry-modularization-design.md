# Main Entry Modularization Design

## Goal

将 `src/main/index.ts` 重构为轻量主进程入口，让它只负责注册 Electron scheme 并启动主进程应用编排。重构后保持现有运行行为不变，同时让窗口创建、IPC 注册、权限处理、应用生命周期和运行时状态拥有清晰边界。

## Current Problem

`src/main/index.ts` 当前同时承担这些职责：

- Electron app 生命周期绑定。
- 主窗口创建、renderer 加载、titlebar、DevTools 快捷键。
- Music API 运行时启动和释放。
- Auth session 初始化和请求头 hook 注册。
- IPC 模块注册。
- 音频权限策略注册。
- 托盘控制器初始化和窗口显示/隐藏控制。
- `mainWindow`、`isQuitting`、`musicApiRuntime` 运行状态管理。

这些职责放在同一个入口文件里会让后续改 DevTools、窗口行为、托盘行为、启动顺序时相互影响。目标不是改变行为，而是把这些变化点拆到更小、更稳定的模块里。

## Target Architecture

`src/main/index.ts` 保留为唯一入口，只做两件事：

```ts
registerLocalMediaScheme()
bootstrapMainApp()
```

新增主进程应用层和窗口层模块：

- `src/main/app/bootstrap.ts`
  负责主进程启动编排。它注册 IPC、注册协议、权限、托盘，启动 Music API 和 auth session，创建主窗口，并绑定 app 生命周期。

- `src/main/app/app-state.ts`
  负责主进程运行状态。它保存 `mainWindow`、`isQuitting`、`musicApiRuntime`，并提供明确的读写方法，避免全局变量散落在入口文件。

- `src/main/app/lifecycle.ts`
  负责绑定 `activate`、`window-all-closed`、`before-quit`、`will-quit`。它只处理 Electron app event，并通过依赖注入访问窗口显示、退出标记、运行时释放和快捷键清理能力。

- `src/main/ipc/register-ipc.ts`
  聚合注册所有 IPC 模块。它接收配置变更回调、托盘控制器和退出回调，内部调用现有 `registerAuthIpc`、`registerCacheIpc`、`registerDownloadIpc`、`registerMusicSourceIpc`、`registerSystemFontsIpc`、`registerTrayIpc`、`registerWindowIpc`。

- `src/main/window/main-window.ts`
  负责创建主窗口和窗口相关绑定。它封装 `BrowserWindow` options、renderer 加载、preload 路径、窗口关闭行为、titlebar 主题、DevTools 快捷键和全局快捷键同步。

- `src/main/window/permission.ts`
  负责音频权限策略和 `session.defaultSession` permission handlers。它不直接依赖 `mainWindow` 变量，而是通过 `getMainWindow` 或 `isAllowedWebContents` 回调判断请求来源。

现有模块继续复用：

- `src/main/window/close-behavior.ts`
- `src/main/window/devtools.ts`
- `src/main/window/titlebar-theme.ts`
- `src/main/tray/tray-controller.ts`
- `src/main/shortcuts/global-shortcuts.ts`
- `src/main/music-api-runtime.ts`
- `src/main/server.ts`

## Data Flow

启动流程保持现有顺序：

1. `index.ts` 注册 local media scheme。
2. `bootstrapMainApp()` 等待 `app.whenReady()`。
3. 注册 config/auth/cache/download/music-source/system-fonts/tray/window IPC。
4. 注册 local media protocol。
5. 注册音频权限 handlers。
6. 初始化 tray controller。
7. 启动 Music API runtime。
8. 将 Music API runtime 写入环境。
9. 注册 auth request header hook。
10. bootstrap auth session。
11. 同步 native theme source。
12. 同步开机自启配置。
13. 创建主窗口。
14. 绑定 native theme 更新事件。
15. 绑定 app lifecycle events。

窗口创建流程保持现有行为：

1. 根据平台设置 `frame`、`titleBarStyle`、`titleBarOverlay`。
2. 使用 `getPreloadPath()` 设置 preload。
3. 开启 `contextIsolation`，关闭 `nodeIntegration`。
4. 保留 `devTools: true`。
5. 开发环境通过 `ELECTRON_RENDERER_URL` 加载 URL。
6. 生产环境通过 packaged renderer html 加载文件。
7. 绑定窗口状态事件和关闭行为。
8. 注册 `Control+Shift+I` detached DevTools 快捷键。
9. 应用 titlebar theme。
10. 同步配置化全局快捷键。
11. `closed` 时清理全局快捷键并清空主窗口引用。

## Behavior Preservation

这次重构不改变以下行为：

- 不改变 Music API 启动、环境注入和释放逻辑。
- 不改变 auth session bootstrap 和 request header hook 顺序。
- 不改变关闭窗口时隐藏到托盘、允许关闭、请求确认的判断逻辑。
- 不改变托盘菜单初始化和托盘命令发送逻辑。
- 不改变 renderer dev/prod 加载路径。
- 不改变音频权限允许范围。
- 不改变配置变更后同步全局快捷键的行为。
- 不改变 DevTools 使用 `toggleDetachedDevTools` 的行为。
- 不引入新的全局 store、事件总线或跨模块隐式依赖。

## Testing Strategy

使用现有 `node:test` 风格添加或扩展小范围测试：

- `tests/main-window-paths.test.ts`
  验证 packaged renderer 路径和 preload 路径解析保持原逻辑。

- `tests/window-permission.test.ts`
  验证只允许主窗口的音频相关权限，拒绝非音频权限和非主窗口请求。

- `tests/register-main-ipc.test.ts`
  通过注入 register 函数 spy，验证聚合注册会调用所有 IPC 注册函数，并保留 config 变更回调。

- 继续保留并运行：
  - `tests/window-close-behavior.test.ts`
  - `tests/devtools-window.test.ts`

完成后运行：

```powershell
node tests/main-window-paths.test.ts
node tests/window-permission.test.ts
node tests/register-main-ipc.test.ts
node tests/window-close-behavior.test.ts
node tests/devtools-window.test.ts
pnpm exec tsc -p tsconfig.node.json --noEmit
pnpm lint
```

## Non-Goals

- 不重写托盘控制器。
- 不重写 IPC 模块内部实现。
- 不调整 renderer 代码。
- 不改变生产环境是否允许 DevTools 的策略。
- 不处理现有 renderer TypeScript strict-mode 问题。
- 不清理与本次主进程入口拆分无关的历史 warning。

## Risks And Mitigation

- 启动顺序被改变会导致 auth、Music API 或 IPC 行为异常。
  缓解方式：`bootstrap.ts` 明确按当前 `index.ts` 顺序迁移，并用测试覆盖关键注册顺序。

- 状态拆到 `app-state.ts` 后引用关系不清晰。
  缓解方式：状态模块只暴露命名清楚的 getter/setter，不在状态模块里注册事件或执行副作用。

- 窗口模块过重。
  缓解方式：`main-window.ts` 只承接窗口创建和窗口绑定。权限、生命周期、IPC 注册分别放到独立模块。

- 测试过度 mock Electron 导致脆弱。
  缓解方式：把可测试逻辑做成小型纯函数或依赖注入函数，避免直接启动 Electron。
