import React from "react";
import { StyleSheet, Switch, Text, View, type StyleProp, type ViewStyle } from "react-native";

import { useSettings } from "@/context/SettingsContext";

import { radii, spacing, typography } from "../theme/tokens";
import { useTheme } from "../theme/useTheme";
import { getGlowStyle } from "./themeStyles";

type Props = {
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function ToggleRow({
  label,
  description,
  value,
  onValueChange,
  disabled = false,
  style,
}: Props) {
  const theme = useTheme();
  const { settings } = useSettings();
  const isCompact = settings.density === "compact";

  return (
    <View
      style={[
        styles.container,
        getGlowStyle(value ? theme.glow.active : theme.glow.idle),
        {
          borderColor: value ? theme.border.active : theme.border.idle,
          backgroundColor: value
            ? theme.surface.elevated
            : theme.surface.glassTint,
          opacity: disabled ? 0.6 : 1,
          borderWidth: 1,
        },
        {
          paddingHorizontal: isCompact ? spacing.sm + 4 : spacing.base,
          paddingVertical: isCompact ? spacing.xs + 6 : spacing.sm,
        },
        style,
      ]}
    >
      <View style={styles.copy}>
        <Text style={[typography.body, { color: theme.text.primary }]}>{label}</Text>
        {description ? (
          <Text style={[typography.footnote, { color: theme.text.secondary }]}>
            {description}
          </Text>
        ) : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: theme.state.idle, true: theme.state.active }}
        thumbColor={value ? theme.text.primary : theme.surface.base}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.base,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: radii.control,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
});
