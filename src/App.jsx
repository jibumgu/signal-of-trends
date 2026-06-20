import { useEffect, useMemo, useRef, useState } from 'react'
import { Power, Sparkles } from 'lucide-react'
import * as THREE from 'three'
import './App.css'

const eras = [
  {
    decade: '1970s',
    signal: 'warm tube signal',
    palette: '#d67a3d',
    products: [
      {
        name: 'Portable Record Player',
        type: 'sound',
        copy: 'Drop the needle and the room slows down into warm analog rotation.',
        action: 'needle down',
      },
      {
        name: 'Instant Camera',
        type: 'image',
        copy: 'A white frame develops slowly, turning memory into an object.',
        action: 'developing',
      },
      {
        name: 'Rotary Telephone',
        type: 'voice',
        copy: 'Every number takes patience, and every call has a little ceremony.',
        action: 'dialing',
      },
    ],
  },
  {
    decade: '1980s',
    signal: 'neon broadcast',
    palette: '#29a7c9',
    products: [
      {
        name: 'Cassette Walkman',
        type: 'sound',
        copy: 'A private soundtrack clicks into place, rewinding fashion by hand.',
        action: 'tape running',
      },
      {
        name: 'Arcade Joystick',
        type: 'play',
        copy: 'Pixel scores, plastic buttons, and a public kind of competition.',
        action: 'coin inserted',
      },
      {
        name: 'Video Camcorder',
        type: 'image',
        copy: 'The family archive becomes handheld, fuzzy, and strangely bright.',
        action: 'recording',
      },
    ],
  },
  {
    decade: '1990s',
    signal: 'channel surf',
    palette: '#8a78d6',
    products: [
      {
        name: 'Pager',
        type: 'message',
        copy: 'A tiny vibration turns numbers into urgency and belonging.',
        action: 'beep received',
      },
      {
        name: 'Discman',
        type: 'sound',
        copy: 'Music becomes glossy, skip-prone, and carried in a zippered case.',
        action: 'anti-skip',
      },
      {
        name: 'Tamagotchi',
        type: 'play',
        copy: 'Care becomes pocket-sized, needy, and impossible to ignore.',
        action: 'feeding time',
      },
    ],
  },
  {
    decade: '2000s',
    signal: 'digital shimmer',
    palette: '#7cbe5a',
    products: [
      {
        name: 'Flip Phone',
        type: 'message',
        copy: 'A snap opens the day, closes the drama, and frames identity.',
        action: 'flipped open',
      },
      {
        name: 'MP3 Player',
        type: 'sound',
        copy: 'A thousand songs fit in the palm, shuffled into a new self.',
        action: 'shuffle on',
      },
      {
        name: 'Digital Camera',
        type: 'image',
        copy: 'Every night out becomes a folder, a flash, and a thumbnail.',
        action: 'flash fired',
      },
    ],
  },
  {
    decade: '2010s',
    signal: 'social feed glow',
    palette: '#e2557f',
    products: [
      {
        name: 'Smartphone',
        type: 'message',
        copy: 'Trend, camera, map, shop, diary, and mirror collapse into one slab.',
        action: 'swipe unlocked',
      },
      {
        name: 'Wireless Earbuds',
        type: 'sound',
        copy: 'The crowd disappears behind a clean, invisible personal bubble.',
        action: 'paired',
      },
      {
        name: 'Action Camera',
        type: 'image',
        copy: 'Life becomes mountable, shareable, and wide-angle by default.',
        action: 'wide shot',
      },
    ],
  },
]

const DIAL_MEMORY_KEY = 'signal-of-trends:dial-memory'

function clampIndex(value, max) {
  if (!Number.isInteger(value)) return 0
  return Math.min(Math.max(value, 0), max)
}

