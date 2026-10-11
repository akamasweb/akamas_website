// Κρατάει τη θέση του επισκέπτη όταν αλλάζει η γλώσσα: την ίδια ενότητα και το ίδιο ύψος μέσα της.
// Η θέση μετριέται ως ποσοστό της ενότητας, γιατί τα κείμενα έχουν διαφορετικό μήκος σε κάθε γλώσσα.

export type Position = { id: string; ratio: number }

// Το σημείο αμέσως κάτω από το σταθερό header
function probeLine() {
  return (document.querySelector('.header')?.getBoundingClientRect().bottom ?? 0) + 1
}

export function capturePosition(): Position | null {
  const probe = probeLine()
  const current = [...document.querySelectorAll<HTMLElement>('main section[id], main article[id]')]
    .filter((el) => el.getBoundingClientRect().top <= probe)
    .pop()
  if (!current) return null
  const rect = current.getBoundingClientRect()
  return { id: current.id, ratio: Math.min(1, Math.max(0, (probe - rect.top) / rect.height)) }
}

export function restorePosition(position: Position | null) {
  if (!position) return
  const el = document.getElementById(position.id)
  if (!el) return
  const top = el.getBoundingClientRect().top + window.scrollY + position.ratio * el.offsetHeight - probeLine()
  window.scrollTo({ top: Math.max(0, top), behavior: 'instant' })
}
