# Component Architecture Analysis - Baseline Reference

**Date:** 2026-01-01
**Source:** website/jonathan-wilson-90s.html
**Phase:** Phase 0 - Component Breakdown

## Component Hierarchy

```
App
├── ThreeScene (Background)
│   ├── Scene
│   ├── Camera
│   ├── Renderer
│   ├── FileVision Group
│   │   ├── Root Block (1)
│   │   └── Directory Blocks (63)
│   ├── Lighting
│   │   ├── Ambient Light
│   │   ├── Directional Light
│   │   ├── Point Light
│   │   └── Spotlight
│   ├── Visual Effects
│   │   ├── Light Beam (Cylinder)
│   │   └── Ground Circle
│   └── Grid Floor
│
└── TerminalWindow
    ├── TerminalHeader
    │   ├── WindowControls
    │   │   ├── CloseButton (red)
    │   │   ├── MinimizeButton (yellow)
    │   │   └── MaximizeButton (green)
    │   └── TerminalTitle
    │
    ├── TerminalBody
    │   └── InfoContainer
    │       ├── CommandLine (1)
    │       │   ├── Prompt ("> ")
    │       │   ├── TypedCommand ("cat about_me.txt")
    │       │   └── Cursor (blinking)
    │       │
    │       ├── InfoContent
    │       │   ├── Heading (h1)
    │       │   ├── Subheading (h2)
    │       │   ├── ContactInfo
    │       │   │   ├── GitHub Link
    │       │   │   └── LinkedIn Link
    │       │   └── Paragraphs (2)
    │       │
    │       ├── CommandLine (2)
    │       │   ├── Prompt ("> ")
    │       │   └── Command ("ls -la projects/")
    │       │
    │       ├── TerminalText (1)
    │       │   └── Projects Tree
    │       │
    │       ├── CommandLine (3)
    │       │   ├── Prompt ("> ")
    │       │   └── Command ("man skills")
    │       │
    │       └── TerminalText (2)
    │           └── Skills List
    │
    └── Footer
        └── Interactive Message
```

## Component Specifications

### 1. ThreeScene Component

**Purpose:** Background 3D visualization using Three.js
**Z-index:** 0 (behind terminal)
**Container:** `#canvas-container`

#### Properties
- Position: `absolute`, covering full viewport
- Size: `100vw × 100vh`
- Hidden on mobile: `display: none` at `max-width: 768px`

#### Children Components
1. **Scene** - THREE.Scene with black background
2. **Camera** - PerspectiveCamera (50°, aspect, 0.1, 1000)
3. **Renderer** - WebGLRenderer with antialias
4. **FileVision Group** - Container for all blocks
5. **Lighting System** - 4 lights (ambient, directional, point, spotlight)
6. **Visual Effects** - Light beam and ground circle
7. **Grid Floor** - GridHelper for floor

#### State Management Needs
```typescript
interface ThreeSceneState {
    scene: THREE.Scene | null
    camera: THREE.PerspectiveCamera | null
    renderer: THREE.WebGLRenderer | null
    shaderMaterial: THREE.ShaderMaterial | null
    highlightedShaderMaterial: THREE.ShaderMaterial | null
    animationId: number | null
}
```

#### Lifecycle
- **Mount:** Initialize scene, camera, renderer, add to DOM
- **Animate:** Update shader time uniforms, render loop
- **Resize:** Update camera aspect ratio and renderer size
- **Unmount:** Cancel animation frame, dispose geometries/materials/renderer

---

### 2. TerminalWindow Component

**Purpose:** Main terminal container with header and body
**Z-index:** 10 (foreground)
**Display:** Flexbox column layout

#### Structure
```html
<div className="terminal">
    <TerminalHeader />
    <TerminalBody />
    <Footer />
</div>
```

#### Styling
- Width: `100%`
- Height: `100%`
- Display: `flex`
- Flex-direction: `column`
- Position: `relative`

---

### 3. TerminalHeader Component

**Purpose:** Window chrome with controls and title
**Background:** `#333`
**Border-bottom:** `1px solid #555`

#### Structure
```html
<div className="terminal-header">
    <WindowControls />
    <TerminalTitle />
</div>
```

