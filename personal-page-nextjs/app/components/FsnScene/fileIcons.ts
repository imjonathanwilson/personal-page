import * as THREE from 'three'

// fsn lays each file's desktop icon flat on top of its block. The film's icons are SGI's own
// artwork, so these are original drawings in the same spirit: flat, unlit shapes seen from
// above, drawn only in tints and shades of the block's own colour (pale blue on a blue block,
// pale green on a green one), with thin darker outlines.

export type FileIconKind = 'document' | 'link' | 'project'

export function iconKindFor(name: string): FileIconKind {
  if (name.endsWith('.lnk')) return 'link'
  if (name.includes('.')) return 'document'
  return 'project'
}

const CANVAS_SIZE = 256
const OUTLINE_WIDTH = 4

// Tints (toward white) and shades (toward black) of the block colour, as seen on screen (sRGB)
type Palette = { highlight: string; paper: string; tint: string; shade: string; outline: string }

function mixHex(baseHex: string, towardHex: string, amount: number): string {
  const base = new THREE.Color(baseHex)
  const toward = new THREE.Color(towardHex)
  return `#${base.lerp(toward, amount).getHexString()}`
}

function paletteFor(baseHex: string): Palette {
  return {
    highlight: mixHex(baseHex, '#ffffff', 0.82),
    paper: mixHex(baseHex, '#ffffff', 0.6),
    tint: mixHex(baseHex, '#ffffff', 0.35),
    shade: mixHex(baseHex, '#000000', 0.3),
    outline: mixHex(baseHex, '#000000', 0.6),
  }
}

type Context = CanvasRenderingContext2D

function outlined(context: Context, fill: string, palette: Palette) {
  context.fillStyle = fill
  context.fill()
  context.lineWidth = OUTLINE_WIDTH
  context.strokeStyle = palette.outline
  context.lineJoin = 'round'
  context.stroke()
}

// A page centred on the origin with its top-right corner folded over
function drawPage(context: Context, palette: Palette, width: number, height: number, fill: string, withLines: boolean) {
  const fold = width * 0.22
  const left = -width / 2
  const top = -height / 2
  context.beginPath()
  context.moveTo(left, top)
  context.lineTo(left + width - fold, top)
  context.lineTo(left + width, top + fold)
  context.lineTo(left + width, top + height)
  context.lineTo(left, top + height)
  context.closePath()
  outlined(context, fill, palette)
  context.beginPath()
  context.moveTo(left + width - fold, top)
  context.lineTo(left + width - fold, top + fold)
  context.lineTo(left + width, top + fold)
  context.closePath()
  outlined(context, palette.tint, palette)
  if (!withLines) return
  context.strokeStyle = palette.shade
  context.lineWidth = 5
  context.lineCap = 'round'
  const lineCount = 6
  for (let line = 0; line < lineCount; line++) {
    const lineY = top + fold + 14 + line * ((height - fold - 28) / (lineCount - 1))
    const lineEnd = line === lineCount - 1 ? left + width * 0.55 : left + width - 16
    context.beginPath()
    context.moveTo(left + 16, lineY)
    context.lineTo(lineEnd, lineY)
    context.stroke()
  }
}

// A fanned stack of three pages, like the film's text-file icons
function drawDocument(context: Context, palette: Palette) {
  const angles = [-0.32, -0.12, 0.1]
  const fills = [palette.tint, palette.paper, palette.highlight]
  angles.forEach((angle, index) => {
    context.save()
    context.translate(CANVAS_SIZE / 2 + (index - 1) * 14, CANVAS_SIZE / 2 + 6)
    context.rotate(angle)
    drawPage(context, palette, 120, 160, fills[index], index === angles.length - 1)
    context.restore()
  })
}

