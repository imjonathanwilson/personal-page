'use client'

import { useEffect, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { findNode, parentPath } from '../../content/fsTree'
import { useFsn } from './FsnStore'
import styles from './FsnKeyboardNav.module.css'

type Entry = {
  key: string
  path: string
  label: string
  type: 'dir' | 'file'
  isParent: boolean
}

export default function FsnKeyboardNav() {
  const { currentPath, selectedPath, openFilePath, navigateTo, goUp, openFile } = useFsn()
  const [activeKey, setActiveKey] = useState('')
  const [panelTop, setPanelTop] = useState(0)
  const navRef = useRef<HTMLDivElement>(null)

  // Blur the focused list when the pointer goes down anywhere outside it
  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      const nav = navRef.current
      if (nav && event.target instanceof Node && !nav.contains(event.target)) {
        if (nav.contains(document.activeElement)) (document.activeElement as HTMLElement).blur()
      }
    }
    document.addEventListener('pointerdown', onPointerDown, true)
    return () => document.removeEventListener('pointerdown', onPointerDown, true)
  }, [])

  // Show the panel just under the header, whatever its (desktop / compact) height
  const placeBelowHeader = () => {
    const header = document.querySelector<HTMLElement>('[data-testid="fsn-header"]')
    setPanelTop(header ? Math.round(header.getBoundingClientRect().bottom) : 0)
  }

  const directory = findNode(currentPath)
  const entries: Entry[] = []
  if (currentPath !== '/') {
    entries.push({
      key: '..',
      path: parentPath(currentPath),
      label: '..',
      type: 'dir',
      isParent: true,
    })
  }
  for (const child of directory?.children ?? []) {
    entries.push({
      key: child.path,
      path: child.path,
      label: child.type === 'dir' ? `${child.name}/` : child.name,
      type: child.type,
      isParent: false,
    })
  }

  // The remembered entry may belong to a directory we have since left: fall back to the
  // first real child (or ".." in an empty directory).
  const activeEntry =
    entries.find((entry) => entry.key === activeKey) ??
    entries.find((entry) => !entry.isParent) ??
    entries[0]

  const activate = (entry: Entry) => {
    if (entry.isParent) {
      goUp()
      return
    }
    if (entry.type === 'dir') {
      navigateTo(entry.path)
      return
    }
    if (entry.path === selectedPath) {
      // an already-open file is left alone, as the mouse path does (no repeated window.open)
      if (openFilePath === entry.path) return
      openFile(entry.path)
      const href = findNode(entry.path)?.href
      if (href) window.open(href, '_blank', 'noopener')
    } else {
      navigateTo(entry.path)
    }
  }

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!activeEntry) return
    const index = entries.indexOf(activeEntry)
    const moveTo = (target: number) => {
      event.preventDefault()
      setActiveKey(entries[Math.min(entries.length - 1, Math.max(0, target))].key)
    }
    if (event.key === 'ArrowDown') moveTo(index + 1)
    else if (event.key === 'ArrowUp') moveTo(index - 1)
    else if (event.key === 'Home') moveTo(0)
    else if (event.key === 'End') moveTo(entries.length - 1)
    else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      activate(activeEntry)
    }
  }

  return (
    <div
      ref={navRef}
      className={styles.nav}
      style={{ top: panelTop }}
      onFocus={placeBelowHeader}
      role="listbox"
      tabIndex={0}
      aria-label={`Files in ${currentPath}: arrow keys to move, Enter to open`}
      aria-activedescendant={activeEntry ? `fsn-kbd-${activeEntry.key}` : undefined}
      data-testid="fsn-keyboard-nav"
      onKeyDown={onKeyDown}
    >
      <div className={styles.heading} aria-hidden="true">
        {currentPath}
      </div>
      {entries.map((entry) => (
        <div
          key={entry.key}
          id={`fsn-kbd-${entry.key}`}
          role="option"
          aria-selected={entry.path === selectedPath && !entry.isParent}
          className={`${styles.option} ${entry === activeEntry ? styles.active : ''}`}
          data-testid={`fsn-keyboard-nav-${entry.key}`}
          onClick={() => {
            setActiveKey(entry.key)
            activate(entry)
          }}
        >
          {entry.label}
        </div>
      ))}
    </div>
  )
}