function readDialMemory() {
  if (typeof window === 'undefined') {
    return { eraIndex: 0, productIndex: 0 }
  }

  try {
    const savedValue = window.localStorage.getItem(DIAL_MEMORY_KEY)
    if (!savedValue) return { eraIndex: 0, productIndex: 0 }

    const savedMemory = JSON.parse(savedValue)
    const eraIndex = clampIndex(savedMemory.eraIndex, eras.length - 1)
    const productIndex = clampIndex(savedMemory.productIndex, eras[eraIndex].products.length - 1)

    return { eraIndex, productIndex }
  } catch {
    return { eraIndex: 0, productIndex: 0 }
  }
}

function writeDialMemory(eraIndex, productIndex) {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.setItem(
      DIAL_MEMORY_KEY,
      JSON.stringify({
        eraIndex,
        productIndex,
        updatedAt: new Date().toISOString(),
      }),
    )
  } catch {
    // Persistence is a convenience; the TV should still work if storage is unavailable.
  }
}

function ProductArtifact({ product, isActive }) {
  return (
    <div className={`artifact artifact-${product.type} ${isActive ? 'is-active' : ''}`} aria-hidden="true">
      <span className="artifact-glow" />
      <span className="artifact-core" />
      <span className="artifact-detail one" />
      <span className="artifact-detail two" />
      <span className="artifact-detail three" />
    </div>
  )
}

function addBox(scene, size, position, material, radius = 0) {
  const geometry = new THREE.BoxGeometry(size[0], size[1], size[2], 8, 8, 2)
  const mesh = new THREE.Mesh(geometry, material)
  mesh.position.set(position[0], position[1], position[2])
  if (radius) {
    mesh.userData.radius = radius
  }
  scene.add(mesh)
  return mesh
}

function makeRod(start, end, radius, material) {
  const direction = new THREE.Vector3(end[0] - start[0], end[1] - start[1], end[2] - start[2])
  const length = direction.length()
  const geometry = new THREE.CylinderGeometry(radius, radius, length, 20)
  const mesh = new THREE.Mesh(geometry, material)
  const midpoint = new THREE.Vector3(
    (start[0] + end[0]) / 2,
    (start[1] + end[1]) / 2,
    (start[2] + end[2]) / 2,
  )
  mesh.position.copy(midpoint)
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize())
  return mesh
}

