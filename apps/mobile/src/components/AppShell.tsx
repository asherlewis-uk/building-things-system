import React from "react";
import {
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { screenInsets, spacing } from "../theme/tokens";
import { useTheme } from "../theme/useTheme";

type Props = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
};

export function AppShell({ children, style, contentStyle }: Props) {
  const theme = useTheme();

  return (
    <View style={[styles.shell, { backgroundColor: theme.surface.base }, style]}>
      <View pointerEvents="none" style={styles.backdrop}>
        <View style={styles.topGlow} />
        <View style={styles.bottomGlow} />
        <View style={styles.scrim} />
      </View>
      <View style={[styles.content, contentStyle]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    overflow: "hidden",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  topGlow: {
    position: "absolute",
    top: -120,
    left: -72,
    width: 320,
    height: 320,
    borderRadius: 999,
    backgroundColor: "rgba(67, 195, 195, 0.14)",
  },
  bottomGlow: {
    position: "absolute",
    right: -96,
    bottom: -168,
    width: 360,
    height: 360,
    borderRadius: 999,
    backgroundColor: "rgba(62, 189, 255, 0.12)",
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(4, 18, 21, 0.24)",
  },
  content: {
    flex: 1,
    paddingHorizontal: screenInsets.horizontal,
    paddingVertical: spacing.lg,
  },
});
