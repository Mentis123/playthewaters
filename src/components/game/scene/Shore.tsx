'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

import { ART_DELIVERED } from '@/game/art/delivered';
import { seededRandom } from '@/game/math/vec';
import type { LightSample } from '@/game/light/pondLight';
import { TUNING } from '@/game/tuning/tuning';
import { padIslandCentre, WATERS, type WaterId } from '@/game/waters/waters';
import { bankHeightAt, createBladeTuft, swayMaterial, useBankClock } from '@/components/game/scene/AlphaBank';
import type { Runtime, ScreenPoint } from '@/components/game/types';

// A5 (23_ALPHA_CANON §2, §5; docs/alpha/A5_RUBRIC.md): the things along the
// shore that are not water. Paths to the next water, the lily pond's pads and
// reed islands, the bench, the old sinking lure (its glint, where it rests
// once found) and the home pond's sign. Each is one draw call or two, placed
// once; the pads are the only thing re-matrixed per frame (a few dozen).
// Screen positions of the tappable things are written to runtime.targets for
// GameClient's hit tests, projected with the live camera every frame.

type RuntimeRef = React.MutableRefObject<Runtime>;
type LightRef = React.MutableRefObject<LightSample>;

function useProjectInto(runtime: RuntimeRef, key: 'path' | 'bench' | 'sinker', world: THREE.Vector3 | null) {
  const { camera, size } = useThree();
  const scratch = useRef(new THREE.Vector3());
  const out = useRef<ScreenPoint>({ x: 0, y: 0 });
  useEffect(() => {
    const targets = runtime.current.targets;
    const mine = out.current;
    return () => {
      // Only clear our own slot if it is still ours (the scene may have
      // remounted for another water).
      if (targets[key] === mine) targets[key] = null;
    };
  }, [runtime, key]);
  useFrame(() => {
    if (!world) {
      runtime.current.targets[key] = null;
      return;
    }
    scratch.current.copy(world).project(camera);
    out.current.x = (scratch.current.x * 0.5 + 0.5) * size.width;
    out.current.y = (-scratch.current.y * 0.5 + 0.5) * size.height;
    runtime.current.targets[key] = out.current;
  });
}

// ---------------------------------------------------------------- the path

