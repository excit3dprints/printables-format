import { useRef, useEffect, useState, useCallback } from 'react'
import * as THREE from 'three'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const COLOR_PRESETS = [
  { name: 'Spark',  hex: '#b46ef5' },
  { name: 'Brand',  hex: '#5c3d8f' },
  { name: 'Ghost',  hex: '#c8b4f0' },
  { name: 'Ember',  hex: '#ff6b35' },
  { name: 'Carbon', hex: '#1a1a2e' },
]

const VIEWPOINTS = [
  { label: 'Iso',    key: 'iso',    pos: (r: number) => new THREE.Vector3( r * 1.7,  r * 1.2,  r * 1.7) },
  { label: 'Front',  key: 'front',  pos: (r: number) => new THREE.Vector3( 0,        0,         r * 2.5) },
  { label: 'Back',   key: 'back',   pos: (r: number) => new THREE.Vector3( 0,        0,        -r * 2.5) },
  { label: 'Left',   key: 'left',   pos: (r: number) => new THREE.Vector3(-r * 2.5,  0,         0)       },
  { label: 'Right',  key: 'right',  pos: (r: number) => new THREE.Vector3( r * 2.5,  0,         0)       },
  { label: 'Top',    key: 'top',    pos: (r: number) => new THREE.Vector3( 0,        r * 2.5,   0.001)   },
  { label: 'Bottom', key: 'bottom', pos: (r: number) => new THREE.Vector3( 0,       -r * 2.5,   0.001)   },
]

interface Props {
  onFileLoaded?: (filename: string) => void
}

