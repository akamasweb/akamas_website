import '@fontsource-variable/geologica'
import '@fontsource-variable/comfortaa'
import { mountAkamasBadge, setAkamasBadgeLang } from '../_shared/akamas-badge.js'
import { EN, UI, CLASSES, PRICES } from './i18n.js'

const root = document.documentElement
root.classList.add('js')

const $ = (sel, ctx = document) => ctx.querySelector(sel)
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)]
const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches

// ---------- Γλώσσα ----------
const attrPairs = (el) => el.dataset.i18nAttr.split(';').map((p) => p.split(':').map((s) => s.trim()))
const GR = {}
for (const el of $$('[data-i18n]')) GR[el.dataset.i18n] ??= el.textContent
for (const el of $$('[data-i18n-html]')) GR[el.dataset.i18nHtml] ??= el.innerHTML
for (const el of $$('[data-i18n-attr]')) for (const [attr, key] of attrPairs(el)) GR[key] ??= el.getAttribute(attr) ?? ''

const params = new URLSearchParams(location.search)
let lang = params.get('lang') === 'en' ? 'en' : 'el'
// Για ποιον ψάχνει ο επισκέπτης: όλη η σελίδα προσαρμόζεται (και μοιράζεται ως ?for=kids)
let aud = ['adults', 'kids'].includes(params.get('for')) ? params.get('for') : 'all'
const t = (key) => (lang === 'en' ? EN[key] : GR[key]) ?? GR[key] ?? key
const ui = () => UI[lang]

function syncUrl() {
  const url = new URL(location.href)
  if (lang === 'en') url.searchParams.set('lang', 'en')
  else url.searchParams.delete('lang')
  if (aud !== 'all') url.searchParams.set('for', aud)
  else url.searchParams.delete('for')
  history.replaceState(history.state, '', url)
}

function applyLang(next, initial = false) {
  lang = next
  root.lang = lang
  for (const el of $$('[data-i18n]')) el.textContent = t(el.dataset.i18n)
  for (const el of $$('[data-i18n-html]')) el.innerHTML = t(el.dataset.i18nHtml)
  for (const el of $$('[data-i18n-attr]')) for (const [attr, key] of attrPairs(el)) el.setAttribute(attr, t(key))
  document.title = ui().title
  $('meta[name="description"]')?.setAttribute('content', ui().description)
  for (const b of $$('[data-set-lang]')) b.setAttribute('aria-pressed', String(b.dataset.setLang === lang))
  if (!initial) syncUrl()
  setAkamasBadgeLang(lang)
  renderDynamic()
}

for (const b of $$('[data-set-lang]')) {
  b.addEventListener('click', () => b.dataset.setLang !== lang && applyLang(b.dataset.setLang))
}

const round2 = (n) => Math.round(n * 100) / 100
const money = (n) => {
  const v = round2(n)
  return new Intl.NumberFormat(ui().locale, {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: v % 1 ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(v)
}
const fmt = (d, opts) => new Intl.DateTimeFormat(ui().locale, opts).format(d)
const startOfToday = () => {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}
const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)
const nowMins = () => new Date().getHours() * 60 + new Date().getMinutes()
const toMins = (s) => {
  const [h, m] = s.split(':').map(Number)
  return h * 60 + m
}

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

const onScroll = () => header.classList.toggle('is-scrolled', scrollY > 8)
addEventListener('scroll', onScroll, { passive: true })
onScroll()

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
  for (const id of ['top', 'classes', 'pilates', 'kids', 'schedule', 'prices', 'wellness', 'trial', 'faq', 'visit']) {
    const section = document.getElementById(id)
    if (section) spy.observe(section)
  }
}

