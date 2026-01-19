import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

window.onerror = function (message, source, lineno, colno, error) {
  // Ignore harmless ResizeObserver errors
  if (typeof message === 'string' && message.includes('ResizeObserver')) {
    return;
  }

  const errorDiv = document.createElement('div');
  errorDiv.style.position = 'fixed';
  errorDiv.style.top = '0';
  errorDiv.style.left = '0';
  errorDiv.style.width = '100%';
  errorDiv.style.height = '100%';
  errorDiv.style.backgroundColor = 'red';
  errorDiv.style.color = 'white';
  errorDiv.style.zIndex = '9999';
  errorDiv.style.padding = '20px';
  errorDiv.style.whiteSpace = 'pre-wrap';
  errorDiv.style.fontFamily = 'monospace';
  errorDiv.innerText = `CRITICAL ERROR:\n${message}\n\nSource: ${source}:${lineno}:${colno}\n\nStack:\n${error?.stack || 'No stack trace'}`;
  document.body.appendChild(errorDiv);
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