// Where the reeds part on a worn path, and a warm light through the trees
// beyond it: the way to the next water, visible and never labelled.
export function ShorePath({ runtime, side }: { runtime: RuntimeRef; side: 'left' | 'right' }) {
  const anchor = side === 'left' ? TUNING.walk.pathHome : TUNING.walk.pathLily;
  const dir = side === 'left' ? -1 : 1;
  const world = useMemo(() => new THREE.Vector3(anchor.x, 0.05, anchor.z), [anchor]);
  useProjectInto(runtime, 'path', world);

  const stones = useMemo(() => {
    const rng = seededRandom(`a5-path-${side}`);
    return Array.from({ length: 5 }, (_, i) => {
      const t = i / 4;
      const x = anchor.x + dir * (0.05 + t * 0.75) + (rng() - 0.5) * 0.08;
      const z = anchor.z + 0.15 + t * 0.85;
      return { x, z, y: bankHeightAt(z) + 0.02, s: 0.13 + rng() * 0.05, r: rng() * Math.PI };
    });
  }, [anchor, dir, side]);

  const glowTexture = useMemo(() => {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const g = ctx.createRadialGradient(32, 80, 2, 32, 80, 60);
      g.addColorStop(0, 'rgba(255, 226, 170, 0.75)');
      g.addColorStop(0.5, 'rgba(255, 210, 150, 0.22)');
      g.addColorStop(1, 'rgba(255, 210, 150, 0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 64, 128);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, []);
  const glowRef = useRef<THREE.MeshBasicMaterial>(null);
  useFrame(() => {
    // A slow breath, so the eye finds it without a marker.
    if (glowRef.current) glowRef.current.opacity = 0.55 + 0.25 * Math.sin(performance.now() * 0.0012);
  });

  return (
    <group>
      {stones.map((stone, i) => (
        <mesh key={i} position={[stone.x, stone.y, stone.z]} rotation={[0, stone.r, 0]} scale={[stone.s, stone.s * 0.32, stone.s * 0.85]} renderOrder={3}>
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color="#7b7466" roughness={0.95} flatShading />
        </mesh>
      ))}
      <mesh position={[anchor.x + dir * 0.55, 0.55, anchor.z + 0.2]} renderOrder={4}>
        <planeGeometry args={[0.7, 1.4]} />
        <meshBasicMaterial ref={glowRef} map={glowTexture} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  );
}

// ---------------------------------------------------------------- pads

function createPadTexture(): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // A round leaf with its notch, dark green with a brown-purple rim and veins.
    ctx.translate(64, 64);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, 58, 0.18, Math.PI * 2 - 0.18);
    ctx.closePath();
    const g = ctx.createRadialGradient(-10, -10, 4, 0, 0, 60);
    g.addColorStop(0, '#5c7a3e');
    g.addColorStop(0.75, '#3f5a2c');
    g.addColorStop(1, '#5a3e3a');
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = 'rgba(30, 44, 20, 0.45)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 9; i += 1) {
      const a = 0.4 + (i / 8) * (Math.PI * 2 - 0.8);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(a) * 52, Math.sin(a) * 52);
      ctx.stroke();
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

type PadInstance = { island: number; dx: number; dz: number; size: number; spin: number };

export function LilyPads({ runtime, light, water }: { runtime: RuntimeRef; light: LightRef; water: WaterId }) {
  const def = WATERS[water];
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const materialRef = useRef<THREE.MeshLambertMaterial>(null);
  const procedural = useMemo(() => createPadTexture(), []);
  const pads = useMemo<PadInstance[]>(() => {
    const rng = seededRandom(`a5-pads-${water}`);
    const out: PadInstance[] = [];
    def.pads.forEach((island, index) => {
      for (let i = 0; i < island.pads; i += 1) {
        const a = rng() * Math.PI * 2;
        const r = Math.sqrt(rng()) * island.radius * 0.92;
        out.push({ island: index, dx: Math.cos(a) * r, dz: Math.sin(a) * r * 0.9, size: 0.26 + rng() * 0.2, spin: rng() * Math.PI * 2 });
      }
    });
    return out;
  }, [def, water]);
  const scratch = useMemo(() => ({ m: new THREE.Matrix4(), q: new THREE.Quaternion(), p: new THREE.Vector3(), s: new THREE.Vector3(), e: new THREE.Euler(), c: { x: 0, z: 0 } }), []);

  // The commissioned sprite sheet (public/art/PROMPTS.md `lilypads`), swapped
  // in only once it has decoded; the drawn pad holds until then (or forever).
  useEffect(() => {
    if (!ART_DELIVERED.lilypads) return undefined;
    let cancelled = false;
    let loaded: THREE.Texture | null = null;
    new THREE.TextureLoader().load(
      '/assets/sprites/lilypads.webp',
      (texture) => {
        if (cancelled) {
          texture.dispose();
          return;
        }
        loaded = texture;
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.repeat.set(0.5, 0.5);
        if (materialRef.current) {
          materialRef.current.map = texture;
          materialRef.current.needsUpdate = true;
        }
      },
      undefined,
      () => undefined
    );
    return () => {
      cancelled = true;
      loaded?.dispose();
    };
  }, []);

  useFrame(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const t = runtime.current.pondFrozen ? 0 : performance.now() / 1000;
    for (let i = 0; i < pads.length; i += 1) {
      const pad = pads[i];
      padIslandCentre(def.pads[pad.island], t, scratch.c);
      scratch.p.set(scratch.c.x + pad.dx, TUNING.world.waterY + 0.012, scratch.c.z + pad.dz);
      scratch.e.set(-Math.PI / 2, 0, pad.spin + Math.sin(t * 0.05 + pad.spin) * 0.08);
      scratch.q.setFromEuler(scratch.e);
      scratch.s.set(pad.size, pad.size, 1);
      scratch.m.compose(scratch.p, scratch.q, scratch.s);
      mesh.setMatrixAt(i, scratch.m);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (materialRef.current) {
      const k = light.current.bank;
      materialRef.current.color.setRGB(0.55 + k[0] * 0.5, 0.55 + k[1] * 0.5, 0.55 + k[2] * 0.5, THREE.SRGBColorSpace);
    }
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, pads.length]} renderOrder={3} frustumCulled={false}>
      <planeGeometry args={[1, 1]} />
      <meshLambertMaterial ref={materialRef} map={procedural} transparent alphaTest={0.4} depthWrite={false} side={THREE.DoubleSide} />
    </instancedMesh>
  );
}

