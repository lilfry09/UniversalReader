import { app, BrowserWindow } from 'electron'
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

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC!, 'vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  attachWebContentsDebugging(win)

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
