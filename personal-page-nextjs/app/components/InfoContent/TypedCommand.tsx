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
  const [displayedText, setDisplayedText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    // Reset state when text changes
    setDisplayedText('')
    setCurrentIndex(0)

    // Initial delay before typing starts
    const initialTimeout = setTimeout(() => {
      setCurrentIndex(0)
    }, initialDelay)

    return () => {
      clearTimeout(initialTimeout)
    }
  }, [text, initialDelay])

  useEffect(() => {
    // Typing effect
    if (currentIndex < text.length) {
      const typingTimeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text.charAt(currentIndex))
        setCurrentIndex((prev) => prev + 1)
      }, currentIndex === 0 ? initialDelay : typingSpeed)

      return () => {
        clearTimeout(typingTimeout)
      }
    }
  }, [currentIndex, text, typingSpeed, initialDelay])

  return <>{displayedText}</>
}
