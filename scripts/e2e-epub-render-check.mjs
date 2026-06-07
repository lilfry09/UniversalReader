import { _electron as electron } from 'playwright'
import { PNG } from 'pngjs'
import fs from 'node:fs'
import path from 'node:path'

const cwd = path.resolve(import.meta.dirname, '..')
const outDir = path.join(cwd, 'tmp-e2e')
fs.mkdirSync(outDir, { recursive: true })

const electronApp = await electron.launch({
  args: ['.'],
  cwd,
})

const page = await electronApp.firstWindow()
const consoleMessages = []
page.on('console', message => {
  consoleMessages.push(`${message.type()}: ${message.text()}`)
})
page.on('pageerror', error => {
  consoleMessages.push(`pageerror: ${error.message}`)
})

await page.waitForLoadState('domcontentloaded')
const modeArg = process.argv.find(arg => arg.startsWith('--mode='))
const pageMode = modeArg?.split('=')[1] ?? 'paginated'
const bookIdArg = process.argv.find(arg => arg.startsWith('--book-id='))
const bookId = bookIdArg?.split('=')[1] ?? '2'
const waitTextArg = process.argv.find(arg => arg.startsWith('--wait-text='))
const waitText = waitTextArg?.split('=').slice(1).join('=') ?? 'EPUB'

await page.evaluate(({ mode, targetBookId }) => {
  const saved = JSON.parse(localStorage.getItem('reader-settings') || '{}')
  localStorage.setItem('reader-settings', JSON.stringify({
    fontSize: typeof saved.fontSize === 'number' ? saved.fontSize : 18,
    fontFamily: typeof saved.fontFamily === 'string' ? saved.fontFamily : 'system-ui',
    lineHeight: typeof saved.lineHeight === 'number' ? saved.lineHeight : 1.6,
    pageMode: mode,
  }))
  window.location.hash = `#/reader/${targetBookId}`
}, { mode: pageMode, targetBookId: bookId })

await page.waitForFunction((text) => document.body.textContent?.includes(text), waitText, {
  timeout: 10000,
})

await page.waitForTimeout(8000)

const state = await page.evaluate(async () => {
  const view = document.querySelector('foliate-view')
  return {
    hasView: !!view,
    viewTag: view?.tagName,
    hasRenderer: !!view?.renderer,
    rendererTag: view?.renderer?.tagName,
    location: window.location.href,
    bodyText: document.body.textContent?.slice(0, 500),
    lastLocation: view?.lastLocation,
  }
})

const screenshotPath = path.join(outDir, `reader-${bookId}-${pageMode}.png`)
const buffer = await page.screenshot({ path: screenshotPath, fullPage: false })
const png = PNG.sync.read(buffer)

const contentBounds = {
  left: Math.floor(png.width * 0.38),
  right: Math.floor(png.width * 0.93),
  top: Math.floor(png.height * 0.18),
  bottom: Math.floor(png.height * 0.92),
}

let sampled = 0
let nonBlank = 0
let dark = 0

for (let y = contentBounds.top; y < contentBounds.bottom; y += 2) {
  for (let x = contentBounds.left; x < contentBounds.right; x += 2) {
    const idx = (png.width * y + x) * 4
    const r = png.data[idx]
    const g = png.data[idx + 1]
    const b = png.data[idx + 2]
    sampled += 1
    if (r < 248 || g < 248 || b < 248) nonBlank += 1
    if (r < 120 && g < 120 && b < 120) dark += 1
  }
}

const metrics = {
  screenshotPath,
  bookId,
  pageMode,
  sampled,
  nonBlank,
  dark,
  nonBlankRatio: nonBlank / sampled,
  darkRatio: dark / sampled,
  state,
  consoleMessages: consoleMessages.slice(-30),
}

console.log(JSON.stringify(metrics, null, 2))
await electronApp.close()

if (metrics.dark < 500 || metrics.nonBlankRatio < 0.005) {
  process.exitCode = 1
}
