'use client'

import { useSyncExternalStore } from 'react'

const PORTRAIT_QUERY = '(orientation: portrait)' // height >= width

function subscribe(onChange: () => void) {
  const query = window.matchMedia(PORTRAIT_QUERY)
  query.addEventListener('change', onChange)
  return () => query.removeEventListener('change', onChange)
}

const getSnapshot = () => window.matchMedia(PORTRAIT_QUERY).matches
const getServerSnapshot = () => false

export function usePortrait(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
