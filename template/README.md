# Akamas industry templates

Demo websites for fictional businesses, shown in the "Selected work" section of the Akamas site. Each one shows a potential client what Akamas can build for their industry.

| Slug | Industry | URL (dev) | Status |
|---|---|---|---|
| `coffee-shop` | Coffee shop / roastery (Κόκκος Coffee Roasters) | `/template/coffee-shop/` | built + QA'd |
| `barbershop` | Barbershop (Ξυράφι Barber Studio) | `/template/barbershop/` | built + QA'd |
| `corporate` | Accounting & business advisory (Στάθμη & Συνεργάτες) | `/template/corporate/` | built + QA'd |
| `car-service` | Car repair garage (Ροπή Auto Service) | `/template/car-service/` | built + QA'd |
| `pilates-studio` | Pilates & movement studio for adults and kids (Ανάσα Studio) | `/template/pilates-studio/` | built + QA'd |

## How it is wired

- `vite.config.ts` turns every folder `template/<slug>/` that has an `index.html` into its own page (`/template/<slug>/`). Folders starting with `_` are shared code, not pages.
- `template/_shared/akamas-badge.js|css`: the small "Template by Akamas" pill shown on every template, with links back to the Akamas site. Its "Θέλω κάτι παρόμοιο" button (shown on phones too) opens `/?template=<slug>`: the home page starts at the top, shows every section at once (no fade-in, images loaded eagerly) and scrolls by itself down to the contact form (`src/scrollTour.ts`; any wheel, touch or key press stops it). The message is pre-filled with the template's name (`contact.fromTemplate` in `src/i18n/content.ts`) and `?template` is then dropped from the URL. Each template calls `mountAkamasBadge(lang)` on load and `setAkamasBadgeLang(lang)` when its language changes.
- The work cards live in `src/i18n/content.ts` (`work.items`, `kind: 'template'`) and are rendered by `Work()` in `src/components/Sections.tsx`. Templates open in the same tab; from the English site they open with `?lang=en`.
- Card screenshots: `public/work/template-<slug>.webp` (1440×900, first screen of the template, badge hidden).

## Rules every template follows

- Plain HTML + CSS + vanilla JS modules. No frameworks, no CDNs, **no external requests** (fonts are the self-hosted `@fontsource` packages in `package.json`).
- No photos: the visual identity is typography, colour, layout and inline SVG.
- `<meta name="robots" content="noindex, nofollow">`, inline SVG favicon, `<html lang="el">`.
- Bilingual: Greek by default, `?lang=en` for English, `data-set-lang="el|en"` toggle buttons. Switching never reloads and updates all text, attributes, title, meta description, `<html lang>`, the URL and the badge.
- Fictional business with placeholder details: phone 210 000 0000, `@example.com` emails, "Οδός Παραδείγματος 12, Αθήνα".
- Demo forms never send data, and they say so.
- Footer line: «Template από την Akamas · Όλα τα στοιχεία είναι ενδεικτικά».
- Responsive (390 / 820 / 1440 px), accessible (landmarks, skip link, one `<h1>`, keyboard-operable widgets, AA contrast), `prefers-reduced-motion` respected, content visible without JS.
- Akamas's own fonts (Jura, EB Garamond, Manrope) and navy + gold palette are not used, and the templates look clearly different from each other.

All five are linked from the work section (`src/i18n/content.ts`), with screenshots in `public/work/`.

`car-service` notes: prices on the service cards, the hero pins, the estimate and the tracking demo are all calculated from the same data in `car-service/i18n.js` (`JOBS`, `SIZES`, `QUALITY`, `LABOUR_RATE`, `VAT`), so changing a price there updates every place it appears. On phones it has a fixed Call / Book bar, so it sets `--akamas-badge-offset` to keep the badge above it. Its card screenshot was taken with the page clock fixed to a weekday at 10:30, so the hero shows "open now".

`pilates-studio` notes: the hero is two «doors», adults (green) and kids (yellow), each with its own live next class; on wide screens the hovered or chosen door widens. Choosing a door (its trial button or its link) re-themes the page (green → violet for kids) and filters the classes, the timetable, the price calculator and the trial form; it is shareable as `?for=adults|kids`. The card screenshot was taken with reduced motion and the clock fixed to a Tuesday at 17:30. The weekly timetable lives only in the HTML (`data-slot` attributes) and `main.js` reads it from there for the live "now / next class" chip, the timetable badges and the trial form's dates. Package prices are in `pilates-studio/i18n.js` (`PRICES`), class rules (audience, kids' ages, aerial deposit) in `CLASSES`.

A template for trades & home services was planned but deliberately not built (stopped at the owner's request, Oct 2026). To add a template later: create `template/<slug>/` with `index.html`, `style.css`, `main.js` and `i18n.js` following the rules above (copy the structure of an existing one), QA it at 1440 / 820 / 390 px in both languages, add a `kind: 'template'` item to both languages in `content.ts`, and save a 1440×900 screenshot of its first screen (badge hidden) as `public/work/template-<slug>.webp`.

Commit and push **only when the owner asks**.