// Reed islands standing in the water (photo 04): tufts of blades, swaying
// from the same shared clock as the bank's reeds.
export function ReedIslands({ runtime, water }: { runtime: RuntimeRef; water: WaterId }) {
  const def = WATERS[water];
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const clock = useBankClock(runtime);
  const geometry = useMemo(() => createBladeTuft(6, 'a5-reed-island', 0.02), []);
  const material = useMemo(() => swayMaterial(clock, TUNING.bank.reedSway, 'a5-reed-island'), [clock]);
  const count = def.reedIslands.reduce((sum, island) => sum + Math.round(island.radius * 42), 0);

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const rng = seededRandom(`a5-reeds-${water}`);
    const matrix = new THREE.Matrix4();
    const quat = new THREE.Quaternion();
    const up = new THREE.Vector3(0, 1, 0);
    const pos = new THREE.Vector3();
    const scale = new THREE.Vector3();
    const color = new THREE.Color();
    let n = 0;
    for (const island of def.reedIslands) {
      const tufts = Math.round(island.radius * 42);
      for (let i = 0; i < tufts; i += 1) {
        const a = rng() * Math.PI * 2;
        const r = Math.sqrt(rng()) * island.radius;
        const h = 0.35 + rng() * 0.55 * (1 - r / island.radius * 0.5);
        pos.set(island.x + Math.cos(a) * r, TUNING.world.waterY - 0.02, island.z + Math.sin(a) * r * 0.8);
        quat.setFromAxisAngle(up, rng() * Math.PI * 2);
        scale.set(h * 0.5, h, h * 0.5);
        matrix.compose(pos, quat, scale);
        mesh.setMatrixAt(n, matrix);
        const tint = 0.7 + rng() * 0.3;
        color.setRGB(tint * 0.95, tint, tint * 0.6);
        mesh.setColorAt(n, color);
        n += 1;
      }
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [def, water]);

  return <instancedMesh ref={meshRef} args={[geometry, material, Math.max(1, count)]} renderOrder={3} frustumCulled={false} />;
}

// ---------------------------------------------------------------- finds

// The lily pond's bench (canon §5): a weathered seat on the near bank. Tapping
// it shows the carved line (GameClient).
export function Bench({ runtime }: { runtime: RuntimeRef }) {
  const { x, z } = TUNING.walk.bench;
  const y = bankHeightAt(z);
  const world = useMemo(() => new THREE.Vector3(x, y + 0.18, z), [x, y, z]);
  useProjectInto(runtime, 'bench', world);
  const wood = '#6f6559';
  return (
    <group position={[x, y, z]} rotation={[0, 0.35, 0]}>
      <mesh position={[0, 0.2, 0]} renderOrder={3}>
        <boxGeometry args={[0.62, 0.04, 0.18]} />
        <meshStandardMaterial color={wood} roughness={1} />
      </mesh>
      <mesh position={[0, 0.34, -0.08]} rotation={[0.25, 0, 0]} renderOrder={3}>
        <boxGeometry args={[0.62, 0.12, 0.03]} />
        <meshStandardMaterial color={wood} roughness={1} />
      </mesh>
      {[-0.26, 0.26].map((lx) => (
        <mesh key={lx} position={[lx, 0.1, 0]} renderOrder={3}>
          <boxGeometry args={[0.04, 0.2, 0.15]} />
          <meshStandardMaterial color="#4f483f" roughness={1} />
        </mesh>
      ))}
    </group>
  );
}

// Under the home pond's near bank: a brass glint, for a moment every few
// seconds. No marker, no hint (canon §5).
export function SinkerGlint() {
  const ref = useRef<THREE.Mesh>(null);
  const { x, z } = TUNING.find.sinker;
  useFrame(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const { glintEveryMs, glintShowMs } = TUNING.find;
    const t = performance.now() % glintEveryMs;
    const on = t < glintShowMs ? Math.sin((t / glintShowMs) * Math.PI) : 0;
    mesh.visible = on > 0.01;
    (mesh.material as THREE.MeshBasicMaterial).opacity = on * 0.85;
    mesh.scale.setScalar(0.06 + on * 0.05);
  });
  return (
    <mesh ref={ref} position={[x, TUNING.world.waterY + 0.006, z]} rotation={[-Math.PI / 2, 0, 0.6]} renderOrder={2}>
      <circleGeometry args={[1, 12]} />
      <meshBasicMaterial color="#ffe3a0" transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} />
    </mesh>
  );
}

