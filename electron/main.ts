import { app, BrowserWindow, shell } from 'electron'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import './handlers' // Import handlers to register IPC events

// Fix for __dirname and __filename in ESM
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

process.env.DIST = path.join(__dirname, '../dist')
process.env.VITE_PUBLIC = app.isPackaged ? process.env.DIST! : path.join(process.env.DIST!, '../public')

let win: BrowserWindow | null
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'] as string | undefined
const allowedExternalProtocols = new Set(['http:', 'https:', 'mailto:'])

function isPathInsideDirectory(filePath: string, directory: string): boolean {
  const resolvedPath = path.resolve(filePath)
  const resolvedDirectory = path.resolve(directory)
  const relativePath = path.relative(resolvedDirectory, resolvedPath)
  return relativePath === '' || (!relativePath.startsWith('..') && !path.isAbsolute(relativePath))
}

function isAllowedExternalUrl(rawUrl: string): boolean {
  try {
    const url = new URL(rawUrl)
    return allowedExternalProtocols.has(url.protocol)
  } catch {
    return false
  }
}

function isAllowedAppNavigation(rawUrl: string): boolean {
  if (rawUrl === 'about:blank') return true

  try {
    const url = new URL(rawUrl)

    if (VITE_DEV_SERVER_URL) {
      return url.origin === new URL(VITE_DEV_SERVER_URL).origin
    }

    if (url.protocol !== 'file:' || !process.env.DIST) return false
    return isPathInsideDirectory(fileURLToPath(url), process.env.DIST)
  } catch {
    return false
  }
}

async function openExternalUrl(rawUrl: string) {
  if (!isAllowedExternalUrl(rawUrl)) return
  await shell.openExternal(rawUrl)
}

function attachWebContentsDebugging(browserWindow: BrowserWindow) {
  browserWindow.webContents.on(
    'did-fail-load',
    (_event, errorCode, errorDescription, validatedURL, isMainFrame) => {
      if (!isMainFrame) return
      console.error(
        '[main] did-fail-load',
        JSON.stringify({ errorCode, errorDescription, validatedURL })
      )
    }
  )

  browserWindow.webContents.on('render-process-gone', (_event, details) => {
    console.error('[main] render-process-gone', JSON.stringify(details))
  })
}

function attachWebContentsSecurity(browserWindow: BrowserWindow) {
  browserWindow.webContents.setWindowOpenHandler(({ url }) => {
    void openExternalUrl(url)
    return { action: 'deny' }
  })

  browserWindow.webContents.on('will-navigate', (event, url) => {
    if (isAllowedAppNavigation(url)) return

    event.preventDefault()
    void openExternalUrl(url)
  })

  browserWindow.webContents.on('will-redirect', (event, url, _isInPlace, isMainFrame) => {
    if (!isMainFrame || isAllowedAppNavigation(url)) return

    event.preventDefault()
    void openExternalUrl(url)
  })

  browserWindow.webContents.session.setPermissionRequestHandler((_webContents, _permission, callback) => {
    callback(false)
  })
}

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC!, 'vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  })

  attachWebContentsDebugging(win)
  attachWebContentsSecurity(win)

  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    console.log('[main] loading dev url:', VITE_DEV_SERVER_URL)
    win.loadURL(VITE_DEV_SERVER_URL)
    win.webContents.openDevTools({ mode: 'detach' })
  } else {
    const indexPath = path.join(process.env.DIST!, 'index.html')
    console.log('[main] loading file:', indexPath)
    win.loadFile(indexPath)
  }
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(createWindow)
