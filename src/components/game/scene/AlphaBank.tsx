'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

import { seededRandom } from '@/game/math/vec';
import type { LightSample, Rgb } from '@/game/light/pondLight';
import { TUNING } from '@/game/tuning/tuning';
import { createBankTexture, createTreelineLayer } from '@/components/game/scene/textures';
import type { Runtime } from '@/components/game/types';

// A2 — the bank (23_ALPHA_CANON §10, reference photo 01). Every piece is one
// draw call, built once, and animated in the shader from a shared clock; no
// per-frame allocation and no per-instance matrix rewrites.

type LightRef = React.MutableRefObject<LightSample>;
type RuntimeRef = React.MutableRefObject<Runtime>;

const B = TUNING.bank;

// The bank plane rises from the water's edge (edgeZ, y=0) to (edgeZ+2, y=1),
// as the v0.4 Foreshore did; ground height on it at a given z.
export function bankHeightAt(z: number): number {
  return THREE.MathUtils.clamp((z - B.edgeZ) / 2, 0, 1);
}

// Shared GLSL value noise for the bank materials.
const NOISE_GLSL = `
  float bankHash(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }
  float bankNoise(vec3 x) {
    vec3 i = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix(bankHash(i + vec3(0, 0, 0)), bankHash(i + vec3(1, 0, 0)), f.x),
                   mix(bankHash(i + vec3(0, 1, 0)), bankHash(i + vec3(1, 1, 0)), f.x), f.y),
               mix(mix(bankHash(i + vec3(0, 0, 1)), bankHash(i + vec3(1, 0, 1)), f.x),
                   mix(bankHash(i + vec3(0, 1, 1)), bankHash(i + vec3(1, 1, 1)), f.x), f.y), f.z);
  }
`;

// One clock for every swaying thing, held still while the pond is frozen.
function useBankClock(runtime: RuntimeRef) {
  const clock = useMemo(() => ({ value: 0 }), []);
  useFrame((_, dt) => {
    if (!runtime.current.pondFrozen) clock.value += Math.min(dt, TUNING.timing.maxFrameDtSeconds);
  });
  return clock;
}

// ---------------------------------------------------------------- stones

function createStoneGeometry(): THREE.BufferGeometry {
  // A lumpy, rounded boulder: a subdivided icosahedron pushed in and out by
  // smooth low-frequency bumps, flattened underneath, normals smoothed.
  let geometry: THREE.BufferGeometry = new THREE.IcosahedronGeometry(1, 2);
  geometry.deleteAttribute('normal');
  geometry.deleteAttribute('uv');
  geometry = mergeVertices(geometry);
  const position = geometry.getAttribute('position') as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  for (let i = 0; i < position.count; i += 1) {
    v.fromBufferAttribute(position, i);
    const bump = 1
      + 0.13 * Math.sin(v.x * 2.3 + v.y * 1.1)
      + 0.09 * Math.sin(v.z * 3.1 - v.x * 1.7)
      + 0.05 * Math.sin(v.y * 5.3 + v.z * 2.9);
    v.multiplyScalar(bump);
    v.y = Math.max(v.y, -0.35);
    position.setXYZ(i, v.x, v.y, v.z);
  }
  geometry.computeVertexNormals();
  return geometry;
}

