import { site } from '../config'
import type { Lang } from './content'

// Κείμενο πολιτικής απορρήτου (ΓΚΠΔ). Είναι πρότυπο: καλό είναι να το ελέγξει ένας νομικός
// και να προσαρμοστεί αν προσθέσετε analytics, newsletter ή άλλες υπηρεσίες.

// Ένα στοιχείο του σώματος είναι είτε παράγραφος (string) είτε λίστα (string[])
export type PrivacyBlock = string | string[]
export type PrivacyContent = {
  eyebrow: string
  title: string
  updated: string
  intro: string
  back: string
  sections: { title: string; body: PrivacyBlock[] }[]
}

const UPDATED = { el: '10 Οκτωβρίου 2026', en: '10 October 2026' }

function controllerLines(lang: Lang): string[] {
  const b = site.business
  const name = b.legalName || 'Akamas Web Design & Development'
  const lines = [name]
  if (b.address) lines.push(b.address)
  if (b.vatId) lines.push(`${lang === 'el' ? 'ΑΦΜ' : 'VAT no.'}: ${b.vatId}`)
  if (b.gemi) lines.push(`${lang === 'el' ? 'ΓΕΜΗ' : 'G.E.MI.'}: ${b.gemi}`)
  lines.push(`Email: ${site.email}`)
  lines.push(`${lang === 'el' ? 'Τηλέφωνο' : 'Phone'}: ${site.phone}`)
  return lines
}

