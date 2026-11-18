// Dev-only helpers for measuring anchors: /?debug=orbit (click logs point + uv), /?debug=front|side (unlit ortho views).
import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { MODEL_HEIGHT } from './anchors'

export default function Debug({ mode }: { mode: string }) {
  const { scene, set, size, gl } = useThree()

  useEffect(() => {
    if (mode !== 'front' && mode !== 'side') return
    scene.traverse(o => {
      const m = o as THREE.Mesh
      if (m.isMesh && (m.material as THREE.MeshStandardMaterial).map) {
        m.material = new THREE.MeshBasicMaterial({ map: (m.material as THREE.MeshStandardMaterial).map })
      }
    })
    gl.setClearColor('#ff00ff', 1)
    // frame y 0..H exactly; 1 world unit = size.height / H px
    const h = MODEL_HEIGHT / 2, w = (h * size.width) / size.height
    const cam = new THREE.OrthographicCamera(-w, w, h, -h, 0.01, 20)
    if (mode === 'front') cam.position.set(0, h, 5)
    else cam.position.set(5, h, 0)
    cam.lookAt(0, h, 0)
    set({ camera: cam })
  }, [mode, scene, set, size, gl])

  // window.__pick(px, py): raycast from viewport px → { point, uv } on the model (for automation).
  const camera = useThree(s => s.camera)
  useEffect(() => {
    const ray = new THREE.Raycaster()
    ;(window as any).__pick = (px: number, py: number) => {
      ray.setFromCamera(new THREE.Vector2((px / size.width) * 2 - 1, -(py / size.height) * 2 + 1), camera)
      const hit = ray.intersectObjects(scene.children, true).find(h => (h.object as THREE.Mesh).isMesh)
      return hit && { point: hit.point.toArray().map(v => +v.toFixed(4)), uv: hit.uv?.toArray().map(v => +v.toFixed(4)) }
    }
  }, [camera, scene, size])

  return mode === 'orbit' ? <OrbitControls target={[0, 1, 0]} makeDefault /> : null
}
