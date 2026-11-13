'use client'

import { useSyncExternalStore } from 'react'
import dynamic from 'next/dynamic'
import FsnKeyboardNav from './FsnKeyboardNav'
import FsnOverlay from './FsnOverlay'
import FsnOverview from './FsnOverview'
import FsnFileInfo from './FsnFileInfo'

export { FsnStoreProvider, useFsn } from './FsnStore'

const FsnScene = dynamic(() => import('./FsnScene'), { ssr: false })

let webGlSupport: boolean | null = null

// Probed once on the client; the lint rule against setState in effects makes
// useSyncExternalStore (server snapshot false) the clean way to do this.
function hasWebGl(): boolean {
  if (webGlSupport === null) {
    const canvas = document.createElement('canvas')
    webGlSupport = Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  }
  return webGlSupport
}

const subscribe = () => () => {}
const getServerSnapshot = () => false
const getSnapshot = () => process.env.NEXT_PUBLIC_FSN !== '0' && hasWebGl()

export default function FsnSceneLoader() {
  const supported = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  if (!supported) return null
  return (
    <>
      <FsnScene />
      <FsnKeyboardNav />
      <FsnOverlay />
      <FsnOverview />
      <FsnFileInfo />
    </>
  )
}
