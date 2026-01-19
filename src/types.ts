export type ThemeMode = "light" | "sepia" | "dark" | "gray";

export interface ReaderTheme {
  mode: ThemeMode;
  bg: string;
  text: string;
  ui: string;
}

export const THEMES: Record<ThemeMode, ReaderTheme> = {
  light: {
    mode: "light",
    bg: "#ffffff",
    text: "#1a1a1a",
    ui: "#f3f4f6",
  },
  sepia: {
    mode: "sepia",
    bg: "#f4ecd8",
    text: "#5b4636",
    ui: "#e9dfc4",
  },
  dark: {
    mode: "dark",
    bg: "#1a1a1a",
    text: "#d1d1d1",
    ui: "#2d2d2d",
  },
  gray: {
    mode: "gray",
    bg: "#2c2c2c",
    text: "#e0e0e0",
    ui: "#3d3d3d",
  },
};

export interface Book {
  id: number;
  title: string;
  author?: string;
  path: string;
  format: "pdf" | "epub" | "mobi" | "azw3" | "txt" | "md";
  coverPath?: string;
  addedAt: string;
  lastReadAt?: string;
  progress: number;
}

export interface IpcRenderer {
  invoke(channel: "open-file-dialog"): Promise<Book | null>;
  invoke(channel: "get-library"): Promise<Book[]>;
  invoke(channel: "file-exists", filePath: string): Promise<boolean>;
  invoke(channel: "open-external", url: string): Promise<void>;
  invoke(channel: "open-user-data-folder"): Promise<string>;
  invoke(channel: "read-file", filePath: string): Promise<Uint8Array>;
  invoke(channel: "read-file-buffer", filePath: string): Promise<Uint8Array>;
  invoke(
    channel: "update-progress",
    bookId: number,
    progress: number,
  ): Promise<void>;
  invoke(channel: "delete-book", bookId: number): Promise<boolean>;
}

declare global {
  interface Window {
    ipcRenderer: IpcRenderer;
  }
}
