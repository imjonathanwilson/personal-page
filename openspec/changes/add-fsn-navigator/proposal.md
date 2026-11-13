# Change: Add fsn-style 3D File System Navigator

## Why
The homepage background is a hardcoded, non-interactive three.js approximation of SGI's fsn (the Jurassic Park "It's a UNIX system" UI). It leaks its rAF loop, ships three.js in the first-load bundle, and visualizes nothing real. Turning it into a working navigator over the site's own content makes the site's signature feature functional.

## What Changes
- Replace `ThreeScene` with an R3F (`@react-three/fiber` v9 + `@react-three/drei` v10) `FsnScene`, lazy-loaded with `ssr:false`.
- Add `app/content/fsTree.ts` as single source of truth for site content; `InfoContent` reads from it.
- Directories render as pedestals sized by contents, files as blocks with height by size, parent→child wires, labels, sky gradient, selection spotlight.
- Click pedestal → camera flies in; click file → terminal shows `cat <path>`; breadcrumb, back button, Esc navigation.
- Terminal window becomes minimizable so the scene is usable.
- Reduced-motion, WebGL-fallback, mobile behaviour, `NEXT_PUBLIC_FSN=0` kill switch.
- Playwright: `@playwright/cli` for agent-driven visual checks, `playwright.config.ts` + `tests/e2e` specs.
- **BREAKING (internal):** `ThreeScene` component and `poc/ThreeSpinningCube.tsx` removed.

## Impact
- Affected specs: `fsn-navigator` (new)
- Affected code: `app/page.tsx`, `app/components/{ThreeScene,FsnScene,InfoContent,TerminalWindow}`, `app/content/`, `package.json`, `playwright.config.ts`, `tests/e2e/`
