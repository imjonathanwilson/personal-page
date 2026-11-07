'use client'

import { ReactNode } from 'react'
import styles from './TerminalWindow.module.css'

interface TerminalWindowProps {
  children: ReactNode
}

export default function TerminalWindow({ children }: TerminalWindowProps) {
  return (
    <div className={styles.terminal}>
      <div className={styles.body}>
        {children}
      </div>
    </div>
  )
}
