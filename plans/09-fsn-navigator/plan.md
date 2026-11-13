# Plan: fsn-style 3D File System Navigator + Playwright tooling

## Context
`personal-page-nextjs` (Next 16.4.5, React 19.3.1, static export, npm) has a plain three.js background (`app/components/ThreeScene/ThreeScene.tsx`). It is a rough version of SGI fsn from Jurassic Park: a hardcoded grid of green shader slabs with a spotlight on a "proxy" block. It is non-interactive (`pointer-events:none`, `z-index:-1`). It also has bugs:
- the rAF loop is never cancelled (two loops run under Strict Mode in dev)
- animation speed depends on frame rate
- three ships in the first-load bundle
- mobile hiding is commented out
- it logs to the console every frame

Goal: replace it with a real fsn-style navigator built from the site's own content. Directories are pedestals sized by their contents, files are blocks on top whose height scales with content size, wires connect parent to child, and the scene has labels and a sky gradient. Clicking a pedestal flies the camera to it; clicking a file opens it in the terminal. Also install Playwright tooling: the agent `@playwright/cli` for visual checks, and a real `@playwright/test` runner setup.

User decisions:
- **Playwright:** both the CLI and the test runner
- **Interaction:** full navigator
- **Data:** the site's content
- **Stack:** R3F + drei

## 0. Repo conventions (from `/home/jdubz/personal-page/CLAUDE.md`)
- Create an OpenSpec change `openspec/changes/add-fsn-navigator/` (proposal.md, tasks.md, spec delta) and run `openspec validate add-fsn-navigator --strict`.
- Save the plan to `plans/09-fsn-navigator/plan.md` and add requirements to `plans/requirements.md`.
- Write a diary entry at `devlog/fsn-navigator.md`.
- Check library docs before using them: R3F v9, drei v10, `@playwright/cli`.
- Do not comment out features. Use a flag instead (see step 5).
- Take Playwright screenshots between actions.

## 1. Playwright (implementer agent)
- **Agent CLI:** run `npm i -D @playwright/cli` (confirm the package name and version on its README first). If it supports it, run `npx playwright-cli install --skills` so Claude Code can drive it. Smoke test: open `http://localhost:3000` and take a screenshot.
- **Test runner:**
  - Add `playwright.config.ts`:
    - `testDir: 'tests/e2e'`
    - `webServer` = `npm run build && npx serve out`. This tests the static export, which is what production serves. If adding `serve` is unwanted, use `next start` instead.
    - Chromium desktop and mobile projects.
    - `use.launchOptions` with `--use-gl=angle --use-angle=swiftshader` so WebGL works headless under WSL.
  - Port the checks from `test-functional.mjs` into `tests/e2e/smoke.spec.ts`: typing effect, footer, canvas, WebGL, console errors, mobile. Keep the old script until the specs pass, then delete it.
  - Add npm scripts `test:e2e` and `test:e2e:ui`.

## 2. Content model (implementer)
New file `app/content/fsTree.ts`, typed as `FsNode = { name, type: 'dir'|'file', children?, body?, href?, size }`. It is generated from what `InfoContent.tsx` shows today (single source of truth):
```
/
├── about/      bio.txt, contact.txt (github, linkedin hrefs)
├── projects/   infrastructure-automation, cloud-security-tools, devops-pipelines, monitoring-dashboard
├── skills/     languages.txt, frameworks.txt, cloud.txt, other.txt
└── links/      github.lnk, linkedin.lnk
```
- `size` comes from `body.length`, which drives file block height.
- `InfoContent` gets refactored to read its text from `fsTree` so the two can't drift apart. Its visible output stays the same.

