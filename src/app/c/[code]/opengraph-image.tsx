import { ImageResponse } from 'next/og';

import { SPECIES_STORY_LABELS, type SpeciesId } from '@/game/fish/species';
import { trophyLengthCm } from '@/game/fish/trophy';
import { decodeCatchLink, lightWord } from '@/game/share/catchLink';
import { formatWeight, weightGrams } from '@/game/wall/wall';
import { WATERS } from '@/game/waters/waters';

// The DM preview for a catch link: the fish, its name and size, the light.
// Never the lure or anything else about how it was caught (canon §4).
export const runtime = 'edge';
export const alt = 'A fish landed on The Waters';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// A legend's link shows where, never what (canon §4), so it has no art here.
const ART: Partial<Record<SpeciesId, URL>> = {
  bronze_carp: new URL('./fish/bronze_carp.png', import.meta.url),
  moss_bass: new URL('./fish/moss_bass.png', import.meta.url),
  moon_minnow: new URL('./fish/moon_minnow.png', import.meta.url),
  old_kingfish: new URL('./fish/old_kingfish.png', import.meta.url),
  reed_pike: new URL('./fish/reed_pike.png', import.meta.url)
};

export default async function Image({ params }: { params: { code: string } }) {
  const link = decodeCatchLink(params.code);
  let art: string | null = null;
  const legend = link?.species === 'old_mossback';
  const artUrl = link ? ART[link.species] : undefined;
  if (link && artUrl && !legend) {
    try {
      const buffer = await fetch(artUrl).then((res) => res.arrayBuffer());
      let binary = '';
      const bytes = new Uint8Array(buffer);
      for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]);
      art = `data:image/png;base64,${btoa(binary)}`;
    } catch {
      art = null;
    }
  }
  const name = legend ? 'Something very big' : link ? SPECIES_STORY_LABELS[link.species] : 'The Waters';
  const detail = legend && link
    ? `${WATERS[link.water ?? 'home'].name} · ${lightWord(link.phase)}`
    : link
      ? `${trophyLengthCm(link.species, link.sizeScore)} cm · ${formatWeight(weightGrams(link.species, link.sizeScore))} · ${lightWord(link.phase)}`
      : 'six waters, one shore';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'radial-gradient(circle at 50% 40%, #1d3038 0%, #070d11 75%)',
          color: '#e9eef3',
          fontFamily: 'serif'
        }}
      >
        <div style={{ fontSize: 26, letterSpacing: 8, color: 'rgba(200,168,92,0.95)', display: 'flex' }}>
          {link ? 'CAUGHT ON THE WATERS' : 'THE WATERS'}
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element -- Satori renders <img>, not next/image */}
        {art ? <img src={art} width={640} height={360} style={{ marginTop: 6 }} alt="" /> : <div style={{ height: 360, display: 'flex' }} />}
        <div style={{ fontSize: 76, marginTop: -8, display: 'flex' }}>{name}</div>
        <div style={{ fontSize: 34, color: '#c8d2da', marginTop: 8, display: 'flex' }}>{detail}</div>
      </div>
    ),
    size
  );
}
