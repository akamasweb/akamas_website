import '@fontsource-variable/noto-serif-display'
import '@fontsource-variable/noto-serif-display/wght-italic.css'
import '@fontsource/ibm-plex-sans/400.css'
import '@fontsource/ibm-plex-sans/500.css'
import '@fontsource/ibm-plex-sans/600.css'
import { mountAkamasBadge, setAkamasBadgeLang } from '../_shared/akamas-badge.js'
import { EN, UI, DEADLINES } from './i18n.js'

const root = document.documentElement
root.classList.add('js')

const $ = (sel, ctx = document) => ctx.querySelector(sel)
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)]

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
  b.addEventListener('click', () => {
    if (b.dataset.setLang !== lang) applyLang(b.dataset.setLang)
  })
}

// ---------- Ημερομηνίες ----------
const today = new Date()
today.setHours(0, 0, 0, 0)
const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)
const diffDays = (a, b) => Math.round((b - a) / 864e5)
const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const fmt = (d, opts) => new Intl.DateTimeFormat(ui().locale, opts).format(d)
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1)

// ---------- Header & μενού ----------
const header = $('[data-header]')
const nav = $('#site-nav')
const menuBtn = $('[data-menu-btn]')
const menuLabel = $('[data-menu-label]')
const desktopNav = matchMedia('(min-width: 1181px)')
const isMenuOpen = () => menuBtn.getAttribute('aria-expanded') === 'true'

const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8)
addEventListener('scroll', onScroll, { passive: true })
onScroll()

function setMenu(open, restoreFocus = true) {
  menuBtn.setAttribute('aria-expanded', String(open))
  nav.classList.toggle('is-open', open)
  document.body.classList.toggle('menu-open', open)
  menuLabel.textContent = open ? ui().menuClose : ui().menuOpen
  if (open) $('a', nav)?.focus()
  else if (restoreFocus) menuBtn.focus()
}

menuBtn.addEventListener('click', () => setMenu(!isMenuOpen()))
nav.addEventListener('click', (e) => {
  if (e.target.closest('a') && isMenuOpen()) setMenu(false, false)
})
desktopNav.addEventListener('change', () => isMenuOpen() && setMenu(false, false))
document.addEventListener('keydown', (e) => {
  if (!isMenuOpen()) return
  if (e.key === 'Escape') {
    setMenu(false)
    return
  }
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
const navLinks = $$('[data-nav]')
if ('IntersectionObserver' in window) {
  const spy = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        for (const a of navLinks) {
          if (a.dataset.nav === entry.target.id) a.setAttribute('aria-current', 'true')
          else a.removeAttribute('aria-current')
        }
      }
    },
    { rootMargin: '-45% 0px -50% 0px' },
  )
  for (const a of navLinks) {
    const section = document.getElementById(a.dataset.nav)
    if (section) spy.observe(section)
  }
}

// ---------- 01 Υπηρεσίες: καρτέλες σε μεγάλες οθόνες, accordion στο κινητό ----------
const practice = $('[data-practice]')
const tablist = $('[role="tablist"]', practice)
const tabs = $$('[role="tab"]', tablist)
const practiceItems = $$('.practice__item', practice)
const tabsQuery = matchMedia('(min-width: 960px)')
let selectedKey = 'accounting'
const openKeys = new Set(['accounting'])

function renderPractice() {
  const tabsMode = tabsQuery.matches
  practice.classList.toggle('practice--tabs', tabsMode)
  tablist.hidden = !tabsMode
  for (const item of practiceItems) {
    const key = item.dataset.key
    const panel = $('.practice__panel', item)
    const toggle = $('.practice__toggle', item)
    if (tabsMode) {
      panel.setAttribute('role', 'tabpanel')
      panel.setAttribute('aria-labelledby', `tab-${key}`)
      panel.tabIndex = 0
      panel.hidden = false
      item.hidden = key !== selectedKey
    } else {
      panel.setAttribute('role', 'region')
      panel.setAttribute('aria-labelledby', `acc-${key}`)
      panel.removeAttribute('tabindex')
      item.hidden = false
      toggle.setAttribute('aria-expanded', String(openKeys.has(key)))
      panel.hidden = !openKeys.has(key)
    }
  }
  for (const tab of tabs) {
    const on = tab.dataset.key === selectedKey
    tab.setAttribute('aria-selected', String(on))
    tab.tabIndex = on ? 0 : -1
  }
}

function selectPractice(key, focusTab = false) {
  selectedKey = key
  openKeys.add(key)
  renderPractice()
  if (focusTab) tabs.find((tab) => tab.dataset.key === key)?.focus()
}

tablist.addEventListener('click', (e) => {
  const tab = e.target.closest('[role="tab"]')
  if (tab) selectPractice(tab.dataset.key)
})

