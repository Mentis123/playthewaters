// Every share to social ends with the game's hashtag (owner, 25 Oct 2026:
// "every share for social, from a catch or at any point"). One source, so a
// new share path cannot forget it.
export const HASHTAG = '#PlayTheWaters';

export function withHashtag(text: string): string {
  const trimmed = text.trim();
  if (trimmed.toLowerCase().endsWith(HASHTAG.toLowerCase())) return trimmed;
  return trimmed ? `${trimmed} ${HASHTAG}` : HASHTAG;
}
