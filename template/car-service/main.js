import '@fontsource-variable/roboto-flex/wdth.css'
import { mountAkamasBadge, setAkamasBadgeLang } from '../_shared/akamas-badge.js'
import { EN, UI, LABOUR_RATE, VAT, SIZES, QUALITY, JOBS, BOOK_JOB, EXTRAS, DEMO_JOB, HOURS, DROP_OFF } from './i18n.js'

const root = document.documentElement
root.classList.add('js')

const $ = (sel, ctx = document) => ctx.querySelector(sel)
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)]
const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches

// ---------- Γλώσσα ----------
// Τα ελληνικά διαβάζονται από το ίδιο το HTML, πριν αλλάξει οτιδήποτε.
const attrPairs = (el) => el.dataset.i18nAttr.split(';').map((p) => p.split(':').map((s) => s.trim()))
const GR = {}
for (const el of $$('[data-i18n]')) GR[el.dataset.i18n] ??= el.textContent
for (const el of $$('[data-i18n-html]')) GR[el.dataset.i18nHtml] ??= el.innerHTML
for (const el of $$('[data-i18n-attr]')) for (const [attr, key] of attrPairs(el)) GR[key] ??= el.getAttribute(attr) ?? ''

let lang = new URLSearchParams(location.search).get('lang') === 'en' ? 'en' : 'el'
const t = (key) => (lang === 'en' ? EN[key] : GR[key]) ?? GR[key] ?? key
const ui = () => UI[lang]

function applyLang(next, initial = false) {
  lang = next
  root.lang = lang
  for (const el of $$('[data-i18n]')) el.textContent = t(el.dataset.i18n)
  for (const el of $$('[data-i18n-html]')) el.innerHTML = t(el.dataset.i18nHtml)
  for (const el of $$('[data-i18n-attr]')) for (const [attr, key] of attrPairs(el)) el.setAttribute(attr, t(key))
  document.title = ui().title
  $('meta[name="description"]')?.setAttribute('content', ui().description)
  for (const b of $$('[data-set-lang]')) b.setAttribute('aria-pressed', String(b.dataset.setLang === lang))
  if (!initial) {
    const url = new URL(location.href)
    if (lang === 'en') url.searchParams.set('lang', 'en')
    else url.searchParams.delete('lang')
    history.replaceState(history.state, '', url)
  }
  setAkamasBadgeLang(lang)
  renderDynamic()
}

for (const b of $$('[data-set-lang]')) {
  b.addEventListener('click', () => b.dataset.setLang !== lang && applyLang(b.dataset.setLang))
}

// ---------- Μορφοποίηση & ημερομηνίες ----------
const money = (n, digits = 0) =>
  new Intl.NumberFormat(ui().locale, { style: 'currency', currency: 'EUR', minimumFractionDigits: digits, maximumFractionDigits: digits }).format(n)
const num = (n, digits = 1) => new Intl.NumberFormat(ui().locale, { maximumFractionDigits: digits }).format(n)
const fmt = (d, opts) => new Intl.DateTimeFormat(ui().locale, opts).format(d)
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1)
const hhmm = (mins) => `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`
const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const fromIso = (s) => {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}
const startOfToday = () => {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}
const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)
const nowMins = () => {
  const d = new Date()
  return d.getHours() * 60 + d.getMinutes()
}
const round2 = (n) => Math.round(n * 100) / 100
const roundUp30 = (m) => Math.ceil(m / 30) * 30

// «σήμερα», «αύριο», «την Τρίτη» κ.λπ.
function dayRef(date) {
  const offset = Math.round((new Date(date.getFullYear(), date.getMonth(), date.getDate()) - startOfToday()) / 864e5)
  return ui().dayRef(offset, date, fmt(date, { weekday: 'long' }))
}

// Διάρκεια εργασίας σε κείμενο: «~45 λεπτά», «~1,5 ώρα», «1 εργάσιμη ημέρα»
function duration(hours) {
  if (hours > 4.75) return ui().wholeDay
  const mins = Math.round((hours * 60) / 15) * 15
  if (mins < 60) return ui().minutes(Math.max(15, mins))
  const h = Math.round(hours * 2) / 2
  return ui().hours(h, num(h))
}

