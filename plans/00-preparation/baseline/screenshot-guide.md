# Screenshot Capture Guide

**Date:** 2026-01-01
**Phase:** Phase 0 - Baseline Capture
**Status:** Manual capture required

## Overview

Due to system limitations (missing system libraries for Playwright in WSL environment), screenshots need to be captured manually using Chrome DevTools. This guide provides exact steps for capturing baseline screenshots.

## Screenshot Requirements

### Breakpoints to Capture

| Breakpoint | Width | Height | Device Type | File Name |
|------------|-------|--------|-------------|-----------|
| Desktop | 1920px | 1080px | Desktop | `desktop-baseline.png` |
| Tablet | 768px | 1024px | Tablet | `tablet-baseline.png` |
| Mobile | 480px | 800px | Mobile | `mobile-baseline.png` |

### Additional Captures

| Capture | Description | File Name |
|---------|-------------|-----------|
| Three.js Scene | Desktop viewport focused on 3D scene | `threejs-scene-baseline.png` |
| Shader Detail | Close-up of blocks showing shader colors | `shader-colors-baseline.png` |
| Spotlight Effect | Close-up of spotlight on "proxy" block | `spotlight-detail-baseline.png` |
| Grid Floor | Close-up showing grid lines and colors | `grid-floor-baseline.png` |

## Manual Capture Instructions

### Step 1: Open Production Site
1. Open Chrome (or Chromium-based browser)
2. Navigate to: https://imjonathanwilson.me
3. Wait for page to fully load (allow 3-5 seconds for Three.js initialization)

### Step 2: Open DevTools
1. Press `F12` or `Ctrl+Shift+I` to open DevTools
2. Click the "Toggle device toolbar" button or press `Ctrl+Shift+M`
3. Select "Responsive" from the device dropdown

### Step 3: Capture Desktop Screenshot
1. Set viewport size to **1920 × 1080**
2. Wait 2 seconds for any responsive changes to settle
3. Right-click on the page
4. Select "Capture screenshot" or use DevTools screenshot feature
5. Save as: `plans/baseline/screenshots/desktop-baseline.png`

### Step 4: Capture Tablet Screenshot
1. Change viewport size to **768 × 1024**
2. Wait 2 seconds for responsive changes
3. Verify Three.js canvas is hidden (this is expected behavior)
4. Capture screenshot
5. Save as: `plans/baseline/screenshots/tablet-baseline.png`

### Step 5: Capture Mobile Screenshot
1. Change viewport size to **480 × 800**
2. Wait 2 seconds for responsive changes
3. Verify layout adjustments are correct
4. Capture screenshot
5. Save as: `plans/baseline/screenshots/mobile-baseline.png`

### Step 6: Capture Three.js Scene Detail
1. Return viewport to **1920 × 1080**
2. Wait for page to re-render
3. Take a full-page screenshot
4. Save as: `plans/baseline/screenshots/threejs-scene-baseline.png`

### Step 7: Shader Color Sampling (Optional but Recommended)
1. With DevTools open, click the "Inspect element" tool
2. Hover over different blocks in the Three.js scene
3. Use the color picker in the Styles panel to sample colors
4. Record exact RGB values for:
   - Standard directory block green
   - Highlighted "proxy" block green
   - Ambient lighting color
   - Grid line colors

### Step 8: Animation Timing Verification
1. Open DevTools Console
2. Watch the typing animation complete
3. Use browser's built-in FPS meter if available
4. Observe cursor blink timing (1 second cycle)
5. Note any timing inconsistencies

## Color Sampling Checklist

Use Chrome's color picker to verify these exact colors:

### Terminal Colors
- [ ] Background: `#000000` (pure black)
- [ ] Terminal text: `#0f0` (bright green)
- [ ] Terminal header: `#333333` (dark gray)
- [ ] Terminal title: `#aaaaaa` (medium gray)

### Window Control Colors
- [ ] Close button: `#ff5f57` (red)
- [ ] Minimize button: `#ffbd2e` (yellow)
- [ ] Maximize button: `#28c940` (green)

### Link Colors
- [ ] Default: `#0f0` (bright green)
- [ ] Hover: `#0ff` (cyan)

