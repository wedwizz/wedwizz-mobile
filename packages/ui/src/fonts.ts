import { useFonts } from "expo-font";
import { Fraunces_600SemiBold } from "@expo-google-fonts/fraunces/600SemiBold";
import { Inter_400Regular } from "@expo-google-fonts/inter/400Regular";
import { Inter_500Medium } from "@expo-google-fonts/inter/500Medium";
import { Inter_600SemiBold } from "@expo-google-fonts/inter/600SemiBold";
import { Inter_700Bold } from "@expo-google-fonts/inter/700Bold";
import { PlusJakartaSans_600SemiBold } from "@expo-google-fonts/plus-jakarta-sans/600SemiBold";
import { PlusJakartaSans_700Bold } from "@expo-google-fonts/plus-jakarta-sans/700Bold";
import { PlusJakartaSans_800ExtraBold } from "@expo-google-fonts/plus-jakarta-sans/800ExtraBold";
import { fonts } from "./tokens";

// Only the weights in `fonts` are bundled (the per-weight imports keep the other ~30 files out of the app).
const fontFiles: Record<(typeof fonts)[keyof typeof fonts], number> = {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
  Fraunces_600SemiBold,
};

/**
 * Loads the app fonts. Returns true once they are ready, or once loading failed (text then falls back to the system font
 * rather than the app staying on the splash screen).
 */
export function useAppFonts(): boolean {
  const [loaded, error] = useFonts(fontFiles);
  return loaded || error !== null;
}
