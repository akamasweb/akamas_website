import { revealAllNow } from './hooks/useReveal'

// «Περιήγηση» από την κορυφή της σελίδας ως ένα σημείο της, π.χ. όταν ο επισκέπτης έρχεται από το
// «Θέλω κάτι παρόμοιο» ενός template: περνά από όλο το site και καταλήγει στη φόρμα επικοινωνίας.
// Όλα εμφανίζονται από πριν (χωρίς fade-in, με τις εικόνες ήδη φορτωμένες), ώστε να φαίνονται καθώς περνούν.
// Σταματά αμέσως αν ο επισκέπτης κάνει μόνος του scroll, πατήσει πλήκτρο ή αγγίξει την οθόνη.

const PAUSE = 600 // ms στην κορυφή πριν ξεκινήσει η κίνηση
const PER_SCREEN = 250 // ms ανά ύψος οθόνης διαδρομής (~2 οθόνες το δευτερόλεπτο, ώστε να προλαβαίνει να τα δει)
const MIN_DURATION = 1200
const MAX_DURATION = 6000

// Ήπιο ξεκίνημα και σταμάτημα, χωρίς απότομη επιτάχυνση στη μέση
const easeInOut = (t: number) => (1 - Math.cos(Math.PI * t)) / 2

export function scrollTour(target: HTMLElement) {
  revealAllNow()
  document.querySelectorAll<HTMLImageElement>('img[loading="lazy"]').forEach((img) => {
    img.loading = 'eager'
  })

  // Το σημείο όπου θα σταματήσει: η αρχή της ενότητας, κάτω από το σταθερό header (scroll-padding-top).
  // Υπολογίζεται σε κάθε frame, γιατί η διάταξη μπορεί να αλλάξει λίγο όσο φορτώνουν γραμματοσειρές και εικόνες.
  const offset = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0
  const targetTop = () => target.getBoundingClientRect().top + window.scrollY - offset

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    window.scrollTo({ top: targetTop(), behavior: 'instant' })
    return
  }

  window.scrollTo({ top: 0, behavior: 'instant' })

  const interruptions = ['wheel', 'touchstart', 'keydown', 'pointerdown'] as const
  let timer = 0
  let frame = 0
  const stop = () => {
    clearTimeout(timer)
    cancelAnimationFrame(frame)
    interruptions.forEach((type) => window.removeEventListener(type, stop))
  }
  interruptions.forEach((type) => window.addEventListener(type, stop, { passive: true }))

  timer = window.setTimeout(() => {
    const start = window.scrollY
    const screens = (targetTop() - start) / window.innerHeight
    const duration = Math.min(MAX_DURATION, Math.max(MIN_DURATION, screens * PER_SCREEN))
    const begin = performance.now()
    const step = (now: number) => {
      const t = Math.min(1, (now - begin) / duration)
      window.scrollTo({ top: start + (targetTop() - start) * easeInOut(t), behavior: 'instant' })
      if (t < 1) frame = requestAnimationFrame(step)
      else stop()
    }
    frame = requestAnimationFrame(step)
  }, PAUSE)
}
