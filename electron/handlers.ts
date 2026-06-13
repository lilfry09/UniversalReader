import { ipcMain, app, dialog, shell } from 'electron'
import Database from 'better-sqlite3'
import AdmZip from 'adm-zip'
import crypto from 'node:crypto'
import fs from 'fs'
import path from 'path'
import { createCanvas } from 'canvas'
import { qaService } from './qa-service'
import * as secureStore from './secure-store'
import type { CredentialUpdate } from './secure-store'
import type { ReaderProgressLocator } from '../src/types'
import { getDocumentKind, normalizeExtension } from '../src/domain/document'
import type { DocumentFormat } from '../src/domain/document'
import {
  buildImportPlan,
  getAllowedImportExtensions,
} from '../src/services/importService'

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
    progress REAL DEFAULT 0,
    progressLocator TEXT,
    progressUpdatedAt INTEGER,
    documentKind TEXT,
    ingestStatus TEXT,
    sourceFormat TEXT
  );
`)

const ensureBookColumn = (columnName: string, sqlType: string) => {
  const columns = db.prepare('PRAGMA table_info(books)').all() as Array<{ name: string }>
  const hasColumn = columns.some(column => column.name === columnName)
  if (!hasColumn) {
    db.exec(`ALTER TABLE books ADD COLUMN ${columnName} ${sqlType}`)
  }
}

ensureBookColumn('progressLocator', 'TEXT')
ensureBookColumn('progressUpdatedAt', 'INTEGER')
ensureBookColumn('documentKind', 'TEXT')
ensureBookColumn('ingestStatus', 'TEXT')
ensureBookColumn('sourceFormat', 'TEXT')

// Add annotations table
db.exec(`
  CREATE TABLE IF NOT EXISTS annotations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bookId INTEGER NOT NULL,
    type TEXT NOT NULL,
    cfi TEXT,
    pageNumber INTEGER,
    text TEXT,
    note TEXT,
    color TEXT DEFAULT '#ffeb3b',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bookId) REFERENCES books(id) ON DELETE CASCADE
  );
`)

// Performance indexes for frequent read paths.
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_books_lastReadAt ON books(lastReadAt);
  CREATE INDEX IF NOT EXISTS idx_books_title ON books(title);
  CREATE INDEX IF NOT EXISTS idx_books_author ON books(author);
  CREATE INDEX IF NOT EXISTS idx_annotations_bookId ON annotations(bookId);
`)

// Covers directory
const coversDir = path.join(app.getPath('userData'), 'covers')
fs.mkdirSync(coversDir, { recursive: true })

// ============ Cover Extraction Utilities ============

