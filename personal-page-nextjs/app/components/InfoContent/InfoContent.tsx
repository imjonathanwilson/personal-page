'use client'

import styles from './InfoContent.module.css'
import TypedCommand from './TypedCommand'

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
        <h1>Jonathan Wilson</h1>
        <h2>Senior Site Reliability Engineer</h2>

        <div className={styles.contactInfo}>
          <a
            href="https://github.com/imjonathanwilson"
            target="_blank"
            rel="noopener noreferrer"
          >
            github.com/imjonathanwilson
          </a>
          <span className={styles.separator}> | </span>
          <a
            href="https://linkedin.com/in/imjonathanwilson"
            target="_blank"
            rel="noopener noreferrer"
          >
            linkedin.com/in/imjonathanwilson
          </a>
        </div>

        <p>
          Senior Site Reliability Engineer with deep experience automating AWS
          environments, improving system resilience, and supporting high-volume
          production workloads.
        </p>
        <p>
          Built scalable CI/CD pipelines and Terraform-driven infrastructure
          while designing real-time observability using Datadog, CloudWatch,
          and Grafana.
        </p>
      </div>

      {/* Second command line - ls -la projects/ */}
      <div className={styles.commandLine}>
        <span className={styles.terminalPrompt}>&gt; </span>
        <span className={styles.command}>ls -la projects/</span>
      </div>
      <div className={styles.terminalText}>
{`projects/
├── infrastructure-automation
├── cloud-security-tools
├── devops-pipelines
└── monitoring-dashboard`}
      </div>

      {/* Third command line - man skills */}
      <div className={styles.commandLine}>
        <span className={styles.terminalPrompt}>&gt; </span>
        <span className={styles.command}>man skills</span>
      </div>
      <div className={styles.terminalText}>
{`LANGUAGES: Python, JavaScript, TypeScript, Go, Rust
FRAMEWORKS: React, Node.js, Express, Django
CLOUD: AWS, Terraform, Docker, Kubernetes
OTHER: CI/CD, Ansible, Monitoring`}
      </div>
    </div>
  )
}
