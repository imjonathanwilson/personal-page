'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { ComponentRef } from 'react'
import { OrbitControls } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import type { Layout } from './fsnLayout'
import { useFsn } from './FsnStore'
import { useIsMobile } from './useIsMobile'

// fsn's views: the start view fits the whole tree low over the ground (sky band visible), the
// bird's-eye button flies to a near top-down fit, and directory and file views look down steeply
// enough to read the names lying on the pedestal top.
const DIRECTORY_PITCH = THREE.MathUtils.degToRad(55)
const FILE_PITCH = THREE.MathUtils.degToRad(46)
const OCCLUDED_PITCH = THREE.MathUtils.degToRad(55) // directory view with another pedestal in front
const ROOT_PITCH = THREE.MathUtils.degToRad(17) // start view: the whole tree, with a band of sky above the horizon
const ROOT_PITCH_PORTRAIT = THREE.MathUtils.degToRad(40) // the grid's back row would hide behind the front row at 17 degrees
const ROOT_DROP = 0.2 // the start view sits lower in the free area, leaving ground between it and the horizon
const BIRDSEYE_PITCH = THREE.MathUtils.degToRad(83) // near top-down
export const OVERVIEW_POSITION: [number, number, number] = [0, 22, 44]
const WARP_SECONDS = 0.8 // fsnav moves to a double-clicked node in 0.8 s
const LAYOUT_EASE_SECONDS = 0.25 // a viewport or layout change only eases the camera to its new framing
const ORBIT_DEGREES_PER_PIXEL = 0.5
const MIN_PITCH_FROM_GROUND = 5 // degrees; the camera never dips below 5 degrees or past straight down
const MAX_POLAR_ANGLE = THREE.MathUtils.degToRad(90 - MIN_PITCH_FROM_GROUND)
const ZOOM_SPEED = 2.5 // each wheel notch scales the distance by 0.95 ^ ZOOM_SPEED
const CAMERA_CLEARANCE = 0.9 // the camera stays at least this far above any slab or block it is over or beside
const CAMERA_FOOTPRINT_MARGIN = 0.9 // horizontal reach of that clearance around a footprint

// The lowest height the camera may have at (x, z): above the top of every pedestal and file block
// whose footprint (plus a margin) it is over, so zooming in or orbiting low never enters geometry
function cameraFloor(layout: Layout, cameraX: number, cameraZ: number): number {
  let floor = CAMERA_CLEARANCE
  layout.forEach((entry) => {
    const [x, y, z] = entry.position
    if (
      Math.abs(cameraX - x) > entry.width / 2 + CAMERA_FOOTPRINT_MARGIN ||
      Math.abs(cameraZ - z) > entry.depth / 2 + CAMERA_FOOTPRINT_MARGIN
    )
      return
    floor = Math.max(floor, y + entry.height / 2 + CAMERA_CLEARANCE)
  })
  return floor
}

function easeInOutCubic(progress: number): number {
  return progress < 0.5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2
}
const FOV_DEGREES = 60
const VIEW_MARGIN = 24
const DIRECTORY_LABEL_ALLOWANCE = 3.4 // the flat name lying in front of a pedestal
const FIT_SLACK = 1.01
// Share of the free area a directory's slab fills: the movie keeps it well inside the view so the
// neighbouring slabs and whatever lies behind stay visible
const DIRECTORY_FILL = 0.6
const DIRECTORY_FILL_PORTRAIT = 0.9 // a narrow phone screen needs the room to keep the names readable
const DIRECTORY_SETTLE = 1 // the slab sits in the lower middle of the free area
const FILE_FILL = 0.9
const FILE_SETTLE = 0.6
const NEAR_CLEARANCE = 2 // every framed corner stays at least this far in front of the camera
const WARP_CLIMB = 0.25 // fsn's warpSpecialClimb: the flight arcs up by this share of its length
// Room kept around a zoomed-in file: a little at the sides (narrow portrait screens are width-bound), tight in
// front (anything near the camera at this low pitch drops out of the bottom of the view first)
const FILE_FOCUS_SIDE_PADDING = 3.5
const FILE_FOCUS_SIDE_PADDING_PORTRAIT = 2 // a narrow phone screen has to zoom in further to read the names
const FILE_FOCUS_BACK_PADDING = 3.8 // the row behind the selected block stays in view
const FILE_FOCUS_FRONT_PADDING = 0.6
const FILE_NAME_ALLOWANCE = 1.6 // room kept in front of a file block for its standing name

