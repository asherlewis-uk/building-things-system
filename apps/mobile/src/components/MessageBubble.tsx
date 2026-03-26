import React from "react";
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";

import type { Message } from "@/context/ChatsContext";
import { useSettings } from "@/context/SettingsContext";

import { radii, spacing, typography } from "../theme/tokens";
import { useTheme } from "../theme/useTheme";
import { getGlowStyle } from "./themeStyles";

type Props = {
  message: Message;
  failed?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function MessageBubble({ message, failed = false, style }: Props) {
  const theme = useTheme();
  const { settings } = useSettings();
  const isCompact = settings.density === "compact";
  const outbound = message.role === "user";
  const bubbleBorder = failed
    ? theme.state.danger
    : outbound
      ? theme.border.active
      : theme.border.idle;
  const bubbleBackground = failed
    ? theme.surface.elevated
    : outbound
      ? theme.surface.elevated
      : theme.surface.glassTint;

  return (
    <View style={[styles.row, outbound ? styles.outboundRow : styles.inboundRow, style]}>
      <View
        style={[
          styles.bubble,
          getGlowStyle(outbound || failed ? theme.glow.active : theme.glow.idle),
          {
            backgroundColor: bubbleBackground,
            borderColor: bubbleBorder,
            borderWidth: 1,
            paddingHorizontal: isCompact ? spacing.sm + 4 : spacing.base,
            paddingVertical: isCompact ? spacing.sm : spacing.sm + 2,
            maxWidth: isCompact ? "86%" : "82%",
          },
          outbound ? styles.outboundBubble : styles.inboundBubble,
        ]}
      >
        <Text
          style={[
            typography.body,
            {
              color: failed ? theme.palette.white : theme.text.primary,
            },
          ]}
        >
          {message.content}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.xs,
  },
  inboundRow: {
    justifyContent: "flex-start",
  },
  outboundRow: {
    justifyContent: "flex-end",
  },
  bubble: {
    borderRadius: radii.card,
  },
  inboundBubble: {
    borderBottomLeftRadius: radii.sm,
  },
  outboundBubble: {
    borderBottomRightRadius: radii.sm,
  },
});
