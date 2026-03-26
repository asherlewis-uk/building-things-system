import { Platform, type ViewStyle } from "react-native";

import { glow, type Theme } from "../theme/tokens";

export type GlowKey = keyof Theme["glow"];
export type GlowToken = Theme["glow"][GlowKey];

export function getGlowStyle(token: GlowToken | GlowKey): ViewStyle {
  const resolved = typeof token === "string" ? glow[token] : token;

  return {
    shadowColor: resolved.shadowColor,
    shadowOffset: resolved.shadowOffset,
    shadowOpacity: resolved.shadowOpacity,
    shadowRadius: resolved.shadowRadius,
    elevation: resolved.elevation,
    borderColor: resolved.ringColor,
    borderWidth: resolved.ringWidth,
  };
}

export const glassBlurProps = Platform.select({
  ios: {
    tint: "systemChromeMaterialDark" as const,
    intensity: 44,
  },
  android: {
    tint: "dark" as const,
    intensity: 36,
    experimentalBlurMethod: "dimezisBlurView" as const,
  },
  default: {
    tint: "dark" as const,
    intensity: 40,
  },
});
