import { Heart } from "lucide-react-native";
import { IconButton } from "./icon-button";
import { colors } from "./tokens";

interface HeartButtonProps {
  /** Saved: a filled pink heart. */
  active: boolean;
  /** The listing's name, for "Save <name> to favourites". */
  label: string;
  onPress: () => void;
  disabled?: boolean;
  /** "surface" (white circle, on photos and cards) or "plain" (header icon over a photo: white heart). */
  variant?: "surface" | "plain";
  diameter?: number;
}

/** The heart on cards and detail headers (web HeartButton). The app wires it to favourites and the login gate. */
export function HeartButton({ active, label, onPress, disabled, variant = "surface", diameter = 36 }: HeartButtonProps) {
  const idle = variant === "plain" ? colors.white : colors.brand;
  return (
    <IconButton
      icon={Heart}
      label={active ? `Remove ${label} from favourites` : `Save ${label} to favourites`}
      selected={active}
      onPress={onPress}
      disabled={disabled}
      variant={variant}
      diameter={diameter}
      color={active ? colors.brand : idle}
      filled={active}
    />
  );
}
