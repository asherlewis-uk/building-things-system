import React from "react";
import {
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { useTheme } from "../theme/useTheme";

type SurfaceVariant = "default" | "secondary" | "grouped" | "elevated";

type Props = {
  variant?: SurfaceVariant;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function Surface({ variant = "default", children, style }: Props) {
  const { colors, elevation: elev, radii } = useTheme();

  const variantStyles: Record<SurfaceVariant, ViewStyle> = {
    default: {
      backgroundColor: colors.systemBackground,
    },
    secondary: {
      backgroundColor: colors.secondarySystemBackground,
      borderRadius: radii.lg,
    },
    grouped: {
      backgroundColor: colors.secondaryGroupedBackground,
      borderRadius: radii.lg,
    },
    elevated: {
      backgroundColor: colors.secondarySystemBackground,
      borderRadius: radii.lg,
      ...elev.md,
    },
  };

  return (
    <View style={[variantStyles[variant], style]}>
      {children}
    </View>
  );
}
