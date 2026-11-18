import { anchorWorld, buildStops, poseAt, type Layout } from '../src/scene/poses'
import { SPACES } from '../src/content/spaces'
import { deviceScreenRect, screenRectToWorld } from '../src/lib/photoFit'

const vw = 1440, vh = 900
const layout: Layout = {
  vw, vh,
  features: [900, 1800, 2700],
  spaces: { top: 3600, stickyStart: 3600, stickyEnd: 3600 + 5850 },
  spec: { top: 10350, holdEnd: 10800 },
  experience: { top: 11700 },
}
const ease = (t: number) => t

test('stops are sorted by scroll position', () => {
  const ys = buildStops(layout).map(s => s.y)
  expect([...ys].sort((a, b) => a - b)).toEqual(ys)
})

test('poseAt clamps before the first and after the last stop', () => {
  const stops = buildStops(layout)
  expect(poseAt(-500, stops, ease)).toEqual(stops[0].pose)
  expect(poseAt(1e9, stops, ease)).toEqual(stops[stops.length - 1].pose)
})

test('each space: from 40% to 100% of its segment the model sits on the photo device', () => {
  const stops = buildStops(layout)
  const span = layout.spaces.stickyEnd - layout.spaces.stickyStart
  SPACES.forEach((s, i) => {
    const w = screenRectToWorld(deviceScreenRect(s, vw, vh), vw, vh, { fovDeg: 35, distance: 5 })
    for (const local of [0.4, 0.7, 0.99]) {
      const p = poseAt(layout.spaces.stickyStart + (span * (i + local)) / 5, stops, ease)
      expect(p.x).toBeCloseTo(w.x)
      expect(p.y + (1.77 / 2) * p.scale).toBeCloseTo(w.y) // pose y is the base; w.y is the center
      expect(p.scale).toBeCloseTo(w.scale)
      expect(p.rotY).toBeCloseTo(s.rotY)
      expect([p.cx, p.cy, p.cz, p.tx, p.ty, p.tz]).toEqual([0, 0, 5, 0, 0, 0])
    }
  })
})

test('anchorWorld applies yaw, scale and position like three.js', () => {
  const a = anchorWorld([1, 0, 0], { x: 0, y: 0, scale: 1, rotY: Math.PI / 2 })
  expect(a[0]).toBeCloseTo(0)
  expect(a[2]).toBeCloseTo(-1)
  const b = anchorWorld([0, 1, 0], { x: 2, y: 1, scale: 2, rotY: 0 })
  expect(b).toEqual([2, 3, 0])
})
