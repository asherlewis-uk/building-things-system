import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useTheme } from "@/src/theme/useTheme";
import type { Message } from "@/context/ChatsContext";

type Props = {
  message: Message;
};

export function MessageBubble({ message }: Props) {
  const { colors, typography: t, radii } = useTheme();
  const isUser = message.role === "user";

  return (
    <View
      style={[styles.row, isUser ? styles.rowUser : styles.rowAssistant]}
      accessibilityRole="text"
      accessibilityLabel={`${isUser ? "You" : "Assistant"}: ${message.content}`}
    >
      <View
        style={[
          styles.bubble,
          {
            borderRadius: radii.xxl - 6,
            backgroundColor: isUser
              ? colors.tint
              : colors.secondarySystemBackground,
          },
          isUser ? styles.userBubble : styles.assistantBubble,
        ]}
      >
        <Text style={[t.body, { color: isUser ? colors.onTint : colors.label }]}>
          {message.content}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: 16,
    paddingVertical: 3,
    flexDirection: "row",
  },
  rowUser: {
    justifyContent: "flex-end",
  },
  rowAssistant: {
    justifyContent: "flex-start",
  },
  bubble: {
    maxWidth: "80%",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  userBubble: {
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    borderBottomLeftRadius: 4,
  },
});