function TelevisionModelLayer({ isActive }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
    renderer.setClearColor(0x000000, 0)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    const scene = new THREE.Scene()
    const camera = new THREE.OrthographicCamera(-1.65, 1.65, 1.25, -1.25, 0.1, 8)
    camera.position.set(0, 0, 4)
    camera.lookAt(0, 0, 0)

    scene.add(new THREE.AmbientLight(0xffe0b8, 1.65))
    const keyLight = new THREE.DirectionalLight(0xfff2cf, 2.4)
    keyLight.position.set(-2, 2, 3)
    scene.add(keyLight)
    const rimLight = new THREE.DirectionalLight(0x8fd0ff, 0.5)
    rimLight.position.set(2, -1, 2)
    scene.add(rimLight)

    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0x6a3f26,
      roughness: 0.58,
      metalness: 0.08,
      transparent: true,
      opacity: 0.54,
    })
    const darkWoodMaterial = new THREE.MeshStandardMaterial({
      color: 0x22130d,
      roughness: 0.72,
      metalness: 0.04,
      transparent: true,
      opacity: 0.72,
    })
    const glassMaterial = new THREE.MeshStandardMaterial({
      color: 0x183022,
      roughness: 0.28,
      metalness: 0.05,
      transparent: true,
      opacity: 0.22,
      emissive: 0x14351f,
      emissiveIntensity: isActive ? 0.2 : 0.08,
    })
    const metalMaterial = new THREE.MeshStandardMaterial({
      color: 0xb5a284,
      roughness: 0.27,
      metalness: 0.72,
      transparent: true,
      opacity: 0.82,
    })
    const buttonMaterial = new THREE.MeshStandardMaterial({
      color: 0x5a341f,
      roughness: 0.62,
      metalness: 0.04,
      transparent: true,
      opacity: 0.86,
    })
    const lampMaterial = new THREE.MeshStandardMaterial({
      color: isActive ? 0x7aff62 : 0xd45d2f,
      emissive: isActive ? 0x54ff4f : 0x55150c,
      emissiveIntensity: isActive ? 1.55 : 0.22,
      roughness: 0.25,
      transparent: true,
      opacity: 0.95,
    })

    const group = new THREE.Group()
    scene.add(group)

    const body = addBox(group, [2.48, 1.55, 0.34], [0, -0.02, 0], bodyMaterial)
    const backShadow = addBox(group, [2.62, 1.68, 0.16], [0.04, -0.06, -0.16], darkWoodMaterial)
    const screenBezel = addBox(group, [1.45, 1.08, 0.16], [-0.42, 0.03, 0.17], darkWoodMaterial)
    const glass = addBox(group, [1.18, 0.86, 0.04], [-0.42, 0.03, 0.28], glassMaterial)
    const panel = addBox(group, [0.48, 1.22, 0.2], [0.83, -0.02, 0.2], darkWoodMaterial)

    const dialGeometry = new THREE.CylinderGeometry(0.18, 0.2, 0.12, 48)
    const dialTop = new THREE.Mesh(dialGeometry, metalMaterial)
    dialTop.rotation.x = Math.PI / 2
    dialTop.position.set(0.83, 0.43, 0.36)
    group.add(dialTop)

    const dialBottom = dialTop.clone()
    dialBottom.position.y = -0.38
    group.add(dialBottom)

    const pointerMaterial = new THREE.MeshStandardMaterial({
      color: 0x1c100b,
      roughness: 0.6,
      metalness: 0.1,
      transparent: true,
      opacity: 0.9,
    })
    const pointerTop = addBox(group, [0.16, 0.025, 0.025], [0.77, 0.45, 0.44], pointerMaterial)
    pointerTop.rotation.z = -0.12
    const pointerBottom = addBox(group, [0.16, 0.025, 0.025], [0.77, -0.36, 0.44], pointerMaterial)
    pointerBottom.rotation.z = -0.2

    const button = addBox(group, [0.35, 0.16, 0.12], [0.83, -0.83, 0.34], buttonMaterial)
    const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.035, 24, 16), lampMaterial)
    lamp.position.set(0.72, -0.83, 0.43)
    group.add(lamp)

    const antennaBase = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.19, 0.08, 42), metalMaterial)
    antennaBase.rotation.x = Math.PI / 2
    antennaBase.position.set(0, 0.92, 0.12)
    group.add(antennaBase)

    const leftAntenna = makeRod([-0.07, 0.95, 0.06], [-0.42, 1.38, 0.0], 0.015, metalMaterial)
    const rightAntenna = makeRod([0.07, 0.95, 0.06], [0.42, 1.38, 0.0], 0.015, metalMaterial)
    group.add(leftAntenna, rightAntenna)

    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect()
      renderer.setSize(Math.max(1, width), Math.max(1, height), false)
    }

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(canvas)
    resize()

    let frameId = 0
    const startTime = performance.now()

    const render = () => {
      const elapsed = (performance.now() - startTime) / 1000
      group.rotation.y = Math.sin(elapsed * 0.45) * 0.018
      group.rotation.x = Math.sin(elapsed * 0.34) * 0.008
      leftAntenna.rotation.z = Math.sin(elapsed * 1.2) * 0.018
      rightAntenna.rotation.z = Math.sin(elapsed * 1.12 + 0.7) * 0.018
      button.position.z = isActive ? 0.28 : 0.34
      lamp.scale.setScalar(isActive ? 1.24 + Math.sin(elapsed * 4) * 0.08 : 1)
      body.rotation.z = Math.sin(elapsed * 0.26) * 0.001
      backShadow.rotation.z = body.rotation.z
      screenBezel.rotation.z = body.rotation.z
      glass.rotation.z = body.rotation.z
      panel.rotation.z = body.rotation.z

      renderer.render(scene, camera)
      frameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      cancelAnimationFrame(frameId)
      resizeObserver.disconnect()
      renderer.dispose()
      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose()
        if (object.material) object.material.dispose()
      })
    }
  }, [isActive])

  return <canvas ref={canvasRef} className="tv-model-canvas" aria-hidden="true" />
}

