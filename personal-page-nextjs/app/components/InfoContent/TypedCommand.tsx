'use client'

import { useEffect, useState } from 'react'

interface TypedCommandProps {
  text: string
  initialDelay?: number
  typingSpeed?: number
}

export default function TypedCommand({
  text,
  initialDelay = 500,
  typingSpeed = 75,
}: TypedCommandProps) {
  // Track progress alongside the text it belongs to, so a text change resets
  // typing without calling setState synchronously inside an effect.
  const [progress, setProgress] = useState({ text, index: 0 })
  const currentIndex = progress.text === text ? progress.index : 0

  useEffect(() => {
    // Typing effect
    if (currentIndex < text.length) {
      const typingTimeout = setTimeout(() => {
        setProgress({ text, index: currentIndex + 1 })
      }, currentIndex === 0 ? initialDelay : typingSpeed)

      return () => {
        clearTimeout(typingTimeout)
      }
    }
  }, [currentIndex, text, typingSpeed, initialDelay])

  return <>{text.slice(0, currentIndex)}</>
}
