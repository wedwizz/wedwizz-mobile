import { SessionCheck } from "@/dev/session-check";

// TEMPORARY (step 3): the session check stands in for the profile page until flow 1 adds real sign-in.
// Flow 6 builds this tab from ../frontend/src/features/user/pages/profile/profile-page.tsx.
export default function ProfileTab() {
  return <SessionCheck />;
}
