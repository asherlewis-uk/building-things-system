import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { CharacterAvatar } from "@/components/CharacterAvatar";
import { useTheme } from "@/src/theme/useTheme";
import type { Character } from "@/data/characters";

type Props = {
  character: Character;
  style?: object;
};

export function CharacterCard({ character, style }: Props) {
  const { colors, typography: t, radii, spacing: sp, hitTarget } = useTheme();

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({ pathname: "/character/[id]", params: { id: character.id } });
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.secondarySystemBackground,
          borderRadius: radii.lg,
          opacity: pressed ? 0.85 : 1,
        },
        style,
      ]}
      accessibilityLabel={`${character.name}: ${character.tagline}`}
      accessibilityRole="button"
    >
      <CharacterAvatar
        colors={character.avatarColors}
        emoji={character.avatarEmoji}
        size={64}
      />
      <View style={styles.info}>
        <Text
          style={[t.subheadline, { color: colors.label, fontFamily: "Inter_600SemiBold" }]}
          numberOfLines={1}
        >
          {character.name}
        </Text>
        <Text
          style={[t.caption2, { color: colors.secondaryLabel }]}
          numberOfLines={2}
        >
          {character.tagline}
        </Text>
        <Text style={[t.caption2, { color: colors.tertiaryLabel }]}>
          {character.messageCount} chats
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 14,
    gap: 10,
    alignItems: "center",
  },
  info: {
    alignItems: "center",
    gap: 3,
  },
});