// ---------- Κοστολόγηση: ίδιος υπολογισμός για κάρτες, σημεία, απόδειξη και παρακολούθηση ----------
function estimate(job, size = 'small', quality = 'oe') {
  const j = JOBS[job]
  const s = j.scale === false ? SIZES.small : SIZES[size]
  const parts = j.parts.map(([key, price]) => ({ key, price: round2(price * s.parts * QUALITY[quality]) }))
  const hours = Math.round(j.hours * s.hours * 10) / 10
  const labour = round2(hours * LABOUR_RATE)
  const net = round2(parts.reduce((sum, p) => sum + p.price, 0) + labour)
  const vat = round2(net * VAT)
  return { job, size, quality, parts, hours, labour, net, vat, total: round2(net + vat) }
}
const fromPrice = (job) => Math.round(estimate(job).total)

function renderPrices() {
  for (const el of $$('[data-from]')) el.textContent = money(fromPrice(el.dataset.from))
  for (const el of $$('[data-time]')) el.textContent = duration(estimate(el.dataset.time).hours)
  for (const el of $$('[data-price]')) el.textContent = `${'plus' in el.dataset ? '+' : ''}${money(Number(el.dataset.price))}`
}

// ---------- Header & πλοήγηση ----------
const header = $('[data-header]')
const nav = $('#nav')
const burger = $('[data-burger]')
const isMenuOpen = () => burger.getAttribute('aria-expanded') === 'true'

const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8)
addEventListener('scroll', onScroll, { passive: true })
onScroll()

function setMenu(open, restoreFocus = true) {
  burger.setAttribute('aria-expanded', String(open))
  burger.setAttribute('aria-label', open ? ui().burgerClose : ui().burgerOpen)
  nav.classList.toggle('is-open', open)
  document.body.classList.toggle('menu-open', open)
  if (open) $('a', nav)?.focus()
  else if (restoreFocus) burger.focus()
}

burger.addEventListener('click', () => setMenu(!isMenuOpen()))
nav.addEventListener('click', (e) => e.target.closest('a') && isMenuOpen() && setMenu(false, false))
matchMedia('(min-width: 1181px)').addEventListener('change', () => isMenuOpen() && setMenu(false, false))
document.addEventListener('keydown', (e) => {
  if (!isMenuOpen()) return
  if (e.key === 'Escape') return setMenu(false)
  // Ο κέρσορας μένει μέσα στο ανοιχτό μενού
  if (e.key === 'Tab') {
    const items = $$('a[href], button', header).filter((el) => el.offsetParent !== null)
    const first = items[0]
    const last = items[items.length - 1]
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }
})

// Ενεργός σύνδεσμος πλοήγησης ανάλογα με την ενότητα που φαίνεται
const navLinks = $$('.nav__list a')
if ('IntersectionObserver' in window) {
  const spy = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        for (const a of navLinks) {
          if (a.hash === `#${entry.target.id}`) a.setAttribute('aria-current', 'true')
          else a.removeAttribute('aria-current')
        }
      }
    },
    { rootMargin: '-45% 0px -50% 0px' },
  )
  for (const id of ['top', 'services', 'estimate', 'track', 'kteo', 'booking', 'visit']) {
    const section = document.getElementById(id)
    if (section) spy.observe(section)
  }
}

// ---------- Ωράριο: ανοιχτά / κλειστά και επόμενο ελεύθερο ραντεβού ----------
const statusEl = $('[data-status]')

function renderStatus() {
  const u = ui()
  const now = new Date()
  const mins = nowMins()
  const hours = HOURS[now.getDay()]
  let state = 'closed'
  let text = ''
  if (hours && mins >= hours[0] && mins < hours[1]) {
    state = hours[1] - mins > 60 ? 'open' : 'late'
    text = state === 'open' ? u.openNow(hhmm(hours[1])) : u.closingSoon(hhmm(hours[1]))
  } else {
    for (let i = 0; i < 8; i++) {
      const d = addDays(startOfToday(), i)
      const h = HOURS[d.getDay()]
      if (!h || (i === 0 && mins >= h[0])) continue
      text = u.closedNow(dayRef(d), hhmm(h[0]))
      break
    }
  }
  statusEl.classList.remove('is-open', 'is-late', 'is-closed')
  statusEl.classList.add(`is-${state}`)
  $('[data-status-text]', statusEl).textContent = text

  const slot = nextFreeSlot()
  const next = $('[data-next-slot]', statusEl)
  next.hidden = !slot
  if (slot) {
    const strong = document.createElement('strong')
    strong.textContent = u.slotWhen(dayRef(slot.date), slot.time)
    next.replaceChildren(`${u.nextSlot} `, strong)
  }

  // Σημερινή ημέρα στο ωράριο
  const today = now.getDay()
  for (const row of $$('.hours tr')) {
    const isToday = Number(row.dataset.day) === today
    row.classList.toggle('is-today', isToday)
    $('.hours__today', row)?.remove()
    if (isToday) {
      row.setAttribute('aria-current', 'date')
      const badge = document.createElement('span')
      badge.className = 'hours__today'
      badge.textContent = u.today
      $('th', row).append(badge)
    } else row.removeAttribute('aria-current')
  }
}

