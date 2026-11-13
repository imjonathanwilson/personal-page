'use client'

import { Line } from '@react-three/drei'
import { findNode } from '../../content/fsTree'
import type { Layout } from './fsnLayout'
import { CURRENT_NAME_COLOR, directoryLabelExtent } from './Pedestal'
import HersheyText, { measureHersheyText } from './HersheyText'
import { useFsn } from './FsnStore'

const WIRE_Y = 0.04 // just above the black ground
const WIRE_COLOR = '#4af0b4' // mint
const HOVERED_WIRE_COLOR = '#ffffff' // the wire to the hovered node, like the movie's Zoology wire
const WIRE_WIDTH = 1.5
const WIRE_LABEL_Y = 0.05 // above the wires
const WIRE_LABEL_POSITION = 0.65 // how far along the wire (from the parent) its label is centred
const WIRE_LABEL_GAP = 0.08 // from the wire to the lettering beside it
const WIRE_LABEL_SPACING = 0.1 // letterSpacing, in em
const WIRE_LABEL_FILL = 0.7 // share of the wire's length a label may fill
const MIN_WIRE_LABEL_SIZE = 0.3
const MAX_WIRE_LABEL_SIZE = 0.55

type Point = [number, number, number]

type Wire = { path: string; name: string; points: [Point, Point] }

// fsn's fan: one thin straight line from the middle of the parent's back edge to the middle
// of each child's name (past its front edge), lying on the ground. Each wire carries its
// child's name in small lettering beside it.
export default function Wires({ layout }: { layout: Layout }) {
  const { currentPath, hoveredPath } = useFsn()
  const wires: Wire[] = []
  layout.forEach((entry, path) => {
    const parent = layout.get(entry.parentPath)
    const node = findNode(path)
    if (entry.kind !== 'dir' || !parent || !node) return
    // stop at the camera-side edge of the child's name, so the wire never runs through the lettering
    const label = path === '/' ? '/' : node.name
    const end = entry.position[2] + entry.depth / 2 + directoryLabelExtent(entry.width, label)
    wires.push({
      path,
      name: label,
      points: [
        [parent.position[0], WIRE_Y, parent.position[2] - parent.depth / 2],
        [entry.position[0], WIRE_Y, end],
      ],
    })
  })

  return (
    <>
      {wires.map((wire) => {
        const color =
          wire.path === hoveredPath ? HOVERED_WIRE_COLOR : wire.path === currentPath ? CURRENT_NAME_COLOR : WIRE_COLOR
        return (
          <group key={wire.path}>
            <Line points={wire.points} color={color} lineWidth={WIRE_WIDTH} raycast={() => null} />
            <WireLabel wire={wire} color={color} />
          </group>
        )
      })}
    </>
  )
}

// The child's name lying on the ground along its wire, readable left to right
function WireLabel({ wire, color }: { wire: Wire; color: string }) {
  const [start, end] = wire.points
  let deltaX = end[0] - start[0]
  let deltaZ = end[2] - start[2]
  if (deltaX < 0) {
    deltaX = -deltaX
    deltaZ = -deltaZ
  }
  const length = Math.hypot(deltaX, deltaZ)
  const angle = Math.atan2(deltaZ, deltaX)
  const widthPerEm = measureHersheyText(wire.name, 1, { letterSpacing: WIRE_LABEL_SPACING })
  const fontSize = Math.min(MAX_WIRE_LABEL_SIZE, Math.max(MIN_WIRE_LABEL_SIZE, (length * WIRE_LABEL_FILL) / widthPerEm))
  const along = (end[0] - start[0] < 0 ? 1 - WIRE_LABEL_POSITION : WIRE_LABEL_POSITION)
  const centerX = start[0] + (end[0] - start[0]) * along
  const centerZ = start[2] + (end[2] - start[2]) * along

  return (
    <group position={[centerX, WIRE_LABEL_Y, centerZ]} rotation={[0, -angle, 0]}>
      <HersheyText
        text={wire.name}
        fontSize={fontSize}
        color={color}
        letterSpacing={WIRE_LABEL_SPACING}
        position={[0, 0, WIRE_LABEL_GAP]}
        rotation={[-Math.PI / 2, 0, 0]}
      />
    </group>
  )
}
