// Set in next.config.mjs (the one source); these fallbacks only apply outside Next.
export const CURRENT_CANDIDATE_TAG =
  process.env.NEXT_PUBLIC_REEL_CANDIDATE_TAG ?? 'v1.2-habits-candidate';

export const CURRENT_MILESTONE = process.env.NEXT_PUBLIC_REEL_MILESTONE ?? 'a3-habits';

export function approvedTagFor(candidateTag: string): string {
  return candidateTag.replace('-candidate', '-approved');
}