// ---------- Hero: αριθμημένα σημεία πάνω στο αυτοκίνητο ----------
const pins = $$('[data-pin]')
const pinOrder = pins.map((p) => p.dataset.pin)
let pinKey = pinOrder[0]
pins.forEach((p, i) => p.style.setProperty('--i', i))

function renderPin() {
  const p = ui().pins[pinKey]
  const e = estimate(pinKey)
  $('[data-pin-num]').textContent = String(pinOrder.indexOf(pinKey) + 1).padStart(2, '0')
  $('[data-pin-title]').textContent = p.title
  $('[data-pin-text]').textContent = p.text
  $('[data-pin-price]').textContent = money(Math.round(e.total))
  $('[data-pin-time]').textContent = duration(e.hours)
  $('[data-pin-link]').dataset.estimate = pinKey
  for (const b of pins) b.setAttribute('aria-pressed', String(b.dataset.pin === pinKey))
}

for (const b of pins) {
  b.addEventListener('click', () => {
    pinKey = b.dataset.pin
    renderPin()
  })
}

// ---------- 02 Κοστολόγηση ----------
const estForm = $('[data-estimator]')
const ticket = $('[data-ticket]')
const [jobSet, sizeSet, partsSet] = $$('fieldset', estForm)
const estValue = (name) => estForm.querySelector(`input[name="${name}"]:checked`)?.value
const currentEstimate = () => estimate(estValue('job'), estValue('size'), estValue('parts'))

function estimateSpec(e) {
  const u = ui()
  const j = JOBS[e.job]
  const spec = [j.scale === false ? u.allCars : u.sizeLabel[e.size]]
  if (j.parts.length) spec.push(u.partsLabel[e.quality])
  return spec.join(' · ')
}

function renderTicket(announce = false) {
  const u = ui()
  const e = currentEstimate()
  const j = JOBS[e.job]
  const jobName = t(`job.${e.job}`)
  const today = new Date()
  const date = $('[data-ticket-date]', ticket)
  date.textContent = fmt(today, { day: 'numeric', month: 'numeric', year: 'numeric' })
  date.dateTime = iso(today)
  $('[data-ticket-job]', ticket).textContent = jobName
  $('[data-ticket-spec]', ticket).textContent = estimateSpec(e)

  const row = (label, amount, cls = '') => {
    const tr = document.createElement('tr')
    if (cls) tr.className = cls
    const td1 = document.createElement('td')
    const td2 = document.createElement('td')
    td1.textContent = label
    td2.textContent = amount
    tr.append(td1, td2)
    return tr
  }
  const rows = e.parts.map((p) => row(u.parts[p.key], money(p.price, 2)))
  if (!rows.length) rows.push(row(u.noParts, '—', 'is-empty'))
  rows.push(row(u.labourLine(u.labourName[e.job] ?? u.labour, num(e.hours), money(LABOUR_RATE)), money(e.labour, 2), 'is-labour'))
  $('[data-ticket-rows]', ticket).replaceChildren(...rows)
  $('[data-ticket-net]', ticket).textContent = money(e.net, 2)
  $('[data-ticket-vat]', ticket).textContent = money(e.vat, 2)
  $('[data-ticket-total]', ticket).textContent = money(e.total, 2)

  $('[data-ticket-duration]', ticket).textContent = duration(e.hours)
  const note = u.jobNote[e.job]?.(money(EXTRAS.kteoEscort))
  $('[data-ticket-note]', ticket).textContent =
    note ?? (e.job === 'clutch' || e.hours > 4.75 ? u.waitLong : e.hours <= 1.5 ? u.waitShort : u.waitDay)

  // Ό,τι δεν επηρεάζει την τιμή απενεργοποιείται
  sizeSet.disabled = j.scale === false
  partsSet.disabled = !j.parts.length
  const same = $('[data-same-price]', estForm)
  same.hidden = j.scale !== false
  same.textContent = u.samePrice

  if (announce) {
    $('[data-ticket-live]', ticket).textContent = u.live(jobName, money(e.total, 2))
    if (!reducedMotion()) {
      ticket.classList.remove('is-updated')
      void ticket.offsetWidth
      ticket.classList.add('is-updated')
    }
  }
}

