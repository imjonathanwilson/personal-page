# Phase 3 Validation Plan - Component Architecture
**Agent:** Asheron
**Date:** 2026-01-01
**Phase:** 3 - Component Architecture Validation
**Status:** Preparation Phase

---

## Executive Summary

This document outlines Asheron's validation strategy for Phase 3. Bob will implement components sequentially in 4 iterations, and Asheron will validate each iteration immediately upon completion.

**Validation Approach:** Systematic testing against baseline specifications with documented results

**Success Criteria:** 100% visual parity, functional correctness, and responsive behavior matching original

---

## Iteration 1: Terminal Structure Validation

### Components to Validate
1. `TerminalWindow.tsx` + `TerminalWindow.module.css`
2. `TerminalHeader.tsx` + `TerminalHeader.module.css`
3. Window control buttons (red, yellow, green circles)
4. Title text: "jonathan-wilson@homepage:~"

### Validation Checklist

#### Visual Validation
- [ ] Terminal window container spans full viewport (100vh)
- [ ] Header background color matches baseline (#333 / --color-gray-dark)
- [ ] Header border matches baseline (#555 / --color-gray-medium)
- [ ] Window controls visible and positioned correctly
- [ ] Button colors match exactly:
  - Red: #ff5f57
  - Yellow: #ffbd2e
  - Green: #28c940
- [ ] Button size: 12px × 12px on desktop
- [ ] Title text: "jonathan-wilson@homepage:~"
- [ ] Title font: Courier New, monospace
- [ ] Title color matches baseline (#aaa / --color-gray-light)

#### Responsive Validation (Tablet 768px)
- [ ] Window controls scale down to 10px × 10px
- [ ] Title font size reduces to 12px
- [ ] Header padding reduces to 6px 12px
- [ ] Layout remains functional

#### Responsive Validation (Mobile 480px)
- [ ] All tablet adjustments apply
- [ ] No horizontal overflow
- [ ] Controls remain visible and clickable

#### Code Quality Validation
- [ ] CSS modules imported correctly
- [ ] TypeScript types defined for props
- [ ] No console errors on render
- [ ] Component compiles in strict mode
- [ ] Proper React component structure

#### Cross-Browser Testing (if possible)
- [ ] Chrome: Buttons render as perfect circles
- [ ] Firefox: Buttons render as perfect circles
- [ ] Safari: Buttons render as perfect circles (if accessible)
- [ ] Edge: Buttons render as perfect circles

### Validation Methodology

**Step 1: Visual Inspection**
```bash
npm run dev
# Open http://localhost:3000
# Open DevTools (F12)
# Inspect Elements tab
```

**Checks:**
1. Measure button sizes in DevTools (should be 12px × 12px)
2. Verify colors using DevTools color picker
3. Check CSS classes applied correctly
4. Verify header padding and layout

**Step 2: Responsive Testing**
```bash
# In DevTools:
# Enable Device Toolbar (Ctrl+Shift+M)
# Test at: 1920px, 768px, 480px
```

**Checks at each breakpoint:**
1. Screenshot for comparison
2. Measure button sizes
3. Check for horizontal overflow
4. Verify header dimensions

**Step 3: Code Review**
```bash
# Read component files
cat app/components/TerminalWindow/TerminalWindow.tsx
cat app/components/TerminalHeader/TerminalHeader.tsx
```

**Checks:**
1. CSS module imports use correct syntax
2. Props typed with TypeScript interfaces
3. Components use proper React patterns
4. No hardcoded styles (all via CSS modules)

**Step 4: Documentation**

Create `plans/phase3/iteration1-validation-report.md`:
```markdown
# Iteration 1 Validation Report - Terminal Structure

## Visual Validation
- Terminal window: [PASS/FAIL]
- Header colors: [PASS/FAIL]
- Window controls: [PASS/FAIL]
- Title text: [PASS/FAIL]

## Responsive Validation
- Desktop (1920px): [PASS/FAIL]
- Tablet (768px): [PASS/FAIL]
- Mobile (480px): [PASS/FAIL]

## Code Quality
- TypeScript compilation: [PASS/FAIL]
- CSS modules: [PASS/FAIL]
- React patterns: [PASS/FAIL]

## Issues Found
- [List any discrepancies]

## Screenshots
- Desktop: plans/phase3/iteration1-desktop.png
- Tablet: plans/phase3/iteration1-tablet.png
- Mobile: plans/phase3/iteration1-mobile.png

## Overall Status: [PASS/FAIL]
```

---

## Iteration 2: Content Components Validation

### Components to Validate
1. `InfoContent.tsx` + `InfoContent.module.css`
2. Semantic HTML structure (h1, h2, p, a)
3. Command line prompt rendering
4. Projects and skills sections
5. External links with `rel="noopener noreferrer"`

### Validation Checklist

#### Content Structure
- [ ] h1 element: "Jonathan Wilson"
- [ ] h1 color: white (#fff)
- [ ] h1 text-shadow: 0 0 5px rgba(0, 255, 0, 0.5)
- [ ] h2 elements for sections
- [ ] h2 color: green (#0f0)
- [ ] Paragraph elements with proper line-height (1.6)
- [ ] Links color: green (#0f0)
- [ ] Links hover: cyan (#0ff)

#### Command Line Prompt
- [ ] Terminal prompt visible: "user@homepage:~$"
- [ ] Prompt color: green (#0f0)
- [ ] Command text: "cat about_me.txt"
- [ ] Proper spacing between prompt and command

#### Typography Validation (Desktop)
- [ ] h1 font-size: 2.5em
- [ ] h2 font-size: 1.8em
- [ ] h2 margin-top: 30px
- [ ] h2 margin-bottom: 10px
- [ ] p font-size: 1.1em
- [ ] p line-height: 1.6
- [ ] p margin-bottom: 10px

#### Typography Validation (Tablet 768px)
- [ ] h1 font-size: 1.8em
- [ ] h2 font-size: 1.3em
- [ ] p font-size: 0.95em
- [ ] Text remains readable

#### Typography Validation (Mobile 480px)
- [ ] h1 font-size: 1.5em
- [ ] h2 font-size: 1.1em
- [ ] p font-size: 0.85em
- [ ] p line-height: 1.5
- [ ] No text overflow

#### Link Security
- [ ] All external links have `target="_blank"`
- [ ] All external links have `rel="noopener noreferrer"`
- [ ] Links open in new tab correctly

#### Keyboard Navigation
- [ ] Links focusable with Tab key
- [ ] Focus indicators visible
- [ ] Enter key activates links
- [ ] Tab order logical

### Validation Methodology

**Step 1: Content Inspection**
```bash
npm run dev
# Verify all content present
# Check heading hierarchy (h1 → h2)
# Verify paragraph content
```

**Step 2: Typography Measurement**
```bash
# In DevTools:
# Select h1 element
# Computed tab → font-size
# Verify: 2.5em (desktop)
# Repeat for h2, p
```

**Step 3: Link Security Audit**
```bash
# In DevTools Console:
document.querySelectorAll('a[href^="http"]').forEach(link => {
  console.log({
    href: link.href,
    target: link.target,
    rel: link.rel
  })
})

# Verify all external links have:
# - target="_blank"
# - rel="noopener noreferrer"
```

**Step 4: Keyboard Navigation Test**
```bash
# Manual test:
# 1. Click in URL bar (clear focus)
# 2. Press Tab repeatedly
# 3. Verify links receive focus
# 4. Verify focus indicator visible
# 5. Press Enter on focused link
# 6. Verify new tab opens
```

**Step 5: Responsive Typography Test**
```bash
# DevTools Device Toolbar
# Test at: 1920px, 768px, 480px
# Measure font sizes at each breakpoint
# Verify matches baseline specs
```

---

## Iteration 3: Animation Components Validation

### Components to Validate
1. `TypedCommand.tsx` - Typing animation component
2. Cursor component with blink animation
3. `Footer.tsx` with keyboard event listener

### Validation Checklist

#### Typing Animation
- [ ] Initial delay: 500ms (measure with stopwatch)
- [ ] Character interval: 75ms between characters
- [ ] Target element: First command line "cat about_me.txt"
- [ ] Animation plays on page load
- [ ] No animation on re-render (should mount once)
- [ ] Cleanup on unmount

#### Cursor Blink Animation
- [ ] Blink cycle: 1000ms (1 second)
- [ ] Pattern: 0-50% visible (opacity 1), 50-100% hidden (opacity 0)
- [ ] Animation: CSS @keyframes
- [ ] Cursor width: 8px
- [ ] Cursor height: 1.2em
- [ ] Cursor color: green (#0f0)
- [ ] Cursor position: After typed text
- [ ] Continuous blinking (infinite)

#### Footer Keyboard Interaction
- [ ] Default message visible
- [ ] Any keydown triggers message change
- [ ] Message displays for 2000ms (2 seconds)
- [ ] Returns to default after 2s timeout
- [ ] Multiple keypresses reset timer
- [ ] Cleanup on unmount

#### Footer Responsive Positioning
- [ ] Desktop: position absolute, bottom 10px
- [ ] Tablet: position relative, padding 15px
- [ ] Mobile: position relative, padding 15px
- [ ] Footer text centered
- [ ] Font size: 0.9em (desktop), 0.8em (mobile)

### Validation Methodology

**Step 1: Typing Animation Timing**
```bash
# Manual stopwatch test:
# 1. Open http://localhost:3000 in new incognito window
# 2. Start stopwatch immediately
# 3. Note when first character appears (should be 500ms)
# 4. Count characters typed
# 5. Measure total time
# 6. Calculate interval: (total_time - 500ms) / character_count
# 7. Verify interval = 75ms ± 5ms tolerance
```

**Alternative: Browser Performance API**
```javascript
// In DevTools Console during animation:
let startTime = null
let charCount = 0
const observer = new MutationObserver((mutations) => {
  if (!startTime) startTime = performance.now()
  charCount++
  console.log(`Char ${charCount} at ${performance.now() - startTime}ms`)
})
observer.observe(document.querySelector('.command'), {
  characterData: true,
  subtree: true
})
```

**Step 2: Cursor Blink Timing**
```bash
# Manual stopwatch test:
# 1. Watch cursor blink
# 2. Start stopwatch when cursor disappears
# 3. Note when cursor reappears (should be 500ms)
# 4. Note when cursor disappears again (should be 1000ms from start)
# 5. Repeat 3 times for accuracy
# 6. Verify cycle = 1000ms ± 50ms tolerance
```

**Step 3: Footer Interaction Test**
```bash
# Manual test:
# 1. Load page, note default footer message
# 2. Press any key (e.g., 'a')
# 3. Start stopwatch
# 4. Verify message changed
# 5. Wait 2000ms
# 6. Verify message returned to default
# 7. Press key again immediately
# 8. Verify timer resets
```

**Step 4: Animation Cleanup Test**
```bash
# In DevTools Console:
# 1. Check for active timers/intervals
# 2. Navigate away from page
# 3. Check for memory leaks in Memory profiler
# 4. Return to page
# 5. Verify animations restart correctly
```

**Step 5: Frame-by-Frame Comparison**
```bash
# Record both sites:
# 1. Original: https://imjonathanwilson.me
# 2. New: http://localhost:3000
# 3. Use browser screen recording or manual stopwatch
# 4. Compare timing side-by-side
# 5. Document any deviations > 50ms
```

### Expected Timing Values (from baseline)

| Animation | Delay | Interval | Duration | Total |
|-----------|-------|----------|----------|-------|
| Typing | 500ms | 75ms/char | N/A | ~500ms + (N × 75ms) |
| Cursor Blink | 0ms | N/A | 1000ms | Infinite |
| Footer Message | 0ms | N/A | 2000ms | On keydown |

---

## Iteration 4: Integration Validation

### Full Page Integration
1. All components composed in `app/page.tsx`
2. Full page rendering tested
3. All interactions working together

### Validation Checklist

#### Full Page Visual Comparison
- [ ] Side-by-side screenshot with original site
- [ ] Terminal window structure matches
- [ ] Content layout matches
- [ ] Footer positioning matches
- [ ] Overall visual parity confirmed

#### All Interactions Working
- [ ] Typing animation plays on load
- [ ] Cursor blinks continuously
- [ ] Links clickable and open in new tabs
- [ ] Footer responds to keyboard
- [ ] No JavaScript errors in console

#### Responsive Testing - All Breakpoints
- [ ] Desktop (1920px):
  - [ ] Full layout visible
  - [ ] Typography at full size
  - [ ] All animations working
  - [ ] Footer at bottom
- [ ] Tablet (768px):
  - [ ] Layout adjusts properly
  - [ ] Typography scaled down
  - [ ] Animations still working
  - [ ] Footer relative positioning
  - [ ] No horizontal scroll
- [ ] Mobile (480px):
  - [ ] Compact layout
  - [ ] Typography further reduced
  - [ ] Animations working
  - [ ] Footer visible
  - [ ] No horizontal scroll
  - [ ] All text readable

#### Performance Validation
- [ ] Page loads within 2 seconds
- [ ] No console errors
- [ ] No 404s for assets
- [ ] Typing animation smooth (no jank)
- [ ] Cursor animation smooth
- [ ] No layout shifts during load

#### Accessibility Validation
- [ ] Semantic HTML structure (h1, h2, p, a)
- [ ] Links have meaningful text
- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] Color contrast sufficient (green on black: 7:1+)

### Validation Methodology

**Step 1: Full Page Visual Comparison**
```bash
# Side-by-side browser windows:
# Left: https://imjonathanwilson.me (original)
# Right: http://localhost:3000 (new)

# Compare:
# 1. Header appearance
# 2. Content layout
# 3. Typography sizing
# 4. Colors
# 5. Footer position
# 6. Overall spacing

# Screenshot both at same viewport size
# Overlay in image editor if needed
# Document any pixel differences
```

**Step 2: Interaction Flow Test**
```bash
# Full user flow:
# 1. Load page (fresh incognito)
# 2. Watch typing animation complete
# 3. Observe cursor blinking
# 4. Hover over links (verify color change)
# 5. Click external link (verify new tab)
# 6. Press keyboard key (verify footer change)
# 7. Wait 2 seconds (verify footer reset)
# 8. Resize window (verify responsive behavior)
# 9. Check console for errors (should be 0)
```

**Step 3: Responsive Testing Comprehensive**
```bash
# Test breakpoints:
# 1. 1920 × 1080 (Desktop)
# 2. 1024 × 768 (Tablet landscape)
# 3. 768 × 1024 (Tablet portrait) ← breakpoint
# 4. 600 × 800 (Between tablet and mobile)
# 5. 480 × 800 (Mobile) ← breakpoint
# 6. 375 × 667 (iPhone SE)
# 7. 360 × 640 (Android)

# At each size:
# - Screenshot
# - Check for horizontal scroll
# - Verify text readable
# - Test interactions
# - Measure typography
```

**Step 4: Performance Profiling**
```bash
# Chrome DevTools:
# 1. Open Performance tab
# 2. Click Record
# 3. Refresh page
# 4. Let typing animation complete
# 5. Stop recording
# 6. Analyze:
#    - First Paint time
#    - DOM Content Loaded
#    - Load event
#    - Animation frame rate (should be 60fps)
#    - No long tasks (> 50ms)
```

**Step 5: Create Comprehensive Test Report**

File: `plans/phase3/iteration4-integration-report.md`

```markdown
# Iteration 4 Integration Report - Full Page

## Visual Parity
- Overall layout: [PASS/FAIL]
- Typography: [PASS/FAIL]
- Colors: [PASS/FAIL]
- Spacing: [PASS/FAIL]
- Screenshots: [attached]

## Interactions
- Typing animation: [PASS/FAIL]
- Cursor blink: [PASS/FAIL]
- Link clicks: [PASS/FAIL]
- Footer keyboard: [PASS/FAIL]

## Responsive Behavior
- Desktop (1920px): [PASS/FAIL]
- Tablet (768px): [PASS/FAIL]
- Mobile (480px): [PASS/FAIL]
- No horizontal overflow: [PASS/FAIL]

## Performance
- Page load time: [X]ms
- Typing animation fps: [X]fps
- Cursor blink fps: [X]fps
- Console errors: [X] (should be 0)

## Accessibility
- Semantic HTML: [PASS/FAIL]
- Keyboard navigation: [PASS/FAIL]
- Color contrast: [PASS/FAIL]

## Comparison with Original
- Visual match: [X]% (estimate)
- Functional match: [PASS/FAIL]
- Animation timing match: [PASS/FAIL]

## Issues Found
- [List any discrepancies]

## Overall Status: [PASS/FAIL]
- Ready for Phase 4: [YES/NO]
```

---

## Validation Tools & Resources

### Required Tools
1. **Browser:** Chrome (primary), Firefox, Safari, Edge (if available)
2. **DevTools:** Elements, Console, Performance, Network tabs
3. **Testing:** Manual keyboard, mouse, responsive device toolbar
4. **Timing:** Browser stopwatch or external timer app

### Baseline Reference Documents
1. `plans/baseline/performance.md` - Animation timing values
2. `plans/baseline/component-architecture.md` - Component structure
3. `plans/baseline/animation-timing.md` - Exact timing parameters
4. `plans/phase2-responsive-validation.md` - CSS specifications

### Validation Artifacts Location
```
plans/phase3/
├── iteration1-validation-report.md
├── iteration2-validation-report.md
├── iteration3-validation-report.md
├── iteration4-integration-report.md
├── screenshots/
│   ├── iteration1-desktop.png
│   ├── iteration1-tablet.png
│   ├── iteration1-mobile.png
│   ├── iteration2-desktop.png
│   ├── iteration2-tablet.png
│   ├── iteration2-mobile.png
│   ├── iteration3-typing-animation.gif
│   ├── iteration3-cursor-blink.gif
│   ├── iteration4-full-page-desktop.png
│   ├── iteration4-full-page-tablet.png
│   └── iteration4-full-page-mobile.png
└── phase3-validation-summary.md
```

---

## Success Criteria Summary

### Iteration 1: Terminal Structure
- ✅ Window controls render correctly (red, yellow, green)
- ✅ Header colors match baseline (#333, #555)
- ✅ Responsive sizing works (12px → 10px buttons)
- ✅ TypeScript compiles without errors

### Iteration 2: Content Components
- ✅ Typography matches baseline at all breakpoints
- ✅ Links have security attributes (rel="noopener noreferrer")
- ✅ Keyboard navigation functional
- ✅ Content structure semantic (h1, h2, p, a)

### Iteration 3: Animation Components
- ✅ Typing animation: 500ms delay, 75ms intervals
- ✅ Cursor blink: 1000ms cycle
- ✅ Footer interaction: 2s timeout
- ✅ All animations cleanup on unmount

### Iteration 4: Integration
- ✅ Visual parity > 95%
- ✅ All interactions functional
- ✅ Responsive at all breakpoints
- ✅ Zero console errors
- ✅ Performance acceptable (< 2s load)

---

## Communication Protocol

### After Each Iteration Validation

**Post to NATS #coordination:**
```
Iteration [N] Validation Complete - Asheron

Components validated:
- [Component 1]
- [Component 2]

Results:
✅ Visual parity: [PASS/FAIL]
✅ Responsive: [PASS/FAIL]
✅ Code quality: [PASS/FAIL]

Issues found: [X]
- [List issues if any]

Status: [PASS/FAIL]
Ready for next iteration: [YES/NO]

Report: plans/phase3/iteration[N]-validation-report.md
```

### If Issues Found

**Post to NATS #errors:**
```
Phase 3 Iteration [N] - Issues Found - Asheron

Component: [ComponentName]
Issue: [Description]
Expected: [What baseline shows]
Actual: [What implementation shows]
Severity: [High/Medium/Low]

Bob: Please review and fix when you have time.
```

---

## Validation Timeline (Estimated)

| Iteration | Bob Implementation | Asheron Validation | Total |
|-----------|-------------------|-------------------|-------|
| Iteration 1 | ~60 min | ~30 min | ~90 min |
| Iteration 2 | ~90 min | ~45 min | ~135 min |
| Iteration 3 | ~120 min | ~60 min | ~180 min |
| Iteration 4 | ~45 min | ~90 min | ~135 min |
| **Total** | **~315 min** | **~225 min** | **~540 min** |

**Note:** Iterations run sequentially, not in parallel. Total elapsed time depends on issue resolution.

---

## Current Status

**Phase 3 Status:** Waiting for Bob to start Iteration 1

**Asheron Preparation:**
- ✅ Validation plan documented
- ✅ Validation checklists created
- ✅ Baseline references reviewed
- ✅ Testing methodology defined
- ✅ Communication protocol established

**Next Steps:**
1. Monitor NATS #coordination for Bob's Iteration 1 start message
2. Monitor file system for component creation
3. Begin validation immediately when Iteration 1 complete
4. Document results and communicate via NATS
5. Wait for Bob to begin Iteration 2
6. Repeat validation cycle

**Blockers:** None - ready to validate when Bob completes components

---

**Agent:** Asheron
**Date:** 2026-01-01
**Phase:** 3 - Validation Preparation Complete
**Status:** Ready for component validation work
