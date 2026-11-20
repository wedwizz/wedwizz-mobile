import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

// Screens outside the tabs (login, detail pages, chat threads) are added to this stack in their flows.
export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}