#### Styling
- Display: `flex`
- Justify-content: `space-between`
- Align-items: `center`
- Padding: `8px 15px` (desktop), `6px 12px` (mobile)

---

### 4. WindowControls Component

**Purpose:** Mac-style window control buttons

#### Structure
```html
<div className="window-controls">
    <div className="control-btn close" />   <!-- Red -->
    <div className="control-btn minimize" />  <!-- Yellow -->
    <div className="control-btn maximize" />  <!-- Green -->
</div>
```

#### Button Specifications
| Button | Color | Hex | Size (Desktop) | Size (Mobile) |
|--------|-------|-----|----------------|---------------|
| Close | Red | `#ff5f57` | 12px × 12px | 10px × 10px |
| Minimize | Yellow | `#ffbd2e` | 12px × 12px | 10px × 10px |
| Maximize | Green | `#28c940` | 12px × 12px | 10px × 10px |

#### Styling
- Display: `flex`
- Gap: `8px`
- Border-radius: `50%` (circular buttons)

---

### 5. TerminalTitle Component

**Purpose:** Display terminal window title
**Text:** "jonathan-wilson@homepage:~"
**Color:** `#aaa` (light gray)

#### Styling
- Font-size: `14px` (desktop), `12px` (tablet), `11px` (mobile)
- Font-weight: `bold`

---

### 6. TerminalBody Component

**Purpose:** Scrollable content area
**Layout:** Flexbox, centered content

#### Styling
- Flex: `1` (takes remaining space)
- Display: `flex`
- Flex-direction: `column`
- Justify-content: `center` (desktop), `flex-start` (mobile)
- Align-items: `center`
- Padding: `20px` (desktop), `10px` (tablet), `8px` (mobile)
- Overflow-y: `auto` (scrollable)

---

### 7. InfoContainer Component

**Purpose:** Dark semi-transparent box for content
**Background:** `rgba(0, 15, 0, 0.85)` (dark green with 85% opacity)
**Border-radius:** `5px`

#### Styling
- Text-align: `center`
- Max-width: `800px` (desktop)
- Width: `100%`
- Min-height: `700px` (desktop), `auto` (mobile)
- Padding: `40px` (desktop), `20px 10px` (tablet), `15px 8px` (mobile)

---

### 8. CommandLine Component

**Purpose:** Terminal prompt with command text
**Count:** 3 instances in the page

#### Structure
```html
<div className="command-line">
    <span className="terminal-prompt">> </span>
    <span className="command">{commandText}</span>
    <span className="cursor" />  <!-- Only on first command line -->
</div>
```

#### Instances
1. **Command 1:** "cat about_me.txt" (with cursor, typing animation)
2. **Command 2:** "ls -la projects/"
3. **Command 3:** "man skills"

#### Styling
- Display: `flex`
- Align-items: `center`
- Margin-top: `15px` (desktop), `12px` (mobile)

---

### 9. Prompt Component

**Purpose:** Terminal prompt indicator
**Text:** "> "
**Color:** `#0f0` (bright green)

#### Styling
- Display: `inline-block`
- Margin-right: `8px`

---

### 10. TypedCommand Component

**Purpose:** Command text with typing animation
**Initial text:** "cat about_me.txt"
**Color:** `#fff` (white)

#### State Management Needs
```typescript
interface TypedCommandState {
    displayText: string
    currentIndex: number
    isComplete: boolean
}
```

#### Animation Logic
- Delay: 500ms before start
- Interval: 75ms per character
- Text progressively reveals from empty to full

---

### 11. Cursor Component

**Purpose:** Blinking terminal cursor
**Appearance:** Green rectangle

#### Styling
- Display: `inline-block`
- Width: `8px`
- Height: `1.2em`
- Background-color: `#0f0`
- Margin-left: `4px`
- Vertical-align: `middle`
- Animation: `blink 1s infinite`

#### Animation Keyframes
```css
@keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
}
```

---

### 12. InfoContent Component

**Purpose:** Main bio and contact information

#### Structure
```html
<div className="info-content">
    <h1>Jonathan Wilson</h1>
    <h2>Senior Site Reliability Engineer</h2>
    <ContactInfo />
    <p>{bio paragraph 1}</p>
    <p>{bio paragraph 2}</p>
</div>
```