estForm.addEventListener('change', () => renderTicket(true))
estForm.addEventListener('submit', (e) => e.preventDefault())

// Σύνδεσμοι «Αναλυτικό κόστος»: προεπιλέγουν την εργασία στην κοστολόγηση
for (const link of $$('[data-estimate]')) {
  link.addEventListener('click', () => {
    const radio = $(`input[name="job"][value="${link.dataset.estimate}"]`, estForm)
    if (!radio) return
    radio.checked = true
    renderTicket(true)
  })
}

// ---------- Πινακίδες κυκλοφορίας ----------
// Δεκτά μόνο τα γράμματα που υπάρχουν και στα λατινικά· όσα γράφονται με λατινικά γίνονται ελληνικά.
const LATIN = { A: 'Α', B: 'Β', E: 'Ε', Z: 'Ζ', H: 'Η', I: 'Ι', K: 'Κ', M: 'Μ', N: 'Ν', O: 'Ο', P: 'Ρ', T: 'Τ', Y: 'Υ', X: 'Χ' }
const PLATE_LETTERS = 'ΑΒΕΖΗΙΚΜΝΟΡΤΥΧ'
const PLATE_RE = /^[ΑΒΕΖΗΙΚΜΝΟΡΤΥΧ]{3}-\d{4}$/

function normalizePlate(raw) {
  const clean = raw.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase()
  let letters = ''
  let digits = ''
  for (const ch of clean) {
    const g = LATIN[ch] ?? ch
    if (!digits && letters.length < 3 && PLATE_LETTERS.includes(g)) letters += g
    else if (letters.length === 3 && digits.length < 4 && /\d/.test(ch)) digits += ch
  }
  return digits ? `${letters}-${digits}` : letters
}

for (const input of $$('[data-plate-input]')) {
  input.addEventListener('input', () => {
    // Μορφοποίηση όσο γράφετε, μόνο όταν ο κέρσορας είναι στο τέλος (για να μη «πηδάει»)
    if (input.selectionStart !== input.value.length) return
    const next = normalizePlate(input.value)
    if (next !== input.value) input.value = next
  })
  input.addEventListener('blur', () => (input.value = normalizePlate(input.value)))
}

// ---------- 03 Παρακολούθηση επισκευής (demo) ----------
const job = $('[data-job]')
const lookup = $('[data-lookup]')
const lookupError = $('[data-lookup-error]', lookup)
let approval = 'pending' // 'pending' | 'yes' | 'no'
let approvedAt = 0
let lookupState = ''

// Η εργασία του demo ξεκίνησε σήμερα το πρωί, ή την τελευταία εργάσιμη αν δεν έχουμε ανοίξει ακόμα
function jobDay() {
  const today = startOfToday()
  for (let i = 0; i < 8; i++) {
    const date = addDays(today, -i)
    const hours = HOURS[date.getDay()]
    if (!hours || (i === 0 && nowMins() < hours[0] + 90)) continue
    return { date, hours }
  }
  return { date: today, hours: HOURS[1] }
}

// Πότε θα είναι έτοιμο, αν η δουλειά που μένει θέλει τόσα λεπτά
function readyAfter(minutes) {
  const today = startOfToday()
  for (let i = 0; i < 8; i++) {
    const date = addDays(today, i)
    const hours = HOURS[date.getDay()]
    if (!hours) continue
    const start = i === 0 ? Math.max(nowMins(), hours[0]) : hours[0]
    const end = roundUp30(start + minutes)
    if (end <= hours[1] - 15) return { date, mins: end }
  }
  return { date: today, mins: 12 * 60 }
}

