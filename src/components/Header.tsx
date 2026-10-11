import { useEffect, useState, type MouseEvent } from 'react'
import type { Lang } from '../i18n/content'
import { useLanguage } from '../i18n/LanguageContext'
import { toggleTheme } from '../theme'
import { CloseIcon, MenuIcon, MoonIcon, SunIcon } from './Icons'

export function Header() {
  const { t, lang, page, pathFor, switchLanguage } = useLanguage()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.classList.toggle('no-scroll', open)
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  // Οι σύνδεσμοι δείχνουν στις ενότητες της αρχικής, ώστε να δουλεύουν και από άλλες σελίδες.
  const home = pathFor('home')
  const links = [
    { href: `${home}#services`, label: t.nav.services },
    { href: `${home}#work`, label: t.nav.work },
    { href: `${home}#process`, label: t.nav.process },
    { href: `${home}#pricing`, label: t.nav.pricing },
    { href: `${home}#faq`, label: t.nav.faq },
  ]

  const close = () => setOpen(false)

  // Αλλαγή γλώσσας επιτόπου, χωρίς ανανέωση και στο ίδιο σημείο της σελίδας.
  // Τα links έχουν κανονικό href (/ ή /en/) για Google, νέα καρτέλα και Ctrl/Cmd-κλικ.
  const onLanguageClick = (e: MouseEvent<HTMLAnchorElement>, next: Lang) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    e.preventDefault()
    switchLanguage(next)
  }

  return (
    <header className={`header${scrolled ? ' is-scrolled' : ''}${open ? ' is-open' : ''}`}>
      <a className="skip-link" href="#main">
        {t.nav.skip}
      </a>
      <div className="container header__inner">
        <a className="logo" href={home} onClick={close} aria-label="Akamas">
          <span className="logo__word">{t.brand}</span>
          <span className="logo__sub">
            <span>web design &amp;</span>
            <span>development</span>
          </span>
        </a>

        <nav className="header__nav" id="site-nav" aria-label={t.nav.menu}>
          {links.map((l) => (
            <a key={l.href} href={l.href} onClick={close}>
              {l.label}
            </a>
          ))}
          <a className="header__nav-contact" href={`${home}#contact`} onClick={close}>
            {t.nav.contact}
          </a>
        </nav>

        <div className="header__tools">
          {/* Κάθε γλώσσα έχει δική της διεύθυνση (/ και /en/), για να την βρίσκει η Google */}
          <div className="lang-switch" role="group" aria-label={t.nav.language}>
            <a
              href={pathFor(page, 'el')}
              hrefLang="el"
              lang="el"
              aria-current={lang === 'el' ? 'true' : undefined}
              onClick={(e) => onLanguageClick(e, 'el')}
            >
              ΕΛ
            </a>
            <a
              href={pathFor(page, 'en')}
              hrefLang="en"
              lang="en"
              aria-current={lang === 'en' ? 'true' : undefined}
              onClick={(e) => onLanguageClick(e, 'en')}
            >
              EN
            </a>
          </div>
          <button type="button" className="icon-btn" onClick={toggleTheme} aria-label={t.nav.theme} title={t.nav.theme}>
            <SunIcon className="theme-icon theme-icon--sun" />
            <MoonIcon className="theme-icon theme-icon--moon" />
          </button>
          <a className="btn btn--primary btn--sm header__cta" href={`${home}#contact`}>
            {t.nav.cta}
          </a>
          <button
            type="button"
            className="icon-btn header__burger"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="site-nav"
            aria-label={open ? t.nav.close : t.nav.menu}
          >
            {open ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>
    </header>
  )
}
