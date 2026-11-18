import { HERO } from '../content/copy'
import { CtaLink } from './Header'

export function Hero() {
  return (
    <section id="hero" className="relative flex h-svh items-end pb-[12vh] md:items-center md:pb-0">
      <div className="mx-auto w-full max-w-7xl px-5 md:px-8">
        <div className="max-w-[26rem] md:max-w-[30rem]">
          <span className="inline-block rounded-full border border-ink px-2.5 py-0.5 text-xs font-semibold tracking-wide">{HERO.badge}</span>
          <h1 className="mt-4 text-[34px] font-bold leading-[1.18] tracking-[-0.02em] md:text-[52px]">{HERO.title}</h1>
          <p className="mt-4 text-[17px] text-gray-800 md:text-xl">{HERO.sub}</p>
          <CtaLink location="hero" className="mt-8" />
        </div>
      </div>
    </section>
  )
}
