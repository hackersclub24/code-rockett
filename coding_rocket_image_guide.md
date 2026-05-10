# Coding Rocket — Image Placement Guide
## For Cursor: Where to use which image on every section

This document tells you exactly which image goes where, what CSS to apply, and how to implement it in the Next.js landing page. All images are free-to-use from StockCake or similar sources.

---

## Section 1 — HERO SECTION (Full bleed background)

**Purpose:** Make the hero feel immersive and alive. The image sits behind the headline and CTA, heavily blurred and darkened so text stays readable.

**Image to use:**
> Search on StockCake: `"Glowing Developer Workspace"`  
> Direct URL hint: https://stockcake.com (search "Neon Code Station" or "Glowing Developer Workspace")

**What the image looks like:** Dark room, glowing monitors, neon purple/blue light, keyboard in foreground — fits the space theme perfectly.

**Implementation:**
```tsx
// In your hero section JSX
<section className="relative overflow-hidden">
  {/* Background image */}
  <div className="absolute inset-0 z-0">
    <Image
      src="/images/hero-workspace.jpg"
      alt=""
      fill
      className="object-cover object-center"
      priority
    />
    {/* Dark overlay so text is readable */}
    <div className="absolute inset-0 bg-[#07070f]/80" />
    {/* Purple gradient overlay from bottom */}
    <div className="absolute inset-0 bg-gradient-to-t from-[#07070f] via-transparent to-[#07070f]/60" />
  </div>

  {/* Your existing hero content goes here with z-index */}
  <div className="relative z-10">
    {/* headline, badge, CTA buttons */}
  </div>
</section>
```

**CSS notes:**
- Overlay opacity: `bg-[#07070f]/80` — keeps it dark enough for white text
- Add `blur-sm` to the Image component if you want a softer dreamy background
- Image should be downloaded, renamed to `hero-workspace.jpg`, placed in `/public/images/`

---

## Section 2 — "LIVE CLASSES" feature card or How It Works Step 1

**Purpose:** Show that classes are actually live and instructor-led — not pre-recorded videos. Adds human credibility.

**Image to use:**
> Search on Google Images or Unsplash: `"instructor teaching programming live class"`  
> Best result found: Zoom Classrooms / instructor at touch screen with students watching

**What the image looks like:** Teacher/instructor presenting code on a large screen, students engaged — professional classroom energy.

**Implementation:**
```tsx
// Feature card or "How It Works" step
<div className="relative rounded-2xl overflow-hidden border border-white/10">
  <Image
    src="/images/live-class.jpg"
    alt="Live instructor-led coding class"
    width={600}
    height={400}
    className="object-cover w-full h-48 opacity-70"
  />
  {/* Gradient fade to card content below */}
  <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#0f0f2e] to-transparent" />
  <div className="p-6">
    <h3>Live instructor-led classes</h3>
    <p>Every session runs live. Real feedback, real questions, real learning.</p>
  </div>
</div>
```

**CSS notes:**
- `opacity-70` on image so the dark card background bleeds through
- Bottom gradient fade blends image into card text area cleanly

---

## Section 3 — TESTIMONIALS / SOCIAL PROOF section background

**Purpose:** The testimonials section needs to feel warm and credible. A blurred background of students collaborating adds energy without distracting from quote text.

**Image to use:**
> Search on Unsplash: `"coding bootcamp students collaborating classroom"`  
> Best result found: Coding Boot Camp Students Collaborating in a Modern Classroom

**What the image looks like:** Group of students at laptops in a modern classroom, collaborative energy, some diversity — gives the "real community" feel.

**Implementation:**
```tsx
<section className="relative py-24 overflow-hidden">
  {/* Blurred background */}
  <div className="absolute inset-0 z-0">
    <Image
      src="/images/students-collaborating.jpg"
      alt=""
      fill
      className="object-cover blur-md scale-105"
    />
    <div className="absolute inset-0 bg-[#07070f]/85" />
  </div>

  <div className="relative z-10 max-w-5xl mx-auto px-6">
    <h2>What our students say</h2>
    {/* Testimonial cards */}
  </div>
</section>
```

**CSS notes:**
- `blur-md scale-105` — blur slightly zooms in, prevents blurry edges showing
- Overlay at `/85` opacity keeps it very dark, image is just texture

---

## Section 4 — STUDENT DASHBOARD preview / "Track your progress" section

**Purpose:** The dashboard mockup section needs a real-feeling side image to make it look like a legit product. Use a dev workspace shot next to the dashboard UI.

**Image to use:**
> Search on StockCake: `"Glowing Code Workspace"` or `"Neon Code Station"`  
> Direct match found in search results above

**What the image looks like:** Dark desk setup, monitor with glowing code, very aesthetic — matches your purple/orange palette.

**Implementation:**
```tsx
// Two-column layout: image left, dashboard mockup right
<section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-24 px-6 max-w-6xl mx-auto">
  
  {/* Left: real image */}
  <div className="relative rounded-2xl overflow-hidden h-80 border border-white/10">
    <Image
      src="/images/dev-workspace.jpg"
      alt="Developer workspace"
      fill
      className="object-cover"
    />
    {/* Purple color tint overlay to match theme */}
    <div className="absolute inset-0 bg-purple-900/30 mix-blend-multiply" />
  </div>

  {/* Right: your existing dashboard mockup component */}
  <DashboardMockup />

</section>
```

