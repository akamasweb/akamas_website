import '@fontsource-variable/sofia-sans-extra-condensed'
import '@fontsource-variable/sofia-sans'
import '@fontsource/bona-nova/400-italic.css'
import { mountAkamasBadge, setAkamasBadgeLang } from '../_shared/akamas-badge.js'
import { EN, UI, SERVICES, BARBER_SEED, HOURS } from './i18n.js'

const root = document.documentElement
root.classList.add('js')

const $ = (sel, ctx = document) => ctx.querySelector(sel)
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)]

// ---------- Γλώσσα ----------
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

const money = (n) => new Intl.NumberFormat(ui().locale, { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)
const fmt = (d, opts) => new Intl.DateTimeFormat(ui().locale, opts).format(d)
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1)
const hhmm = (mins) => `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`
const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const startOfToday = () => {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}
const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)

function renderPrices() {
  for (const el of $$('[data-price]')) el.textContent = money(Number(el.dataset.price))
}

// ---------- Header & πλοήγηση ----------
const header = $('[data-header]')
const nav = $('#nav')
const burger = $('[data-burger]')
const isMenuOpen = () => burger.getAttribute('aria-expanded') === 'true'

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
matchMedia('(min-width: 1121px)').addEventListener('change', () => isMenuOpen() && setMenu(false, false))
document.addEventListener('keydown', (e) => {
  if (!isMenuOpen()) return
  if (e.key === 'Escape') return setMenu(false)
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
  for (const id of ['services', 'barbers', 'styles', 'shop', 'visit']) {
    const section = document.getElementById(id)
    if (section) spy.observe(section)
  }
}

// ---------- Walk-ins: ανοιχτά ή κλειστά με βάση την ώρα του επισκέπτη ----------
function renderWalkin() {
  const now = new Date()
  const mins = now.getHours() * 60 + now.getMinutes()
  const hours = HOURS[now.getDay()]
  const el = $('[data-walkin]')
  let state = 'closed'
  let text = ''
  if (hours && mins >= hours[0] && mins < hours[1]) {
    if (hours[1] - mins > 60) {
      state = 'open'
      text = ui().walkOpen(10 + ((now.getHours() * 7 + now.getDay() * 3) % 5) * 5)
    } else {
      state = 'late'
      text = ui().walkLate
    }
  } else {
    // Επόμενο άνοιγμα (σήμερα αργότερα ή επόμενη ανοιχτή μέρα)
    for (let i = 0; i < 8; i++) {
      const d = addDays(startOfToday(), i)
      const h = HOURS[d.getDay()]
      if (!h || (i === 0 && mins >= h[0])) continue
      text = ui().walkClosed(ui().opensWhen(i, d, fmt(d, { weekday: 'long' }), hhmm(h[0])))
      break
    }
  }
  el.classList.remove('is-open', 'is-closed', 'is-late')
  el.classList.add(`is-${state}`)
  $('[data-walkin-text]', el).textContent = text

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
      badge.textContent = ui().today
      $('th', row).append(badge)
    } else row.removeAttribute('aria-current')
  }
}
setInterval(renderWalkin, 60_000)

// ---------- Κράτηση σε 5 βήματα (demo: δεν στέλνει τίποτα) ----------
const booker = $('[data-booker]')
const form = $('[data-booking-form]', booker)
const stepSets = $$('[data-step]', form)
const indicators = $$('[data-step-ind]', booker)
const backBtn = $('[data-back]', form)
const nextBtn = $('[data-next]', form)
const submitBtn = $('[data-submit]', form)
const statusEl = $('[data-step-status]', form)
const daysWrap = $('[data-days]', form)
const timesWrap = $('[data-times]', form)
const grid = $('.booker__grid', booker)
const done = $('[data-booking-done]', booker)
const summary = $('.summary', booker)
const value = (name) => form.querySelector(`input[name="${name}"]:checked`)?.value ?? ''
let step = 1
let lastBooking = null
const stepErrors = {}

// Οι επόμενες 7 ημέρες από σήμερα
function bookingDays() {
  const today = startOfToday()
  const nowMins = new Date().getHours() * 60 + new Date().getMinutes()
  return Array.from({ length: 7 }, (_, i) => {
    const date = addDays(today, i)
    const hours = HOURS[date.getDay()]
    const open = Boolean(hours) && !(i === 0 && nowMins > hours[1] - 60)
    return { i, date, hours, open }
  })
}

function renderDays() {
  const checked = value('day')
  daysWrap.innerHTML = bookingDays()
    .map(({ i, date, open }) => {
      const label = i === 0 ? ui().today : i === 1 ? ui().tomorrow : fmt(date, { weekday: 'short' }).replace('.', '')
      const full = cap(fmt(date, { weekday: 'long', day: 'numeric', month: 'long' })) + (open ? '' : `, ${ui().closedSr}`)
      const v = iso(date)
      return `<label class="opt opt--day"><input type="radio" name="day" value="${v}" aria-label="${full}"${open ? '' : ' disabled'}${v === checked && open ? ' checked' : ''}><span class="opt__body" aria-hidden="true"><span class="opt__wd">${label}</span><span class="opt__day">${date.getDate()}</span><span class="opt__mon">${open ? fmt(date, { month: 'short' }).replace('.', '') : ui().closed}</span></span></label>`
    })
    .join('')
}