type Reserves = { sidePanelWidth: number; top: number; bottom: number }
const NO_RESERVES: Reserves = {
  sidePanelWidth: 0,
  top: VIEW_MARGIN,
  bottom: VIEW_MARGIN,
}

// Every DOM overlay that covers the scene: anything marked data-fsn-reserve, the terminal panel,
// and (until the breadcrumb's container is marked) the breadcrumb's container.
function reserveElements(): HTMLElement[] {
  const elements = new Set<HTMLElement>(
    document.querySelectorAll<HTMLElement>('[data-fsn-reserve], [data-testid="terminal-panel"]'),
  )
  const breadcrumb = document.querySelector('[data-testid="fsn-breadcrumb"]')?.parentElement
  if (breadcrumb) elements.add(breadcrumb)
  return Array.from(elements)
}

// Measure what the DOM overlays (header, overview strip, terminal panel or minimised header) cover, so the
// fit works for any layout: a side panel on wide screens, a bottom sheet on phones, a header
// floating at the top right on a rotated phone.
function measureReserves(): Reserves {
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  const reserves: Reserves = { ...NO_RESERVES }
  for (const element of reserveElements()) {
    const rect = element.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) continue
    const isBand = rect.width > 0.9 * viewportWidth
    if (!isBand && rect.height > 0.5 * viewportHeight) {
      // side panel: everything from its left edge to the screen edge is covered
      reserves.sidePanelWidth = Math.max(reserves.sidePanelWidth, viewportWidth - rect.left)
    } else if (rect.top + rect.height / 2 < viewportHeight / 2) {
      reserves.top = Math.max(reserves.top, rect.bottom + VIEW_MARGIN / 2)
    } else {
      reserves.bottom = Math.max(reserves.bottom, viewportHeight - rect.top + VIEW_MARGIN / 2)
    }
  }
  return reserves
}

type FramingPose = { position: THREE.Vector3; target: THREE.Vector3 }

type Viewport = {
  width: number // viewport width in pixels
  height: number
  freeWidth: number // width left uncovered by the terminal panel
  topReserve: number
  bottomReserve: number
}

// Corners of everything that belongs in a view: pedestals (with their name in front),
// and file blocks.
function cornersFor(layout: Layout, includes: (path: string, parentPath: string) => boolean): THREE.Vector3[] {
  const corners: THREE.Vector3[] = []
  layout.forEach((entry, path) => {
    if (!includes(path, entry.parentPath)) return
    const [x, y, z] = entry.position
    const front = z + entry.depth / 2 + (entry.kind === 'dir' ? DIRECTORY_LABEL_ALLOWANCE : 0)
    const back = z - entry.depth / 2
    const bottom = y - entry.height / 2
    const top = y + entry.height / 2
    for (const cornerX of [x - entry.width / 2, x + entry.width / 2]) {
      corners.push(
        new THREE.Vector3(cornerX, bottom, front),
        new THREE.Vector3(cornerX, bottom, back),
        new THREE.Vector3(cornerX, top, back),
        new THREE.Vector3(cornerX, top, z + entry.depth / 2),
      )
    }
  })
  return corners
}

