import * as THREE from 'three'

// fsn shades every box with flat per-face colours: the base colour at fixed brightness
// factors, brightest on top and darkest at the back. There is no real lighting.
export const TOP_FACTOR = 1.0
export const FRONT_FACTOR = 0.78
export const SIDE_FACTOR = 0.62
export const BACK_FACTOR = 0.45
export const BOTTOM_FACTOR = 0.3
export const HOVER_BOOST = 0.14 // share of the way to white that every face is lifted when hovered
export const SELECT_BOOST = 0.3 // the same for the selected node (the spotlight's glow)

const materialCache = new Map<string, THREE.MeshBasicMaterial[]>()

// The factor scales the colour as it appears on screen (sRGB), then the boost blends toward white
function shade(baseHex: string, factor: number, boost: number): THREE.Color {
  const base = new THREE.Color(baseHex).getRGB({ r: 0, g: 0, b: 0 }, THREE.SRGBColorSpace)
  const lift = (channel: number) => {
    const shaded = channel * factor
    return shaded + (1 - shaded) * boost
  }
  return new THREE.Color().setRGB(lift(base.r), lift(base.g), lift(base.b), THREE.SRGBColorSpace)
}

// Material order for BoxGeometry: +x, -x, +y (top), -y, +z (front), -z (back).
export function getFaceMaterials(baseHex: string, hovered: boolean, selected = false): THREE.MeshBasicMaterial[] {
  const cacheKey = `${baseHex}|${hovered}|${selected}`
  const cached = materialCache.get(cacheKey)
  if (cached) return cached
  const boost = selected ? SELECT_BOOST : hovered ? HOVER_BOOST : 0
  const face = (factor: number) =>
    new THREE.MeshBasicMaterial({ color: shade(baseHex, factor, boost), fog: false })
  const materials = [
    face(SIDE_FACTOR),
    face(SIDE_FACTOR),
    face(TOP_FACTOR),
    face(BOTTOM_FACTOR),
    face(FRONT_FACTOR),
    face(BACK_FACTOR),
  ]
  materialCache.set(cacheKey, materials)
  return materials
}

export function disposeFaceMaterials() {
  materialCache.forEach((materials) => materials.forEach((material) => material.dispose()))
  materialCache.clear()
}