// ---------- Εβδομαδιαίο πρόγραμμα (διαβάζεται από το HTML) ----------
const SLOTS = $$('[data-slot]').map((el) => ({
  el,
  cls: el.dataset.cls,
  aud: el.dataset.aud,
  day: Number(el.dataset.day),
  start: toMins(el.dataset.start),
  end: toMins(el.dataset.end),
  startText: el.dataset.start,
  endText: el.dataset.end,
  ages: el.dataset.ages ? el.dataset.ages.split('-').map(Number) : null,
}))
const forAud = (s) => aud === 'all' || s.aud === aud

// Οι επόμενες φορές (από τώρα) που γίνονται τα μαθήματα που περνούν το φίλτρο
function occurrences(filter, days = 14) {
  const now = new Date()
  const today = startOfToday()
  const out = []
  for (let i = 0; i < days; i++) {
    const d = addDays(today, i)
    for (const s of SLOTS) {
      if (s.day !== d.getDay() || !filter(s)) continue
      const at = new Date(d.getFullYear(), d.getMonth(), d.getDate(), Math.floor(s.start / 60), s.start % 60)
      if (at > now) out.push({ slot: s, at, inDays: i })
    }
  }
  return out.sort((a, b) => a.at - b.at)
}

function whenText(o) {
  if (o.inDays === 0) return ui().whenToday(o.slot.startText)
  if (o.inDays === 1) return ui().whenTomorrow(o.slot.startText)
  return ui().whenDay(o.at, fmt(o.at, { weekday: 'long' }), o.slot.startText)
}

function currentSlot(filter) {
  const today = new Date().getDay()
  const m = nowMins()
  return SLOTS.find((s) => filter(s) && s.day === today && m >= s.start && m < s.end)
}

// Κάθε «πόρτα» του hero δείχνει το τρέχον ή το επόμενο μάθημα για το κοινό της
function renderNext() {
  for (const el of $$('[data-door-next]')) {
    const mine = (s) => s.aud === el.dataset.doorNext
    const live = currentSlot(mine)
    const next = occurrences(mine, 8)[0]
    el.textContent = live ? ui().doorNow(ui().cls[live.cls], live.endText) : next ? ui().doorNext(ui().cls[next.slot.cls], whenText(next)) : ''
    el.hidden = !el.textContent
    el.classList.toggle('is-live', Boolean(live))
  }
}

function renderTimetable() {
  const today = new Date().getDay()
  const live = currentSlot(forAud)
  const next = live ? null : occurrences(forAud, 8)[0]?.slot
  for (const day of $$('.tt__day')) {
    const isToday = Number(day.dataset.day) === today
    day.classList.toggle('is-today', isToday)
    $('.tt__today', day)?.remove()
    if (isToday) {
      const badge = document.createElement('span')
      badge.className = 'tt__today'
      badge.textContent = ui().today
      $('.tt__name', day).append(badge)
    }
  }
  for (const s of SLOTS) {
    s.el.classList.toggle('is-dim', !forAud(s))
    s.el.classList.toggle('is-live', s === live)
    s.el.classList.toggle('is-next', s === next)
    $('.slot__badge', s.el)?.remove()
    if (s === live || s === next) {
      const badge = document.createElement('span')
      badge.className = 'slot__badge'
      badge.textContent = s === live ? ui().nowBadge : ui().nextBadge
      s.el.prepend(badge)
    }
  }
}
setInterval(() => {
  renderNext()
  renderTimetable()
}, 60_000)

// ---------- Για ποιον: όλη η σελίδα προσαρμόζεται ----------
const classCards = $$('[data-classes] > li')
function renderClasses() {
  for (const li of classCards) li.hidden = !(aud === 'all' || li.dataset.aud.split(' ').includes(aud))
  for (const el of $$('[data-count]')) {
    const k = el.dataset.count
    el.textContent = classCards.filter((li) => k === 'all' || li.dataset.aud.split(' ').includes(k)).length
  }
}

