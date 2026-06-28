import { redirect } from 'next/navigation';

// The landing splash lived here and on /game as two identical copies, so web
// visitors tapped through the splash on / only to be dropped onto a pixel-
// identical splash on /game — it read as a stuck/looping splash. The canonical
// splash is GameClient's (its "Tap to start" calls begin(), the user gesture
// that unlocks audio/haptics), so / just forwards to it. This also matches the
// PWA manifest start_url, which is already /game.
export default function HomePage() {
  redirect('/game');
}