// Place the camera at `pitch` so all the corners fill the free area: bisect the distance on
// the projected corners, then recentre on the free vertical band.
// `drop` lowers the content by that share of the free height; `settle` instead lowers it by that share of the
// vertical room the fit leaves over (never pushing it out of the free area).
function fitPose(
  corners: THREE.Vector3[],
  pitch: number,
  viewport: Viewport,
  { drop = 0, settle = 0, fillWidth = 1 }: { drop?: number; settle?: number; fillWidth?: number } = {},
): FramingPose {
  const direction = new THREE.Vector3(0, Math.sin(pitch), Math.cos(pitch))
  const screenUp = new THREE.Vector3(0, Math.cos(pitch), -Math.sin(pitch))
  const probe = new THREE.PerspectiveCamera(FOV_DEGREES, viewport.width / viewport.height, 1, 600)
  const allowedWidth = (fillWidth * (viewport.freeWidth - 2 * VIEW_MARGIN)) / viewport.width
  const allowedHeight = (viewport.height - viewport.topReserve - viewport.bottomReserve) / viewport.height
  // NDC centre that puts the content in the middle of the free vertical band
  const wantedCenterY = (viewport.bottomReserve - viewport.topReserve) / viewport.height - drop * allowedHeight
  const bounds = new THREE.Box3().setFromPoints(corners)
  const target = new THREE.Vector3((bounds.min.x + bounds.max.x) / 2, 0, (bounds.min.z + bounds.max.z) / 2)

  const project = (distance: number) => {
    probe.position.copy(target).addScaledVector(direction, distance)
    probe.lookAt(target)
    probe.updateMatrixWorld()
    probe.updateProjectionMatrix()
    let minX = Infinity
    let maxX = -Infinity
    let minY = Infinity
    let maxY = -Infinity
    for (const corner of corners) {
      // a corner at or behind the camera can never be framed (and projects to garbage), so the
      // distance is treated as too close; this keeps the bisection below monotonic
      const inView = corner.clone().applyMatrix4(probe.matrixWorldInverse)
      if (inView.z > -NEAR_CLEARANCE)
        return {
          minX: -Infinity,
          maxX: Infinity,
          minY: -Infinity,
          maxY: Infinity,
        }
      const ndc = corner.clone().project(probe)
      minX = Math.min(minX, ndc.x)
      maxX = Math.max(maxX, ndc.x)
      minY = Math.min(minY, ndc.y)
      maxY = Math.max(maxY, ndc.y)
    }
    return { minX, maxX, minY, maxY }
  }

  let distance = 60
  for (let pass = 0; pass < 3; pass++) {
    let near = 4
    let far = 400
    for (let step = 0; step < 30; step++) {
      distance = (near + far) / 2
      const extent = project(distance)
      const fits =
        (extent.maxX - extent.minX) / 2 <= allowedWidth / FIT_SLACK &&
        (extent.maxY - extent.minY) / 2 <= allowedHeight / FIT_SLACK
      if (fits) far = distance
      else near = distance
    }
    distance = far
    const extent = project(distance)
    const halfHeight = distance * Math.tan(THREE.MathUtils.degToRad(FOV_DEGREES / 2))
    const halfWidth = halfHeight * (viewport.width / viewport.height)
    // pan (parallel to the image plane, so every depth and therefore the fit is unchanged) until
    // the projected content is centred where it is wanted
    target.x += ((extent.minX + extent.maxX) / 2) * halfWidth
    const slack = Math.max(0, allowedHeight - (extent.maxY - extent.minY) / 2)
    target.addScaledVector(screenUp, ((extent.minY + extent.maxY) / 2 - (wantedCenterY - settle * slack)) * halfHeight)
  }
  return {
    position: target.clone().addScaledVector(direction, distance),
    target,
  }
}

// fsn's file zoom: the selected block with its name and a margin, from the floor of its pedestal up
function fileFocusCorners(layout: Layout, path: string, sidePadding: number): THREE.Vector3[] {
  const entry = layout.get(path)
  if (!entry) return []
  const [x, y, z] = entry.position
  const bottom = y - entry.height / 2
  const top = y + entry.height / 2
  const left = x - entry.width / 2 - sidePadding
  const right = x + entry.width / 2 + sidePadding
  const back = z - entry.depth / 2 - FILE_FOCUS_BACK_PADDING
  const front = z + entry.depth / 2 + FILE_NAME_ALLOWANCE + FILE_FOCUS_FRONT_PADDING
  const corners: THREE.Vector3[] = []
  for (const cornerX of [left, right]) {
    for (const cornerZ of [back, front]) {
      corners.push(new THREE.Vector3(cornerX, bottom, cornerZ), new THREE.Vector3(cornerX, top, cornerZ))
    }
  }
  return corners
}

