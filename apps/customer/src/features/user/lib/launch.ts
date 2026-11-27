// Copied from the web: features/user/lib/launch.ts.
/**
 * Features that only have sample content (items kept in the app, nothing saved on the server), hidden for launch:
 * no links lead to them and their pages go Home. Set one to true to bring it back once it has real data.
 */
export const SAMPLE_FEATURES = {
  market: false,
  inspiration: false,
  invitations: false,
} as const;

/** The page of a hidden sample feature, if this path is one (for the routes' redirect). */
export function isHiddenSamplePath(path: string): boolean {
  return (
    (!SAMPLE_FEATURES.market && path.startsWith("/user/market")) ||
    (!SAMPLE_FEATURES.inspiration && path.startsWith("/user/inspiration")) ||
    (!SAMPLE_FEATURES.invitations && path.startsWith("/user/invitations"))
  );
}
