export const CURRENT_CANDIDATE_TAG =
  process.env.NEXT_PUBLIC_REEL_CANDIDATE_TAG ?? 'v1.1-bank-candidate';

export const CURRENT_MILESTONE = process.env.NEXT_PUBLIC_REEL_MILESTONE ?? 'a2-bank';

export function approvedTagFor(candidateTag: string): string {
  return candidateTag.replace('-candidate', '-approved');
}