async function extractEpubCover(filePath: string, bookId: string): Promise<string | null> {
  try {
    const zip = new AdmZip(filePath)
    const entries = zip.getEntries()

    // Common cover file patterns
    const coverPatterns = [
      /cover\.(jpg|jpeg|png|gif)$/i,
      /cover-image\.(jpg|jpeg|png|gif)$/i,
      /images\/cover\.(jpg|jpeg|png|gif)$/i,
      /OEBPS\/images\/cover\.(jpg|jpeg|png|gif)$/i,
      /OPS\/images\/cover\.(jpg|jpeg|png|gif)$/i,
    ]

    // First try to find cover from OPF metadata
    const opfEntry = entries.find(e => e.entryName.endsWith('.opf'))
    if (opfEntry) {
      const opfContent = opfEntry.getData().toString('utf-8')
      // Look for cover image reference in OPF
      const coverIdMatch = opfContent.match(/name="cover"\s+content="([^"]+)"/) ||
                           opfContent.match(/properties="cover-image"[^>]*href="([^"]+)"/)
      if (coverIdMatch) {
        const coverId = coverIdMatch[1]
        // Find the item with this id
        const hrefMatch = opfContent.match(new RegExp(`id="${coverId}"[^>]*href="([^"]+)"`)) ||
                          opfContent.match(new RegExp(`href="([^"]+)"[^>]*id="${coverId}"`))
        if (hrefMatch) {
          const coverHref = hrefMatch[1]
          const opfDir = path.dirname(opfEntry.entryName)
          const coverPath = opfDir ? `${opfDir}/${coverHref}` : coverHref
          const coverEntry = entries.find(e => 
            e.entryName === coverPath || 
            e.entryName.endsWith(coverHref)
          )
          if (coverEntry) {
            const coverData = coverEntry.getData()
            const ext = path.extname(coverEntry.entryName) || '.jpg'
            const coverFileName = `${bookId}${ext}`
            const coverDestPath = path.join(coversDir, coverFileName)
            await fs.promises.writeFile(coverDestPath, coverData)
            return coverDestPath
          }
        }
      }
    }

    // Fallback: search by common patterns
    for (const pattern of coverPatterns) {
      const coverEntry = entries.find(e => pattern.test(e.entryName))
      if (coverEntry) {
        const coverData = coverEntry.getData()
        const ext = path.extname(coverEntry.entryName) || '.jpg'
        const coverFileName = `${bookId}${ext}`
        const coverDestPath = path.join(coversDir, coverFileName)
        await fs.promises.writeFile(coverDestPath, coverData)
        return coverDestPath
      }
    }

    // Last resort: find any image that might be a cover
    const imageEntry = entries.find(e => 
      /\.(jpg|jpeg|png|gif)$/i.test(e.entryName) &&
      (e.entryName.toLowerCase().includes('cover') || 
       e.entryName.toLowerCase().includes('title'))
    )
    if (imageEntry) {
      const coverData = imageEntry.getData()
      const ext = path.extname(imageEntry.entryName) || '.jpg'
      const coverFileName = `${bookId}${ext}`
      const coverDestPath = path.join(coversDir, coverFileName)
      await fs.promises.writeFile(coverDestPath, coverData)
      return coverDestPath
    }

    return null
  } catch (err) {
    console.error('Failed to extract EPUB cover:', err)
    return null
  }
}

async function extractPdfCover(filePath: string, bookId: string): Promise<string | null> {
  try {
    // Use canvas to render first page of PDF
    const pdfjs = await import('pdfjs-dist')

    const dataBuffer = await fs.promises.readFile(filePath)
    const data = new Uint8Array(dataBuffer)
    const pdf = await pdfjs.getDocument({ data }).promise
    const page = await pdf.getPage(1)
    
    const viewport = page.getViewport({ scale: 1.0 })
    // Create a reasonable cover size (max 400px width)
    const scale = Math.min(400 / viewport.width, 1.5)
    const scaledViewport = page.getViewport({ scale })
    
    const canvas = createCanvas(scaledViewport.width, scaledViewport.height)
    const context = canvas.getContext('2d')
    
    await page.render({
      canvasContext: context as unknown as CanvasRenderingContext2D,
      viewport: scaledViewport,
    }).promise

    const coverFileName = `${bookId}.png`
    const coverDestPath = path.join(coversDir, coverFileName)
    const buffer = canvas.toBuffer('image/png')
    await fs.promises.writeFile(coverDestPath, buffer)
    
    return coverDestPath
  } catch (err) {
    console.error('Failed to extract PDF cover:', err)
    return null
  }
}

function decodeXmlEntities(input: string): string {
  return input
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
}

async function convertDocxToMarkdown(filePath: string): Promise<string> {
  const zip = new AdmZip(filePath)
  const documentEntry = zip.getEntry('word/document.xml')
  if (!documentEntry) {
    throw new Error('DOCX 内容缺失: word/document.xml')
  }

  const xml = documentEntry.getData().toString('utf-8')
  const paragraphs = xml
    .split(/<\/w:p>/i)
    .map(paragraphXml => {
      const withBreaks = paragraphXml
        .replace(/<w:tab\s*\/>/gi, '\t')
        .replace(/<w:br\s*\/>/gi, '\n')
      const matches = [...withBreaks.matchAll(/<w:t[^>]*>([\s\S]*?)<\/w:t>/gi)]
      const text = matches.map(match => decodeXmlEntities(match[1])).join('')
      return text.trim()
    })
    .filter(Boolean)

  return paragraphs.join('\n\n')
}

