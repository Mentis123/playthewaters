import * as THREE from 'three';

import { seededRandom } from '@/game/math/vec';
import { TUNING } from '@/game/tuning/tuning';

// Soft organic foliage mass: a scatter of overlapping leaf-clump ellipses.
// Used to paint canopy walls and overhanging branches without flat rectangles.
export function paintFoliageCluster(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  blobs: number,
  rng: () => number
): void {
  for (let i = 0; i < blobs; i += 1) {
    const angle = rng() * Math.PI * 2;
    const reach = rng();
    const x = cx + Math.cos(angle) * rx * reach;
    const y = cy + Math.sin(angle) * ry * reach * 0.78;
    const r = (0.16 + 0.52 * rng()) * Math.min(rx, ry);
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * 0.82, rng() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Moonlit treeline backdrop standing up from the far shore (z=-6.5). The
// camera pitches down into the pond, so only the top ~130px of the frame
// (≈ bottom 60% of this canvas) is ever on screen — all the readable content
// (waterline, low moon, tree mass) is packed into that lower band, with the
// canopy crowns running off the top of the frame. Fog is disabled on the
// material so the haze is painted here rather than washing the trees to teal.
export const TREELINE_VISIBLE_TOP = TUNING.visual.treelineVisibleTop; // canvas fraction below which content shows

// The backdrop is split into two layers so the rising moon can sit BETWEEN them
// (in the sky, behind the trees). Back layer = sky + stars (opaque). Front layer
// = trees + bank + fireflies + mist on a transparent ground, so the sky and the
// moon show through the gaps and the foliage occludes the moon where it's dense.
export function createSkyTexture(): THREE.Texture {
  if (typeof document === 'undefined') {
    return new THREE.Texture();
  }

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;

  if (ctx) {
    const rng = seededRandom('m4-sky');

    // Dusk sky, darkening toward the deep far-water at the waterline so the
    // backdrop base dissolves into the pond rather than the void.
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, '#20323a');
    sky.addColorStop(0.5, '#2c454b');
    sky.addColorStop(0.82, '#3a585a');
    sky.addColorStop(1, TUNING.visual.waterDeep);
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    // Faint star scatter high in the sky for depth.
    for (let i = 0; i < 40; i += 1) {
      ctx.globalAlpha = 0.12 + rng() * 0.4;
      ctx.fillStyle = 'rgba(220, 224, 224, 1)';
      ctx.beginPath();
      ctx.arc(rng() * w, h * (0.06 + rng() * 0.34), 0.5 + rng() * 1.1, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  return map;
}

export function createTreelineTexture(): THREE.Texture {
  if (typeof document === 'undefined') {
    return new THREE.Texture();
  }

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;

  if (ctx) {
    const rng = seededRandom('m4-treeline');

    // Transparent ground (no fillRect): the sky + moon behind show through every
    // gap. Mist tracks TUNING.visual.waterDeep so the base meets the far water.
    const deepHex = TUNING.visual.waterDeep;
    const deepN = parseInt(deepHex.slice(1), 16);
    const deepR = (deepN >> 16) & 255;
    const deepG = (deepN >> 8) & 255;
    const deepB = deepN & 255;

    // Treeline depth bands: back rows hazier/higher, front rows darker/lower.
    const bands: Array<{ y: number; fill: string; alpha: number; size: number }> = [
      { y: h * 0.5, fill: '#3c5147', alpha: 0.55, size: 96 },
      { y: h * 0.62, fill: '#2c3e2a', alpha: 0.84, size: 120 },
      { y: h * 0.76, fill: '#1d2c19', alpha: 0.97, size: 140 }
    ];
    bands.forEach((band) => {
      ctx.globalAlpha = band.alpha;
      ctx.fillStyle = band.fill;
      for (let x = -60; x < w + 60; x += 90) {
        paintFoliageCluster(ctx, x + rng() * 70, band.y + rng() * 36, 150, band.size, 18, rng);
      }
    });

    // Moonlit rim catching the tops of the front trees.
    ctx.globalAlpha = 0.4;
    ctx.fillStyle = '#4d6440';
    for (let x = -40; x < w + 40; x += 120) {
      paintFoliageCluster(ctx, x + rng() * 60, h * (0.54 + rng() * 0.06), 90, 60, 10, rng);
    }

    // Mossy far bank along the waterline.
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = '#243524';
    for (let x = -40; x < w + 40; x += 70) {
      paintFoliageCluster(ctx, x + rng() * 50, h * (0.9 + rng() * 0.05), 70, 30, 10, rng);
    }

    // Faint fireflies drifting in front of the trees.
    ctx.fillStyle = 'rgba(234, 230, 210, 0.8)';
    for (let i = 0; i < 30; i += 1) {
      ctx.globalAlpha = 0.2 + rng() * 0.5;
      ctx.beginPath();
      ctx.arc(rng() * w, h * (TREELINE_VISIBLE_TOP + rng() * 0.5), 0.8 + rng() * 1.6, 0, Math.PI * 2);
      ctx.fill();
    }

    // Waterline mist blending the base into the deep far-water edge.
    ctx.globalAlpha = 1;
    const mist = ctx.createLinearGradient(0, h * 0.9, 0, h);
    mist.addColorStop(0, `rgba(${deepR}, ${deepG}, ${deepB}, 0)`);
    mist.addColorStop(1, `rgba(${deepR}, ${deepG}, ${deepB}, 0.85)`);
    ctx.fillStyle = mist;
    ctx.fillRect(0, h * 0.9, w, h * 0.1);
  }

  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  return map;
}

export function createMoonTexture(): THREE.Texture {
  if (typeof document === 'undefined') {
    return new THREE.Texture();
  }
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const cx = 64;
    const cy = 64;
    const halo = ctx.createRadialGradient(cx, cy, 6, cx, cy, 64);
    halo.addColorStop(0, 'rgba(236, 232, 212, 0.95)');
    halo.addColorStop(0.22, 'rgba(220, 216, 196, 0.5)');
    halo.addColorStop(0.5, 'rgba(202, 198, 180, 0.16)');
    halo.addColorStop(1, 'rgba(202, 198, 180, 0)');
    ctx.fillStyle = halo;
    ctx.fillRect(0, 0, 128, 128);
    const disc = ctx.createRadialGradient(cx - 4, cy - 5, 2, cx, cy, 22);
    disc.addColorStop(0, 'rgba(245, 241, 224, 1)');
    disc.addColorStop(1, 'rgba(228, 224, 204, 0.95)');
    ctx.fillStyle = disc;
    ctx.beginPath();
    ctx.arc(cx, cy, 22, 0, Math.PI * 2);
    ctx.fill();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// A2 far shore (reference photo 01): two layers. `back` is a hazier, taller
// row of pines and maples; `front` is darker, with red-barked pine trunks, a
// mossy low bank and a little waterline mist. Painted in mid greens so the
// light's treeline tint (a multiplier) can carry them to any light.
// Transparent ground: the sky shows through.
function paintPine(ctx: CanvasRenderingContext2D, x: number, baseY: number, height: number, rng: () => number, trunk: string, crown: string): void {
  const lean = (rng() - 0.5) * height * 0.18;
  ctx.strokeStyle = trunk;
  ctx.lineWidth = Math.max(1.5, height * 0.02);
  ctx.beginPath();
  ctx.moveTo(x, baseY);
  ctx.quadraticCurveTo(x + lean * 0.3, baseY - height * 0.5, x + lean, baseY - height);
  ctx.stroke();
  // Pine crowns in photo 01 are flat, cloud-like layers along the upper trunk.
  ctx.fillStyle = crown;
  const layers = 3 + Math.floor(rng() * 3);
  for (let i = 0; i < layers; i += 1) {
    const t = 0.45 + (i / layers) * 0.55;
    const cx = x + lean * t + (rng() - 0.5) * height * 0.12;
    const cy = baseY - height * t;
    paintFoliageCluster(ctx, cx, cy, height * (0.3 - i * 0.03), height * 0.09, 11, rng);
  }
}

export function createTreelineLayer(layer: 'back' | 'front'): THREE.Texture {
  if (typeof document === 'undefined') {
    return new THREE.Texture();
  }
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  if (ctx) {
    const rng = seededRandom(`a2-treeline-${layer}`);
    if (layer === 'back') {
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = '#5c7259';
      for (let x = -60; x < w + 60; x += 70) {
        paintFoliageCluster(ctx, x + rng() * 50, h * (0.5 + rng() * 0.08), 120, 110, 16, rng);
      }
      for (let x = 20; x < w; x += 110 + rng() * 80) {
        paintPine(ctx, x, h * 0.72, h * (0.34 + rng() * 0.12), rng, '#5d4a40', '#53684f');
      }
    } else {
      // Maple masses, darker and lower.
      ctx.globalAlpha = 0.97;
      ctx.fillStyle = '#34482d';
      for (let x = -60; x < w + 60; x += 85) {
        paintFoliageCluster(ctx, x + rng() * 60, h * (0.68 + rng() * 0.06), 140, 95, 18, rng);
      }
      // Red-barked pines standing in front of them.
      for (let x = 40; x < w; x += 150 + rng() * 120) {
        paintPine(ctx, x, h * 0.9, h * (0.42 + rng() * 0.16), rng, '#4a3128', '#2f4429');
      }
      // Lit crowns catching the light.
      ctx.globalAlpha = 0.16;
      ctx.fillStyle = '#7f9a5a';
      for (let x = -40; x < w + 40; x += 120) {
        paintFoliageCluster(ctx, x + rng() * 60, h * (0.6 + rng() * 0.06), 70, 30, 12, rng);
      }
      // Mossy low bank along the waterline.
      ctx.globalAlpha = 0.95;
      ctx.fillStyle = '#2a3a24';
      for (let x = -40; x < w + 40; x += 60) {
        paintFoliageCluster(ctx, x + rng() * 40, h * (0.92 + rng() * 0.04), 70, 26, 10, rng);
      }
      // Waterline mist.
      ctx.globalAlpha = 1;
      const mist = ctx.createLinearGradient(0, h * 0.9, 0, h);
      mist.addColorStop(0, 'rgba(38, 56, 64, 0)');
      mist.addColorStop(1, 'rgba(38, 56, 64, 0.8)');
      ctx.fillStyle = mist;
      ctx.fillRect(0, h * 0.9, w, h * 0.1);
    }
  }
  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  return map;
}

// A2 bank ground (photo 01's foreground): grass and clover between and behind
// the stones, damp and darker at the water's edge. Canvas top = water edge.
export function createBankTexture(): THREE.Texture {
  if (typeof document === 'undefined') {
    return new THREE.Texture();
  }
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  if (ctx) {
    const rng = seededRandom('a2-bank');
    const base = ctx.createLinearGradient(0, 0, 0, h);
    base.addColorStop(0, '#3a4a33');
    base.addColorStop(0.15, '#4c6338');
    base.addColorStop(1, '#5d7a3f');
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, w, h);
    // Soil showing through near the water.
    ctx.fillStyle = 'rgba(70, 58, 42, 0.5)';
    for (let i = 0; i < 260; i += 1) {
      ctx.beginPath();
      ctx.ellipse(rng() * w, rng() * h * 0.3, 2 + rng() * 6, 1 + rng() * 3, rng() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
    // Clover: small three-leaf clusters.
    for (let i = 0; i < 520; i += 1) {
      const x = rng() * w;
      const y = h * 0.1 + rng() * h * 0.9;
      const r = 2.5 + rng() * 3.5;
      ctx.fillStyle = rng() < 0.5 ? 'rgba(96, 132, 66, 0.85)' : 'rgba(74, 108, 52, 0.85)';
      for (let k = 0; k < 3; k += 1) {
        const a = (k / 3) * Math.PI * 2 + rng();
        ctx.beginPath();
        ctx.arc(x + Math.cos(a) * r * 0.8, y + Math.sin(a) * r * 0.6, r * 0.62, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    // Grass blades.
    ctx.lineCap = 'round';
    for (let i = 0; i < 1400; i += 1) {
      const x = rng() * w;
      const y = h * 0.06 + rng() * h * 0.94;
      const len = 4 + rng() * 12;
      ctx.strokeStyle = rng() < 0.6 ? 'rgba(122, 156, 82, 0.7)' : 'rgba(60, 86, 44, 0.7)';
      ctx.lineWidth = 1 + rng();
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + (rng() - 0.5) * 5, y - len);
      ctx.stroke();
    }
    // Small white flowers (photo 01 has a few in the weeds).
    ctx.fillStyle = 'rgba(236, 232, 218, 0.85)';
    for (let i = 0; i < 40; i += 1) {
      ctx.beginPath();
      ctx.arc(rng() * w, h * 0.2 + rng() * h * 0.8, 1.6 + rng() * 1.4, 0, Math.PI * 2);
      ctx.fill();
    }
    // Damp, darker band at the water's edge.
    const wet = ctx.createLinearGradient(0, 0, 0, h * 0.14);
    wet.addColorStop(0, 'rgba(18, 26, 24, 0.7)');
    wet.addColorStop(1, 'rgba(18, 26, 24, 0)');
    ctx.fillStyle = wet;
    ctx.fillRect(0, 0, w, h * 0.14);
  }
  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = THREE.RepeatWrapping;
  map.anisotropy = 4;
  return map;
}
