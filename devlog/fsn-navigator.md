# fsn Navigator — devlog

## 2026-11-12 — Kickoff
- Goal: turn the decorative three.js background into a working SGI fsn-style navigator (Jurassic Park "It's a UNIX system") over the site's own content.
- Decisions: R3F + drei over hand-rolled three; full navigator (not background); data = site content via `app/content/fsTree.ts`; Playwright CLI for agent visual checks plus a real `@playwright/test` config.
- Existing scene issues found: rAF never cancelled, frame-rate-dependent animation, three in first-load bundle, mobile rule commented out, per-frame console logging, scene lights have no effect on ShaderMaterials.
- Plan: `plans/09-fsn-navigator/plan.md`. OpenSpec change: `openspec/changes/add-fsn-navigator/`.

## 2026-11-12 — Implementation complete (not deployed)
- Playwright: `@playwright/cli@0.1.24` (skill at `.claude/skills/playwright-cli/`), `playwright.config.ts` serving the static export on :3100, chromium + Pixel 7 projects, swiftshader WebGL.
- Content: `app/content/fsTree.ts` is the single source; `InfoContent` renders from it (text-identical).
- Scene: `app/components/FsnScene/` (R3F 9.8.2 + drei 10.7.9), lazy-loaded via `next/dynamic` — three/R3F not in first-load JS. Pedestals, file blocks (height ∝ log size), wires, labels, sky gradient, selection beam, damped camera rig with viewport-fitted framing and `setViewOffset` to clear the terminal panel.
- Interaction: click pedestal → fly in; click file → `cat` in terminal; `.lnk` opens href; breadcrumb, up button, Escape.
- Terminal is a floating panel (desktop right, mobile bottom sheet, minimized by default on mobile).
- Removed `ThreeScene/`, `poc/ThreeSpinningCube.tsx`, `test-functional.mjs` (replaced by `tests/e2e`).
- Bugs caught by e2e and fixed: mobile overview clipped outer pedestals; desktop terminal covered `/links`; mobile sheet stayed open after closing a file.
- Tests: `npm run test:e2e` → 39 passed, 1 skipped (hover on touch).
- WSL note: Chromium needs `libnspr4 libnss3 libasound2t64` (`sudo npx playwright install-deps chromium`).
- Release: hold — user wants a tagged, easily-rollbackable release; do not push to main until approved.

## 2026-11-12 — fsn reference study

- Studied jtsiomb/fsnav (GPLv3, ideas only, no code copied) and unixmonkey/fsn_jurassic_park, which has real IRIX fsn `.Xdefaults` settings. Notes are in `plans/09-fsn-navigator/reference-study.md`.
- Key finding: real fsn hides file labels until you get close (`minFileTextZDistance`). fsnav tilts its labels −50° toward the viewer instead of laying them flat. Either approach solves the problem that names were unreadable from the overview.
- Pass H is in progress:
  - tilted labels
  - faceted flat shading using fsn's per-face value factors
  - file and pedestal heights scaled by size
  - JP palette: black-to-green sky and mint wires
  - a file-info "scope" overlay on hover

## 2026-11-12: switched to the fsv TreeV look (passes H–O)

- **Passes H–J (fsn/fsnav look):**
  - Labels tilted toward the camera, faceted per-face shading, heights scaled by size, and the Jurassic Park fsn palette.
  - A file info "scope" card on hover.
  - fsnav controls: orbit on drag, zoom, double-click to warp, single click to select.
  - Opaque terminal panel and a fixed beam pool.
  - User feedback: "it still doesn't match??" They pointed at fsv.sourceforge.net instead.
- **Passes K–O (fsv TreeV look):**
  - Black void, grey slabs, khaki file blocks with names printed on the top face, and huge flat white directory names.
  - Dark-red ribbons on the ground linking folders, with children on a gentle arc.
  - White corner brackets for selection, "X" placeholders for subdirectories, and a bird's-eye button.
  - The root view is a TreeV-style whole-tree fit at 52°.
  - Portrait screens use a 2x2 grid layout and landscape uses a single row (`layoutModeFor`).
  - Directory views pitch up to 68° when a sibling would block the view.
  - The camera fit measures the overlay rectangles from the DOM.
- **Font:** DejaVu Sans Mono Bold Oblique, shipped with `public/fonts/DejaVu-LICENSE.txt`.
- **Tests:** e2e at 51 passed, 3 skipped (mobile-only hover/drag cases).

## 2026-11-12: pass Q, the unixmonkey/fsn_jurassic_park look

