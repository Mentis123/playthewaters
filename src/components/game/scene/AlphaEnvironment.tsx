'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

import { advancePhase, celestialDirection, sampleLightInto, type LightSample, type Rgb } from '@/game/light/pondLight';
import { storePhase } from '@/game/persistence/lightStore';
import { TUNING } from '@/game/tuning/tuning';
import { createTreelineTexture } from '@/components/game/scene/textures';
import type { Runtime } from '@/components/game/types';

// A1 (23_ALPHA_CANON §3, §7): the drifting light and the water it falls on.
// Every per-frame write here is into objects allocated once.

type LightRef = React.MutableRefObject<LightSample>;

function setSrgb(color: THREE.Color, rgb: Rgb): void {
  color.setRGB(rgb[0], rgb[1], rgb[2], THREE.SRGBColorSpace);
}

type WatersProbe = {
  look: 'alpha' | 'a1';
  light: string;
  phase: number;
  frozen: boolean;
  exposure: number;
  toneMapping: number;
  dpr: number;
  drawingBuffer: [number, number];
  calls: number;
  triangles: number;
};

// Owns the light: advances it, writes scene background/fog, the two lights and
// exposure, persists the phase, and publishes the effective renderer state on
// window.__waters (read back by scripts/check-effective.mjs, never echoed).
export function LightDriver({
  runtime,
  light,
  initialPhase,
  frozen,
  look = 'alpha'
}: {
  runtime: React.MutableRefObject<Runtime>;
  light: LightRef;
  initialPhase: number;
  frozen: boolean;
  look?: 'alpha' | 'a1';
}) {
  const { gl, scene } = useThree();
  const phaseRef = useRef(initialPhase);
  const ambientRef = useRef<THREE.AmbientLight>(null);
  const keyRef = useRef<THREE.DirectionalLight>(null);
  const dirRef = useRef<Rgb>([0, 0, 0]);
  const lastSaveRef = useRef(0);
  const lastProbeRef = useRef(0);
  const sizeRef = useRef(new THREE.Vector2());

  useEffect(() => {
    const previous = gl.toneMapping;
    gl.toneMapping = THREE.NeutralToneMapping;
    return () => {
      gl.toneMapping = previous;
    };
  }, [gl]);

  useEffect(() => {
    if (frozen) return;
    const save = () => storePhase(phaseRef.current);
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') save();
    };
    window.addEventListener('pagehide', save);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      save();
      window.removeEventListener('pagehide', save);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [frozen]);

  useFrame((_, dt) => {
    if (!frozen && !runtime.current.pondFrozen) {
      phaseRef.current = advancePhase(phaseRef.current, Math.min(dt, TUNING.timing.maxFrameDtSeconds));
    }
    const sample = sampleLightInto(phaseRef.current, light.current);

    if (scene.background instanceof THREE.Color) setSrgb(scene.background, sample.fog);
    if (scene.fog) setSrgb(scene.fog.color, sample.fog);
    gl.toneMappingExposure = sample.exposure;

    const ambient = ambientRef.current;
    if (ambient) {
      setSrgb(ambient.color, sample.ambient);
      ambient.intensity = sample.ambientIntensity;
    }
    const key = keyRef.current;
    if (key) {
      setSrgb(key.color, sample.key);
      key.intensity = sample.keyIntensity;
      const dir = celestialDirection(Math.max(sample.celestialElevation, 12), sample.celestialAzimuth, dirRef.current);
      key.position.set(dir[0] * 8, dir[1] * 8, dir[2] * 8);
    }

    const now = performance.now();
    if (!frozen && now - lastSaveRef.current > TUNING.light.saveEveryMs) {
      lastSaveRef.current = now;
      storePhase(phaseRef.current);
    }
    if (now - lastProbeRef.current > 500) {
      lastProbeRef.current = now;
      gl.getDrawingBufferSize(sizeRef.current);
      const probe: WatersProbe = {
        look,
        light: sample.name,
        phase: sample.phase,
        frozen,
        exposure: gl.toneMappingExposure,
        toneMapping: gl.toneMapping,
        dpr: gl.getPixelRatio(),
        drawingBuffer: [sizeRef.current.x, sizeRef.current.y],
        calls: gl.info.render.calls,
        triangles: gl.info.render.triangles
      };
      (window as Window & { __waters?: WatersProbe }).__waters = probe;
    }
  });

  return (
    <>
      <ambientLight ref={ambientRef} intensity={0.9} />
      <directionalLight ref={keyRef} position={[2.4, 5, 3]} intensity={1.35} />
    </>
  );
}

