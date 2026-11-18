import { lazy, Suspense, useState } from 'react'
import { HERO } from './content/copy'
import { hasWebGL } from './lib/webgl'
import { Header } from './sections/Header'
import { Hero } from './sections/Hero'
import { Features } from './sections/Features'
import { Spaces } from './sections/Spaces'
import { Spec } from './sections/Spec'
import { Experience } from './sections/Experience'
import { Apps } from './sections/Apps'
import { FinalCta } from './sections/FinalCta'
import { Footer } from './sections/Footer'

const Stage = lazy(() => import('./scene/Stage'))

function Poster() {
  return (
    <div className="fixed inset-0 -z-10 bg-[#e9e9e9]">
      <img src="/img/hero-poster.webp" alt={HERO.posterAlt} className="h-full w-full object-cover" />
    </div>
  )
}

export default function App() {
  const [webgl] = useState(hasWebGL)
  return (
    <>
      <Header />
      {webgl ? <Suspense fallback={<Poster />}><Stage fallback={<Poster />} /></Suspense> : <Poster />}
      <main id="main" className="relative">
        <Hero />
        <Features />
        <Spaces />
        <Spec />
        <Experience />
        <Apps />
        <FinalCta />
      </main>
      <Footer />
    </>
  )
}
