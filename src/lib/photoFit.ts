import type { Space } from '../content/spaces'

export const MODEL_HEIGHT = 1.77

export type ScreenRect = { cx: number; cy: number; h: number }

/** Where an image lands in the viewport under `object-fit: cover; object-position: center` (px, may be negative). */
export function coverRect(imgW: number, imgH: number, vw: number, vh: number) {
  const s = Math.max(vw / imgW, vh / imgH)
  const w = imgW * s
  const h = imgH * s
  return { x: (vw - w) / 2, y: (vh - h) / 2, w, h }
}

/** The device's box in a space photo, mapped to viewport px. */
export function deviceScreenRect(space: Space, vw: number, vh: number): ScreenRect {
  const r = coverRect(space.w, space.h, vw, vh)
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
