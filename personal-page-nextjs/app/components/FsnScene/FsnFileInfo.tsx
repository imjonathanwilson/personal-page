'use client'

import { useEffect, useRef } from 'react'
import { findNode } from '../../content/fsTree'
import { useFsn } from './FsnStore'
import { useIsMobile } from './useIsMobile'
import styles from './FsnFileInfo.module.css'

const CARD_OFFSET = 18

// Right edge of the area the scene is visible in: the terminal's left edge when it is a side panel
function freeRight(): number {
  const panel = document.querySelector('[data-testid="terminal-panel"]')?.getBoundingClientRect()
  const isSidePanel =
    panel && panel.width > 0 && panel.width < 0.9 * window.innerWidth && panel.height > 0.5 * window.innerHeight
  return isSidePanel ? panel.left : window.innerWidth
}

// A small card next to the hovered file with its size, permissions and path. The selection's
// details live in the header's stats line (as in fsn), so the card is for hovering only.
export default function FsnFileInfo() {
  const { hoveredPath, projectToScreen } = useFsn()
  const isMobile = useIsMobile()
  const cardRef = useRef<HTMLDivElement>(null)
  const node = hoveredPath ? findNode(hoveredPath) : undefined
  const visiblePath = node && node.type === 'file' && !isMobile ? node.path : null

  // Follow the file's projected position while the camera moves
  useEffect(() => {
    if (!visiblePath) return
    let frame = 0
    const track = () => {
      const card = cardRef.current
      const point = projectToScreen(visiblePath)
      if (card && point) {
        // keep the card clear of the header and inside the free area (left of a side terminal panel)
        const header = document.querySelector('[data-testid="fsn-header"]')?.getBoundingClientRect()
        const top = header ? header.bottom + CARD_OFFSET / 2 : 0
        const right = freeRight()
        const left = Math.max(
          CARD_OFFSET / 2,
          Math.min(point.x + CARD_OFFSET, right - card.offsetWidth - CARD_OFFSET / 2),
        )
        const cardTop = Math.min(
          Math.max(top, point.y - CARD_OFFSET),
          Math.max(top, window.innerHeight - card.offsetHeight - CARD_OFFSET / 2),
        )
        card.style.transform = `translate(${left}px, ${cardTop}px)`
        card.style.visibility = 'visible'
      }
      frame = requestAnimationFrame(track)
    }
    frame = requestAnimationFrame(track)
    return () => cancelAnimationFrame(frame)
  }, [visiblePath, projectToScreen])

  if (!node || !visiblePath) return null
  const isLink = node.name.endsWith('.lnk')

  return (
    <div ref={cardRef} className={styles.card} data-testid="fsn-file-info">
      <div className={styles.name}>{node.name}</div>
      <div>size: {node.size} bytes</div>
      <div>perm: {isLink ? 'lrwxrwxrwx' : '-rw-r--r--'}</div>
      <div>owner: jonathan</div>
      <div>path: {node.path}</div>
    </div>
  )
}
