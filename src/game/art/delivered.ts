// Which commissioned images have landed (public/art/prompts.json). The game
// only requests an image once it is here: a request for a missing file is a
// console 404 on every visit, which the checks rightly treat as an error.
// Flip a flag in the same commit that wires the art in.
export const ART_DELIVERED = {
  lilypads: true, // public/assets/sprites/lilypads.webp (A5 prompt 12)
  oldSinker: true, // public/assets/sprites/old_sinker.webp (A5 prompt 14)
  benchWood: true, // public/assets/textures/bench-wood.webp (A5 prompt 15)
  legend: true, // public/assets/fish/old_mossback.webp (A5 prompt 11)
  treeline02: true // public/assets/textures/treeline-02.png (A5 prompt 13)
} as const;
