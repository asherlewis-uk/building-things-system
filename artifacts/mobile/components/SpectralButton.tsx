import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { useTheme } from "@/src/theme/useTheme";

type Props = {
  onPress: () => void;
  label?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
};

export function SpectralButton({
  onPress,
  label,
  disabled,
  style,
  children,
}: Props) {
  const { colors, gradients, radii, typography: t, opacity: op } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.wrapper,
        { borderRadius: radii.full, opacity: pressed ? op.pressed : disabled ? 0.5 : 1 },
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
    >
      <LinearGradient
        colors={gradients.spectral.colors}
        start={gradients.spectral.start}
        end={gradients.spectral.end}
        style={[styles.gradient, { borderRadius: radii.full }]}
      >
        {children || (
          <Text style={[t.subheadline, styles.label, { color: colors.onTint }]}>{label}</Text>
        )}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    overflow: "hidden",
  },
  gradient: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontFamily: "Inter_600SemiBold",
  },
});
