const email = 'akamas.web@gmail.com'

export const site = {
  // Η διεύθυνση του site (π.χ. 'https://akamas.gr'), χρησιμοποιείται για Google, sitemap και κοινοποιήσεις.
  // Αν μείνει κενή, στο Vercel / Netlify συμπληρώνεται αυτόματα με τη διεύθυνση του site
  // (και με το δικό σας domain, μόλις το συνδέσετε εκεί). Χρειάζεται μόνο αν φιλοξενηθεί αλλού.
  url: '',
  email,
  phone: '+30 694 270 5702',
  location: 'Ελλάδα · Κύπρος',
  socials: [
    { label: 'Instagram', href: 'https://instagram.com/' },
    { label: 'LinkedIn', href: 'https://linkedin.com/' },
    { label: 'Behance', href: 'https://behance.net/' },
  ],
  // Στοιχεία επιχείρησης για το footer και την πολιτική απορρήτου.
  // Εμφανίζονται μόνο όσα συμπληρωθούν.
  business: {
    legalName: '', // π.χ. «Ονοματεπώνυμο» ή επωνυμία εταιρείας
    vatId: '', // ΑΦΜ
    gemi: '', // Αριθμός ΓΕΜΗ (αν υπάρχει)
    address: '', // Διεύθυνση έδρας
  },
  // Η φόρμα στέλνει τα μηνύματα κατευθείαν στο email μέσω FormSubmit (δωρεάν, χωρίς λογαριασμό).
  // Την πρώτη φορά που θα σταλεί μήνυμα, το FormSubmit στέλνει email ενεργοποίησης που πρέπει να επιβεβαιωθεί.
  // Αν μείνει κενό, η φόρμα ανοίγει το πρόγραμμα email του επισκέπτη.
  formEndpoint: `https://formsubmit.co/ajax/${email}`,
}

// Προσφορά περιορισμένου χρόνου σε ένα πακέτο, με αντίστροφη μέτρηση στην κάρτα του.
// Εμφανίζεται μόνο μέχρι τη λήξη. Μετά το site δείχνει ξανά την κανονική τιμή, αυτόματα, χωρίς νέο deploy.
export const offer = {
  plan: 'Landing', // το όνομα του πακέτου, όπως στο content.ts
  price: '150',
  ends: '2026-10-25T23:59:59+02:00', // Κυριακή 25/10, τέλος της ημέρας, ώρα Ελλάδας
}

// Social links που δείχνουν σε πραγματικό προφίλ (όχι απλώς στην αρχική σελίδα του δικτύου).
export const realSocials = site.socials.filter((s) => {
  try {
    return new URL(s.href).pathname.replace(/\/$/, '') !== ''
  } catch {
    return false
  }
})
