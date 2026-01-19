import { ipcMain, app, dialog } from 'electron'
import Database from 'better-sqlite3'
import fs from 'fs'
import path from 'path'

// Database setup
const dbPath = path.join(app.getPath('userData'), 'library.db')
const db = new Database(dbPath)

// Initialize database schema
db.exec(`
  CREATE TABLE IF NOT EXISTS books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    author TEXT,
    path TEXT NOT NULL UNIQUE,
    format TEXT NOT NULL,
    coverPath TEXT,
    addedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    lastReadAt DATETIME,
    progress REAL DEFAULT 0
  );
`)

// File Handlers
ipcMain.handle('read-file', async (_, filePath) => {
  return fs.promises.readFile(filePath)
})

ipcMain.handle('read-file-buffer', async (_, filePath) => {
  return fs.promises.readFile(filePath)
})

ipcMain.handle('open-file-dialog', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [
      { name: 'Books', extensions: ['pdf', 'epub', 'mobi', 'azw3', 'txt', 'md'] }
    ]
  })
  
  if (result.canceled || result.filePaths.length === 0) return null
  
  const filePath = result.filePaths[0]
  const filename = path.basename(filePath)
  const ext = path.extname(filePath).toLowerCase().slice(1)
  
  // Auto-add to DB
  try {
    const stmt = db.prepare(`
      INSERT INTO books (title, path, format) 
      VALUES (?, ?, ?)
      ON CONFLICT(path) DO UPDATE SET lastReadAt = CURRENT_TIMESTAMP
      RETURNING *
    `)
    return stmt.get(filename, filePath, ext)
  } catch (e) {
    console.error('DB Insert Error:', e)
    return null
  }
})

// Database Handlers
ipcMain.handle('get-library', () => {
  return db.prepare('SELECT * FROM books ORDER BY lastReadAt DESC').all()
})

ipcMain.handle('update-progress', (_, bookId, progress) => {
  const stmt = db.prepare('UPDATE books SET progress = ?, lastReadAt = CURRENT_TIMESTAMP WHERE id = ?')
  stmt.run(progress, bookId)
})

ipcMain.handle('delete-book', (_, bookId: number) => {
  try {
    const stmt = db.prepare('DELETE FROM books WHERE id = ?')
    stmt.run(bookId)
    return true
  } catch (e) {
    console.error('Delete book error:', e)
    return false
  }
})
