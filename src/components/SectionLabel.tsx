import React from "react";
import {
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { screenInsets, spacing, typography } from "../theme/tokens";
import { useTheme } from "../theme/useTheme";

type Props = {
  label?: string;
  aside?: React.ReactNode;
  title?: string;
  style?: StyleProp<ViewStyle>;
};

export function SectionLabel({ label, aside, title, style }: Props) {
  const theme = useTheme();
  const resolvedLabel = label ?? title;

  if (!resolvedLabel) {
    return null;
  }

  return (
    <View style={[styles.container, style]}>
      <Text
        style={[
          typography.sectionHeader,
          styles.label,
          { color: theme.text.secondary },
        ]}
      >
        {resolvedLabel}
      </Text>
      {aside ? (
        <View style={styles.asideWrap}>
          {typeof aside === "string" || typeof aside === "number" ? (
            <Text
              style={[
                typography.caption1,
                styles.aside,
                { color: theme.text.tertiary },
              ]}
            >
              {aside}
            </Text>
          ) : (
            aside
          )}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xs,
    paddingHorizontal: screenInsets.horizontal,
  },
  label: {
    flex: 1,
  },
  asideWrap: {
    alignItems: "flex-end",
  },
  aside: {
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
});
