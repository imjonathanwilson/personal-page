'use client'

import { useEffect } from 'react'
import { findNode, parentPath } from '../../content/fsTree'
import type { FsNode } from '../../content/fsTree'
import { useFsn } from './FsnStore'
import FsnMenuBar from './FsnMenuBar'
import styles from './FsnOverlay.module.css'

function describeNode(node: FsNode): string {
  if (node.type === 'dir') {
    const children = node.children ?? []
    const fileCount = children.filter((child) => child.type === 'file').length
    const directoryCount = children.length - fileCount
    const directories = `${directoryCount} ${directoryCount === 1 ? 'directory' : 'directories'}`
    const files = `${fileCount} ${fileCount === 1 ? 'file' : 'files'}`
    return `drwxr-xr-x  ${directories}, ${files}`
  }
  let kind = 'unknown type'
  if (node.name.endsWith('.txt')) kind = 'text'
  else if (node.name.endsWith('.lnk')) kind = 'link'
  return `-rw-r--r--  ${node.size} bytes, 0 days old, ${kind}`
}

export default function FsnOverlay() {
  const {
    currentPath,
    selectedPath, openFilePath,
    navigateTo,
    goUp,
    closeFile,
    birdsEye,
    setBirdsEye,
    hoveredPath,
  } = useFsn()

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      const active = document.activeElement
      if (
        active instanceof HTMLInputElement ||
        active instanceof HTMLTextAreaElement ||
        active instanceof HTMLSelectElement
      ) {
        return
      }
      if (openFilePath) closeFile()
      else goUp()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [openFilePath, closeFile, goUp])

  const segments = currentPath.split('/').filter(Boolean)
  const crumbs = [
    { label: '', path: '/' },
    ...segments.map((segment, index) => ({
      label: segment,
      path: `/${segments.slice(0, index + 1).join('/')}`,
    })),
  ]
  const selectedNode = findNode(selectedPath) ?? findNode(currentPath)
  const selectedFileName =
    selectedNode?.type === 'file' && parentPath(selectedNode.path) === currentPath
      ? selectedNode.name
      : null

  return (
    <header className={styles.header} data-testid="fsn-header" data-fsn-reserve>
      <div className={styles.menuRow}>
        <FsnMenuBar>
          <button
            type="button"
            className={styles.menuButton}
            data-testid="fsn-up"
            disabled={currentPath === '/'}
            onClick={goUp}
            aria-label="Go up one directory"
          >
            ..
          </button>
          <button
            type="button"
            className={`${styles.menuButton} ${birdsEye ? styles.active : ''}`}
            data-testid="fsn-birdseye"
            aria-pressed={birdsEye}
            onClick={() => setBirdsEye(!birdsEye)}
          >
            bird&apos;s-eye
          </button>
        </FsnMenuBar>
      </div>
      <div className={styles.title}>Fsn:&nbsp; a 3D File System Navigator</div>
      <nav className={styles.pathField} data-testid="fsn-breadcrumb" aria-label="Directory path">
        {crumbs.map((crumb, index) => (
          <span key={crumb.path}>
            {index > 1 && <span className={styles.separator}>/</span>}
            <button
              type="button"
              className={styles.crumb}
              data-testid={`fsn-crumb-${crumb.path}`}
              aria-label={crumb.path === '/' ? '/' : undefined}
              onClick={() => navigateTo(crumb.path)}
            >
              {crumb.path === '/' ? '/' : crumb.label}
            </button>
          </span>
        ))}
        {selectedFileName && (
          <span>
            <span className={styles.separator}>/</span>
            <span className={styles.selectedName}>{selectedFileName}</span>
          </span>
        )}
      </nav>
      <div className={styles.stats} data-testid="fsn-stats">
        {selectedNode ? describeNode(selectedNode) : ''}
      </div>
      {hoveredPath && (
        <div className={styles.hoverPath} data-testid="fsn-hover-path">
          {hoveredPath}
        </div>
      )}
    </header>
  )
}
