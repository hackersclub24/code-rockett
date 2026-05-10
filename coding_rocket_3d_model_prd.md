# PRD — 3D Rotatable Rocket Model
## Code Rockett Website

**Feature:** Interactive 3D Rocket Model Component  
**Component name:** `RocketModel.tsx`  
**Location:** `frontend/components/RocketModel.tsx`  
**Status:** Ready for implementation  
**Author:** Abhishek

---

## 1. Overview

Build a fully interactive 3D rocket model using **Three.js (r128)** that the user can drag to rotate in any direction and scroll to zoom. The rocket matches the Code Rockett brand — purple nose, orange fins, glowing blue window, metallic nozzle — with animated exhaust flames, pulsing lights, and a star field background.

---

## 2. Dependencies

Install Three.js:

```bash
npm install three
npm install --save-dev @types/three
```

Use **Three.js r128 exactly** — no newer version. Import like this:

```tsx
import * as THREE from 'three'
```

---

## 3. Component API

```tsx
interface RocketModelProps {
  width?: string | number   // default: '100%'
  height?: number           // default: 520
}

export default function RocketModel({ width = '100%', height = 520 }: RocketModelProps)
```

---

## 4. Full Implementation

### 4.1 Canvas & Renderer setup

```tsx
const mountRef = useRef<HTMLDivElement>(null)

useEffect(() => {
  const mount = mountRef.current
  if (!mount) return

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(mount.offsetWidth, mount.offsetHeight)
  renderer.shadowMap.enabled = true
  mount.appendChild(renderer.domElement)

  const camera = new THREE.PerspectiveCamera(45, mount.offsetWidth / mount.offsetHeight, 0.1, 100)
  camera.position.set(0, 0, 6)

  // cleanup
  return () => {
    mount.removeChild(renderer.domElement)
    renderer.dispose()
  }
}, [])
```

---

### 4.2 Scene lighting

Add these 4 lights to the scene:

| Light | Type | Color | Intensity | Position |
|-------|------|-------|-----------|----------|
| Ambient | AmbientLight | `0xffffff` | 0.3 | — |
| Purple key | PointLight | `0xa855f7` | 3.0 | (-3, 3, 3) |
| Orange fill | PointLight | `0xf97316` | 2.0 | (3, -2, 2) |
| White directional | DirectionalLight | `0xffffff` | 0.6 | (0, 5, 5) |

In the animation loop, pulse both point lights:
```js
purpleLight.intensity = 2.5 + Math.sin(t * 2) * 0.8
orangeLight.intensity = 1.8 + Math.sin(t * 1.5 + 1) * 0.5
```

---

### 4.3 Rocket geometry — build order

All parts added to a `rocketGroup = new THREE.Group()`. Add group to scene.

#### Materials

```js
const bodyMat   = new THREE.MeshStandardMaterial({ color: 0xe8e8f0, roughness: 0.3, metalness: 0.5 })
const noseMat   = new THREE.MeshStandardMaterial({ color: 0xa855f7, roughness: 0.2, metalness: 0.6 })
const finMat    = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.3, metalness: 0.4 })
const windowMat = new THREE.MeshStandardMaterial({ color: 0x60a5fa, roughness: 0.1, metalness: 0.1, emissive: 0x1d4ed8, emissiveIntensity: 0.4 })
const nozzleMat = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.4, metalness: 0.8 })
const ringMat   = new THREE.MeshStandardMaterial({ color: 0xc084fc, roughness: 0.2, metalness: 0.7, emissive: 0x7c3aed, emissiveIntensity: 0.3 })
const rimMat    = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.2, metalness: 0.9 })
```

#### Parts

| Part | Geometry | Position Y | Material |
|------|----------|-----------|----------|
| Body | `CylinderGeometry(0.38, 0.42, 2.2, 32)` | 0 | bodyMat |
| Nose cone | `CylinderGeometry(0, 0.38, 1.1, 32)` | 1.65 | noseMat |
| Nose cap | `SphereGeometry(0.18, 16, 16)` | 2.15 | noseMat |
| Bottom skirt | `CylinderGeometry(0.42, 0.48, 0.3, 32)` | -1.25 | bodyMat |
| Nozzle | `CylinderGeometry(0.28, 0.38, 0.4, 32)` | -1.6 | nozzleMat |
| Nozzle bell | `CylinderGeometry(0.38, 0.48, 0.22, 32)` | -1.88 | nozzleMat |
| Porthole | `SphereGeometry(0.2, 16, 16)` | 0.25, X: 0.38 | windowMat |
| Window rim | `TorusGeometry(0.2, 0.04, 8, 24)` | 0.25, X: 0.38, rotY: π/2 | rimMat |

