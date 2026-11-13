## 1. Tooling
- [x] 1.1 Install `@playwright/cli`, smoke-test screenshot
- [x] 1.2 Add `playwright.config.ts` (static export webServer, desktop + mobile, swiftshader WebGL)
- [x] 1.3 Port `test-functional.mjs` checks to `tests/e2e/smoke.spec.ts`

## 2. Content
- [x] 2.1 Create `app/content/fsTree.ts`
- [x] 2.2 Refactor `InfoContent` to read from it with identical output

## 3. Scene
- [x] 3.1 Install R3F + drei; lazy-mount `FsnScene` via `next/dynamic`
- [x] 3.2 Layout, pedestals, file blocks, wires, labels, sky, ground, spotlight
- [x] 3.3 Navigation state, camera rig, breadcrumb/back/Esc, file → terminal
- [x] 3.4 Minimizable terminal, reduced motion, WebGL fallback, mobile, feature flag

## 4. Cleanup & verification
- [x] 4.1 Remove `ThreeScene/` and `poc/ThreeSpinningCube.tsx`
- [x] 4.2 `tests/e2e/fsn.spec.ts` navigation specs
- [x] 4.3 typecheck, lint, build, `npm run test:e2e` green; three/R3F in lazy chunk

## 5. Release
- [x] 5.1 Tag last pre-fsn production commit `v2.1.0` (rollback point)
- [x] 5.2 Merge to `main`, tag `v3.0.0`, deploy
