# Akamas — Web Design & Development

Η ιστοσελίδα της Akamas. React + Vite + TypeScript, δίγλωσση (ελληνικά στο `/`, αγγλικά στο `/en/`),
με έτοιμο HTML για κάθε σελίδα (prerendering) για καλύτερο SEO.

## Εντολές

```bash
npm install       # μία φορά, εγκαθιστά τα πακέτα
npm run dev       # τοπικά, στο http://localhost:5173
npm run build     # τελική έκδοση στον φάκελο dist/
npm run preview   # προεπισκόπηση της τελικής έκδοσης
```

## Πού αλλάζω τι

| Τι | Αρχείο |
|---|---|
| Domain, email, τηλέφωνο, social, στοιχεία επιχείρησης, φόρμα | `src/config.ts` |
| Όλα τα κείμενα (ελληνικά & αγγλικά) | `src/i18n/content.ts` |
| Πολιτική απορρήτου | `src/i18n/privacy.ts` |
| Χρώματα & γραμματοσειρές | αρχή του `src/styles.css` |
| Εικόνες κοινοποίησης | `public/og-el.png`, `public/og-en.png` |

## Ανέβασμα (Vercel / Netlify)

- Build command: `npm run build`
- Output directory: `dist`
- Πριν το πρώτο ανέβασμα, ορίστε το σωστό domain στο `url` του `src/config.ts`.
- Μετά το ανέβασμα, στείλτε ένα δοκιμαστικό μήνυμα από τη φόρμα και επιβεβαιώστε το email ενεργοποίησης του FormSubmit.
