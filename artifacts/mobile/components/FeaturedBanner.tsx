import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { CharacterAvatar } from "@/components/CharacterAvatar";
import { useTheme } from "@/src/theme/useTheme";
import type { Character } from "@/data/characters";

type Props = {
  character: Character;
};

export function FeaturedBanner({ character }: Props) {
  const { colors, typography: t, radii, spacing: sp } = useTheme();

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({ pathname: "/character/[id]", params: { id: character.id } });
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: colors.secondarySystemBackground,
          borderRadius: radii.xl,
          opacity: pressed ? 0.9 : 1,
        },
      ]}
      accessibilityLabel={`Featured persona: ${character.name}. ${character.tagline}`}
      accessibilityRole="button"
    >
      <LinearGradient
        colors={[
          character.avatarColors[0] + "99",
          character.avatarColors[1] + "55",
          "transparent",
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.inner, { padding: sp.lg, gap: sp.base }]}>
        <CharacterAvatar
          colors={character.avatarColors}
          emoji={character.avatarEmoji}
          size={80}
        />
        <View style={styles.textContainer}>
          <View
            style={[
              styles.badge,
              {
                backgroundColor: colors.tintGhost,
                borderColor: colors.tintSubtle,
                borderRadius: radii.xs + 2,
              },
            ]}
          >
            <Text style={[styles.badgeText, { color: colors.tint }]}>
              FEATURED
            </Text>
          </View>
          <Text style={[t.title2, { color: colors.label }]}>
            {character.name}
          </Text>
          <Text
            style={[t.footnote, { color: colors.secondaryLabel }]}
            numberOfLines={2}
          >
            {character.tagline}
          </Text>
          <Text style={[t.caption2, { color: colors.tertiaryLabel }]}>
            {character.messageCount} chats
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    marginHorizontal: 0,
  },
  inner: {
    flexDirection: "row",
    alignItems: "center",
  },
  textContainer: {
    flex: 1,
    gap: 4,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: "flex-start",
    marginBottom: 4,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 9,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1.2,
  },
});
