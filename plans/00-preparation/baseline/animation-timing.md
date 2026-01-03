# Animation Timing Values - Baseline Reference

**Date:** 2026-01-01
**Source:** website/jonathan-wilson-90s.html
**Phase:** Phase 0 - Baseline Capture

## Typing Animation

### Configuration
```javascript
const typingSpeed = 75; // milliseconds per character
const initialDelay = 500; // milliseconds before typing starts
```

### Implementation
```javascript
const commandText = commandLine.querySelector('.command');
const originalText = commandText.textContent; // "cat about_me.txt"

commandText.textContent = '';

let characterIndex = 0;

function typeWriter() {
    if (characterIndex < originalText.length) {
        commandText.textContent += originalText.charAt(characterIndex);
        characterIndex++;
        setTimeout(typeWriter, typingSpeed);
    }
}

// Start typing after initial delay
setTimeout(typeWriter, 500);
```

### Parameters
- **Initial delay:** `500ms` (half a second before typing starts)
- **Character interval:** `75ms` (time between each character appearing)
- **Text typed:** `"cat about_me.txt"` (15 characters)
- **Total animation time:** `500ms + (15 × 75ms) = 1625ms` (1.625 seconds)

### Sequence
1. Page loads → Wait 500ms
2. Type "c" → Wait 75ms
3. Type "a" → Wait 75ms
4. Type "t" → Wait 75ms
5. Type " " → Wait 75ms
6. Type "a" → Wait 75ms
7. Type "b" → Wait 75ms
8. Type "o" → Wait 75ms
9. Type "u" → Wait 75ms
10. Type "t" → Wait 75ms
11. Type "_" → Wait 75ms
12. Type "m" → Wait 75ms
13. Type "e" → Wait 75ms
14. Type "." → Wait 75ms
15. Type "t" → Wait 75ms
16. Type "x" → Wait 75ms
17. Type "t" → Animation complete

## Cursor Blink Animation

### CSS Keyframes
```css
@keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
}

.cursor {
    display: inline-block;
    width: 8px;
    height: 1.2em;
    background-color: #0f0;
    margin-left: 4px;
    vertical-align: middle;
    animation: blink 1s infinite;
}
```

### Parameters
- **Animation duration:** `1s` (1 second per complete blink cycle)
- **Animation type:** Infinite loop
- **Opacity at 0%:** `1` (fully visible)
- **Opacity at 50%:** `0` (fully invisible)
- **Opacity at 100%:** `1` (fully visible)

### Timing Breakdown
- **0ms - 500ms:** Cursor visible (opacity 1 → 0)
- **500ms - 1000ms:** Cursor invisible then visible (opacity 0 → 1)
- **Cycle repeats indefinitely**

### Visual Properties
- **Width:** `8px`
- **Height:** `1.2em` (relative to font size)
- **Color:** `#0f0` (bright green)
- **Margin left:** `4px` (spacing from text)

## Footer Interaction Animation

### Configuration
```javascript
const footerChangeDelay = 2000; // milliseconds
```

### Implementation
```javascript
document.addEventListener('keydown', function(e) {
    const footer = document.querySelector('.footer');
    footer.textContent = 'Command not found. Type "help" for options.';

    setTimeout(() => {
        footer.textContent = '[Press any key to continue...]';
    }, 2000);
});
```

### Parameters
- **Trigger:** Any keydown event
- **Text change:** Immediate (0ms delay)
- **Reset delay:** `2000ms` (2 seconds)
- **Original text:** `"[Press any key to continue...]"`
- **Changed text:** `"Command not found. Type \"help\" for options."`

### Sequence
1. User presses any key → Footer text changes immediately
2. Wait 2000ms
3. Footer reverts to original text

## Three.js Animation

### Shader Time Update
```javascript
function animate() {
    requestAnimationFrame(animate);

    // Update shader time for pulsing effect
    if (shaderMaterial) {
        shaderMaterial.uniforms.time.value += 0.01;
    }

    renderer.render(scene, camera);
}
```

### Parameters
- **Time increment:** `0.01` per frame
- **Frame rate:** ~60fps (browser default for requestAnimationFrame)
- **Time per second:** `0.01 × 60 = 0.6` units/second (approximate)

### Pulsing Effects

