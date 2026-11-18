import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { DISPLAY } from './anchors'
import { viewport } from '../lib/viewport'

const [cx, cy, cz] = DISPLAY.center
const CORNERS = [-1, 1].flatMap(sx => [-1, 1].map(sy => new THREE.Vector3(cx + (sx * DISPLAY.width) / 2, cy + (sy * DISPLAY.height) / 2, cz + 0.002)))

/** Pins the Experience panel (DOM) over the model's display. Lives inside the model group (model space). */
export function DisplayTracker() {
  const anchor = useRef<THREE.Group>(null)
  const camera = useThree(s => s.camera)
  const v = new THREE.Vector3()

  // On unmount, hand the panel back to its fallback card layout.
  useEffect(() => () => {
    document.querySelector<HTMLElement>('[data-display-slot]')?.style.removeProperty('position')
    document.querySelector<HTMLElement>('[data-display-panel]')?.removeAttribute('style')
  }, [])

  useFrame(() => {
    const slot = document.querySelector<HTMLElement>('[data-display-slot]')
    const panel = slot?.querySelector<HTMLElement>('[data-display-panel]')
    const box = slot?.closest<HTMLElement>('[data-exp-sticky]')
    if (!slot || !panel || !box || !anchor.current) return
    if (slot.style.position !== 'static') slot.style.cssText = 'position:static;transform:none;translate:none;margin:0'
    const c = box.getBoundingClientRect()
    const { w, h } = viewport()
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity
    for (const p of CORNERS) {
      v.copy(p).applyMatrix4(anchor.current.matrixWorld).project(camera)
      const x = ((v.x + 1) / 2) * w, y = ((1 - v.y) / 2) * h
      x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y)
    }
    panel.style.cssText = `position:absolute;left:${x0 - c.left}px;top:${y0 - c.top}px;width:${x1 - x0}px;height:${y1 - y0}px;max-height:none;margin:0;box-shadow:none`
  })

  return <group ref={anchor} />
}