export function getPrivacy(lang: Lang): PrivacyContent {
  if (lang === 'en') {
    return {
      eyebrow: 'Legal',
      title: 'Privacy policy',
      updated: `Last updated: ${UPDATED.en}`,
      intro:
        'Your privacy matters to us. This page explains what personal data we collect through this website, why, and how we protect it, in line with the General Data Protection Regulation (EU) 2016/679 (GDPR).',
      back: 'Back to home',
      sections: [
        {
          title: 'Data controller',
          body: ['The controller of your personal data is:', controllerLines('en')],
        },
        {
          title: 'What data we collect',
          body: [
            [
              'When you fill in the contact form: your name, email, phone number (optional), the type of project, your budget and your message.',
              'When you email or call us: whatever details you choose to share with us.',
            ],
            'We do not use analytics, advertising cookies or any tracking tools.',
          ],
        },
        {
          title: 'Why we use it and on what legal basis',
          body: [
            'We use your details only to reply to your request and, if you wish, to send you a quote and work together. The legal basis is taking steps at your request before entering into a contract (Art. 6(1)(b) GDPR) and our legitimate interest in replying to our correspondence (Art. 6(1)(f) GDPR).',
            'We never sell or rent your data, and we do not use it for advertising.',
          ],
        },
        {
          title: 'Who we share it with',
          body: [
            'To run this website we rely on trusted providers that process data only on our behalf:',
            [
              'FormSubmit (formsubmit.co): forwards contact form messages to our email.',
              'Google (Gmail): receives and stores our email correspondence.',
              'Our website hosting provider, which may log technical data (such as your IP address) for security purposes.',
            ],
            'Some of these providers may process data outside the European Union. In that case, transfers are protected by the safeguards required by the GDPR, such as the European Commission’s Standard Contractual Clauses or the EU-U.S. Data Privacy Framework.',
          ],
        },
        {
          title: 'How long we keep it',
          body: [
            'We keep correspondence for as long as needed to reply and, if we do not end up working together, for up to 2 years. If we work together, records are kept for as long as tax law requires.',
          ],
        },
        {
          title: 'Cookies and local storage',
          body: [
            'This website does not use cookies. It only stores your light or dark theme preference in your own browser, and this is never sent to us. Fonts are served from our own server, not from third parties such as Google Fonts.',
          ],
        },
        {
          title: 'Your rights',
          body: [
            'You have the right to:',
            [
              'access the data we hold about you,',
              'have it corrected or deleted,',
              'restrict or object to its processing,',
              'receive it in a portable format.',
            ],
            `To exercise any of these rights, email us at ${site.email}. We will reply within one month at the latest.`,
            'If you believe your data is processed unlawfully, you can lodge a complaint with the Hellenic Data Protection Authority (www.dpa.gr) or the supervisory authority of the country where you live.',
          ],
        },
        {
          title: 'Security',
          body: [
            'The website is served only over an encrypted connection (HTTPS), and access to your data is limited to the people who need it to help you.',
          ],
        },
        {
          title: 'Changes to this policy',
          body: ['We may update this policy from time to time. The date of the latest update is shown at the top of this page.'],
        },
      ],
    }
  }

  return {
    eyebrow: 'Νομικά',
    title: 'Πολιτική απορρήτου',
    updated: `Τελευταία ενημέρωση: ${UPDATED.el}`,
    intro:
      'Η ιδιωτικότητά σας μας ενδιαφέρει. Σε αυτή τη σελίδα εξηγούμε ποια προσωπικά δεδομένα συλλέγουμε μέσω της ιστοσελίδας, γιατί και πώς τα προστατεύουμε, σύμφωνα με τον Γενικό Κανονισμό για την Προστασία Δεδομένων (ΕΕ) 2016/679 (ΓΚΠΔ) και τον ν. 4624/2019.',
    back: 'Επιστροφή στην αρχική',
    sections: [
      {
        title: 'Υπεύθυνος επεξεργασίας',
        body: ['Υπεύθυνος για την επεξεργασία των προσωπικών σας δεδομένων είναι:', controllerLines('el')],
      },
      {
        title: 'Ποια δεδομένα συλλέγουμε',
        body: [
          [
            'Όταν συμπληρώνετε τη φόρμα επικοινωνίας: ονοματεπώνυμο, email, τηλέφωνο (προαιρετικά), τον τύπο του έργου, τον προϋπολογισμό και το μήνυμά σας.',
            'Όταν μας στέλνετε email ή μας τηλεφωνείτε: όσα στοιχεία επιλέγετε να μας δώσετε.',
          ],
          'Δεν χρησιμοποιούμε εργαλεία στατιστικών (analytics), διαφημιστικά cookies ή εργαλεία παρακολούθησης.',
        ],
      },
      {
        title: 'Για ποιον σκοπό και με ποια νομική βάση',
        body: [
          'Χρησιμοποιούμε τα στοιχεία σας αποκλειστικά για να απαντήσουμε στο αίτημά σας και, αν το επιθυμείτε, για να σας στείλουμε προσφορά και να συνεργαστούμε. Νομική βάση είναι η λήψη μέτρων πριν από τη σύναψη σύμβασης, κατόπιν αιτήματός σας (άρθρο 6 παρ. 1 στοιχ. β΄ ΓΚΠΔ), και το έννομο συμφέρον μας να απαντάμε στην αλληλογραφία μας (άρθρο 6 παρ. 1 στοιχ. στ΄ ΓΚΠΔ).',
          'Δεν πουλάμε, δεν νοικιάζουμε και δεν χρησιμοποιούμε τα στοιχεία σας για διαφήμιση.',
        ],
      },
      {
        title: 'Με ποιους μοιραζόμαστε τα δεδομένα',
        body: [
          'Για τη λειτουργία της ιστοσελίδας συνεργαζόμαστε με αξιόπιστους παρόχους, που επεξεργάζονται δεδομένα μόνο για λογαριασμό μας:',
          [
            'FormSubmit (formsubmit.co): προωθεί τα μηνύματα της φόρμας στο email μας.',
            'Google (Gmail): παραλαβή και φύλαξη της αλληλογραφίας μας.',
            'Τον πάροχο φιλοξενίας της ιστοσελίδας, που μπορεί να καταγράφει τεχνικά στοιχεία (π.χ. διεύθυνση IP) για λόγους ασφαλείας.',
          ],
          'Ορισμένοι από αυτούς τους παρόχους ενδέχεται να επεξεργάζονται δεδομένα εκτός Ευρωπαϊκής Ένωσης. Σε αυτή την περίπτωση η διαβίβαση γίνεται με τις εγγυήσεις που προβλέπει ο ΓΚΠΔ, όπως οι τυποποιημένες συμβατικές ρήτρες της Ευρωπαϊκής Επιτροπής ή το Πλαίσιο Προστασίας Δεδομένων ΕΕ-ΗΠΑ.',
        ],
      },
      {
        title: 'Για πόσο καιρό τα κρατάμε',
        body: [
          'Κρατάμε την αλληλογραφία για όσο χρειάζεται για να σας απαντήσουμε και, αν δεν προκύψει συνεργασία, έως 2 χρόνια. Αν συνεργαστούμε, τα στοιχεία τηρούνται για όσο διάστημα ορίζει η φορολογική νομοθεσία.',
        ],
      },
      {
        title: 'Cookies και τοπική αποθήκευση',
        body: [
          'Η ιστοσελίδα δεν χρησιμοποιεί cookies. Αποθηκεύει μόνο στον δικό σας browser την προτίμησή σας για φωτεινό ή σκοτεινό θέμα, η οποία δεν μας αποστέλλεται ποτέ. Οι γραμματοσειρές φορτώνονται από τον δικό μας server και όχι από τρίτους, όπως το Google Fonts.',
        ],
      },
      {
        title: 'Τα δικαιώματά σας',
        body: [
          'Έχετε δικαίωμα:',
          [
            'να ενημερωθείτε και να έχετε πρόσβαση στα δεδομένα σας,',
            'να ζητήσετε τη διόρθωση ή τη διαγραφή τους,',
            'να ζητήσετε τον περιορισμό της επεξεργασίας ή να αντιταχθείτε σε αυτήν,',
            'να τα λάβετε σε φορητή μορφή.',
          ],
          `Για να ασκήσετε οποιοδήποτε δικαίωμα, στείλτε μας email στο ${site.email}. Θα σας απαντήσουμε το αργότερο μέσα σε έναν μήνα.`,
          'Αν θεωρείτε ότι η επεξεργασία των δεδομένων σας παραβιάζει τη νομοθεσία, μπορείτε να υποβάλετε καταγγελία στην Αρχή Προστασίας Δεδομένων Προσωπικού Χαρακτήρα (www.dpa.gr) ή στην αρμόδια αρχή της χώρας όπου διαμένετε.',
        ],
      },
      {
        title: 'Ασφάλεια',
        body: [
          'Η ιστοσελίδα λειτουργεί αποκλειστικά μέσω κρυπτογραφημένης σύνδεσης (HTTPS) και η πρόσβαση στα δεδομένα σας περιορίζεται σε όσους τα χρειάζονται για να σας εξυπηρετήσουν.',
        ],
      },
      {
        title: 'Αλλαγές στην πολιτική',
        body: ['Μπορεί να ενημερώνουμε αυτή την πολιτική. Η ημερομηνία της τελευταίας ενημέρωσης αναγράφεται στην κορυφή της σελίδας.'],
      },
    ],
  }
}
