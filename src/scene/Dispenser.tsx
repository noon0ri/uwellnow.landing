import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { ContactShadows, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { rig } from './rig'
import { BAKED_CUP_CLIP, MODEL_HEIGHT } from './anchors'

export const MODEL_URL = '/models/dispenser.glb'

// Discard the cup baked into the mesh so the animated cup (Cup.tsx) is the only one.
// Works in normalized-model space: world position mapped back through the group's inverse matrix.
const clipUniform = { value: new THREE.Matrix4() }
function clipBakedCup(mat: THREE.MeshStandardMaterial) {
  const { center, radius, y0, y1 } = BAKED_CUP_CLIP
  mat.onBeforeCompile = sh => {
    sh.uniforms.uToModel = clipUniform
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vWorldPos;')
      .replace('#include <project_vertex>', '#include <project_vertex>\nvWorldPos = (modelMatrix * vec4(transformed, 1.0)).xyz;')
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vWorldPos;\nuniform mat4 uToModel;')
      .replace(
        'void main() {',
        `void main() {
  vec3 mp = (uToModel * vec4(vWorldPos, 1.0)).xyz;
  if (mp.y > ${y0.toFixed(3)} && mp.y < ${y1.toFixed(3)} && distance(mp.xz, vec2(${center[0].toFixed(3)}, ${center[1].toFixed(3)})) < ${radius.toFixed(3)}) discard;`,
      )
  }
}

export function Dispenser() {
  const { scene } = useGLTF(MODEL_URL)
  const group = useRef<THREE.Group>(null)
  const shadow = useRef<THREE.Group>(null)

  // Normalize: MODEL_HEIGHT tall, base on y=0, centered on x/z.
  const { model, materials } = useMemo(() => {
    const model = scene.clone(true)
    const box = new THREE.Box3().setFromObject(model)
    const size = box.getSize(new THREE.Vector3())
    const s = MODEL_HEIGHT / size.y
    model.scale.setScalar(s)
    const c = box.getCenter(new THREE.Vector3())
    model.position.set(-c.x * s, -box.min.y * s, -c.z * s)
    const materials: THREE.MeshStandardMaterial[] = []
    model.traverse(o => {
      if ((o as THREE.Mesh).isMesh) {
        const m = o as THREE.Mesh
        const mat = (m.material as THREE.MeshStandardMaterial).clone()
        mat.side = THREE.FrontSide
        clipBakedCup(mat)
        m.material = mat
        materials.push(mat)
      }
    })
    return { model, materials }
  }, [scene])

  useFrame(() => {
    const g = group.current
    if (!g) return
    const m = rig.model
    g.position.set(m.x, m.y, 0)
    g.rotation.y = m.rotY
    g.scale.setScalar(m.scale)
    g.updateMatrixWorld()
    clipUniform.value.copy(g.matrixWorld).invert()
    g.visible = m.opacity > 0.001
    if (shadow.current) shadow.current.visible = m.opacity >= 0.999
    for (const mat of materials) {
      mat.transparent = m.opacity < 0.999
      mat.opacity = m.opacity
      mat.depthWrite = m.opacity >= 0.999
    }
  })

  return (
    <group ref={group}>
      <primitive object={model} />
      <group ref={shadow}>
        <ContactShadows position={[0, 0.002, 0]} opacity={0.5} scale={2.4} blur={2.2} far={1.2} resolution={512} />
      </group>
    </group>
  )
}

useGLTF.preload(MODEL_URL)
