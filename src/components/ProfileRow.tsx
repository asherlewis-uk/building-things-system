import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { radii, spacing, typography } from "../theme/tokens";
import { useHaptics } from "../hooks/useHaptics";
import { useTheme } from "../theme/useTheme";
import { getGlowStyle } from "./themeStyles";

type Props = {
  name: string;
  subtitle?: string;
  initials?: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

export function ProfileRow({
  name,
  subtitle = "Local profile",
  initials = "AI",
  onPress,
  style,
}: Props) {
  const theme = useTheme();
  const { selection } = useHaptics();
  const content = (
    <View
      style={[
        styles.container,
        getGlowStyle(theme.glow.idle),
        {
          backgroundColor: theme.surface.glassTint,
          borderColor: theme.border.idle,
          borderWidth: 1,
        },
        style,
      ]}
    >
      <View
        style={[
          styles.avatar,
          {
            backgroundColor: theme.surface.elevated,
            borderColor: theme.state.idle,
          },
        ]}
      >
        <Text
          style={[
            typography.subheadline,
            styles.initials,
            { color: theme.text.primary },
          ]}
        >
          {initials}
        </Text>
      </View>
      <View style={styles.copy}>
        <Text style={[typography.subheadline, { color: theme.text.primary }]}>
          {name}
        </Text>
        <Text style={[typography.footnote, { color: theme.text.secondary }]}>
          {subtitle}
        </Text>
      </View>
    </View>
  );

  if (!onPress) {
    return content;
  }

  return (
    <Pressable
      onPress={() => {
        selection();
        onPress();
      }}
      accessibilityRole="button"
      accessibilityLabel={name}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: radii.control,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: radii.full,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  initials: {
    fontFamily: "Inter_600SemiBold",
  },
  copy: {
    flex: 1,
    gap: 2,
  },
});
