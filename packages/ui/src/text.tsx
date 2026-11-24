import { Text, type TextProps } from "react-native";
import { colors, type ColorToken, type TypeToken, type as typeScale } from "./tokens";

export interface AppTextProps extends TextProps {
  /** Text style from the type scale (tokens.ts). Default "body". */
  variant?: TypeToken;
  /** Colour token. Default "ink". */
  color?: ColorToken;
  align?: "left" | "center" | "right";
}

/** All text in the app goes through this, so every screen uses the type scale and colour tokens. */
export function AppText({ variant = "body", color = "ink", align, style, ...props }: AppTextProps) {
  return <Text {...props} style={[typeScale[variant], { color: colors[color] }, align && { textAlign: align }, style]} />;
}
