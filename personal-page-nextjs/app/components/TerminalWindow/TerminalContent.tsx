'use client'

import InfoContent from '../InfoContent/InfoContent'
import TypedCommand from '../InfoContent/TypedCommand'
import { findNode } from '../../content/fsTree'
import { useFsn } from '../FsnScene'
import styles from './TerminalContent.module.css'

export default function TerminalContent() {
  const { openFilePath, closeFile } = useFsn()
  const node = openFilePath ? findNode(openFilePath) : undefined

  if (!openFilePath || !node) return <InfoContent />

  return (
    <div className={styles.file} data-testid="terminal-file">
      <div className={styles.commandLine}>
        <span className={styles.prompt}>&gt; </span>
        <span className={styles.command}>
          <TypedCommand key={openFilePath} text={`cat ${openFilePath}`} initialDelay={100} typingSpeed={30} />
        </span>
      </div>
      {node.href ? (
        <a className={styles.link} href={node.href} target="_blank" rel="noopener noreferrer">
          -&gt; {node.href}
        </a>
      ) : (
        <pre className={styles.body}>{node.body}</pre>
      )}
      <button type="button" className={styles.close} data-testid="terminal-file-close" onClick={closeFile}>
        cd ~
      </button>
    </div>
  )
}
