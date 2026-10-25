'use client';

import QRCode from 'qrcode';
import { useCallback, useEffect, useState } from 'react';

import { withHashtag } from '@/game/share/hashtag';

// Three fingers anywhere (Q on a keyboard): a QR code of the game, so a
// stranger can scan it off your phone (the Birb Labs convention). The URL is
// PINNED to production: a preview or localhost address is useless to the
// person scanning it.
export const SHARE_URL = 'https://playthewaters.vercel.app';
const SHARE_TEXT = 'Come fish The Waters with me.';

export function QrTap() {
  const [open, setOpen] = useState(false);
  const show = useCallback(() => {
    setOpen(true);
  }, []);

  useEffect(() => {
    // Three fingers down at once is something the game itself never asks for
    // (one is the cast, two the debug readout).
    const onTouch = (event: TouchEvent) => {
      if (event.touches.length >= 3) {
        event.preventDefault();
        show();
      }
    };
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return;
      if (event.key === 'q' || event.key === 'Q') show();
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('touchstart', onTouch, { passive: false, capture: true });
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('touchstart', onTouch, { capture: true });
      window.removeEventListener('keydown', onKey);
    };
  }, [show]);


  if (!open) return null;
  return (
    <div
      className="qr-tap"
      role="dialog"
      aria-label="Share The Waters"
      data-testid="qr-tap"
      onPointerDown={(event) => event.stopPropagation()}
      onPointerUp={(event) => event.stopPropagation()}
      onClick={() => setOpen(false)}
    >
      <div onClick={(event) => event.stopPropagation()}>
        <QrCard onClose={() => setOpen(false)} />
      </div>
    </div>
  );
}

// The card itself: on the three-finger overlay, and inline in the tackle bag.
export function QrCard({ onClose }: { onClose?: () => void }) {
  const [qr, setQr] = useState<string | null>(null);
  const [shareState, setShareState] = useState<'idle' | 'shared' | 'copied'>('idle');
  useEffect(() => {
    QRCode.toDataURL(SHARE_URL, { margin: 1, width: 520, color: { dark: '#0b1114', light: '#f3ead6' } })
      .then(setQr)
      .catch(() => setQr(null));
  }, []);
  const share = async () => {
    const text = withHashtag(`${SHARE_TEXT} ${SHARE_URL}`);
    try {
      if (navigator.share) {
        await navigator.share({ title: 'The Waters', text, url: SHARE_URL });
        setShareState('shared');
        return;
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
    }
    try {
      await navigator.clipboard.writeText(text);
      setShareState('copied');
    } catch {
      // Nothing to fall back to; the QR is still on screen.
    }
  };

  return (
    <div className="qr-tap-card" data-testid="qr-card">
      <span className="qr-tap-kicker">Scan to play</span>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {qr ? <img className="qr-tap-code" src={qr} alt={`QR code for ${SHARE_URL}`} width={260} height={260} /> : <div className="qr-tap-code" />}
      <span className="qr-tap-name">The Waters</span>
      <span className="qr-tap-url">playthewaters.vercel.app</span>
      <div className="qr-tap-actions">
        <button type="button" className="result-keep" onClick={share} data-testid="qr-share">
          {shareState === 'copied' ? 'Link copied' : shareState === 'shared' ? 'Shared' : 'Share'}
        </button>
        {onClose ? (
          <button type="button" className="result-release" onClick={onClose}>
            Close
          </button>
        ) : null}
      </div>
    </div>
  );
}