**CSS notes:**
- `mix-blend-multiply` on the purple overlay tints the image to match site palette
- This makes any photo feel "on-brand" even if colors don't match exactly

---

## Section 5 — CURRICULUM / COURSES section card thumbnails

**Purpose:** Each course card should have a thumbnail that matches the topic. Makes the curriculum section look real and polished, not just text boxes.

**Images to use per course topic:**

| Course | Search Query | Where to search |
|--------|-------------|-----------------|
| JavaScript / Frontend | `"javascript code screen dark"` | Unsplash |
| Python / Backend | `"python code terminal screen"` | Unsplash |
| Databases / SQL | `"database server dark neon"` | StockCake |
| React / UI | `"react component code editor"` | Unsplash |
| DSA / Algorithms | `"algorithm flowchart whiteboard"` | Unsplash |

**Implementation for each card:**
```tsx
<div className="rounded-xl overflow-hidden border border-white/10 bg-white/5 hover:border-purple-500/40 transition-all group">
  <div className="relative h-36 overflow-hidden">
    <Image
      src={`/images/course-${slug}.jpg`}
      alt={course.title}
      fill
      className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a12] to-transparent" />
    {/* Course tag badge on top of image */}
    <span className="absolute top-3 left-3 text-xs bg-purple-500/20 border border-purple-500/40 text-purple-300 px-3 py-1 rounded-full">
      {course.tag}
    </span>
  </div>
  <div className="p-5">
    <h3>{course.title}</h3>
    <p>{course.description}</p>
  </div>
</div>
```

---

## Section 6 — CTA / FOOTER area (subtle background)

**Purpose:** The bottom CTA ("Ready to launch?") section should have a faint space/rocket energy. Use a minimal dark image with distant lights.

**Image to use:**
> Search on Unsplash: `"dark night sky stars bokeh"`  
> OR use a CSS-only solution (gradient + the existing canvas starfield component)

**Implementation:**
```tsx
<section className="relative py-32 text-center overflow-hidden">
  {/* Option A: use your existing RocketAnimation component as background */}
  <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
    <RocketAnimation autoLaunch showButton={false} height={600} />
  </div>

  {/* Option B: simple image */}
  <div className="absolute inset-0 z-0">
    <Image src="/images/stars-bg.jpg" alt="" fill className="object-cover opacity-20" />
  </div>

  <div className="relative z-10">
    <h2>Ready to launch your dev career?</h2>
    <button>Apply for a seat</button>
  </div>
</section>
```

---

## Where to download all images (FREE, no attribution needed)

| Source | URL | Best for |
|--------|-----|----------|
| StockCake | https://stockcake.com | Dark aesthetic dev/coding photos |
| Unsplash | https://unsplash.com | Students, classrooms, workspaces |
| Pexels | https://pexels.com | Instructors, diverse students |

### Exact search terms to use on each site:

**StockCake (best for your dark theme):**
- `"Neon Code Station"` → hero background
- `"Glowing Developer Workspace"` → dashboard section
- `"Glowing Code Workspace"` → feature cards

**Unsplash:**
- `"coding bootcamp"` → testimonials background
- `"laptop code dark"` → hero alternative
- `"online learning"` → how it works section

---

## File naming convention (save all in `/public/images/`)

```
/public/images/
├── hero-workspace.jpg          ← Section 1: Hero background
├── live-class.jpg              ← Section 2: Live classes feature
├── students-collaborating.jpg  ← Section 3: Testimonials background
├── dev-workspace.jpg           ← Section 4: Dashboard section
├── course-javascript.jpg       ← Section 5: JS course card
├── course-python.jpg           ← Section 5: Python course card
├── course-react.jpg            ← Section 5: React course card
├── course-database.jpg         ← Section 5: DB course card
└── stars-bg.jpg                ← Section 6: CTA background
```

---

## Global image component to use (Next.js)

Always use Next.js `<Image>` from `next/image` — never a plain `<img>` tag. It handles lazy loading, optimization, and responsive sizing automatically.

```tsx
import Image from 'next/image'
```

For background images that fill a container, always use:
```tsx
<div className="relative">   {/* parent must have position:relative and a defined height */}
  <Image fill src="..." alt="..." className="object-cover" />
</div>
```

---

## Quick summary — which image goes where

| Website Section | Image | Effect |
|----------------|-------|--------|
| Hero | Dark neon dev workspace | Full bleed, blurred, heavy dark overlay |
| Live Classes feature | Instructor at screen | Card header image, fades into card |
| Testimonials | Students collaborating | Blurred full section background |
| Dashboard preview | Glowing code workspace | Side panel, purple tint overlay |
| Course cards | Topic-specific code screenshots | Card thumbnails with hover zoom |
| CTA bottom | RocketAnimation or star bg | Low opacity, purely decorative |
