export type ThemeMode = "light" | "sepia" | "dark" | "gray" | "custom";
export type PageMode = "scroll" | "paginated" | "single";

export interface ReaderTheme {
  mode: ThemeMode;
  bg: string;
  text: string;
  ui: string;
  customBgImage?: string;
}

export interface ReaderSettings {
  fontSize: number;
  fontFamily: string;
  lineHeight: number;
  pageMode: PageMode;
  customBgImage?: string;
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
  custom: {
    mode: "custom",
    bg: "#ffffff",
    text: "#1a1a1a",
    ui: "#f3f4f6",
  },
};

export const DEFAULT_READER_SETTINGS: ReaderSettings = {
  fontSize: 18,
  fontFamily: "system-ui",
  lineHeight: 1.6,
  pageMode: "paginated",
};

export const FONT_FAMILIES = [
  { value: "system-ui", label: "系统默认" },
  { value: "'Noto Serif SC', serif", label: "思源宋体" },
  { value: "'Noto Sans SC', sans-serif", label: "思源黑体" },
  { value: "Georgia, serif", label: "Georgia" },
  { value: "'Times New Roman', serif", label: "Times New Roman" },
  { value: "Arial, sans-serif", label: "Arial" },
];

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

export interface Annotation {
  id: number;
  bookId: number;
  type: "highlight" | "note";
  cfi?: string;
  pageNumber?: number;
  text?: string;
  note?: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface IpcRenderer {
  invoke(channel: "open-file-dialog"): Promise<Book | null>;
  invoke(channel: "get-library"): Promise<Book[]>;
  invoke(channel: "search-library", query: string): Promise<Book[]>;
  invoke(channel: "file-exists", filePath: string): Promise<boolean>;
  invoke(channel: "open-external", url: string): Promise<void>;
  invoke(channel: "open-user-data-folder"): Promise<string>;
  invoke(channel: "read-file", filePath: string): Promise<Uint8Array>;
  invoke(channel: "read-file-buffer", filePath: string): Promise<Uint8Array>;
  invoke(channel: "get-cover-url", coverPath: string): Promise<string | null>;
  invoke(
    channel: "update-progress",
    bookId: number,
    progress: number,
  ): Promise<void>;
  invoke(channel: "delete-book", bookId: number): Promise<boolean>;
  // Annotation handlers
  invoke(channel: "get-annotations", bookId: number): Promise<Annotation[]>;
  invoke(
    channel: "add-annotation",
    annotation: {
      bookId: number;
      type: "highlight" | "note";
      cfi?: string;
      pageNumber?: number;
      text?: string;
      note?: string;
      color?: string;
    },
  ): Promise<Annotation>;
  invoke(
    channel: "update-annotation",
    id: number,
    updates: { note?: string; color?: string },
  ): Promise<Annotation | null>;
  invoke(channel: "delete-annotation", id: number): Promise<boolean>;
  invoke(channel: "select-background-image"): Promise<string | null>;
  invoke(channel: "get-background-image-url", imagePath: string): Promise<string | null>;
}

declare global {
  interface Window {
    ipcRenderer: IpcRenderer;
  }
}
