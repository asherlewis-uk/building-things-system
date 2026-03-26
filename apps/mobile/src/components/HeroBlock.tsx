import React from "react";
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";

import { spacing, typography } from "../theme/tokens";
import { useTheme } from "../theme/useTheme";

type Props = {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function HeroBlock({
  eyebrow = "ai.mine",
  title,
  description,
  children,
  style,
}: Props) {
  const theme = useTheme();

  return (
    <View style={[styles.container, style]}>
      <Text
        style={[
          typography.sectionHeader,
          styles.eyebrow,
          { color: theme.text.secondary },
        ]}
      >
        {eyebrow}
      </Text>
      <Text style={[typography.title1, { color: theme.text.primary }]}>{title}</Text>
      {description ? (
        <Text
          style={[typography.body, styles.description, { color: theme.text.secondary }]}
        >
          {description}
        </Text>
      ) : null}
      {children ? <View style={styles.actions}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  eyebrow: {
    letterSpacing: 1,
  },
  description: {
    maxWidth: 520,
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    paddingTop: spacing.xs,
  },
});
