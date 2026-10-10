// Το αρχικό θέμα το ορίζει το script στο index.html πριν φορτώσει η σελίδα.
// Εδώ μόνο το αλλάζουμε· το ποιο εικονίδιο φαίνεται το αποφασίζει το CSS,
// ώστε το έτοιμο HTML του server να ταιριάζει πάντα με τον browser.
const STORAGE_KEY = 'akamas-theme'
const THEME_COLORS = { dark: '#0B162E', light: '#F4F6F8' }

export function toggleTheme() {
  const root = document.documentElement
  const next = root.dataset.theme === 'light' ? 'dark' : 'light'
  root.dataset.theme = next
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLORS[next])
  try {
    localStorage.setItem(STORAGE_KEY, next)
  } catch {
    // Το localStorage μπορεί να μην είναι διαθέσιμο (π.χ. ιδιωτική περιήγηση).
  }
}