- User: "instead of this implementation can we more closely match https://github.com/unixmonkey/fsn_jurassic_park?"
- I studied the repo's `.Xdefaults` and generator script and the O2 recreation frame. Notes are in `reference-study.md`.
- **Pass Q-A (scene):**
  - sky band and black ground
  - rose pedestals and cyan files
  - flat file names and mint directory names
  - a fan of mint wires
  - a stippled spotlight cone in place of the brackets
  - fsv's X markers removed
  - a low 60° FOV camera
- **Pass Q-B (HUD):**
  - an IRIX header with the path field and stats line (the breadcrumb test IDs are kept)
  - a bottom overview strip with the tree silhouette, where clicking a directory navigates to it

## 2026-11-13: one click flies there (fsn behaviour)

- User: "the zoom to functionality isnt working when clicing things". A single click only selected; zooming needed a double-click.
- **Change:** one click or tap on a directory warps into it. One click on a file selects it and zooms the camera in on it (fsn's `zoomFile*` view). A second click on the selected file, or a double-click, opens it. A file that is already open is not activated again, so a double-click never opens a `.lnk` twice.
- **Camera:** `fileFocusCorners` frames the file block with its name. Padding is 1.2 at the sides, 1.5 at the back and 0.6 in front, at the 24° ground pitch.
- **Tests:**
  - The "click only selects" test is replaced with "click flies into a pedestal" and "click on a file zooms without opening".
  - The touch `activate` helper now waits for the zoom before its second tap.
  - Result: 57 passed, 5 skipped.

## 2026-11-13: review loop, iteration 1

- I ran a scripted walkthrough on desktop and mobile. Screenshots are in `scratchpad/review1`–`review3`.
- **Fixed: tall-file zoom.** Zooming into `bio.txt` put the camera inside the block, with the block's top under the header. `fitPose` re-centred by sliding the target along the ground, which changed the camera's distance to the content after the fit. The last slide was large for tall content. It now pans parallel to the image plane, so depths and the fit are unchanged. Corners at or behind the camera now count as "too close", which keeps the bisection monotonic.
- **Added fsn's warp climb** (`warpSpecialClimb`): the flight arcs up by 25% of its length mid-way.
- **Bird's-eye:** the spotlight cone is hidden there, because seen from above it smeared across the map. The disk stays.
- **Hover card:** it is hover-only now, because the header's stats line already shows the selection. It is kept below the header and inside the window.
- **Test hook:** added `window.__fsn.cameraPosition()`.
- **Tests:** 57 passed, 5 skipped. An adversarial review is running.

## 2026-11-13: review loop, iteration 2 (adversarial round 1 fixes, pass R)

The adversarial reviewer found 15 issues. 14 were fixed in two parallel passes; the root start view was kept as fsn's whole-tree opening view.

- **R-A (scene):**
  - A `viewRequest` counter means re-clicking re-centres the camera after an orbit.
  - Changes caused only by the layout (resize, reserves) ease for 0.25 s with no climb; only navigation gets the full warp.
  - `frameloop="demand"` with `invalidate()` during warps and on state changes.
  - Spotlight cone height 16, top radius 0.2.
  - Pedestals are 0.12–0.3 thick.
  - The hover card projects through a store-held projector instead of `window.__fsn`, clamped to the free area.
  - Hover is cleared on navigation.
  - Wires stop at the child's name.
  - File names sit 0.5 in front of their block.
- **R-B (HUD):**
  - Short viewports (height 500 or less) use the mobile layout: compact header and docked terminal.
  - The terminal is a full-height side panel, so restoring it is unambiguous for camera framing.
  - Working IRIX pull-down menus: Session/Show/Display/Directory/File/Help, with an About dialog.
  - Keyboard listbox (`fsn-keyboard-nav`) for the current directory.
  - Touch targets of at least 36px.
- **Tests:** 69 passed, 13 skipped.

## 2026-11-13: review loop, iteration 3 (adversarial round 2, pass S); loop closed

- Adversarial round 2 confirmed all 14 fixes from round 1, with no regressions. Every state change rendered correctly under the demand frameloop, with no frozen frames.
- **Pass S polish:**
  - The terminal dots are aligned on mobile.
  - The keyboard listbox opens below the header and blurs on an outside pointer-down.
  - The About dialog is `aria-modal`, with a backdrop and a Tab loop.
  - With a menu open, the first outside click only dismisses it (a transparent catcher; the header rises above it).
  - `window.__fsn` is created in a layout effect and merged, so `cameraPosition` survives re-runs.
- **Left as is, by choice:**
  - the terminal's 24px margin (site design)
  - the current directory's own name in the foreground (fsn shows it too)
  - no pull-down menus on portrait phones
- **Tests:** 74 passed, 18 skipped, with typecheck and lint clean.

## 2026-11-13: higher directory camera

- User: when clicking the sub-directories, "the camera should be higher to better see the text", with a screenshot of a steep view of `/skills`.
- **Camera:** the directory view pitch goes from 24° to 55°, and the file zoom from 24° to 44°. The start view stays at 17° so the sky band still shows.
- **Layout:** front-row blocks still hid the back row's names, so `FILE_ROW_SPACING` (1.4) now adds clear space between a name and the next row's block. `FILE_CELL_DEPTH` is now 2.0 + 1.6 + 1.4 = 5.0.
- **Tests:** 74 passed, 18 skipped.
- Follow-up: user: "the boxes are different sizes now, make them the same". One-row folders (about, links) had shallower slabs than two-row ones (projects, skills), and the row spacing made the difference larger. Every slab that holds files is now at least a 2x2 file grid (`STANDARD_SLAB_FILES = 4`), so all four are the same size. Larger directories still grow, and the root keeps its own small slab.
- Follow-up: user: "they were square before why are they rectangles?" The row spacing made a 2x2 slab 9.2 wide by 12.4 deep. File cells are now square (`FILE_CELL_WIDTH = FILE_CELL_DEPTH = 5.0`), so every slab is a 12.4 square.
- Follow-up: the user pointed back at their screenshot, which shows tight spacing. The row spacing is removed, and cells are a tight square: `FILE_CELL_WIDTH = FILE_CELL_DEPTH = 2.0 + 1.8 = 3.8`, so a 2x2 slab is 8.8 square. To keep back-row names visible: directory pitch is 60° and file zoom 55°. File names start 0.25 in front of their block and stop 0.75 short of the next row's block, so a two-line name is never hidden by it.

## 2026-11-13: Movie-frame fidelity pass (review iteration 4) and adversarial fixes

I compared against five frames of the actual film (scratchpad `ref-jp/movie/8-12.png`) and found the following gaps:
- Labels were filled sans text; the film uses Hershey stroke lettering.
- Pedestals were paper-thin; the film's are thick boxes.
- The directory and file views were close-ups.
- Selecting a directory put a spotlight on it.
- The HUD path line and overview title were missing.

Changes:
- **Stroke lettering:** `HersheyText.tsx` and `hersheyFontData.ts` hold the futural and futuram fonts, copied from the `hersheytext` package (MIT). They draw with LineSegments2 and world-unit widths. Directory names are wide-spaced, the current directory's name is salmon, and child names run along the wires. The hovered wire is white and the wire into the current directory is salmon. `useLabelMaterial.ts` is removed.
- **Pedestal heights:** height is `clamp(0.5 + 0.1*sqrt(own file bytes), 0.8, 2.5)`, and 0.15 for a directory with no files.
- **Camera:** the directory view uses a 55° pitch, with the slab filling 60% of the free width. The file view uses a 46° pitch. Portrait root uses 40° and `GRID_LEVEL_GAP` 12.
- **Camera limits:** `cameraFloor()` keeps orbit and wheel zoom out of the geometry, and `zoomSpeed` is 2.5.
- **Spotlight:** it shows for files only. `CONE_HEIGHT` is 6 and the top ratio is 0.3.
- **HUD:**
  - `fsn-hover-path` is a bold white line at the top-left.
  - The stats line reads "N directories, M files".
  - The overview strip has a title bar and the current path.
- **Ground:** `#1c0a0c` (dark maroon).
- **Adversarial review:**
  - A drag that started on a pedestal or file counted as a click. `clickGuard.ts` now ignores releases that travelled more than 6 px, with a regression test.
  - Keyboard Enter re-opened a link that was already open; that is now guarded.
- **Left as is:**
  - Hover goes stale after a click until the pointer moves (an R3F raycast limit).
  - A wire label clips behind the overview strip.
  - Text is tiny on landscape phones.
  - The root's name "/" draws as a single stroke.

Tests: 75 passed, 19 skipped. Typecheck and lint are clean.

## 2026-11-13: File names stand up off the slab

The user pointed out that in the film (close-ups of Physical.Security, "Pharmaceutical" and "Chemical"), file names stand off the pedestal, nearly square to the camera. fsnav's `draw_node_text` (`vis.cc`) rotates labels `glRotatef(-50, 1, 0, 0)`, so they stand 40° off the ground and lean back toward their block. Ours lay flat.

- `FileBlock.tsx` now uses `NAME_TILT = -50°`. The anchor (the top of the first line) is lifted by `textHeight·cos(tilt)` so the text's bottom rests on the slab in front of the block.
- Directory names, wire labels and the current-directory name stay flat on the ground, as in the film (frame 8 "park"; frames 10 and 12 "Aviation / Personnel / Schedule").
- An adversarial check confirmed:
  - The tilt matches fsnav's mapping exactly.
  - Labels don't float, sink or clip.
  - Labels are still non-raycastable.
  - The framing allowance still covers them.
- Tests: 75 passed, 19 skipped.

## 2026-11-13: Selection spotlight matches the film

The user showed `bio.txt` (height 4, the tallest block) breaking out through the sides of the spotlight. The beam's rounded top was also visible.

The sources don't define the beam's geometry: fsnav has no spotlight, and fsn_jurassic_park only sets `spotlightColor`. I measured it from the film instead (the clip's frames at 0:50, 0:59 and 1:13, plus the user's screenshots).

**What the film shows**

| Feature | Measurement |
|---|---|
| Disk width | ≈1.8× the block width (308/168, 422/233, 518/285 px) |
| Disk colour | Warm cream, matching `#ffffe2` |
| Beam | A long frustum that always leaves the top of the 3D view; its top is never seen in file views |
| Taper | Apparent width at frame top ≈0.82 of the disk in close shots, ≈1.0 in the wide shot |
| Lean | Climbs toward the viewer's left at ≈0.13–0.19 px sideways per px up, with the disk centred under the flat block |
| Containment | The selected block is always fully inside the beam |

**What changed**

- New `spotlightGeometry.ts` holds:
  - `DISK_RADIUS_RATIO` 0.9;
  - `BEAM_APEX_HEIGHT` 21.5 and `BEAM_HEIGHT` 19 (top radius ratio 0.12);
  - `BEAM_LEAN` 0.1 toward world −x;
  - `SPOTLIGHT_COLOR` `#ffffe2`.
- **Aim:** the beam is aimed at the centre of the block's top face. A flat block's disk stays centred, as in the film. A tall block's disk shifts toward +x by height × 0.1, which keeps the whole block lit.
- **Rewritten `Spotlight.tsx`:**
  - The beam is a frustum sheared by the lean.
  - It keeps the screen-door stipple and solid silhouette edges, now in cream through `colorspace_fragment`.
  - The disk is a shader clipped to the parent slab's top, so a back-row block's disk never hangs over the edge.
  - The unused directory branches are removed.
- **Trade-offs:**
  - Our file-view camera looks down at 46°, steeper than the film's. Perspective therefore widens the beam toward the top on screen.
  - The taper is as strong as containment allows: at height 4 the beam clears `bio.txt`'s far corner by 0.05.
  - Result: ≈0.95 apparent on Pixel 7 and ≈1.05 on desktop, against the film's 0.82.
  - The lean measures 0.14 (desktop) and 0.18 (Pixel 7) on screen, inside the film's range.
- **Tests** (`fsn.spec.ts`, "fsn spotlight"):
  - Every block's corners stay inside the leaning beam at 21 sampled heights, in both layout modes.
  - In every file view the camera stays below the beam's top, so its rim is never on screen.

## 2026-11-13: File icons on the blocks

- **What the film shows:** at 0:44–0:47, each file block carries its desktop icon lying flat on its top face. The icons are drawn in flat colour, slightly overhang the block, and are mostly fanned pages for documents. A few are multicolour application icons.
- **Why we drew our own:** those are SGI IconSmith (`.fti`) artwork, and no free copy exists, so we drew original icons in the same spirit.
- **Colour:** each icon is drawn only in tints and shades of its block's colour, like the film's pale blue icons on blue blocks and pale green on green. Palettes are derived per block colour and cached.
- **Implementation:**
  - New `fileIcons.ts` draws three icons with the Canvas 2D API, cached as one texture per kind and block colour:
    - `document`: a fanned stack of pages, for names with an extension;
    - `link`: a page with a globe and an arrow, for `.lnk`;
    - `project`: a magenta carpet with a gear and a lightning bolt, for names without an extension.
  - `FileBlock.tsx` lays an icon plane on each block's top face. It is 1.12× the block width, unlit, cut out with alpha-test, and ignored by raycasting.
- **Tests:** a test in `fsn.spec.ts` ("fsn file icons") checks that every file in the tree maps to the right kind.
