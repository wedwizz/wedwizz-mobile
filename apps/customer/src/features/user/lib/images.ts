/** Placeholder photo helper. Swap for real CDN/API image URLs when the backend exists. */
export const photo = (seed: string, w = 800, h = 600): string =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`;
