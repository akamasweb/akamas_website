import { Contact } from './components/Contact'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { Privacy } from './components/Privacy'
import { Faq, Manifesto, Marquee, Pricing, Process, Services, Work } from './components/Sections'
import { useHashLanding } from './hooks/useHashLanding'
import { useReveal } from './hooks/useReveal'
import { useLanguage } from './i18n/LanguageContext'

function Home() {
  return (
    <>
      <Hero />
      <Marquee />
      <Services />
      <Work />
      <Manifesto />
      <Process />
      <Pricing />
      <Faq />
      <Contact />
    </>
  )
}

export default function App() {
  const { page } = useLanguage()
  useReveal()
  useHashLanding()

  return (
    <>
      <Header />
      <main id="main">{page === 'privacy' ? <Privacy /> : <Home />}</main>
      <Footer />
    </>
  )
}
