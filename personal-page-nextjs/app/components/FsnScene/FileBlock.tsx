'use client'

import { useMemo } from 'react'
import * as THREE from 'three'
import type { FsNode } from '../../content/fsTree'
import type { LayoutEntry } from './fsnLayout'
import { useHoverHandlers } from './useHoverHandlers'
import { isDragRelease } from './clickGuard'
import { getFaceMaterials } from './faceMaterials'
import HersheyText, { measureHersheyText } from './HersheyText'
import { FILE_CELL_WIDTH, FILE_NAME_DEPTH } from './fsnLayout'
import { getFileIconTexture, iconKindFor } from './fileIcons'
import type { FileIconKind } from './fileIcons'

type FileBlockProps = {
  node: FsNode
  layoutEntry: LayoutEntry
  selected: boolean
  underSpotlight?: boolean // the directory it stands on is selected, so its white disk lies under the name
  hovered: boolean
  onSelect?: (path: string) => void
  onActivate?: (path: string) => void
  onHover?: (path: string | null) => void
}

export const FILE_COLOR = '#40e4e4' // cyan, the same for every file
const NAME_COLOR = '#ece6f6' // pale lavender on the rose pedestal
const SELECTED_NAME_COLOR = '#2a2a50' // legible on the spotlight's white disk
const NAME_LIFT = 0.06 // keeps the name just above the pedestal top (no z-fighting)
const NAME_GAP = 0.25 // from the block's front face to the name
// kept clear at the front of the gap: the next row's block hides that strip from the steep
// directory-view camera, so a two-line name must end before it
const NAME_CLEARANCE = 0.75
const NAME_FILL = 0.94 // share of the cell width the name may fill
const DEPTH_FILL = 0.95 // share of the remaining gap depth the name may fill
const MAX_NAME_SIZE = 0.5
const LINE_HEIGHT = 1.1
// fsn stands file names up off the pedestal, leaning back toward their block, instead of
// laying them flat: fsnav draws them rotated -50° about X from upright (vis.cc,
// glRotatef(-50, 1, 0, 0)). From fsn's camera the name then faces the viewer almost square-on.
const NAME_TILT = (-50 * Math.PI) / 180
const DESCENDER_EM = 1.0 // a line's ink runs from the top of its caps (0) to its descenders (1 em)
// The icon lies flat on the block's top face, a little wider than it, as in the film
const ICON_OVERHANG = 1.12
const ICON_LIFT = 0.02

const iconMaterials = new Map<string, THREE.MeshBasicMaterial>()
// The icon is drawn in tints of its block's colour: blue on blue blocks, green on green
function getIconMaterial(kind: FileIconKind, blockHex: string): THREE.MeshBasicMaterial {
  const cacheKey = `${kind}|${blockHex}`
  const cached = iconMaterials.get(cacheKey)
  if (cached) return cached
  const material = new THREE.MeshBasicMaterial({
    map: getFileIconTexture(kind, blockHex),
    transparent: true,
    alphaTest: 0.5,
    fog: false,
  })
  iconMaterials.set(cacheKey, material)
  return material
}

// Split a name near its middle at a hyphen or underscore. The extension is never
// split off on its own line (no "cloud.\ntxt"); names without a separator stay on one line.
function wrapName(name: string): string | null {
  const extensionStart = name.lastIndexOf('.')
  const stemEnd = extensionStart > 0 ? extensionStart : name.length
  const middle = name.length / 2
  let best = -1
  for (let index = 1; index < stemEnd - 1; index++) {
    if ('-_'.includes(name[index]) && (best < 0 || Math.abs(index - middle) < Math.abs(best - middle))) {
      best = index
    }
  }
  if (best < 0) return null
  return `${name.slice(0, best + 1)}\n${name.slice(best + 1)}`
}

// Largest font size for the given lines that fits both the cell width and the gap depth
function fitSize(lines: string[], cellWidth: number, gapDepth: number): number {
  const widestPerEm = Math.max(...lines.map((line) => measureHersheyText(line, 1)))
  return Math.min(
    MAX_NAME_SIZE,
    cellWidth / widestPerEm,
    gapDepth / (lines.length * LINE_HEIGHT),
  )
}

export default function FileBlock({
  node,
  layoutEntry,
  selected,
  underSpotlight = false,
  hovered,
  onSelect,
  onActivate,
  onHover,
}: FileBlockProps) {
  const { position, width, depth, height } = layoutEntry
  const hoverHandlers = useHoverHandlers(node.path, onHover)
  const materials = useMemo(() => getFaceMaterials(FILE_COLOR, hovered, selected), [hovered, selected])
  const iconMaterial = useMemo(() => getIconMaterial(iconKindFor(node.name), FILE_COLOR), [node.name])

  // The name lies on the pedestal in the gap in front of the block (two lines when it is long)
  const cellWidth = FILE_CELL_WIDTH * NAME_FILL
  const gapDepth = (FILE_NAME_DEPTH - NAME_GAP - NAME_CLEARANCE) * DEPTH_FILL
  const singleSize = fitSize([node.name], cellWidth, gapDepth)
  const wrappedText = wrapName(node.name)
  const wrappedSize = wrappedText ? fitSize(wrappedText.split('\n'), cellWidth, gapDepth) : 0
  const wrapped = wrappedText !== null && wrappedSize > singleSize
  const fontSize = wrapped ? wrappedSize : singleSize
  const text = wrapped && wrappedText ? wrappedText : node.name
  // The text is anchored at the top of its first line. Tilted back, its bottom edge rests on the
  // pedestal in the gap and its top leans toward the block, so lift the anchor by the tilted
  // height and keep it at the block-side edge of the gap.
  const lineCount = text.split('\n').length
  const textHeight = ((lineCount - 1) * LINE_HEIGHT + DESCENDER_EM) * fontSize
  const tiltedRise = textHeight * Math.cos(NAME_TILT)

  return (
    <group position={position}>
      <mesh
        name={node.path}
        userData={{ fsPath: node.path }}
        material={materials}
        onClick={(event) => {
          event.stopPropagation()
          if (isDragRelease(event)) return
          onSelect?.(node.path)
        }}
        onDoubleClick={(event) => {
          event.stopPropagation()
          if (isDragRelease(event)) return
          onActivate?.(node.path)
        }}
        {...hoverHandlers}
      >
        <boxGeometry args={[width, height, depth]} />
      </mesh>
      <mesh
        name={`icon:${node.path}`}
        position={[0, height / 2 + ICON_LIFT, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        material={iconMaterial}
        raycast={() => null}
      >
        <planeGeometry args={[width * ICON_OVERHANG, depth * ICON_OVERHANG]} />
      </mesh>
      <HersheyText
        text={text}
        fontSize={fontSize}
        lineHeight={LINE_HEIGHT}
        color={selected || underSpotlight ? SELECTED_NAME_COLOR : NAME_COLOR}
        position={[0, -height / 2 + NAME_LIFT + tiltedRise, depth / 2 + NAME_GAP]}
        rotation={[NAME_TILT, 0, 0]}
        renderOrder={3}
      />
    </group>
  )
}
