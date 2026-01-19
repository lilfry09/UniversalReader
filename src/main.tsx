import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

function showCriticalError(message: string, source?: string, lineno?: number, colno?: number, stack?: string) {
  const errorDiv = document.createElement('div')
  errorDiv.style.position = 'fixed'
  errorDiv.style.top = '0'
  errorDiv.style.left = '0'
  errorDiv.style.width = '100%'
  errorDiv.style.height = '100%'
  errorDiv.style.backgroundColor = 'red'
  errorDiv.style.color = 'white'
  errorDiv.style.zIndex = '9999'
  errorDiv.style.padding = '20px'
  errorDiv.style.whiteSpace = 'pre-wrap'
  errorDiv.style.fontFamily = 'monospace'
  errorDiv.innerText = `CRITICAL ERROR:\n${message}\n\nSource: ${source || 'unknown'}:${lineno || 0}:${colno || 0}\n\nStack:\n${stack || 'No stack trace'}`
  document.body.appendChild(errorDiv)
}

window.onerror = function (message, source, lineno, colno, error) {
  // Ignore harmless ResizeObserver errors
  if (typeof message === 'string' && message.includes('ResizeObserver')) {
    return;
  }

  showCriticalError(String(message), String(source), lineno, colno, error?.stack)
};

window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason
  const message = reason instanceof Error ? reason.message : String(reason)
  const stack = reason instanceof Error ? reason.stack : undefined
  showCriticalError(`Unhandled Promise Rejection: ${message}`, 'unhandledrejection', 0, 0, stack)
})

const rootEl = document.getElementById('root')
if (!rootEl) {
  showCriticalError('Root element #root not found', 'main.tsx', 0, 0)
  throw new Error('Root element #root not found')
}

const renderRoot = createRoot(rootEl)

async function bootstrap() {
  try {
    if (import.meta.env.DEV) {
      rootEl.textContent = 'Booting…'
      console.info('[renderer] boot')
    }

    const mod = await import('./App')
    const App = mod.default

    renderRoot.render(
      <StrictMode>
        <App />
      </StrictMode>
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    const stack = err instanceof Error ? err.stack : undefined
    showCriticalError(`Bootstrap failed: ${message}`, 'main.tsx', 0, 0, stack)
    console.error('[renderer] bootstrap failed', err)
  }
}

void bootstrap()