tablist.addEventListener('keydown', (e) => {
  const i = tabs.indexOf(document.activeElement)
  if (i < 0) return
  const moves = { ArrowDown: i + 1, ArrowRight: i + 1, ArrowUp: i - 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }
  if (!(e.key in moves)) return
  e.preventDefault()
  selectPractice(tabs[(moves[e.key] + tabs.length) % tabs.length].dataset.key, true)
})

for (const item of practiceItems) {
  $('.practice__toggle', item).addEventListener('click', () => {
    const key = item.dataset.key
    if (openKeys.has(key)) openKeys.delete(key)
    else {
      openKeys.add(key)
      selectedKey = key
    }
    renderPractice()
  })
}

tabsQuery.addEventListener('change', renderPractice)
renderPractice()

// Σύνδεσμοι του footer προς συγκεκριμένη υπηρεσία
for (const link of $$('[data-practice-link]')) {
  link.addEventListener('click', (e) => {
    const key = link.dataset.practiceLink
    selectPractice(key)
    if (!tabsQuery.matches) {
      e.preventDefault()
      const toggle = $(`#acc-${key}`)
      toggle.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
      toggle.focus({ preventScroll: true })
    }
  })
}

// ---------- Hero: μηνιαία αναφορά ----------
function renderReport() {
  const month = new Date(today.getFullYear(), today.getMonth() - 1, 1)
  $('[data-report-period]').textContent = cap(fmt(month, { month: 'long', year: 'numeric' }))
  $$('[data-report-months] text').forEach((text, i) => {
    const m = new Date(month.getFullYear(), month.getMonth() - 11 + i, 1)
    text.textContent = fmt(m, { month: 'narrow' }).toUpperCase()
  })
}

// ---------- 06 Ημερολόγιο υποχρεώσεων ----------
// Παραδειγματικές προθεσμίες· αν πέσουν Σαββατοκύριακο, μεταφέρονται στη Δευτέρα.
const deadlines = DEADLINES.map((item) => {
  let date = addDays(today, item.offset)
  if (date.getDay() === 6) date = addDays(date, 2)
  else if (date.getDay() === 0) date = addDays(date, 1)
  return { ...item, date, days: diffDays(today, date) }
}).sort((a, b) => a.days - b.days)

const dlRoot = $('[data-deadlines]')
const dlList = $('[data-dl-list]', dlRoot)
const dlTimeline = $('[data-dl-timeline]', dlRoot)
const dlStatus = $('[data-dl-status]', dlRoot)
const filterBtns = $$('[data-filter]', dlRoot)
const DL_LIMIT = 6
let dlFilter = 'all'
let dlExpanded = false

// «Όλες οι υποχρεώσεις»: η λίστα δείχνει αρχικά τις 6 πιο κοντινές
const dlMore = document.createElement('button')
dlMore.type = 'button'
dlMore.className = 'dl__more'
dlMore.setAttribute('aria-controls', 'dl-list')
dlList.id = 'dl-list'
dlList.after(dlMore)
dlMore.addEventListener('click', () => {
  dlExpanded = !dlExpanded
  renderDeadlines()
  if (dlExpanded) dlList.children[DL_LIMIT]?.querySelector('.dl__title')?.scrollIntoView({ block: 'nearest' })
})

