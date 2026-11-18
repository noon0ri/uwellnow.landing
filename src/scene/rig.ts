// Mutable scene state written by the scroll driver / tweens and read every frame (no React re-renders).
const defaults = () => ({
  ready: false, // 3D is drawing; the scroll driver then owns the space photo opacities
  model: { rotY: 0, x: 0, y: 0, scale: 1, opacity: 1 },
  cam: { x: 0, y: 0.95, z: 5, tx: 0, ty: 0.9, tz: 0, fov: 35 },
  exp: { blend: 0 }, // 0 = display close-up, 1 = pour view (tweened in the experience)
  pour: { progress: 0, color: '#FFC24B' },
})

export type Rig = ReturnType<typeof defaults>

export const rig: Rig = defaults()

if (import.meta.env.DEV) (window as unknown as { __rig: Rig }).__rig = rig
