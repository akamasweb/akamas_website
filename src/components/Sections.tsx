import type { CSSProperties, ReactNode } from 'react'
import { useLanguage } from '../i18n/LanguageContext'
import { ArrowUpRightIcon, CheckIcon, PlusIcon } from './Icons'

const pad = (n: number) => String(n).padStart(2, '0')

function SectionHead({ eyebrow, title, index }: { eyebrow: string; title: ReactNode; index: string }) {
  return (
    <div className="section-head" data-reveal>
      <p className="eyebrow">
        <span className="eyebrow__index">§ {index}</span>
        {eyebrow}
      </p>
      <h2 className="section-title">{title}</h2>
    </div>
  )
}

export function Marquee() {
  const { t } = useLanguage()
  // Δύο ίδια αντίγραφα για συνεχή, «ακούραστη» κύλιση χωρίς κενό.
  const items = [...t.marquee, ...t.marquee]
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee__track">
        {items.map((item, i) => (
          <span key={i} className="marquee__item">
            {item}
            <span className="marquee__star">✦</span>
          </span>
        ))}
      </div>
    </div>
  )
}

export function Services() {
  const { t } = useLanguage()
  const s = t.services
  return (
    <section className="section" id="services">
      <div className="container">
        <SectionHead index="01" eyebrow={s.eyebrow} title={s.title} />
        <div className="services">
          {s.items.map((item, i) => (
            <article key={item.title} className="service" data-reveal style={{ '--d': i % 3 } as CSSProperties}>
              <span className="service__num">{pad(i + 1)}</span>
              <h3 className="service__title">{item.title}</h3>
              <p className="service__text">{item.text}</p>
              <ul className="tags">
                {item.tags.map((tag) => (
                  <li key={tag}>{tag}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

// TODO: αντικαταστήστε τα concept έργα με πραγματικά έργα (και screenshots) όταν είναι διαθέσιμα.
const MOCK_PALETTES = [
  { bg: '#0f3b57', fg: '#e8f1f5', accent: '#5fb3c9' },
  { bg: '#e9e4d0', fg: '#2f3a1f', accent: '#6b7a2c' },
  { bg: '#3a1420', fg: '#f3e6e0', accent: '#c98a6b' },
  { bg: '#e6f2ef', fg: '#123b36', accent: '#2a9d8f' },
]

function SiteMock({ variant }: { variant: number }) {
  const p = MOCK_PALETTES[variant % MOCK_PALETTES.length]
  return (
    <div
      className={`mock mock--${variant}`}
      style={{ '--m-bg': p.bg, '--m-fg': p.fg, '--m-accent': p.accent } as CSSProperties}
      aria-hidden="true"
    >
      <div className="mock__bar">
        <i />
        <i />
        <i />
        <span className="mock__url" />
      </div>
      <div className="mock__page">
        <div className="mock__nav">
          <span className="mock__logo" />
          <span className="mock__links">
            <i />
            <i />
            <i />
          </span>
        </div>
        <div className="mock__hero">
          <div className="mock__copy">
            <span className="mock__line mock__line--lg" />
            <span className="mock__line mock__line--lg mock__line--short" />
            <span className="mock__line" />
            <span className="mock__btn" />
          </div>
          <div className="mock__image" />
        </div>
        <div className="mock__cards">
          <i />
          <i />
          <i />
        </div>
      </div>
    </div>
  )
}

export function Work() {
  const { t } = useLanguage()
  const w = t.work
  return (
    <section className="section" id="work">
      <div className="container">
        <SectionHead index="02" eyebrow={w.eyebrow} title={w.title} />
        <div className="work">
          {w.items.map((item, i) => (
            <article key={item.name} className="project" data-reveal style={{ '--d': i % 2 } as CSSProperties}>
              <div className="project__media">
                <SiteMock variant={i} />
              </div>
              <div className="project__info">
                <div>
                  <p className="project__category">{item.category}</p>
                  <h3 className="project__name">{item.name}</h3>
                  <p className="project__text">{item.text}</p>
                </div>
                <span className="project__badge">{w.conceptLabel}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export function Manifesto() {
  const { t } = useLanguage()
  const m = t.manifesto
  return (
    <section className="section manifesto" id="about">
      <div className="container">
        <p className="eyebrow" data-reveal>
          <span className="eyebrow__index">§ 03</span>
          {m.eyebrow}
        </p>
        <p className="manifesto__text" data-reveal>
          {m.lead} <span className="greek manifesto__word">{m.leadWord}</span>. {m.rest}
        </p>
        <dl className="stats">
          {m.stats.map((s, i) => (
            <div key={s.label} className="stat" data-reveal style={{ '--d': i } as CSSProperties}>
              <dt className="stat__value">{s.value}</dt>
              <dd className="stat__label">{s.label}</dd>
            </div>
          ))}
        </dl>
        <div className="pillars">
          {m.pillars.map((p, i) => (
            <div key={p.title} className="pillar" data-reveal style={{ '--d': i } as CSSProperties}>
              <h3>{p.title}</h3>
              <p>{p.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function Process() {
  const { t } = useLanguage()
  const p = t.process
  return (
    <section className="section" id="process">
      <div className="container">
        <SectionHead index="04" eyebrow={p.eyebrow} title={p.title} />
        <ol className="process">
          {p.steps.map((step, i) => (
            <li key={step.title} className="step" data-reveal style={{ '--d': i } as CSSProperties}>
              <span className="step__num">{pad(i + 1)}</span>
              <h3 className="step__title">{step.title}</h3>
              <p className="step__text">{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

export function Pricing() {
  const { t } = useLanguage()
  const p = t.pricing
  return (
    <section className="section" id="pricing">
      <div className="container">
        <SectionHead index="05" eyebrow={p.eyebrow} title={p.title} />
        <div className="plans">
          {p.plans.map((plan, i) => {
            const featured = i === 1
            return (
              <article
                key={plan.name}
                className={`plan${featured ? ' plan--featured' : ''}`}
                data-reveal
                style={{ '--d': i } as CSSProperties}
              >
                {featured && <span className="plan__badge">{p.popular}</span>}
                <h3 className="plan__name">{plan.name}</h3>
                <p className="plan__price">
                  <span className="plan__from">{p.from}</span>
                  <span className="plan__amount">€{plan.price}</span>
                </p>
                <p className="plan__text">{plan.text}</p>
                <ul className="plan__features">
                  {plan.features.map((f) => (
                    <li key={f}>
                      <CheckIcon width={16} height={16} />
                      {f}
                    </li>
                  ))}
                </ul>
                <a className={`btn ${featured ? 'btn--primary' : 'btn--ghost'} plan__cta`} href="#contact">
                  {p.choose}
                  <ArrowUpRightIcon width={16} height={16} />
                </a>
              </article>
            )
          })}
        </div>
        <p className="plans__note" data-reveal>
          {p.note}
        </p>
      </div>
    </section>
  )
}

export function Faq() {
  const { t } = useLanguage()
  const f = t.faq
  return (
    <section className="section" id="faq">
      <div className="container faq-layout">
        <SectionHead index="06" eyebrow={f.eyebrow} title={f.title} />
        <div className="faq" data-reveal>
          {f.items.map((item, i) => (
            <details key={item.q} className="faq__item" open={i === 0}>
              <summary>
                <span>{item.q}</span>
                <PlusIcon className="faq__icon" />
              </summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