#### Standard Shader Pulse
```glsl
float pulse = 0.8 + 0.2 * sin(time * 1.5);
```
- **Frequency:** `1.5` (in shader time units)
- **Amplitude:** `0.2` (oscillates between 0.8 and 1.0)
- **Period:** `2π / 1.5 ≈ 4.19` shader time units
- **Real-world period:** `4.19 / 0.6 ≈ 6.98` seconds (~7 seconds per pulse cycle)

#### Highlighted Shader Pulse
```glsl
float pulse = 1.0 + 0.1 * sin(time * 1.5);
```
- **Frequency:** `1.5` (same as standard)
- **Amplitude:** `0.1` (oscillates between 1.0 and 1.1, more subtle)
- **Period:** `2π / 1.5 ≈ 4.19` shader time units
- **Real-world period:** `~7` seconds (same as standard)

#### Brightness Oscillation
```glsl
// Standard shader
float brightness = 0.4 + 0.1 * sin(time * 0.5 + vPosition.x * 2.0);

// Highlighted shader
float brightness = 0.7 + 0.1 * sin(time * 0.5 + vPosition.x * 2.0);
```
- **Frequency:** `0.5` (slower than pulse)
- **Amplitude:** `0.1`
- **Period:** `2π / 0.5 ≈ 12.57` shader time units
- **Real-world period:** `12.57 / 0.6 ≈ 20.95` seconds (~21 seconds per brightness cycle)
- **Spatial component:** `vPosition.x * 2.0` (varies by block position)

## Page Load Sequence

### Complete Timeline
```
0ms:        Page loads, DOM ready
0ms:        Three.js initialization begins
0ms-3000ms: Three.js scene setup and first render
500ms:      Typing animation begins
575ms:      First character appears ("c")
650ms:      Second character appears ("a")
...
1625ms:     Typing animation complete ("cat about_me.txt")
∞:          Cursor blinks continuously (1s cycle)
∞:          Three.js shaders pulse continuously
∞:          User can trigger footer change (2s timeout)
```

## Performance Considerations

### Animation Efficiency
- **Typing animation:** One-time, lightweight (uses setTimeout)
- **Cursor blink:** CSS-based, GPU-accelerated
- **Three.js rendering:** requestAnimationFrame, synced to display refresh
- **Shader calculations:** GPU-based, minimal CPU overhead

### Timing Precision
- **CSS animations:** Highly precise, browser-managed
- **setTimeout:** Subject to JavaScript event loop delays (~4-10ms variance)
- **requestAnimationFrame:** Synced to display refresh (16.67ms at 60Hz)
- **Shader time:** Incremental, relative (not absolute time)

## Critical Timing Values for Parity

| Animation | Parameter | Value | Unit | Critical? |
|-----------|-----------|-------|------|-----------|
| Typing delay | Initial delay | 500 | ms | Yes |
| Typing speed | Character interval | 75 | ms | Yes |
| Cursor blink | Cycle duration | 1 | s | Yes |
| Cursor blink | Keyframe 50% | 0.5 | s | Yes |
| Footer reset | Timeout | 2000 | ms | Medium |
| Shader time | Increment | 0.01 | per frame | Yes |
| Shader pulse | Frequency | 1.5 | time units | Yes |
| Shader pulse (standard) | Amplitude | 0.2 | scale | Yes |
| Shader pulse (highlighted) | Amplitude | 0.1 | scale | Yes |
| Brightness oscillation | Frequency | 0.5 | time units | Yes |
| Brightness oscillation | Amplitude | 0.1 | scale | Yes |

## Notes for Implementation

1. **Typing animation** must start exactly 500ms after page load
2. **Character interval** of 75ms creates a realistic typing feel
3. **Cursor blink** at 1s cycle is standard terminal behavior
4. **Shader time increment** of 0.01 per frame is critical for pulse timing
5. **Pulse frequencies** (1.5 for pulse, 0.5 for brightness) create layered animation
6. **Footer timeout** is less critical but contributes to UX feel

## Testing Checklist

- [ ] Typing starts at 500ms ± 50ms
- [ ] Each character appears at 75ms ± 10ms intervals
- [ ] Cursor completes full blink cycle in 1s ± 0.1s
- [ ] Cursor is fully invisible at 0.5s mark
- [ ] Footer reverts after 2s ± 0.2s on keypress
- [ ] Three.js pulse is smooth and continuous
- [ ] No visible jank or stuttering in animations
- [ ] All animations work at 30fps, 60fps, and 120fps displays