export function BankStones() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const geometry = useMemo(() => createStoneGeometry(), []);
  const material = useMemo(() => {
    const m = new THREE.MeshStandardMaterial({ roughness: 0.94, metalness: 0 });
    m.onBeforeCompile = (shader) => {
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', '#include <common>\nvarying vec3 vStoneWorld;\nvarying float vStoneUp;')
        .replace(
          '#include <begin_vertex>',
          `#include <begin_vertex>
          vec4 stoneWorld = modelMatrix * instanceMatrix * vec4(position, 1.0);
          vStoneWorld = stoneWorld.xyz;
          vStoneUp = normalize(mat3(modelMatrix) * mat3(instanceMatrix) * normal).y;`
        );
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', `#include <common>\nvarying vec3 vStoneWorld;\nvarying float vStoneUp;\n${NOISE_GLSL}`)
        .replace(
          '#include <color_fragment>',
          `#include <color_fragment>
          // Lichen as fine flecks and a few small patches, not polka dots.
          float lichen = smoothstep(0.7, 0.82, bankNoise(vStoneWorld * 34.0)) * 0.55
                       + smoothstep(0.74, 0.86, bankNoise(vStoneWorld * 14.0 + 4.0)) * 0.3;
          diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.64, 0.63, 0.57), clamp(lichen, 0.0, 0.6));
          float moss = smoothstep(0.35, 0.85, vStoneUp) * smoothstep(0.35, 0.65, bankNoise(vStoneWorld * 5.0 + 9.0));
          diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.3, 0.4, 0.2), moss * 0.75);
          // Wet and darker where the stone meets the water.
          float wet = 1.0 - smoothstep(-0.02, 0.07, vStoneWorld.y);
          diffuseColor.rgb *= 1.0 - wet * 0.5;`
        );
    };
    m.customProgramCacheKey = () => 'a2-bank-stone';
    return m;
  }, []);

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const rng = seededRandom('a2-stones');
    const matrix = new THREE.Matrix4();
    const quat = new THREE.Quaternion();
    const euler = new THREE.Euler();
    const pos = new THREE.Vector3();
    const scale = new THREE.Vector3();
    const color = new THREE.Color();
    const step = (B.stoneSpanX * 2) / B.stoneCount;
    for (let i = 0; i < B.stoneCount; i += 1) {
      const sx = THREE.MathUtils.lerp(B.stoneWidthMin, B.stoneWidthMax, rng());
      const sy = THREE.MathUtils.lerp(B.stoneHeightMin, B.stoneHeightMax, rng());
      const sz = THREE.MathUtils.lerp(B.stoneDepthMin, B.stoneDepthMax, rng());
      const x = -B.stoneSpanX + step * (i + 0.5) + (rng() - 0.5) * step * 0.5;
      const z = B.edgeZ + B.stoneEdgeOffsetZ + (rng() - 0.5) * 2 * B.stoneEdgeJitterZ;
      // Seat each stone into the ground (or the water) a little below its middle.
      pos.set(x, Math.max(bankHeightAt(z), 0) + sy * 0.25, z);
      euler.set((rng() - 0.5) * 0.4, rng() * Math.PI * 2, (rng() - 0.5) * 0.3);
      quat.setFromEuler(euler);
      scale.set(sx, sy, sz);
      matrix.compose(pos, quat, scale);
      mesh.setMatrixAt(i, matrix);
      const grey = 0.36 + rng() * 0.14;
      color.setRGB(grey, grey * (0.97 + rng() * 0.03), grey * (0.9 + rng() * 0.06), THREE.SRGBColorSpace);
      mesh.setColorAt(i, color);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, []);

  return <instancedMesh ref={meshRef} args={[geometry, material, B.stoneCount]} renderOrder={2} frustumCulled={false} />;
}

// ---------------------------------------------------------------- weeds and reeds

function createBladeTuft(blades: number, seed: string, width: number): THREE.BufferGeometry {
  // A tuft of single-triangle blades fanned from one root, unit height,
  // with a dark-base / light-tip vertex colour gradient.
  const rng = seededRandom(seed);
  const positions: number[] = [];
  const colors: number[] = [];
  for (let b = 0; b < blades; b += 1) {
    const a = rng() * Math.PI * 2;
    const lean = 0.15 + rng() * 0.3;
    const h = 0.6 + rng() * 0.4;
    const dx = Math.cos(a);
    const dz = Math.sin(a);
    const px = -dz * width;
    const pz = dx * width;
    positions.push(-px, 0, -pz, px, 0, pz, dx * lean, h, dz * lean);
    colors.push(0.27, 0.35, 0.19, 0.27, 0.35, 0.19, 0.6, 0.72, 0.4);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.computeVertexNormals();
  return geometry;
}

function swayMaterial(clock: { value: number }, amplitude: number, key: string): THREE.MeshStandardMaterial {
  const m = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.9, side: THREE.DoubleSide });
  m.onBeforeCompile = (shader) => {
    shader.uniforms.uBankTime = clock;
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nuniform float uBankTime;')
      .replace(
        '#include <begin_vertex>',
        // Phase from the instance's position so nothing sways in lockstep;
        // amplitude grows with height so roots stay planted.
        `#include <begin_vertex>
        float swayPhase = instanceMatrix[3].x * 2.1 + instanceMatrix[3].z * 1.7;
        float sway = sin(uBankTime * 1.3 + swayPhase) + 0.4 * sin(uBankTime * 2.9 + swayPhase * 1.9);
        transformed.x += sway * position.y * position.y * ${amplitude.toFixed(3)};
        transformed.z += 0.5 * sway * position.y * position.y * ${(amplitude * 0.5).toFixed(3)};`
      );
  };
  m.customProgramCacheKey = () => key;
  return m;
}

