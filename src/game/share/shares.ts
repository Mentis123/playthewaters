import { isLegend, SPECIES_IDS, SPECIES_STORY_LABELS, type SpeciesId } from '@/game/fish/species';
import { isLureId } from '@/game/gear/gear';
import type { Catch } from '@/game/persistence/sessionStore';
import { catchLinkPath, type CatchLink } from '@/game/share/catchLink';
import { HASHTAG, withHashtag } from '@/game/share/hashtag';
import { shareCatch, type ShareResult } from '@/game/share/shareCatch';
import { track } from '@/game/telemetry/track';
import type { WallLine } from '@/game/wall/wall';
import type { WaterId } from '@/game/waters/waters';
import { AUTHOR } from '@/lib/author';

// A5.1 the tackle bag's shares (docs/alpha/HOME_PLAN.md): every share is a
// door, not a picture, and ends with #PlayTheWaters.

export const PUBLIC_ORIGIN = 'https://playthewaters.vercel.app';

function origin(): string {
  return typeof window === 'undefined' ? PUBLIC_ORIGIN : window.location.origin;
}

// A logbook entry as a catch link, when it carries its pond (catches made
// before A5.1 do not, and share as a picture with the game's address).
export function catchToLink(c: Catch): CatchLink | null {
  if (c.seed === undefined || c.spawnIndex === undefined || !c.hook || c.phase === undefined) return null;
  if (!(SPECIES_IDS as string[]).includes(c.species) || !isLureId(c.lure)) return null;
  return {
    seed: c.seed,
    spawnIndex: c.spawnIndex,
    phase: c.phase,
    species: c.species as SpeciesId,
    sizeScore: c.sizeScore,
    hook: c.hook,
    lure: c.lure,
    water: c.water ?? 'home'
  };
}

export function shareCatchEntry(c: Catch): Promise<ShareResult> {
  const link = catchToLink(c);
  const url = link ? `${origin()}${catchLinkPath(link)}` : PUBLIC_ORIGIN;
  return shareCatch({ species: c.species, sizeScore: c.sizeScore, durationMs: c.durationMs, nearSnaps: c.nearSnaps }, url);
}

// "Fish my pond": the pond you are at (same fish, same water), no catch.
export function pondUrl(seed: string, water: WaterId): string {
  const params = new URLSearchParams({ seed });
  if (water !== 'home') params.set('water', water);
  return `${origin()}/game?${params.toString()}`;
}

export function pondShareText(url: string): string {
  return withHashtag(`Come fish my pond on The Waters: ${url}`);
}

export async function sharePond(seed: string, water: WaterId): Promise<ShareResult> {
  const url = pondUrl(seed, water);
  return shareOut({ title: 'The Waters', text: pondShareText(url), url });
}

export function wallShareText(url: string): string {
  return withHashtag(`My wall on The Waters. ${url}`);
}

export async function shareWall(lines: WallLine[]): Promise<ShareResult> {
  const blob = await renderWallCard(lines);
  return shareOut({ title: 'The Waters', text: wallShareText(PUBLIC_ORIGIN), url: PUBLIC_ORIGIN, file: blob ? new File([blob], 'the-waters-wall.png', { type: 'image/png' }) : undefined });
}

// Share sheet with the file where the device can, then text only, then copy.
async function shareOut({ title, text, url, file }: { title: string; text: string; url: string; file?: File }): Promise<ShareResult> {
  track({ type: 'share_initiated' });
  const nav = typeof navigator === 'undefined' ? null : navigator;
  if (nav && typeof nav.share === 'function') {
    try {
      if (file && nav.canShare?.({ files: [file] })) {
        await nav.share({ files: [file], title, text, url });
      } else {
        await nav.share({ title, text, url });
      }
      return 'shared';
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return 'shared';
    }
  }
  try {
    await nav?.clipboard?.writeText(text);
    return 'downloaded';
  } catch {
    return 'failed';
  }
}

// The wall as a picture (portrait, 1080x1350): the board itself is the brag.
export async function renderWallCard(lines: WallLine[]): Promise<Blob | null> {
  if (typeof document === 'undefined') return null;
  const W = 1080;
  const H = 1350;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#2a2219');
  bg.addColorStop(1, '#17130e');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.025)';
  for (let y = 0; y < H; y += 9) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y + 2);
    ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(200, 168, 92, 0.45)';
  ctx.lineWidth = 3;
  ctx.strokeRect(48, 48, W - 96, H - 96);
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(200, 168, 92, 0.9)';
  ctx.font = '600 26px system-ui, -apple-system, sans-serif';
  ctx.fillText('K E P T   F R O M   T H E S E   W A T E R S', W / 2, 150);
  ctx.fillStyle = '#efe6d2';
  ctx.font = '600 96px Georgia, "Times New Roman", serif';
  ctx.fillText('The Wall', W / 2, 250);
  const shown = lines.slice(0, 6);
  let y = 360;
  for (const line of shown) {
    ctx.textAlign = 'left';
    ctx.fillStyle = line.legend && line.released ? '#9fd2c8' : '#efe6d2';
    ctx.font = '500 52px Georgia, serif';
    ctx.fillText(isLegend(line.species) ? line.name : SPECIES_STORY_LABELS[line.species], 110, y);
    ctx.textAlign = 'right';
    ctx.fillStyle = 'rgba(222, 190, 110, 1)';
    ctx.fillText(line.weight, W - 110, y);
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(239, 230, 210, 0.6)';
    ctx.font = '400 30px system-ui, -apple-system, sans-serif';
    ctx.fillText(`${line.lengthCm} cm · ${line.water} · ${line.light}`, 110, y + 48);
    ctx.strokeStyle = 'rgba(200, 168, 92, 0.2)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(110, y + 82);
    ctx.lineTo(W - 110, y + 82);
    ctx.stroke();
    y += 150;
  }
  if (shown.length === 0) {
    ctx.fillStyle = 'rgba(239, 230, 210, 0.7)';
    ctx.font = 'italic 44px Georgia, serif';
    ctx.fillText('Nothing kept yet.', W / 2, 520);
  }
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(200, 168, 92, 0.92)';
  ctx.font = 'italic 600 44px Georgia, serif';
  ctx.fillText('The Waters', W / 2, H - 150);
  ctx.fillStyle = 'rgba(239, 230, 210, 0.6)';
  ctx.font = '500 26px system-ui, -apple-system, sans-serif';
  ctx.fillText(`playthewaters.vercel.app  ·  by ${AUTHOR.name}  ·  ${HASHTAG}`, W / 2, H - 100);
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b), 'image/png'));
}