#### Decorative rings (2x)
```js
for (let i = 0; i < 2; i++) {
  const stripe = new THREE.Mesh(new THREE.TorusGeometry(0.43, 0.03, 8, 32), ringMat)
  stripe.position.y = 0.5 - i * 0.8
  stripe.rotation.x = Math.PI / 2
  rocketGroup.add(stripe)
}
```

#### Fins (4x, evenly spaced around the body)

```js
function makeFin(angleY: number) {
  const finShape = new THREE.Shape()
  finShape.moveTo(0, 0)
  finShape.lineTo(0.55, -0.4)
  finShape.lineTo(0.55, -0.9)
  finShape.lineTo(0, -0.6)
  finShape.closePath()

  const geo = new THREE.ExtrudeGeometry(finShape, {
    depth: 0.06,
    bevelEnabled: true,
    bevelSize: 0.02,
    bevelThickness: 0.02,
    bevelSegments: 2
  })

  const fin = new THREE.Mesh(geo, finMat)
  fin.position.set(0.4, -1.0, -0.03)

  const group = new THREE.Group()
  group.add(fin)
  group.rotation.y = angleY
  return group
}

for (let i = 0; i < 4; i++) {
  rocketGroup.add(makeFin((i / 4) * Math.PI * 2))
}
```

---

### 4.4 Exhaust flame particles

Create 40 particles, added to a `flameGroup` inside `rocketGroup`:

```js
const flameColors = [0xf97316, 0xfbbf24, 0xfb923c, 0xef4444, 0xfde68a]

for (let i = 0; i < 40; i++) {
  const geo = new THREE.SphereGeometry(Math.random() * 0.08 + 0.03, 6, 6)
  const mat = new THREE.MeshBasicMaterial({
    color: flameColors[Math.floor(Math.random() * flameColors.length)],
    transparent: true,
    opacity: Math.random() * 0.8 + 0.2
  })
  const p = new THREE.Mesh(geo, mat)
  p.userData = {
    speed: Math.random() * 0.04 + 0.02,
    offset: Math.random() * Math.PI * 2,
    startY: -2.1 - Math.random() * 0.6,
    life: Math.random()
  }
  p.position.set((Math.random()-0.5)*0.25, p.userData.startY, (Math.random()-0.5)*0.25)
  flameGroup.add(p)
}
```

Per-frame flame update:
```js
flameGroup.children.forEach(p => {
  const m = p as THREE.Mesh
  m.userData.life -= m.userData.speed
  if (m.userData.life <= 0) {
    m.userData.life = 1
    m.position.set((Math.random()-0.5)*0.25, m.userData.startY, (Math.random()-0.5)*0.25)
  }
  m.position.y -= m.userData.speed * 0.6
  m.position.x += Math.sin(t * 3 + m.userData.offset) * 0.003
  ;(m.material as THREE.MeshBasicMaterial).opacity = m.userData.life * 0.9
  const s = m.userData.life * 0.8 + 0.2
  m.scale.setScalar(s)
})
```

---

### 4.5 Star field background

```js
const starVerts: number[] = []
for (let i = 0; i < 300; i++) {
  starVerts.push((Math.random()-0.5)*30, (Math.random()-0.5)*30, (Math.random()-0.5)*30)
}
const starGeo = new THREE.BufferGeometry()
starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starVerts, 3))
const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.05, transparent: true, opacity: 0.7 }))
scene.add(stars)

// In animation loop:
stars.rotation.y += 0.0002
```

---

### 4.6 Drag to rotate + scroll to zoom

Use refs to track state — no React state (avoid re-renders):

```ts
let isDragging = false
let prevMouse = { x: 0, y: 0 }
let rotVel = { x: 0, y: 0 }
let rotX = 0.15
let rotY = 0
let zoom = 6
```

**Mouse events** (attach to mount div):
```js
mount.addEventListener('mousedown', e => {
  isDragging = true
  prevMouse = { x: e.clientX, y: e.clientY }
  mount.style.cursor = 'grabbing'
})
window.addEventListener('mouseup', () => {
  isDragging = false
  mount.style.cursor = 'grab'
})
window.addEventListener('mousemove', e => {
  if (!isDragging) return
  rotVel.y = (e.clientX - prevMouse.x) * 0.012
  rotVel.x = (e.clientY - prevMouse.y) * 0.012
  prevMouse = { x: e.clientX, y: e.clientY }
})
```

