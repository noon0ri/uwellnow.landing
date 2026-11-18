import { useEffect } from 'react'
import gsap from 'gsap'
import { EXPERIENCE_COPY as C } from '../content/copy'
import { FLAVORS, FUNCTIONS, findFlavor, findFunction, resultTitle } from '../content/experience'
import { track } from '../lib/analytics'
import { dispatch, useExp } from '../lib/experienceStore'
import { rig } from '../scene/rig'
import { CtaLink } from './Header'

export const POUR_MS = 3000

/** Pour side effects: completion timer (+ GA event once) and the visual tweens on rig. */
function usePour() {
  const s = useExp()
  useEffect(() => {
    if (s.step === 'pouring') {
      rig.pour.color = findFlavor(s.flavor!)!.color
      const tweens = [
        gsap.fromTo(rig.pour, { progress: 0 }, { progress: 1, duration: POUR_MS / 1000 - 0.35, ease: 'power1.inOut', delay: 0.35 }),
        gsap.to(rig.exp, { blend: 1, duration: 0.8, ease: 'power2.inOut' }),
      ]
      const t = setTimeout(() => {
        dispatch({ type: 'pourDone' })
        track('experience_complete', { function: s.fn!, flavor: s.flavor! })
      }, POUR_MS)
      return () => { clearTimeout(t); tweens.forEach(tw => tw.kill()) }
    }
    if (s.step === 'function') {
      gsap.to(rig.exp, { blend: 0, duration: 0.8, ease: 'power2.inOut' })
      gsap.to(rig.pour, { progress: 0, duration: 0.4 })
    }
  }, [s.step, s.fn, s.flavor])
  return s
}

/** The dispenser screen. With 3D, DisplayTracker positions this element over the model's display every frame. */
function Panel() {
  const s = useExp()
  const fn = s.fn ? findFunction(s.fn) : undefined
  const flavor = s.flavor ? findFlavor(s.flavor) : undefined
  const btn = 'flex min-h-11 items-center justify-center gap-[0.5em] rounded-[0.9em] bg-white/10 px-[0.6em] py-[0.7em] text-[max(13px,4.6cqw)] font-semibold text-white transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-white'
  return (
    <div
      data-display-panel
      className="@container relative mx-auto flex aspect-[2/3] max-h-[70svh] w-[min(84vw,24rem)] flex-col overflow-hidden rounded-[3%] bg-[#0b0b0b] p-[6%] text-white shadow-2xl"
      aria-live="polite"
    >
      <img src="/img/logo.svg" alt="" className="h-[3cqw] min-h-[9px] w-auto self-start invert" />
      {s.step === 'function' && (
        <>
          <p className="mt-[10%] text-[max(16px,7.5cqw)] font-bold leading-tight">{C.stepFunction}</p>
          <div className="mt-auto grid grid-cols-2 gap-[3cqw]">
            {FUNCTIONS.map(f => (
              <button key={f.id} data-fn={f.id} className={btn} onClick={() => dispatch({ type: 'pickFunction', id: f.id })}>{f.name}</button>
            ))}
          </div>
        </>
      )}
      {s.step === 'flavor' && (
        <>
          <p className="mt-[10%] text-[max(12px,4.2cqw)] text-white/60">{fn?.name}</p>
          <p className="mt-[1%] text-[max(16px,7.5cqw)] font-bold leading-tight">{C.stepFlavor}</p>
          <div className="mt-auto grid grid-cols-2 gap-[3cqw]">
            {FLAVORS.map(f => (
              <button key={f.id} className={btn} onClick={() => dispatch({ type: 'pickFlavor', id: f.id })}>
                <span aria-hidden className="h-[0.8em] w-[0.8em] rounded-full" style={{ background: f.color }} />
                {f.name}
              </button>
            ))}
            <button className={`${btn} bg-transparent text-white/70`} onClick={() => dispatch({ type: 'back' })}>{C.back}</button>
          </div>
        </>
      )}
      {(s.step === 'pouring' || s.step === 'done') && (
        <div className="mt-auto">
          <p className="text-[max(12px,4.2cqw)] text-white/60">{s.step === 'pouring' ? C.pouring : C.done}</p>
          <p className="mt-[1%] text-[max(16px,7.5cqw)] font-bold leading-tight">{fn?.name} × {flavor?.name}</p>
          <div className="mt-[6%] h-[1.2cqw] min-h-1 overflow-hidden rounded-full bg-white/15">
            <div
              className="h-full rounded-full"
              style={{ background: flavor?.color, width: s.step === 'done' ? '100%' : '0%', animation: s.step === 'pouring' ? `pour-bar ${POUR_MS}ms linear forwards` : undefined }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

function Result() {
  const s = useExp()
  if (s.step !== 'done') return null
  return (
    <div className="pointer-events-auto rounded-3xl bg-white p-6 shadow-xl md:p-8">
      <p className="text-sm font-semibold text-gray-800">{C.done}</p>
      <p className="mt-2 text-[24px] font-bold tracking-[-0.02em] md:text-[32px]">{resultTitle(s.fn!, s.flavor!)}</p>
      <p className="mt-4 text-sm text-gray-800">{C.ingredientsLabel}</p>
      <ul className="mt-1 flex flex-wrap gap-2">
        {findFunction(s.fn!)!.ingredients.map(i => <li key={i} className="rounded-full bg-subtle px-3 py-1 text-sm font-semibold">{i}</li>)}
      </ul>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <CtaLink location="experience">{C.cta}</CtaLink>
        <button className="h-12 rounded-full px-5 text-[15px] font-semibold text-gray-800 hover:bg-subtle" onClick={() => dispatch({ type: 'reset' })}>{C.retry}</button>
      </div>
    </div>
  )
}

export function Experience() {
  const s = usePour()
  const busy = s.step === 'pouring' || s.step === 'done'
  return (
    <section id="experience" aria-labelledby="exp-title" className="relative h-[200svh]">
      <div data-exp-sticky className="sticky top-0 h-dvh overflow-hidden">
        {/* on phones the pour view needs the top of the screen */}
        <div className={`mx-auto max-w-7xl px-5 pt-24 transition-opacity duration-500 md:px-8 md:pt-32 md:opacity-100 ${busy ? 'opacity-0' : ''}`}>
          <p className="text-sm font-semibold text-gray-800">{C.eyebrow}</p>
          <h2 id="exp-title" className="mt-3 whitespace-pre-line text-[26px] font-bold leading-[1.25] tracking-[-0.02em] md:text-[40px]">{C.title}</h2>
          <p className="mt-3 hidden text-[15px] text-gray-800 md:block">{C.hint}</p>
        </div>
        <div data-display-slot className="mt-8 md:absolute md:right-[8%] md:top-1/2 md:mt-0 md:-translate-y-1/2">
          <Panel />
        </div>
        <div className="absolute inset-x-4 bottom-6 md:inset-x-auto md:bottom-[12%] md:left-[max(2rem,calc((100vw-80rem)/2+2rem))] md:w-[26rem]">
          <Result />
        </div>
      </div>
    </section>
  )
}