async function extractMetadata(filePath: string, format: DocumentFormat): Promise<{ title?: string; author?: string }> {
  try {
    if (format === 'epub') {
      const zip = new AdmZip(filePath)
      const entries = zip.getEntries()
      
      const opfEntry = entries.find(e => e.entryName.endsWith('.opf'))
      if (opfEntry) {
        const opfContent = opfEntry.getData().toString('utf-8')
        
        const titleMatch = opfContent.match(/<dc:title[^>]*>([^<]+)<\/dc:title>/i)
        const authorMatch = opfContent.match(/<dc:creator[^>]*>([^<]+)<\/dc:creator>/i)
        
        return {
          title: titleMatch ? titleMatch[1].trim() : undefined,
          author: authorMatch ? authorMatch[1].trim() : undefined,
        }
      }
    }
    
    if (format === 'pdf') {
      const pdfjs = await import('pdfjs-dist')
      const dataBuffer = await fs.promises.readFile(filePath)
      const data = new Uint8Array(dataBuffer)
      const pdf = await pdfjs.getDocument({ data }).promise
      const metadata = await pdf.getMetadata()
      
      const info = metadata.info as Record<string, string> | undefined
      return {
        title: info?.Title || undefined,
        author: info?.Author || undefined,
      }
    }
  } catch (err) {
    console.error('Failed to extract metadata:', err)
  }
  return {}
}

interface BookRow {
  id: number
  title: string
  author?: string
  path: string
  format: string
  coverPath?: string
  addedAt?: string
  lastReadAt?: string
  progress: number
  progressLocator?: string | null
  progressUpdatedAt?: number | null
  documentKind?: string | null
  ingestStatus?: string | null
  sourceFormat?: string | null
}

function parseProgressLocator(raw: string | null | undefined): ReaderProgressLocator | undefined {
  if (!raw) return undefined
  try {
    return JSON.parse(raw) as ReaderProgressLocator
  } catch {
    return undefined
  }
}

function normalizeBookRow(book: BookRow) {
  const fallbackFormat = (book.format || 'txt') as DocumentFormat
  return {
    ...book,
    progressLocator: parseProgressLocator(book.progressLocator),
    progressUpdatedAt: book.progressUpdatedAt ?? undefined,
    documentKind: book.documentKind || getDocumentKind(fallbackFormat),
    ingestStatus: book.ingestStatus || 'ready',
    sourceFormat: book.sourceFormat || fallbackFormat,
  }
}

function isAllowedExternalUrl(rawUrl: string) {
  try {
    const url = new URL(rawUrl)
    return url.protocol === 'http:' || url.protocol === 'https:' || url.protocol === 'mailto:'
  } catch {
    return false
  }
}

function isPositiveInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0
}

function assertString(value: unknown, label: string): string {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`Invalid ${label}`)
  }
  return value
}

function isPathInsideDirectory(filePath: string, directory: string): boolean {
  const resolvedPath = path.resolve(filePath)
  const resolvedDirectory = path.resolve(directory)
  const relativePath = path.relative(resolvedDirectory, resolvedPath)
  return relativePath === '' || (!relativePath.startsWith('..') && !path.isAbsolute(relativePath))
}

const selectLibraryStmt = db.prepare('SELECT * FROM books ORDER BY lastReadAt DESC')
const searchLibraryStmt = db.prepare(`
  SELECT * FROM books
  WHERE title LIKE ? OR author LIKE ?
  ORDER BY lastReadAt DESC
`)
const updateProgressStmt = db.prepare(`
  UPDATE books
  SET progress = ?, progressLocator = ?, progressUpdatedAt = ?, lastReadAt = CURRENT_TIMESTAMP
  WHERE id = ?
`)
const selectBookByPathStmt = db.prepare('SELECT * FROM books WHERE path = ?')
const selectBookByCoverPathStmt = db.prepare('SELECT id FROM books WHERE coverPath = ?')
const selectBookByIdStmt = db.prepare('SELECT * FROM books WHERE id = ?')
const selectAnnotationByIdStmt = db.prepare('SELECT id FROM annotations WHERE id = ?')

