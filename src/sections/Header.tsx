import type { ReactNode } from 'react'
import { CTA_HREF, CTA_LABEL, NAV } from '../content/copy'
import { track } from '../lib/analytics'

export function CtaLink({ location, className = '', children = CTA_LABEL }: { location: string; className?: string; children?: ReactNode }) {
  return (
    <a
      href={CTA_HREF}
      onClick={() => track('cta_click', { location })}
      className={`inline-flex h-12 shrink-0 items-center whitespace-nowrap justify-center rounded-full bg-ink px-6 text-[15px] font-semibold text-white transition-colors hover:bg-gray-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${className}`}
    >
      {children}
    </a>
  )
}

export function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-black/5 bg-white/70 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-7xl items-center gap-8 px-5 md:px-8" aria-label="주요 메뉴">
        <a href="/" aria-label="uwellnow" className="shrink-0">
          <img src="/img/logo.svg" alt="" className="h-[17px] w-auto" />
        </a>
        <ul className="hidden gap-8 text-[15px] text-gray-800 md:flex">
          {NAV.map(n => (
            <li key={n.href}><a href={n.href} className="hover:text-ink">{n.label}</a></li>
          ))}
        </ul>
        <CtaLink location="header" className="ml-auto h-10 px-5 text-sm" />
        <details className="relative md:hidden">
          <summary className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-full hover:bg-subtle" aria-label="메뉴">
            <span aria-hidden className="block h-px w-4 bg-ink shadow-[0_5px_0_#171717,0_-5px_0_#171717]" />
          </summary>
          <ul className="absolute right-0 top-12 w-40 rounded-2xl border border-line bg-white p-2 text-[15px] shadow-lg">
            {NAV.map(n => (
              <li key={n.href}><a href={n.href} className="block rounded-xl px-3 py-2.5 hover:bg-subtle">{n.label}</a></li>
            ))}
          </ul>
        </details>
      </nav>
    </header>
  )
}
