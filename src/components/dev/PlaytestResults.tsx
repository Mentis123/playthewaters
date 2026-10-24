'use client';

import { useEffect, useState } from 'react';

import { FEEDBACK_ENDPOINT, gateTally, HABIT_LABELS, HABITS, habitsMentioned } from '@/game/dev/playtest';

// The owner's view of /playtest answers. Needs the read key (given privately);
// it is remembered on this device only.

type Row = {
  id: number;
  tester: string;
  noticed: string;
  answers: { checks?: Record<string, string>; minutes?: string; fun?: number | null; again?: string; broken?: string; comment?: string };
  build: string;
  device: string;
  created_at: string;
};

const KEY_STORE = 'thewaters.playtest.readkey';
const CHECK_LABELS: Record<string, string> = {
  homes: 'Same places',
  lights: 'Busier at some times',
  spook: 'Shot off when landed on',
  still: 'Took a still lure',
  ring: 'Saw the ring'
};

export function PlaytestResults() {
  const [key, setKey] = useState('');
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState('');

  const load = async (k: string) => {
    setError('');
    try {
      const response = await fetch(FEEDBACK_ENDPOINT, { headers: { 'x-feedback-key': k }, cache: 'no-store' });
      const result = (await response.json().catch(() => ({}))) as { ok?: boolean; rows?: Row[]; error?: string };
      if (!response.ok || !result.ok) throw new Error(response.status === 404 ? 'wrong key' : result.error || `error ${response.status}`);
      // Rows from the deploy self-check are kept out of the five.
      setRows((result.rows ?? []).filter((r) => r.tester !== '__selftest__'));
      try {
        window.localStorage.setItem(KEY_STORE, k);
      } catch {
        // ignore
      }
    } catch (err) {
      setRows(null);
      setError(err instanceof Error ? err.message : 'failed');
    }
  };

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(KEY_STORE);
      if (saved) {
        setKey(saved);
        void load(saved);
      }
    } catch {
      // ignore
    }
  }, []);

  const tally = rows ? gateTally(rows.map((r) => r.noticed)) : null;
  const checkCounts: Record<string, { yes: number; no: number; unsure: number }> = {};
  for (const row of rows ?? []) {
    for (const [id, value] of Object.entries(row.answers.checks ?? {})) {
      checkCounts[id] ??= { yes: 0, no: 0, unsure: 0 };
      if (value === 'yes' || value === 'no' || value === 'unsure') checkCounts[id][value] += 1;
    }
  }
  const funs = (rows ?? []).map((r) => r.answers.fun).filter((f): f is number => typeof f === 'number');

  return (
    <main className="ab-gate playtest">
      <p className="eyebrow">The Waters · playtest results</p>
      <h1>What people noticed</h1>
      <form
        className="playtest-field"
        onSubmit={(e) => {
          e.preventDefault();
          void load(key);
        }}
      >
        Read key
        <input value={key} onChange={(e) => setKey(e.target.value)} type="password" autoComplete="off" />
        <button type="submit" className="ab-pick">
          Load
        </button>
      </form>
      {error ? <p className="playtest-error">{error}</p> : null}

      {rows && tally ? (
        <>
          <section className="ab-brief">
            <h2>The A3 gate: a habit named, untold, by 3 of 5</h2>
            <p>
              {rows.length} {rows.length === 1 ? 'answer' : 'answers'}.{' '}
              {tally.passing.length > 0
                ? `Looks like it passes on: ${tally.passing.map((h) => HABIT_LABELS[h]).join(', ')}. Check the quotes below before you record it.`
                : 'No habit named by 3 people yet.'}
            </p>
            <ul>
              {HABITS.map((h) => (
                <li key={h}>
                  {HABIT_LABELS[h]}: mentioned in {tally.counts[h]} open {tally.counts[h] === 1 ? 'answer' : 'answers'}
                </li>
              ))}
            </ul>
            <p className="playtest-privacy">The habit tags are keyword hints, not a verdict. Read the words.</p>
          </section>

          <section className="ab-round">
            <h2>After the open question, they ticked</h2>
            <ul>
              {Object.entries(CHECK_LABELS).map(([id, label]) => (
                <li key={id}>
                  {label}: {checkCounts[id]?.yes ?? 0} yes · {checkCounts[id]?.no ?? 0} no · {checkCounts[id]?.unsure ?? 0} not sure
                </li>
              ))}
              <li>Fun: {funs.length ? (funs.reduce((a, b) => a + b, 0) / funs.length).toFixed(1) : '–'} / 5</li>
            </ul>
          </section>

          {rows.map((row) => (
            <article key={row.id} className="ab-round playtest-answer">
              <h2>
                {row.tester || 'Anonymous'} · {new Date(row.created_at).toLocaleString()}
              </h2>
              <p className="playtest-quote">&ldquo;{row.noticed}&rdquo;</p>
              <p className="playtest-privacy">
                Tagged: {habitsMentioned(row.noticed).map((h) => HABIT_LABELS[h]).join(', ') || 'none'} · {row.answers.minutes || '?'} ·
                fun {row.answers.fun ?? '?'} · again {row.answers.again || '?'} · {row.device} · {row.build}
              </p>
              {row.answers.broken ? <p>Broken/confusing: {row.answers.broken}</p> : null}
              {row.answers.comment ? <p>Else: {row.answers.comment}</p> : null}
            </article>
          ))}
        </>
      ) : null}
    </main>
  );
}