// Sky gradient behind the treeline: zenith to horizon, a sun glow placed from
// the light's celestial direction, and stars at night.
export function AlphaSky({ light }: { light: LightRef }) {
  const uniforms = useMemo(() => ({
    uZenith: { value: new THREE.Color() },
    uHorizon: { value: new THREE.Color() },
    uSun: { value: new THREE.Color() },
    uSunUv: { value: new THREE.Vector2(0.5, 0.6) },
    uSunVis: { value: 0 },
    uStars: { value: 0 },
    uTime: { value: 0 }
  }), []);

  useFrame((_, dt) => {
    const sample = light.current;
    setSrgb(uniforms.uZenith.value, sample.skyZenith);
    setSrgb(uniforms.uHorizon.value, sample.skyHorizon);
    setSrgb(uniforms.uSun.value, sample.key);
    // The visible slice of the 18 m backdrop is only ~4 m wide on a portrait
    // phone, so azimuth maps into the middle of the plane; elevation maps
    // from just above the tree crowns upward.
    uniforms.uSunUv.value.set(
      0.5 + (sample.celestialAzimuth / 30) * 0.11,
      0.53 + (sample.celestialElevation / 60) * 0.45
    );
    uniforms.uSunVis.value = sample.sunVisibility;
    uniforms.uStars.value = sample.stars;
    uniforms.uTime.value += dt;
  });

  const z = -(TUNING.world.pondHeightM * 0.5) - 0.5;
  return (
    <mesh position={[0, TUNING.visual.backdropY, z]} rotation={[TUNING.visual.backdropTilt, 0, 0]} renderOrder={-3}>
      <planeGeometry args={[18, TUNING.visual.backdropHeight]} />
      <shaderMaterial
        uniforms={uniforms}
        depthWrite={false}
        fog={false}
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform vec3 uZenith;
          uniform vec3 uHorizon;
          uniform vec3 uSun;
          uniform vec2 uSunUv;
          uniform float uSunVis;
          uniform float uStars;
          uniform float uTime;
          varying vec2 vUv;

          float hash(vec2 p) {
            return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
          }

          void main() {
            vec3 col = mix(uHorizon, uZenith, smoothstep(0.42, 1.0, vUv.y));
            vec2 d = (vUv - uSunUv) * vec2(18.0 / ${TUNING.visual.backdropHeight.toFixed(2)}, 1.0);
            float r = length(d);
            col += uSun * uSunVis * (exp(-r * r * 60.0) * 1.4 + exp(-r * 2.6) * 0.22);
            vec2 cell = floor(vUv * vec2(420.0, 64.0));
            float star = step(0.9965, hash(cell)) * uStars * smoothstep(0.55, 1.0, vUv.y);
            star *= 0.65 + 0.35 * sin(uTime * 1.7 + hash(cell + 7.0) * 6.2831);
            col += vec3(star);
            gl_FragColor = vec4(col, 1.0);
            #include <tonemapping_fragment>
            #include <colorspace_fragment>
          }
        `}
      />
    </mesh>
  );
}

// The painted treeline, tinted by the light (a multiplier, white = as painted).
export function AlphaTreeline({ light }: { light: LightRef }) {
  const treeline = useMemo(() => createTreelineTexture(), []);
  const materialRef = useRef<THREE.MeshBasicMaterial>(null);

  useFrame(() => {
    if (materialRef.current) setSrgb(materialRef.current.color, light.current.treeline);
  });

  const z = -(TUNING.world.pondHeightM * 0.5) - 0.5;
  return (
    <mesh position={[0, TUNING.visual.backdropY, z]} rotation={[TUNING.visual.backdropTilt, 0, 0]} renderOrder={-1}>
      <planeGeometry args={[18, TUNING.visual.backdropHeight]} />
      <meshBasicMaterial ref={materialRef} map={treeline} transparent depthWrite={false} fog={false} />
    </mesh>
  );
}

const FISH_SLOTS = TUNING.world.fishMaxVisible;

// The A1 water. Analytic cosine waves plus the existing normal map for detail;
// Schlick fresnel mapped to a usable weight from bank height; a sky gradient
// reflection that turns to treeline toward the far shore; a sun/moon glint
// with a sharp core and a broad sheen; body colour that goes from clear near
// to dark far; and the fish drawn INTO the water as a darkening and a slight
// surface bulge (the sprites still carry the reveal, 21_THE_REVEAL).
export function AlphaWater({
  runtime,
  light,
  normalMap,
  fishWater,
  shore = false
}: {
  runtime: React.MutableRefObject<Runtime>;
  light: LightRef;
  normalMap: THREE.Texture;
  fishWater: React.MutableRefObject<THREE.Vector4[]>;
  // A2: darken the water toward the stones (the wet edge). Off for `?look=a1`.
  shore?: boolean;
}) {
  const W = TUNING.water;
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uFocus: { value: 0 },
    uNormalMap: { value: normalMap },
    uShallow: { value: new THREE.Color() },
    uDeep: { value: new THREE.Color() },
    uFar: { value: new THREE.Color() },
    uZenith: { value: new THREE.Color() },
    uHorizon: { value: new THREE.Color() },
    uTreeline: { value: new THREE.Color() },
    uSunColor: { value: new THREE.Color() },
    uSunDir: { value: new THREE.Vector3(0, 0.3, -1) },
    uSunVis: { value: 0 },
    uGlint: { value: 0 },
    uSheen: { value: 0 },
    uCaustic: { value: 0 },
    uReflect: { value: 0 },
    uGlareReduction: { value: TUNING.input.focusGlareReduction },
    uCausticFocusMul: { value: TUNING.visual.causticFocusMultiplier },
    uFish: { value: fishWater.current },
    uShore: { value: shore ? 1 : 0 }
  }), [normalMap, fishWater, shore]);
  const dirRef = useRef<Rgb>([0, 0, 0]);
  const treeBase = useMemo(() => {
    const value = parseInt(W.treelineReflectBase.slice(1), 16);
    return [((value >> 16) & 255) / 255, ((value >> 8) & 255) / 255, (value & 255) / 255] as Rgb;
  }, [W.treelineReflectBase]);
  const treeScratch = useRef<Rgb>([0, 0, 0]);

  useFrame((_, dt) => {
    const sample = light.current;
    setSrgb(uniforms.uShallow.value, sample.waterShallow);
    setSrgb(uniforms.uDeep.value, sample.waterDeep);
    setSrgb(uniforms.uFar.value, sample.waterFar);
    setSrgb(uniforms.uZenith.value, sample.skyZenith);
    setSrgb(uniforms.uHorizon.value, sample.skyHorizon);
    const tree = treeScratch.current;
    tree[0] = treeBase[0] * sample.treeline[0];
    tree[1] = treeBase[1] * sample.treeline[1];
    tree[2] = treeBase[2] * sample.treeline[2];
    setSrgb(uniforms.uTreeline.value, tree);
    setSrgb(uniforms.uSunColor.value, sample.key);
    const dir = celestialDirection(sample.celestialElevation, sample.celestialAzimuth, dirRef.current);
    uniforms.uSunDir.value.set(dir[0], dir[1], dir[2]);
    uniforms.uSunVis.value = Math.max(sample.sunVisibility, sample.moonVisibility * 0.7);
    uniforms.uGlint.value = sample.glint;
    uniforms.uSheen.value = sample.sheen;
    uniforms.uCaustic.value = sample.caustic;
    uniforms.uReflect.value = sample.reflect;

    if (runtime.current.pondFrozen) return;
    const focused = performance.now() < runtime.current.focusUntil;
    uniforms.uFocus.value = focused ? 1 : 0;
    uniforms.uTime.value += dt * (focused ? TUNING.input.focusWaterSpeedMultiplier : 1);
  });

  return (
    <mesh renderOrder={0} rotation={[-Math.PI / 2, 0, 0]} position={[0, TUNING.world.waterY, 0]}>
      <planeGeometry args={[TUNING.world.pondWidthM, TUNING.world.pondHeightM, 1, 1]} />
      <shaderMaterial
        uniforms={uniforms}
        transparent
        depthWrite={false}
        vertexShader={`
          varying vec2 vUv;
          varying vec3 vWorld;
          void main() {
            vUv = uv;
            vec4 world = modelMatrix * vec4(position, 1.0);
            vWorld = world.xyz;
            gl_Position = projectionMatrix * viewMatrix * world;
          }
        `}
        fragmentShader={`
          #define FISH_SLOTS ${FISH_SLOTS}
          uniform float uTime;
          uniform float uFocus;
          uniform sampler2D uNormalMap;
          uniform vec3 uShallow;
          uniform vec3 uDeep;
          uniform vec3 uFar;
          uniform vec3 uZenith;
          uniform vec3 uHorizon;
          uniform vec3 uTreeline;
          uniform vec3 uSunColor;
          uniform vec3 uSunDir;
          uniform float uSunVis;
          uniform float uGlint;
          uniform float uSheen;
          uniform float uCaustic;
          uniform float uReflect;
          uniform float uGlareReduction;
          uniform float uCausticFocusMul;
          uniform vec4 uFish[FISH_SLOTS];
          uniform float uShore;
          varying vec2 vUv;
          varying vec3 vWorld;

          // Analytic gradient of three directional cosine waves (the kit's
          // waveGradient idea, adamrappaport map-assets/water.js): stable
          // normals with no texture fetch and no visible tile.
          vec2 waveSlope(vec2 p, float t) {
            vec2 g = vec2(0.0);
            vec2 d1 = normalize(vec2(1.0, 0.35));
            g += d1 * cos(dot(d1, p) * ${W.waveScale.toFixed(3)} + t * ${W.waveSpeed.toFixed(3)});
            vec2 d2 = normalize(vec2(-0.6, 1.0));
            g += d2 * 0.95 * cos(dot(d2, p) * ${(W.waveScale * 1.9).toFixed(3)} + t * ${(W.waveSpeed * 1.37).toFixed(3)});
            vec2 d3 = normalize(vec2(0.2, -1.0));
            g += d3 * 0.8 * cos(dot(d3, p) * ${(W.waveScale * 3.7).toFixed(3)} - t * ${(W.waveSpeed * 1.9).toFixed(3)});
            return g * ${W.waveSlope.toFixed(3)};
          }

          void main() {
            vec2 p = vWorld.xz;
            float dist = clamp(vUv.y, 0.0, 1.0);

            vec2 slope = waveSlope(p, uTime);
            vec2 flowA = vUv * 2.0 + vec2(uTime * 0.018, uTime * 0.007);
            vec2 flowB = vUv * 1.15 + vec2(-uTime * 0.009, uTime * 0.012);
            vec2 detail = (texture2D(uNormalMap, flowA).rg * 2.0 - 1.0) * 0.6
                        + (texture2D(uNormalMap, flowB).rg * 2.0 - 1.0) * 0.4;
            slope += detail * ${W.detailSlope.toFixed(3)} * 0.35;

            // Fish in the water: the body of water above a fish is darker and
            // its back lifts the surface a little.
            float fishShade = 0.0;
            for (int i = 0; i < FISH_SLOTS; i++) {
              vec4 f = uFish[i];
              if (f.w <= 0.0) continue;
              vec2 d = p - f.xy;
              float r = max(f.z, 0.05);
              float g = exp(-dot(d, d) / (r * r) * 1.6) * f.w;
              fishShade += g;
              slope += d / (r * r) * g * ${W.fishBulgeSlope.toFixed(3)};
            }

            vec3 n = normalize(vec3(-slope.x, 1.0, -slope.y));
            vec3 V = normalize(cameraPosition - vWorld);
            float cosT = max(dot(n, V), 0.0);
            float fresnel = ${W.fresnelF0.toFixed(3)} + ${(1 - W.fresnelF0).toFixed(3)} * pow(1.0 - cosT, 5.0);
            vec3 R = reflect(-V, n);

            // Reflected sky, turning to treeline for low reflections toward the
            // far shore: near water reflects sky, far water reflects trees.
            float up = clamp(R.y, 0.0, 1.0);
            vec3 sky = mix(uHorizon, uZenith, pow(up, 0.55));
            float treeMask = (1.0 - smoothstep(${(W.treelineBand * 0.55).toFixed(3)}, ${W.treelineBand.toFixed(3)}, up))
                           * smoothstep(0.0, 0.35, -R.z)
                           * smoothstep(0.25, 0.85, dist);
            vec3 refl = mix(sky, uTreeline, treeMask);
            float sd = max(dot(R, uSunDir), 0.0);
            refl += uSunColor * uSunVis * pow(sd, 6.0) * 0.18 * (1.0 - treeMask);

            // Body: clear near, deep mid, dark far (the gamble zone).
            float clarity = pow(clamp(dist / ${W.clarityDeepAt.toFixed(3)}, 0.0, 1.0), ${W.clarityCurve.toFixed(3)});
            vec3 body = mix(uShallow, uDeep, clarity);
            body = mix(body, uFar, smoothstep(${W.farDarkStart.toFixed(3)}, 1.0, dist) * ${W.farDarkStrength.toFixed(3)});

            // Light through clear water in the near band only.
            float c1 = texture2D(uNormalMap, vUv * 3.2 + vec2(uTime * 0.03, uTime * 0.018)).g;
            float c2 = texture2D(uNormalMap, vUv * 2.1 - vec2(uTime * 0.022, uTime * 0.015)).r;
            float caustic = pow(clamp(c1 * c2 * 2.4, 0.0, 1.0), 2.2) * uCaustic * (1.0 - clarity) * mix(1.0, uCausticFocusMul, uFocus);
            body += uSunColor * caustic * 0.5;
            body *= 1.0 - clamp(fishShade, 0.0, 1.0) * ${W.fishShadowStrength.toFixed(3)};

            // A2 wet edge: the water darkens and reflects less as it reaches
            // the stones, so they sit IN the water rather than on top of it.
            float shoreEdge = uShore * smoothstep(${(TUNING.bank.edgeZ - TUNING.bank.shoreBandM).toFixed(3)}, ${TUNING.bank.edgeZ.toFixed(3)}, vWorld.z);
            body *= 1.0 - shoreEdge * ${TUNING.bank.shoreDarken.toFixed(3)};

            float weight = clamp(uReflect * (fresnel * ${W.reflectGain.toFixed(3)} + ${W.reflectFloor.toFixed(3)}), 0.0, ${W.reflectMax.toFixed(3)});
            weight *= 1.0 - shoreEdge * 0.5;
            vec3 col = mix(body, refl, weight);

            // Glint: a sharp core and a broad sheen, so it has a body and does
            // not strobe. Damped under Focus so it never competes with cues.
            float glint = pow(sd, ${W.glintSharp.toFixed(1)}) + pow(sd, ${W.glintBroad.toFixed(1)}) * uSheen * 0.18;
            col += uSunColor * uSunVis * glint * uGlint * mix(1.0, 1.0 - uGlareReduction, uFocus) * (1.0 - treeMask * 0.85);

            gl_FragColor = vec4(col, 1.0);
            #include <tonemapping_fragment>
            #include <colorspace_fragment>
          }
        `}
      />
    </mesh>
  );
}
