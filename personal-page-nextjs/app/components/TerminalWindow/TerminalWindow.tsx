'use client'

import { ReactNode } from 'react'
import { useFsn } from '../FsnScene'
import TerminalHeader from './TerminalHeader'
import styles from './TerminalWindow.module.css'

interface TerminalWindowProps {
  children: ReactNode
}

export default function TerminalWindow({ children }: TerminalWindowProps) {
  const { terminalMinimized, setTerminalMinimized } = useFsn()

  return (
    <div
      className={`${styles.terminal} ${terminalMinimized ? styles.minimized : ''}`}
      data-testid="terminal-panel"
      data-minimized={terminalMinimized}
    >
      <TerminalHeader
        minimized={terminalMinimized}
        onMinimize={() => setTerminalMinimized(true)}
        onRestore={() => setTerminalMinimized(false)}
      />
      <div className={styles.body}>{children}</div>
    </div>
  )
}
