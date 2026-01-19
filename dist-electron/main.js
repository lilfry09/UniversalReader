import { app, ipcMain, dialog, BrowserWindow } from "electron";
import path$1 from "node:path";
import { fileURLToPath } from "node:url";
import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
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
ipcMain.handle("read-file", async (_, filePath) => {
  return fs.promises.readFile(filePath);
});
ipcMain.handle("read-file-buffer", async (_, filePath) => {
  return fs.promises.readFile(filePath);
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
  const filename = path.basename(filePath);
  const ext = path.extname(filePath).toLowerCase().slice(1);
  try {
    const stmt = db.prepare(`
      INSERT INTO books (title, path, format) 
      VALUES (?, ?, ?)
      ON CONFLICT(path) DO UPDATE SET lastReadAt = CURRENT_TIMESTAMP
      RETURNING *
    `);
    return stmt.get(filename, filePath, ext);
  } catch (e) {
    console.error("DB Insert Error:", e);
    return null;
  }
});
ipcMain.handle("get-library", () => {
  return db.prepare("SELECT * FROM books ORDER BY lastReadAt DESC").all();
});
ipcMain.handle("update-progress", (_, bookId, progress) => {
  const stmt = db.prepare("UPDATE books SET progress = ?, lastReadAt = CURRENT_TIMESTAMP WHERE id = ?");
  stmt.run(progress, bookId);
});
ipcMain.handle("delete-book", (_, bookId) => {
  try {
    const stmt = db.prepare("DELETE FROM books WHERE id = ?");
    stmt.run(bookId);
    return true;
  } catch (e) {
    console.error("Delete book error:", e);
    return false;
  }
});
const __filename$1 = fileURLToPath(import.meta.url);
const __dirname$1 = path$1.dirname(__filename$1);
process.env.DIST = path$1.join(__dirname$1, "../dist");
process.env.VITE_PUBLIC = app.isPackaged ? process.env.DIST : path$1.join(process.env.DIST, "../public");
let win;
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
function createWindow() {
  win = new BrowserWindow({
    icon: path$1.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: path$1.join(__dirname$1, "preload.mjs"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  win.webContents.on("did-finish-load", () => {
    win == null ? void 0 : win.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  });
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path$1.join(process.env.DIST, "index.html"));
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
