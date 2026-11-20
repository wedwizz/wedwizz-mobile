import { Redirect } from "expo-router";

// The app uses the web's paths (/user/...), so the copied path logic (return paths, listing links, the profile-setup
// gate) works unchanged and shared web links map 1:1 onto app screens. The app opens on Home.
export default function Index() {
  return <Redirect href="/user/home" />;
}
