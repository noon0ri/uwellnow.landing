// Mutable scene state written by scroll timelines and read every frame (no React re-renders).
const defaults = () => ({
  model: { rotY: 0, x: 0, y: 0, scale: 1, opacity: 1 },
  cam: { x: 0, y: 0.9, z: 5, tx: 0, ty: 0.9, tz: 0, fov: 35 },
  photo: [0, 0, 0, 0, 0],
  pour: { progress: 0, color: '#FFC24B' },
})

export type Rig = ReturnType<typeof defaults>

export const rig: Rig = defaults()

export function resetRig() {
  Object.assign(rig, defaults())
}

if (import.meta.env.DEV) (window as unknown as { __rig: Rig }).__rig = rig
