import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { flushSync } from 'react-dom'
import { pathFor, routeFromPath, type Page } from '../routes'
import { capturePosition, restorePosition } from '../scrollMemory'
import { content, type Content, type Lang } from './content'

type LanguageValue = {
  lang: Lang
  page: Page
  t: Content
  // Διεύθυνση μιας σελίδας στην τρέχουσα (ή σε άλλη) γλώσσα
  pathFor: (page: Page, lang?: Lang) => string
  // Αλλάζει γλώσσα χωρίς ανανέωση της σελίδας, μένοντας στο ίδιο σημείο
  switchLanguage: (lang: Lang) => void
}

const LanguageContext = createContext<LanguageValue | null>(null)

// Κάθε γλώσσα έχει δικό της URL (/ και /en/), με έτοιμο HTML για Google και κοινοποιήσεις.
// Μέσα στον browser όμως η αλλαγή γλώσσας γίνεται επιτόπου: αλλάζει το URL και τα κείμενα, χωρίς ανανέωση.
export function LanguageProvider({ lang: initialLang, page, children }: { lang: Lang; page: Page; children: ReactNode }) {
  const [lang, setLang] = useState(initialLang)
  const t = content[lang]

  useEffect(() => {
    document.documentElement.lang = lang
    document.title = page === 'home' ? t.meta.title : t.meta.privacyTitle
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute('content', page === 'home' ? t.meta.description : t.meta.privacyDescription)
  }, [lang, page, t])

  // Αλλάζει τα κείμενα αμέσως (flushSync) και επαναφέρει τη θέση πάνω στη νέα διάταξη
  const applyLanguage = (next: Lang) => {
    const position = capturePosition()
    flushSync(() => setLang(next))
    restorePosition(position)
  }

  // Πίσω / Εμπρός του browser ανάμεσα στις γλώσσες
  useEffect(() => {
    const onPopState = () => applyLanguage(routeFromPath(window.location.pathname).lang)
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const switchLanguage = (next: Lang) => {
    if (next === lang) return
    window.history.pushState(null, '', pathFor(page, next) + window.location.hash)
    applyLanguage(next)
  }

  const value: LanguageValue = {
    lang,
    page,
    t,
    pathFor: (p, l = lang) => pathFor(p, l),
    switchLanguage,
  }

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const value = useContext(LanguageContext)
  if (!value) throw new Error('useLanguage must be used inside LanguageProvider')
  return value
}