function setAud(next, initial = false) {
  aud = next
  root.dataset.aud = aud
  for (const b of $$('button[data-set-aud]')) b.setAttribute('aria-pressed', String(b.dataset.setAud === aud))
  for (const door of $$('[data-door]')) door.classList.toggle('is-active', door.dataset.door === aud)
  renderClasses()
  renderTimetable()
  renderNext()
  if (aud !== 'all') {
    setCalcTab(aud)
    if (!classSelect.value && doneEl.hidden) setWho(aud)
  }
  if (!initial) syncUrl()
}

// Κουμπιά φίλτρου και σύνδεσμοι των «πορτών» (οι σύνδεσμοι συνεχίζουν κανονικά προς την ενότητά τους)
for (const b of $$('[data-set-aud]')) b.addEventListener('click', () => b.dataset.setAud !== aud && setAud(b.dataset.setAud))

// ---------- «Πάρτε μια ανάσα»: 3 αναπνοές, εισπνοή 4″ / εκπνοή 6″ ----------
const breath = $('[data-breath]')
const breathBtn = $('[data-breath-btn]', breath)
const breathPhase = $('[data-breath-phase]', breath)
const breathSec = $('[data-breath-sec]', breath)
const BREATH = [4, 6]
let breathState = { status: 'idle', phase: null, n: 0 }
let breathTimer = 0
let breathTick = 0

function renderBreath() {
  const b = ui().breath
  const { status, phase, n } = breathState
  breath.dataset.state = status
  breath.dataset.phase = phase ?? ''
  breathBtn.textContent = status === 'running' ? b.stop : status === 'done' ? b.again : b.start
  breathPhase.textContent = status === 'running' ? b[phase](n) : status === 'done' ? b.done : b.ready
}

function stopBreath(status = 'idle') {
  clearTimeout(breathTimer)
  clearInterval(breathTick)
  breathSec.textContent = ''
  breathState = { status, phase: null, n: 0 }
  renderBreath()
}

function runBreath() {
  const steps = [1, 2, 3].flatMap((n) => [
    ['in', BREATH[0], n],
    ['out', BREATH[1], n],
  ])
  let k = 0
  const step = () => {
    if (k >= steps.length) return stopBreath('done')
    const [phase, secs, n] = steps[k++]
    breath.style.setProperty('--breath-dur', `${secs}s`)
    breathState = { status: 'running', phase, n }
    renderBreath()
    let left = secs
    breathSec.textContent = left
    clearInterval(breathTick)
    breathTick = setInterval(() => {
      left -= 1
      breathSec.textContent = left > 0 ? left : ''
    }, 1000)
    breathTimer = setTimeout(step, secs * 1000)
  }
  step()
}

breathBtn.addEventListener('click', () => (breathState.status === 'running' ? stopBreath() : runBreath()))

// ---------- Ηλικιολόγος: ποιο πρόγραμμα ταιριάζει στην ηλικία του παιδιού ----------
const ageRange = $('[data-age-range]')
const ageRows = $$('.agerow')
const agesEl = $('[data-ages]')

function renderAge() {
  const a = Number(ageRange.value)
  $('[data-age-num]').textContent = ui().ageNum(a)
  $('[data-age-unit]').textContent = ui().ageUnit(a)
  ageRange.setAttribute('aria-valuetext', ui().ageText(a))
  ageRange.style.setProperty('--fill', `${((a - Number(ageRange.min)) / (Number(ageRange.max) - Number(ageRange.min))) * 100}%`)
  agesEl.style.setProperty('--age', Math.min(a, 12.5))
  const names = []
  for (const row of ageRows) {
    const match = a >= Number(row.dataset.from) && a < Number(row.dataset.until)
    row.classList.toggle('is-match', match)
    if (match) names.push(ui().cls[row.dataset.prog])
  }
  $('[data-age-result]').textContent = ui().ageResult(a, names)
}
ageRange.addEventListener('input', renderAge)