function LivingTelevisionLayer({ color, isActive }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      preserveDrawingBuffer: true,
    })
    renderer.setClearColor(0x000000, 0)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    const scene = new THREE.Scene()
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10)
    camera.position.z = 3

    const eraColor = new THREE.Color(color)
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: eraColor,
      transparent: true,
      opacity: 0.13,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0xfff3c7,
      transparent: true,
      opacity: 0.18,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
    const beamMaterial = new THREE.MeshBasicMaterial({
      color: eraColor,
      transparent: true,
      opacity: 0.26,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })

    const group = new THREE.Group()
    scene.add(group)

    const screenGlow = new THREE.Mesh(new THREE.PlaneGeometry(1.05, 0.68), glowMaterial)
    screenGlow.position.set(-0.22, 0.05, 0)
    group.add(screenGlow)

    const glassRing = new THREE.Mesh(new THREE.TorusGeometry(0.46, 0.006, 12, 120), ringMaterial)
    glassRing.position.set(-0.22, 0.05, 0.01)
    glassRing.scale.set(1.32, 0.82, 1)
    group.add(glassRing)

    const beam = new THREE.Mesh(new THREE.PlaneGeometry(0.82, 0.018), beamMaterial)
    beam.position.set(-0.22, 0.1, 0.02)
    beam.rotation.z = -0.08
    group.add(beam)

    const reflection = new THREE.Mesh(
      new THREE.PlaneGeometry(0.62, 0.035),
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.14,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    )
    reflection.position.set(-0.34, 0.34, 0.03)
    reflection.rotation.z = -0.28
    group.add(reflection)

    const dialGlow = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.004, 12, 72), beamMaterial.clone())
    dialGlow.position.set(0.63, 0.3, 0.02)
    group.add(dialGlow)

    const secondDialGlow = dialGlow.clone()
    secondDialGlow.position.y = -0.32
    group.add(secondDialGlow)

    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect()
      renderer.setSize(Math.max(1, width), Math.max(1, height), false)
    }

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(canvas)
    resize()

    let frameId = 0
    const startTime = performance.now()

    const render = () => {
      const elapsed = (performance.now() - startTime) / 1000
      const energy = isActive ? 1 : 0.45

      group.rotation.z = Math.sin(elapsed * 0.7) * 0.006
      screenGlow.material.opacity = 0.11 + Math.sin(elapsed * 1.8) * 0.025 * energy
      beam.position.y = -0.24 + ((elapsed * 0.18) % 0.62)
      beam.material.opacity = 0.12 + energy * 0.18
      reflection.position.x = -0.42 + Math.sin(elapsed * 0.55) * 0.16
      reflection.material.opacity = 0.08 + energy * 0.08
      glassRing.rotation.z = Math.sin(elapsed * 0.35) * 0.02
      dialGlow.rotation.z = elapsed * 0.7
      secondDialGlow.rotation.z = -elapsed * 0.58
      dialGlow.material.opacity = 0.12 + energy * 0.1
      secondDialGlow.material.opacity = 0.1 + energy * 0.08

      renderer.render(scene, camera)
      frameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      cancelAnimationFrame(frameId)
      resizeObserver.disconnect()
      renderer.dispose()
      screenGlow.geometry.dispose()
      glassRing.geometry.dispose()
      beam.geometry.dispose()
      reflection.geometry.dispose()
      dialGlow.geometry.dispose()
      glowMaterial.dispose()
      ringMaterial.dispose()
      beamMaterial.dispose()
      reflection.material.dispose()
      dialGlow.material.dispose()
    }
  }, [color, isActive])

  return <canvas ref={canvasRef} className="tv-life-canvas" aria-hidden="true" />
}

