import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import '@fontsource/eb-garamond/400.css'
import '@fontsource/eb-garamond/500.css'
import '@fontsource/eb-garamond/400-italic.css'
import '@fontsource-variable/manrope'
import '@fontsource-variable/jura'
import './styles.css'
import App from './App'
import { LanguageProvider } from './i18n/LanguageContext'
import { routeFromPath } from './routes'

const { lang, page } = routeFromPath(window.location.pathname)
const app = (
  <StrictMode>
    <LanguageProvider lang={lang} page={page}>
      <App />
    </LanguageProvider>
  </StrictMode>
)

// Στο build η σελίδα έρχεται έτοιμη (prerendered) και την «ζωντανεύουμε».
// Στο npm run dev το #root είναι άδειο και τη σχεδιάζουμε από την αρχή.
const root = document.getElementById('root')!
if (root.firstElementChild) {
  hydrateRoot(root, app)
} else {
  createRoot(root).render(app)
}