// Once found: the lure rests on a bank stone, bottom left. Tap it to tie it
// on; tap again (or pick any lure in the strip) to take it off. Never in the
// strip (canon §5).
export function CarriedSinker({ runtime, tied }: { runtime: RuntimeRef; tied: boolean }) {
  const { x, z } = TUNING.walk.sinkerRest;
  const y = bankHeightAt(z);
  const world = useMemo(() => new THREE.Vector3(x, y + 0.08, z), [x, y, z]);
  useProjectInto(runtime, 'sinker', world);
  return (
    <group position={[x, y, z]}>
      <mesh position={[0, 0.03, 0]} scale={[0.16, 0.07, 0.13]} renderOrder={3}>
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#6d675c" roughness={0.95} flatShading />
      </mesh>
      {tied ? null : (
        <mesh position={[0.01, 0.1, 0]} rotation={[0, 0, Math.PI / 2.4]} scale={[0.03, 0.06, 0.03]} renderOrder={4}>
          <sphereGeometry args={[1, 10, 8]} />
          <meshStandardMaterial color="#b8913f" metalness={0.6} roughness={0.35} emissive="#3a2a08" />
        </mesh>
      )}
    </group>
  );
}

// The home pond's sign, once the lure has been found (canon §5: the pond's
// sign forbids it).
export function SinkerSign() {
  const texture = useMemo(() => {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 96;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#5e5446';
      ctx.fillRect(0, 0, 256, 96);
      ctx.strokeStyle = 'rgba(30, 24, 18, 0.5)';
      for (let y = 8; y < 96; y += 11) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(256, y + 3);
        ctx.stroke();
      }
      ctx.fillStyle = '#e8dcc2';
      ctx.font = 'bold 28px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText('NO SINKING', 128, 42);
      ctx.fillText('LURES', 128, 76);
    }
    const t = new THREE.CanvasTexture(canvas);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
  const x = 0.95;
  const z = 2.95;
  const y = bankHeightAt(z);
  return (
    <group position={[x, y, z]} rotation={[0, -0.3, 0]}>
      <mesh position={[0, 0.16, 0]} renderOrder={3}>
        <boxGeometry args={[0.03, 0.32, 0.03]} />
        <meshStandardMaterial color="#4a4136" roughness={1} />
      </mesh>
      <mesh position={[0, 0.34, 0.02]} renderOrder={3}>
        <planeGeometry args={[0.36, 0.135]} />
        <meshStandardMaterial map={texture} roughness={1} />
      </mesh>
    </group>
  );
}

// ---------------------------------------------------------------- the legend

// When the legend surfaces: a wide, slow swirl and a vast dark back breaking
// the brown water near its pads. The sound is GameScene's. Never explained.
export function LegendSwirl({ runtime }: { runtime: RuntimeRef }) {
  const ringRef = useRef<THREE.Mesh>(null);
  const backRef = useRef<THREE.Mesh>(null);
  useFrame(() => {
    const legend = runtime.current.legend;
    const now = performance.now();
    const ring = ringRef.current;
    const back = backRef.current;
    if (!ring || !back) return;
    const showing = !!legend && now < legend.surfacingUntil;
    ring.visible = showing;
    back.visible = showing;
    if (!showing || !legend) return;
    const t = 1 - (legend.surfacingUntil - now) / TUNING.legend.surfaceShowMs;
    const pos = runtime.current.legendPos;
    ring.position.set(pos.x, TUNING.world.waterY + 0.014, pos.z);
    ring.scale.setScalar(0.5 + t * 1.6);
    (ring.material as THREE.MeshBasicMaterial).opacity = (1 - t) * 0.7;
    back.position.set(pos.x + (t - 0.5) * 0.4, TUNING.world.waterY + 0.01, pos.z);
    (back.material as THREE.MeshBasicMaterial).opacity = Math.sin(t * Math.PI) * 0.75;
  });
  return (
    <>
      <mesh ref={ringRef} visible={false} rotation={[-Math.PI / 2, 0, 0]} renderOrder={4}>
        <ringGeometry args={[0.8, 1, 48]} />
        <meshBasicMaterial color="#d9d2bf" transparent opacity={0} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={backRef} visible={false} rotation={[-Math.PI / 2, 0, 0.2]} scale={[1.5, 0.45, 1]} renderOrder={4}>
        <circleGeometry args={[0.5, 24]} />
        <meshBasicMaterial color="#14130c" transparent opacity={0} depthWrite={false} />
      </mesh>
    </>
  );
}
