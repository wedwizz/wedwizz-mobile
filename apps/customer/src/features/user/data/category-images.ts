/**
 * Home category pictures, matched by the category key (assets/images/<name>.png, supplied by the user). A category key missing here
 * keeps its icon in a tinted circle.
 */
export const CATEGORY_IMAGES: Partial<Record<string, number>> = {
  venues: require("@/assets/images/venues.png") as number,
  photographers: require("@/assets/images/photographers.png") as number,
  makeup: require("@/assets/images/makeup.png") as number,
  decorators: require("@/assets/images/decorators.png") as number,
  planners: require("@/assets/images/planners.png") as number,
  catering: require("@/assets/images/catering.png") as number,
  music: require("@/assets/images/music.png") as number,
  invites: require("@/assets/images/invites.png") as number,
  more: require("@/assets/images/more.png") as number,
};

/** Home's "Your Wedding Planner" pictures (3D, transparent; supplied by the user 2026-11-26), by the tool's route. */
export const PLANNER_IMAGES: Partial<Record<string, number>> = {
  "/user/checklist": require("@/assets/images/planner-checklist.png") as number,
  "/user/favourites": require("@/assets/images/planner-shortlisted.png") as number,
  "/user/invitations": require("@/assets/images/planner-invites.png") as number,
  "/user/inspiration": require("@/assets/images/planner-inspiration.png") as number,
};