// ---------- Υπολογισμός τιμής ----------
const calc = $('[data-calc]')
const calcPanels = { adults: $('[data-calc-panel="adults"]', calc), kids: $('[data-calc-panel="kids"]', calc) }
let calcTab = 'adults'
const checkedIn = (form, name) => form.querySelector(`input[name="${name}"]:checked`)?.value

function setCalcTab(tab) {
  calcTab = tab
  for (const b of $$('[data-calc-tab]', calc)) b.setAttribute('aria-pressed', String(b.dataset.calcTab === tab))
  calcPanels.adults.hidden = tab !== 'adults'
  calcPanels.kids.hidden = tab !== 'kids'
  renderCalc()
}

function renderCalc() {
  const out = {
    price: $('[data-calc-price]', calc),
    unit: $('[data-calc-unit]', calc),
    per: $('[data-calc-per]', calc),
    save: $('[data-calc-save]', calc),
    note: $('[data-calc-note]', calc),
  }
  const u = ui()
  let price
  let per
  let save = ''
  let note = ''
  let quarterly
  if (calcTab === 'adults') {
    const f = calcPanels.adults
    const n = Number(checkedIn(f, 'n'))
    quarterly = checkedIn(f, 'period') === 'q'
    const reduced = f.elements.namedItem('reduced').checked
    const family = f.elements.namedItem('family').checked
    const row = PRICES.adults[n]
    const base = row[quarterly ? 2 : 0]
    const red = row[quarterly ? 3 : 1]
    const fam = round2(base * (1 - PRICES.familyDiscount))
    price = base
    if (reduced && family) {
      price = Math.min(red, fam)
      note = `${u.bestOf} ${price === red ? u.reducedApplied : u.familyApplied}`
    } else if (reduced) {
      price = red
      note = u.reducedApplied
    } else if (family) {
      price = fam
      note = u.familyApplied
    }
    const classes = n * (quarterly ? 3 : 1)
    per = u.perClass(money(price / classes), classes)
    save = u.save(money(classes * PRICES.dropIn - price))
  } else {
    const f = calcPanels.kids
    const p = PRICES.kids[checkedIn(f, 'prog')]
    const two = checkedIn(f, 'kids') === '2'
    quarterly = checkedIn(f, 'period') === 'q'
    const i = quarterly ? 1 : 0
    price = (two ? p.two : p.one)[i]
    const classes = 4 * (quarterly ? 3 : 1)
    per = u.perClassKid(money(price / classes / (two ? 2 : 1)), classes)
    if (two) save = u.siblingsApplied(money(p.one[i] * 2 - price))
    else if (p.dropIn) save = u.save(money(classes * p.dropIn - price))
  }
  out.price.textContent = money(price)
  out.unit.textContent = quarterly ? u.perQuarter : u.perMonth
  out.per.textContent = per
  out.save.textContent = save
  out.save.hidden = !save
  out.note.textContent = note
  out.note.hidden = !note
}

for (const b of $$('[data-calc-tab]', calc)) b.addEventListener('click', () => setCalcTab(b.dataset.calcTab))
for (const f of Object.values(calcPanels)) {
  f.addEventListener('change', renderCalc)
  f.addEventListener('submit', (e) => e.preventDefault())
}

// ---------- Δοκιμαστικό μάθημα (demo: δεν στέλνει τίποτα) ----------
const booking = $('[data-booking]')
const form = $('[data-trial-form]', booking)
const doneEl = $('[data-booking-done]', booking)
const classSelect = $('[data-class-select]', form)
const ageSelect = form.elements.namedItem('age')
const sessionsEl = $('[data-sessions]', form)
const errors = {}
let lastBooking = null

const who = () => checkedIn(form, 'who') ?? 'adults'
const kidAge = () => (who() === 'kids' && ageSelect.value ? Number(ageSelect.value) : null)
const half = (n) => String(n).replace('.5', '½')
const rangeText = (r) => `${half(r[0])}–${half(r[1])}`