function renderJob() {
  const u = ui()
  const day = jobDay()
  const open = day.hours[0]
  const stamps = [open + 12, open + 65, open + 80]
  $('[data-job-received]', job).textContent = u.received(dayRef(day.date), hhmm(stamps[0]))

  const current = approval === 'pending' ? 3 : approval === 'yes' ? 4 : 5
  const ready = approval === 'pending' ? null : readyAfter(approval === 'yes' ? 90 : 45)
  $$('.stage', job).forEach((li, i) => {
    const n = i + 1
    li.classList.toggle('is-done', n < current)
    li.classList.toggle('is-current', n === current)
    if (n === current) li.setAttribute('aria-current', 'step')
    else li.removeAttribute('aria-current')
    const time = n === 1 ? stamps[0] : n === 2 ? stamps[1] : n === 3 ? (approval === 'pending' ? stamps[2] : approvedAt) : null
    $('.stage__time', li).textContent = time !== null ? hhmm(time) : n === 6 && ready ? hhmm(ready.mins) : ''
  })

  const status = $('.job__status', job)
  status.classList.toggle('is-approved', approval === 'yes')
  status.classList.toggle('is-declined', approval === 'no')
  $('[data-job-status]', job).textContent =
    approval === 'pending' ? u.statusPending : approval === 'yes' ? u.statusApproved : u.statusDeclined
  $('[data-job-eta]', job).textContent = ready ? u.eta(dayRef(ready.date), hhmm(ready.mins)) : u.subPending(dayRef(day.date), hhmm(stamps[2]))

  const box = $('[data-approval]', job)
  box.classList.toggle('is-approved', approval === 'yes')
  box.classList.toggle('is-declined', approval === 'no')
  $('[data-approve-actions]', box).hidden = approval !== 'pending'
  $('[data-approve-done]', box).hidden = approval === 'pending'
  $('[data-approve-done-text]', box).textContent = approval === 'yes' ? u.approvedNote : u.declinedNote

  const base = fromPrice(DEMO_JOB.base)
  const extra = fromPrice(DEMO_JOB.extra)
  $('[data-job-base]', job).textContent = money(base)
  $('[data-approve-price]', job).textContent = money(extra)
  $('[data-job-extra]', job).hidden = approval !== 'yes'
  $('[data-job-extra-price]', job).textContent = money(extra)
  $('[data-job-total]', job).textContent = money(base + (approval === 'yes' ? extra : 0))
}

for (const b of $$('[data-approve]', job)) {
  b.addEventListener('click', () => {
    const choice = b.dataset.approve
    approval = choice === 'undo' ? 'pending' : choice
    approvedAt = nowMins()
    renderJob()
    $(approval === 'pending' ? '[data-approve="yes"]' : '[data-approve="undo"]', job).focus()
  })
}

function renderLookup() {
  const u = ui()
  lookupError.hidden = !lookupState
  job.hidden = Boolean(lookupState)
  if (!lookupState) return
  const msg = { plate: u.lookupPlate, code: u.lookupCode, missing: u.notFound }[lookupState]
  lookupError.textContent = msg
}

lookup.addEventListener('submit', (e) => {
  e.preventDefault()
  const plateInput = lookup.elements.namedItem('plate')
  const codeInput = lookup.elements.namedItem('code')
  const plate = normalizePlate(plateInput.value)
  const code = codeInput.value.replace(/\D/g, '')
  plateInput.value = plate
  codeInput.value = code
  lookupState = !PLATE_RE.test(plate)
    ? 'plate'
    : code.length !== 4
      ? 'code'
      : plate !== DEMO_JOB.plate || code !== DEMO_JOB.code
        ? 'missing'
        : ''
  plateInput.setAttribute('aria-invalid', String(lookupState === 'plate'))
  codeInput.setAttribute('aria-invalid', String(lookupState === 'code'))
  renderLookup()
  if (lookupState) return
  renderJob()
  if (job.getBoundingClientRect().top > innerHeight * 0.6) {
    job.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'start' })
  }
})

// ---------- 04 ΚΤΕΟ ----------
const kForm = $('[data-kteo]')
const kMonth = $('[data-kteo-month]', kForm)
const kYear = $('[data-kteo-year]', kForm)
const kNever = $('[data-kteo-never]', kForm)
const kResult = $('[data-kteo-result]', kForm)

// Προεπιλογή: τελευταίο ΚΤΕΟ πριν από 22 μήνες (ή πρώτη κυκλοφορία πριν από 46), ώστε να «πλησιάζει»
function kteoDefault(never) {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth() - (never ? 46 : 22), 1)
}

function fillKteoSelects(reset = false) {
  const now = new Date()
  const chosen = reset ? kteoDefault(kNever.checked) : new Date(Number(kYear.value) || now.getFullYear(), Number(kMonth.value) || 0, 1)
  // Με έτος, για να βγει η ονομαστική («Οκτώβριος» και όχι «Οκτωβρίου»)· μετά αφαιρείται το έτος
  const monthName = (m) => cap(fmt(new Date(2001, m, 1), { month: 'long', year: 'numeric' }).replace('2001', '').trim())
  kMonth.replaceChildren(...Array.from({ length: 12 }, (_, m) => new Option(monthName(m), String(m))))
  const span = kNever.checked ? 6 : 12
  kYear.replaceChildren(...Array.from({ length: span + 1 }, (_, i) => String(now.getFullYear() - i)).map((y) => new Option(y, y)))
  kMonth.value = String(chosen.getMonth())
  kYear.value = String(Math.min(now.getFullYear(), Math.max(now.getFullYear() - span, chosen.getFullYear())))
}

