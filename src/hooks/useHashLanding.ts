import { useEffect } from 'react'

// Όταν η σελίδα ανοίγει με #ενότητα (π.χ. /#pricing από το μενού της σελίδας απορρήτου),
// πηγαίνει κατευθείαν εκεί: χωρίς το μακρύ smooth scroll από την κορυφή, και και στο npm run dev,
// όπου η ενότητα δεν υπάρχει ακόμα τη στιγμή που ο browser ψάχνει το #.
export function useHashLanding() {
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1))
    const target = id ? document.getElementById(id) : null
    if (!target) return
    const jump = () => target.scrollIntoView({ behavior: 'instant', block: 'start' })
    jump()
    // Οι γραμματοσειρές μπορεί να μετακινήσουν λίγο τη διάταξη όταν φορτώσουν.
    // Διορθώνουμε ξανά, εκτός αν ο επισκέπτης έχει ήδη κάνει scroll μόνος του.
    const landed = window.scrollY
    document.fonts.ready.then(() => {
      if (window.scrollY === landed) jump()
    })
  }, [])
}
