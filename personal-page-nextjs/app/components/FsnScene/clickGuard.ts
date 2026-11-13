import type { ThreeEvent } from '@react-three/fiber'

// R3F reports `delta`, the pixels the pointer travelled between pointerdown and click. A press that
// orbits the camera (mouse drag or touch rotate) ends in a click on whatever lies under the pointer;
// it is not a selection.
const MAX_CLICK_TRAVEL = 6 // pixels

export function isDragRelease(event: ThreeEvent<MouseEvent>): boolean {
  return event.delta > MAX_CLICK_TRAVEL
}
