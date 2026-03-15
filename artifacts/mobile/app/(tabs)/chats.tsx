import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";

import { ChatListItem } from "@/components/ChatListItem";
import { useChats } from "@/context/ChatsContext";
import { useTheme } from "@/src/theme/useTheme";
import { getCharacterById } from "@/data/characters";

function SwipeActions({
  onArchive,
  onDelete,
}: {
  onArchive: () => void;
  onDelete: () => void;
}) {
  const { colors, typography: t, opacity: op } = useTheme();
  return (
    <View style={styles.swipeActions}>
      <Pressable
        onPress={onArchive}
        style={({ pressed }) => [
          styles.swipeBtn,
          { backgroundColor: colors.tint, opacity: pressed ? op.pressed : 1 },
        ]}
        accessibilityLabel="Archive conversation"
        accessibilityRole="button"
      >
        <Feather name="archive" size={18} color={colors.onTint} />
        <Text style={[t.caption2, { color: colors.onTint }]}>Archive</Text>
      </Pressable>
      <Pressable
        onPress={onDelete}
        style={({ pressed }) => [
          styles.swipeBtn,
          { backgroundColor: colors.destructive, opacity: pressed ? op.pressed : 1 },
        ]}
        accessibilityLabel="Delete conversation"
        accessibilityRole="button"
      >
        <Feather name="trash-2" size={18} color={colors.onTint} />
        <Text style={[t.caption2, { color: colors.onTint }]}>Delete</Text>
      </Pressable>
    </View>
  );
}

export default function ChatsScreen() {
  const { colors, spacing: sp, typography: t, gradients, screenInsets, layout, opacity: op } =
    useTheme();
  const { conversations, isLoaded, archiveConversation, deleteConversation } =
    useChats();

  const validConversations = conversations.filter((c) => {
    const char = getCharacterById(c.characterId);
    return !!char;
  });

  const handleArchive = (id: string, name: string) => {
    Alert.alert("Archive Chat", `Archive your conversation with ${name}?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Archive", onPress: () => archiveConversation(id) },
    ]);
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      "Delete Chat",
      `Permanently delete your conversation with ${name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteConversation(id),
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.systemBackground }]}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: Platform.OS === "web" ? layout.webTopPadding : 0 },
        ]}
      >
        <View
          style={[
            styles.header,
            { paddingHorizontal: screenInsets.horizontal },
          ]}
        >
          <Text
            style={[t.largeTitle, { color: colors.label }]}
            accessibilityRole="header"
          >
            Chats
          </Text>
        </View>

        {!isLoaded ? (
          <View style={styles.emptyContainer}>
            <Text style={[t.body, { color: colors.secondaryLabel }]}>
              Loading...
            </Text>
          </View>
        ) : validConversations.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View
              style={[
                styles.emptyIcon,
                { backgroundColor: colors.secondarySystemBackground },
              ]}
            >
              <Feather
                name="message-circle"
                size={32}
                color={colors.tintMuted}
              />
            </View>
            <Text
              style={[t.title3, { color: colors.label }]}
              accessibilityRole="header"
            >
              No chats yet
            </Text>
            <Text
              style={[
                t.subheadline,
                { color: colors.secondaryLabel, textAlign: "center" },
              ]}
            >
              Discover personas and start a conversation
            </Text>
            <Pressable
              onPress={() => router.push("/")}
              style={({ pressed }) => [
                styles.discoverBtn,
                { opacity: pressed ? op.pressed : 1 },
              ]}
              accessibilityLabel="Browse personas"
              accessibilityRole="button"
            >
              <LinearGradient
                colors={gradients.spectral.colors}
                start={gradients.spectral.start}
                end={gradients.spectral.end}
                style={styles.discoverBtnGradient}
              >
                <Text
                  style={[
                    t.subheadline,
                    { color: colors.onTint, fontFamily: "Inter_600SemiBold" },
                  ]}
                >
                  Browse Personas
                </Text>
              </LinearGradient>
            </Pressable>
          </View>
        ) : (
          <>
            <View
              style={[styles.divider, { backgroundColor: colors.separator }]}
            />
            {validConversations.map((conv) => {
              const char = getCharacterById(conv.characterId)!;
              return (
                <View key={conv.id}>
                  <Swipeable
                    renderRightActions={() => (
                      <SwipeActions
                        onArchive={() =>
                          handleArchive(conv.id, conv.characterName)
                        }
                        onDelete={() =>
                          handleDelete(conv.id, conv.characterName)
                        }
                      />
                    )}
                    overshootRight={false}
                  >
                    <View
                      style={{ backgroundColor: colors.systemBackground }}
                    >
                      <ChatListItem conversation={conv} character={char} />
                    </View>
                  </Swipeable>
                  <View
                    style={[
                      styles.itemDivider,
                      { backgroundColor: colors.separator, marginLeft: 84 },
                    ]}
                  />
                </View>
              );
            })}
          </>
        )}

        <View style={{ height: layout.bottomSpacerHeight }} />
      </ScrollView>
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
  header: {
    paddingTop: 20,
    paddingBottom: 16,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
  itemDivider: {
    height: StyleSheet.hairlineWidth,
  },
  emptyContainer: {
    alignItems: "center",
    paddingTop: 80,
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
  discoverBtn: {
    borderRadius: 24,
    marginTop: 8,
    overflow: "hidden",
  },
  discoverBtnGradient: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: "center",
  },
  swipeActions: {
    flexDirection: "row",
  },
  swipeBtn: {
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    gap: 4,
  },
});
