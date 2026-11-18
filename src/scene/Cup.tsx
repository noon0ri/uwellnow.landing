import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { CUP_BASE, NOZZLE } from './anchors'
import { rig } from './rig'

const H = 0.12, R_TOP = 0.037, R_BOT = 0.031, WALL = 0.003
const SPOUT_Y = NOZZLE[1] - 0.035 // spout tip under the nozzle housing

/** Glass tumbler under the nozzle; liquid height and stream follow rig.pour. Lives in model space. */
export function Cup() {
  const liquid = useRef<THREE.Mesh>(null)
  const stream = useRef<THREE.Mesh>(null)
  const mats = useMemo(() => ({
    glass: new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.05, metalness: 0, transparent: true, opacity: 0.28, depthWrite: false, side: THREE.DoubleSide }),
    liquid: new THREE.MeshStandardMaterial({ color: rig.pour.color, roughness: 0.2, transparent: true, opacity: 0.9 }),
    rim: new THREE.MeshStandardMaterial({ color: '#c9c9c9', roughness: 0.3, metalness: 0.6, transparent: true }),
  }), [])

  useFrame(() => {
    const p = rig.pour.progress
    const o = rig.model.opacity
    mats.liquid.color.set(rig.pour.color)
    mats.glass.opacity = 0.28 * o
    mats.liquid.opacity = 0.9 * o
    mats.rim.opacity = o
    const h = Math.max(0.0001, p * (H - 0.012))
    if (liquid.current) {
      liquid.current.visible = p > 0.001
      liquid.current.scale.y = h
      liquid.current.position.y = WALL + h / 2
    }
    if (stream.current) {
      const top = SPOUT_Y - CUP_BASE[1], bottom = WALL + h
      stream.current.visible = p > 0.001 && p < 0.97
      stream.current.scale.y = top - bottom
      stream.current.position.y = (top + bottom) / 2
    }
  })

  return (
    <group position={CUP_BASE}>
      <mesh material={mats.glass} position={[0, H / 2, 0]}>
        <cylinderGeometry args={[R_TOP, R_BOT, H, 40, 1, true]} />
      </mesh>
      <mesh material={mats.glass} position={[0, WALL / 2, 0]}>
        <cylinderGeometry args={[R_BOT, R_BOT, WALL, 40]} />
      </mesh>
      <mesh material={mats.rim} position={[0, H, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[R_TOP, 0.0018, 8, 48]} />
      </mesh>
      {/* unit-height cylinders scaled per frame */}
      <mesh ref={liquid} material={mats.liquid}>
        <cylinderGeometry args={[R_TOP - 0.004, R_BOT - 0.002, 1, 40]} />
      </mesh>
      <mesh ref={stream} material={mats.liquid}>
        <cylinderGeometry args={[0.0045, 0.0055, 1, 12]} />
      </mesh>
    </group>
  )
}
