# Performance Baseline - 2026-01-01

## Current Implementation
- **Technology**: Static HTML with inline CSS and JavaScript
- **Three.js Version**: r128 (loaded from CDN)
- **CDN URL**: https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js

## Bundle Size Analysis

### Three.js CDN
- **Source**: cdnjs.cloudflare.com
- **Version**: r128
- **Minified Size**: ~580KB (estimated)
- **Gzipped Size**: ~140KB (estimated)
- **Loading**: External CDN, not bundled

### HTML File
- **File**: jonathan-wilson-90s.html
- **Total Lines**: 745 lines
- **Estimated Size**: ~30KB
- **Inline CSS**: ~8KB
- **Inline JavaScript**: ~15KB

### Total Transfer Size (Estimated)
- **First Load**: ~170KB gzipped (HTML + Three.js CDN)
- **Cached Load**: ~30KB (HTML only, Three.js cached)

## Animation Timing Values

### Typing Animation
- **Initial Delay**: 500ms
- **Character Interval**: 75ms
- **Target Element**: First command line (`cat about_me.txt`)

### Cursor Animation
- **Blink Cycle**: 1000ms (1 second)
- **Pattern**: 0-50% visible, 50-100% hidden
- **Animation**: CSS @keyframes

### Footer Interaction
- **Message Display Duration**: 2000ms (2 seconds)
- **Trigger**: Any keydown event
- **Reset**: Returns to default message after 2s

### Three.js Shader Animation
- **Time Increment**: 0.01 per frame (requestAnimationFrame)
- **Pulse Effect**: sin(time * 1.5)
- **Brightness Oscillation**: sin(time * 0.5 + position.x * 2.0)

## Responsive Breakpoints

### Desktop (Default)
- **Min Width**: 769px+
- **Three.js Canvas**: Visible (fullscreen background)
- **Typography**: Full size
- **Layout**: Centered terminal with background visualization

### Tablet (768px)
- **Max Width**: 768px
- **Three.js Canvas**: Hidden (display: none)
- **Typography**: Reduced sizes
  - h1: 1.8em (from 2.5em)
  - h2: 1.3em (from 1.8em)
  - p: 0.95em (from 1.1em)
- **Layout**: Scrollable content

### Mobile (480px)
- **Max Width**: 480px
- **Three.js Canvas**: Hidden
- **Typography**: Further reduced
  - h1: 1.5em
  - h2: 1.1em
  - p: 0.85em
- **Layout**: Compact padding and spacing

## Lighthouse Audit Targets

### Performance Goals (Next.js Migration)
- **Performance Score**: Target ≥ 90
- **First Contentful Paint**: Target < 1.5s
- **Time to Interactive**: Target < 3.5s
- **Largest Contentful Paint**: Target < 2.5s
- **Total Blocking Time**: Target < 300ms
- **Cumulative Layout Shift**: Target < 0.1

### Current Baseline (Static HTML)
Note: Actual Lighthouse audit should be run manually in Chrome DevTools for accurate metrics.

**Expected Current Metrics:**
- Performance: 85-95 (CDN dependency may vary)
- Accessibility: 90-95
- Best Practices: 85-90
- SEO: 90-95

### Bundle Size Target (Next.js)
- **Total Gzipped JS**: ≤ 500KB
- **Strategy**: Bundle Three.js with application code
- **Optimization**: Tree-shaking unused Three.js modules
- **Code Splitting**: Separate Three.js chunk for dynamic import

## Color Palette (from inline CSS)

### Terminal Colors
- **Background**: #000 (black)
- **Text Primary**: #0f0 (green)
- **Text Secondary**: #aaa (gray)
- **Link Default**: #0f0 (green)
- **Link Hover**: #0ff (cyan)
- **Header Background**: #333 (dark gray)
- **Border**: #555 (medium gray)

### Window Controls
- **Close**: #ff5f57 (red)
- **Minimize**: #ffbd2e (yellow)
- **Maximize**: #28c940 (green)

### Three.js Scene Colors
- **Background**: #000000 (black)
- **Ambient Light**: #003300 (dark green)
- **Directional Light**: #00aa66 (medium green)
- **Point Light**: #00cc66 (bright green)
- **Spotlight**: #00ff66 (very bright green)
- **Grid Major**: #006600 (medium green)
- **Grid Minor**: #004400 (darker green)

### Shader Colors
- **Standard Block Base**: vec3(0.0, 0.5 * brightness, 0.0)
- **Standard Block Rim**: vec3(0.0, 0.3 * rim, 0.0)
- **Highlighted Block Base**: vec3(0.0, 0.9 * brightness, 0.2)
- **Highlighted Block Rim**: vec3(0.0, 0.4 * rim, 0.1)

## Notes for Next.js Migration

### Performance Considerations
1. **Three.js Bundle**: Currently loaded from CDN (~140KB gzipped). Next.js will bundle it, potentially increasing initial load but improving caching control.
2. **Code Splitting**: Implement dynamic import for Three.js scene to reduce initial bundle.
3. **CSS**: Moving from inline styles to CSS Modules will improve cacheability.
4. **Static Export**: Using `output: 'export'` will maintain similar performance characteristics.

### Optimization Opportunities
1. Lazy load Three.js scene component on desktop only
2. Tree-shake unused Three.js modules
3. Implement skeleton loading state during Three.js initialization
4. Consider using Three.js ES6 modules instead of global THREE object

### Risk Areas
1. Three.js initialization in React useEffect may have slight delay
2. Shader materials need careful porting to maintain exact visual appearance
3. Animation timing must be preserved exactly (500ms, 75ms, 1s intervals)