function renderDeadlines() {
  const todayEl = $('[data-dl-today]', dlRoot)
  todayEl.textContent = fmt(today, { weekday: 'long', day: 'numeric', month: 'long' })
  todayEl.dateTime = iso(today)

  const visible = deadlines.filter((d) => dlFilter === 'all' || d.groups.includes(dlFilter))
  const shown = dlExpanded ? visible : visible.slice(0, DL_LIMIT)
  dlList.innerHTML = shown.length
    ? shown
        .map(
          (d, i) => `
      <li class="dl__item${d.days <= 7 ? ' is-soon' : ''}" style="--i:${i}">
        <time class="dl__date" datetime="${iso(d.date)}"><span class="dl__day">${d.date.getDate()}</span><span class="dl__mon">${fmt(d.date, { month: 'short' }).replace('.', '')}</span></time>
        <div>
          <p class="dl__title">${d[lang].title}</p>
          <p class="dl__meta">${cap(fmt(d.date, { weekday: 'long' }))} · ${d[lang].meta}</p>
        </div>
        <span class="dl__in">${cap(ui().inDays(d.days))}</span>
      </li>`,
        )
        .join('')
    : `<li class="dl__empty">${ui().empty}</li>`
  dlMore.hidden = visible.length <= DL_LIMIT
  dlMore.setAttribute('aria-expanded', String(dlExpanded))
  dlMore.innerHTML = `<span>${dlExpanded ? ui().showLess : ui().showAll(visible.length)}</span><svg aria-hidden="true" focusable="false"><use href="#i-arrow"/></svg>`

  const within = visible.filter((d) => d.days <= 30)
  $('[data-dl-count]', dlRoot).textContent = within.length
  $('[data-dl-count-label]', dlRoot).textContent = ui().countLabel(within.length)
  const nearest = visible[0]
  $('[data-dl-next]', dlRoot).textContent = nearest ? nearest.days : '–'
  $('[data-dl-next-label]', dlRoot).textContent = ui().nextLabel(nearest ? nearest.days : 0)

  // Χρονολόγιο: μια γραμμή με τις επόμενες εβδομάδες και μια κουκκίδα ανά προθεσμία
  const span = Math.max(30, deadlines[deadlines.length - 1].days + 3)
  const pos = (n) => `${((n / span) * 100).toFixed(3)}%`
  let html = '<span class="tl__axis"></span>'
  let labels = 0
  for (let n = 0; n <= span; n++) {
    const date = addDays(today, n)
    const monday = date.getDay() === 1
    html += `<span class="tl__tick${monday ? ' tl__tick--week' : ''}" style="left:${pos(n)}"></span>`
    if (monday && n > 3 && n < span - 2) {
      html += `<span class="tl__label${labels++ % 2 ? ' tl__label--minor' : ''}" style="left:${pos(n)}">${date.getDate()}/${date.getMonth() + 1}</span>`
    }
  }
  html += `<span class="tl__today" style="left:0"><span>${ui().tlToday}</span></span>`
  for (const d of deadlines) {
    html += `<span class="tl__dot${d.days <= 7 ? ' is-soon' : ''}${visible.includes(d) ? '' : ' is-off'}" style="left:${pos(d.days)}"></span>`
  }
  dlTimeline.innerHTML = html

  // Κάρτα «επόμενη προθεσμία» στο hero
  const next = deadlines[0]
  $('[data-next-title]').textContent = next[lang].title
  $('[data-next-when]').textContent = `${cap(ui().inDays(next.days))} · ${fmt(next.date, { weekday: 'long', day: 'numeric', month: 'long' })}`
}

for (const btn of filterBtns) {
  btn.addEventListener('click', () => {
    dlFilter = btn.dataset.filter
    for (const b of filterBtns) b.setAttribute('aria-pressed', String(b === btn))
    renderDeadlines()
    const count = deadlines.filter((d) => dlFilter === 'all' || d.groups.includes(dlFilter)).length
    dlStatus.textContent = ui().status(count)
  })
}

// ---------- 07 Φόρμα ραντεβού (demo: δεν στέλνει τίποτα) ----------
const form = $('[data-booking]')
const field = (name) => form.elements.namedItem(name)
const daysWrap = $('[data-days]', form)
const slotLabels = $$('.slot', form)
const summaryEl = $('[data-summary]', form)
const errorBox = $('[data-error-summary]', form)
const success = $('[data-success]')
let attempted = false
let lastBooking = null

// Οι επόμενες 8 εργάσιμες ημέρες, από αύριο
const workdays = []
for (let d = addDays(today, 1); workdays.length < 8; d = addDays(d, 1)) {
  if (d.getDay() !== 0 && d.getDay() !== 6) workdays.push(d)
}
const dayByIso = (value) => workdays.find((d) => iso(d) === value)
const radioValue = (name) => form.querySelector(`input[name="${name}"]:checked`)?.value ?? ''

function renderDays() {
  const checked = radioValue('day')
  daysWrap.innerHTML = workdays
    .map((d) => {
      const value = iso(d)
      return `<label class="day"><input type="radio" name="day" value="${value}" aria-describedby="err-day" aria-label="${fmt(d, { weekday: 'long', day: 'numeric', month: 'long' })}"${value === checked ? ' checked' : ''}><span class="day__box" aria-hidden="true"><span class="day__wd">${fmt(d, { weekday: 'short' }).replace('.', '')}</span><span class="day__num">${d.getDate()}</span><span class="day__mon">${fmt(d, { month: 'short' }).replace('.', '')}</span></span></label>`
    })
    .join('')
}

// Ψεύτικη διαθεσιμότητα: μερικές ώρες εμφανίζονται κλεισμένες, διαφορετικές ανά ημέρα
function updateSlots() {
  const index = workdays.findIndex((d) => iso(d) === radioValue('day'))
  slotLabels.forEach((label, i) => {
    const input = $('input', label)
    const taken = index >= 0 && ((index * 7 + i * 3) % 5 === 0 || (index + i) % 4 === 3)
    input.disabled = taken
    if (taken) input.checked = false
    $('[data-slot-state]', label).textContent = index < 0 ? '' : taken ? ui().slotTaken : ui().slotFree
  })
}

