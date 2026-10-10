import { site } from '../config'
import { useLanguage } from '../i18n/LanguageContext'
import { ArrowUpIcon } from './Icons'

export function Footer() {
  const { t, pathFor } = useLanguage()
  const year = new Date().getFullYear()
  const home = pathFor('home')
  const links = [
    { href: `${home}#services`, label: t.nav.services },
    { href: `${home}#work`, label: t.nav.work },
    { href: `${home}#process`, label: t.nav.process },
    { href: `${home}#pricing`, label: t.nav.pricing },
    { href: `${home}#contact`, label: t.nav.contact },
  ]

  // Στοιχεία επιχείρησης: εμφανίζονται μόνο όσα έχουν συμπληρωθεί στο config.ts
  const b = site.business
  const businessDetails = [
    b.legalName,
    b.vatId && `${t.footer.vat} ${b.vatId}`,
    b.gemi && `${t.footer.gemi} ${b.gemi}`,
    b.address,
  ].filter(Boolean)

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__top">
          <div>
            <p className="footer__tagline">{t.footer.tagline}</p>
            <a className="footer__email" href={`mailto:${site.email}`}>
              {site.email}
            </a>
          </div>
          <nav className="footer__links" aria-label="Footer">
            {links.map((l) => (
              <a key={l.href} href={l.href}>
                {l.label}
              </a>
            ))}
          </nav>
          <div className="footer__links">
            {site.socials.map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noreferrer">
                {s.label}
              </a>
            ))}
          </div>
        </div>
        <p className="footer__word" aria-hidden="true">
          {t.brand}
        </p>
        <div className="footer__bottom">
          <div className="footer__legal">
            {/* Το έτος υπολογίζεται και στο build και στον browser· αγνοούμε τη διαφορά στην αλλαγή του χρόνου */}
            <span suppressHydrationWarning>
              © {year} Akamas Web Design &amp; Development. {t.footer.rights}
            </span>
            {businessDetails.length > 0 && <span>{businessDetails.join(' · ')}</span>}
            <a href={pathFor('privacy')}>{t.footer.privacy}</a>
          </div>
          <a href="#top" className="footer__top-link">
            {t.footer.backToTop}
            <ArrowUpIcon width={16} height={16} />
          </a>
        </div>
      </div>
    </footer>
  )
}
