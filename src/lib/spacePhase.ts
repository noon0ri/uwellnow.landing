const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
const ramp = (t: number, a: number, b: number) => clamp01((t - a) / (b - a))

/**
 * Opacities across the spaces section (p in [0,1], n spaces). Per space segment:
 * 0–40% the 3D model travels to the photo's device, 40–50% model→photo crossfade,
 * 50–90% photo holds, 90–100% photo→model.
 */
export function spaceOpacities(p: number, n: number): { photo: number[]; model: number } {
  const t = clamp01(p) * n
  const i = Math.min(n - 1, Math.floor(t))
  const local = t - i
  const v = Math.min(ramp(local, 0.4, 0.5), 1 - ramp(local, 0.9, 1))
  const photo = Array.from({ length: n }, (_, k) => (k === i ? v : 0))
  return { photo, model: 1 - v }
}
