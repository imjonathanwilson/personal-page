// Shape of fsn's selection spotlight, measured from the film (Jurassic Park, the fsn scene):
// - the lit disk on the pedestal is about 1.8 times as wide as the selected block
// - the beam is a long, gently narrowing shaft that leaves the top of the view: its top is
//   never seen in the film's file views, so it rises above the camera
// - the beam leans: it climbs toward the viewer's left (world -x, as fsn's camera faces -z),
//   as if the light hung up and to the left of the selection
// - the selected block always stands fully inside the beam, however tall the block is

export const SPOTLIGHT_COLOR = '#ffffe2' // fsn's spotlightColor (unixmonkey/fsn_jurassic_park .Xdefaults), warm cream in the film
export const DISK_RADIUS_RATIO = 0.9 // of the block's width: the disk is 1.8 block widths across
// The beam's sides converge on a point this far above the pedestal, and the beam stops at
// BEAM_HEIGHT, where it is TOP_RADIUS_RATIO of the disk's radius (fsn draws a flat-topped
// frustum). The top clears every file-view camera, so its rim stays out of sight.
export const BEAM_APEX_HEIGHT = 21.5
export const BEAM_HEIGHT = 19
export const TOP_RADIUS_RATIO = 1 - BEAM_HEIGHT / BEAM_APEX_HEIGHT
// Sideways drift of the beam's axis toward -x per unit of height. The beam is aimed at the
// centre of the block's top face, so a flat block's disk sits centred under it (as in the film)
// and a tall block's disk shifts a little toward +x, keeping the whole block in the light.
export const BEAM_LEAN = 0.1

export function diskRadius(blockWidth: number): number {
  return blockWidth * DISK_RADIUS_RATIO
}

// Radius of the beam at a height above the pedestal top
export function beamRadiusAt(blockWidth: number, height: number): number {
  return diskRadius(blockWidth) * (1 - height / BEAM_APEX_HEIGHT)
}

// x offset of the beam's axis from the block's centre at a height above the pedestal top
export function beamAxisOffsetAt(blockHeight: number, height: number): number {
  return (blockHeight - height) * BEAM_LEAN
}