function App() {
  const [dialMemory] = useState(readDialMemory)
  const [eraIndex, setEraIndex] = useState(dialMemory.eraIndex)
  const [productIndex, setProductIndex] = useState(dialMemory.productIndex)
  const [isActive, setIsActive] = useState(false)

  const era = eras[eraIndex]
  const product = era.products[productIndex % era.products.length]

  useEffect(() => {
    writeDialMemory(eraIndex, productIndex)
  }, [eraIndex, productIndex])

  const screenLines = useMemo(
    () => [
      `${era.decade} / ${era.signal}`,
      product.name,
      isActive ? product.action : 'stand by',
    ],
    [era, product, isActive],
  )

  function changeEra(nextIndex) {
    setEraIndex(nextIndex)
    setProductIndex(0)
  }

  function changeProduct(nextIndex) {
    setProductIndex(nextIndex)
  }

  return (
    <main className="time-machine" style={{ '--era-color': era.palette }}>
      <section className="manifesto" aria-label="Trend manifesto">
        <p>What is trend to me?</p>
        <p>What kind of trend are you following, and whose trend was it before yours?</p>
        <p>Because there has always been a trend of trends, I believe the present me exists.</p>
      </section>

      <section className="stage" aria-label="Retro television trend time machine">
        <div className="television">
          <TelevisionModelLayer isActive={isActive} />

          <div className={`tv-face ${isActive ? 'is-running' : ''}`}>
            <div className="screen-bezel">
              <div className={`screen ${isActive ? 'is-on' : 'is-off'}`} aria-live="polite">
                {isActive && (
                  <>
                    <LivingTelevisionLayer color={era.palette} isActive={isActive} />
                    <div className="scanlines" />
                    <div className="screen-meta">
                      {screenLines.map((line) => (
                        <span key={line}>{line}</span>
                      ))}
                    </div>
                    <ProductArtifact product={product} isActive={isActive} />
                    <div className="caption">
                      <strong>{product.name}</strong>
                      <p>{product.copy}</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            <aside className="control-panel" aria-label="Television controls">
              <label className="dial-control">
                <span className="dial-label">Era</span>
                <button
                  className="knob"
                  type="button"
                  aria-label="Turn era dial"
                  style={{ transform: `rotate(${eraIndex * 54 - 80}deg)` }}
                  onClick={() => changeEra((eraIndex + 1) % eras.length)}
                >
                  <span />
                </button>
                <input
                  type="range"
                  min="0"
                  max={eras.length - 1}
                  value={eraIndex}
                  aria-label="Select decade"
                  onChange={(event) => changeEra(Number(event.target.value))}
                />
                <strong>{era.decade}</strong>
              </label>

              <label className="dial-control">
                <span className="dial-label">Object</span>
                <button
                  className="knob"
                  type="button"
                  aria-label="Turn product dial"
                  style={{ transform: `rotate(${productIndex * 70 - 70}deg)` }}
                  onClick={() => changeProduct((productIndex + 1) % era.products.length)}
                >
                  <span />
                </button>
                <input
                  type="range"
                  min="0"
                  max={era.products.length - 1}
                  value={productIndex}
                  aria-label="Select popular product"
                  onChange={(event) => changeProduct(Number(event.target.value))}
                />
                <strong>{String(productIndex + 1).padStart(2, '0')}</strong>
              </label>

              <button
                className={`use-button ${isActive ? 'is-lit' : ''}`}
                type="button"
                aria-pressed={isActive}
                onClick={() => setIsActive((value) => !value)}
              >
                <Power size={18} />
                <span>Power</span>
              </button>
            </aside>
          </div>
        </div>

        <div className="broadcast-card" aria-label="Current selection">
          <Sparkles size={18} />
          <span>{era.decade}</span>
          <strong>{product.name}</strong>
        </div>
      </section>
    </main>
  )
}

export default App
