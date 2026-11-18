import { Component, Suspense, lazy, useEffect, useState, type ReactNode } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { Dispenser } from './Dispenser'
import { rig } from './rig'
import { useScrollRig } from './useScrollRig'

const debug = new URLSearchParams(location.search).get('debug')
const Debug = lazy(() => import('./Debug'))

class Boundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

function CameraRig() {
  const camera = useThree(s => s.camera) as THREE.PerspectiveCamera
  const target = new THREE.Vector3()
  useFrame(() => {
    const c = rig.cam
    camera.position.set(c.x, c.y, c.z)
    camera.lookAt(target.set(c.tx, c.ty, c.tz))
    if (camera.fov !== c.fov) {
      camera.fov = c.fov
      camera.updateProjectionMatrix()
    }
  })
  return null
}

function Ready({ onReady }: { onReady: () => void }) {
  useEffect(onReady, [onReady])
  return null
}

function ScrollRig() {
  useScrollRig()
  return null
}

export default function Stage({ fallback }: { fallback: ReactNode }) {
  const [ready, setReady] = useState(false)
  const mobile = innerWidth < 768
  return (
    <Boundary fallback={fallback}>
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_40%,#f4f4f4_0%,#e4e4e4_100%)]">
        <Canvas
          className="!pointer-events-none"
          dpr={[1, mobile ? 1.5 : 2]}
          gl={{ antialias: true, alpha: true }}
          camera={{ fov: rig.cam.fov, near: 0.05, far: 50, position: [rig.cam.x, rig.cam.y, rig.cam.z] }}
          onCreated={({ gl }) => { gl.toneMapping = THREE.NoToneMapping }}
        >
          {!debug && <CameraRig />}
          <hemisphereLight args={['#ffffff', '#dcdcdc', 2.8]} />
          <directionalLight position={[2.5, 4, 3]} intensity={1.4} />
          <Suspense fallback={null}>
            <Dispenser />
            <Ready onReady={() => setReady(true)} />
            {!debug && <ScrollRig />}
            {debug && <Debug mode={debug} />}
          </Suspense>
        </Canvas>
      </div>
      <div className={`pointer-events-none fixed inset-0 -z-10 transition-opacity duration-700 ${ready ? 'opacity-0' : 'opacity-100'}`}>{fallback}</div>
    </Boundary>
  )
}