function setWho(value) {
  const radio = $(`input[name="who"][value="${value}"]`, form)
  if (radio && !radio.checked) {
    radio.checked = true
    renderBookingForm()
  }
}

function renderClassOptions() {
  const keep = classSelect.value
  const list = Object.keys(CLASSES).filter((k) => CLASSES[k].aud === who())
  classSelect.innerHTML =
    `<option value="">${t('bk.choose')}</option>` + list.map((k) => `<option value="${k}">${ui().cls[k]}</option>`).join('')
  classSelect.value = list.includes(keep) ? keep : ''
}

function sessionsFor(cls) {
  const age = kidAge()
  return occurrences((s) => s.cls === cls && (!age || !s.ages || (age >= s.ages[0] && age <= s.ages[1]))).slice(0, 4)
}

function renderSessions() {
  const cls = classSelect.value
  const checked = checkedIn(form, 'when')
  const field = $('[data-session-field]', form)
  if (!cls) {
    sessionsEl.innerHTML = `<p class="field__hint">${ui().pickClass}</p>`
    return
  }
  const hasSlots = SLOTS.some((s) => s.cls === cls)
  const list = hasSlots ? sessionsFor(cls) : []
  field.classList.toggle('is-open', !hasSlots)
  if (!list.length) {
    sessionsEl.innerHTML = `<p class="field__hint">${hasSlots ? ui().noSessionsAge : ui().noSessions}</p>`
    return
  }
  sessionsEl.innerHTML = list
    .map((o) => {
      const value = `${o.at.toISOString()}`
      const day = fmt(o.at, { weekday: 'short' }).replace('.', '')
      const date = fmt(o.at, { day: 'numeric', month: 'short' }).replace('.', '')
      const full = `${fmt(o.at, { weekday: 'long', day: 'numeric', month: 'long' })}, ${o.slot.startText}${o.slot.ages ? ` · ${rangeText(o.slot.ages)}` : ''}`
      const ages = o.slot.ages ? `<small>${rangeText(o.slot.ages)}</small>` : ''
      return `<label class="session"><input type="radio" name="when" value="${value}" data-day="${o.slot.day}" data-start="${o.slot.startText}" aria-label="${full}"${value === checked ? ' checked' : ''}><span aria-hidden="true"><b>${day}</b><span>${date}</span><strong>${o.slot.startText}</strong>${ages}</span></label>`
    })
    .join('')
}

function renderCost() {
  const cls = classSelect.value
  const el = $('[data-cost-value]', form)
  if (who() === 'kids') el.textContent = ui().costFree
  else if (cls && CLASSES[cls].deposit) el.textContent = ui().costAerial(money(PRICES.trialAdult))
  else el.textContent = ui().costAdult(money(PRICES.trialAdult))
}

function renderBookingForm() {
  const kids = who() === 'kids'
  $('[data-kid-only]', form).hidden = !kids
  $('[data-label-name]', form).textContent = kids ? ui().nameKid : ui().nameAdult
  renderClassOptions()
  renderSessions()
  renderCost()
}

function showError(field, key, ...args) {
  if (key) errors[field] = [key, ...args]
  else delete errors[field]
  const ids = { age: 'bk-age', cls: 'bk-class', name: 'bk-name', phone: 'bk-phone' }
  const p = field === 'when' ? $('[data-when-err]', form) : document.getElementById(`${ids[field]}-err`)
  const msg = ui().errors[key]
  p.textContent = key ? (typeof msg === 'function' ? msg(...args) : msg) : ''
  p.hidden = !key
  const input = ids[field] && document.getElementById(ids[field])
  if (input) input.setAttribute('aria-invalid', String(Boolean(key)))
}

