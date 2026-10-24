'use client';

import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

import { feedingAmount, homeOf, homesOf, stillNeededMs } from '@/game/fish/habits';
import type { LightSample } from '@/game/light/pondLight';
import { TUNING } from '@/game/tuning/tuning';
import { lureStillMs } from '@/components/game/runtime';
import type { Runtime } from '@/components/game/types';

// Owner-only review lens (?xray=1, linked from /ab after the picks). Shows what
// the fish are doing so a difference between two ponds can be confirmed before
// it is judged. Never shown to players; no part of the game reads it.

export const XRAY_COLORS = {
  idle: '#9aa3a6',
  curious: '#6fd08a',
  feeding: '#f2c14e',
  waiting: '#5aa9ff',
  spooked: '#ff5a4f'
} as const;


export function XRayLayer({ runtime, light }: { runtime: React.MutableRefObject<Runtime>; light: React.MutableRefObject<LightSample> }) {
  const dotRefs = useRef<Array<THREE.Mesh | null>>([]);
  const homeGroup = useRef<THREE.Group>(null);
  // The scene remounts per water, so the water is fixed for this layer's life.
  const water = runtime.current.water;
  const homeIds = useMemo(() => Object.keys(homesOf(water)), [water]);
  const colors = useMemo(() => {
    const out = {} as Record<keyof typeof XRAY_COLORS, THREE.Color>;
    for (const [k, v] of Object.entries(XRAY_COLORS)) out[k as keyof typeof XRAY_COLORS] = new THREE.Color(v);
    return out;
  }, []);

  useFrame(() => {
    const r = runtime.current;
    if (homeGroup.current) homeGroup.current.visible = r.habits;
    const all = [r.fish, ...r.decorFish.map((d) => d.snapshot)];
    const now = performance.now();
    const stillMs = lureStillMs(r, now);
    for (let i = 0; i < TUNING.world.fishMaxVisible; i += 1) {
      const dot = dotRefs.current[i];
      const fish = all[i];
      if (!dot) continue;
      dot.visible = Boolean(fish);
      if (!fish) continue;
      dot.position.set(fish.position.x, TUNING.world.waterY + 0.06, fish.position.z);
      const kind = fish.state.kind;
      const feeding = r.habits ? feedingAmount(fish.instance.species, light.current.phase) : 0;
      let key: keyof typeof XRAY_COLORS = 'idle';
      if (kind === 'flee' && fish.state.kind === 'flee' && fish.state.holdMs !== undefined) key = 'spooked';
      else if (
        r.habits && i === 0 && kind === 'inspect' &&
        stillNeededMs(fish.instance.species, feeding) > stillMs && stillNeededMs(fish.instance.species, feeding) > 0
      ) key = 'waiting';
      else if (kind === 'notice' || kind === 'approach' || kind === 'inspect' || kind === 'commit' || kind === 'bite' || kind === 'hooked') key = 'curious';
      else if (feeding > 0.5) key = 'feeding';
      (dot.material as THREE.MeshBasicMaterial).color.copy(colors[key]);
    }
  });

  return (
    <>
      <group ref={homeGroup}>
        {homeIds.map((id) => {
          const home = homeOf(id, water);
          return (
            <mesh key={id} position={[home.x, TUNING.world.waterY + 0.015, home.z]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={5}>
              <ringGeometry args={[home.radius - 0.03, home.radius, 64]} />
              <meshBasicMaterial color="#ffffff" transparent opacity={0.35} depthWrite={false} side={THREE.DoubleSide} />
            </mesh>
          );
        })}
      </group>
      {Array.from({ length: TUNING.world.fishMaxVisible }, (_, i) => (
        <mesh
          key={i}
          ref={(node) => {
            dotRefs.current[i] = node;
          }}
          rotation={[-Math.PI / 2, 0, 0]}
          renderOrder={6}
          visible={false}
        >
          <circleGeometry args={[0.13, 20]} />
          {/* transparent so it sorts AFTER the (transparent) water; an opaque dot
              draws in the opaque pass first and the water paints over it. */}
          <meshBasicMaterial color={XRAY_COLORS.idle} transparent opacity={0.95} depthTest={false} depthWrite={false} />
        </mesh>
      ))}
    </>
  );
}
