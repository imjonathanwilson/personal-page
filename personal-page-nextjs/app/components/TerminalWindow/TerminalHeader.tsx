'use client'

import styles from './TerminalWindow.module.css'

interface TerminalHeaderProps {
  minimized: boolean
  onMinimize: () => void
  onRestore: () => void
}

export default function TerminalHeader({ minimized, onMinimize, onRestore }: TerminalHeaderProps) {
  return (
    <div
      className={`${styles.header} ${minimized ? styles.headerMinimized : ''}`}
      onClick={minimized ? onRestore : undefined}
    >
      <div className={styles.controls}>
        <div className={`${styles.button} ${styles.buttonRed}`} />
        <button
          type="button"
          className={`${styles.button} ${styles.buttonYellow}`}
          data-testid="terminal-minimize"
          aria-label="Minimize terminal"
          onClick={(event) => {
            event.stopPropagation()
            onMinimize()
          }}
        />
        <div className={`${styles.button} ${styles.buttonGreen}`} />
      </div>
      <div className={styles.title}>jonathan-wilson@homepage:~</div>
      {minimized && (
        <button
          type="button"
          className={styles.restore}
          data-testid="terminal-restore"
          aria-label="Restore terminal"
          onClick={(event) => {
            event.stopPropagation()
            onRestore()
          }}
        >
          [+]
        </button>
      )}
    </div>
  )
}
