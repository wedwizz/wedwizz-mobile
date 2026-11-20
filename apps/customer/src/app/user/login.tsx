import { ScreenPlaceholder } from "@wedwizz/ui";

// Target of useRequireLogin (a guest's gated tap) with the page to return to in the `from` param.
export default function Login() {
  return <ScreenPlaceholder title="Log in" note="Flow 1, from ../frontend/src/features/user/pages/auth/login-page.tsx" />;
}
