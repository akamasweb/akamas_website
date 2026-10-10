const email = 'akamas.web@gmail.com'

export const site = {
  // Η τελική διεύθυνση του site, χωρίς «/» στο τέλος.
  // ΑΛΛΑΞΤΕ ΤΗΝ με το δικό σας domain πριν το ανεβάσετε: χρησιμοποιείται για Google, sitemap και κοινοποιήσεις.
  url: 'https://akamas.gr',
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

// Social links που δείχνουν σε πραγματικό προφίλ (όχι απλώς στην αρχική σελίδα του δικτύου).
export const realSocials = site.socials.filter((s) => {
  try {
    return new URL(s.href).pathname.replace(/\/$/, '') !== ''
  } catch {
    return false
  }
})
