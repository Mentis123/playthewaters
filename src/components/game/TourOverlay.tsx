'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { TRACK_EVENT, type TrackEvent } from '@/game/telemetry/track';
import { loadAnswers, REVIEW, saveAnswer, type Answer } from '@/game/tour/review';
import { stopDone, type Tour, type TourCounts, type TourPoint, type TourProbe, type TourSetup } from '@/game/tour/tours';

// The review tour (docs/alpha/TOUR.md): a card at the top of the game that
// walks the owner through what to check, points at it, and asks /ab's check
// in place. Only with ?tour=<chapter>; never linked from the game.

export type TourApi = {
  probe: () => TourProbe;
  // Where a shore thing is on screen (canvas pixels), or null.
  shorePoint: (key: 'path' | 'bench' | 'sinker' | 'glint') => { x: number; y: number } | null;
  // Returns false when the scene is not ready for it yet (retried).
  setup: (step: TourSetup) => boolean;
};

const zeroCounts = (): TourCounts => ({ casts: 0, shares: 0, castsByLure: {} });

export function TourOverlay({ tour, api }: { tour: Tour; api: TourApi }) {
  const progressKey = `thewaters.tour.${tour.id}`;
  const [index, setIndex] = useState(0);
  const [collapsed, setCollapsed] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [done, setDone] = useState(false);
  // The stop's scene is waiting on the game (a fish on, the bag open, a walk).
  const [waiting, setWaiting] = useState(false);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const counts = useRef<TourCounts>(zeroCounts());
  const keptAtStart = useRef('');
  const pending = useRef<TourSetup[]>([]);
  const cardRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef(api);
  apiRef.current = api;

  const stop = tour.stops[Math.min(index, tour.stops.length - 1)];
  const last = index >= tour.stops.length - 1;

  // Resume where the reviewer left off. A stop's scene waits for the title
  // tap, so resuming after a reload is safe.
  useEffect(() => {
    setAnswers(loadAnswers());
    try {
      const saved = Number(window.localStorage.getItem(progressKey));
      if (Number.isInteger(saved) && saved > 0 && saved < tour.stops.length) setIndex(saved);
    } catch {
      // Storage blocked: start from the top.
    }
  }, [progressKey, tour.stops.length]);

  const go = useCallback((next: number) => {
    const clamped = Math.max(0, Math.min(tour.stops.length - 1, next));
    setIndex(clamped);
    try {
      window.localStorage.setItem(progressKey, String(clamped));
    } catch {
      // Progress lasts for this page.
    }
  }, [progressKey, tour.stops.length]);

  // A new stop: fresh counts, its scene queued.
  useEffect(() => {
    counts.current = zeroCounts();
    keptAtStart.current = apiRef.current.probe().kept;
    pending.current = [...(stop.setup ?? [])];
    setRevealed(false);
    setDone(false);
  }, [stop]);

  useEffect(() => {
    const onTrack = (event: Event) => {
      const detail = (event as CustomEvent<TrackEvent>).detail;
      if (detail.type === 'cast') {
        counts.current.casts += 1;
        const lure = detail.lureId ?? 'unknown';
        counts.current.castsByLure[lure] = (counts.current.castsByLure[lure] ?? 0) + 1;
      } else if (detail.type === 'share_initiated') {
        counts.current.shares += 1;
      }
    };
    window.addEventListener(TRACK_EVENT, onTrack);
    return () => window.removeEventListener(TRACK_EVENT, onTrack);
  }, []);

  // Poll: apply the stop's scene once the game can take it, and watch for done.
  useEffect(() => {
    const timer = window.setInterval(() => {
      const probe = apiRef.current.probe();
      if (probe.started && pending.current.length > 0) {
        while (pending.current.length > 0 && apiRef.current.setup(pending.current[0])) pending.current.shift();
      }
      const isWaiting = probe.started && pending.current.length > 0;
      setWaiting((was) => (was === isWaiting ? was : isWaiting));
      const isDone = stopDone(stop, probe, counts.current, keptAtStart.current);
      setDone((was) => (was === isDone ? was : isDone || was));
      if (isDone && stop.autoNext) go(index + 1);
    }, 250);
    return () => window.clearInterval(timer);
  }, [go, index, stop]);

  // The pointer follows its target every frame (the camera walks).
  useEffect(() => {
    const point: TourPoint | undefined = stop.point ?? (revealed ? stop.reveal : undefined);
    let raf = 0;
    const frame = () => {
      raf = requestAnimationFrame(frame);
      const ring = ringRef.current;
      if (!ring) return;
      let box: { x: number; y: number; w: number; h: number } | null = null;
      if (point && 'selector' in point) {
        const el = document.querySelector(point.selector);
        const rect = el?.getBoundingClientRect();
        if (rect && rect.width > 0) box = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, w: rect.width, h: rect.height };
      } else if (point) {
        const at = apiRef.current.shorePoint(point.shore);
        const canvas = document.querySelector('[data-testid="game-route"] canvas')?.getBoundingClientRect();
        if (at && canvas) box = { x: canvas.left + at.x, y: canvas.top + at.y, w: 56, h: 56 };
      }
      if (!box) {
        ring.style.opacity = '0';
        return;
      }
      const w = Math.max(44, Math.min(window.innerWidth - 8, box.w + 16));
      const h = Math.max(44, Math.min(window.innerHeight - 8, box.h + 16));
      ring.style.opacity = '1';
      ring.style.width = `${w}px`;
      ring.style.height = `${h}px`;
      ring.style.borderRadius = `${Math.min(w, h) / 2}px`;
      ring.style.transform = `translate(${box.x - w / 2}px, ${box.y - h / 2}px)`;
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [revealed, stop]);

  // The card's height, so the HUD can sit below it (globals.css [data-tour]).
  useEffect(() => {
    const el = cardRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return undefined;
    const root = document.documentElement;
    const observer = new ResizeObserver(() => root.style.setProperty('--tour-h', `${Math.ceil(el.getBoundingClientRect().bottom)}px`));
    observer.observe(el);
    return () => {
      observer.disconnect();
      root.style.removeProperty('--tour-h');
    };
  }, []);

  const answer = (value: Answer) => {
    if (!stop.check) return;
    setAnswers(saveAnswer(stop.check, value));
  };

  const check = stop.check ? REVIEW.checks.find((c) => c.id === stop.check) : undefined;
  const answeredCount = REVIEW.checks.filter((c) => answers[c.id]).length;
  const swallow = (event: React.SyntheticEvent) => event.stopPropagation();

  return (
    <>
      <div className="tour-ring" ref={ringRef} aria-hidden="true" data-testid="tour-ring" />
      <div
        className={`tour-card${collapsed ? ' is-collapsed' : ''}`}
        ref={cardRef}
        data-testid="tour-card"
        data-stop={stop.id}
        data-done={done ? 'true' : 'false'}
        role="region"
        aria-label={`Review tour ${tour.id}`}
        // A press on the card is not a cast; a cast dragged across it still is.
        onPointerDown={swallow}
        onClick={swallow}
      >
        <button type="button" className="tour-head" onClick={() => setCollapsed((c) => !c)} aria-expanded={!collapsed} data-testid="tour-toggle">
          <span className="tour-step">
            Review {tour.id} · {index + 1}/{tour.stops.length}
          </span>
          <span className="tour-title">{stop.title}</span>
          <span className="tour-chevron" aria-hidden="true">{collapsed ? '▾' : '▴'}</span>
        </button>
        {collapsed ? null : (
          <div className="tour-body">
            <p className="tour-line" data-testid="tour-line">{stop.line}</p>
            {waiting ? (
              <p className="tour-status" data-testid="tour-waiting">
                Setting this up once the line is clear. If a fish is on, land it or let it go first.
              </p>
            ) : null}
            {stop.done ? (
              <p className={`tour-status${done ? ' is-done' : ''}`} data-testid="tour-status">
                {done ? `Done ✓${stop.after ? ` ${stop.after}` : ''}` : 'Your turn.'}
              </p>
            ) : null}
            {check ? <p className="tour-check" data-testid="tour-check">{check.text.replace(/^A5 · /, '')}</p> : null}
            {last ? (
              <p className="tour-line">
                {answeredCount} of {REVIEW.checks.length} checks answered.{' '}
                <a href="/ab" data-testid="tour-to-ab">Open /ab</a>
              </p>
            ) : null}
            <div className="tour-nav">
              {check
                ? (['yes', 'no'] as Answer[]).map((value) => (
                    <button
                      key={value}
                      type="button"
                      className={`tour-pick${answers[check.id] === value ? ' is-picked' : ''}`}
                      onClick={() => answer(value)}
                      data-testid={`tour-${value}`}
                    >
                      {value === 'yes' ? 'Yes' : 'No'}
                    </button>
                  ))
                : null}
              <span className="tour-spacer" />
              <button type="button" className="tour-btn" onClick={() => go(index - 1)} disabled={index === 0} data-testid="tour-back" aria-label="Back">
                ‹
              </button>
              {stop.reveal && !stop.point ? (
                <button type="button" className="tour-btn" onClick={() => setRevealed(true)} disabled={revealed} data-testid="tour-reveal">
                  {revealed ? 'Shown' : 'Show me'}
                </button>
              ) : null}
              {last ? (
                <button type="button" className="tour-btn tour-btn--next is-ready" onClick={() => go(0)} data-testid="tour-restart">
                  Start over
                </button>
              ) : (
                <button
                  type="button"
                  className={`tour-btn tour-btn--next${done || !stop.done ? ' is-ready' : ''}`}
                  onClick={() => go(index + 1)}
                  data-testid="tour-next"
                >
                  {done || !stop.done ? 'Next' : 'Skip'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