function updateSummary() {
  const topic = radioValue('topic')
  const day = dayByIso(radioValue('day'))
  const time = radioValue('time')
  const parts = []
  if (topic) parts.push(t(`form.topic.${topic}`))
  if (day) parts.push(fmt(day, { weekday: 'short', day: 'numeric', month: 'short' }) + (time ? `, ${time}` : ''))
  else if (time) parts.push(time)
  if (parts.length) parts.push(t(`form.mode.${radioValue('mode') || 'video'}`))
  summaryEl.textContent = parts.length ? parts.join(' · ') : ui().summaryEmpty
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
  const email = field('email').value.trim()
  const phone = field('phone').value.trim()
  const phoneOk = !phone || (/^\+?[\d\s().-]+$/.test(phone) && phone.replace(/\D/g, '').length >= 10)
  return [
    setError('err-topic', radioValue('topic') ? '' : e.topic, $$('input[name="topic"]', form)),
    setError('err-day', radioValue('day') ? '' : e.day, $$('input[name="day"]', form)),
    setError('err-time', radioValue('time') ? '' : e.time, $$('input[name="time"]:not(:disabled)', form)),
    setError('err-name', field('name').value.trim().length >= 2 ? '' : e.name, [field('name')]),
    setError('err-email', !email ? e.emailEmpty : /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) ? '' : e.email, [field('email')]),
    setError('err-phone', phoneOk ? '' : e.phone, [field('phone')]),
    setError('err-consent', field('consent').checked ? '' : e.consent, [field('consent')]),
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
  updateSummary()
  if (attempted) renderErrorSummary(validate())
})

form.addEventListener('input', () => {
  if (attempted) renderErrorSummary(validate())
})

form.addEventListener('submit', (e) => {
  e.preventDefault()
  attempted = true
  const errors = validate()
  renderErrorSummary(errors)
  if (errors.length) {
    errorBox.focus()
    return
  }
  lastBooking = {
    first: field('name').value.trim().split(/\s+/)[0],
    email: field('email').value.trim(),
    topic: radioValue('topic'),
    day: radioValue('day'),
    time: radioValue('time'),
    mode: radioValue('mode') || 'video',
    ref: `ST-${String(Math.floor(1000 + Math.random() * 9000))}`,
  }
  renderSuccess()
  form.hidden = true
  success.hidden = false
  success.focus()
  success.scrollIntoView({ block: 'nearest' })
})

function renderSuccess() {
  if (!lastBooking) {
    $('[data-success-title]', success).textContent = ui().thanks
    return
  }
  const b = lastBooking
  const r = ui().receipt
  $('[data-success-title]', success).textContent = ui().successTitle(b.first)
  $('[data-success-text]', success).textContent = ui().successText(b.email)
  const rows = [
    [r.topic, t(`form.topic.${b.topic}`)],
    [r.when, `${cap(fmt(dayByIso(b.day), { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }))}, ${b.time}`],
    [r.mode, t(`form.mode.${b.mode}`)],
    [r.ref, b.ref],
  ]
  const receipt = $('[data-receipt]', success)
  receipt.replaceChildren(
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

$('[data-success-reset]', success).addEventListener('click', () => {
  form.reset()
  attempted = false
  lastBooking = null
  for (const p of $$('.ferror', form)) p.hidden = true
  for (const el of $$('[aria-invalid]', form)) el.removeAttribute('aria-invalid')
  renderErrorSummary([])
  updateSlots()
  updateSummary()
  success.hidden = true
  form.hidden = false
  $('input[name="topic"]', form).focus()
})

// «Ζητήστε πρόταση»: προεπιλέγει το αντίστοιχο θέμα στη φόρμα
for (const link of $$('[data-topic]')) {
  link.addEventListener('click', () => {
    const radio = $(`input[name="topic"][value="${link.dataset.topic}"]`, form)
    if (radio) {
      radio.checked = true
      updateSummary()
    }
  })
}

// ---------- Ό,τι εξαρτάται από τη γλώσσα και την ημερομηνία ----------
function renderDynamic() {
  menuLabel.textContent = isMenuOpen() ? ui().menuClose : ui().menuOpen
  renderReport()
  renderDeadlines()
  renderDays()
  updateSlots()
  updateSummary()
  if (attempted && !form.hidden) renderErrorSummary(validate())
  renderSuccess()
}

// ---------- Εμφάνιση στο scroll ----------
const revealEls = $$('[data-reveal]')
for (const group of ['.ind', '.step', '.person', '.post']) {
  $$(group).forEach((el, i) => (el.style.transitionDelay = `${(i % 4) * 90}ms`))
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

$('[data-year]').textContent = today.getFullYear()

// ---------- Εκκίνηση ----------
mountAkamasBadge(lang)
applyLang(lang, true)
root.classList.remove('lang-pending')
