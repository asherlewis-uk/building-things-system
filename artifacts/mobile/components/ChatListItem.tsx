import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { CharacterAvatar } from "@/components/CharacterAvatar";
import { useTheme } from "@/src/theme/useTheme";
import type { Character } from "@/data/characters";
import type { Conversation } from "@/context/ChatsContext";

type Props = {
  conversation: Conversation;
  character: Character;
};

function formatTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}d`;
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function ChatListItem({ conversation, character }: Props) {
  const { colors, typography: t, spacing: sp, hitTarget } = useTheme();

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: "/chat/[id]",
      params: { id: character.id },
    });
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.container,
        { minHeight: hitTarget.minimum, opacity: pressed ? 0.8 : 1 },
      ]}
      accessibilityLabel={`Chat with ${character.name}. Last message: ${conversation.lastMessage || "No messages yet"}. ${formatTime(conversation.lastMessageTime)}`}
      accessibilityRole="button"
    >
      <CharacterAvatar
        colors={character.avatarColors}
        emoji={character.avatarEmoji}
        size={54}
      />
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text
            style={[
              t.subheadline,
              { color: colors.label, fontFamily: "Inter_600SemiBold", flex: 1 },
            ]}
            numberOfLines={1}
          >
            {character.name}
          </Text>
          <Text style={[t.caption1, { color: colors.tertiaryLabel }]}>
            {formatTime(conversation.lastMessageTime)}
          </Text>
        </View>
        <Text
          style={[t.footnote, { color: colors.secondaryLabel }]}
          numberOfLines={1}
        >
          {conversation.lastMessage || "Say hello!"}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 14,
  },
  content: {
    flex: 1,
    gap: 3,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
});
