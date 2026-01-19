# Agentic Coding Guidelines

This document provides technical context, commands, and rules for AI agents (and humans) working in the **UniversalReader** repository.

## 1. Project Overview

- **Application Type**: Desktop eBook Reader.
- **Core Stack**:
  - **Runtime**: Electron (Main Process).
  - **Frontend**: React 18 + TypeScript + Vite.
  - **Styling**: TailwindCSS + PostCSS.
  - **Router**: react-router-dom (HashRouter).
  - **Database**: better-sqlite3 (SQLite) for library management.
  - **Rendering**: PDF (react-pdf), EPUB (foliate-js), Markdown (react-markdown).

## 2. Development Workflow & Commands

### Setup
- **Install Dependencies**:
  ```bash
  npm install
  ```
  *Note: Ensure C++ build tools are available for `better-sqlite3` native compilation.*

### Development
- **Start Dev Server**:
  ```bash
  npm run dev
  ```
  *Launches Vite dev server and Electron window in watch mode.*

### Build & Production
- **Build Application**:
  ```bash
  npm run build
  ```
  *Sequence: `tsc` (Type Check) -> `vite build` (Renderer) -> `electron-builder` (Packager).*
  *Output: `dist/win-unpacked/` (Windows executable).*

- **Preview Production Build**:
  ```bash
  npm run preview
  ```

### Quality Assurance (Linting)
- **Run Linter**:
  ```bash
  npm run lint
  ```
  *Uses ESLint 9 with Flat Config. Zero tolerance for warnings (`--max-warnings 0`).*

### Testing
- **Status**: No testing framework is currently configured in `package.json`.
- **Future Guidelines (if creating tests)**:
  - **Unit/Integration**: Recommend **Vitest**.
    - Run All: `npx vitest run`
    - **Run Single Test**: `npx vitest run <path/to/file.test.ts>`
  - **E2E**: Recommend **Playwright**.
  - *Agent Note*: If asked to "run tests", verify if a test runner exists first. If not, inform the user or propose installing Vitest.

## 3. Code Style & Conventions

### Language & Syntax
- **Language**: TypeScript (Strict Mode).
- **Module System**: ESM (`import`/`export`) throughout (Renderer & Main).
- **Semicolons**: **Avoid** semicolons (Prettier style: none).
- **Quotes**: Use **single quotes** (`'`) for strings.
- **Indentation**: 2 spaces.

### File Structure & Naming
- **Components**: `src/components/PascalCase.tsx`.
- **Pages**: `src/pages/PascalCase.tsx`.
- **Hooks**: `src/hooks/useCamelCase.ts`.
- **Utilities**: `src/utils/camelCase.ts` or `kebab-case.ts`.
- **Main Process**: `electron/` directory.
  - `main.ts`: Entry point.
  - `preload.ts`: Context bridge.
  - `handlers.ts`: IPC implementation.

### Imports
- **Node Built-ins**: MUST use `node:` prefix (e.g., `import path from 'node:path'`).
- **React**: `import { useState } from 'react'` (Named imports preferred).
- **Ordering**:
  1. External Libraries (`react`, `electron`, etc.)
  2. Internal Components/Utils (Relative paths: `../components/`)
  3. Styles/Assets (`./index.css`)

### TypeScript Rules
- **No `any`**: Avoid `any` at all costs. Use `unknown` with narrowing or define specific interfaces.
- **Interfaces**:
  - Name: `PascalCase` (e.g., `Book`).
  - **Do NOT** use `I` prefix (e.g., `IBook` is forbidden).
  - Export shared types from `src/types.ts`.
- **Props**: Define `Props` interface for components (e.g., `interface ReaderProps { ... }`).

### Electron Security & Patterns
- **Context Isolation**: MUST be enabled (`contextIsolation: true`).
- **Node Integration**: MUST be disabled (`nodeIntegration: false`).
- **IPC Communication**:
  - **Renderer**: Use `window.ipcRenderer.invoke(channel, data)` for async tasks.
  - **Main**: Use `ipcMain.handle(channel, async handler)` for requests.
  - **Security**: Validate all inputs in the Main process handlers. Do not trust Renderer input blindly.

### Error Handling
- **Async/Await**: Use `try/catch` blocks for all async operations, especially file I/O and database calls.
- **UI Feedback**: Renderer must handle errors gracefully (e.g., "Failed to load book") rather than crashing white-screen.
- **Logging**:
  - Main Process: `console.error` (appears in terminal).
  - Renderer: `console.error` (appears in DevTools).

## 4. UI/UX Guidelines (TailwindCSS)
- Use **utility classes** directly in `className`.
- **Icons**: Use `lucide-react` for consistent iconography.
- **Layout**: Flexbox and Grid are preferred.
- **Responsive**: Mobile-first not strictly required for Desktop app, but good practice.
- **Dark Mode**: Support via `dark:` variant if requested (currently light mode focused).

## 5. Agent Operational Rules

1. **Verify Before implementing**:
   - Always run `ls` to check file locations.
   - Read `package.json` to confirm dependency versions before installing new ones.

2. **Incremental Changes**:
   - Make one logical change at a time.
   - Verify with `npm run lint` after editing code.
   - Verify with `npm run build` after structural changes.

3. **Dealing with "White Screen" or Crushes**:
   - Check `vite.config.ts` for `base: './'` (Relative paths).
   - Check Console logs in DevTools (Renderer).
   - Check Terminal logs (Main Process).

4. **New Dependencies**:
   - Prefer existing libraries (`better-sqlite3`, `react-pdf`) over adding new ones.
   - If adding a native module, remember it requires rebuilding (`electron-builder` handles this usually, but be aware of C++ toolchain requirements).

---
*Reference this file for all future coding tasks.*
