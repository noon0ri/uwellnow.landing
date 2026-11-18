import { SPACES } from '../content/spaces'
import { deviceScreenRect, MODEL_HEIGHT, screenRectToWorld } from '../lib/photoFit'
import { DISPLAY, NOZZLE } from './anchors'

export const FOV = 35
const SPACE_CAM = 5

/** Model base position/scale/yaw, sway (0–1 idle rotation weight), camera position c* and target t*. */
export type Pose = {
  x: number; y: number; scale: number; rotY: number; sway: number
  cx: number; cy: number; cz: number; tx: number; ty: number; tz: number
}
export type Stop = { y: number; pose: Pose }
type Vec3 = [number, number, number]

/** Measured document scroll positions (px) of the sections, plus viewport size. */
export type Layout = {
  vw: number; vh: number
  features: number[] // scroll y where each feature block fills the screen
  spaces: { top: number; stickyStart: number; stickyEnd: number }
  spec: { top: number; holdEnd: number }
  experience: { top: number }
}

const viewHeight = (d: number) => 2 * d * Math.tan(((FOV / 2) * Math.PI) / 180)

export function anchorWorld(a: Vec3, m: { x: number; y: number; scale: number; rotY: number }): Vec3 {
  const c = Math.cos(m.rotY), s = Math.sin(m.rotY)
  return [m.x + (a[0] * c + a[2] * s) * m.scale, m.y + a[1] * m.scale, (-a[0] * s + a[2] * c) * m.scale]
}

/** Camera `dist` in front of a model anchor; the anchor lands `dx`, `dy` world units right/up of screen center. */
function lookAt(model: Omit<Pose, 'cx' | 'cy' | 'cz' | 'tx' | 'ty' | 'tz'>, anchor: Vec3, dist: number, dx = 0, dy = 0): Pose {
  const [ax, ay, az] = anchorWorld(anchor, model)
  return { ...model, cx: ax - dx, cy: ay - dy, cz: az + dist, tx: ax - dx, ty: ay - dy, tz: az }
}

/** Model framed so its full height covers screen rect `r` (camera fixed at z=SPACE_CAM). */
function onScreenRect(r: { cx: number; cy: number; h: number }, vw: number, vh: number, rotY: number): Pose {
  const w = screenRectToWorld(r, vw, vh, { fovDeg: FOV, distance: SPACE_CAM })
  return { x: w.x, y: w.y - (MODEL_HEIGHT / 2) * w.scale, scale: w.scale, rotY, sway: 0, cx: 0, cy: 0, cz: SPACE_CAM, tx: 0, ty: 0, tz: 0 }
}

export function heroPose(vw: number, vh: number): Pose {
  const wide = vw / vh > 1
  const base = { x: wide ? 0.55 : 0, y: 0, scale: 1, rotY: 0, sway: 1 }
  return wide ? { ...base, cx: 0, cy: 0.95, cz: 4.4, tx: 0, ty: 0.9, tz: 0 } : { ...base, cx: 0, cy: 0.95, cz: 6, tx: 0, ty: 0.55, tz: 0 }
}

/** Display filling `fill` of the screen height, centred at (sx, sy) as fractions of the viewport. */
export function displayPose(vw: number, vh: number, fill: number, sx: number, sy: number, rotY = 0): Pose {
  const d = DISPLAY.height / fill / viewHeight(1)
  const perPx = viewHeight(d) / vh
  return lookAt({ x: 0, y: 0, scale: 1, rotY, sway: 0 }, DISPLAY.center, d, (sx - 0.5) * vw * perPx, (0.5 - sy) * vh * perPx)
}

/** Display bottom, nozzle and cup in frame, for the pour. */
export function pourPose(vw: number, vh: number): Pose {
  const wide = vw / vh > 1
  const mid: Vec3 = [NOZZLE[0], 1.15, NOZZLE[2]]
  return lookAt({ x: 0, y: 0, scale: 1, rotY: -0.25, sway: 0 }, mid, wide ? 1.55 : 2.2, wide ? 0.45 : 0, wide ? 0 : 0.12)
}

export function buildStops(l: Layout): Stop[] {
  const { vw, vh } = l
  const wide = vw / vh > 1
  const hero = heroPose(vw, vh)
  const features: Pose[] = [
    wide ? displayPose(vw, vh, 0.6, 0.7, 0.5, -0.2) : displayPose(vw, vh, 0.42, 0.5, 0.3, -0.2),
    lookAt({ x: 0, y: 0, scale: 1, rotY: -0.5, sway: 0 }, [NOZZLE[0], 1.0, NOZZLE[2]], wide ? 1.15 : 1.5, wide ? 0.3 : 0, wide ? 0 : 0.2),
    { ...hero, rotY: 0.4, sway: 0 },
  ]
  const stops: Stop[] = [
    { y: 0, pose: hero },
    { y: vh * 0.15, pose: hero },
  ]
  l.features.forEach((y, k) => {
    stops.push({ y, pose: features[k] }, { y: y + vh * 0.4, pose: features[k] })
  })

  const span = l.spaces.stickyEnd - l.spaces.stickyStart
  SPACES.forEach((s, i) => {
    const aligned = onScreenRect(deviceScreenRect(s, vw, vh), vw, vh, s.rotY)
    stops.push({ y: l.spaces.stickyStart + (span * (i + 0.4)) / 5, pose: aligned }, { y: l.spaces.stickyStart + (span * (i + 1)) / 5, pose: aligned })
  })

  const spec = onScreenRect({ cx: vw / 2, cy: vh / 2, h: vh * 0.7 }, vw, vh, 0)
  stops.push({ y: l.spec.top, pose: spec }, { y: l.spec.holdEnd, pose: spec })

  const exp = wide ? displayPose(vw, vh, 0.8, 0.62, 0.52) : displayPose(vw, vh, 0.6, 0.5, 0.6)
  stops.push({ y: l.experience.top, pose: exp })
  return stops
}

const KEYS = ['x', 'y', 'scale', 'rotY', 'sway', 'cx', 'cy', 'cz', 'tx', 'ty', 'tz'] as const

export function lerpPose(a: Pose, b: Pose, t: number): Pose {
  const out = { ...a }
  for (const k of KEYS) out[k] = a[k] + (b[k] - a[k]) * t
  return out
}

export function poseAt(y: number, stops: Stop[], ease: (t: number) => number): Pose {
  if (y <= stops[0].y) return stops[0].pose
  for (let i = 1; i < stops.length; i++) {
    const a = stops[i - 1], b = stops[i]
    if (y <= b.y) return b.y === a.y ? b.pose : lerpPose(a.pose, b.pose, ease((y - a.y) / (b.y - a.y)))
  }
  return stops[stops.length - 1].pose
}