function renderKteo() {
  const u = ui()
  $('[data-kteo-legend]', kForm).textContent = kNever.checked ? u.legendFirst : u.legendLast
  const now = new Date()
  const current = now.getFullYear() * 12 + now.getMonth()
  const base = Number(kYear.value) * 12 + Number(kMonth.value)
  const due = base + (kNever.checked ? 48 : 24)
  const future = base > current
  const diff = due - current
  const state = future ? '' : diff < 0 ? 'overdue' : diff <= 3 ? 'soon' : 'ok'
  kResult.classList.toggle('is-soon', state === 'soon')
  kResult.classList.toggle('is-overdue', state === 'overdue')
  $('[data-kteo-date]', kResult).textContent = future ? '—' : cap(fmt(new Date(Math.floor(due / 12), due % 12, 1), { month: 'long', year: 'numeric' }))
  $('[data-kteo-rel]', kResult).textContent = future ? '' : u.rel(diff)
  $('[data-kteo-msg]', kResult).textContent = { '': u.kteoFuture, ok: u.kteoOk, soon: u.kteoSoon, overdue: u.kteoOverdue }[state]
  const progress = future ? 0 : Math.min(1, Math.max(0, (current - base) / (due - base)))
  kResult.style.setProperty('--p', `${(progress * 100).toFixed(1)}%`)
}

kNever.addEventListener('change', () => {
  fillKteoSelects(true)
  renderKteo()
})
kMonth.addEventListener('change', renderKteo)
kYear.addEventListener('change', renderKteo)
kForm.addEventListener('submit', (e) => e.preventDefault())

// ---------- 05 Ραντεβού (demo: δεν στέλνει τίποτα) ----------
const form = $('[data-booking]')
const field = (name) => form.elements.namedItem(name)
const daysWrap = $('[data-days]', form)
const timeLabels = $$('.time', form)
const errorBox = $('[data-error-summary]', form)
const attachedBox = $('[data-attached]', form)
const done = $('[data-done]')
const radioValue = (name) => form.querySelector(`input[name="${name}"]:checked`)?.value ?? ''
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
let attempted = false
let lastBooking = null
let attachedEstimate = null

// Οι επόμενες 6 ημέρες που είμαστε ανοιχτά, από αύριο
function bookingDays() {
  const days = []
  for (let d = addDays(startOfToday(), 1); days.length < 6; d = addDays(d, 1)) if (HOURS[d.getDay()]) days.push(d)
  return days
}

// Ψεύτικη διαθεσιμότητα: κάποιες ώρες είναι κλεισμένες, διαφορετικές ανά ημέρα (η τελευταία μένει πάντα ελεύθερη)
const slotTaken = (date, i) => i < DROP_OFF.length - 1 && ((date.getDate() * 7 + date.getMonth() * 3 + i * 5) % 4 === 0 || (date.getDate() + i) % 5 === 1)
const freeSlots = (date) => DROP_OFF.filter((_, i) => !slotTaken(date, i))

function nextFreeSlot() {
  for (const date of bookingDays()) {
    const time = freeSlots(date)[0]
    if (time) return { date, time }
  }
  return null
}

function renderDays() {
  const checked = radioValue('day')
  daysWrap.innerHTML = bookingDays()
    .map((d) => {
      const value = iso(d)
      const free = ui().dayFree(freeSlots(d).length)
      return `<label class="day"><input type="radio" name="day" value="${value}" aria-label="${cap(fmt(d, { weekday: 'long', day: 'numeric', month: 'long' }))}, ${free}"${value === checked ? ' checked' : ''}><span class="day__box" aria-hidden="true"><span class="day__wd">${fmt(d, { weekday: 'short' }).replace('.', '')}</span><span class="day__num">${d.getDate()}</span><span class="day__free">${free}</span></span></label>`
    })
    .join('')
}

