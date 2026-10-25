'use client';

import { useEffect, useState } from 'react';

import { CURRENT_CANDIDATE_TAG } from '@/lib/buildInfo';
import { commentWithLure, deviceLabel, FEEDBACK_ENDPOINT, gearSummary } from '@/game/dev/playtest';
import { getGear } from '@/game/persistence/gearStore';
import { getJournal } from '@/game/persistence/catchJournal';

// The five-strangers playtest (docs/alpha/A3_RUBRIC.md §3.2). Shared by the
// owner as a private link. The open question comes FIRST and alone, so the
// checklist that follows cannot put words in anyone's mouth.

const CHECKS = [
  { id: 'homes', text: 'The same kinds of fish kept turning up in the same places' },
  { id: 'lights', text: 'Some fish were busier at certain times of day' },
  { id: 'spook', text: 'A fish shot off when my lure landed right on it' },
  { id: 'still', text: 'Some fish only took the lure once I kept it completely still' },
  { id: 'ring', text: 'I noticed a faint ring around the lure' }
] as const;

type Answer = 'yes' | 'no' | 'unsure';
type Step = 'intro' | 'noticed' | 'more' | 'sending' | 'done';

const NAME_KEY = 'thewaters.playtest.name';

export function PlaytestForm() {
  const [step, setStep] = useState<Step>('intro');
  const [tester, setTester] = useState('');
  const [noticed, setNoticed] = useState('');
  const [checks, setChecks] = useState<Record<string, Answer>>({});
  const [minutes, setMinutes] = useState('');
  const [fun, setFun] = useState<number | null>(null);
  const [again, setAgain] = useState('');
  const [broken, setBroken] = useState('');
  const [comment, setComment] = useState('');
  const [lure, setLure] = useState('');
  const [website, setWebsite] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      setTester(window.localStorage.getItem(NAME_KEY) ?? '');
    } catch {
      // Private mode: no remembered name.
    }
  }, []);

  const submit = async () => {
    setStep('sending');
    setError('');
    try {
      window.localStorage.setItem(NAME_KEY, tester);
    } catch {
      // ignore
    }
    const sha = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA;
    try {
      const response = await fetch(FEEDBACK_ENDPOINT, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          tester,
          noticed,
          checks,
          minutes,
          fun,
          again,
          broken,
          comment: commentWithLure(lure, comment),
          website,
          build: sha ? `${CURRENT_CANDIDATE_TAG}@${sha.slice(0, 7)}` : CURRENT_CANDIDATE_TAG,
          device: `${deviceLabel(navigator.userAgent, window.screen.width, window.screen.height)} · ${gearSummary(getGear().rodId, getJournal().catches.map((c) => c.lure))}`
        })
      });
      const result = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!response.ok || !result.ok) throw new Error(result.error || `error ${response.status}`);
      setStep('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setStep('more');
    }
  };

  return (
    <main className="ab-gate playtest">
      <p className="eyebrow">The Waters · playtest</p>

      {step === 'intro' ? (
        <>
          <h1>Thanks for helping</h1>
          <p className="ab-lede">
            The Waters is a small fishing game for your phone. I want to know what you notice, without me telling you anything first.
          </p>
          <ol className="playtest-steps">
            <li>
              <a className="ab-open" href="/game" target="_blank" rel="noopener">
                Open the game
              </a>
              Play for about 10 minutes. Don&apos;t look anything up about it.
            </li>
            <li>Come back to this page and tell me what you noticed. It takes about 3 minutes.</li>
          </ol>
          <label className="playtest-field">
            Your first name or initials (optional)
            <input value={tester} onChange={(e) => setTester(e.target.value)} maxLength={60} autoComplete="given-name" />
          </label>
          <button type="button" className="ab-pick is-picked" onClick={() => setStep('noticed')}>
            I&apos;ve played. Next
          </button>
        </>
      ) : null}

      {step === 'noticed' ? (
        <>
          <h1>What did you notice about how the fish behave?</h1>
          <p className="ab-lede">
            Anything at all: where they were, when, what made them come close or go away. &ldquo;Nothing really&rdquo; is a useful answer too.
          </p>
          <textarea
            className="playtest-text"
            value={noticed}
            onChange={(e) => setNoticed(e.target.value)}
            rows={7}
            maxLength={4000}
            autoFocus
            data-testid="playtest-noticed"
          />
          <button type="button" className="ab-pick is-picked" disabled={noticed.trim().length < 3} onClick={() => setStep('more')}>
            Next
          </button>
        </>
      ) : null}

      {step === 'more' || step === 'sending' ? (
        <>
          <h1>A few quick ones</h1>
          <p className="ab-lede">Now that you&apos;ve answered in your own words: did you notice any of these?</p>
          {CHECKS.map((check) => (
            <fieldset key={check.id} className="playtest-check">
              <legend>{check.text}</legend>
              <div className="playtest-choices">
                {(['yes', 'no', 'unsure'] as const).map((value) => (
                  <button
                    key={value}
                    type="button"
                    className={checks[check.id] === value ? 'ab-pick is-picked' : 'ab-pick'}
                    onClick={() => setChecks((c) => ({ ...c, [check.id]: value }))}
                  >
                    {value === 'unsure' ? 'Not sure' : value === 'yes' ? 'Yes' : 'No'}
                  </button>
                ))}
              </div>
            </fieldset>
          ))}

          <fieldset className="playtest-check">
            <legend>How long did you play?</legend>
            <div className="playtest-choices">
              {['under 5 min', '5–10 min', '10–20 min', '20+ min'].map((value) => (
                <button key={value} type="button" className={minutes === value ? 'ab-pick is-picked' : 'ab-pick'} onClick={() => setMinutes(value)}>
                  {value}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="playtest-check">
            <legend>How much fun was it? (1 = not at all, 5 = loved it)</legend>
            <div className="playtest-choices">
              {[1, 2, 3, 4, 5].map((value) => (
                <button key={value} type="button" className={fun === value ? 'ab-pick is-picked' : 'ab-pick'} onClick={() => setFun(value)}>
                  {value}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="playtest-check">
            <legend>Would you open it again tomorrow?</legend>
            <div className="playtest-choices">
              {['yes', 'maybe', 'no'].map((value) => (
                <button key={value} type="button" className={again === value ? 'ab-pick is-picked' : 'ab-pick'} onClick={() => setAgain(value)}>
                  {value[0].toUpperCase() + value.slice(1)}
                </button>
              ))}
            </div>
          </fieldset>

          <label className="playtest-field">
            Anything broken, confusing or annoying?
            <textarea className="playtest-text" value={broken} onChange={(e) => setBroken(e.target.value)} rows={3} maxLength={2000} />
          </label>
          <label className="playtest-field">
            Which lure did you end up using most, and why?
            <textarea className="playtest-text" value={lure} onChange={(e) => setLure(e.target.value)} rows={2} maxLength={600} data-testid="playtest-lure" />
          </label>
          <label className="playtest-field">
            Anything else you want to tell me?
            <textarea className="playtest-text" value={comment} onChange={(e) => setComment(e.target.value)} rows={3} maxLength={4000} />
          </label>
          {/* Bots fill every field; people never see this one. */}
          <input className="playtest-hp" tabIndex={-1} autoComplete="off" aria-hidden="true" value={website} onChange={(e) => setWebsite(e.target.value)} name="website" />

          {error ? <p className="playtest-error">Couldn&apos;t send: {error}. Try again in a moment.</p> : null}
          <button type="button" className="ab-pick is-picked" disabled={step === 'sending'} onClick={submit} data-testid="playtest-submit">
            {step === 'sending' ? 'Sending…' : 'Send'}
          </button>
        </>
      ) : null}

      {step === 'done' ? (
        <section className="ab-result" data-testid="playtest-done">
          <h1>Thank you</h1>
          <p>That really helps. If you play again later and notice something new, you can send another one.</p>
          <button
            type="button"
            className="ab-pick"
            onClick={() => {
              setNoticed('');
              setChecks({});
              setBroken('');
              setComment('');
              setStep('noticed');
            }}
          >
            Send another
          </button>
        </section>
      ) : null}

      <p className="playtest-privacy">
        What&apos;s sent: your answers, the name you typed (if any), the game version and your device type and screen size. No email, no tracking.
      </p>
    </main>
  );
}
