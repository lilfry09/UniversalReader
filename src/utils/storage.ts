// Safe localStorage utilities

export function safeGetItem<T>(key: string, defaultValue: T): T {
  const item = localStorage.getItem(key)
  if (item === null) return defaultValue

  try {
    return JSON.parse(item) as T
  } catch {
    if (typeof defaultValue === 'string' || defaultValue === null) {
      return item as T
    }
    return defaultValue
  }
}

export function safeSetItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (err) {
    console.error(`Failed to save to localStorage key "${key}":`, err)
  }
}