// Ψεύτικη διαθεσιμότητα: κάθε barber έχει κλεισμένες ώρες, διαφορετικές κάθε μέρα
function slotsFor(dayValue) {
  const day = bookingDays().find((d) => iso(d.date) === dayValue)
  if (!day || !day.open) return []
  const service = SERVICES[value('service')] ?? { min: 30 }
  const barber = value('barber') || 'any'
  const nowMins = new Date().getHours() * 60 + new Date().getMinutes()
  const slots = []
  for (let m = day.hours[0], k = 0; m + service.min <= day.hours[1]; m += 30, k++) {
    const h = (day.date.getDate() * 31 + k * 17 + BARBER_SEED[barber] * 7 + day.date.getMonth() * 11) % 100
    const past = day.i === 0 && m <= nowMins + 30
    slots.push({ m, taken: past || h < (barber === 'any' ? 12 : 36) })
  }
  return slots
}

function renderTimes() {
  const dayValue = value('day')
  const checked = value('time')
  const slots = slotsFor(dayValue)
  const day = bookingDays().find((d) => iso(d.date) === dayValue)
  $('[data-times-context]', form).textContent = day
    ? `${cap(fmt(day.date, { weekday: 'long', day: 'numeric', month: 'long' }))} · ${ui().barbers[value('barber') || 'any']}`
    : ''
  if (!slots.some((s) => !s.taken)) {
    timesWrap.innerHTML = `<p class="bstep__hint">${ui().noTimes}</p>`
    return
  }
  const groups = { morning: [], afternoon: [], evening: [] }
  for (const s of slots) groups[s.m < 12 * 60 ? 'morning' : s.m < 15 * 60 ? 'afternoon' : 'evening'].push(s)
  timesWrap.innerHTML = Object.entries(groups)
    .filter(([, list]) => list.length)
    .map(
      ([key, list]) => `
      <div class="times-group">
        <p class="times-group__label">${ui().groups[key]}</p>
        <div class="times-group__grid">${list
          .map((s) => {
            const time = hhmm(s.m)
            return `<label class="opt opt--time"><input type="radio" name="time" value="${time}"${s.taken ? ` disabled aria-label="${time}, ${ui().taken}"` : ''}${time === checked && !s.taken ? ' checked' : ''}><span class="opt__body" aria-hidden="${s.taken}">${time}</span></label>`
          })
          .join('')}</div>
      </div>`,
    )
    .join('')
}

function renderSummary() {
  const service = value('service')
  const barber = value('barber')
  const dayValue = value('day')
  const time = value('time')
  const day = bookingDays().find((d) => iso(d.date) === dayValue)
  const set = (key, text) => ($(`[data-sum="${key}"]`, summary).textContent = text || '—')
  set('service', service && ui().services[service])
  set('barber', barber && ui().barbers[barber])
  set('day', day && cap(fmt(day.date, { weekday: 'short', day: 'numeric', month: 'short' }).replace('.', '')))
  set('time', time)
  set('duration', service && `${SERVICES[service].min}′`)
  set('price', service && money(SERVICES[service].price))
  $('[data-mini]', form).textContent = [
    service && ui().services[service],
    barber && ui().barbers[barber],
    day && fmt(day.date, { weekday: 'short', day: 'numeric', month: 'short' }).replace('.', ''),
    time,
    service && money(SERVICES[service].price),
  ]
    .filter(Boolean)
    .join(' · ')
}

function showStepError(n, key) {
  stepErrors[n] = key
  const p = $('[data-step-error]', stepSets[n - 1])
  if (!p) return
  p.textContent = key ? ui().errors[key] : ''
  p.hidden = !key
}

function validateStep(n) {
  const need = { 1: ['service', 'service'], 2: ['barber', 'barber'], 3: ['day', 'day'], 4: ['time', 'time'] }[n]
  if (need) {
    const ok = Boolean(value(need[0]))
    showStepError(n, ok ? '' : need[1])
    return ok
  }
  // Βήμα 5: όνομα και κινητό
  const name = form.elements.namedItem('name')
  const phone = form.elements.namedItem('phone')
  const nameOk = name.value.trim().length >= 2
  const digits = phone.value.replace(/\D/g, '')
  const phoneOk = /^[\d\s()+.-]+$/.test(phone.value.trim()) && digits.length >= 10 && digits.length <= 13
  const setField = (input, ok, key) => {
    const err = document.getElementById(`${input.id}-err`)
    err.textContent = ok ? '' : ui().errors[key]
    err.hidden = ok
    input.setAttribute('aria-invalid', String(!ok))
  }
  setField(name, nameOk, 'name')
  setField(phone, phoneOk, 'phone')
  if (!nameOk) name.focus()
  else if (!phoneOk) phone.focus()
  stepErrors[5] = nameOk && phoneOk ? '' : 'fields'
  return nameOk && phoneOk
}

