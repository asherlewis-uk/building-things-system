import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { spectral } from "@/constants/colors";

type Props = {
  onPress: () => void;
  label?: string;
  disabled?: boolean;
  style?: any;
  children?: React.ReactNode;
};

export function SpectralButton({
  onPress,
  label,
  disabled,
  style,
  children,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.wrapper,
        { opacity: pressed ? 0.85 : disabled ? 0.5 : 1 },
        style,
      ]}
    >
      <LinearGradient
        colors={[spectral.green, spectral.blue, spectral.violet]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        {children || (
          <Text style={styles.label}>{label}</Text>
        )}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 24,
    overflow: "hidden",
  },
  gradient: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 24,
  },
  label: {
    color: "#FFFFFF",
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
});
