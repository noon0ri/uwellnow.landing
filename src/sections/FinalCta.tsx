import { FINAL_CTA } from '../content/copy'
import { CtaLink } from './Header'

export function FinalCta() {
  return (
    <section id="final-cta" className="relative bg-ink py-28 text-center text-white md:py-40">
      <div className="mx-auto max-w-3xl px-5">
        <h2 className="text-[32px] font-bold tracking-[-0.02em] md:text-[52px]">{FINAL_CTA.title}</h2>
        <p className="mt-4 text-[17px] text-white/70">{FINAL_CTA.sub}</p>
        <CtaLink location="final" className="mt-10 !bg-white !text-ink hover:!bg-subtle" />
      </div>
    </section>
  )
}