function goTo(n, focus = true) {
  step = n
  stepSets.forEach((fs, i) => (fs.hidden = i + 1 !== n))
  indicators.forEach((li, i) => {
    li.classList.toggle('is-done', i + 1 < n)
    if (i + 1 === n) li.setAttribute('aria-current', 'step')
    else li.removeAttribute('aria-current')
  })
  backBtn.hidden = n === 1
  nextBtn.hidden = n === 5
  submitBtn.hidden = n !== 5
  if (n === 3) renderDays()
  if (n === 4) renderTimes()
  statusEl.textContent = ui().stepStatus(n, ui().stepLabels[n - 1])
  if (focus) {
    const legend = $('.bstep__title', stepSets[n - 1])
    legend.focus({ preventScroll: true })
    const top = booker.getBoundingClientRect().top
    if (top < 0 || top > innerHeight * 0.4) {
      booker.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' })
    }
  }
}

nextBtn.addEventListener('click', () => validateStep(step) && goTo(step + 1))
backBtn.addEventListener('click', () => goTo(step - 1))

form.addEventListener('change', (e) => {
  const name = e.target.name
  if (['service', 'barber', 'day'].includes(name)) {
    // Αλλάζει η διαθεσιμότητα: η ώρα που είχε επιλεγεί μπορεί να μην ισχύει πια
    const time = form.querySelector('input[name="time"]:checked')
    if (time) time.checked = false
  }
  if (name && stepErrors[step]) showStepError(step, '')
  renderSummary()
})

// Enter σε πεδίο κειμένου: προχωράει στο επόμενο βήμα αντί να «στείλει» τη φόρμα
form.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && e.target.matches('input[type="radio"]') && step < 5) {
    e.preventDefault()
    nextBtn.click()
  }
})

form.addEventListener('submit', (e) => {
  e.preventDefault()
  if (step !== 5) return validateStep(step) && goTo(step + 1)
  if (!validateStep(5)) return
  lastBooking = {
    name: form.elements.namedItem('name').value.trim().split(/\s+/)[0],
    service: value('service'),
    barber: value('barber'),
    day: value('day'),
    time: value('time'),
  }
  renderDone()
  grid.hidden = true
  $('.steps', booker).hidden = true
  done.hidden = false
  done.focus({ preventScroll: true })
  booker.scrollIntoView({ block: 'start' })
})

function renderDone() {
  if (!lastBooking) {
    $('[data-done-title]', done).textContent = ui().doneDefault
    return
  }
  const b = lastBooking
  const date = bookingDays().find((d) => iso(d.date) === b.day)?.date ?? new Date(b.day)
  const when = ui().whenText(date, fmt(date, { weekday: 'long', day: 'numeric', month: 'long' }))
  const service = ui().services[b.service]
  $('[data-done-title]', done).textContent = ui().doneTitle(b.name)
  $('[data-done-text]', done).textContent = ui().doneText(
    when,
    b.time,
    ui().barberWith[b.barber],
    service.charAt(0).toLocaleLowerCase(ui().locale) + service.slice(1),
    money(SERVICES[b.service].price),
  )
}

$('[data-booking-again]', done).addEventListener('click', () => {
  form.reset()
  lastBooking = null
  for (const el of $$('[aria-invalid]', form)) el.removeAttribute('aria-invalid')
  for (const el of $$('.field__error', form)) el.hidden = true
  for (let n = 1; n <= 4; n++) showStepError(n, '')
  done.hidden = true
  grid.hidden = false
  $('.steps', booker).hidden = false
  renderSummary()
  goTo(1)
})

// Σύνδεσμοι «Κράτηση» / «Ζητήστε το»: προεπιλέγουν υπηρεσία και πάνε στο βήμα 2
for (const link of $$('[data-book-service]')) {
  link.addEventListener('click', (e) => {
    const radio = $(`input[name="service"][value="${link.dataset.bookService}"]`, form)
    if (!radio || !done.hidden) return
    e.preventDefault()
    radio.checked = true
    showStepError(1, '')
    renderSummary()
    booker.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' })
    goTo(2, false)
    $('.bstep__title', stepSets[1]).focus({ preventScroll: true })
  })
}

// ---------- Ό,τι εξαρτάται από γλώσσα / ώρα ----------
function renderDynamic() {
  burger.setAttribute('aria-label', isMenuOpen() ? ui().burgerClose : ui().burgerOpen)
  renderPrices()
  renderWalkin()
  if (step === 3) renderDays()
  if (step === 4) renderTimes()
  renderSummary()
  statusEl.textContent = ''
  for (let n = 1; n <= 4; n++) if (stepErrors[n]) showStepError(n, stepErrors[n])
  if (stepErrors[5]) validateStep(5)
  renderDone()
}

// ---------- Εμφάνιση στο scroll ----------
const revealEls = $$('[data-reveal]')
for (const group of ['.barber', '.look', '.product', '.quote']) {
  $$(group).forEach((el, i) => (el.style.transitionDelay = `${(i % 4) * 80}ms`))
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
goTo(1, false)
mountAkamasBadge(lang)
applyLang(lang, true)
root.classList.remove('lang-pending')