function getKnownBookByPath(filePath: unknown): BookRow | null {
  if (typeof filePath !== 'string' || filePath.trim() === '') return null
  const book = selectBookByPathStmt.get(filePath) as BookRow | undefined
  return book ?? null
}

function requireKnownBookPath(filePath: unknown): string {
  assertString(filePath, 'book path')
  const book = getKnownBookByPath(filePath)
  if (!book) {
    throw new Error('Book path is not in the library')
  }
  return book.path
}

function isKnownCoverPath(coverPath: unknown): coverPath is string {
  if (typeof coverPath !== 'string' || coverPath.trim() === '') return false
  return Boolean(selectBookByCoverPathStmt.get(coverPath))
}

// ============ File Handlers ============

ipcMain.handle('read-file', async (_, filePath) => {
  return fs.promises.readFile(requireKnownBookPath(filePath))
})

ipcMain.handle('read-file-buffer', async (_, filePath) => {
  return fs.promises.readFile(requireKnownBookPath(filePath))
})

ipcMain.handle('file-exists', async (_, filePath) => {
  const book = getKnownBookByPath(filePath)
  if (!book) return false

  try {
    await fs.promises.access(book.path, fs.constants.F_OK)
    return true
  } catch {
    return false
  }
})

ipcMain.handle('open-external', async (_, url: string) => {
  if (typeof url !== 'string' || !isAllowedExternalUrl(url)) {
    throw new Error('Invalid external URL')
  }

  return shell.openExternal(url)
})

ipcMain.handle('open-user-data-folder', async () => {
  return shell.openPath(app.getPath('userData'))
})

ipcMain.handle('get-cover-url', async (_, coverPath: string) => {
  // Return file:// URL for local cover image
  if (!isKnownCoverPath(coverPath)) return null
  try {
    await fs.promises.access(coverPath, fs.constants.F_OK)
    return `file://${coverPath.replace(/\\/g, '/')}`
  } catch {
    return null
  }
})

// Background image handlers
const backgroundsDir = path.join(app.getPath('userData'), 'backgrounds')
fs.mkdirSync(backgroundsDir, { recursive: true })

ipcMain.handle('select-background-image', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [
      { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'] }
    ]
  })
  
  if (result.canceled || result.filePaths.length === 0) return null
  
  const filePath = result.filePaths[0]
  const ext = path.extname(filePath)
  const fileName = `background-${crypto.randomUUID()}${ext}`
  const destPath = path.join(backgroundsDir, fileName)
  
  try {
    await fs.promises.copyFile(filePath, destPath)
    return destPath
  } catch (err) {
    console.error('Failed to copy background image:', err)
    return null
  }
})

ipcMain.handle('get-background-image-url', async (_, imagePath: string) => {
  if (typeof imagePath !== 'string' || !isPathInsideDirectory(imagePath, backgroundsDir)) return null
  try {
    await fs.promises.access(imagePath, fs.constants.F_OK)
    return `file://${imagePath.replace(/\\/g, '/')}`
  } catch {
    return null
  }
})

