import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { spaceOpacities } from '../lib/spacePhase'
import { buildStops, lerpPose, poseAt, pourPose, type Layout, type Stop } from './poses'
import { rig } from './rig'

const smooth = (t: number) => t * t * (3 - 2 * t)
const step = (t: number) => (t < 0.5 ? 0 : 1)
const absTop = (el: Element) => el.getBoundingClientRect().top + scrollY

function measure(): Layout | null {
  const q = (s: string) => document.querySelector<HTMLElement>(s)
  const spaces = q('#spaces'), spacesSticky = q('[data-spaces-sticky]'), spec = q('#spec'), specSticky = q('[data-spec-sticky]'), exp = q('#experience')
  if (!spaces || !spacesSticky || !spec || !specSticky || !exp) return null
  const spacesTop = absTop(spaces), specTop = absTop(spec)
  return {
    vw: innerWidth,
    vh: innerHeight,
    features: [...document.querySelectorAll('[data-feature]')].map(absTop),
    spaces: { top: spacesTop, stickyStart: spacesTop, stickyEnd: spacesTop + spaces.offsetHeight - spacesSticky.offsetHeight },
    spec: { top: specTop, holdEnd: specTop + spec.offsetHeight - specSticky.offsetHeight },
    experience: { top: absTop(exp) },
  }
}

/** Drives rig + space photo opacities from a smoothed scroll position, every frame. */
export function useScrollRig() {
  const s = useRef<{ layout: Layout | null; stops: Stop[]; y: number; photos: HTMLElement[]; reduced: boolean }>({
    layout: null, stops: [], y: scrollY, photos: [], reduced: false,
  })

  useEffect(() => {
    const st = s.current
    const mq = matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => {
      st.layout = measure()
      st.stops = st.layout ? buildStops(st.layout) : []
      st.photos = [...document.querySelectorAll<HTMLElement>('[data-space-photo]')]
      st.reduced = mq.matches
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(document.body)
    mq.addEventListener('change', update)
    rig.ready = true
    return () => {
      ro.disconnect()
      mq.removeEventListener('change', update)
      rig.ready = false
    }
  }, [])

  useFrame(({ clock }, dt) => {
    const st = s.current
    const l = st.layout
    if (!l || !st.stops.length) return
    st.y = st.reduced ? scrollY : st.y + (scrollY - st.y) * (1 - Math.exp(-dt * 9))
    const y = st.y

    let pose = poseAt(y, st.stops, st.reduced ? step : smooth)
    // Experience: blend toward the pour view once the section is on screen.
    const expIn = Math.min(1, Math.max(0, (y - (l.experience.top - l.vh * 0.5)) / (l.vh * 0.5)))
    if (rig.exp.blend > 0 && expIn > 0) pose = lerpPose(pose, pourPose(l.vw, l.vh), rig.exp.blend * expIn)

    const m = rig.model
    m.x = pose.x
    m.y = pose.y
    m.scale = pose.scale
    m.rotY = pose.rotY + (st.reduced ? 0 : pose.sway * 0.35 * Math.sin(clock.elapsedTime * 0.5))
    Object.assign(rig.cam, { x: pose.cx, y: pose.cy, z: pose.cz, tx: pose.tx, ty: pose.ty, tz: pose.tz })

    // Baton handoff: model ↔ photo opacities inside the spaces section.
    const span = l.spaces.stickyEnd - l.spaces.stickyStart
    const p = (y - l.spaces.stickyStart) / span
    const o = spaceOpacities(p, st.photos.length || 5)
    m.opacity = p > 0 && p < 1 ? o.model : 1
    st.photos.forEach((el, i) => {
      const v = p > 0 && p < 1 ? o.photo[i] : 0
      const css = v.toFixed(3)
      if (el.style.opacity !== css) el.style.opacity = css
    })
  }, -1)
}
