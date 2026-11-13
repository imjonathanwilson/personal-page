export type FsNode = {
  name: string // e.g. 'projects' or 'bio.txt'
  type: 'dir' | 'file'
  path: string // absolute, e.g. '/projects/devops-pipelines'
  children?: FsNode[] // dirs only
  body?: string // file text shown in terminal
  href?: string // .lnk files open this URL
  size: number // files: body length (or href length); dirs: sum of children sizes
}

export const profile = {
  name: 'Jonathan Wilson',
  title: 'Senior Site Reliability Engineer',
  paragraphs: [
    'Senior Site Reliability Engineer with deep experience automating AWS environments, improving system resilience, and supporting high-volume production workloads.',
    'Built scalable CI/CD pipelines and Terraform-driven infrastructure while designing real-time observability using Datadog, CloudWatch, and Grafana.',
  ],
  links: [
    { label: 'github.com/imjonathanwilson', href: 'https://github.com/imjonathanwilson' },
    { label: 'linkedin.com/in/imjonathanwilson', href: 'https://linkedin.com/in/imjonathanwilson' },
  ],
}

export const projectNames = [
  'infrastructure-automation',
  'cloud-security-tools',
  'devops-pipelines',
  'monitoring-dashboard',
]

export const skillsText = {
  languages: 'LANGUAGES: Python, JavaScript, TypeScript, Go, Rust',
  frameworks: 'FRAMEWORKS: React, Node.js, Express, Django',
  cloud: 'CLOUD: AWS, Terraform, Docker, Kubernetes',
  other: 'OTHER: CI/CD, Ansible, Monitoring',
}

// Paths are computed relative to the parent, so builders take a parent path
// via a deferred pass: nodes are created with a local path and rebased by dir().
function rebase(node: FsNode, parent: string): FsNode {
  const path = parent === '/' ? `/${node.name}` : `${parent}/${node.name}`
  const children = node.children?.map((child) => rebase(child, path))
  return { ...node, path, ...(children ? { children } : {}) }
}

function file(name: string, body: string): FsNode {
  return { name, type: 'file', path: `/${name}`, body, size: body.length }
}

function link(name: string, href: string): FsNode {
  return { name, type: 'file', path: `/${name}`, href, size: href.length }
}

function dir(name: string, children: FsNode[]): FsNode {
  const path = `/${name}`
  const rebased = children.map((child) => rebase(child, path))
  const size = rebased.reduce((total, child) => total + child.size, 0)
  return { name, type: 'dir', path, children: rebased, size }
}

const bioText = [profile.name, profile.title, '', ...profile.paragraphs].join('\n')
const contactText = profile.links.map((entry) => entry.label).join('\n')

const root = dir('', [
  dir('about', [file('bio.txt', bioText), file('contact.txt', contactText)]),
  dir(
    'projects',
    // TODO: real description
    projectNames.map((name) => file(name, `${name} — description coming soon`)),
  ),
  dir('skills', [
    file('languages.txt', skillsText.languages),
    file('frameworks.txt', skillsText.frameworks),
    file('cloud.txt', skillsText.cloud),
    file('other.txt', skillsText.other),
  ]),
  dir('links', [
    link('github.lnk', profile.links[0].href),
    link('linkedin.lnk', profile.links[1].href),
  ]),
])

export const fsTree: FsNode = { ...root, name: '/', path: '/' }

export function findNode(path: string): FsNode | undefined {
  const segments = path.split('/').filter(Boolean)
  let current: FsNode | undefined = fsTree
  for (const segment of segments) {
    current = current?.children?.find((child) => child.name === segment)
    if (!current) return undefined
  }
  return current
}

export function parentPath(path: string): string {
  const segments = path.split('/').filter(Boolean)
  segments.pop()
  return segments.length ? `/${segments.join('/')}` : '/'
}