ipcMain.handle('open-file-dialog', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [
      { name: 'Books', extensions: [...getAllowedImportExtensions()] }
    ]
  })
  
  if (result.canceled || result.filePaths.length === 0) return null
  
  const filePath = result.filePaths[0]
  const extWithDot = path.extname(filePath).toLowerCase()
  const ext = normalizeExtension(extWithDot)
  const importPlan = buildImportPlan(ext)
  if (importPlan.capability === 'unsupported' || !importPlan.targetFormat || !importPlan.documentKind || !importPlan.ingestStatus) {
    return null
  }
  const baseName = path.basename(filePath, extWithDot)
  const bookId = crypto.randomUUID()

  // Copy imported file into app-managed storage
  const libraryDir = path.join(app.getPath('userData'), 'books')
  await fs.promises.mkdir(libraryDir, { recursive: true })

  let destPath: string

  if (importPlan.requiresConversion && importPlan.sourceFormat === 'docx') {
    const sourceName = `${baseName}-${bookId}.docx`
    const sourcePath = path.join(libraryDir, sourceName)
    await fs.promises.copyFile(filePath, sourcePath)

    const markdown = await convertDocxToMarkdown(sourcePath)
    const convertedName = `${baseName}-${bookId}.md`
    destPath = path.join(libraryDir, convertedName)
    await fs.promises.writeFile(destPath, markdown, 'utf-8')
  } else {
    const destName = `${baseName}-${bookId}${extWithDot}`
    destPath = path.join(libraryDir, destName)
    await fs.promises.copyFile(filePath, destPath)
  }
  
  // Extract metadata
  const metadata = await extractMetadata(destPath, importPlan.targetFormat)
  const title = metadata.title || baseName
  const author = metadata.author || null

  // Extract cover
  let coverPath: string | null = null
  if (importPlan.targetFormat === 'epub' || importPlan.targetFormat === 'mobi' || importPlan.targetFormat === 'azw3') {
    coverPath = await extractEpubCover(destPath, bookId)
  } else if (importPlan.targetFormat === 'pdf') {
    coverPath = await extractPdfCover(destPath, bookId)
  }
  
  // Auto-add to DB
  try {
    const stmt = db.prepare(`
      INSERT INTO books (title, author, path, format, sourceFormat, documentKind, ingestStatus, coverPath) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(path) DO UPDATE SET lastReadAt = CURRENT_TIMESTAMP
      RETURNING *
    `)
    const book = stmt.get(
      title,
      author,
      destPath,
      importPlan.targetFormat,
      importPlan.sourceFormat,
      importPlan.documentKind,
      importPlan.ingestStatus,
      coverPath
    ) as BookRow | undefined
    return book ? normalizeBookRow(book) : null
  } catch (e) {
    console.error('DB Insert Error:', e)
    return null
  }
})

// ============ Database Handlers ============

ipcMain.handle('get-library', () => {
  const books = selectLibraryStmt.all() as BookRow[]
  return books.map(normalizeBookRow)
})

ipcMain.handle('search-library', (_, query: string) => {
  const searchTerm = `%${typeof query === 'string' ? query : ''}%`
  const books = searchLibraryStmt.all(searchTerm, searchTerm) as BookRow[]
  return books.map(normalizeBookRow)
})

ipcMain.handle('update-progress', (_, bookId: number, progress: number, locator?: ReaderProgressLocator, updatedAt?: number) => {
  if (!isPositiveInteger(bookId)) {
    throw new Error('Invalid book id')
  }
  if (typeof progress !== 'number' || !Number.isFinite(progress)) {
    throw new Error('Invalid progress')
  }
  if (!selectBookByIdStmt.get(bookId)) {
    throw new Error('Book not found')
  }

  const normalizedProgress = Math.min(1, Math.max(0, progress))
  const timestamp = typeof updatedAt === 'number' ? updatedAt : Date.now()
  const serializedLocator = locator ? JSON.stringify(locator) : null
  updateProgressStmt.run(normalizedProgress, serializedLocator, timestamp, bookId)
})

ipcMain.handle('delete-book', (_, bookId: number) => {
  if (!isPositiveInteger(bookId)) return false

  try {
    // Get book info first to delete cover
    const book = selectBookByIdStmt.get(bookId) as { coverPath?: string; path?: string } | undefined
    if (book) {
      // Delete cover file if exists
      if (book.coverPath) {
        fs.promises.unlink(book.coverPath).catch(() => {})
      }
      // Delete book file
      if (book.path) {
        fs.promises.unlink(book.path).catch(() => {})
      }
    }
    
    const stmt = db.prepare('DELETE FROM books WHERE id = ?')
    stmt.run(bookId)
    return true
  } catch (e) {
    console.error('Delete book error:', e)
    return false
  }
})

