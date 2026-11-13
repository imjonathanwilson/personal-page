'use client'

import { useEffect, useMemo } from 'react'
import * as THREE from 'three'

const GROUND_SIZE = 12000 // reaches the horizon from anywhere in the scene
const DOME_RADIUS = 5000
const GROUND_COLOR = '#1c0a0c' // the movie's ground is a very dark maroon, not black
export const CAMERA_FAR = 6000

// Colours are written as sRGB straight into the shader (no colour-space conversion), so they
// appear exactly as specified.
const VERTEX_SHADER = `
  varying vec3 vWorldPosition;
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorldPosition = world.xyz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`
// Brightest exactly at the horizon, easing out through dark green to black over the first 8 degrees
const FRAGMENT_SHADER = `
  varying vec3 vWorldPosition;
  const vec3 HORIZON = vec3(0.247, 0.863, 0.612);
  const vec3 DARK = vec3(0.03, 0.2, 0.1);
  void main() {
    vec3 direction = normalize(vWorldPosition - cameraPosition);
    float elevation = degrees(asin(clamp(direction.y, -1.0, 1.0)));
    float progress = clamp(elevation / 8.0, 0.0, 1.0);
    vec3 color = mix(DARK, HORIZON, pow(1.0 - progress, 2.2));
    color *= 1.0 - smoothstep(0.55, 1.0, progress);
    gl_FragColor = vec4(color, 1.0);
  }
`

// A very dark maroon ground plane out to the horizon under a sky dome that glows green at the horizon
export default function Sky() {
  const skyMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: VERTEX_SHADER,
        fragmentShader: FRAGMENT_SHADER,
        side: THREE.BackSide,
        depthWrite: false,
        depthTest: false,
        fog: false,
        toneMapped: false,
      }),
    [],
  )
  const groundMaterial = useMemo(() => new THREE.MeshBasicMaterial({ color: GROUND_COLOR, fog: false, depthWrite: false }), [])
  useEffect(
    () => () => {
      skyMaterial.dispose()
      groundMaterial.dispose()
    },
    [skyMaterial, groundMaterial],
  )

  return (
    <>
      <mesh material={skyMaterial} renderOrder={-10} raycast={() => null} frustumCulled={false}>
        <sphereGeometry args={[DOME_RADIUS, 32, 16]} />
      </mesh>
      <mesh material={groundMaterial} rotation={[-Math.PI / 2, 0, 0]} renderOrder={-1} raycast={() => null}>
        <planeGeometry args={[GROUND_SIZE, GROUND_SIZE]} />
      </mesh>
    </>
  )
}
