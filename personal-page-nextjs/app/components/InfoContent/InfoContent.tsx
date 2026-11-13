'use client'

import { Fragment } from 'react'
import styles from './InfoContent.module.css'
import TypedCommand from './TypedCommand'
import { profile, projectNames, skillsText } from '../../content/fsTree'

const projectsTree = [
  'projects/',
  ...projectNames.map(
    (name, index) => `${index === projectNames.length - 1 ? '└──' : '├──'} ${name}`,
  ),
].join('\n')

const skillsBlock = [
  skillsText.languages,
  skillsText.frameworks,
  skillsText.cloud,
  skillsText.other,
].join('\n')

export default function InfoContent() {
  return (
    <div className={styles.infoContainer}>
      {/* First command line - cat about_me.txt with typing animation */}
      <div className={styles.commandLine}>
        <span className={styles.terminalPrompt}>&gt; </span>
        <span className={styles.command}>
          <TypedCommand text="cat about_me.txt" initialDelay={500} typingSpeed={75} />
        </span>
        <span className={styles.cursor}></span>
      </div>

      {/* Main info content */}
      <div>
        <h1 className={styles.heading}>{profile.name}</h1>
        <h2 className={styles.subtitle}>{profile.title}</h2>

        <div className={styles.contactInfo}>
          {profile.links.map((entry, index) => (
            <Fragment key={entry.href}>
              {index > 0 && <span className={styles.separator}> | </span>}
              <a href={entry.href} target="_blank" rel="noopener noreferrer">
                {entry.label}
              </a>
            </Fragment>
          ))}
        </div>

        {profile.paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>

      {/* Second command line - ls -la projects/ */}
      <div className={styles.commandLine}>
        <span className={styles.terminalPrompt}>&gt; </span>
        <span className={styles.command}>ls -la projects/</span>
      </div>
      <div className={styles.terminalText}>
{projectsTree}
      </div>

      {/* Third command line - man skills */}
      <div className={styles.commandLine}>
        <span className={styles.terminalPrompt}>&gt; </span>
        <span className={styles.command}>man skills</span>
      </div>
      <div className={styles.terminalText}>
{skillsBlock}
      </div>
    </div>
  )
}