// ============ Annotation Handlers ============

ipcMain.handle('get-annotations', (_, bookId: number) => {
  if (!isPositiveInteger(bookId)) return []
  return db.prepare('SELECT * FROM annotations WHERE bookId = ? ORDER BY createdAt DESC').all(bookId)
})

ipcMain.handle('add-annotation', (_, annotation: {
  bookId: number
  type: 'highlight' | 'note'
  cfi?: string
  pageNumber?: number
  text?: string
  note?: string
  color?: string
}) => {
  if (!annotation || !isPositiveInteger(annotation.bookId)) {
    throw new Error('Invalid annotation book id')
  }
  if (!selectBookByIdStmt.get(annotation.bookId)) {
    throw new Error('Book not found')
  }
  if (annotation.type !== 'highlight' && annotation.type !== 'note') {
    throw new Error('Invalid annotation type')
  }

  const stmt = db.prepare(`
    INSERT INTO annotations (bookId, type, cfi, pageNumber, text, note, color)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    RETURNING *
  `)
  return stmt.get(
    annotation.bookId,
    annotation.type,
    annotation.cfi || null,
    annotation.pageNumber || null,
    annotation.text || null,
    annotation.note || null,
    annotation.color || '#ffeb3b'
  )
})

ipcMain.handle('update-annotation', (_, id: number, updates: { note?: string; color?: string }) => {
  if (!isPositiveInteger(id) || !selectAnnotationByIdStmt.get(id)) return null
  if (!updates || typeof updates !== 'object') return null

  const fields: string[] = []
  const values: (string | number)[] = []
  
  if (updates.note !== undefined) {
    fields.push('note = ?')
    values.push(updates.note)
  }
  if (updates.color !== undefined) {
    fields.push('color = ?')
    values.push(updates.color)
  }
  
  if (fields.length === 0) return null
  
  fields.push('updatedAt = CURRENT_TIMESTAMP')
  values.push(id)
  
  const stmt = db.prepare(`UPDATE annotations SET ${fields.join(', ')} WHERE id = ? RETURNING *`)
  return stmt.get(...values)
})

ipcMain.handle('delete-annotation', (_, id: number) => {
  if (!isPositiveInteger(id)) return false

  try {
    db.prepare('DELETE FROM annotations WHERE id = ?').run(id)
    return true
  } catch (e) {
    console.error('Delete annotation error:', e)
    return false
  }
})

// ============ QA Handlers ============

ipcMain.handle('qa-load-book', async (_, bookPath: string, format: string) => {
  const book = getKnownBookByPath(bookPath)
  if (!book) {
    return { success: false, error: 'Book path is not in the library' }
  }
  return qaService.loadBookForQA(book.path, book.format || format)
})

ipcMain.handle('qa-ask', async (_, question: string) => {
  if (typeof question !== 'string' || question.trim() === '') {
    throw new Error('Invalid question')
  }
  return qaService.askQuestion(question)
})

ipcMain.handle('qa-clear', async () => {
  qaService.clearQA()
})

ipcMain.handle('qa-get-status', async () => {
  return qaService.getStatus()
})

// ============ Secure Credentials Handlers ============

ipcMain.handle('credentials-save', async (_, credentials: CredentialUpdate) => {
  try {
    await secureStore.saveCredentials(credentials)
    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return { success: false, error: message }
  }
})

ipcMain.handle('credentials-load', async () => {
  return secureStore.loadCredentialMetadata()
})

ipcMain.handle('credentials-clear', async () => {
  try {
    secureStore.clearCredentials()
    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return { success: false, error: message }
  }
})

ipcMain.handle('credentials-has', async () => {
  return secureStore.hasCredentials()
})
