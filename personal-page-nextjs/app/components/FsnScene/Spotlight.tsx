'use client'

import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { FILE_BLOCK_SIZE } from './fsnLayout'
import type { Layout } from './fsnLayout'
import {
  BEAM_HEIGHT,
  BEAM_LEAN,
  SPOTLIGHT_COLOR,
  TOP_RADIUS_RATIO,
  beamAxisOffsetAt,
  diskRadius,
} from './spotlightGeometry'

const DISK_LIFT = 0.03
const DISK_OPACITY = 0.9
const BEAM_OPACITY = 0.9
const EDGE_WIDTH = 0.16 // |normal . view| below this is a solid silhouette edge
const SEGMENTS = 64
const RADIUS = diskRadius(FILE_BLOCK_SIZE) // every file block has the same square footprint

// SGI screen-door transparency: only one pixel in every 2x2 block kept (25%), with solid
// silhouette edges where the surface turns away from the viewer
const BEAM_VERTEX_SHADER = `
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  void main() {
    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vViewPosition = viewPosition.xyz;
    gl_Position = projectionMatrix * viewPosition;
  }
`
const BEAM_FRAGMENT_SHADER = `
  uniform vec3 uColor;
  uniform float uOpacity;
  uniform float uEdgeWidth;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  void main() {
    float facing = abs(dot(normalize(vNormal), normalize(-vViewPosition)));
    if (facing < uEdgeWidth) {
      gl_FragColor = vec4(uColor, 1.0);
    } else {
      vec2 block = floor(gl_FragCoord.xy);
      if (mod(block.x, 2.0) > 0.5 || mod(block.y, 2.0) > 0.5) discard;
      gl_FragColor = vec4(uColor, uOpacity);
    }
    #include <colorspace_fragment>
  }
`

// The disk is the light landing on the pedestal, so it is cut off at the pedestal's edges
const DISK_VERTEX_SHADER = `
  varying vec2 vWorldXZ;
  void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldXZ = worldPosition.xz;
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`
const DISK_FRAGMENT_SHADER = `
  uniform vec3 uColor;
  uniform float uOpacity;
  uniform vec4 uBounds; // pedestal top: min x, max x, min z, max z
  varying vec2 vWorldXZ;
  void main() {
    if (vWorldXZ.x < uBounds.x || vWorldXZ.x > uBounds.y || vWorldXZ.y < uBounds.z || vWorldXZ.y > uBounds.w) discard;
    gl_FragColor = vec4(uColor, uOpacity);
    #include <colorspace_fragment>
  }
`

// An open frustum standing on y = 0, sheared so that it climbs toward -x (BEAM_LEAN). Its
// horizontal cross-sections stay circles, so its foot matches the disk exactly.
function createBeamGeometry(radius: number): THREE.BufferGeometry {
  const geometry = new THREE.CylinderGeometry(radius * TOP_RADIUS_RATIO, radius, BEAM_HEIGHT, SEGMENTS, 1, true)
  geometry.translate(0, BEAM_HEIGHT / 2, 0)
  // x += -BEAM_LEAN * y (applyMatrix4 also carries the normals through the shear)
  geometry.applyMatrix4(new THREE.Matrix4().set(1, -BEAM_LEAN, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1))
  return geometry
}

// fsn's selection: a shaft of light falling from high above onto a bright disk around the
// selected file. The beam is hidden in the bird's-eye view, where it would smear across the map.
export default function Spotlight({
  layout,
  targetPath,
  showCone = true,
}: {
  layout: Layout
  targetPath: string
  showCone?: boolean
}) {
  const beamMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: BEAM_VERTEX_SHADER,
        fragmentShader: BEAM_FRAGMENT_SHADER,
        uniforms: {
          uColor: { value: new THREE.Color(SPOTLIGHT_COLOR) },
          uOpacity: { value: BEAM_OPACITY },
          uEdgeWidth: { value: EDGE_WIDTH },
        },
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    [],
  )
  const diskMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: DISK_VERTEX_SHADER,
        fragmentShader: DISK_FRAGMENT_SHADER,
        uniforms: {
          uColor: { value: new THREE.Color(SPOTLIGHT_COLOR) },
          uOpacity: { value: DISK_OPACITY },
          uBounds: { value: new THREE.Vector4() },
        },
        transparent: true,
        depthWrite: false,
      }),
    [],
  )
  useEffect(
    () => () => {
      beamMaterial.dispose()
      diskMaterial.dispose()
    },
    [beamMaterial, diskMaterial],
  )

  const entry = layout.get(targetPath)
  const pedestal = entry ? layout.get(entry.parentPath) : undefined
  const beamGeometry = useMemo(() => createBeamGeometry(RADIUS), [])
  useEffect(() => () => beamGeometry.dispose(), [beamGeometry])
  useEffect(() => {
    if (!pedestal) return
    const [pedestalX, , pedestalZ] = pedestal.position
    diskMaterial.uniforms.uBounds.value.set(
      pedestalX - pedestal.width / 2,
      pedestalX + pedestal.width / 2,
      pedestalZ - pedestal.depth / 2,
      pedestalZ + pedestal.depth / 2,
    )
  }, [diskMaterial, pedestal])

  if (!entry || entry.kind !== 'file' || !pedestal) return null
  const [centerX, , centerZ] = entry.position
  const surface = pedestal.position[1] + pedestal.height / 2
  // the beam is aimed at the centre of the block's top face; this is where its foot lands
  const footX = centerX + beamAxisOffsetAt(entry.height, 0)

  return (
    <group position={[footX, surface, centerZ]}>
      {showCone && (
        <mesh geometry={beamGeometry} material={beamMaterial} renderOrder={1} raycast={() => null} />
      )}
      <mesh
        position={[0, DISK_LIFT, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        material={diskMaterial}
        renderOrder={1}
        raycast={() => null}
      >
        <circleGeometry args={[RADIUS, SEGMENTS]} />
      </mesh>
    </group>
  )
}