function updateSlots() {
  const date = bookingDays().find((d) => iso(d) === radioValue('day'))
  timeLabels.forEach((label, i) => {
    const input = $('input', label)
    const taken = date ? slotTaken(date, i) : false
    input.disabled = taken
    if (taken) input.checked = false
    input.setAttribute('aria-label', taken ? `${input.value}, ${ui().slotTakenSr}` : input.value)
    $('[data-slot-state]', label).textContent = date ? (taken ? ui().slotTaken : ui().slotFree) : ''
  })
}

function renderAttached() {
  attachedBox.hidden = !attachedEstimate
  if (!attachedEstimate) return
  const { job: key, size, quality } = attachedEstimate
  const e = estimate(key, size, quality)
  $('[data-attached-text]', attachedBox).textContent = ui().attached(t(`job.${key}`), estimateSpec(e), money(e.total, 2))
}

function setError(id, message, inputs) {
  const p = document.getElementById(id)
  p.textContent = message
  p.hidden = !message
  for (const input of inputs) input.setAttribute('aria-invalid', String(Boolean(message)))
  return message ? { id, message, target: inputs[0] } : null
}

function validate() {
  const e = ui().errors
  const plate = field('plate')
  const phone = field('phone').value.trim()
  const digits = phone.replace(/\D/g, '')
  const phoneOk = /^[\d\s()+.-]+$/.test(phone) && digits.length >= 10 && digits.length <= 13
  const email = field('email').value.trim()
  const jobs = $$('input[name="jobs"]', form)
  const times = $$('input[name="time"]:not(:disabled)', form)
  return [
    setError('err-plate', PLATE_RE.test(normalizePlate(plate.value)) ? '' : e.plate, [plate]),
    setError('err-model', field('model').value.trim().length >= 2 ? '' : e.model, [field('model')]),
    setError('err-jobs', jobs.some((j) => j.checked) ? '' : e.jobs, jobs),
    setError('err-day', radioValue('day') ? '' : e.day, $$('input[name="day"]', form)),
    setError('err-time', radioValue('time') ? '' : e.time, times.length ? times : $$('input[name="time"]', form)),
    setError('err-name', field('name').value.trim().length >= 3 ? '' : e.name, [field('name')]),
    setError('err-phone', phoneOk ? '' : e.phone, [field('phone')]),
    setError('err-email', !email || EMAIL_RE.test(email) ? '' : e.email, [field('email')]),
  ].filter(Boolean)
}

function renderErrorSummary(errors) {
  errorBox.hidden = !errors.length
  errorBox.replaceChildren()
  if (!errors.length) return
  const title = document.createElement('p')
  title.textContent = ui().errorSummary(errors.length)
  const list = document.createElement('ul')
  for (const err of errors) {
    const li = document.createElement('li')
    const a = document.createElement('a')
    a.href = `#${err.id}`
    a.textContent = err.message
    a.addEventListener('click', (ev) => {
      ev.preventDefault()
      err.target?.focus()
    })
    li.append(a)
    list.append(li)
  }
  errorBox.append(title, list)
}

form.addEventListener('change', (e) => {
  if (e.target.name === 'day') updateSlots()
  if (attempted) renderErrorSummary(validate())
})

form.addEventListener('input', (e) => {
  if (attempted && e.target.matches('input[type="text"], input[type="tel"], input[type="email"]')) renderErrorSummary(validate())
})

form.addEventListener('submit', (e) => {
  e.preventDefault()
  attempted = true
  field('plate').value = normalizePlate(field('plate').value)
  const errors = validate()
  renderErrorSummary(errors)
  if (errors.length) {
    errorBox.focus()
    return
  }
  lastBooking = {
    plate: field('plate').value,
    model: field('model').value.trim(),
    jobs: $$('input[name="jobs"]:checked', form).map((i) => i.value),
    day: radioValue('day'),
    time: radioValue('time'),
    pickup: field('pickup').checked,
    courtesy: field('courtesy').checked,
    phone: field('phone').value.trim(),
    estimate: attachedEstimate,
    ref: `#${String(Math.floor(1000 + Math.random() * 9000))}`,
  }
  renderDone()
  form.hidden = true
  done.hidden = false
  done.scrollIntoView({ block: 'start', behavior: reducedMotion() ? 'auto' : 'smooth' })
  done.focus({ preventScroll: true })
})