### Three.js Scene Colors (approximate - shader-based)
- [ ] Grid major lines: `#006600` (dark green)
- [ ] Grid minor lines: `#004400` (darker green)
- [ ] Ambient light: `#003300` (very dark green)
- [ ] Standard block glow: ~`#008000` (varies with animation)
- [ ] Highlighted block glow: ~`#00ff66` (brighter, varies with animation)

## Screenshot Analysis Checklist

After capturing screenshots, verify:

### Desktop (1920 × 1080)
- [ ] Three.js scene fully visible in background
- [ ] Terminal window centered on screen
- [ ] All blocks visible and properly positioned
- [ ] Spotlight beam visible pointing at "proxy" block
- [ ] Grid floor visible below blocks
- [ ] Terminal content readable and centered
- [ ] Window controls visible (red, yellow, green)
- [ ] Footer message visible at bottom

### Tablet (768 × 1024)
- [ ] Three.js canvas completely hidden
- [ ] Terminal window takes full width
- [ ] Text sizes appropriately scaled down
- [ ] Content remains readable
- [ ] No horizontal scrolling
- [ ] Footer positioned correctly
- [ ] Window controls smaller but visible

### Mobile (480 × 800)
- [ ] Three.js canvas completely hidden
- [ ] Further text size reduction
- [ ] Terminal text wraps correctly
- [ ] Contact links display properly (can break)
- [ ] Minimal padding preserved
- [ ] No layout overflow
- [ ] All content accessible by scrolling

### Three.js Scene Detail
- [ ] All 64 blocks visible (1 root + 63 directories)
- [ ] "proxy" block clearly highlighted
- [ ] Spotlight beam visible
- [ ] Ground circle visible under spotlight
- [ ] Grid floor extends across scene
- [ ] Camera angle matches original (slightly elevated, looking into grid)

## Troubleshooting

### Issue: Screenshots don't match expected layout
**Solution:** Clear browser cache and reload page, wait for full initialization

### Issue: Three.js scene appears black or blank
**Solution:** Wait longer (5-10 seconds) for WebGL initialization, check browser console for errors

### Issue: Responsive breakpoints don't trigger
**Solution:** Use exact pixel values, reload page after changing viewport size

### Issue: Colors appear washed out in screenshots
**Solution:** Use Chrome's native screenshot feature, not external tools; ensure color profile is sRGB

## Alternative Capture Method (If DevTools Screenshot Fails)

### Using External Tool
1. Set browser to exact viewport size
2. Press `F11` for fullscreen
3. Use system screenshot tool (Snipping Tool, Flameshot, etc.)
4. Capture exact browser viewport area
5. Crop to remove browser chrome if needed

### Using Browser Extensions
1. Install "Full Page Screen Capture" or similar extension
2. Configure to use exact viewport dimensions
3. Capture at each breakpoint
4. Save to designated location

## Files to Create

After manual capture, you should have:

```
plans/baseline/screenshots/
├── desktop-baseline.png
├── tablet-baseline.png
├── mobile-baseline.png
├── threejs-scene-baseline.png
├── shader-colors-baseline.png (optional)
├── spotlight-detail-baseline.png (optional)
└── grid-floor-baseline.png (optional)
```

## Next Steps

Once screenshots are captured:
1. Review each screenshot for completeness
2. Compare with component-architecture.md specifications
3. Use screenshots as visual reference during Phase 3 implementation
4. Create side-by-side comparisons during QA phase (Phase 5)
5. Archive screenshots with appropriate metadata

## Notes

- Screenshots are critical for visual parity validation
- Manual capture is acceptable if automated tools are unavailable
- Timestamp screenshots with capture date for tracking
- Consider creating a comparison template for side-by-side evaluation
- Screenshots will be used throughout implementation and QA phases

## Automation Script Available

The Python script at `scripts/capture_baseline_screenshots.py` is ready to use if system dependencies are installed:

```bash
# Install system dependencies (requires sudo)
playwright install-deps chromium

# Run screenshot capture
source .venv/bin/activate
python scripts/capture_baseline_screenshots.py
```

**Note:** This requires system package installation which may not be available in all environments.
