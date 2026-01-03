'use client'

import { useEffect, useState } from 'react'
import styles from './Footer.module.css'

export default function Footer() {
  const [message, setMessage] = useState('[Press any key to continue...]')

  useEffect(() => {
    const handleKeyDown = () => {
      // Change message immediately
      setMessage('Command not found. Type "help" for options.')

      // Reset after 2 seconds
      setTimeout(() => {
        setMessage('[Press any key to continue...]')
      }, 2000)
    }

    // Add event listener
    document.addEventListener('keydown', handleKeyDown)

    // Cleanup on unmount
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  return <div className={styles.footer}>{message}</div>
}