export function BankWeeds({ runtime }: { runtime: RuntimeRef }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const clock = useBankClock(runtime);
  const geometry = useMemo(() => createBladeTuft(B.weedBladeCount, 'a2-weed-tuft', 0.035), []);
  const material = useMemo(() => swayMaterial(clock, B.weedSway, 'a2-bank-weed'), [clock]);

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const rng = seededRandom('a2-weeds');
    const matrix = new THREE.Matrix4();
    const quat = new THREE.Quaternion();
    const up = new THREE.Vector3(0, 1, 0);
    const pos = new THREE.Vector3();
    const scale = new THREE.Vector3();
    const color = new THREE.Color();
    const half = TUNING.world.pondWidthM * 0.58;
    for (let i = 0; i < B.weedTuftCount; i += 1) {
      // Denser right at the water's edge (between the stones), thinning up the bank.
      const z = B.edgeZ + 0.05 + Math.pow(rng(), 1.8) * 1.9;
      const x = (rng() * 2 - 1) * half;
      const h = THREE.MathUtils.lerp(B.weedHeightMin, B.weedHeightMax, rng());
      pos.set(x, bankHeightAt(z), z);
      quat.setFromAxisAngle(up, rng() * Math.PI * 2);
      scale.set(h * 1.2, h, h * 1.2);
      matrix.compose(pos, quat, scale);
      mesh.setMatrixAt(i, matrix);
      const tint = 0.85 + rng() * 0.3;
      color.setRGB(tint, tint * (0.95 + rng() * 0.1), tint * 0.9);
      mesh.setColorAt(i, color);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, []);

  return <instancedMesh ref={meshRef} args={[geometry, material, B.weedTuftCount]} renderOrder={3} frustumCulled={false} />;
}

// Reeds at the side banks and the far margin: tall blades, swaying in the
// shader (A1's reeds were cones rewritten on the CPU every frame).
export function SideReeds({ runtime }: { runtime: RuntimeRef }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const clock = useBankClock(runtime);
  const geometry = useMemo(() => createBladeTuft(5, 'a2-reed-clump', 0.022), []);
  const material = useMemo(() => swayMaterial(clock, B.reedSway, 'a2-side-reed'), [clock]);

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const rng = seededRandom('m2-reeds');
    const matrix = new THREE.Matrix4();
    const quat = new THREE.Quaternion();
    const up = new THREE.Vector3(0, 1, 0);
    const pos = new THREE.Vector3();
    const scale = new THREE.Vector3();
    const color = new THREE.Color();
    for (let i = 0; i < B.reedClumpCount; i += 1) {
      // Side banks only: reeds on the far margin stood up into the treeline
      // as stray lines against the trees.
      const x = i % 2 === 0
        ? -TUNING.world.pondWidthM * 0.5 + rng() * 0.45
        : TUNING.world.pondWidthM * 0.5 - rng() * 0.45;
      const z = -TUNING.world.pondHeightM * 0.2 + rng() * TUNING.world.pondHeightM * 0.62;
      const h = 0.55 + rng() * 0.8;
      pos.set(x, TUNING.world.waterY - 0.02, z);
      quat.setFromAxisAngle(up, rng() * Math.PI * 2);
      scale.set(h * 0.55, h, h * 0.55);
      matrix.compose(pos, quat, scale);
      mesh.setMatrixAt(i, matrix);
      const tint = 0.75 + rng() * 0.25;
      color.setRGB(tint, tint * 0.95, tint * 0.75);
      mesh.setColorAt(i, color);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, []);

  return <instancedMesh ref={meshRef} args={[geometry, material, B.reedClumpCount]} frustumCulled={false} />;
}

// ---------------------------------------------------------------- ground

