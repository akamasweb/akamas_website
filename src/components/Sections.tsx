import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import { offer } from '../config'
import { useLanguage } from '../i18n/LanguageContext'
import { ArrowRightIcon, ArrowUpRightIcon, CheckIcon, PlusIcon } from './Icons'

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
            <article key={i} className="service" data-reveal style={{ '--d': i % 3 } as CSSProperties}>
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

// Screenshot έργου μέσα σε πλαίσιο browser. Στη «γραμμή διευθύνσεων» φαίνεται το domain του πελάτη
// ή, για τα templates, η διαδρομή τους μέσα στο site (π.χ. template/coffee-shop).
function SiteShot({ url, image, name }: { url: string; image: string; name: string }) {
  const address = url.startsWith('/') ? url.replace(/^\/|\/$/g, '') : new URL(url).host
  return (
    <div className="mock">
      <div className="mock__bar" aria-hidden="true">
        <i />
        <i />
        <i />
        <span className="mock__host">{address}</span>
      </div>
      <img className="mock__shot" src={image} alt={`${name} (${address})`} width={1440} height={900} loading="lazy" decoding="async" />
    </div>
  )
}

export function Work() {
  const { t, lang } = useLanguage()
  const w = t.work
  return (
    <section className="section" id="work">
      <div className="container">
        <SectionHead index="02" eyebrow={w.eyebrow} title={w.title} />
        <div className="work">
          {w.items.map((item, i) => {
            const isTemplate = item.kind === 'template'
            // Τα templates ανοίγουν στην ίδια καρτέλα και στη γλώσσα του επισκέπτη· τα sites πελατών σε νέα καρτέλα
            const href = isTemplate && lang === 'en' ? `${item.url}?lang=en` : item.url
            const external = isTemplate ? {} : { target: '_blank', rel: 'noopener' }
            return (
              <a key={i} className="project" href={href} {...external} data-reveal style={{ '--d': i % 2 } as CSSProperties}>
                <div className="project__media">
                  <SiteShot url={item.url} image={item.image} name={item.name} />
                </div>
                <div className="project__info">
                  <div>
                    <p className="project__category">{item.category}</p>
                    <h3 className="project__name">{item.name}</h3>
                    <p className="project__text">{item.text}</p>
                  </div>
                  <span className="project__badge">
                    {isTemplate ? w.templateLabel : w.visitLabel}
                    {isTemplate ? <ArrowRightIcon width={14} height={14} /> : <ArrowUpRightIcon width={14} height={14} />}
                  </span>
                </div>
              </a>
            )
          })}
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
            <div key={i} className="stat" data-reveal style={{ '--d': i } as CSSProperties}>
              <dt className="stat__value">{s.value}</dt>
              <dd className="stat__label">{s.label}</dd>
            </div>
          ))}
        </dl>
        <div className="pillars">
          {m.pillars.map((p, i) => (
            <div key={i} className="pillar" data-reveal style={{ '--d': i } as CSSProperties}>
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
            <li key={i} className="step" data-reveal style={{ '--d': i } as CSSProperties}>
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

// Χρόνος που απομένει στην προσφορά (ms), ενημερώνεται κάθε δευτερόλεπτο· null αν έχει λήξει.
// Υπολογίζεται μόνο στον browser, ώστε το έτοιμο HTML του build να μη δείχνει ποτέ προσφορά που έχει ήδη λήξει.
function useOfferLeft() {
  const [left, setLeft] = useState<number | null>(null)
  useEffect(() => {
    const end = Date.parse(offer.ends)
    const tick = () => {
      const ms = end - Date.now()
      setLeft(ms > 0 ? ms : null)
      if (ms <= 0) clearInterval(id)
    }
    const id = setInterval(tick, 1000)
    tick()
    return () => clearInterval(id)
  }, [])
  return left
}

export function Pricing() {
  const { t } = useLanguage()
  const p = t.pricing
  const offerLeft = useOfferLeft()
  // Ημέρες, ώρες, λεπτά, δευτερόλεπτα για το χρονόμετρο
  const timer =
    offerLeft === null
      ? null
      : [
          Math.floor(offerLeft / 86_400_000),
          Math.floor(offerLeft / 3_600_000) % 24,
          Math.floor(offerLeft / 60_000) % 60,
          Math.floor(offerLeft / 1000) % 60,
        ]
  return (
    <section className="section" id="pricing">
      <div className="container">
        <SectionHead index="05" eyebrow={p.eyebrow} title={p.title} />
        <div className="plans">
          {p.plans.map((plan, i) => {
            const featured = i === 1
            const onOffer = timer !== null && plan.name === offer.plan
            return (
              <article
                key={i}
                className={`plan${featured ? ' plan--featured' : ''}`}
                data-reveal
                style={{ '--d': i } as CSSProperties}
              >
                {featured && <span className="plan__badge">{p.popular}</span>}
                {onOffer && <span className="plan__badge plan__badge--offer">{p.offer.badge(new Date(offer.ends))}</span>}
                <h3 className="plan__name">{plan.name}</h3>
                <p className="plan__price">
                  <span className="plan__from">{p.from}</span>
                  {onOffer ? (
                    <>
                      <s className="plan__was">
                        <span className="sr-only">{p.offer.was}: </span>€{plan.price}
                      </s>
                      <span className="plan__amount">
                        <span className="sr-only">{p.offer.now}: </span>€{offer.price}
                      </span>
                    </>
                  ) : (
                    <span className="plan__amount">€{plan.price}</span>
                  )}
                </p>
                {onOffer && (
                  <div className="offer-timer" role="timer">
                    <p className="offer-timer__label">{p.offer.endsIn}</p>
                    <div className="offer-timer__cells">
                      {timer.map((n, k) => (
                        <span key={k} className="offer-timer__cell">
                          <span className="offer-timer__num">{pad(n)}</span>
                          <span className="offer-timer__unit">{p.offer.units[k]}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
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
            <details key={i} className="faq__item" open={i === 0}>
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
