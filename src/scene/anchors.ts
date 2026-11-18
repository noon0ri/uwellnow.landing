// Points on the normalized model (base at y=0, centered on x/z, 1.77 tall), measured from
// unlit orthographic renders (/?debug=front|side) on 2026-11-18.
export { MODEL_HEIGHT } from '../lib/photoFit'

export const DISPLAY = { center: [-0.199, 1.499, 0.014] as [number, number, number], width: 0.362, height: 0.543 }
/** Bottom of the nozzle (blue light). */
export const NOZZLE: [number, number, number] = [-0.202, 1.1, 0.12]
/** Counter top under the nozzle, where the cup stands. */
export const CUP_BASE: [number, number, number] = [-0.202, 0.892, 0.115]
/** The baked-in cup is part of the mesh; fragments inside this cylinder are discarded. */
export const BAKED_CUP_CLIP = { center: [-0.202, 0.115] as [number, number], radius: 0.055, y0: 0.895, y1: 1.085 }
