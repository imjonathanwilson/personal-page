'use client'

import { useEffect } from 'react'
import type { ThreeEvent } from '@react-three/fiber'

// Pointer handlers shared by Pedestal and FileBlock: hover state plus pointer cursor.
export function useHoverHandlers(path: string, onHover?: (path: string | null) => void) {
  useEffect(() => {
    return () => {
      document.body.style.cursor = ''
    }
  }, [])

  return {
    onPointerOver: (event: ThreeEvent<PointerEvent>) => {
      event.stopPropagation()
      document.body.style.cursor = 'pointer'
      onHover?.(path)
    },
    onPointerOut: () => {
      document.body.style.cursor = ''
      onHover?.(null)
    },
  }
}
