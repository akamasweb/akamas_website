import { useLanguage } from '../i18n/LanguageContext'
import { getPrivacy } from '../i18n/privacy'
import { ArrowRightIcon } from './Icons'

export function Privacy() {
  const { lang, pathFor } = useLanguage()
  const p = getPrivacy(lang)

  return (
    <article className="legal" id="top">
      <div className="container legal__inner">
        <a className="legal__back" href={pathFor('home')}>
          <ArrowRightIcon width={16} height={16} className="legal__back-icon" />
          {p.back}
        </a>
        <p className="eyebrow">{p.eyebrow}</p>
        <h1 className="legal__title">{p.title}</h1>
        <p className="legal__updated">{p.updated}</p>
        <p className="legal__intro">{p.intro}</p>

        {p.sections.map((section, i) => (
          <section key={section.title} className="legal__section">
            <h2>
              <span className="legal__num">{i + 1}.</span> {section.title}
            </h2>
            {section.body.map((block, j) =>
              Array.isArray(block) ? (
                <ul key={j}>
                  {block.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p key={j}>{block}</p>
              ),
            )}
          </section>
        ))}
      </div>
    </article>
  )
}
