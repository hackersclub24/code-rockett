# PRD — Interactive Starfield Background
## Coding Rocket Landing Page

**Feature:** Interactive Mouse-Reactive Star Field  
**Target file:** `frontend/app/page.tsx` (or whichever file renders the landing page)  
**Status:** Ready for implementation  
**Author:** Abhishek  

---

## 1. Overview

Replace the current static CSS star field on the Coding Rocket landing page with a fully interactive, canvas-based star field that reacts to mouse movement and click events in real time.

---

## 2. Goals

| Goal | Detail |
|------|--------|
| Mouse repulsion | Stars physically push away from the cursor and spring back |
| Click burst | Clicking anywhere triggers a particle explosion at that point |
| Custom cursor | Replace default OS cursor with a custom purple ring + dot |
| Mouse trail | Faint purple trail follows cursor movement |
| Ambient glow | Soft radial glow orbits the cursor |
| Spawn on click | New stars are born in a ring around each click point |

---

## 3. Implementation

### 3.1 Replace static stars with a `<canvas>` element

Remove any existing `.stars` div and individual `.star` elements. Add a single `<canvas>` element as the first child of the page wrapper:

```tsx
<canvas id="starfield" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }} />
```

The page wrapper must have `position: relative` and `overflow: hidden`.

---

### 3.2 Hide the default cursor

On the page wrapper element, set:

```css
cursor: none;
```

Also apply `cursor: none` to all buttons and links inside the page so the OS cursor never shows.

---

### 3.3 Custom cursor overlay

Add a `<div>` positioned absolutely (not fixed — use absolute within the page container) that follows mouse position via JS:

```html
<div id="cursor" style="position:absolute; pointer-events:none; z-index:100; transform:translate(-50%,-50%)">
  <div id="cursor-ring" style="width:28px; height:28px; border-radius:50%; border:1.5px solid rgba(168,85,247,0.7); transition:transform 0.12s ease;"></div>
  <div style="position:absolute; top:50%; left:50%; width:4px; height:4px; background:#a855f7; border-radius:50%; transform:translate(-50%,-50%);"></div>
</div>
```

On `mousedown`: scale the ring to `0.7` via `transform: scale(0.7)`.  
On `mouseup`: reset to `scale(1)`.  
On `mouseleave`: set `opacity: 0` on the cursor div.  
On `mouseenter`: set `opacity: 1`.

---

### 3.4 Star class / data model

Each star object holds:

| Property | Type | Description |
|----------|------|-------------|
| `x`, `y` | number | Current position |
| `ox`, `oy` | number | Original/resting position |
| `vx`, `vy` | number | Velocity (for physics) |
| `size` | number | Current radius (px), between 0.4–2.2 |
| `base` | number | Base radius before twinkle offset |
| `opacity` | number | 0–1, animated via sine wave |
| `twinkleSpeed` | number | Sine wave frequency |
| `twinkleOffset` | number | Sine wave phase offset |
| `color` | string | `'#ffffff'` (85%), `'#c084fc'` (8%), `'#f97316'` (7%) |
| `born` | boolean | `true` = click-spawned, fades out over `maxAge` |
| `age` | number | Frame counter |
| `maxAge` | number | `Infinity` for permanent stars, 80–200 frames for born stars |

**Spawn count:** 160 permanent stars on load, randomly distributed across the full canvas.

---

### 3.5 Per-frame star update logic

Run every animation frame for each star:

```
1. Increment age

2. Compute distance from mouse (dx, dy, dist)

3. If dist < 120px:
     force = (1 - dist/120) * 2.2
     vx += (dx/dist) * force
     vy += (dy/dist) * force

4. Apply drag:
     vx *= 0.88
     vy *= 0.88

5. Apply spring back to origin:
     x += (ox - x) * 0.04
     y += (oy - y) * 0.04

6. Move:
     x += vx
     y += vy

7. Animate opacity via sine:
     opacity = 0.25 + sin(frame * twinkleSpeed + twinkleOffset) * 0.35
     If user is clicking, add +0.15 to opacity

8. Animate size via sine:
     size = base + sin(...) * 0.4

9. If born && age > maxAge * 0.7:
     fade opacity toward 0 over remaining frames
```

Remove born stars from the array once `age >= maxAge`.

---

### 3.6 Star draw logic

For each star:

```
1. Draw filled circle at (x, y) with radius = size, color = star.color, alpha = opacity

2. If size > 1.4px, draw a second circle at same center with:
     radius = size * 2.5
     alpha = opacity * 0.3
   (creates a soft halo effect)
```

