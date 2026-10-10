import { useEffect } from 'react'

const SELECTOR = '[data-reveal]:not(.is-visible)'

// Εμφανίζει σταδιακά όσα στοιχεία έχουν το attribute data-reveal όταν μπαίνουν στην οθόνη.
// Παρακολουθεί και στοιχεία που προστίθενται αργότερα (π.χ. μετά από αλλαγή γλώσσας ή hot reload),
// αλλιώς θα έμεναν αόρατα.
export function useReveal() {
  useEffect(() => {
    if (!('IntersectionObserver' in window)) {
      const showAll = () => document.querySelectorAll(SELECTOR).forEach((el) => el.classList.add('is-visible'))
      showAll()
      const mutations = new MutationObserver(showAll)
      mutations.observe(document.body, { childList: true, subtree: true })
      return () => mutations.disconnect()
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.1 },
    )

    const observeAll = () => document.querySelectorAll(SELECTOR).forEach((el) => observer.observe(el))
    observeAll()

    const mutations = new MutationObserver(observeAll)
    mutations.observe(document.body, { childList: true, subtree: true })

    return () => {
      mutations.disconnect()
      observer.disconnect()
    }
  }, [])
}
