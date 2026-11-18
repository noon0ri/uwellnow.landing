import { useEffect, useRef } from 'react'
import { SPACES_COPY } from '../content/copy'
import { SPACES } from '../content/spaces'
import { photoFocus } from '../lib/photoFit'
import { photoOnlyOpacities } from '../lib/spacePhase'
import { rig } from '../scene/rig'

export function Spaces() {
  const section = useRef<HTMLElement>(null)

  // Without 3D, crossfade photos by scroll. With 3D, the scroll driver (useScrollRig) owns the opacities.
  // Crop each photo around its device (same focus the 3D handoff assumes).
  useEffect(() => {
    const focus = () =>
      section.current?.querySelectorAll<HTMLImageElement>('[data-space-photo] img').forEach((img, i) => {
        const f = photoFocus(SPACES[i], innerWidth, innerHeight)
        img.style.objectPosition = `${f.x * 100}% ${f.y * 100}%`
      })
    focus()
    addEventListener('resize', focus)
    return () => removeEventListener('resize', focus)
  }, [])

  useEffect(() => {
    let raf = 0
    const run = () => {
      raf = 0
      const el = section.current
      if (!el || rig.ready) return
      const r = el.getBoundingClientRect()
      const o = photoOnlyOpacities(-r.top / (el.offsetHeight - innerHeight), SPACES.length)
      el.querySelectorAll<HTMLElement>('[data-space-photo]').forEach((p, i) => (p.style.opacity = String(o[i])))
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(run) }
    run()
    addEventListener('scroll', onScroll, { passive: true })
    addEventListener('resize', onScroll)
    return () => { removeEventListener('scroll', onScroll); removeEventListener('resize', onScroll); cancelAnimationFrame(raf) }
  }, [])

  return (
    <section ref={section} id="spaces" aria-labelledby="spaces-title" className="relative" style={{ height: `${SPACES.length * 150}svh` }}>
      <div data-spaces-sticky className="sticky top-0 h-dvh overflow-hidden">
        <h2 id="spaces-title" className="sr-only">{SPACES_COPY.title}</h2>
        {SPACES.map((s, i) => (
          <div key={s.id} data-space-photo={i} className="absolute inset-0" style={{ opacity: i === 0 ? 1 : 0 }}>
            <picture>
              <source media="(max-width: 767px)" srcSet={s.srcMobile} />
              <img src={s.src} alt={`${s.name}에 놓인 유웰나우`} loading={i === 0 ? 'eager' : 'lazy'} decoding="async" className="absolute inset-0 h-full w-full object-cover" />
            </picture>
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent pb-10 pt-24 text-white">
              <div className="mx-auto max-w-7xl px-5 md:px-8">
                <p className="text-sm font-semibold opacity-80">{SPACES_COPY.title}</p>
                <p className="mt-2 text-[32px] font-bold tracking-[-0.02em] md:text-[48px]">{s.name}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
