import { track } from '@/game/telemetry/track';
import { speciesLabel } from '@/game/fish/trophy';
import { renderCatchCard, type CatchCardData } from '@/game/share/catchCard';

export type ShareResult = 'shared' | 'downloaded' | 'failed';

/**
 * Share a catch as an image card: native share sheet where supported (iOS Safari,
 * Android Chrome), otherwise download the PNG. (Chapter 7 / 20_ROADMAP.)
 */
// A4: `url` is the catch link (/c/<code>). It rides in the share text as
// well as the url field, because some share targets drop `url` when files are
// attached. Without a share sheet the image downloads and the link is copied.
export async function shareCatch(c: CatchCardData, url?: string): Promise<ShareResult> {
  const blob = await renderCatchCard(c);
  if (!blob) return 'failed';

  track({ type: 'share_initiated' });
  const filename = `reel-${c.species}.png`;
  const file = new File([blob], filename, { type: 'image/png' });

  const nav = typeof navigator === 'undefined' ? null : navigator;
  const canShareFiles = !!nav?.canShare?.({ files: [file] }) && typeof nav?.share === 'function';
  if (nav && canShareFiles) {
    try {
      await nav.share({
        files: [file],
        title: 'The Waters',
        text: url ? `Landed a ${speciesLabel(c.species)} on The Waters. Stand where I stood: ${url}` : `Landed a ${speciesLabel(c.species)} on The Waters.`,
        ...(url ? { url } : {})
      });
      return 'shared';
    } catch (error) {
      // User dismissing the share sheet throws AbortError — that's a success path,
      // not a failure. Anything else falls through to the download.
      if (error instanceof DOMException && error.name === 'AbortError') return 'shared';
    }
  }

  if (typeof document === 'undefined') return 'failed';
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
  if (url) {
    try {
      await nav?.clipboard?.writeText(url);
    } catch {
      // Clipboard blocked: the image still downloaded.
    }
  }
  return 'downloaded';
}
