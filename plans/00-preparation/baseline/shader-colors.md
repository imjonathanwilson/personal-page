# Three.js Shader Colors - Baseline Reference

**Date:** 2026-01-01
**Source:** website/jonathan-wilson-90s.html
**Phase:** Phase 0 - Baseline Capture

## Color Palette

### Scene Colors
| Element | Hex Color | RGB | Description |
|---------|-----------|-----|-------------|
| Background | `#000000` | `0, 0, 0` | Black scene background |
| Base Green | `#00ff00` | `0, 255, 0` | Primary terminal green |

### Shader Material Colors

#### Standard Shader (Directory Blocks)
```glsl
// Base green color calculation
float brightness = 0.4 + 0.1 * sin(time * 0.5 + vPosition.x * 2.0);
vec3 color = vec3(0.0, 0.5 * brightness, 0.0);

// Rim lighting addition
float rim = 1.0 - abs(dot(vNormal, viewDirection));
rim = pow(rim, 2.0);
color += vec3(0.0, 0.3 * rim, 0.0);

// Pulsing effect
float pulse = 0.8 + 0.2 * sin(time * 1.5);
color *= pulse;

// Alpha value
float alpha = 0.8;
```

**Key Parameters:**
- Base brightness: `0.4 + 0.1 * sin(time * 0.5 + vPosition.x * 2.0)`
- Green component: `0.5 * brightness`
- Rim lighting: `0.3 * rim` (where rim = `pow(1.0 - abs(dot(vNormal, viewDirection)), 2.0)`)
- Pulse range: `0.8` to `1.0` (amplitude 0.2, frequency time * 1.5)
- Transparency: `0.8`

#### Highlighted Shader ("proxy" block)
```glsl
// Brighter green for highlighted block
float brightness = 0.7 + 0.1 * sin(time * 0.5 + vPosition.x * 2.0);
vec3 color = vec3(0.0, 0.9 * brightness, 0.2);

// Enhanced rim lighting
float rim = 1.0 - abs(dot(vNormal, viewDirection));
rim = pow(rim, 1.5);
color += vec3(0.0, 0.4 * rim, 0.1);

// Pulsing effect
float pulse = 1.0 + 0.1 * sin(time * 1.5);
color *= pulse;

// Solid (no transparency)
float alpha = 1.0;
```

**Key Parameters:**
- Base brightness: `0.7 + 0.1 * sin(time * 0.5 + vPosition.x * 2.0)` (higher than standard)
- Green component: `0.9 * brightness` (brighter than standard)
- Blue component: `0.2` (adds slight cyan tint)
- Rim lighting: `0.4 * rim` + `0.1` blue (more pronounced)
- Rim power: `1.5` (less falloff than standard's 2.0)
- Pulse range: `1.0` to `1.1` (amplitude 0.1, frequency time * 1.5)
- Transparency: `1.0` (fully opaque)

### Lighting Colors

| Light Type | Hex Color | RGB | Intensity | Position | Description |
|------------|-----------|-----|-----------|----------|-------------|
| Ambient | `#003300` | `0, 51, 0` | `0.8` | N/A | Dark green ambient |
| Directional | `#00aa66` | `0, 170, 102` | `1.0` | `(5, 10, 7)` | Green-cyan directional |
| Point | `#00cc66` | `0, 204, 102` | `1.0` @ distance 20 | `(-5, 8, 5)` | Bright green-cyan point |
| Spotlight | `#00ff66` | `0, 255, 102` | `5.0` | `(-8, 20, 10)` | Very bright green spotlight |

**Spotlight Details:**
- Target position: `(-8, 0, 8)` (points at "proxy" directory)
- Angle: `Math.PI / 4` (45 degrees)
- Penumbra: `0.5`
- Decay: `1.0`
- Distance: `50`

### Visual Effects Colors

| Element | Hex Color | RGB | Opacity | Description |
|---------|-----------|-----|---------|-------------|
| Light Beam | `#00ff66` | `0, 255, 102` | `0.2` | Cylinder from spotlight |
| Ground Circle | `#00ff66` | `0, 255, 102` | `0.3` | Circle at spotlight target |
| Grid Major Lines | `#006600` | `0, 102, 0` | `1.0` | Dark green grid lines |
| Grid Minor Lines | `#004400` | `0, 68, 0` | `1.0` | Darker green grid lines |

## Geometry Specifications

### Block Dimensions
| Block Type | Width | Height | Depth | Count |
|------------|-------|--------|-------|-------|
| Root | 2.5 | 2.5 | 2.5 | 1 |
| Standard Directory | 2.5 | 0.5 | 2.5 | 60 |
| Highlighted Directory | 2.5 | 1.75 | 2.5 | 3 |

**Highlighted Directories:**
1. "proc" at `(-8, 1.875, -4)` - Row 1
2. "backup" at `(8, 1.875, 0)` - Row 2
3. "mysql" at `(-4, 1.875, 12)` - Row 5
4. "ssh" at `(16, 1.875, 12)` - Row 5

**Note:** "proxy" at `(-8, 1.25, 8)` uses the highlighted shader but standard dimensions.

### Grid Layout
- **Total blocks:** 64 (1 root + 63 directories)
- **Grid arrangement:** 7 rows × 9 columns
- **Grid spacing:** 4 units
- **X range:** -16 to 16 (9 columns)
- **Z range:** -4 to 20 (7 rows)
- **Y position:** 1.25 for standard blocks, 1.875 for highlighted blocks

### Floor Grid
- **Size:** 50 units
- **Divisions:** 15
- **Major line color:** `#006600`
- **Minor line color:** `#004400`
- **Y position:** -1
- **Z position:** 10 (centered in scene)

## Camera Configuration

```javascript
camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 1000);
camera.position.set(0, 18, 40);
camera.lookAt(0, 0, -4);
```

**Parameters:**
- FOV: 50 degrees
- Near clipping: 0.1
- Far clipping: 1000
- Position: `(0, 18, 40)` - elevated and pulled back
- Look-at target: `(0, 0, -4)` - looking into the grid center

## Shader Time Increment

```javascript
shaderMaterial.uniforms.time.value += 0.01;
```

**Animation Loop:**
- Time increment per frame: `0.01`
- Applied to both standard and highlighted shader materials
- Drives pulsing animation effects

## Critical Measurements for Visual Parity

1. **Shader brightness ranges must match exactly**
2. **Rim lighting calculations are specific to each shader**
3. **Pulse frequencies and amplitudes differ between shaders**
4. **Highlighted shader has blue component (0.2) in base color**
5. **Light intensities are critical for scene mood**
6. **Spotlight angle and position create dramatic effect**
7. **Grid colors provide subtle depth cues**

## Notes for Implementation

- All shader calculations use time-based animations
- The "proxy" directory uses a different shader material entirely
- Light beam and ground circle are visual indicators, not functional lights
- Grid is positioned at y=-1 to create floor effect
- Camera angle is carefully balanced to show depth and drama
