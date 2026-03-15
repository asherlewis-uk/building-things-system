import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CharacterAvatar } from "@/components/CharacterAvatar";
import { useTheme } from "@/src/theme/useTheme";
import {
  generateConversationId,
  generateMessageId,
  useChats,
} from "@/context/ChatsContext";
import { getCharacterById } from "@/data/characters";

export default function CharacterDetailScreen() {
  const { colors, spacing: sp, typography: t, radii, gradients, hitTarget, opacity: op, screenInsets, layout } =
    useTheme();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getConversation, upsertConversation } = useChats();

  const character = getCharacterById(id);

  if (!character) {
    return (
      <View
        style={[styles.container, { backgroundColor: colors.systemBackground }]}
      >
        <View style={styles.emptyState}>
          <View
            style={[
              styles.emptyIcon,
              { backgroundColor: colors.secondarySystemBackground },
            ]}
          >
            <Feather name="alert-circle" size={32} color={colors.tintMuted} />
          </View>
          <Text style={[t.title3, { color: colors.label }]}>
            Character not found
          </Text>
          <Text
            style={[
              t.subheadline,
              { color: colors.secondaryLabel, textAlign: "center" },
            ]}
          >
            This character may have been removed or is no longer available.
          </Text>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.emptyBackBtn,
              {
                backgroundColor: colors.tint,
                opacity: pressed ? op.pressed : 1,
              },
            ]}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <Feather name="arrow-left" size={16} color={colors.onTint} />
            <Text style={[t.subheadline, { color: colors.onTint, fontFamily: "Inter_600SemiBold" }]}>
              Go Back
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const handleStartChat = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    let conversation = getConversation(character.id);
    if (!conversation) {
      const convId = generateConversationId(character.id);
      conversation = {
        id: convId,
        characterId: character.id,
        characterName: character.name,
        lastMessage: character.greeting.slice(0, 80),
        lastMessageTime: Date.now(),
        messages: [
          {
            id: generateMessageId(),
            role: "assistant" as const,
            content: character.greeting,
            timestamp: Date.now(),
          },
        ],
      };
      await upsertConversation(conversation);
    }

    router.push({ pathname: "/chat/[id]", params: { id: character.id } });
  };

  const topPad = Platform.OS === "web" ? layout.webTopPadding : insets.top;

  return (
    <View
      style={[styles.container, { backgroundColor: colors.systemBackground }]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={[styles.hero, { paddingTop: topPad + sp.base }]}>
          <LinearGradient
            colors={[character.avatarColors[0] + "44", "transparent"]}
            style={StyleSheet.absoluteFill}
          />
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.backBtn,
              {
                backgroundColor: colors.secondarySystemBackground,
                top: topPad,
                opacity: pressed ? op.pressed : 1,
              },
            ]}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <Feather name="arrow-left" size={20} color={colors.label} />
          </Pressable>

          <CharacterAvatar
            colors={character.avatarColors}
            emoji={character.avatarEmoji}
            size={100}
          />
          <Text style={[t.title1, { color: colors.label, marginTop: sp.sm }]}>
            {character.name}
          </Text>
          <Text
            style={[
              t.subheadline,
              { color: colors.secondaryLabel, textAlign: "center" },
            ]}
          >
            {character.tagline}
          </Text>

          <View style={styles.metaRow}>
            <View
              style={[
                styles.badge,
                {
                  backgroundColor: colors.secondarySystemBackground,
                  borderColor: colors.separator,
                  borderRadius: radii.full,
                },
              ]}
            >
              <Text style={[t.caption1, { color: colors.secondaryLabel }]}>
                {character.category}
              </Text>
            </View>
            <View
              style={[
                styles.badge,
                {
                  backgroundColor: colors.secondarySystemBackground,
                  borderColor: colors.separator,
                  borderRadius: radii.full,
                },
              ]}
            >
              <Feather
                name="message-circle"
                size={12}
                color={colors.tertiaryLabel}
              />
              <Text style={[t.caption1, { color: colors.secondaryLabel }]}>
                {character.messageCount}
              </Text>
            </View>
          </View>
        </View>

        <View
          style={[
            styles.section,
            { paddingHorizontal: screenInsets.horizontal },
          ]}
        >
          <Text style={[t.headline, { color: colors.label }]}>About</Text>
          <Text style={[t.body, { color: colors.secondaryLabel }]}>
            {character.description}
          </Text>
        </View>

        <View
          style={[
            styles.section,
            { paddingHorizontal: screenInsets.horizontal },
          ]}
        >
          <Text style={[t.headline, { color: colors.label }]}>Tags</Text>
          <View style={styles.tagsRow}>
            {character.tags.map((tag) => (
              <View
                key={tag}
                style={[
                  styles.tag,
                  {
                    backgroundColor: colors.tintGhost,
                    borderColor: colors.tintSubtle,
                    borderRadius: radii.sm,
                  },
                ]}
              >
                <Text style={[t.footnote, { color: colors.tintDim }]}>
                  {tag}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View
          style={[
            styles.section,
            { paddingHorizontal: screenInsets.horizontal },
          ]}
        >
          <Text style={[t.footnote, { color: colors.tertiaryLabel }]}>
            Created by {character.creator}
          </Text>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      <View
        style={[
          styles.ctaContainer,
          {
            backgroundColor: colors.systemBackground,
            borderTopColor: colors.separator,
            paddingBottom:
              insets.bottom + (Platform.OS === "web" ? 34 : 0) + 12,
          },
        ]}
      >
        <Pressable
          onPress={handleStartChat}
          style={({ pressed }) => [
            styles.startChatBtn,
            { opacity: pressed ? op.pressed : 1, borderRadius: radii.lg },
          ]}
          accessibilityLabel={`Start chat with ${character.name}`}
          accessibilityRole="button"
        >
          <LinearGradient
            colors={gradients.spectral.colors}
            start={gradients.spectral.start}
            end={gradients.spectral.end}
            style={styles.startChatGradient}
          >
            <Feather name="message-circle" size={18} color={colors.onTint} />
            <Text
              style={[
                t.headline,
                { color: colors.onTint },
              ]}
            >
              Start Chat
            </Text>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  hero: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 10,
    overflow: "hidden",
  },
  backBtn: {
    position: "absolute",
    left: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  metaRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
  },
  section: {
    paddingTop: 24,
    gap: 10,
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
  },
  ctaContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  startChatBtn: {
    overflow: "hidden",
  },
  startChatGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  emptyBackBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 8,
  },
});
