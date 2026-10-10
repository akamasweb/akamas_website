import { useEffect, useState, type CSSProperties } from 'react'
import { useLanguage } from '../i18n/LanguageContext'
import { ArrowRightIcon, SpeakerIcon, SunMark } from './Icons'

function speakWord(onEnd: () => void) {
  const synth = window.speechSynthesis
  const greekVoice = synth.getVoices().find((v) => v.lang.toLowerCase().startsWith('el'))
  // Χωρίς ελληνική φωνή, η φωνητική λατινική γραφή προφέρεται πιο σωστά από τα ελληνικά.
  const utterance = new SpeechSynthesisUtterance(greekVoice ? 'ακάμας' : 'ah-KAH-mahs')
  if (greekVoice) utterance.voice = greekVoice
  utterance.lang = greekVoice ? 'el-GR' : 'en-US'
  utterance.rate = 0.75
  utterance.onend = onEnd
  utterance.onerror = onEnd
  synth.cancel()
  synth.speak(utterance)
}

// Γράφει και σβήνει τις λέξεις μία-μία, σαν να πληκτρολογούνται.
// Ξεκινά με την πρώτη λέξη ολόκληρη, ώστε το μήνυμα να διαβάζεται αμέσως.
function useTypewriter(words: string[]) {
  const [index, setIndex] = useState(0)
  const [text, setText] = useState(words[0])
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const word = words[index]
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let delay: number
    let step: () => void
    if (reduceMotion) {
      delay = 3000
      step = () => {
        const next = (index + 1) % words.length
        setIndex(next)
        setText(words[next])
      }
    } else if (!deleting && text === word) {
      delay = 2200
      step = () => setDeleting(true)
    } else if (deleting && text === '') {
      delay = 350
      step = () => {
        setDeleting(false)
        setIndex((index + 1) % words.length)
      }
    } else if (deleting) {
      delay = 45
      step = () => setText(word.slice(0, text.length - 1))
    } else {
      delay = 85
      step = () => setText(word.slice(0, text.length + 1))
    }

    const timer = window.setTimeout(step, delay)
    return () => window.clearTimeout(timer)
  }, [words, index, text, deleting])

  return text
}

function Tagline({ lead, words, all }: { lead: string; words: string[]; all: string }) {
  const text = useTypewriter(words)
  return (
    <p className="hero__tagline">
      {lead}{' '}
      <span className="hero__typed" aria-hidden="true">
        {text}
        <span className="hero__caret" />
      </span>
      <span className="sr-only">{all}</span>
    </p>
  )
}

export function Hero() {
  const { t, lang } = useLanguage()
  const h = t.hero
  const [speaking, setSpeaking] = useState(false)
  // Ελέγχεται μετά τη φόρτωση, ώστε το έτοιμο HTML του build να ταιριάζει με τον browser
  const [canSpeak, setCanSpeak] = useState(false)
  useEffect(() => setCanSpeak('speechSynthesis' in window), [])

  const onListen = () => {
    setSpeaking(true)
    speakWord(() => setSpeaking(false))
  }

  return (
    <section className="hero" id="top">
      <SunMark className="hero__sun" />
      <div className="container hero__inner">
        <div className="hero__label">
          <span>{h.entry}</span>
          <span className="hero__label-rule" />
          <span>{h.entryNo}</span>
        </div>

        <h1 className="hero__word" aria-label={`${t.brand} — Akamas, Web Design & Development`}>
          {[...t.brand].map((ch, i) => (
            <span key={`${lang}-${i}`} aria-hidden="true" style={{ '--i': i } as CSSProperties}>
              {ch}
            </span>
          ))}
        </h1>

        <Tagline key={lang} lead={h.taglineLead} words={h.taglineWords} all={h.taglineAll} />

        <div className="hero__pron">
          <span className="hero__syllables">{h.syllables}</span>
          <span className="hero__ipa">{h.ipa}</span>
          {canSpeak && (
            <button type="button" className={`speak-btn${speaking ? ' is-speaking' : ''}`} onClick={onListen}>
              <SpeakerIcon width={16} height={16} />
              {h.listen}
            </button>
          )}
        </div>

        <p className="hero__grammar">
          <em>{h.pos}</em>
          <span className="dot">·</span>
          {h.lang}
          <span className="dot">·</span>
          {h.genitive} <span className="greek">ἀκάμαντος</span>
        </p>

        <div className="hero__body">
          <ol className="hero__senses">
            <li>
              <span className="hero__num">1.</span>
              <div>
                <p className="hero__sense">{h.sense1}</p>
                <blockquote className="hero__quote">
                  <p>
                    <span className="greek">ἠέλιόν τ’ ἀκάμαντα</span>
                    <span className="hero__gloss">{h.quoteGloss}</span>
                  </p>
                  <cite>— {h.quoteSource}</cite>
                </blockquote>
              </div>
            </li>
            <li>
              <span className="hero__num">2.</span>
              <div>
                <p className="hero__sense hero__sense--brand">
                  <em>{h.sense2Tag}</em> {h.sense2}
                </p>
              </div>
            </li>
          </ol>

          <aside className="hero__aside">
            <dl>
              <dt>{h.etymologyLabel}</dt>
              <dd className="hero__etymology">
                {h.etymology.map(([form, gloss], i) => (
                  <span key={form}>
                    {i > 0 && <span className="hero__plus">+</span>}
                    <span className="greek">{form}</span> <span className="muted">{gloss}</span>
                  </span>
                ))}
              </dd>
              <dt>{h.synonymsLabel}</dt>
              <dd>{h.synonyms}</dd>
            </dl>
          </aside>
        </div>

        <div className="hero__actions">
          <a className="btn btn--primary" href="#contact">
            {h.ctaPrimary}
            <ArrowRightIcon width={18} height={18} />
          </a>
          <a className="btn btn--ghost" href="#work">
            {h.ctaSecondary}
          </a>
        </div>
      </div>
      <a className="hero__scroll" href="#services" aria-label={h.scroll}>
        <span>{h.scroll}</span>
        <span className="hero__scroll-line" />
      </a>
    </section>
  )
}
