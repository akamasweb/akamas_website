// Κοινή «ετικέτα» για όλα τα templates: δείχνει ότι η σελίδα είναι template της Akamas
// και δίνει δρόμο πίσω στην Akamas (στα Έργα) ή προς την επικοινωνία.
//
// Χρήση σε κάθε template (main.js):
//   import { mountAkamasBadge, setAkamasBadgeLang } from '../_shared/akamas-badge.js'
//   mountAkamasBadge(lang)          // μία φορά, με 'el' ή 'en'
//   setAkamasBadgeLang(lang)        // όταν αλλάζει γλώσσα το template
//
// Αν το template έχει σταθερή μπάρα στο κάτω μέρος (π.χ. «Κλήση» στο κινητό), ορίζει στο CSS του:
//   :root { --akamas-badge-offset: <ύψος μπάρας + 12px>; }
import './akamas-badge.css'

const TEXT = {
  el: {
    label: 'Template από την Akamas',
    short: 'Template · Akamas',
    back: 'Πίσω στην Akamas',
    cta: 'Θέλω κάτι παρόμοιο',
    dismiss: 'Απόκρυψη',
    aria: 'Σημείωση: αυτή η σελίδα είναι template',
  },
  en: {
    label: 'Template by Akamas',
    short: 'Template · Akamas',
    back: 'Back to Akamas',
    cta: 'I want one like this',
    dismiss: 'Hide',
    aria: 'Note: this page is a template',
  },
}

const HOME = { el: '/', en: '/en/' }
const STORAGE_KEY = 'akamas-badge-hidden'

let root = null
let currentLang = 'el'

const markSvg = `<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" focusable="false"><path d="M4.5 20 12 3.5 19.5 20M7.6 13.4h8.8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`
const arrowSvg = `<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" focusable="false"><path d="M19 12H5M11 6l-6 6 6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`
const closeSvg = `<svg viewBox="0 0 24 24" width="12" height="12" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`

// Αν ο επισκέπτης ήρθε από την Akamas, το «Πίσω» τον γυρίζει ακριβώς εκεί που ήταν (ίδιο scroll).
function cameFromAkamas() {
  try {
    const ref = new URL(document.referrer)
    return ref.origin === location.origin && !ref.pathname.startsWith('/template/')
  } catch {
    return false
  }
}

function render() {
  if (!root) return
  const t = TEXT[currentLang] ?? TEXT.el
  const home = HOME[currentLang] ?? HOME.el
  root.setAttribute('aria-label', t.aria)
  root.innerHTML = `
    <span class="akamas-badge__mark">${markSvg}</span>
    <span class="akamas-badge__label" data-long="${t.label}" data-short="${t.short}"></span>
    <a class="akamas-badge__link akamas-badge__back" href="${home}#work">${arrowSvg}<span>${t.back}</span></a>
    <a class="akamas-badge__link akamas-badge__cta" href="${home}#contact">${t.cta}</a>
    <button type="button" class="akamas-badge__close" aria-label="${t.dismiss}" title="${t.dismiss}">${closeSvg}</button>
  `
  root.querySelector('.akamas-badge__back').addEventListener('click', (e) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    if (cameFromAkamas() && history.length > 1) {
      e.preventDefault()
      history.back()
    }
  })
  root.querySelector('.akamas-badge__close').addEventListener('click', () => {
    root.hidden = true
    try {
      sessionStorage.setItem(STORAGE_KEY, '1')
    } catch {
      // αγνοείται
    }
  })
}

export function mountAkamasBadge(lang = 'el') {
  currentLang = lang
  if (root) return render()
  root = document.createElement('aside')
  root.className = 'akamas-badge'
  try {
    if (sessionStorage.getItem(STORAGE_KEY) === '1') root.hidden = true
  } catch {
    // αγνοείται
  }
  document.body.appendChild(root)
  render()
}

export function setAkamasBadgeLang(lang) {
  currentLang = lang
  render()
}