// The bank between and behind the stones: grass and clover (photo 01),
// tinted by the light. Same placement as the v0.4 Foreshore.
export function BankGround({ light }: { light: LightRef }) {
  const texture = useMemo(() => {
    const map = createBankTexture();
    map.repeat.set(2, 1);
    return map;
  }, []);
  const materialRef = useRef<THREE.MeshBasicMaterial>(null);
  useFrame(() => {
    const m = materialRef.current;
    if (!m) return;
    // The painted grass is a day-lit green; the light's ground tint (a
    // multiplier) carries it to dawn, dusk and night.
    const g = light.current.ground;
    m.color.setRGB(g[0], g[1], g[2], THREE.SRGBColorSpace);
  });
  const slopeRun = 2.0;
  const slopeRise = 1.0;
  const slopeLength = Math.hypot(slopeRun, slopeRise);
  const tilt = -(Math.PI / 2 + Math.atan2(slopeRise, slopeRun));
  return (
    <mesh renderOrder={2} rotation={[tilt, 0, 0]} position={[0, slopeRise * 0.5, B.edgeZ + slopeRun * 0.5]}>
      <planeGeometry args={[TUNING.world.pondWidthM * 1.18, slopeLength]} />
      <meshBasicMaterial ref={materialRef} map={texture} side={THREE.DoubleSide} />
    </mesh>
  );
}

// ---------------------------------------------------------------- far trees

function mixInto(out: Rgb, a: Rgb, b: Rgb, t: number): Rgb {
  out[0] = a[0] + (b[0] - a[0]) * t;
  out[1] = a[1] + (b[1] - a[1]) * t;
  out[2] = a[2] + (b[2] - a[2]) * t;
  return out;
}

