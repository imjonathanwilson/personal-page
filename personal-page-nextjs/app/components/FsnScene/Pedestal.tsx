'use client'

import { useMemo } from 'react'
import type { FsNode } from '../../content/fsTree'
import type { LayoutEntry } from './fsnLayout'
import { useHoverHandlers } from './useHoverHandlers'
import { isDragRelease } from './clickGuard'
import { getFaceMaterials } from './faceMaterials'
import HersheyText, { measureHersheyText } from './HersheyText'
import { useFsn } from './FsnStore'

export const DIRECTORY_COLOR = '#d0607a' // rose slabs, like the fsn recreation
const NAME_COLOR = '#5ff0c0' // mint, like the ground wires
export const CURRENT_NAME_COLOR = '#e8946a' // salmon: the current directory's name, like the movie's "park"
const NAME_Y = 0.05 // above the ground and the wires
const NAME_GAP = 0.45 // from the pedestal's front edge to the name
const NAME_FILL = 0.75 // share of the pedestal width a name fills
const CURRENT_LINE_WIDTH = 0.04 // thin, so the double-stroke font's two strokes stay apart (em)
const NAME_SPACING = 0.45 // wide letterSpacing, in em, like the movie's directory names
const MIN_NAME_SIZE = 0.7
const MAX_NAME_SIZE = 2.6

const LABEL_DEPTH_EM = 0.85 // how far a flat name reaches toward the camera, per em of font size

// A name lying on the ground: bigger pedestals get bigger names, within limits
function nameFontSize(width: number, label: string): number {
  const widthPerEm = measureHersheyText(label, 1, { letterSpacing: NAME_SPACING })
  return Math.min(MAX_NAME_SIZE, Math.max(MIN_NAME_SIZE, (width * NAME_FILL) / widthPerEm))
}

// Distance from a pedestal's front edge to the far (camera-side) edge of its name
export function directoryLabelExtent(width: number, label: string): number {
  return NAME_GAP + nameFontSize(width, label) * LABEL_DEPTH_EM
}

type PedestalProps = {
  node: FsNode
  layoutEntry: LayoutEntry
  selected: boolean
  hovered: boolean
  onSelect?: (path: string) => void
  onActivate?: (path: string) => void
  onHover?: (path: string | null) => void
}

export default function Pedestal({
  node,
  layoutEntry,
  selected,
  hovered,
  onSelect,
  onActivate,
  onHover,
}: PedestalProps) {
  const { position, width, depth, height } = layoutEntry
  const hoverHandlers = useHoverHandlers(node.path, onHover)
  const current = useFsn().currentPath === node.path
  const materials = useMemo(() => getFaceMaterials(DIRECTORY_COLOR, hovered, selected), [hovered, selected])
  const label = node.path === '/' ? '/' : node.name
  // A wide-spaced name lying on the ground, about three quarters as wide as the pedestal
  const fontSize = nameFontSize(width, label)

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
      <HersheyText
        text={label}
        font={current ? 'futuram' : 'futural'}
        fontSize={fontSize}
        color={current ? CURRENT_NAME_COLOR : NAME_COLOR}
        letterSpacing={NAME_SPACING}
        lineWidth={current ? CURRENT_LINE_WIDTH : undefined}
        position={[0, -height / 2 + NAME_Y, depth / 2 + NAME_GAP]}
        rotation={[-Math.PI / 2, 0, 0]}
      />
    </group>
  )
}
