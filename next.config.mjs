function currentCandidateTag() {
  if (process.env.NEXT_PUBLIC_REEL_CANDIDATE_TAG) {
    return process.env.NEXT_PUBLIC_REEL_CANDIDATE_TAG;
  }

  // The build's chapter. This is the ONE place it is set (src/lib/buildInfo.ts
  // only falls back to it outside Next): bump it with each chapter, or /dev
  // shows the wrong gate and playtest answers carry the wrong version. Found
  // 24 Oct 2026: it still said v0.4 through A1, A2 and A3.
  return 'v1.3-wall-candidate';
}

function currentMilestone(tag) {
  if (tag.startsWith('v1.3-') || tag.startsWith('v1.3.')) {
    return 'a4-wall';
  }

  if (tag.startsWith('v1.2-') || tag.startsWith('v1.2.')) {
    return 'a3-habits';
  }

  if (tag.startsWith('v1.1-')) {
    return 'a2-bank';
  }

  if (tag.startsWith('v1.0-')) {
    return 'a1-light';
  }

  if (tag.startsWith('v0.4-')) {
    return 'far-water';
  }

  if (tag.startsWith('v0.3.2-')) {
    return 'm3.2';
  }

  if (tag.startsWith('v0.3.1-')) {
    return 'm3.1';
  }

  if (tag.startsWith('v0.3-')) {
    return 'm3';
  }

  if (tag.startsWith('v0.2-')) {
    return 'm2';
  }

  if (tag.startsWith('v0.1.5-')) {
    return 'm1.5';
  }

  return tag.startsWith('v0.1-') ? 'm1' : 'm0';
}

const candidateTag = currentCandidateTag();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  outputFileTracing: !process.cwd().includes('#'),
  env: {
    NEXT_PUBLIC_REEL_CANDIDATE_TAG: candidateTag,
    NEXT_PUBLIC_REEL_MILESTONE: currentMilestone(candidateTag)
  },
  async redirects() {
    // The landing splash is GameClient's (its "Tap to start" calls begin(), the
    // user gesture that unlocks audio/haptics), so / forwards to /game — matching
    // the PWA manifest start_url. This MUST be a config-level redirect, not a
    // React `redirect('/game')` in app/page.tsx: a statically-prerendered page
    // that calls redirect() emits a 307 with NO Location header and a hydrating
    // error shell, so the redirect only completes after React boots on the
    // client. On mobile (standalone PWA launched at /, service worker in play)
    // that boomerang re-enters /, remounting GameClient and bouncing it back to
    // the splash — the screen kept cycling splash → credits → start → splash.
    // A config redirect is a real HTTP redirect with a Location header, resolved
    // before any React renders.
    return [
      {
        source: '/',
        destination: '/game',
        permanent: false
      }
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // The game uses none of these; deny them outright.
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' }
        ]
      },
      {
        // Content-addressed static assets are safe to cache forever.
        source: '/assets/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }]
      },
      {
        // The service worker itself must always revalidate, or updates stall.
        source: '/sw.js',
        headers: [{ key: 'Cache-Control', value: 'no-cache, must-revalidate' }]
      }
    ];
  }
};

export default nextConfig;
