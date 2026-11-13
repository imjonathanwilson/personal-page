'use client'

import { useEffect, useMemo } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { fsTree, findNode } from '../../content/fsTree'
import { computeLayout, layoutModeFor } from './fsnLayout'
import { usePortrait } from './usePortrait'
import type { Layout } from './fsnLayout'
import { useIsMobile } from './useIsMobile'
import CameraRig, { OVERVIEW_POSITION } from './CameraRig'
import { disposeFaceMaterials } from './faceMaterials'
import { useFsn } from './FsnStore'
import Wires from './Wires'
import Pedestal from './Pedestal'
import FileBlock from './FileBlock'
import Spotlight from './Spotlight'
import Sky, { CAMERA_FAR } from './Sky'
import styles from './FsnScene.module.css'

// Projects a node to viewport pixels (the hover card follows it; tests use it to find where to click, avoiding
// the files on a pedestal top) and exposes the camera position to tests
function ScreenProbe({ layout }: { layout: Layout }) {
  const camera = useThree((state) => state.camera)
  const canvas = useThree((state) => state.gl.domElement)
  const { registerProjector } = useFsn()

  useEffect(() => {
    const project = (path: string) => {
      const entry = layout.get(path)
      if (!entry) return null
      const [posX, posY, posZ] = entry.position
      const frontOffset = entry.kind === 'dir' ? entry.depth / 2 - 0.35 : 0
      const point = new THREE.Vector3(posX, posY + entry.height / 2, posZ + frontOffset)
      camera.updateMatrixWorld()
      point.project(camera)
      const rect = canvas.getBoundingClientRect()
      return {
        x: rect.left + ((point.x + 1) / 2) * rect.width,
        y: rect.top + ((1 - point.y) / 2) * rect.height,
      }
    }
    registerProjector(project)
    const probe = window.__fsn
    if (probe) probe.cameraPosition = () => camera.position.toArray() as [number, number, number]
    return () => {
      registerProjector(null)
      if (probe) delete probe.cameraPosition
    }
  }, [layout, camera, canvas, registerProjector])

  return null
}


function SceneContents() {
  useEffect(
    () => () => {
      disposeFaceMaterials()
    },
    [],
  )
  const { selectedPath, hoveredPath, openFilePath, birdsEye, navigateTo, openFile, setHovered } = useFsn()
  const invalidate = useThree((state) => state.invalidate)
  const selectedIsFile = findNode(selectedPath)?.type === 'file'
  const portrait = usePortrait()
  const layout = useMemo(() => computeLayout(fsTree, layoutModeFor(portrait)), [portrait])

  // The frameloop is on demand: redraw whenever hover, selection or the view mode changes
  useEffect(() => {
    invalidate()
  }, [invalidate, hoveredPath, selectedPath, openFilePath, birdsEye, layout])

  // Warp into a directory, or open a file in the terminal (links also open their URL)
  const activate = (path: string) => {
    const node = findNode(path)
    if (!node) return
    if (node.type === 'dir') {
      navigateTo(path)
      return
    }
    openFile(path)
    if (node.href) window.open(node.href, '_blank', 'noopener,noreferrer')
  }

  // fsn: one click flies to what was clicked. A directory becomes the current view; a file is
  // selected and the camera zooms in on it. Clicking the selected file again opens it, and so does
  // a double-click (whose second click lands here too); a file that is already open is left alone
  // so one double-click never opens it (or its link) twice.
  const activateOnce = (path: string) => {
    if (openFilePath !== path) activate(path)
  }

  const handleSelect = (path: string) => {
    const node = findNode(path)
    if (!node) return
    if (node.type === 'file' && selectedPath === path) activateOnce(path)
    else navigateTo(path)
  }

  const handleActivate = (path: string) => {
    if (findNode(path)?.type === 'file') activateOnce(path)
  }

  return (
    <>
      <CameraRig layout={layout} />
      <ScreenProbe layout={layout} />
      <Sky />
      <Wires layout={layout} />
      {Array.from(layout.entries()).map(([path, entry]) => {
        const node = findNode(path)
        if (!node) return null
        const props = {
          node,
          layoutEntry: entry,
          selected: selectedPath === path,
          hovered: hoveredPath === path,
          onSelect: handleSelect,
          onActivate: handleActivate,
          onHover: setHovered,
        }
        return entry.kind === 'dir' ? (
          <Pedestal key={path} {...props} />
        ) : (
          <FileBlock key={path} {...props} />
        )
      })}
      {selectedIsFile && <Spotlight layout={layout} targetPath={selectedPath} showCone={!birdsEye} />}
    </>
  )
}

export default function FsnScene() {
  const isMobile = useIsMobile()
  return (
    <div className={styles.container}>
      <Canvas
        flat
        frameloop="demand"
        dpr={isMobile ? [1, 1.5] : [1, 2]}
        camera={{ position: OVERVIEW_POSITION, fov: 60, near: 1, far: CAMERA_FAR }}
        gl={{ antialias: true, alpha: true }}
      >
        <SceneContents />
      </Canvas>
    </div>
  )
}