function validate(moveFocus = true) {
  const firstBad = []
  const bad = (field, key, el, ...args) => {
    showError(field, key, ...args)
    firstBad.push(el)
  }
  const kids = who() === 'kids'
  const cls = classSelect.value
  const age = kidAge()
  if (kids && !age) bad('age', 'age', ageSelect)
  else showError('age', '')
  if (!cls) bad('cls', 'cls', classSelect)
  else if (kids && age && CLASSES[cls].ages && (age < CLASSES[cls].ages[0] || age > CLASSES[cls].ages[1]))
    bad('cls', 'ageRange', classSelect, ui().cls[cls], rangeText(CLASSES[cls].ages))
  else showError('cls', '')
  const needsWhen = cls && SLOTS.some((s) => s.cls === cls) && $('input[name="when"]', form)
  if (needsWhen && !checkedIn(form, 'when')) bad('when', 'when', $('input[name="when"]', form))
  else showError('when', '')
  const name = form.elements.namedItem('name')
  if (name.value.trim().length < 3) bad('name', 'name', name)
  else showError('name', '')
  const phone = form.elements.namedItem('phone')
  const digits = phone.value.replace(/\D/g, '')
  if (!/^[\d\s()+.-]+$/.test(phone.value.trim()) || digits.length < 10 || digits.length > 13) bad('phone', 'phone', phone)
  else showError('phone', '')
  if (moveFocus) firstBad[0]?.focus()
  return !firstBad.length
}

form.addEventListener('change', (e) => {
  const name = e.target.name
  if (name === 'who') renderBookingForm()
  if (name === 'cls' || name === 'age') {
    renderSessions()
    renderCost()
  }
  if (Object.keys(errors).length) validateQuiet()
})
form.addEventListener('input', (e) => {
  if (errors[e.target.name]) validateQuiet()
})

// Διορθώνει ήδη εμφανή λάθη καθώς ο χρήστης συμπληρώνει, χωρίς να μετακινεί την εστίαση
function validateQuiet() {
  const shown = new Set(Object.keys(errors))
  validate(false)
  for (const field of Object.keys(errors)) if (!shown.has(field)) showError(field, '')
}

form.addEventListener('submit', (e) => {
  e.preventDefault()
  if (!validate()) return
  const whenInput = $('input[name="when"]:checked', form)
  lastBooking = {
    name: form.elements.namedItem('name').value.trim().split(/\s+/)[0],
    cls: classSelect.value,
    who: who(),
    at: whenInput ? new Date(whenInput.value) : null,
    day: whenInput ? Number(whenInput.dataset.day) : null,
    start: whenInput?.dataset.start,
  }
  renderDone()
  form.hidden = true
  doneEl.hidden = false
  doneEl.focus({ preventScroll: true })
  const top = booking.getBoundingClientRect().top
  if (top < 0 || top > innerHeight * 0.5) booking.scrollIntoView({ block: 'start', behavior: reducedMotion() ? 'auto' : 'smooth' })
})

function renderDone() {
  if (!lastBooking) {
    $('[data-done-title]', doneEl).textContent = ''
    $('[data-done-text]', doneEl).textContent = ''
    return
  }
  const b = lastBooking
  const u = ui()
  const cls = u.cls[b.cls]
  $('[data-done-title]', doneEl).textContent = u.doneTitle(b.name)
  let text
  if (b.at) {
    const inDays = Math.round((new Date(b.at).setHours(0, 0, 0, 0) - startOfToday()) / 864e5)
    text = u.doneSlot(cls, whenText({ at: b.at, inDays, slot: { startText: b.start } }))
  } else text = u.doneCall(cls)
  const pay =
    b.who === 'kids' ? u.donePayKid : CLASSES[b.cls].deposit ? u.donePayAerial(money(PRICES.trialAdult)) : u.donePayAdult(money(PRICES.trialAdult))
  $('[data-done-text]', doneEl).textContent = `${text} ${pay}`
}

function resetBooking() {
  form.reset()
  lastBooking = null
  for (const field of ['age', 'cls', 'when', 'name', 'phone']) showError(field, '')
  doneEl.hidden = true
  form.hidden = false
  renderBookingForm()
}
$('[data-booking-again]', doneEl).addEventListener('click', () => {
  resetBooking()
  $('input[name="who"]:checked', form).focus()
})

