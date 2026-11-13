'use client'

import type { KeyboardEvent } from 'react'
import { fsTree } from '../../content/fsTree'
import type { FsNode } from '../../content/fsTree'
import { useFsn } from './FsnStore'
import styles from './FsnOverview.module.css'

const VIEW_HEIGHT = 100
const GROUND_Y = 84
const SLOT_WIDTH = 56
const DIR_WIDTH = 30
const DIR_HEIGHT = 8
const TICK_MAX = 30
const TICK_SCALE = 0.45
const TICK_POWER = 0.8

type Placed = {
  node: FsNode
  centerX: number
  depth: number
  children: Placed[]
}

function slotCount(node: FsNode): number {
  const children = node.children ?? []
  const fileCount = children.filter((child) => child.type === 'file').length
  const dirSlots = children
    .filter((child) => child.type === 'dir')
    .reduce((total, child) => total + slotCount(child), 0)
  return Math.max(1, fileCount, dirSlots)
}

function place(node: FsNode, left: number, depth: number): Placed {
  const width = slotCount(node) * SLOT_WIDTH
  let cursor = left
  const children: Placed[] = []
  for (const child of node.children ?? []) {
    if (child.type !== 'dir') continue
    const childWidth = slotCount(child) * SLOT_WIDTH
    children.push(place(child, cursor, depth + 1))
    cursor += childWidth
  }
  return { node, centerX: left + width / 2, depth, children }
}

const placedRoot = place(fsTree, 0, 0)
const VIEW_WIDTH = slotCount(fsTree) * SLOT_WIDTH

function tickHeight(size: number): number {
  return Math.min(TICK_MAX, 3 + TICK_SCALE * size ** TICK_POWER)
}

function OverviewNode({
  placed,
  currentPath,
  onSelect,
}: {
  placed: Placed
  currentPath: string
  onSelect: (path: string) => void
}) {
  const { node, centerX, children } = placed
  const isCurrent = node.path === currentPath
  const files = (node.children ?? []).filter((child) => child.type === 'file')
  const tickSpan = Math.min(DIR_WIDTH + 10, files.length * 8)
  const barY = GROUND_Y - DIR_HEIGHT - 18
  const onKeyDown = (event: KeyboardEvent<SVGGElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onSelect(node.path)
    }
  }

  return (
    <g>
      {children.length > 0 && (
        <g className={styles.branch}>
          <line x1={centerX} y1={GROUND_Y - DIR_HEIGHT} x2={centerX} y2={barY} />
          <line
            x1={children[0].centerX}
            y1={barY}
            x2={children[children.length - 1].centerX}
            y2={barY}
          />
          {children.map((child) => (
            <line
              key={child.node.path}
              x1={child.centerX}
              y1={barY}
              x2={child.centerX}
              y2={GROUND_Y - DIR_HEIGHT}
            />
          ))}
        </g>
      )}
      {files.map((file, index) => {
        const tickX = centerX - tickSpan / 2 + (files.length > 1 ? (index * tickSpan) / (files.length - 1) : tickSpan / 2)
        return (
          <line
            key={file.path}
            className={styles.tick}
            x1={tickX}
            y1={GROUND_Y - DIR_HEIGHT}
            x2={tickX}
            y2={GROUND_Y - DIR_HEIGHT - tickHeight(file.size)}
          />
        )
      })}
      <g
        className={`${styles.dir} ${isCurrent ? styles.current : ''}`}
        role="button"
        tabIndex={0}
        aria-label={`Go to ${node.path}`}
        aria-current={isCurrent ? 'true' : undefined}
        data-testid={`fsn-overview-node-${node.path}`}
        onClick={() => onSelect(node.path)}
        onKeyDown={onKeyDown}
      >
        <rect
          className={styles.hit}
          x={centerX - SLOT_WIDTH / 2}
          y={GROUND_Y - DIR_HEIGHT - 6}
          width={SLOT_WIDTH}
          height={DIR_HEIGHT + 14}
        />
        <rect
          className={styles.dirMark}
          x={centerX - DIR_WIDTH / 2}
          y={GROUND_Y - DIR_HEIGHT}
          width={DIR_WIDTH}
          height={DIR_HEIGHT}
        />
      </g>
      {children.map((child) => (
        <OverviewNode
          key={child.node.path}
          placed={child}
          currentPath={currentPath}
          onSelect={onSelect}
        />
      ))}
    </g>
  )
}

export default function FsnOverview() {
  const { currentPath, navigateTo } = useFsn()
  return (
    <div className={styles.overview} data-testid="fsn-overview" data-fsn-reserve>
      <div className={styles.titleBar}>overview</div>
      <svg
        className={styles.svg}
        viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
        preserveAspectRatio="xMidYMid meet"
        role="group"
        aria-label="Directory tree overview"
      >
        <line className={styles.ground} x1={0} y1={GROUND_Y} x2={VIEW_WIDTH} y2={GROUND_Y} />
        <OverviewNode placed={placedRoot} currentPath={currentPath} onSelect={navigateTo} />
      </svg>
      <div className={styles.path} data-testid="fsn-overview-path">
        {currentPath === '/' ? '/' : `${currentPath}/`}
      </div>
    </div>
  )
}