export default function ModelViewer({ onFileLoaded }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef    = useRef<HTMLCanvasElement>(null)
  const rendererRef  = useRef<THREE.WebGLRenderer | null>(null)
  const sceneRef     = useRef<THREE.Scene | null>(null)
  const cameraRef    = useRef<THREE.PerspectiveCamera | null>(null)
  const controlsRef  = useRef<OrbitControls | null>(null)
  const meshRef      = useRef<THREE.Mesh | null>(null)
  const animFrameRef = useRef<number>(0)
  const radiusRef    = useRef<number>(1)

  const [modelColor,    setModelColor]    = useState('#b46ef5')
  const [hasModel,      setHasModel]      = useState(false)
  const [activeView,    setActiveView]    = useState<string>('iso')
  const [modelFileName, setModelFileName] = useState<string>('')

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Initialize Three.js scene once
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      preserveDrawingBuffer: true,
      canvas: canvasRef.current ?? undefined,
    })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.setClearColor(0x0a0710, 1)
    renderer.shadowMap.enabled = true
    rendererRef.current = renderer

    if (!canvasRef.current) {
      container.appendChild(renderer.domElement)
    }

    // Scene
    const scene = new THREE.Scene()
    sceneRef.current = scene

    // Camera
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000,
    )
    camera.position.set(5, 3.5, 5)
    cameraRef.current = camera

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.08
    // Clear the active view label when the user starts dragging manually
    controls.addEventListener('start', () => setActiveView(''))
    controlsRef.current = controls

    // ── Lighting ─────────────────────────────────────────────────────────
    // Neutral white lights give accurate color representation and clean shadows

    // Soft fill from all directions
    const ambient = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambient)

    // Key light — upper front-right (main shadow caster)
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.8)
    keyLight.position.set(5, 10, 7.5)
    scene.add(keyLight)

    // Fill light — upper back-left, softer
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.7)
    fillLight.position.set(-6, 4, -6)
    scene.add(fillLight)

    // Rim/base light — subtle upward bounce to lift the bottom
    const rimLight = new THREE.DirectionalLight(0xffffff, 0.25)
    rimLight.position.set(0, -5, 2)
    scene.add(rimLight)
    // ─────────────────────────────────────────────────────────────────────

    // Animation loop
    function animate() {
      animFrameRef.current = requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    // Resize observer
    const ro = new ResizeObserver(() => {
      if (!container) return
      const w = container.clientWidth
      const h = container.clientHeight
      renderer.setSize(w, h)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    })
    ro.observe(container)

    return () => {
      cancelAnimationFrame(animFrameRef.current)
      ro.disconnect()
      controls.dispose()
      if (meshRef.current) {
        meshRef.current.geometry.dispose()
        ;(meshRef.current.material as THREE.Material).dispose()
      }
      renderer.dispose()
    }
  }, [])

  // Sync mesh color whenever the color picker changes
  useEffect(() => {
    if (meshRef.current) {
      ;(meshRef.current.material as THREE.MeshStandardMaterial).color.set(modelColor)
    }
  }, [modelColor])

  // Snap camera to a named viewpoint
  const snapToView = useCallback((key: string) => {
    const camera   = cameraRef.current
    const controls = controlsRef.current
    if (!camera || !controls) return

    const vp  = VIEWPOINTS.find(v => v.key === key)
    if (!vp) return

    const pos = vp.pos(radiusRef.current)
    camera.position.copy(pos)
    controls.target.set(0, 0, 0)
    controls.update()
    setActiveView(key)
  }, [])

  const loadSTLBuffer = useCallback((buffer: ArrayBuffer, fileName: string) => {
    const scene  = sceneRef.current
    const camera = cameraRef.current
    if (!scene || !camera) return

    // Remove previous mesh
    if (meshRef.current) {
      scene.remove(meshRef.current)
      meshRef.current.geometry.dispose()
      ;(meshRef.current.material as THREE.Material).dispose()
      meshRef.current = null
    }

    const loader   = new STLLoader()
    const geometry = loader.parse(buffer)
    geometry.center()

    const material = new THREE.MeshStandardMaterial({
      color:     modelColor,
      metalness: 0.1,
      roughness: 0.55,
    })

    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)
    meshRef.current = mesh

    // Fit camera distance to model size
    geometry.computeBoundingSphere()
    const r = geometry.boundingSphere?.radius ?? 1
    radiusRef.current    = r
    camera.near          = r * 0.01
    camera.far           = r * 100
    camera.updateProjectionMatrix()

    if (controlsRef.current) {
      controlsRef.current.target.set(0, 0, 0)
      controlsRef.current.update()
    }

    setModelFileName(fileName)
    setHasModel(true)
    onFileLoaded?.(fileName)

    // Default to iso view after load
    snapToView('iso')
  }, [modelColor, snapToView])

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    file.arrayBuffer().then(buf => loadSTLBuffer(buf, file.name))
    e.target.value = ''
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    const file = e.dataTransfer.files?.[0]
    if (!file || !file.name.toLowerCase().endsWith('.stl')) return
    file.arrayBuffer().then(buf => loadSTLBuffer(buf, file.name))
  }

  function handleScreenshot() {
    const renderer = rendererRef.current
    if (!renderer) return

    const base = modelFileName
      ? modelFileName.replace(/\.stl$/i, '').replace(/[^a-z0-9_\-]/gi, '_').toLowerCase()
      : 'model'
    const view     = activeView || 'custom'
    const filename = `${base}_${view}.png`

    const url = renderer.domElement.toDataURL('image/png')
    const a   = document.createElement('a')
    a.href     = url
    a.download = filename
    a.click()
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-void overflow-hidden"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* No-model placeholder */}
      {!hasModel && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <div className="text-slate text-4xl mb-3">⬡</div>
            <p className="font-rajdhani text-ash text-sm tracking-wide">
              Drop an STL or click Load STL
            </p>
          </div>
        </div>
      )}

      {/* Top overlay — viewpoint buttons */}
      {hasModel && (
        <div className="absolute top-0 left-0 right-0 px-3 pt-2 flex items-center gap-1.5 flex-wrap bg-gradient-to-b from-void/80 to-transparent pb-4">
          <span className="font-rajdhani text-xs text-slate uppercase tracking-wider mr-0.5">View</span>
          {VIEWPOINTS.map(vp => (
            <button
              key={vp.key}
              onClick={() => snapToView(vp.key)}
              className="font-rajdhani text-xs px-2 py-0.5 rounded transition-colors"
              style={{
                background:  activeView === vp.key ? '#3d2b63' : 'rgba(16,12,26,0.7)',
                color:       activeView === vp.key ? '#b46ef5' : '#8b8099',
                border:      activeView === vp.key ? '1px solid #5c3d8f' : '1px solid #2a1d42',
              }}
            >
              {vp.label}
            </button>
          ))}
          {!activeView && (
            <span className="font-rajdhani text-xs text-slate italic ml-1">custom</span>
          )}
        </div>
      )}

      {/* Bottom overlay — color + actions */}
      <div className="absolute bottom-0 left-0 right-0 p-3 flex items-center justify-between gap-3 bg-gradient-to-t from-void/90 to-transparent">
        {/* Color presets */}
        <div className="flex items-center gap-2">
          <span className="font-rajdhani text-xs text-slate uppercase tracking-wider mr-1">Color</span>
          {COLOR_PRESETS.map(preset => (
            <button
              key={preset.name}
              title={preset.name}
              onClick={() => setModelColor(preset.hex)}
              style={{
                backgroundColor: preset.hex,
                width:  22,
                height: 22,
                borderRadius: '50%',
                border: modelColor === preset.hex ? '2px solid #b46ef5' : '2px solid transparent',
                boxShadow: modelColor === preset.hex ? '0 0 8px #b46ef5' : 'none',
                transition: 'box-shadow 0.2s, border-color 0.2s',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            />
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".stl"
            className="hidden"
            onChange={handleFileInput}
          />
          <button
            className="btn-ghost text-xs py-1 px-3"
            onClick={() => fileInputRef.current?.click()}
          >
            Load STL
          </button>
          <button
            className="btn-ghost text-xs py-1 px-3"
            onClick={handleScreenshot}
            disabled={!hasModel}
            title={
              hasModel
                ? `Save as ${modelFileName.replace(/\.stl$/i, '').toLowerCase() || 'model'}_${activeView || 'custom'}.png`
                : 'Load a model first'
            }
          >
            Save Screenshot
          </button>
        </div>
      </div>
    </div>
  )
}
