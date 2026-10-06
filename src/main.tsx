import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './lib/auth'
import { ThemeProvider } from './lib/theme'
import './styles.css'

const app = (
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
)

// Prerendered pages (scripts/snapshot.mjs) already contain the page's HTML:
// hydrate it instead of throwing it away and painting everything again.
// SPA routes such as /login are rewritten to "/" and receive the homepage's
// HTML, so only hydrate when it was rendered for this exact path.
const root = document.getElementById('root')!
const trim = (p: string) => p.replace(/\/+$/, '') || '/'
if (root.hasChildNodes() && trim(root.dataset.path ?? '') === trim(location.pathname)) {
  hydrateRoot(root, app)
} else {
  root.textContent = ''
  createRoot(root).render(app)
}
