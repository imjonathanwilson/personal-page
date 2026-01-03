'use client'

import styles from './TerminalWindow.module.css'

export default function TerminalHeader() {
  return (
    <div className={styles.header}>
      <div className={styles.controls}>
        <div className={`${styles.button} ${styles.buttonRed}`} />
        <div className={`${styles.button} ${styles.buttonYellow}`} />
        <div className={`${styles.button} ${styles.buttonGreen}`} />
      </div>
      <div className={styles.title}>jonathan-wilson@homepage:~</div>
    </div>
  )
}