// A page with a globe over its corner and a curved arrow: a pointer to somewhere else
function drawLink(context: Context, palette: Palette) {
  context.save()
  context.translate(CANVAS_SIZE / 2 - 22, CANVAS_SIZE / 2 + 8)
  context.rotate(-0.1)
  drawPage(context, palette, 116, 152, palette.highlight, true)
  context.restore()

  const globeX = CANVAS_SIZE / 2 + 40
  const globeY = CANVAS_SIZE / 2 - 34
  const globeRadius = 54
  context.beginPath()
  context.arc(globeX, globeY, globeRadius, 0, Math.PI * 2)
  outlined(context, palette.tint, palette)
  // land masses
  context.fillStyle = palette.highlight
  context.beginPath()
  context.ellipse(globeX - 16, globeY - 14, 20, 14, -0.5, 0, Math.PI * 2)
  context.ellipse(globeX + 22, globeY + 18, 16, 22, 0.4, 0, Math.PI * 2)
  context.fill()
  // meridian and parallels
  context.strokeStyle = palette.shade
  context.lineWidth = 3
  context.beginPath()
  context.ellipse(globeX, globeY, globeRadius * 0.42, globeRadius - 2, 0, 0, Math.PI * 2)
  context.moveTo(globeX - globeRadius + 2, globeY)
  context.lineTo(globeX + globeRadius - 2, globeY)
  context.stroke()
  context.beginPath()
  context.arc(globeX, globeY, globeRadius, 0, Math.PI * 2)
  context.lineWidth = OUTLINE_WIDTH
  context.strokeStyle = palette.outline
  context.stroke()

  // arrow sweeping from the page up to the globe
  context.strokeStyle = palette.outline
  context.lineWidth = 12
  context.lineCap = 'round'
  context.beginPath()
  context.moveTo(70, 196)
  context.quadraticCurveTo(76, 120, 138, 110)
  context.stroke()
  context.fillStyle = palette.outline
  context.beginPath()
  context.moveTo(160, 106)
  context.lineTo(128, 88)
  context.lineTo(132, 132)
  context.closePath()
  context.fill()
}

// An application: a "carpet" with a gear and a lightning bolt on it
function drawProject(context: Context, palette: Palette) {
  const centre = CANVAS_SIZE / 2
  context.save()
  context.translate(centre, centre + 14)
  context.rotate(-0.2)
  context.beginPath()
  context.roundRect(-96, -64, 192, 128, 18)
  outlined(context, palette.tint, palette)
  context.beginPath()
  context.roundRect(-78, -48, 156, 96, 10)
  context.fillStyle = palette.paper
  context.fill()
  context.restore()

  const gearX = centre - 22
  const gearY = centre - 6
  const teeth = 8
  context.beginPath()
  for (let tooth = 0; tooth < teeth * 2; tooth++) {
    const angle = (tooth / (teeth * 2)) * Math.PI * 2
    const radius = tooth % 2 === 0 ? 56 : 42
    const pointX = gearX + Math.cos(angle) * radius
    const pointY = gearY + Math.sin(angle) * radius
    if (tooth === 0) context.moveTo(pointX, pointY)
    else context.lineTo(pointX, pointY)
  }
  context.closePath()
  outlined(context, palette.highlight, palette)
  context.beginPath()
  context.arc(gearX, gearY, 16, 0, Math.PI * 2)
  outlined(context, palette.shade, palette)

  context.beginPath()
  context.moveTo(centre + 58, centre - 78)
  context.lineTo(centre + 22, centre + 4)
  context.lineTo(centre + 48, centre + 4)
  context.lineTo(centre + 30, centre + 72)
  context.lineTo(centre + 86, centre - 14)
  context.lineTo(centre + 60, centre - 14)
  context.lineTo(centre + 80, centre - 78)
  context.closePath()
  outlined(context, palette.highlight, palette)
}

const DRAWERS: Record<FileIconKind, (context: Context, palette: Palette) => void> = {
  document: drawDocument,
  link: drawLink,
  project: drawProject,
}

const textureCache = new Map<string, THREE.CanvasTexture>()

// One shared texture per kind and block colour, drawn once on first use (browser only)
export function getFileIconTexture(kind: FileIconKind, blockHex: string): THREE.CanvasTexture {
  const cacheKey = `${kind}|${blockHex}`
  const cached = textureCache.get(cacheKey)
  if (cached) return cached
  const canvas = document.createElement('canvas')
  canvas.width = CANVAS_SIZE
  canvas.height = CANVAS_SIZE
  const context = canvas.getContext('2d')
  if (context) DRAWERS[kind](context, paletteFor(blockHex))
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 8
  textureCache.set(cacheKey, texture)
  return texture
}
