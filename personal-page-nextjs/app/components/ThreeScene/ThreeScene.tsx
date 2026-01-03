'use client';

/**
 * ThreeScene Component
 * Three.js visualization background with 64 animated blocks
 * Custom GLSL shaders and dramatic lighting for visual parity
 * Author: Bob (Phase 4 - Three.js Integration)
 * Date: 2026-01-02
 * Step 3: Lighting System Implementation
 */

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import styles from './ThreeScene.module.css';

export default function ThreeScene() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log('[ThreeScene] Component mounted, starting initialization...');
    if (!containerRef.current) {
      console.error('[ThreeScene] containerRef.current is null!');
      return;
    }
    console.log('[ThreeScene] Container ref found, creating scene...');

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000); // Black background
    console.log('[ThreeScene] Scene created successfully');

    // Camera setup (FOV: 50, aspect ratio, near: 0.1, far: 1000)
    const aspect = window.innerWidth / window.innerHeight;
    const camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 1000);
    camera.position.set(0, 18, 40);
    camera.lookAt(0, 0, -4);

    // Renderer setup
    console.log('[ThreeScene] Creating WebGL renderer...');
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    console.log('[ThreeScene] Appending canvas to container...');
    containerRef.current.appendChild(renderer.domElement);
    console.log('[ThreeScene] Canvas appended! WebGL should be visible now.');
    console.log('[ThreeScene] Canvas size:', renderer.domElement.width, 'x', renderer.domElement.height);
    console.log('[ThreeScene] Camera position:', camera.position);
    console.log('[ThreeScene] Camera lookAt: (0, 0, -4)');

    // Vertex Shader (shared by both materials)
    // Calculates vNormal and vPosition for fragment shader
    const vertexShader = `
      varying vec3 vNormal;
      varying vec3 vPosition;

      void main() {
        vNormal = normalize(normalMatrix * normal);
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    // Standard Fragment Shader (for directory blocks)
    // Brightness: 0.4 + 0.1 * sin(time * 0.5 + vPosition.x * 2.0)
    // Green: 0.5 * brightness
    // Rim: 0.3 * rim (power: 2.0)
    // Pulse: 0.8 + 0.2 * sin(time * 1.5)
    // Alpha: 0.8
    const standardFragmentShader = `
      uniform float time;
      varying vec3 vNormal;
      varying vec3 vPosition;

      void main() {
        // View direction for rim lighting
        vec3 viewDirection = normalize(cameraPosition - vPosition);

        // Brightness oscillation (varies by position for wave effect)
        float brightness = 0.4 + 0.1 * sin(time * 0.5 + vPosition.x * 2.0);

        // Base color (green component based on brightness)
        vec3 color = vec3(0.0, 0.5 * brightness, 0.0);

        // Rim lighting calculation (power: 2.0)
        float rim = 1.0 - abs(dot(vNormal, viewDirection));
        rim = pow(rim, 2.0);
        color += vec3(0.0, 0.3 * rim, 0.0);

        // Pulsing effect (amplitude: 0.2, range: 0.8 to 1.0)
        float pulse = 0.8 + 0.2 * sin(time * 1.5);
        color *= pulse;

        // Alpha: 0.8 (semi-transparent)
        gl_FragColor = vec4(color, 0.8);
      }
    `;

    // Highlighted Fragment Shader (for "proxy" block)
    // Brightness: 0.7 + 0.1 * sin(time * 0.5 + vPosition.x * 2.0)
    // Green: 0.9 * brightness, Blue: 0.2
    // Enhanced rim: 0.4 * rim + 0.1 blue (power: 1.5)
    // Pulse: 1.0 + 0.1 * sin(time * 1.5)
    // Alpha: 1.0
    const highlightedFragmentShader = `
      uniform float time;
      varying vec3 vNormal;
      varying vec3 vPosition;

      void main() {
        // View direction for rim lighting
        vec3 viewDirection = normalize(cameraPosition - vPosition);

        // Brighter base brightness (0.7 vs 0.4 for standard)
        float brightness = 0.7 + 0.1 * sin(time * 0.5 + vPosition.x * 2.0);

        // Brighter green with blue tint (0.9 vs 0.5, plus 0.2 blue)
        vec3 color = vec3(0.0, 0.9 * brightness, 0.2);

        // Enhanced rim lighting (power: 1.5, more pronounced)
        float rim = 1.0 - abs(dot(vNormal, viewDirection));
        rim = pow(rim, 1.5);
        color += vec3(0.0, 0.4 * rim, 0.1);

        // Subtle pulsing (amplitude: 0.1, range: 1.0 to 1.1)
        float pulse = 1.0 + 0.1 * sin(time * 1.5);
        color *= pulse;

        // Alpha: 1.0 (fully opaque)
        gl_FragColor = vec4(color, 1.0);
      }
    `;

    // Create ShaderMaterial instances
    const standardMaterial = new THREE.ShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: standardFragmentShader,
      uniforms: {
        time: { value: 0.0 }
      },
      transparent: true,
      side: THREE.DoubleSide
    });

    const highlightedMaterial = new THREE.ShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: highlightedFragmentShader,
      uniforms: {
        time: { value: 0.0 }
      },
      transparent: true,
      side: THREE.DoubleSide
    });

    // Block geometries
    const standardGeometry = new THREE.BoxGeometry(2.5, 0.5, 2.5);
    const rootGeometry = new THREE.BoxGeometry(2.5, 2.5, 2.5);
    const highlightedGeometry = new THREE.BoxGeometry(2.5, 1.75, 2.5);

    // Generate 64 blocks (1 root + 63 directories) in 7x9 grid
    const blocks: THREE.Mesh[] = [];

    // Grid ranges
    const xPositions = [-16, -12, -8, -4, 0, 4, 8, 12, 16]; // 9 columns
    const zPositions = [-4, 0, 4, 8, 12, 16, 20]; // 7 rows

    // Root block at (0, 1.25, 8) - centered in grid row 4 (baseline specification)
    const rootBlock = new THREE.Mesh(rootGeometry, standardMaterial);
    rootBlock.position.set(0, 1.25, 8);
    scene.add(rootBlock);
    blocks.push(rootBlock);

    // Tall highlighted blocks (use highlightedGeometry but standard shader)
    const tallBlocks = [
      { x: -8, z: -4 }, // proc - Row 1
      { x: 8, z: 0 },   // backup - Row 2
      { x: -4, z: 12 }, // mysql - Row 5
      { x: 16, z: 12 }  // ssh - Row 5
    ];

    // Directory blocks - 63 blocks (7 rows × 9 columns, minus root position)
    for (let row = 0; row < zPositions.length; row++) {
      for (let col = 0; col < xPositions.length; col++) {
        const x = xPositions[col];
        const z = zPositions[row];

        // Skip root position (0, 8)
        if (x === 0 && z === 8) continue;

        // Check if this is a tall block
        const isTall = tallBlocks.some(tb => tb.x === x && tb.z === z);

        // "proxy" directory at (-8, 1.25, 8) uses highlighted shader with standard dimensions
        const isProxy = (x === -8 && z === 8);
        const material = isProxy ? highlightedMaterial : standardMaterial;
        const geometry = isTall ? highlightedGeometry : standardGeometry;
        const y = isTall ? 1.875 : 1.25; // Tall blocks at 1.875, standard at 1.25

        const block = new THREE.Mesh(geometry, material);
        block.position.set(x, y, z);
        scene.add(block);
        blocks.push(block);
      }
    }

    // Verify block count (should be 64)
    console.log(`[Bob] ThreeScene Step 3: Generated ${blocks.length} blocks with custom shaders (expected: 64)`);
    console.log('[ThreeScene] First block position:', blocks[0].position);
    console.log('[ThreeScene] Root block at (0, 1.25, 8), directories in grid from (-16, -4) to (16, 20)');

    // Lighting System - Creates dramatic atmosphere and highlights "proxy" block

    // 1. Ambient Light - Dark green base lighting (#003300, intensity: 0.8)
    const ambientLight = new THREE.AmbientLight(0x003300, 0.8);
    scene.add(ambientLight);

    // 2. Directional Light - Green-cyan from above right (#00aa66, intensity: 1.0)
    const directionalLight = new THREE.DirectionalLight(0x00aa66, 1.0);
    directionalLight.position.set(5, 10, 7);
    scene.add(directionalLight);

    // 3. Point Light - Bright green-cyan point source (#00cc66, intensity: 1.0)
    const pointLight = new THREE.PointLight(0x00cc66, 1.0, 20); // distance: 20
    pointLight.position.set(-5, 8, 5);
    scene.add(pointLight);

    // 4. Spotlight - Very bright green, targets "proxy" block (#00ff66, intensity: 5.0)
    const spotlight = new THREE.SpotLight(0x00ff66, 5.0);
    spotlight.position.set(-8, 20, 10);
    spotlight.target.position.set(-8, 0, 8); // Target "proxy" block position
    spotlight.angle = Math.PI / 4; // 45 degrees
    spotlight.penumbra = 0.5;
    spotlight.decay = 1.0;
    spotlight.distance = 50;
    scene.add(spotlight);
    scene.add(spotlight.target); // Must add target to scene

    // Visual Effects - Light beam and ground circle indicators

    // 5. Light Beam - Cylinder from spotlight to target (opacity: 0.2)
    const beamHeight = 20; // From y=20 to y=0
    const beamGeometry = new THREE.CylinderGeometry(2, 2, beamHeight, 16); // Match original: 16 segments
    const beamMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ff66,
      transparent: true,
      opacity: 0.2,
      wireframe: false // Match original exactly
    });
    const lightBeam = new THREE.Mesh(beamGeometry, beamMaterial);
    lightBeam.position.set(-8, 10, 9); // Midpoint between spotlight and target

    // Calculate direction vector from spotlight to target and rotate beam accordingly
    const spotPos = new THREE.Vector3(-8, 20, 10);
    const targetPos = new THREE.Vector3(-8, 0, 8);
    const direction = new THREE.Vector3().subVectors(targetPos, spotPos).normalize();

    // Point beam in that direction (beam points along Y axis by default)
    const axis = new THREE.Vector3(0, 1, 0);
    const quaternion = new THREE.Quaternion().setFromUnitVectors(axis, direction);
    lightBeam.setRotationFromQuaternion(quaternion);

    scene.add(lightBeam);

    // 6. Ground Circle - Filled circle at spotlight target (opacity: 0.3)
    const circleGeometry = new THREE.CircleGeometry(2.5, 32); // Filled circle with radius 2.5
    const circleMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ff66,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide
    });
    const groundCircle = new THREE.Mesh(circleGeometry, circleMaterial);
    groundCircle.rotation.x = -Math.PI / 2; // Lie flat on ground
    groundCircle.position.set(-8, 0.1, 8); // Just above ground, at "proxy" position
    scene.add(groundCircle);

    // 7. Floor Grid - GridHelper (50 units, 15 divisions, colors: #006600 major, #004400 minor)
    const gridSize = 50;
    const gridDivisions = 15;
    const gridColorCenter = 0x006600; // Major lines (dark green)
    const gridColorGrid = 0x004400;   // Minor lines (darker green)
    const grid = new THREE.GridHelper(gridSize, gridDivisions, gridColorCenter, gridColorGrid);
    grid.position.y = -1; // Position at y=-1
    grid.position.z = 10; // Centered in scene (z from -4 to 20, midpoint ~10)
    scene.add(grid);

    // Handle window resize
    function handleResize() {
      const aspect = window.innerWidth / window.innerHeight;
      camera.aspect = aspect;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }
    window.addEventListener('resize', handleResize);

    // Animation loop with shader time increment
    let frameCount = 0;
    function animate() {
      requestAnimationFrame(animate);

      // Increment shader time (0.01 per frame)
      standardMaterial.uniforms.time.value += 0.01;
      highlightedMaterial.uniforms.time.value += 0.01;

      renderer.render(scene, camera);

      // Log every 60 frames to confirm rendering
      frameCount++;
      if (frameCount === 60) {
        console.log('[ThreeScene] Animation running, scene has', scene.children.length, 'objects');
        frameCount = 0;
      }
    }
    console.log('[ThreeScene] Starting animation loop...');
    animate();

    // Cleanup on unmount
    return () => {
      window.removeEventListener('resize', handleResize);

      // Dispose geometries
      standardGeometry.dispose();
      rootGeometry.dispose();
      highlightedGeometry.dispose();

      // Dispose materials
      standardMaterial.dispose();
      highlightedMaterial.dispose();
      beamMaterial.dispose();
      circleMaterial.dispose();

      // Dispose blocks
      blocks.forEach(block => {
        scene.remove(block);
      });

      // Dispose lights
      scene.remove(ambientLight);
      scene.remove(directionalLight);
      scene.remove(pointLight);
      scene.remove(spotlight);
      scene.remove(spotlight.target);

      // Dispose visual effects
      beamGeometry.dispose();
      circleGeometry.dispose();
      scene.remove(lightBeam);
      scene.remove(groundCircle);

      // Dispose grid
      scene.remove(grid);
      grid.geometry.dispose();
      (grid.material as THREE.Material).dispose();

      // Dispose renderer
      renderer.dispose();

      // Remove canvas
      if (containerRef.current && renderer.domElement.parentNode === containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={containerRef} className={styles.container} />;
}
