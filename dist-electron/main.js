import { app, ipcMain, shell, dialog, BrowserWindow } from "electron";
import path$1 from "node:path";
import { fileURLToPath } from "node:url";
import Database from "better-sqlite3";
import crypto from "node:crypto";
import fs from "fs";
import path from "path";
import { createCanvas } from "canvas";
const dbPath = path.join(app.getPath("userData"), "library.db");
const db = new Database(dbPath);
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
`);
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
`);
const coversDir = path.join(app.getPath("userData"), "covers");
fs.mkdirSync(coversDir, { recursive: true });
async function extractEpubCover(filePath, bookId) {
  try {
    const AdmZip = (await import("./adm-zip-Bi28av6U.js").then((n) => n.a)).default;
    const zip = new AdmZip(filePath);
    const entries = zip.getEntries();
    const coverPatterns = [
      /cover\.(jpg|jpeg|png|gif)$/i,
      /cover-image\.(jpg|jpeg|png|gif)$/i,
      /images\/cover\.(jpg|jpeg|png|gif)$/i,
      /OEBPS\/images\/cover\.(jpg|jpeg|png|gif)$/i,
      /OPS\/images\/cover\.(jpg|jpeg|png|gif)$/i
    ];
    const opfEntry = entries.find((e) => e.entryName.endsWith(".opf"));
    if (opfEntry) {
      const opfContent = opfEntry.getData().toString("utf-8");
      const coverIdMatch = opfContent.match(/name="cover"\s+content="([^"]+)"/) || opfContent.match(/properties="cover-image"[^>]*href="([^"]+)"/);
      if (coverIdMatch) {
        const coverId = coverIdMatch[1];
        const hrefMatch = opfContent.match(new RegExp(`id="${coverId}"[^>]*href="([^"]+)"`)) || opfContent.match(new RegExp(`href="([^"]+)"[^>]*id="${coverId}"`));
        if (hrefMatch) {
          const coverHref = hrefMatch[1];
          const opfDir = path.dirname(opfEntry.entryName);
          const coverPath = opfDir ? `${opfDir}/${coverHref}` : coverHref;
          const coverEntry = entries.find(
            (e) => e.entryName === coverPath || e.entryName.endsWith(coverHref)
          );
          if (coverEntry) {
            const coverData = coverEntry.getData();
            const ext = path.extname(coverEntry.entryName) || ".jpg";
            const coverFileName = `${bookId}${ext}`;
            const coverDestPath = path.join(coversDir, coverFileName);
            await fs.promises.writeFile(coverDestPath, coverData);
            return coverDestPath;
          }
        }
      }
    }
    for (const pattern of coverPatterns) {
      const coverEntry = entries.find((e) => pattern.test(e.entryName));
      if (coverEntry) {
        const coverData = coverEntry.getData();
        const ext = path.extname(coverEntry.entryName) || ".jpg";
        const coverFileName = `${bookId}${ext}`;
        const coverDestPath = path.join(coversDir, coverFileName);
        await fs.promises.writeFile(coverDestPath, coverData);
        return coverDestPath;
      }
    }
    const imageEntry = entries.find(
      (e) => /\.(jpg|jpeg|png|gif)$/i.test(e.entryName) && (e.entryName.toLowerCase().includes("cover") || e.entryName.toLowerCase().includes("title"))
    );
    if (imageEntry) {
      const coverData = imageEntry.getData();
      const ext = path.extname(imageEntry.entryName) || ".jpg";
      const coverFileName = `${bookId}${ext}`;
      const coverDestPath = path.join(coversDir, coverFileName);
      await fs.promises.writeFile(coverDestPath, coverData);
      return coverDestPath;
    }
    return null;
  } catch (err) {
    console.error("Failed to extract EPUB cover:", err);
    return null;
  }
}
async function extractPdfCover(filePath, bookId) {
  try {
    const pdfjs = await import("./pdf-DupTFK7G.js");
    const workerSrc = path.join(__dirname, "../dist/pdf.worker.min.mjs");
    if (fs.existsSync(workerSrc)) {
      pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
    }
    const data = await fs.promises.readFile(filePath);
    const pdf = await pdfjs.getDocument({ data }).promise;
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 1 });
    const scale = Math.min(400 / viewport.width, 1.5);
    const scaledViewport = page.getViewport({ scale });
    const canvas = createCanvas(scaledViewport.width, scaledViewport.height);
    const context = canvas.getContext("2d");
    await page.render({
      canvasContext: context,
      viewport: scaledViewport
    }).promise;
    const coverFileName = `${bookId}.png`;
    const coverDestPath = path.join(coversDir, coverFileName);
    const buffer = canvas.toBuffer("image/png");
    await fs.promises.writeFile(coverDestPath, buffer);
    return coverDestPath;
  } catch (err) {
    console.error("Failed to extract PDF cover:", err);
    return null;
  }
}
async function extractMetadata(filePath, format) {
  try {
    if (format === "epub") {
      const AdmZip = (await import("./adm-zip-Bi28av6U.js").then((n) => n.a)).default;
      const zip = new AdmZip(filePath);
      const entries = zip.getEntries();
      const opfEntry = entries.find((e) => e.entryName.endsWith(".opf"));
      if (opfEntry) {
        const opfContent = opfEntry.getData().toString("utf-8");
        const titleMatch = opfContent.match(/<dc:title[^>]*>([^<]+)<\/dc:title>/i);
        const authorMatch = opfContent.match(/<dc:creator[^>]*>([^<]+)<\/dc:creator>/i);
        return {
          title: titleMatch ? titleMatch[1].trim() : void 0,
          author: authorMatch ? authorMatch[1].trim() : void 0
        };
      }
    }
    if (format === "pdf") {
      const pdfjs = await import("./pdf-DupTFK7G.js");
      const data = await fs.promises.readFile(filePath);
      const pdf = await pdfjs.getDocument({ data }).promise;
      const metadata = await pdf.getMetadata();
      const info = metadata.info;
      return {
        title: (info == null ? void 0 : info.Title) || void 0,
        author: (info == null ? void 0 : info.Author) || void 0
      };
    }
  } catch (err) {
    console.error("Failed to extract metadata:", err);
  }
  return {};
}
ipcMain.handle("read-file", async (_, filePath) => {
  return fs.promises.readFile(filePath);
});
ipcMain.handle("read-file-buffer", async (_, filePath) => {
  return fs.promises.readFile(filePath);
});
ipcMain.handle("file-exists", async (_, filePath) => {
  try {
    await fs.promises.access(filePath, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
});
ipcMain.handle("open-external", async (_, url) => {
  return shell.openExternal(url);
});
ipcMain.handle("open-user-data-folder", async () => {
  return shell.openPath(app.getPath("userData"));
});
ipcMain.handle("get-cover-url", async (_, coverPath) => {
  if (!coverPath) return null;
  try {
    await fs.promises.access(coverPath, fs.constants.F_OK);
    return `file://${coverPath.replace(/\\/g, "/")}`;
  } catch {
    return null;
  }
});
ipcMain.handle("open-file-dialog", async () => {
  const result = await dialog.showOpenDialog({
    properties: ["openFile"],
    filters: [
      { name: "Books", extensions: ["pdf", "epub", "mobi", "azw3", "txt", "md"] }
    ]
  });
  if (result.canceled || result.filePaths.length === 0) return null;
  const filePath = result.filePaths[0];
  const extWithDot = path.extname(filePath).toLowerCase();
  const ext = extWithDot.slice(1);
  const baseName = path.basename(filePath, extWithDot);
  const bookId = crypto.randomUUID();
  const libraryDir = path.join(app.getPath("userData"), "books");
  await fs.promises.mkdir(libraryDir, { recursive: true });
  const destName = `${baseName}-${bookId}${extWithDot}`;
  const destPath = path.join(libraryDir, destName);
  await fs.promises.copyFile(filePath, destPath);
  const metadata = await extractMetadata(destPath, ext);
  const title = metadata.title || baseName;
  const author = metadata.author || null;
  let coverPath = null;
  if (ext === "epub" || ext === "mobi" || ext === "azw3") {
    coverPath = await extractEpubCover(destPath, bookId);
  } else if (ext === "pdf") {
    coverPath = await extractPdfCover(destPath, bookId);
  }
  try {
    const stmt = db.prepare(`
      INSERT INTO books (title, author, path, format, coverPath) 
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(path) DO UPDATE SET lastReadAt = CURRENT_TIMESTAMP
      RETURNING *
    `);
    return stmt.get(title, author, destPath, ext, coverPath);
  } catch (e) {
    console.error("DB Insert Error:", e);
    return null;
  }
});
ipcMain.handle("get-library", () => {
  return db.prepare("SELECT * FROM books ORDER BY lastReadAt DESC").all();
});
ipcMain.handle("search-library", (_, query) => {
  const searchTerm = `%${query}%`;
  return db.prepare(`
    SELECT * FROM books 
    WHERE title LIKE ? OR author LIKE ?
    ORDER BY lastReadAt DESC
  `).all(searchTerm, searchTerm);
});
ipcMain.handle("update-progress", (_, bookId, progress) => {
  const stmt = db.prepare("UPDATE books SET progress = ?, lastReadAt = CURRENT_TIMESTAMP WHERE id = ?");
  stmt.run(progress, bookId);
});
ipcMain.handle("delete-book", (_, bookId) => {
  try {
    const book = db.prepare("SELECT * FROM books WHERE id = ?").get(bookId);
    if (book) {
      if (book.coverPath) {
        fs.promises.unlink(book.coverPath).catch(() => {
        });
      }
      if (book.path) {
        fs.promises.unlink(book.path).catch(() => {
        });
      }
    }
    const stmt = db.prepare("DELETE FROM books WHERE id = ?");
    stmt.run(bookId);
    return true;
  } catch (e) {
    console.error("Delete book error:", e);
    return false;
  }
});
ipcMain.handle("get-annotations", (_, bookId) => {
  return db.prepare("SELECT * FROM annotations WHERE bookId = ? ORDER BY createdAt DESC").all(bookId);
});
ipcMain.handle("add-annotation", (_, annotation) => {
  const stmt = db.prepare(`
    INSERT INTO annotations (bookId, type, cfi, pageNumber, text, note, color)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    RETURNING *
  `);
  return stmt.get(
    annotation.bookId,
    annotation.type,
    annotation.cfi || null,
    annotation.pageNumber || null,
    annotation.text || null,
    annotation.note || null,
    annotation.color || "#ffeb3b"
  );
});
ipcMain.handle("update-annotation", (_, id, updates) => {
  const fields = [];
  const values = [];
  if (updates.note !== void 0) {
    fields.push("note = ?");
    values.push(updates.note);
  }
  if (updates.color !== void 0) {
    fields.push("color = ?");
    values.push(updates.color);
  }
  if (fields.length === 0) return null;
  fields.push("updatedAt = CURRENT_TIMESTAMP");
  values.push(id);
  const stmt = db.prepare(`UPDATE annotations SET ${fields.join(", ")} WHERE id = ? RETURNING *`);
  return stmt.get(...values);
});
ipcMain.handle("delete-annotation", (_, id) => {
  try {
    db.prepare("DELETE FROM annotations WHERE id = ?").run(id);
    return true;
  } catch (e) {
    console.error("Delete annotation error:", e);
    return false;
  }
});
const __filename$1 = fileURLToPath(import.meta.url);
const __dirname$1 = path$1.dirname(__filename$1);
process.env.DIST = path$1.join(__dirname$1, "../dist");
process.env.VITE_PUBLIC = app.isPackaged ? process.env.DIST : path$1.join(process.env.DIST, "../public");
let win;
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
function attachWebContentsDebugging(browserWindow) {
  browserWindow.webContents.on(
    "did-fail-load",
    (_event, errorCode, errorDescription, validatedURL, isMainFrame) => {
      if (!isMainFrame) return;
      console.error(
        "[main] did-fail-load",
        JSON.stringify({ errorCode, errorDescription, validatedURL })
      );
    }
  );
  browserWindow.webContents.on("render-process-gone", (_event, details) => {
    console.error("[main] render-process-gone", JSON.stringify(details));
  });
}
function createWindow() {
  win = new BrowserWindow({
    icon: path$1.join(process.env.VITE_PUBLIC, "vite.svg"),
    webPreferences: {
      preload: path$1.join(__dirname$1, "preload.mjs"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  attachWebContentsDebugging(win);
  win.webContents.on("did-finish-load", () => {
    win == null ? void 0 : win.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  });
  if (VITE_DEV_SERVER_URL) {
    console.log("[main] loading dev url:", VITE_DEV_SERVER_URL);
    win.loadURL(VITE_DEV_SERVER_URL);
    win.webContents.openDevTools({ mode: "detach" });
  } else {
    const indexPath = path$1.join(process.env.DIST, "index.html");
    console.log("[main] loading file:", indexPath);
    win.loadFile(indexPath);
  }
}
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
app.whenReady().then(createWindow);
