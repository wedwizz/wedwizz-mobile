import { useEffect, useState } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { Image, type ImageSource } from "expo-image";
import { Heart } from "lucide-react-native";
import { colors } from "./tokens";

interface SafeImageProps {
  /** A URL, a bundled image (require), or null (e.g. a listing without photos) for the placeholder. */
  source: string | number | ImageSource | null;
  /** Read by screen readers (web alt). Empty for decorative pictures. */
  alt: string;
  /** Size, corners and position of the picture. */
  style?: StyleProp<ViewStyle>;
  contentFit?: "cover" | "contain";
}

/** Image that falls back to a soft pink placeholder with a heart if there is none, or it fails to load (web SafeImage). */
export function SafeImage({ source, alt, style, contentFit = "cover" }: SafeImageProps) {
  const [failed, setFailed] = useState(false);
  // A new photo gets a new chance to load.
  useEffect(() => setFailed(false), [source]);
  const missing = failed || source === null || source === "";

  return (
    <View
      style={[styles.frame, missing && styles.placeholder, style]}
      accessible={alt !== ""}
      accessibilityRole={alt !== "" ? "image" : undefined}
      accessibilityLabel={alt || undefined}
    >
      {missing ? (
        <Heart size={28} color={colors.brand} opacity={0.4} />
      ) : (
        <Image
          source={source}
          style={StyleSheet.absoluteFill}
          contentFit={contentFit}
          transition={150}
          onError={() => setFailed(true)}
          recyclingKey={typeof source === "string" ? source : undefined}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { overflow: "hidden", alignItems: "center", justifyContent: "center" },
  placeholder: { backgroundColor: colors.tintPink },
});
