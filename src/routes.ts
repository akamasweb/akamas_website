import type { Lang } from './i18n/content'

export type Page = 'home' | 'privacy'

export const LANGS: Lang[] = ['el', 'en']
export const PAGES: Page[] = ['home', 'privacy']

// Τα ελληνικά είναι στη ρίζα (/), τα αγγλικά κάτω από /en/.
export function pathFor(page: Page, lang: Lang) {
  const prefix = lang === 'en' ? '/en' : ''
  return page === 'home' ? `${prefix}/` : `${prefix}/privacy/`
}

export function routeFromPath(pathname: string): { lang: Lang; page: Page } {
  const lang: Lang = /^\/en(\/|$)/.test(pathname) ? 'en' : 'el'
  const page: Page = /\/privacy\/?$/.test(pathname) ? 'privacy' : 'home'
  return { lang, page }
}
