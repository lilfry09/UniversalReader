// Platform detection utilities

export const isElectron = () =>
  typeof window !== 'undefined' && window.ipcRenderer != null

// LocalStorage keys
export const WEB_LIBRARY_KEY = 'web-library'
export const READER_THEME_KEY = 'reader-theme'
export const READER_SETTINGS_KEY = 'reader-settings'
export const READER_CUSTOM_BG_KEY = 'reader-custom-bg'
export const OPEN_EXTERNAL_LINKS_KEY = 'open-external-links'

// Theme helpers
export const isLightTheme = (mode: string) =>
  ['light', 'sepia', 'custom'].includes(mode)
