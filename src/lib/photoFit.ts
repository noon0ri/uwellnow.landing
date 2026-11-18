import type { Space } from '../content/spaces'

export const MODEL_HEIGHT = 1.77

export type ScreenRect = { cx: number; cy: number; h: number }

/** Where an image lands in the viewport under `object-fit: cover; object-position: fx fy` (fractions; px result, may be negative). */
export function coverRect(imgW: number, imgH: number, vw: number, vh: number, fx = 0.5, fy = 0.5) {
  const s = Math.max(vw / imgW, vh / imgH)
  const w = imgW * s
  const h = imgH * s
  return { x: (vw - w) * fx, y: (vh - h) * fy, w, h }
}

/** object-position fractions that put the device at the viewport centre as far as the crop allows. */
export function photoFocus(space: Space, vw: number, vh: number) {
  const { w, h } = coverRect(space.w, space.h, vw, vh)
  const { x0, y0, x1, y1 } = space.device
  const axis = (view: number, size: number, c: number) =>
    size - view < 1 ? 0.5 : Math.min(1, Math.max(0, (c * size - view / 2) / (size - view)))
  return { x: axis(vw, w, (x0 + x1) / 2), y: axis(vh, h, (y0 + y1) / 2) }
}

/** The device's box in a space photo, mapped to viewport px. */
export function deviceScreenRect(space: Space, vw: number, vh: number): ScreenRect {
  const f = photoFocus(space, vw, vh)
  const r = coverRect(space.w, space.h, vw, vh, f.x, f.y)
  const { x0, y0, x1, y1 } = space.device
  return { cx: r.x + ((x0 + x1) / 2) * r.w, cy: r.y + ((y0 + y1) / 2) * r.h, h: (y1 - y0) * r.h }
}

/**
 * World x/y (of the model's center) and scale so a MODEL_HEIGHT-tall model projects onto `r`,
 * for a camera at (0, 0, distance) looking down -z at the origin.
 */
export function screenRectToWorld(r: ScreenRect, vw: number, vh: number, cam: { fovDeg: number; distance: number }) {
  const viewH = 2 * cam.distance * Math.tan(((cam.fovDeg / 2) * Math.PI) / 180)
  const perPx = viewH / vh
  return { x: (r.cx - vw / 2) * perPx, y: (vh / 2 - r.cy) * perPx, scale: (r.h * perPx) / MODEL_HEIGHT }
}
