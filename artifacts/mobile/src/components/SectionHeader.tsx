import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useTheme } from "../theme/useTheme";

type Props = {
  title: string;
  accessibilityLabel?: string;
};

export function SectionHeader({ title, accessibilityLabel }: Props) {
  const { colors, typography: t, spacing: sp, screenInsets } = useTheme();

  return (
    <View
      style={[
        styles.container,
        { paddingHorizontal: screenInsets.horizontal },
      ]}
      accessibilityRole="header"
      accessibilityLabel={accessibilityLabel ?? title}
    >
      <Text
        style={[
          t.sectionHeader,
          { color: colors.secondaryLabel },
        ]}
      >
        {title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 24,
    paddingBottom: 6,
  },
});