---

### 3.7 Mouse trail

Maintain a `trails` array. On every `mousemove`, push `{ x, y, age: 0 }`.  
Cap at 18 entries — shift oldest when full.  
Each frame, increment all ages and remove entries older than 20 frames.

Draw the trail as connected line segments:

```
For i = 1 to trails.length:
  alpha = (i / trails.length) * 0.12
  strokeStyle = '#a855f7'
  lineWidth = 1.5
  draw line from trails[i-1] to trails[i]
```

---

### 3.8 Cursor glow

Every frame (when mouse is inside the canvas), draw:

```
radial gradient centered at (mouse.x, mouse.y)
  inner stop: rgba(124, 58, 237, 0.07) at radius 0
  outer stop: transparent at radius 90
fill a circle of radius 90 at mouse position
```

---

### 3.9 Click burst particles

On `mousedown`, spawn **38 burst particles** at `(mouse.x, mouse.y)`.

Each burst particle holds:

| Property | Description |
|----------|-------------|
| `x`, `y` | Spawn position |
| `vx`, `vy` | Random direction, speed 1.5–6.5 |
| `life` | Starts at 1.0, decrements by `decay` each frame |
| `decay` | Random 0.015–0.04 |
| `size` | Random 0.5–3.0 px |
| `color` | Purple `#c084fc` (40%), orange `#f97316` (30%), white `#ffffff` (30%) |
| `trail` | Array of last 6 positions |

Per-frame update:

```
1. Push current (x, y) to trail; trim to last 6 entries
2. x += vx; y += vy
3. vy += 0.08  (gravity)
4. vx *= 0.97  (air resistance)
5. life -= decay
```

Draw:

```
1. Draw trail as line segments with alpha ramping from 0 to life*0.4
2. Draw filled circle at (x, y) with radius = size * life, alpha = life
```

Remove particles when `life <= 0`.

---

### 3.10 Click star spawn

On `mousedown`, also spawn **12 new born stars** in a ring around the click point:

```
for i = 0 to 11:
  angle = (i / 12) * 2 * PI
  distance = random(20, 80)
  x = mouse.x + cos(angle) * distance
  y = mouse.y + sin(angle) * distance
  Create star at (x, y) with born=true, opacity=0.9, size=1–3
```

---

### 3.11 Canvas resize

On `window.resize`, update `canvas.width` and `canvas.height` to match the container's `offsetWidth` and `offsetHeight`. Redistribute permanent star origins proportionally.

---

### 3.12 Animation loop

Use `requestAnimationFrame`. Each frame, in this order:

1. `ctx.clearRect(0, 0, W, H)`
2. Draw mouse trail
3. Draw cursor glow
4. Update + draw all permanent stars
5. Update + draw all born stars (filter dead ones)
6. Update + draw all burst particles (filter dead ones)

---

## 4. React / Next.js integration

Use a `useEffect` with an empty dependency array to set up the canvas, event listeners, and animation loop after mount. Return a cleanup function that cancels the animation frame and removes all event listeners.

```tsx
useEffect(() => {
  const canvas = canvasRef.current;
  // ... setup ...
  const frame = requestAnimationFrame(loop);
  return () => {
    cancelAnimationFrame(frame);
    page.removeEventListener('mousemove', onMove);
    page.removeEventListener('mousedown', onDown);
    page.removeEventListener('mouseup', onUp);
    page.removeEventListener('mouseleave', onLeave);
    page.removeEventListener('mouseenter', onEnter);
    window.removeEventListener('resize', onResize);
  };
}, []);
```

Use `useRef` for `canvasRef`, `cursorRef`, and `cursorRingRef`.

---

## 5. Performance notes

- All drawing is done on a single 2D canvas — no DOM manipulation per star
- Trail entries are capped at 18; burst particles self-remove after ~40–60 frames
- No blur, no box-shadow, no CSS filters — canvas-only rendering
- Target: 60fps on modern hardware with 160 stars + up to 38 burst particles

---

## 6. Files to change

| File | Change |
|------|--------|
| `frontend/app/page.tsx` | Add canvas ref, cursor div, useEffect with all star logic |
| `frontend/app/globals.css` (or inline) | Add `cursor: none` to page wrapper and all interactive elements |

No new dependencies required — uses browser Canvas 2D API only.

---

## 7. What NOT to change

- The rest of the landing page layout (nav, hero, stats bar, features, CTA, footer) stays identical
- No changes to color palette, typography, or component structure
- No changes to backend or any other frontend pages