function framingPose(
  layout: Layout,
  path: string,
  selectedPath: string,
  birdsEye: boolean,
  viewport: Viewport,
): FramingPose {
  const everything = () => true
  if (birdsEye) return fitPose(cornersFor(layout, everything), BIRDSEYE_PITCH, viewport)
  const selected = layout.get(selectedPath)
  if (selected?.kind === 'file' && selected.parentPath === path) {
    const sidePadding = viewport.width < viewport.height ? FILE_FOCUS_SIDE_PADDING_PORTRAIT : FILE_FOCUS_SIDE_PADDING
    return fitPose(fileFocusCorners(layout, selectedPath, sidePadding), FILE_PITCH, viewport, {
      settle: FILE_SETTLE,
      fillWidth: FILE_FILL,
    })
  }
  // the whole tree for the root, otherwise the directory with its files
  if (path === '/' || !layout.has(path))
    return fitPose(cornersFor(layout, everything), viewport.width < viewport.height ? ROOT_PITCH_PORTRAIT : ROOT_PITCH, viewport, {
      drop: ROOT_DROP,
    })
  return fitPose(
    cornersFor(layout, (entryPath, parentPath) => entryPath === path || parentPath === path),
    isOccluded(layout, path) ? OCCLUDED_PITCH : DIRECTORY_PITCH,
    viewport,
    {
      settle: DIRECTORY_SETTLE,
      fillWidth: viewport.width < viewport.height ? DIRECTORY_FILL_PORTRAIT : DIRECTORY_FILL,
    },
  )
}

// True when another directory stands between the camera and this one (grid mode's back row):
// seen from the low ground pitch it would loom across the view.
function isOccluded(layout: Layout, path: string): boolean {
  const target = layout.get(path)
  if (!target) return false
  for (const [otherPath, entry] of layout) {
    if (otherPath === path || entry.kind !== 'dir' || entry.parentPath !== target.parentPath) continue
    const overlapsX = Math.abs(entry.position[0] - target.position[0]) < (entry.width + target.width) / 2
    const nearer = entry.position[2] - target.position[2] > (entry.depth + target.depth) / 2
    if (overlapsX && nearer) return true
  }
  return false
}