function renderDone() {
  const b = lastBooking
  if (!b) return
  const u = ui()
  const r = u.receipt
  $('[data-done-text]', done).textContent = u.doneText(b.phone)
  const rows = [
    [r.ref, b.ref],
    [r.car, `${b.plate} · ${b.model}`],
    [r.jobs, b.jobs.map((j) => t(`bj.${j}`)).join(', ')],
    [r.when, `${cap(fmt(fromIso(b.day), { weekday: 'long', day: 'numeric', month: 'long' }))}, ${b.time}`],
  ]
  if (b.estimate) {
    const e = estimate(b.estimate.job, b.estimate.size, b.estimate.quality)
    rows.push([r.estimate, `${t(`job.${e.job}`)} · ${money(e.total, 2)}`])
  }
  const extras = []
  if (b.pickup) extras.push(u.pickupDone(money(EXTRAS.pickup)))
  if (b.courtesy) extras.push(u.courtesyDone)
  if (extras.length) rows.push([r.extras, extras.join(', ')])
  $('[data-done-receipt]', done).replaceChildren(
    ...rows.map(([label, value]) => {
      const row = document.createElement('div')
      const dt = document.createElement('dt')
      const dd = document.createElement('dd')
      dt.textContent = label
      dd.textContent = value
      row.append(dt, dd)
      return row
    }),
  )
}

$('[data-done-reset]', done).addEventListener('click', () => {
  form.reset()
  attempted = false
  lastBooking = null
  attachedEstimate = null
  for (const p of $$('.field__error', form)) p.hidden = true
  for (const el of $$('[aria-invalid]', form)) el.removeAttribute('aria-invalid')
  renderErrorSummary([])
  renderAttached()
  renderDays()
  updateSlots()
  done.hidden = true
  form.hidden = false
  field('plate').focus()
})

// «Κλείστε ραντεβού με αυτή την τιμή»: η προσφορά επισυνάπτεται στη φόρμα
$('[data-book-estimate]').addEventListener('click', () => {
  const e = currentEstimate()
  attachedEstimate = { job: e.job, size: e.size, quality: e.quality }
  const chip = $(`input[name="jobs"][value="${BOOK_JOB[e.job]}"]`, form)
  if (chip) chip.checked = true
  renderAttached()
  if (attempted) renderErrorSummary(validate())
})

$('[data-attached-remove]', form).addEventListener('click', () => {
  attachedEstimate = null
  renderAttached()
  ;($('input[name="jobs"]:checked', form) ?? $('input[name="jobs"]', form)).focus()
})

// Σύνδεσμοι που προεπιλέγουν εργασία στη φόρμα (π.χ. «Κλείστε προέλεγχο»)
for (const link of $$('[data-book]')) {
  link.addEventListener('click', () => {
    const chip = $(`input[name="jobs"][value="${link.dataset.book}"]`, form)
    if (chip) chip.checked = true
    if (attempted) renderErrorSummary(validate())
  })
}

// ---------- Μπάρα κλήσης στο κινητό: κρύβεται όσο γράφετε ----------
const callbar = $('[data-callbar]')
const typing = (el) => el?.matches?.('input[type="text"], input[type="tel"], input[type="email"], textarea, select')
document.addEventListener('focusin', (e) => callbar.classList.toggle('is-hidden', typing(e.target)))
document.addEventListener('focusout', () => callbar.classList.remove('is-hidden'))

// ---------- Ό,τι εξαρτάται από τη γλώσσα και την ώρα ----------
function renderDynamic() {
  burger.setAttribute('aria-label', isMenuOpen() ? ui().burgerClose : ui().burgerOpen)
  renderPrices()
  renderPin()
  renderTicket()
  renderJob()
  renderLookup()
  fillKteoSelects()
  renderKteo()
  renderDays()
  updateSlots()
  renderAttached()
  renderStatus()
  if (attempted && !form.hidden) renderErrorSummary(validate())
  renderDone()
}

setInterval(() => {
  renderStatus()
  renderJob()
}, 60_000)

// ---------- Εμφάνιση στο scroll ----------
const revealEls = $$('[data-reveal]')
for (const group of ['.svc', '.quote']) {
  $$(group).forEach((el, i) => el.style.setProperty('--d', `${(i % 4) * 70}ms`))
}
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        entry.target.classList.add('is-in')
        io.unobserve(entry.target)
      }
    },
    { rootMargin: '0px 0px -6% 0px', threshold: 0.06 },
  )
  revealEls.forEach((el) => io.observe(el))
} else {
  revealEls.forEach((el) => el.classList.add('is-in'))
}

$('[data-year]').textContent = new Date().getFullYear()

// ---------- Εκκίνηση ----------
fillKteoSelects(true)
mountAkamasBadge(lang)
applyLang(lang, true)
root.classList.remove('lang-pending')
