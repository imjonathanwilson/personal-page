'use client'

import { useEffect, useMemo } from 'react'
import { useThree } from '@react-three/fiber'
import { LineSegments2 } from 'three/examples/jsm/lines/LineSegments2.js'
import { LineSegmentsGeometry } from 'three/examples/jsm/lines/LineSegmentsGeometry.js'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js'
import { HERSHEY_FONT_DATA } from './hersheyFontData'

// Single-stroke vector lettering like the movie's fsn: a Hershey font drawn as thin fat-lines
// whose width is in world units, so the lettering thins with distance.

export type HersheyFont = 'futural' | 'futuram' // single-stroke sans / the double-stroke ("bold") sans

const FIRST_GLYPH_CODE = 33 // '!'
const EM_UNITS = 28 // font units per em: the cap height (21 units) is then 0.75 em
const SPACE_UNITS = 14
const LINE_WIDTH_EM = 0.08 // stroke width, per em of font size

type Glyph = { advance: number; segments: number[] } // font units, y pointing down

type Point = { x: number; y: number }

const glyphCache = new Map<string, Glyph | null>()

function parseGlyph(pathData: string, halfAdvance: number): Glyph {
  const segments: number[] = []
  let previous: Point | null = null
  for (const token of pathData.matchAll(/([ML])|(-?\d+),(-?\d+)/g)) {
    if (token[1] === 'M') {
      previous = null
    } else if (token[2] !== undefined) {
      const point = { x: Number(token[2]), y: Number(token[3]) }
      if (previous) segments.push(previous.x, previous.y, point.x, point.y)
      previous = point
    }
  }
  return { advance: halfAdvance * 2, segments }
}

function glyphFor(font: HersheyFont, character: string): Glyph | null {
  const key = `${font}:${character}`
  if (glyphCache.has(key)) return glyphCache.get(key) ?? null
  const entry = HERSHEY_FONT_DATA[font][character.charCodeAt(0) - FIRST_GLYPH_CODE]
  const glyph = entry && character.charCodeAt(0) >= FIRST_GLYPH_CODE ? parseGlyph(entry[0], entry[1]) : null
  glyphCache.set(key, glyph)
  return glyph
}

// Width of one line in font units, with letterSpacing (in em) between characters
function lineUnits(line: string, font: HersheyFont, letterSpacing: number): number {
  let width = 0
  const characters = Array.from(line)
  characters.forEach((character, index) => {
    width += glyphFor(font, character)?.advance ?? SPACE_UNITS
    if (index < characters.length - 1) width += letterSpacing * EM_UNITS
  })
  return width
}

type MeasureOptions = { font?: HersheyFont; letterSpacing?: number }

// Width of the widest line of `text`, in world units, at the given font size
export function measureHersheyText(text: string, fontSize: number, options: MeasureOptions = {}): number {
  const { font = 'futural', letterSpacing = 0 } = options
  const widest = Math.max(...text.split('\n').map((line) => lineUnits(line, font, letterSpacing)))
  return (widest / EM_UNITS) * fontSize
}

// Positions of every line segment of `text`, in em units: x runs right from the anchor,
// y runs up, and the top of the first line sits at y = 0
function buildSegments(
  text: string,
  font: HersheyFont,
  letterSpacing: number,
  lineHeight: number,
  textAlign: 'center' | 'left',
): number[] {
  const lines = text.split('\n')
  const widest = Math.max(...lines.map((line) => lineUnits(line, font, letterSpacing)))
  const positions: number[] = []
  lines.forEach((line, lineIndex) => {
    let cursor = textAlign === 'center' ? (widest - lineUnits(line, font, letterSpacing)) / 2 : 0
    const top = lineIndex * lineHeight * EM_UNITS
    for (const character of Array.from(line)) {
      const glyph = glyphFor(font, character)
      if (glyph) {
        for (let index = 0; index < glyph.segments.length; index += 4) {
          positions.push(
            (cursor + glyph.segments[index] - widest / 2) / EM_UNITS,
            -(top + glyph.segments[index + 1]) / EM_UNITS,
            0,
            (cursor + glyph.segments[index + 2] - widest / 2) / EM_UNITS,
            -(top + glyph.segments[index + 3]) / EM_UNITS,
            0,
          )
        }
      }
      cursor += (glyph?.advance ?? SPACE_UNITS) + letterSpacing * EM_UNITS
    }
  })
  return positions
}

type HersheyTextProps = {
  text: string
  fontSize: number
  color: string
  font?: HersheyFont
  letterSpacing?: number // in em
  lineHeight?: number // in em
  textAlign?: 'center' | 'left'
  lineWidth?: number // stroke width in em
  position?: [number, number, number]
  rotation?: [number, number, number]
  renderOrder?: number
}

// Text anchored at its horizontal centre and the top of its first line, drawn in the XY plane
// of its transform (rotate it to lie on the ground).
export default function HersheyText({
  text,
  fontSize,
  color,
  font = 'futural',
  letterSpacing = 0,
  lineHeight = 1.1,
  textAlign = 'center',
  lineWidth = LINE_WIDTH_EM,
  position,
  rotation,
  renderOrder = 0,
}: HersheyTextProps) {
  const size = useThree((state) => state.size)

  const geometry = useMemo(() => {
    const created = new LineSegmentsGeometry()
    created.setPositions(buildSegments(text, font, letterSpacing, lineHeight, textAlign))
    return created
  }, [text, font, letterSpacing, lineHeight, textAlign])
  useEffect(() => () => geometry.dispose(), [geometry])

  const material = useMemo(
    () =>
      new LineMaterial({
        color,
        linewidth: lineWidth * fontSize,
        worldUnits: true,
        transparent: true,
        depthWrite: false, // overlapping strokes never z-fight
        fog: false, // colours stay true at the overview
        toneMapped: false,
        polygonOffset: true, // pulls flat names toward the camera so they never fight the surface they lie on
        polygonOffsetFactor: -2,
        polygonOffsetUnits: -2,
      }),
    [color, lineWidth, fontSize],
  )
  useEffect(() => {
    material.resolution.set(size.width, size.height)
  }, [material, size.width, size.height])
  useEffect(() => () => material.dispose(), [material])

  const lines = useMemo(() => {
    const created = new LineSegments2(geometry, material)
    created.raycast = () => null
    return created
  }, [geometry, material])

  return (
    <group position={position} rotation={rotation} scale={fontSize}>
      <primitive object={lines} renderOrder={renderOrder} />
    </group>
  )
}
