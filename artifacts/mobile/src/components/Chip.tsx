import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useTheme } from "../theme/useTheme";

type Props = {
  label: string;
  selected: boolean;
  onPress: () => void;
  disabled?: boolean;
};

export function Chip({ label, selected, onPress, disabled = false }: Props) {
  const { colors, spacing: sp, radii, typography: t, hitTarget, gradients } =
    useTheme();

  const handlePress = () => {
    if (disabled) return;
    Haptics.selectionAsync();
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.wrapper,
        {
          borderRadius: radii.full,
          opacity: pressed ? 0.7 : disabled ? 0.4 : 1,
          minHeight: hitTarget.minimum,
        },
      ]}
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      accessibilityLabel={`${label} filter`}
    >
      {selected ? (
        <LinearGradient
          colors={gradients.spectral.colors}
          start={gradients.spectral.start}
          end={gradients.spectral.end}
          style={[styles.pill, { borderRadius: radii.full }]}
        >
          <Text style={[t.subheadline, styles.selectedLabel]}>
            {label}
          </Text>
        </LinearGradient>
      ) : (
        <View
          style={[
            styles.pill,
            {
              borderRadius: radii.full,
              backgroundColor: colors.secondarySystemBackground,
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: colors.separator,
            },
          ]}
        >
          <Text style={[t.subheadline, { color: colors.secondaryLabel }]}>
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    overflow: "hidden",
  },
  pill: {
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  selectedLabel: {
    color: "#FFFFFF",
    fontFamily: "Inter_500Medium",
  },
});
