export type DevChecklistItem = {
  id: string;
  text: string;
};

export type DevChecklist = {
  milestone: 'm0' | 'm1' | 'm1.5' | 'm2' | 'm3' | 'm3.1' | 'm3.2' | 'far-water' | 'a1-light' | 'a2-bank' | 'a3-habits';
  title: string;
  items: DevChecklistItem[];
};

export const checklists: Record<DevChecklist['milestone'], DevChecklist> = {
  m0: {
    milestone: 'm0',
    title: 'M0 shell gate',
    items: [
      { id: 'home-loads', text: 'Laptop loads / and shows The Waters with Tap to begin.' },
      { id: 'game-loads', text: 'Mobile loads /game via the QR code.' },
      { id: 'dev-qr', text: '/dev shows local network URL, QR code, and current candidate tag.' },
      { id: 'routes', text: '/game and /tune routes exist without errors.' },
      { id: 'vercel', text: 'Vercel deploy succeeds and is reachable on phone.' }
    ]
  },
  m1: {
    milestone: 'm1',
    title: 'M1 vertical slice real-iPhone gate',
    items: [
      { id: 'intent', text: "Within 10 seconds of tapping in, do I understand what I'm supposed to do?" },
      { id: 'cast', text: 'Within 3 seconds of trying, can I successfully cast?' },
      { id: 'cue', text: 'Do I see at least one ambiguous fish-like cue within 15 seconds?' },
      { id: 'reaction', text: 'When my lure splashes near a cue, does something react believably?' },
      { id: 'bite', text: 'Does the bite moment register clearly through audio and visual feedback?' },
      { id: 'hook', text: 'When I successfully hook, does it feel decisive?' },
      { id: 'tension', text: 'During the fight, does line tension communicate through the line itself?' },
      { id: 'failure', text: 'Does at least one failure mode feel learnable rather than buggy?' },
      { id: 'story', text: 'Does the result screen tell a tiny story rather than show stats?' },
      { id: 'repeat', text: 'After one full cycle, do I want to cast again?' }
    ]
  },
  'm1.5': {
    milestone: 'm1.5',
    title: 'M1.5 rod control real-iPhone gate',
    items: [
      { id: 'intent', text: "Within 10 seconds of tapping in, do I understand what I'm supposed to do?" },
      { id: 'cast', text: 'Within 3 seconds of trying, can I successfully cast?' },
      { id: 'cue', text: 'Do I see at least one ambiguous fish-like cue within 15 seconds?' },
      { id: 'reaction', text: 'When my lure splashes near a cue, does something react believably?' },
      { id: 'rod-control', text: 'After the lure lands, can I drag the rod or handle to pull the lure without recasting?' },
      { id: 'bite', text: 'Does the bite moment register clearly through audio and visual feedback?' },
      { id: 'hook', text: 'When I successfully hook, does it feel decisive?' },
      { id: 'tension', text: 'Can I read slack, sweet spot, and danger through line, rod bend, lure motion, and audio before relying on the HUD?' },
      { id: 'failure', text: 'Does at least one failure mode feel learnable rather than buggy?' },
      { id: 'repeat', text: 'After one full cycle, do I want to cast again?' }
    ]
  },
  m2: {
    milestone: 'm2',
    title: 'M2 pond visuals real-iPhone gate',
    items: [
      { id: 'coherent', text: 'Does the pond look like the art direction describes: still, cosy, twilight, ink-wash, and tactile?' },
      { id: 'fps', text: 'Does it hold 60fps on iPhone 13 or better during a short fishing loop?' },
      { id: 'focus', text: 'Does press-and-hold Focus mode visibly reduce water glare?' },
      { id: 'reeds-dock', text: 'Are reeds, dock, and water visually coherent with the palette?' },
      { id: 'playability', text: 'Do the new visuals preserve casting, lure twitch, rod control, bite, hook, fight, failures, and result flow?' }
    ]
  },
  m3: {
    milestone: 'm3',
    title: 'M3 fish variety real-iPhone gate',
    items: [
      { id: 'silhouettes', text: 'Can I distinguish five fish by silhouette alone, without labels in the pond?' },
      { id: 'cue-signatures', text: 'Do bubbles, glints, surface rises, silt, and wakes feel detectably different?' },
      { id: 'same-species', text: 'Do two same-species encounters feel slightly different because of personality?' },
      { id: 'density', text: 'Does fish density feel right: not crowded, not empty?' },
      { id: 'loop-preserved', text: 'Are casting, twitch, rod control, bite, hook, fight, failures, result, debug HUD, /dev, and /tune preserved?' }
    ]
  },
  'm3.1': {
    milestone: 'm3.1',
    title: 'M3.1 fish feel-repair real-iPhone gate',
    items: [
      { id: 'silhouettes', text: 'Can I tell pike from carp from minnow by body shape before I see what they do?' },
      { id: 'cue-signatures', text: 'Do bubbles, glints, rises, silt, and wakes read more clearly than before?' },
      { id: 'same-species', text: 'Do two encounters of the same species feel different in approach, hesitation, or fight?' },
      { id: 'fight', text: 'During the fight, does the fish surge back against the reel so I have to ease off?' },
      { id: 'loop-preserved', text: 'Are casting, twitch, rod control, bite, hook, failures, result, debug HUD, /dev, and /tune preserved?' }
    ]
  },
  'm3.2': {
    milestone: 'm3.2',
    title: 'M3.2 pond-polish real-iPhone gate',
    items: [
      { id: 'fish-visible', text: 'Over the deeper water, can I still find a fish — is it a shadow I have to read, NOT invisible?' },
      { id: 'fish-not-blob', text: 'And the other way: is the fish NOT over-resolved into a hard black blob sitting on top of the water?' },
      { id: 'water-vs-void', text: 'Does the water now read as separate from the surround, instead of dissolving into a same-colour background?' },
      { id: 'seam', text: 'Backdrop seam: does the treeline base still melt into the far water, or does the fog/mist boundary show a line?' },
      { id: 'placement', text: 'Does the treeline still fill the top strip across portrait, tall, and wide?' },
      { id: 'caustics-focus', text: 'Do the caustics visibly calm when I hold Focus, and stop competing with cues in the foreground?' },
      { id: 'loop-preserved', text: 'Are casting, twitch, rod control, bite, hook, fight, failures, result, debug HUD, /dev, and /tune all preserved?' }
    ]
  },
  'far-water': {
    milestone: 'far-water',
    title: 'The far water real-iPhone gate (19_THE_FAR_WATER)',
    items: [
      { id: 'distance', text: 'Does the water feel like it stretches away to a far shore — is distance a real dimension, not a flat slab?' },
      { id: 'murk', text: 'Far out, is it murky — do I see movement, not a clear fish — while the near water reads clearly?' },
      { id: 'reach', text: 'Can I cast all the way out near the far shore, AND drop one in close by the bank?' },
      { id: 'accuracy', text: 'Does a long cast land near-but-not-on where I aimed, while a short cast lands true? Does that read as a mechanic, not a bug?' },
      { id: 'reveal', text: 'Can I lure a far fish in and watch it resolve out of the dark into water I can read — the reel-the-mystery-in moment?' },
      { id: 'rod', text: 'Is the rod doubled, anchored in the bottom-right corner, pointing toward the middle, and swaying to track where I aim?' },
      { id: 'no-dock', text: 'Is the dock gone and the scene still coherent (no floating gap where it was)?' },
      { id: 'loop-preserved', text: 'Do twitch, bite, hook, fight, failures, result, the deeper water + reframed backdrop, /dev and /tune all still hold?' }
    ]
  },
  'a1-light': {
    milestone: 'a1-light',
    title: 'A1 light and water gate',
    items: [
      { id: 'a1-blind', text: 'Run /ab on the iPhone: two rounds, pick a pond each round. The new water must win BOTH (threshold set before the build).' },
      { id: 'a1-near-far', text: 'Near water lighter and readable, far water dark, at every light (?light=dawn|day|dusk|night).' },
      { id: 'a1-fish', text: 'A near fish shadow is findable at all four lights; a far one reads only as movement.' },
      { id: 'a1-drift', text: 'Ten minutes without ?light=: the light visibly drifts and never jumps.' },
      { id: 'a1-return', text: 'Leave and come back: the visit starts at a different light.' },
      { id: 'a1-feel', text: 'Cast, bite, fight and reveal feel exactly as before.' },
      { id: 'a1-phone', text: 'Sharp image, bite tick on the iPhone, sound with the silent switch on, no heat after 10 minutes.' },
      { id: 'a1-rubric', text: 'Score docs/alpha/A1_RUBRIC.md (26 items, pass 22, all starred) and record the result in its section 4.' }
    ]
  },
  'a2-bank': {
    milestone: 'a2-bank',
    title: 'A2 bank gate',
    items: [
      { id: 'a2-blind', text: 'Run /ab on the iPhone: day then dusk, A2 (the bank) against A1. A2 must win BOTH.' },
      { id: 'a2-stones', text: 'The near edge is a row of rounded stones (photo 01), never hiding a fish, the lure or the line.' },
      { id: 'a2-light', text: 'Bank, stones, reeds and far trees all follow the light: dark at night, warm at dusk.' },
      { id: 'a2-air', text: 'Mist on the far water at dawn, none at day; midges at dusk and night, never read as cues.' },
      { id: 'a2-leave', text: 'The leave glyph (top right while reading the water) returns to the title; starting again works.' },
      { id: 'a2-feel', text: 'Cast, bite, fight, reveal and cue readability unchanged from A1.' },
      { id: 'a2-phone', text: 'No frame drops or extra heat over 10 minutes.' },
      { id: 'a2-rubric', text: 'Score docs/alpha/A2_RUBRIC.md (22 items, pass 18, all starred) and record it in section 4.' }
    ]
  },
  'a3-habits': {
    milestone: 'a3-habits',
    title: 'A3 habits gate',
    items: [
      { id: 'a3-blind', text: 'Run /ab on the iPhone (the page says what to try): day then night, A3 against A2. A3 must win BOTH.' },
      { id: 'a3-spook', text: 'Cast right on top of a fish: it darts off to the far dark with a wake and stays away for a while.' },
      { id: 'a3-near', text: 'Cast a little short of a fish: it still comes in, as before.' },
      { id: 'a3-homes', text: 'The same kinds of shadow keep turning up in the same places (stones, reeds, the deep).' },
      { id: 'a3-lights', text: 'Different fish are busy at different lights; at night something big comes up from the deep.' },
      { id: 'a3-still', text: 'Leave the lure dead still near a fish: a faint ring closes; some fish only take it then.' },
      { id: 'a3-strangers', text: 'Five people, untold, 10 minutes each: does at least one habit get named by three of them?' },
      { id: 'a3-rubric', text: 'Score docs/alpha/A3_RUBRIC.md (18 items, pass 14, all starred) and record it in section 5.' }
    ]
  }
};

export function getChecklist(milestone: string): DevChecklist {
  if (milestone === 'a3-habits') {
    return checklists['a3-habits'];
  }

  if (milestone === 'a2-bank') {
    return checklists['a2-bank'];
  }

  if (milestone === 'a1-light') {
    return checklists['a1-light'];
  }

  if (milestone === 'far-water') {
    return checklists['far-water'];
  }

  if (milestone === 'm3.2') {
    return checklists['m3.2'];
  }

  if (milestone === 'm3.1') {
    return checklists['m3.1'];
  }

  if (milestone === 'm3') {
    return checklists.m3;
  }

  if (milestone === 'm2') {
    return checklists.m2;
  }

  if (milestone === 'm1.5') {
    return checklists['m1.5'];
  }

  return milestone === 'm1' ? checklists.m1 : checklists.m0;
}