// Art pass (public/art/PROMPTS.md `treeline-01`): the commissioned painting
// replaces both drawn rows (it already has a hazy back row and a darker front
// one); `?treeline=code` keeps the drawn pair. Swapped in only once DECODED (a
// texture assigned before its image lands draws blank), so the drawn rows hold
// until then and the first frame never waits on the image.
function useTreelineArt(onReady: (texture: THREE.Texture) => void) {
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    if (new URLSearchParams(window.location.search).get('treeline') === 'code') return undefined;
    let cancelled = false;
    let loaded: THREE.Texture | null = null;
    new THREE.TextureLoader().load(TUNING.visual.treelineArt.src, (texture) => {
      if (cancelled) {
        texture.dispose();
        return;
      }
      loaded = texture;
      texture.colorSpace = THREE.SRGBColorSpace;
      // The painting fills its strip top to bottom; the drawn rows sat in the
      // lower part of the backdrop. Repeat past the top (clamped to the
      // painting's transparent top row) so the trees stand about as tall as
      // before, and tile sideways at the painting's own aspect.
      const { heightFraction, aspect } = TUNING.visual.treelineArt;
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      texture.repeat.set(18 / (TUNING.visual.backdropHeight * heightFraction * aspect), 1 / heightFraction);
      texture.anisotropy = 4;
      onReady(texture);
    });
    return () => {
      cancelled = true;
      loaded?.dispose();
    };
    // onReady is stable for the component's life (refs only).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

// Two painted layers: a hazier back row pulled toward the fog colour (aerial
// perspective) and a darker front row. The moon draws between sky and trees.
export function LayeredTreeline({ light }: { light: LightRef }) {
  const back = useMemo(() => createTreelineLayer('back'), []);
  const front = useMemo(() => createTreelineLayer('front'), []);
  const backRef = useRef<THREE.MeshBasicMaterial>(null);
  const frontRef = useRef<THREE.MeshBasicMaterial>(null);
  const backMeshRef = useRef<THREE.Mesh>(null);
  const artRef = useRef(false);
  useTreelineArt((texture) => {
    artRef.current = true;
    if (frontRef.current) {
      frontRef.current.map = texture;
      frontRef.current.needsUpdate = true;
    }
    if (backMeshRef.current) backMeshRef.current.visible = false;
  });
  const scratch = useRef<Rgb>([0, 0, 0]);
  const white = useMemo<Rgb>(() => [1, 1, 1], []);

  useFrame(() => {
    const sample = light.current;
    if (frontRef.current) {
      const t = sample.treeline;
      if (artRef.current) {
        // The painting is evenly lit and much brighter than the drawn rows, so
        // the light's multiplier is applied twice: as painted by day, and
        // falling away faster as the light goes (dusk, night).
        frontRef.current.color.setRGB(t[0] * t[0], t[1] * t[1], t[2] * t[2], THREE.SRGBColorSpace);
      } else {
        frontRef.current.color.setRGB(t[0], t[1], t[2], THREE.SRGBColorSpace);
      }
    }
    if (backRef.current) {
      // Fog colour is a colour, the tint a multiplier: lift the fog toward
      // white before mixing so a dark fog does not black out the back row.
      const fogLift = mixInto(scratch.current, sample.fog, white, 0.55);
      const c = mixInto(fogLift, sample.treeline, fogLift, B.treeBackHaze);
      backRef.current.color.setRGB(c[0], c[1], c[2], THREE.SRGBColorSpace);
    }
  });

  const z = -(TUNING.world.pondHeightM * 0.5) - 0.5;
  return (
    <>
      <mesh ref={backMeshRef} position={[0, TUNING.visual.backdropY + 0.05, z - 0.05]} rotation={[TUNING.visual.backdropTilt, 0, 0]} renderOrder={-1.5}>
        <planeGeometry args={[18, TUNING.visual.backdropHeight]} />
        <meshBasicMaterial ref={backRef} map={back} transparent depthWrite={false} fog={false} />
      </mesh>
      <mesh position={[0, TUNING.visual.backdropY, z]} rotation={[TUNING.visual.backdropTilt, 0, 0]} renderOrder={-1}>
        <planeGeometry args={[18, TUNING.visual.backdropHeight]} />
        <meshBasicMaterial ref={frontRef} map={front} transparent depthWrite={false} fog={false} />
      </mesh>
    </>
  );
}

// ---------------------------------------------------------------- air

// Banks of mist lying on the far water; amount from the light (dawn heavy,
// day none). One instanced draw; drift and breathing in the shader.
export function FarMist({ runtime, light }: { runtime: RuntimeRef; light: LightRef }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const clock = useBankClock(runtime);
  const uniforms = useMemo(() => ({
    uTime: clock,
    uMist: { value: 0 },
    uColor: { value: new THREE.Color() }
  }), [clock]);
  const scratch = useRef<Rgb>([0, 0, 0]);

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const rng = seededRandom('a2-mist');
    const matrix = new THREE.Matrix4();
    const quat = new THREE.Quaternion();
    const pos = new THREE.Vector3();
    const scale = new THREE.Vector3();
    for (let i = 0; i < B.mistBankCount; i += 1) {
      const z = -TUNING.world.pondHeightM * 0.5 + 0.3 + rng() * 3.4;
      pos.set((rng() - 0.5) * 7, 0.18 + rng() * 0.25, z);
      quat.identity();
      scale.set(3.5 + rng() * 3, 0.5 + rng() * 0.35, 1);
      matrix.compose(pos, quat, scale);
      mesh.setMatrixAt(i, matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, []);

  useFrame(() => {
    const sample = light.current;
    uniforms.uMist.value = sample.mist * B.mistOpacity;
    // Lighter than the water it lies on, or it vanishes into it (first pass
    // mixed fog and horizon and was invisible over dawn water).
    const c = mixInto(scratch.current, sample.skyHorizon, sample.fog, 0.25);
    uniforms.uColor.value.setRGB(
      Math.min(1, c[0] * 0.75 + 0.25), Math.min(1, c[1] * 0.75 + 0.25), Math.min(1, c[2] * 0.75 + 0.25),
      THREE.SRGBColorSpace
    );
    if (meshRef.current) meshRef.current.visible = uniforms.uMist.value > 0.003;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, B.mistBankCount]} renderOrder={1.5} frustumCulled={false}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        uniforms={uniforms}
        transparent
        depthWrite={false}
        vertexShader={`
          uniform float uTime;
          varying vec2 vUv;
          varying float vSeed;
          void main() {
            vUv = uv;
            vSeed = instanceMatrix[3].x * 0.37 + instanceMatrix[3].z * 0.61;
            vec4 world = modelMatrix * instanceMatrix * vec4(position, 1.0);
            world.x += sin(uTime * 0.05 + vSeed * 6.0) * 0.6;
            gl_Position = projectionMatrix * viewMatrix * world;
          }
        `}
        fragmentShader={`
          uniform float uTime;
          uniform float uMist;
          uniform vec3 uColor;
          varying vec2 vUv;
          varying float vSeed;
          ${NOISE_GLSL}
          void main() {
            vec2 c = vUv - 0.5;
            float shape = smoothstep(0.5, 0.0, length(c * vec2(1.0, 1.6)));
            float n = bankNoise(vec3(vUv * vec2(4.0, 2.0) + vec2(uTime * 0.03, 0.0), vSeed));
            float breath = 0.75 + 0.25 * sin(uTime * 0.2 + vSeed * 9.0);
            // Patchy banks, not an even veil (measured: the first pass lifted
            // the whole far band +20 luma at dawn but read as a wash).
            float alpha = shape * smoothstep(0.32, 0.78, n) * 1.25 * breath * uMist;
            gl_FragColor = vec4(uColor, alpha);
            #include <tonemapping_fragment>
            #include <colorspace_fragment>
          }
        `}
      />
    </instancedMesh>
  );
}

// Midges over the near and middle water at dusk and night. One points draw,
// motion in the shader, additive, size clamped so one near the lens never
// becomes a disc across the scene (a Birb lesson).
export function Midges({ runtime, light }: { runtime: RuntimeRef; light: LightRef }) {
  const clock = useBankClock(runtime);
  const pointsRef = useRef<THREE.Points>(null);
  const geometry = useMemo(() => {
    const rng = seededRandom('a2-midges');
    const positions = new Float32Array(B.midgeCount * 3);
    const seeds = new Float32Array(B.midgeCount);
    for (let i = 0; i < B.midgeCount; i += 1) {
      // A few loose swarms, not an even dust.
      const swarm = Math.floor(rng() * 4);
      const cx = [-2.2, 1.6, -0.4, 2.8][swarm];
      const cz = [0.6, -0.8, -2.6, 1.4][swarm];
      positions[i * 3] = cx + (rng() - 0.5) * 1.4;
      positions[i * 3 + 1] = 0.25 + rng() * 0.9;
      positions[i * 3 + 2] = cz + (rng() - 0.5) * 1.4;
      seeds[i] = rng() * 100;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    g.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));
    return g;
  }, []);
  const uniforms = useMemo(() => ({
    uTime: clock,
    uAmount: { value: 0 },
    uColor: { value: new THREE.Color() },
    uSize: { value: B.midgeSizePx as number }
  }), [clock]);

  useFrame(({ gl }) => {
    const sample = light.current;
    uniforms.uAmount.value = sample.midges;
    // Warm at dusk (the key light), pale at night.
    uniforms.uColor.value.setRGB(
      0.6 + sample.key[0] * 0.4,
      0.6 + sample.key[1] * 0.35,
      0.55 + sample.key[2] * 0.3,
      THREE.SRGBColorSpace
    );
    uniforms.uSize.value = B.midgeSizePx * gl.getPixelRatio();
    if (pointsRef.current) pointsRef.current.visible = sample.midges > 0.02;
  });

  return (
    <points ref={pointsRef} geometry={geometry} renderOrder={4} frustumCulled={false}>
      <shaderMaterial
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        vertexShader={`
          uniform float uTime;
          uniform float uSize;
          attribute float aSeed;
          varying float vTwinkle;
          void main() {
            vec3 p = position;
            float t = uTime + aSeed;
            p.x += sin(t * 1.7) * 0.22 + sin(t * 4.1) * 0.05;
            p.y += sin(t * 2.3 + 1.3) * 0.12;
            p.z += cos(t * 1.3) * 0.22;
            vec4 mv = modelViewMatrix * vec4(p, 1.0);
            gl_Position = projectionMatrix * mv;
            gl_PointSize = min(uSize * 6.0 / -mv.z, uSize * 1.6);
            vTwinkle = 0.55 + 0.45 * sin(t * 6.0);
          }
        `}
        fragmentShader={`
          uniform float uAmount;
          uniform vec3 uColor;
          varying float vTwinkle;
          void main() {
            float d = length(gl_PointCoord - 0.5);
            float a = smoothstep(0.5, 0.0, d) * uAmount * vTwinkle * 0.8;
            gl_FragColor = vec4(uColor * a, a);
            #include <colorspace_fragment>
          }
        `}
      />
    </points>
  );
}
