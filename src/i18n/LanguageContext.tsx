import { createContext, useContext, useEffect, type ReactNode } from 'react'
import { pathFor, type Page } from '../routes'
import { content, type Content, type Lang } from './content'

type LanguageValue = {
  lang: Lang
  page: Page
  t: Content
  // Διεύθυνση μιας σελίδας στην τρέχουσα (ή σε άλλη) γλώσσα
  pathFor: (page: Page, lang?: Lang) => string
}

const LanguageContext = createContext<LanguageValue | null>(null)

// Η γλώσσα και η σελίδα προκύπτουν από τη διεύθυνση (/ ή /en/), ώστε κάθε γλώσσα να έχει δικό της URL.
export function LanguageProvider({ lang, page, children }: { lang: Lang; page: Page; children: ReactNode }) {
  const t = content[lang]

  // Στο build το HTML έχει ήδη σωστό τίτλο· αυτό χρειάζεται για το npm run dev.
  useEffect(() => {
    document.documentElement.lang = lang
    document.title = page === 'home' ? t.meta.title : t.meta.privacyTitle
  }, [lang, page, t])

  const value: LanguageValue = {
    lang,
    page,
    t,
    pathFor: (p, l = lang) => pathFor(p, l),
  }

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const value = useContext(LanguageContext)
  if (!value) throw new Error('useLanguage must be used inside LanguageProvider')
  return value
}