**Touch events** (same logic, use `e.touches[0]`, `{ passive: true }`):
```js
mount.addEventListener('touchstart', e => { ... }, { passive: true })
window.addEventListener('touchmove', e => { ... }, { passive: true })
window.addEventListener('touchend', () => { isDragging = false })
```

**Scroll to zoom:**
```js
mount.addEventListener('wheel', e => {
  zoom = Math.max(3, Math.min(10, zoom + e.deltaY * 0.01))
  camera.position.z = zoom
}, { passive: true })
```

**Per-frame rotation update:**
```js
if (!isDragging) {
  rotVel.y *= 0.92   // momentum decay
  rotVel.x *= 0.92
  rotY += rotVel.y + 0.004   // 0.004 = auto-rotate speed
  rotX += rotVel.x
} else {
  rotY += rotVel.y
  rotX += rotVel.x
}
rotX = Math.max(-1.2, Math.min(1.2, rotX))   // clamp vertical tilt

rocketGroup.rotation.y = rotY
rocketGroup.rotation.x = rotX
```

---

### 4.7 Hover float animation

```js
rocketGroup.position.y = Math.sin(t * 0.8) * 0.08
```

---

### 4.8 Animation loop

```js
let t = 0
let rafId: number

function animate() {
  rafId = requestAnimationFrame(animate)
  t += 0.016

  // hover
  rocketGroup.position.y = Math.sin(t * 0.8) * 0.08

  // rotation
  // ... (see 4.6)

  // flame particles
  // ... (see 4.4)

  // pulse lights
  purpleLight.intensity = 2.5 + Math.sin(t * 2) * 0.8
  orangeLight.intensity = 1.8 + Math.sin(t * 1.5 + 1) * 0.5

  // stars
  stars.rotation.y += 0.0002

  renderer.render(scene, camera)
}

animate()

// cleanup
return () => {
  cancelAnimationFrame(rafId)
  window.removeEventListener('mouseup', ...)
  window.removeEventListener('mousemove', ...)
  window.removeEventListener('touchend', ...)
  window.removeEventListener('touchmove', ...)
  mount.removeChild(renderer.domElement)
  renderer.dispose()
}
```

---

### 4.9 Window resize handler

```js
const onResize = () => {
  renderer.setSize(mount.offsetWidth, mount.offsetHeight)
  camera.aspect = mount.offsetWidth / mount.offsetHeight
  camera.updateProjectionMatrix()
}
window.addEventListener('resize', onResize)
```

---

## 5. JSX output

```tsx
return (
  <div style={{ position: 'relative', width: typeof width === 'number' ? `${width}px` : width, height: `${height}px`, background: '#07070f', borderRadius: '16px', overflow: 'hidden', cursor: 'grab' }}>
    <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
    <div style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', fontSize: 12, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', pointerEvents: 'none', whiteSpace: 'nowrap' }}>
      drag to rotate · scroll to zoom
    </div>
    <div style={{ position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)', fontFamily: "'Syne', sans-serif", fontSize: '1rem', fontWeight: 700, color: 'rgba(255,255,255,0.15)', letterSpacing: '0.15em', pointerEvents: 'none', whiteSpace: 'nowrap' }}>
      CODE ROCKETT
    </div>
  </div>
)
```

---

## 6. Usage examples

```tsx
import RocketModel from '@/components/RocketModel'

// Default full width
<RocketModel />

// Custom size
<RocketModel height={400} />

// Inside a section
<section>
  <RocketModel width={600} height={500} />
</section>
```

---

## 7. Where to place on the website

| Page section | Usage |
|-------------|-------|
| Hero section | Full width background, low opacity behind text |
| "About Code Rockett" section | Centered, main visual element |
| 404 page | Centered with "Houston, we have a problem" text |
| Loading screen | Full screen before dashboard loads |

---

## 8. Files to create / modify

| File | Action |
|------|--------|
| `frontend/components/RocketModel.tsx` | Create — full component |
| `frontend/app/page.tsx` | Import and place `<RocketModel />` in desired section |

---

## 9. Important notes

- Use `'use client'` at the top — Three.js requires browser APIs
- All Three.js setup must be inside `useEffect` — never at module level
- Use `useRef` for all mutable state (rotation, velocity, zoom) — not `useState`
- Always remove all event listeners and call `renderer.dispose()` in cleanup
- Three.js r128 is the required version — `three` package installs r128 compatible version
- Do NOT use `OrbitControls` from Three.js — implement drag rotation manually as described above (OrbitControls is not available in r128 without an additional import)