#### Typography Specifications
| Element | Desktop | Tablet (768px) | Mobile (480px) |
|---------|---------|----------------|----------------|
| h1 | 2.5em | 1.8em | 1.5em |
| h2 | 1.8em | 1.3em | 1.1em |
| p | 1.1em | 0.95em | 0.85em |

#### Colors
- h1: `#fff` with green glow shadow: `0 0 5px rgba(0, 255, 0, 0.5)`
- h2: `#0f0`
- p: `#0f0` (inherited)

---

### 13. ContactInfo Component

**Purpose:** Social media links

#### Structure
```html
<div className="contact-info">
    <a href="https://github.com/imjonathanwilson"
       target="_blank"
       rel="noopener noreferrer">
        github.com/imjonathanwilson
    </a>
    <span className="separator"> | </span>  <!-- Hidden on mobile -->
    <a href="https://linkedin.com/in/imjonathanwilson"
       target="_blank"
       rel="noopener noreferrer">
        linkedin.com/in/imjonathanwilson
    </a>
</div>
```

#### Styling
- Display: `flex`
- Flex-direction: `column`
- Align-items: `center`
- Gap: `5px`
- Margin: `15px 0 25px 0` (desktop), `12px 0 20px 0` (mobile)
- Font-size: `0.95em` (desktop), `0.85em` (tablet), `0.75em` (mobile)

#### Link Styling
- Color: `#0f0`
- Text-decoration: `none`
- Hover color: `#0ff` (cyan)
- Hover text-decoration: `underline`

#### Security Attributes
- `target="_blank"` - Opens in new tab
- `rel="noopener noreferrer"` - Security best practice

---

### 14. TerminalText Component

**Purpose:** Preformatted terminal output
**Count:** 2 instances (projects tree, skills list)

#### Structure
```html
<div className="terminal-text">
    {preformattedText}
</div>
```

#### Instances

**Instance 1: Projects Tree**
```
projects/
├── infrastructure-automation
├── cloud-security-tools
├── devops-pipelines
└── monitoring-dashboard
```

**Instance 2: Skills List**
```
LANGUAGES: Python, JavaScript, TypeScript, Go, Rust
FRAMEWORKS: React, Node.js, Express, Django
CLOUD: AWS, Terraform, Docker, Kubernetes
OTHER: CI/CD, Ansible, Monitoring
```

#### Styling
- White-space: `pre` (desktop), `pre-wrap` (mobile)
- Text-align: `left`
- Font-size: `1em` (desktop), `0.8em` (tablet), `0.65em` (mobile)
- Word-wrap: `break-word` (mobile)
- Overflow-wrap: `break-word` (mobile)

---

### 15. Footer Component

**Purpose:** Interactive status message
**Position:** `absolute` (desktop), `relative` (mobile)
**Z-index:** 10

#### Default Text
```
[Press any key to continue...]
```

#### Interaction Text
```
Command not found. Type "help" for options.
```

#### State Management Needs
```typescript
interface FooterState {
    message: string
    timeoutId: number | null
}
```

#### Styling
- Color: `#555` (dark gray)
- Font-size: `0.9em` (desktop), `0.8em` (mobile)
- Position: `bottom: 10px` (desktop), `relative` (mobile)
- Text-align: `center` (mobile)
- Padding: `15px` (mobile)

#### Interaction Logic
- On keydown: Change message immediately
- After 2000ms: Revert to default message
- Clear previous timeout if key pressed again

---

## Responsive Breakpoints

### Desktop (> 768px)
- Three.js scene visible
- Terminal centered with padding
- Larger font sizes
- Absolute positioned footer

### Tablet (≤ 768px)
- Three.js scene hidden
- Reduced padding and font sizes
- Content width constrained
- Relative positioned footer
- Scrollable body

### Mobile (≤ 480px)
- Further reduced font sizes
- Minimal padding (8px)
- Text wrapping enabled for terminal text
- Contact links allow word break

---

## Component Props Interface Suggestions

### ThreeScene
```typescript
interface ThreeSceneProps {
    // No props needed - self-contained
}
```

### TerminalWindow
```typescript
interface TerminalWindowProps {
    // No props needed - composition of children
}
```

### TerminalHeader
```typescript
interface TerminalHeaderProps {
    title?: string // Default: "jonathan-wilson@homepage:~"
}
```

