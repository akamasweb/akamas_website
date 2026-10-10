// Χρησιμοποιείται μόνο στο build (scripts/prerender.mjs): παράγει έτοιμο HTML και τα meta tags
// κάθε σελίδας, ώστε Google, Facebook, Viber κ.λπ. να βλέπουν το περιεχόμενο χωρίς JavaScript.
import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import App from './App'
import { realSocials, site } from './config'
import { content, type Lang } from './i18n/content'
import { LanguageProvider } from './i18n/LanguageContext'
import { LANGS, PAGES, pathFor, type Page } from './routes'

export const routes = LANGS.flatMap((lang) => PAGES.map((page) => ({ lang, page, path: pathFor(page, lang) })))

export function render(lang: Lang, page: Page) {
  return renderToString(
    <StrictMode>
      <LanguageProvider lang={lang} page={page}>
        <App />
      </LanguageProvider>
    </StrictMode>,
  )
}

const abs = (path: string) => `${site.url}${path}`
const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

// Δομημένα δεδομένα: λένε στη Google ότι πρόκειται για επιχείρηση web design & development
function businessJsonLd(lang: Lang) {
  const t = content[lang]
  const b = site.business
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': `${site.url}/#business`,
    name: 'Akamas Web Design & Development',
    alternateName: ['Akamas', 'ΑΚΑΜΑΣ'],
    url: abs(pathFor('home', lang)),
    image: abs(`/og-${lang}.png`),
    logo: abs('/apple-touch-icon.png'),
    description: t.meta.description,
    email: site.email,
    telephone: site.phone.replace(/\s/g, ''),
    areaServed: [
      { '@type': 'Country', name: 'Greece' },
      { '@type': 'Country', name: 'Cyprus' },
    ],
    knowsAbout: ['Web design', 'Web development', 'E-commerce', 'SEO', 'Web applications'],
    ...(b.legalName && { legalName: b.legalName }),
    ...(b.vatId && { vatID: b.vatId }),
    ...(b.address && { address: b.address }),
    ...(realSocials.length > 0 && { sameAs: realSocials.map((s) => s.href) }),
  }
}

export function head(lang: Lang, page: Page) {
  const t = content[lang]
  const title = page === 'home' ? t.meta.title : t.meta.privacyTitle
  const description = page === 'home' ? t.meta.description : t.meta.privacyDescription
  const url = abs(pathFor(page, lang))
  const image = abs(`/og-${lang}.png`)
  const otherLocale = content[lang === 'el' ? 'en' : 'el'].meta.ogLocale

  const tags = [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(description)}" />`,
    `<link rel="canonical" href="${url}" />`,
    ...LANGS.map((l) => `<link rel="alternate" hreflang="${l}" href="${abs(pathFor(page, l))}" />`),
    `<link rel="alternate" hreflang="x-default" href="${abs(pathFor(page, 'el'))}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="Akamas" />`,
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(description)}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:image" content="${image}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="${esc(t.meta.ogImageAlt)}" />`,
    `<meta property="og:locale" content="${t.meta.ogLocale}" />`,
    `<meta property="og:locale:alternate" content="${otherLocale}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
  ]
  if (page === 'home') {
    const json = JSON.stringify(businessJsonLd(lang)).replace(/</g, '\\u003c')
    tags.push(`<script type="application/ld+json">${json}</script>`)
  }
  return tags.join('\n    ')
}

export function sitemap() {
  const entries = PAGES.flatMap((page) =>
    LANGS.map((lang) => {
      const alternates = [
        ...LANGS.map((l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${abs(pathFor(page, l))}" />`),
        `    <xhtml:link rel="alternate" hreflang="x-default" href="${abs(pathFor(page, 'el'))}" />`,
      ]
      return `  <url>\n    <loc>${abs(pathFor(page, lang))}</loc>\n${alternates.join('\n')}\n  </url>`
    }),
  )
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...entries,
    '</urlset>',
    '',
  ].join('\n')
}

export function robots() {
  return `User-agent: *\nAllow: /\n\nSitemap: ${abs('/sitemap.xml')}\n`
}
