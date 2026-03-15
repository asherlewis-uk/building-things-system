import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TextInput, View } from "react-native";

import { useTheme } from "@/src/theme/useTheme";

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
};

export function SearchBar({
  value,
  onChangeText,
  placeholder = "Search personas...",
  autoFocus,
}: Props) {
  const { colors, radii, hitTarget, typography: t } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.fill,
          borderRadius: radii.md,
          minHeight: hitTarget.minimum,
        },
      ]}
      accessibilityRole="search"
    >
      <Feather name="search" size={16} color={colors.placeholderText} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.placeholderText}
        style={[styles.input, t.body, { color: colors.label }]}
        autoFocus={autoFocus}
        returnKeyType="search"
        autoCorrect={false}
        autoCapitalize="none"
        accessibilityLabel={placeholder}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
  },
  input: {
    flex: 1,
    padding: 0,
  },
});