export default function CameraRig({ layout }: { layout: Layout }) {
  const { currentPath, selectedPath, terminalMinimized, birdsEye, viewRequest } = useFsn()
  const isMobile = useIsMobile()
  const [reserves, setReserves] = useState<Reserves>(NO_RESERVES)
  const size = useThree((state) => state.size)
  const invalidate = useThree((state) => state.invalidate)
  const controlsRef = useRef<ComponentRef<typeof OrbitControls>>(null)
  const warp = useRef({
    active: false,
    elapsed: 0,
    fromPosition: new THREE.Vector3(),
    fromTarget: new THREE.Vector3(),
    flightLength: 0,
    duration: WARP_SECONDS,
    climb: true,
  })
  const goalRef = useRef<FramingPose | null>(null)
  const navigationKey = useRef('')
  // 'navigation': a new destination (full warp with the climb); 'layout': the same view in a changed viewport
  const pendingWarp = useRef<'navigation' | 'layout' | null>('navigation')
  const snap = useRef(true)
  const reducedMotion = useRef(false)
  const appliedViewKey = useRef('')

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const apply = () => {
      reducedMotion.current = query.matches
    }
    apply()
    query.addEventListener('change', apply)
    return () => query.removeEventListener('change', apply)
  }, [])

  // Re-measure the overlays after layout changes (terminal state, rotation, resize)
  useEffect(() => {
    const update = () => {
      const next = measureReserves()
      setReserves((previous) =>
        previous.sidePanelWidth === next.sidePanelWidth && previous.top === next.top && previous.bottom === next.bottom
          ? previous
          : next,
      )
    }
    update()
    const frame = requestAnimationFrame(update)
    const observer = new ResizeObserver(update)
    reserveElements().forEach((element) => observer.observe(element))
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [terminalMinimized, isMobile, size.width, size.height, currentPath])

  const goal = useMemo(
    () =>
      framingPose(layout, currentPath, selectedPath, birdsEye, {
        width: size.width,
        height: size.height,
        freeWidth: size.width - reserves.sidePanelWidth,
        topReserve: reserves.top,
        bottomReserve: reserves.bottom,
      }),
    [layout, currentPath, selectedPath, birdsEye, reserves, size.width, size.height],
  )

  // Navigation-driven changes (path, selection, bird's-eye, a repeated request for the same view) fly
  // the full warp; layout-only changes (viewport size, overlay reserves, layout mode) just ease, and
  // never restart a navigation warp that is still under way (its destination simply moves).
  useEffect(() => {
    goalRef.current = goal
    const key = `${currentPath}|${selectedPath}|${birdsEye}|${viewRequest}`
    if (key !== navigationKey.current) {
      navigationKey.current = key
      pendingWarp.current = 'navigation'
    } else if (pendingWarp.current !== 'navigation' && !(warp.current.active && warp.current.climb)) {
      pendingWarp.current = 'layout'
    }
    invalidate()
  }, [goal, currentPath, selectedPath, birdsEye, viewRequest, invalidate])

  useFrame(({ camera }, delta) => {
    // Shift the projection centre into the part of the screen the terminal panel leaves free
    // (moving the window right by half the panel puts the centre of the free area at the view centre)
    const offset = reserves.sidePanelWidth / 2
    const viewKey = `${offset}:${size.width}:${size.height}`
    if (appliedViewKey.current !== viewKey && camera instanceof THREE.PerspectiveCamera) {
      if (offset > 0) camera.setViewOffset(size.width, size.height, offset, 0, size.width, size.height)
      else camera.clearViewOffset()
      camera.updateProjectionMatrix()
      appliedViewKey.current = viewKey
    }
    const controls = controlsRef.current
    const goal = goalRef.current
    if (!controls || !goal) return
    const state = warp.current
    if (pendingWarp.current) {
      const kind = pendingWarp.current
      pendingWarp.current = null
      if (snap.current || reducedMotion.current) {
        // first frame, or reduced motion: cut instead of animating
        camera.position.copy(goal.position)
        controls.target.copy(goal.target)
        controls.update()
        snap.current = false
        state.active = false
        return
      }
      state.active = true
      state.elapsed = 0
      state.climb = kind === 'navigation'
      state.duration = state.climb ? WARP_SECONDS : LAYOUT_EASE_SECONDS
      state.fromPosition.copy(camera.position)
      state.fromTarget.copy(controls.target)
      state.flightLength = camera.position.distanceTo(goal.position)
    }
    if (!state.active) {
      // user-driven orbit and zoom: lift the camera out of any slab or block it would sink into
      const floor = cameraFloor(layout, camera.position.x, camera.position.z)
      if (camera.position.y < floor) {
        camera.position.y = floor
        controls.update()
        invalidate()
      }
      return
    }
    state.elapsed += delta
    const progress = Math.min(1, state.elapsed / state.duration)
    const eased = easeInOutCubic(progress)
    camera.position.lerpVectors(state.fromPosition, goal.position, eased)
    // fsn flies over the landscape rather than through it: arc up mid-flight, back down on arrival
    if (state.climb) camera.position.y += Math.sin(Math.PI * eased) * state.flightLength * WARP_CLIMB
    controls.target.lerpVectors(state.fromTarget, goal.target, eased)
    controls.update()
    if (progress >= 1) state.active = false
    else invalidate() // the frameloop is on demand: keep rendering until the warp lands
  })

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enablePan={false}
      // 360 degrees per viewport height at rotateSpeed 1, so scale to 0.5 degrees per pixel
      rotateSpeed={(ORBIT_DEGREES_PER_PIXEL * size.height) / 360}
      minPolarAngle={0}
      maxPolarAngle={MAX_POLAR_ANGLE}
      zoomSpeed={ZOOM_SPEED}
      minDistance={4}
      maxDistance={150}
      mouseButtons={{
        LEFT: THREE.MOUSE.ROTATE,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.DOLLY,
      }}
      touches={{ ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN }}
      onStart={() => {
        // the user took over: stop the warp
        warp.current.active = false
      }}
    />
  )
}