## 3. fsn scene with R3F (implementer, then I review)
- Install `@react-three/fiber@^9` and `@react-three/drei@^10`. Check that both support React 19 before installing.
- Mount the scene from `app/page.tsx` through `next/dynamic(..., { ssr:false })` so three and R3F load lazily and never run on the server.
- **New component directory:** `app/components/FsnScene/`.
  - `FsnScene.tsx` holds the `<Canvas>`, the gradient sky background (blue to black, like the fsn screenshot), a dark green ground plane plus grid, and fog.
  - `layout.ts` is a pure function that turns the tree into world positions. The root sits at the front. Each level's children spread in a row further back (fsn style). Pedestal footprint scales with child count.
  - `Pedestal.tsx` is a directory slab. It reuses the existing green rim/pulse shader moved into `shaders.ts`, and switches to the highlighted shader on hover or select. It shows a drei `<Text>` label.
  - `FileBlock.tsx` is a small block on top of a pedestal, with height from `size`. It is purple/magenta like fsn files and has a label.
  - `Wires.tsx` draws parent-to-child lines with drei `<Line>`.
  - `Spotlight.tsx` is the existing beam cylinder plus spotlight, moved to follow the selected node (fsn's "selection spotlight").
  - `CameraRig.tsx` flies the camera smoothly (damped lerp of position and target in `useFrame` with `delta`, which fixes the frame-rate dependence). It flies to the selected pedestal. OrbitControls stay limited (no pan, clamped polar angle).
- **State:** `useFsnStore` (React context, no new dependency) tracks the current path, selected node and open file.
- **Interaction:**
  - Clicking a pedestal navigates into it (camera flies there).
  - Clicking a file opens it, and the terminal shows `> cat <path>` followed by the body, using `TypedCommand`. `.lnk` files open their href.
  - Hovering sets the cursor to a pointer and highlights the node.
  - A breadcrumb (`/ > projects`) and a back button sit in an HTML overlay. Esc goes up one level.
- **Terminal:** `TerminalWindow` becomes a panel you can toggle and drag or collapse. It is open at first, and a "_" button minimizes it so the scene is usable. The scene container gets `pointer-events:auto`.
- **Accessibility and performance:**
  - `prefers-reduced-motion` turns off the pulse and makes the camera cut instead of fly.
  - `frameloop="demand"` while idle.
  - The DOM breadcrumb and back button work from the keyboard.
  - Without WebGL, fall back to the current terminal-only page.

## 4. Remove the old scene
After FsnScene passes its tests, delete `ThreeScene/` and `poc/ThreeSpinningCube.tsx`. Remove all `console.log` calls from scene code.

## 5. Mobile
Replace the commented-out mobile rule with real behavior:
- the scene renders at a reduced DPR (`dpr={[1,1.5]}`)
- the terminal starts minimized on load
- touch tap works like click

A `NEXT_PUBLIC_FSN=0` flag falls back to the terminal-only page.

## Delegation
| Step | Agent |
|---|---|
| 1 Playwright setup | implementer (sonnet) |
| 2 Content model + InfoContent refactor | implementer |
| 3 Scene | implementer in two passes: (a) static layout and visuals, then (b) interaction, camera and terminal integration. I review the diff and screenshots after each pass. |
| E2E specs for navigation | test-writer |
| OpenSpec, plans and devlog docs | me |

## Critical files
- `app/page.tsx`
- `app/components/ThreeScene/ThreeScene.tsx` (shader source moves to `FsnScene/shaders.ts`, then the file is deleted)
- `app/components/InfoContent/InfoContent.tsx`
- `app/components/TerminalWindow/TerminalWindow.tsx`
- `package.json`
- new `playwright.config.ts`
- new `tests/e2e/*`
- new `app/components/FsnScene/*`
- new `app/content/fsTree.ts`

## Verification
1. `npm run typecheck && npm run lint && npm run build`. The static export must succeed.
2. `npm run test:e2e`:
   - `smoke.spec.ts` (ported checks)
   - `fsn.spec.ts`:
     - the canvas renders and is not blank (screenshot pixel variance)
     - clicking the "projects" pedestal changes the breadcrumb to `/ > projects`
     - clicking a file makes the terminal show `cat projects/...`
     - Esc returns to `/`
     - the mobile project's tap works
     - there are no console errors
     - after navigating away and back, only one canvas or WebGL context exists (catches the leaked loop)
   - Pedestals are clicked through `data-testid` hooks exposed on the DOM overlay, or through a `window.__fsn.select(path)` test hook, because clicking raw canvas coordinates is fragile.
3. Use `playwright-cli` for visual passes: a screenshot after each navigation step, compared by eye against the fsn reference screenshot.
4. Check `next build` output to confirm three and R3F are in a separate lazy chunk, not in the first-load JS.

## Milestones

### v3.0.0: fsn navigator, first release (2026-11-13)
- **Scene:** the fsn-style 3D navigator replaces the old ThreeScene. It is built from the site's own content (`app/content/fsTree.ts`):
  - pedestals for directories, cyan 2×2 file blocks, and wires;
  - Hershey stroke lettering, with file names tilted −50° as in fsnav;
  - the sky, the overview strip and an fsn-style menu bar.
- **Interaction:**
  - Click to zoom into a directory, or to select a file.
  - Double-click opens the file in the terminal; `.lnk` files open their URL.
  - Esc, the `..` button and the bird's-eye toggle all work.
  - The camera flies with damping, and cuts instead when reduced motion is set.
- **Spotlight:** matched to the film: a cream disk 1.8× the block width, and a stippled shaft that leans and runs off the top of the view.
- **File icons:** original document, link and project icons lie flat on each block, drawn in tints of the block's colour.
- **Tooling:** the Playwright test runner (desktop and mobile projects) and the Playwright CLI.
- **Rollback:**
  - `v2.1.0` tags the last pre-fsn production commit. To roll back, redeploy it with `git revert`, or reset `main` to it and push.
  - `NEXT_PUBLIC_FSN=0` at build time serves the terminal-only page.
