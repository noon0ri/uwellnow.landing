import { FOOTER } from '../content/copy'

export function Footer() {
  return (
    <footer className="relative border-t border-white/10 bg-ink py-10 text-[13px] leading-relaxed text-white/50">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <img src="/img/logo.svg" alt="uwellnow" className="h-[15px] w-auto invert" />
        <p className="mt-5">{FOOTER.company}</p>
        <p>{FOOTER.biz}</p>
        <p className="mt-3">{FOOTER.copyright}</p>
      </div>
    </footer>
  )
}
