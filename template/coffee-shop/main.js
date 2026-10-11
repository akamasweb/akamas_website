import '@fontsource-variable/alegreya'
import '@fontsource-variable/alegreya/wght-italic.css'
import '@fontsource-variable/commissioner'
import { mountAkamasBadge, setAkamasBadgeLang } from '../_shared/akamas-badge.js'
import { EN, UI, HOURS } from './i18n.js'

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

// Τιμές: 2,80 € στα ελληνικά, €2.80 στα αγγλικά
function renderPrices() {
  const money = new Intl.NumberFormat(ui().locale, { style: 'currency', currency: 'EUR' })
  for (const el of $$('[data-price]')) el.textContent = money.format(Number(el.dataset.price))
  for (const el of $$('[data-price-inline]')) el.textContent = `+${money.format(Number(el.dataset.priceInline))}`
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
matchMedia('(min-width: 1101px)').addEventListener('change', () => isMenuOpen() && setMenu(false, false))
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
  for (const a of navLinks) {
    const section = document.getElementById(a.hash.slice(1))
    if (section) spy.observe(section)
  }
}

// ---------- Ανοιχτά / κλειστά, με βάση την ώρα του επισκέπτη ----------
const hhmm = (mins) => `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`

function openState(now = new Date()) {
  const day = now.getDay()
  const mins = now.getHours() * 60 + now.getMinutes()
  const [opens, closes] = HOURS[day]
  if (mins >= opens && mins < closes) {
    const left = closes - mins
    return left <= 45
      ? { state: 'closing', text: ui().closing(left), short: ui().shortClosing }
      : { state: 'open', text: ui().open(hhmm(closes)), short: ui().shortOpen }
  }
  if (mins < opens) return { state: 'closed', text: ui().closedToday(hhmm(opens)), short: ui().shortClosed }
  return { state: 'closed', text: ui().closedTomorrow(hhmm(HOURS[(day + 1) % 7][0])), short: ui().shortClosed }
}

function renderStatus() {
  const s = openState()
  const classes = ['is-open', 'is-closing', 'is-closed']
  for (const el of $$('[data-open-status]')) {
    el.classList.remove(...classes)
    el.classList.add(`is-${s.state}`)
    $('[data-status-text]', el).textContent = s.text
  }
  const pill = $('[data-status-pill]')
  pill.hidden = false
  pill.classList.remove(...classes)
  pill.classList.add(`is-${s.state}`)
  $('[data-status-short]', pill).textContent = s.short
  const navStatus = $('[data-status-text-nav]')
  navStatus.className = `nav__status is-${s.state}`
  navStatus.innerHTML = `<span class="open-status__dot"></span><span></span>`
  navStatus.lastChild.textContent = s.text

  // Σημερινή ημέρα στο ωράριο
  const today = new Date().getDay()
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
setInterval(renderStatus, 60_000)

// ---------- Ημερομηνία καβουρδίσματος (κάθε Τρίτη) ----------
function renderRoastDate() {
  const now = new Date()
  const back = (now.getDay() - 2 + 7) % 7
  const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - back)
  const el = $('[data-roast-date]')
  el.dateTime = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  const text = new Intl.DateTimeFormat(ui().locale, { weekday: 'long', day: 'numeric', month: 'long' }).format(date)
  el.textContent = back === 0 ? ui().roastedToday : text.charAt(0).toUpperCase() + text.slice(1)
}

// ---------- Μενού: καρτέλες ----------
const tabsRoot = $('[data-tabs]')
const tablist = $('[role="tablist"]', tabsRoot)
const tabs = $$('[role="tab"]', tablist)
const panels = $$('[data-panel]', tabsRoot)

tabsRoot.classList.add('js-tabs')
tablist.hidden = false
for (const panel of panels) {
  panel.setAttribute('role', 'tabpanel')
  panel.setAttribute('aria-labelledby', panel.id.replace('panel-', 'tab-'))
  panel.tabIndex = 0
}

function selectTab(tab, focus = false) {
  for (const t of tabs) {
    const on = t === tab
    t.setAttribute('aria-selected', String(on))
    t.tabIndex = on ? 0 : -1
    document.getElementById(t.getAttribute('aria-controls')).hidden = !on
  }
  if (focus) tab.focus()
  // Στο κινητό οι καρτέλες κυλάνε οριζόντια: η επιλεγμένη μένει ορατή
  const listBox = tablist.getBoundingClientRect()
  const tabBox = tab.getBoundingClientRect()
  if (tabBox.left < listBox.left || tabBox.right > listBox.right) {
    tablist.scrollBy({ left: tabBox.left - listBox.left - 24, behavior: 'smooth' })
  }
}

tablist.addEventListener('click', (e) => {
  const tab = e.target.closest('[role="tab"]')
  if (tab) selectTab(tab)
})

tablist.addEventListener('keydown', (e) => {
  const i = tabs.indexOf(document.activeElement)
  if (i < 0) return
  const moves = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }
  if (!(e.key in moves)) return
  e.preventDefault()
  selectTab(tabs[(moves[e.key] + tabs.length) % tabs.length], true)
})

selectTab(tabs[0])

// ---------- Κάρτα επιβράβευσης (demo) ----------
const loyalty = $('[data-loyalty]')
const stamps = $$('[data-stamps] li', loyalty)
const stampBtn = $('[data-stamp-btn]', loyalty)
const stampCount = $('[data-stamp-count]', loyalty)
let stampTotal = 6

function renderStamps() {
  stamps.forEach((li, i) => li.classList.toggle('is-stamped', i < stampTotal))
  stampCount.textContent = stampTotal >= 10 ? ui().full : ui().stamps(stampTotal)
  $('span', stampBtn).textContent = stampTotal >= 10 ? ui().restart : t('club.stamp')
}

stampBtn.addEventListener('click', () => {
  stampTotal = stampTotal >= 10 ? 0 : stampTotal + 1
  renderStamps()
})

// ---------- Newsletter (demo: δεν στέλνει τίποτα) ----------
const newsletter = $('[data-newsletter]')
const nlInput = $('input', newsletter)
const nlError = $('#nl-error')
const nlDone = $('[data-newsletter-done]')
let nlTried = false

function validateEmail() {
  const value = nlInput.value.trim()
  const message = !value ? ui().nlEmpty : /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value) ? '' : ui().nlInvalid
  nlError.textContent = message
  nlError.hidden = !message
  nlInput.setAttribute('aria-invalid', String(Boolean(message)))
  $('.newsletter__row', newsletter).classList.toggle('is-invalid', Boolean(message))
  return !message
}

newsletter.addEventListener('submit', (e) => {
  e.preventDefault()
  nlTried = true
  if (!validateEmail()) {
    nlInput.focus()
    return
  }
  newsletter.hidden = true
  nlDone.hidden = false
  nlDone.focus()
})

nlInput.addEventListener('input', () => nlTried && validateEmail())

// ---------- Ό,τι εξαρτάται από γλώσσα / ώρα ----------
function renderDynamic() {
  burger.setAttribute('aria-label', isMenuOpen() ? ui().burgerClose : ui().burgerOpen)
  renderPrices()
  renderStatus()
  renderRoastDate()
  renderStamps()
  if (nlTried && !newsletter.hidden) validateEmail()
}

// ---------- Εμφάνιση στο scroll ----------
const revealEls = $$('[data-reveal]')
for (const group of ['.tile', '.review', '.process__step', '.fact']) {
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
mountAkamasBadge(lang)
applyLang(lang, true)
root.classList.remove('lang-pending')