### WindowControls
```typescript
interface WindowControlsProps {
    // No props needed - static display
}
```

### TypedCommand
```typescript
interface TypedCommandProps {
    text: string
    typingSpeed?: number // Default: 75
    initialDelay?: number // Default: 500
    showCursor?: boolean // Default: false
}
```

### Cursor
```typescript
interface CursorProps {
    blinkDuration?: number // Default: 1000 (1s)
}
```

### InfoContent
```typescript
interface InfoContentProps {
    name: string
    title: string
    bio: string[]
    github: string
    linkedin: string
}
```

### CommandLine
```typescript
interface CommandLineProps {
    prompt?: string // Default: "> "
    command: string
    showCursor?: boolean
    animated?: boolean
}
```

### TerminalText
```typescript
interface TerminalTextProps {
    content: string
    preformatted?: boolean // Default: true
}
```

### Footer
```typescript
interface FooterProps {
    defaultMessage?: string // Default: "[Press any key to continue...]"
    interactionMessage?: string // Default: "Command not found..."
    resetDelay?: number // Default: 2000
}
```

---

## CSS Modules Structure

### Recommended CSS Module Files

1. **ThreeScene.module.css**
   - `.container` - Canvas container

2. **TerminalWindow.module.css**
   - `.terminal` - Main terminal container

3. **TerminalHeader.module.css**
   - `.header` - Header container
   - `.title` - Terminal title

4. **WindowControls.module.css**
   - `.controls` - Controls container
   - `.button` - Base button style
   - `.buttonRed` - Close button
   - `.buttonYellow` - Minimize button
   - `.buttonGreen` - Maximize button

5. **TerminalBody.module.css**
   - `.body` - Terminal body container

6. **InfoContainer.module.css**
   - `.container` - Dark semi-transparent box

7. **CommandLine.module.css**
   - `.commandLine` - Command line container
   - `.prompt` - Prompt text
   - `.command` - Command text

8. **Cursor.module.css**
   - `.cursor` - Blinking cursor
   - `@keyframes blink` - Blink animation

9. **InfoContent.module.css**
   - `.content` - Content container
   - `.heading` - h1 styling
   - `.subheading` - h2 styling
   - `.paragraph` - p styling

10. **ContactInfo.module.css**
    - `.container` - Contact info container
    - `.link` - Link styling
    - `.separator` - Separator (hidden on mobile)

11. **TerminalText.module.css**
    - `.text` - Preformatted text

12. **Footer.module.css**
    - `.footer` - Footer container

---

## Implementation Priority Order

### Phase 3 (Component Architecture)

**Iteration 1: Terminal Structure**
1. TerminalWindow
2. TerminalHeader
3. WindowControls
4. TerminalBody

**Iteration 2: Content Components**
5. InfoContainer
6. InfoContent
7. CommandLine
8. TerminalText
9. ContactInfo

**Iteration 3: Animation Components**
10. TypedCommand
11. Cursor
12. Footer

**Iteration 4: Three.js (Phase 4)**
13. ThreeScene

---

## State Management Considerations

### Local Component State
- TypedCommand: typing animation state
- Footer: message and timeout state
- ThreeScene: Three.js objects and animation frame

### Global State
- Not needed for this simple application
- All components are self-contained

### Context
- Not needed - props can be passed down directly
- Consider theme context if adding dark/light mode later

---

## Notes for Implementation

1. **Start with static components first** (TerminalHeader, WindowControls)
2. **Add animations incrementally** (TypedCommand, Cursor)
3. **Test responsive behavior at each breakpoint** (768px, 480px)
4. **Three.js component is the most complex** - save for Phase 4
5. **Use CSS Modules** to avoid style conflicts
6. **Maintain semantic HTML** for accessibility
7. **Preserve exact pixel values** from original for visual parity
8. **Test keyboard navigation** for Footer interaction

---

## Testing Checklist Per Component

- [ ] Renders without errors
- [ ] Matches original visual appearance
- [ ] Responsive at all breakpoints
- [ ] Animations timing correct (if applicable)
- [ ] Accessibility attributes present
- [ ] CSS modules scoped correctly
- [ ] Props interface typed correctly
- [ ] Cleanup on unmount (if stateful)
