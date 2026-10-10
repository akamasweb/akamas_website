import { useState, type FormEvent } from 'react'
import { site } from '../config'
import { useLanguage } from '../i18n/LanguageContext'
import { ArrowRightIcon } from './Icons'

type Status = 'idle' | 'sending' | 'sent' | 'mailto' | 'error'

export function Contact() {
  const { t, pathFor } = useLanguage()
  const c = t.contact
  const [status, setStatus] = useState<Status>('idle')

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const { _honey, ...data } = Object.fromEntries(new FormData(form)) as Record<string, string>

    // Παγίδα για bots: οι άνθρωποι δεν βλέπουν αυτό το πεδίο, άρα δεν το συμπληρώνουν.
    if (_honey) {
      form.reset()
      setStatus('sent')
      return
    }

    const subject = `${c.mailSubject} ${data.name}`

    if (!site.formEndpoint) {
      const body = [
        `${c.name}: ${data.name}`,
        `${c.email}: ${data.email}`,
        data.phone ? `${c.phone}: ${data.phone}` : null,
        `${c.type}: ${data.type}`,
        `${c.budget}: ${data.budget}`,
        '',
        data.message,
      ]
        .filter((line) => line !== null)
        .join('\n')
      window.location.href = `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
      setStatus('mailto')
      return
    }

    setStatus('sending')
    try {
      const res = await fetch(site.formEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          ...data,
          // Ρυθμίσεις του FormSubmit: θέμα, μορφή πίνακα και «Απάντηση» κατευθείαν στον αποστολέα
          _subject: subject,
          _template: 'table',
          _captcha: 'false',
          _replyto: data.email,
        }),
      })
      const json = await res.json().catch(() => ({}))
      // Το FormSubmit επιστρέφει success: "false" π.χ. όταν η φόρμα δεν έχει ενεργοποιηθεί ακόμα
      if (!res.ok || json.success === false || json.success === 'false') throw new Error(json.message ?? String(res.status))
      form.reset()
      setStatus('sent')
    } catch {
      setStatus('error')
    }
  }

  return (
    <section className="section contact" id="contact">
      <div className="container contact__grid">
        <div className="contact__intro" data-reveal>
          <p className="eyebrow">
            <span className="eyebrow__index">§ 07</span>
            {c.eyebrow}
          </p>
          <h2 className="contact__title">
            {c.title} <em>{c.titleWord}</em>
          </h2>
          <p className="contact__text">{c.text}</p>
          <div className="contact__direct">
            <span className="muted">{c.or}</span>
            <a href={`mailto:${site.email}`}>{site.email}</a>
            <a href={`tel:${site.phone.replace(/\s/g, '')}`}>{site.phone}</a>
            <span className="muted">{site.location}</span>
          </div>
        </div>

        <form className="form" onSubmit={onSubmit} data-reveal>
          <div className="form__row">
            <label className="field">
              <span>{c.name}</span>
              <input name="name" type="text" autoComplete="name" required />
            </label>
            <label className="field">
              <span>{c.email}</span>
              <input name="email" type="email" autoComplete="email" required />
            </label>
          </div>
          <label className="field">
            <span>{c.phone}</span>
            <input name="phone" type="tel" autoComplete="tel" />
          </label>

          <fieldset className="field">
            <legend>{c.type}</legend>
            <div className="chips">
              {c.types.map((type, i) => (
                <label key={type} className="chip">
                  <input type="radio" name="type" value={type} defaultChecked={i === 0} />
                  <span>{type}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="field">
            <legend>{c.budget}</legend>
            <div className="chips">
              {c.budgets.map((budget, i) => (
                <label key={budget} className="chip">
                  <input type="radio" name="budget" value={budget} defaultChecked={i === c.budgets.length - 1} />
                  <span>{budget}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <label className="field">
            <span>{c.message}</span>
            <textarea name="message" rows={5} placeholder={c.messagePlaceholder} required />
          </label>

          <input className="form__honey" type="text" name="_honey" tabIndex={-1} autoComplete="off" aria-hidden="true" />

          <div className="form__footer">
            <button className="btn btn--primary" type="submit" disabled={status === 'sending'}>
              {status === 'sending' ? c.sending : c.submit}
              <ArrowRightIcon width={18} height={18} />
            </button>
            <p className={`form__status form__status--${status}`} role="status" aria-live="polite">
              {status === 'sent' && c.sent}
              {status === 'mailto' && c.mailtoSent}
              {status === 'error' && c.error}
            </p>
          </div>
          <p className="form__privacy">
            {c.privacyNote} <a href={pathFor('privacy')}>{c.privacyLink}</a>
          </p>
        </form>
      </div>
    </section>
  )
}