// «Δοκιμαστικό» από τις πόρτες του hero: προσαρμόζει τη σελίδα και ανοίγει τη φόρμα για τον σωστό
for (const a of $$('[data-trial-for]')) {
  a.addEventListener('click', (e) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return
    e.preventDefault()
    const target = a.dataset.trialFor
    if (target !== aud) setAud(target)
    if (!doneEl.hidden) resetBooking()
    setWho(target)
    booking.scrollIntoView({ block: 'start', behavior: reducedMotion() ? 'auto' : 'smooth' })
    ;(target === 'kids' && !ageSelect.value ? ageSelect : classSelect).focus({ preventScroll: true })
    history.replaceState(history.state, '', `${location.pathname}${location.search}#trial`)
  })
}

// Κάρτες μαθημάτων & ώρες του προγράμματος: προσυμπληρώνουν τη φόρμα
document.addEventListener('click', (e) => {
  const trigger = e.target.closest('[data-book], [data-slot]')
  if (!trigger || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return
  const isSlot = trigger.hasAttribute('data-slot')
  const cls = isSlot ? trigger.dataset.cls : trigger.dataset.book
  if (!CLASSES[cls]) return
  e.preventDefault()
  if (!doneEl.hidden) resetBooking()
  const slotAges = isSlot && trigger.dataset.ages ? trigger.dataset.ages.split('-').map(Number) : null
  setWho(CLASSES[cls].aud)
  // Παιδική ώρα με συγκεκριμένη ηλικιακή ομάδα: αν η ηλικία δεν ταιριάζει, αδειάζει
  if (slotAges && kidAge() && (kidAge() < slotAges[0] || kidAge() > slotAges[1])) ageSelect.value = ''
  classSelect.value = cls
  for (const field of ['cls', 'when']) showError(field, '')
  renderSessions()
  renderCost()
  if (isSlot) {
    const radio = $(`input[name="when"][data-day="${trigger.dataset.day}"][data-start="${trigger.dataset.start}"]`, form)
    if (radio) radio.checked = true
  }
  booking.scrollIntoView({ block: 'start', behavior: reducedMotion() ? 'auto' : 'smooth' })
  const firstEmpty = who() === 'kids' && !ageSelect.value ? ageSelect : !checkedIn(form, 'when') && $('input[name="when"]', form) ? $('input[name="when"]', form) : form.elements.namedItem('name')
  firstEmpty.focus({ preventScroll: true })
  history.replaceState(history.state, '', `${location.pathname}${location.search}#trial`)
})

// ---------- Ό,τι εξαρτάται από γλώσσα / ώρα ----------
function renderDynamic() {
  burger.setAttribute('aria-label', isMenuOpen() ? ui().burgerClose : ui().burgerOpen)
  renderPrices()
  renderNext()
  renderTimetable()
  renderBreath()
  renderAge()
  renderCalc()
  const keepClass = classSelect.value
  const keepWhen = checkedIn(form, 'when')
  renderBookingForm()
  classSelect.value = keepClass
  renderSessions()
  if (keepWhen) {
    const radio = $(`input[name="when"][value="${keepWhen}"]`, form)
    if (radio) radio.checked = true
  }
  renderCost()
  for (const [field, [key, ...args]] of Object.entries(errors)) showError(field, key, ...args)
  renderDone()
}

// ---------- Εμφάνιση στο scroll ----------
const revealEls = $$('[data-reveal]')
for (const group of ['.classes > li', '.benefit', '.flow__step', '.tip', '.event']) {
  $$(group).forEach((el, i) => (el.style.transitionDelay = `${(i % 4) * 70}ms`))
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
mountAkamasBadge(lang)
setAud(aud, true)
applyLang(lang, true)
root.classList.remove('lang-pending')
