'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { ReactNode } from 'react'
import { findNode, parentPath } from '../../content/fsTree'
import { useIsMobile } from './useIsMobile'

export type FsnState = {
  currentPath: string
  selectedPath: string
  hoveredPath: string | null
  openFilePath: string | null
}

export type FsnApi = FsnState & {
  setCurrentPath: (path: string) => void
  setSelectedPath: (path: string) => void
  navigateTo: (path: string) => void
  goUp: () => void
  openFile: (path: string) => void
  closeFile: () => void
  setHovered: (path: string | null) => void
  terminalMinimized: boolean
  setTerminalMinimized: (minimized: boolean) => void
  birdsEye: boolean
  setBirdsEye: (enabled: boolean) => void
  // Bumped by every navigation, selection or bird's-eye action, so the camera re-frames even when
  // the target is unchanged (clicking the current directory again after orbiting away)
  viewRequest: number
  // The scene registers how to project a node to viewport pixels; the hover card and tests use it
  registerProjector: (projector: ScreenProjector | null) => void
  projectToScreen: ScreenProjector
}

export type ScreenPoint = { x: number; y: number }
export type ScreenProjector = (path: string) => ScreenPoint | null

declare global {
  interface Window {
    __fsn?: {
      getState: () => FsnState
      navigateTo: (path: string) => void
      goUp: () => void
      openFile: (path: string) => void
      closeFile: () => void
      // Test-only: viewport pixel position of a node's clickable point
      screenPosition?: ScreenProjector
      cameraPosition?: () => [number, number, number]
    }
  }
}

const FsnContext = createContext<FsnApi | null>(null)

export function FsnStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<FsnState>({
    currentPath: '/',
    selectedPath: '', // nothing is selected (so no spotlight) until the visitor picks something
    hoveredPath: null,
    openFilePath: null,
  })
  // null means "follow the viewport default" (minimized on mobile, open on desktop)
  const [minimizedOverride, setMinimizedOverride] = useState<boolean | null>(null)
  const [birdsEye, setBirdsEyeState] = useState(false)
  const [viewRequest, setViewRequest] = useState(0)
  const projectorRef = useRef<ScreenProjector | null>(null)
  const registerProjector = useCallback((projector: ScreenProjector | null) => {
    projectorRef.current = projector
  }, [])
  const projectToScreen = useCallback<ScreenProjector>((path) => projectorRef.current?.(path) ?? null, [])
  const requestView = useCallback(() => setViewRequest((count) => count + 1), [])
  const isMobile = useIsMobile()
  const terminalMinimized = minimizedOverride ?? isMobile
  const isMobileRef = useRef(isMobile)
  useEffect(() => {
    isMobileRef.current = isMobile
  }, [isMobile])
  // On mobile the terminal is a bottom sheet that covers the pedestals, so scene
  // interactions fold it away again.
  const minimizeOnMobile = useCallback(() => {
    if (isMobileRef.current) setMinimizedOverride(true)
  }, [])
  const stateRef = useRef(state)
  useEffect(() => {
    stateRef.current = state
  }, [state])

  // R3F only re-raycasts on pointer move, so anything that changes the view clears a stale hover
  const setBirdsEye = useCallback(
    (enabled: boolean) => {
      setBirdsEyeState(enabled)
      setState((previous) => (previous.hoveredPath === null ? previous : { ...previous, hoveredPath: null }))
      requestView()
    },
    [requestView],
  )

  const setCurrentPath = useCallback(
    (path: string) => {
      setState((previous) => ({ ...previous, currentPath: path }))
      requestView()
    },
    [requestView],
  )
  const setSelectedPath = useCallback(
    (path: string) => {
      setState((previous) => ({ ...previous, selectedPath: path }))
      requestView()
    },
    [requestView],
  )

  // Directories become the current path; files select within their parent directory.
  const navigateTo = useCallback((path: string) => {
    const node = findNode(path)
    if (!node) return
    const directory = node.type === 'dir' ? node.path : parentPath(node.path)
    setBirdsEye(false)
    setState((previous) => ({
      ...previous,
      currentPath: directory,
      selectedPath: node.path,
      openFilePath: null,
      hoveredPath: null,
    }))
    minimizeOnMobile()
  }, [minimizeOnMobile, setBirdsEye])

  const goUp = useCallback(() => {
    const { currentPath } = stateRef.current
    if (currentPath === '/') return
    const target = parentPath(currentPath)
    setBirdsEye(false)
    setState((previous) => ({
      ...previous,
      currentPath: target,
      selectedPath: target,
      openFilePath: null,
      hoveredPath: null,
    }))
    minimizeOnMobile()
  }, [minimizeOnMobile, setBirdsEye])

  const openFile = useCallback((path: string) => {
    const node = findNode(path)
    if (!node || node.type !== 'file') return
    setState((previous) => ({
      ...previous,
      currentPath: parentPath(node.path),
      selectedPath: node.path,
      openFilePath: node.path,
      hoveredPath: null,
    }))
    setBirdsEye(false)
    setMinimizedOverride(false)
  }, [setBirdsEye])

  const closeFile = useCallback(() => {
    setState((previous) => ({ ...previous, openFilePath: null, hoveredPath: null }))
    minimizeOnMobile()
  }, [minimizeOnMobile])

  const setHovered = useCallback((path: string | null) => {
    setState((previous) =>
      previous.hoveredPath === path ? previous : { ...previous, hoveredPath: path },
    )
  }, [])

  // Layout effects run before any child's passive effect, so window.__fsn exists by the time the
  // scene's ScreenProbe adds cameraPosition. Spreading the previous object keeps those additions
  // when the callbacks below change identity and this re-runs.
  useLayoutEffect(() => {
    window.__fsn = {
      ...window.__fsn,
      getState: () => {
        const { currentPath, selectedPath, hoveredPath, openFilePath } = stateRef.current
        return { currentPath, selectedPath, hoveredPath, openFilePath }
      },
      navigateTo,
      goUp,
      openFile,
      closeFile,
      screenPosition: projectToScreen,
    }
  }, [navigateTo, goUp, openFile, closeFile, projectToScreen])
  useLayoutEffect(
    () => () => {
      delete window.__fsn
    },
    [],
  )

  const value = useMemo<FsnApi>(
    () => ({
      ...state,
      setCurrentPath,
      setSelectedPath,
      navigateTo,
      goUp,
      openFile,
      closeFile,
      setHovered,
      terminalMinimized,
      setTerminalMinimized: setMinimizedOverride,
      birdsEye,
      setBirdsEye,
      viewRequest,
      registerProjector,
      projectToScreen,
    }),
    [
      state,
      setCurrentPath,
      setSelectedPath,
      navigateTo,
      goUp,
      openFile,
      closeFile,
      setHovered,
      terminalMinimized,
      birdsEye,
      setBirdsEye,
      viewRequest,
      registerProjector,
      projectToScreen,
    ],
  )

  return <FsnContext.Provider value={value}>{children}</FsnContext.Provider>
}

export function useFsn(): FsnApi {
  const context = useContext(FsnContext)
  if (!context) throw new Error('useFsn must be used inside FsnStoreProvider')
  return context
}
