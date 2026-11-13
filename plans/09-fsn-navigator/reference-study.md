# fsn reference study

Sources studied on 2026-11-12. They inform the design only. No code was copied: fsnav is GPLv3 and its bundled `courbd.ttf` is not ours to ship.

- **jtsiomb/fsnav** (2009): a C++/GLUT/OpenGL clone of SGI fsn.
- **unixmonkey/fsn_jurassic_park**: a real IRIX `fsn` `.Xdefaults` tuned to match the film, plus a script that generates the park directory tree.

## What original fsn actually does (from the `.Xdefaults` resources)

The `.Xdefaults` file repeats some keys. The values below are the last occurrence of each key, which is the one that wins.

| Behaviour | Resource(s) | Takeaway for us |
|---|---|---|
| **Labels are level-of-detail (LOD)** | `minFileTextZDistance 8`, `minFileTextXDistance 3`, `minDirTextZDistance 22`, `maxDisplayedFileName 16` | File names only appear once the camera is close. Directory names show from much further away. Long names are truncated to 16 characters. Unreadable file labels at the overview are authentic fsn behaviour. |
| Geometry LOD | `fileAsPlaneDistance 18`, `fileAsLineDistance 30`, `directoryAsCarpetDistance 35` | Far files flatten to planes, then lines. Far directories become flat "carpets". |
| File height = size | `heightPower 0.8`, `minFileHeight 0.2`, `maxFileHeight 15` | Height is roughly `clamp(size^0.8 · k, 0.2, 15)`. |
| Directory height = contents | `maxDirHeight 5` (the JP script makes big files "to get folders to appear a certain height") | Pedestal height reflects the total size of the files inside it. |
| **File colour = age** | `fileColor0..6`: #137bb1 #ff8400 #fffc00 #20ff4c #0047ff #a800ff #9a2667 | There are 7 age buckets (the script makes files 3 months old to land on green, `fileColor3`). Colour encodes how recent a file is, not its type. |
| **Faceted flat shading** | `colorTopValueFactor 0.6`, `colorSideValueFactor 0.43`, `colorBackValueFactor 0.34`, `colorShadowValueFactor 0.27` | Each face is the base hue at a fixed brightness. This is the signature SGI look. There is no real lighting. |
| Selection colour | `colorSelectValueFactor 1.0` / `SaturationFactor 0.82`, unselected 0.6 / 0.8 | Selected objects go to full brightness. Unselected ones are dimmed to 60%. |
| Sky | `topSkyColor #000000` → `bottomSkyColor #195e30`, `skyColor #77e1ff` | A vertical gradient from black overhead to dark green at the horizon. |
| Ground | `groundColor #000000` (also #3e8823 earlier in the file) | Black or very dark ground. |
| Wires | `unselLineColor #29ffa7`, `selLineColor #6e2213` | Mint-green links between directories. |
| Lights | `spotlightColor #cab8f6`, `searchlightColor #ffef5b` | A lavender spotlight on the selection and a yellow searchlight for search hits. |
| Camera | `viewAngle 600` (60.0° FOV), `initialTilt -700`, `initialY -37`, `initialZ 34`, `warpY -5`, `warpZ 3`, `zoomBack 4` | Angles are in tenths of a degree. Arriving at a directory parks the camera a fixed offset in front of it and above it. |
| Warp | `flashOnWarp`, `warpFlashColor #fff6ff` | An optional white flash when you jump to a directory. |
| Layout margins | `xDirMargin 2.58`, `yDirMargin 8`, `fileBaseWidth 0.37`, `fileMargin 0.25` | Directories sit close side by side but far apart in depth. Files are small, with tight margins. |

## What fsnav does (implementation ideas)

- **Layout:** a recursive "tidy tree".
  - `calc_bounds` sets each directory's width to `max(own footprint, Σ child widths)`.
  - `place` spreads the children in **one row**, `DIR_DIST` further back (−Z), centred under the parent.
  - Files sit in a `ceil(sqrt(n))` grid.
  - The pedestal footprint comes from that grid, with a minimum size.
- **Labels:**
  - Each label is rotated **−50° about X**, so it is tilted up toward the viewer rather than lying flat. That keeps it readable at oblique angles.
  - Directory labels are **5×** the file label size and sit in front of the pedestal's front edge.
  - File labels sit on top of the file block.
  - Labels are drawn with depth-write off, in post-order (children first), so the transparent text ends up back-to-front with no sorting.
- **Links:** straight lines from the parent's centre to the child's centre. They are brighter when selected.
- **Camera:**
  - It orbits a target, with theta, phi clamped to 5–90°, and a distance.
  - A double-click moves the target to the picked node with a 0.8 s linear lerp.
  - Left-drag orbits and right-drag zooms.
- **Picking:** on every mouse move, a ray is tested against the boxes. The hovered node is highlighted by swapping to a brighter colour.
- **File info HUD:**
  - Clicking a file, or holding Space while hovering one, shows a "scope" overlay next to it.
  - The overlay lists size, permissions, user, group, and accessed/modified/created times.
  - It is a 2D panel anchored to the file's projected screen position.
- **Colours:** directories are steel blue (0.26, 0.40, 0.65), files are dark red, and the ground is green. Basic GL lighting.

## Gaps vs our current FsnScene

1. **Labels:** ours lie flat. fsnav tilts them about 40° off the ground, and fsn uses distance LOD. Either one fixes the readability problem at the overview.
2. **Shading:** we use emissive/pulse shaders. fsn uses flat per-face value factors.
3. **File colour:** ours is by type (purple/cyan). fsn's is by age.
4. **Directory height:** ours is constant. fsn's scales with the total size of the contents.
5. **Info panel:** we have no file info card. fsn/fsnav show permissions, size and dates on hover or click.
6. **Clicks:** single-click navigates in ours. In fsnav, a single click selects and shows info, and a double-click warps.
7. **Sky:** ours is a blue gradient. The JP config is a black-to-dark-green gradient over black ground.
8. **Layout:** we use a 2x2 grid of child directories. fsn/fsnav use a single row behind the parent, which works because of LOD.

## fsv TreeV (fsv.sourceforge.net): the target look the user picked

The user's reaction to the fsn/fsnav pass was "it still doesn't match??". The target is fsv's **TreeV** view (screenshots 07–12 on fsv.sourceforge.net/screenshots).

- **Background:** pure black. No sky, no ground grid, no fog.
- **Directories:** thick neutral-grey slabs (about #8c8c8c) with flat shading. The top face is lighter and the sides are darker.
- **Files:** equal-footprint blocks in pale khaki/yellow (about #d8d890). Height is proportional to size.
  - Each **file name is printed on the block's top face**: dark, bold-italic, and scaled to fill the face.
  - That's why fsv stays readable at a distance while fsn doesn't. The label is as big as the block.
- **Subdirectories on the parent pedestal:**
  - A collapsed subdirectory shows as a tall grey block whose height reflects its total size.
  - An expanded subdirectory leaves an "X" placeholder square on the parent.
- **Directory names:** huge, white, bold-italic, lying **flat on the ground in front of** the pedestal. They are as wide as the pedestal and straddle the link ribbon.
- **Links:** wide, flat **dark-red (#600000) ribbons on the ground**, not thin lines.
  - The trunk runs from the parent's back edge to a crossbar, which branches into a ribbon to each child.
  - Each child's ribbon continues under its name label into the pedestal front.
  - In the full radial layout the crossbars are concentric arcs.
- **Layout:** concentric/radial. The root is near the centre and each deeper level sits on a larger arc. A small tree reads locally as "children in a row behind the parent, on a gentle arc".
- **Selection:** white 3D **corner brackets** (L-shaped ticks at the bounding-box corners, partly dashed) around the selected node. No spotlight.
- **Camera:** low and close behind the node, pitched about 30–40° down, looking across the platform toward the children. A "bird's-eye" button flies up for an aerial view.
- **UI:** a 2D directory tree and file list pane sits beside the 3D view. Our terminal panel and breadcrumb fill this role.

## unixmonkey/fsn_jurassic_park O2 recreation: the target look (pass Q)

The user moved the target from fsv TreeV back to the Jurassic Park fsn, using the O2 recreation linked from the repo's README (YouTube `Dccx-cLUWIQ`) as the visual reference. The repo holds two files: `.Xdefaults`, where the last value of each resource wins, and a ksh script that builds the movie's `park/` tree (Zoology/Physical.Security/... with 2–8 KB files and some files back-dated three months so they show green).

What the frame shows. Where the README says the monitor shifted colours, the frame wins over the hex values:
- **Ground and sky:** black ground running to the horizon. Above it a sky gradient goes from bright mint at the horizon to black about 15° up (`bottomSkyColor #195e30`, `topSkyColor #000`).
- **Pedestals:** thin rose/pink slabs (`dirColor #ff0000` × unselect sat 0.8, value 0.6). The top face is the brightest.
- **Files:** cyan blocks with square bases. Height ∝ size^0.8 (`heightPower 0.8`).
- **Labels:** file names lie flat on the pedestal top, in front of each block, in thin pale type. Directory names lie flat on the ground in front of each pedestal, in widely spaced mint type.
- **Wires:** thin mint lines (`unselLineColor #29ffa7`) fan out from a parent's back edge to each child's front.
- **Selection:** a stippled (screen-door) white cone comes down from above, with a bright white disk under the selected node.
- **Camera:** 60° FOV (`viewAngle 600`), pitched about 20° below horizontal (`initialTilt`/`warpTilt -700`). The camera is low and looks along the tree, with the green horizon band visible.
- **HUD:**
  - The IRIX header has menus (Session/Show/Display/Directory/File), the title "Fsn: a 3D File System Navigator", an inset path field, and a stat line (`-rw-r--r-- 2 bytes, 0 days old, unknown type`).
  - The overview window along the bottom draws the whole tree as a mint 2D silhouette.
- **Kept from earlier passes for this site:**
  - the content tree (`fsTree.ts`), not the `park/` tree
  - the portrait grid mode
  - names wrapping onto two lines instead of fsn's 16-character cut (`maxDisplayedFileName 16`)
  - all labels always visible (no level-of-detail fade), because readability from the overview was the user's earlier complaint
