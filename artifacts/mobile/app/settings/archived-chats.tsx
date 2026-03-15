import { Feather } from "@expo/vector-icons";
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
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CharacterAvatar } from "@/components/CharacterAvatar";
import { useChats } from "@/context/ChatsContext";
import { useTheme } from "@/src/theme/useTheme";
import { getCharacterById } from "@/data/characters";

export default function ArchivedChatsScreen() {
  const { colors, spacing: sp, typography: t, hitTarget } = useTheme();
  const insets = useSafeAreaInsets();
  const {
    archivedConversations,
    restoreConversation,
    deleteArchivedConversation,
  } = useChats();

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const handleRestore = (id: string, name: string) => {
    Alert.alert("Restore Chat", `Restore your conversation with ${name}?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Restore", onPress: () => restoreConversation(id) },
    ]);
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      "Delete Permanently",
      `This will permanently delete your conversation with ${name}. This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteArchivedConversation(id),
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.systemBackground }]}>
      <View
        style={[
          styles.header,
          {
            paddingTop: topPad + sp.sm,
            borderBottomColor: colors.separator,
          },
        ]}
      >
        <Pressable
          onPress={() => router.back()}
          style={styles.backBtn}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Feather name="arrow-left" size={22} color={colors.label} />
        </Pressable>
        <Text style={[t.headline, { color: colors.label }]}>
          Archived Chats
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {archivedConversations.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View
              style={[
                styles.emptyIcon,
                { backgroundColor: colors.secondarySystemBackground },
              ]}
            >
              <Feather name="archive" size={32} color={colors.tintMuted} />
            </View>
            <Text style={[t.title3, { color: colors.label }]}>
              No archived chats
            </Text>
            <Text
              style={[
                t.subheadline,
                { color: colors.secondaryLabel, textAlign: "center" },
              ]}
            >
              Swipe left on a chat to archive it
            </Text>
          </View>
        ) : (
          archivedConversations.map((conv) => {
            const char = getCharacterById(conv.characterId);
            return (
              <View
                key={conv.id}
                style={[
                  styles.chatItem,
                  { borderBottomColor: colors.separator },
                ]}
              >
                <View style={styles.chatInfo}>
                  {char ? (
                    <CharacterAvatar
                      colors={char.avatarColors}
                      emoji={char.avatarEmoji}
                      size={hitTarget.minimum}
                    />
                  ) : (
                    <View
                      style={[
                        styles.fallbackAvatar,
                        {
                          backgroundColor: colors.secondarySystemBackground,
                          width: hitTarget.minimum,
                          height: hitTarget.minimum,
                        },
                      ]}
                    >
                      <Feather
                        name="user"
                        size={20}
                        color={colors.tertiaryLabel}
                      />
                    </View>
                  )}
                  <View style={styles.chatText}>
                    <Text
                      style={[
                        t.subheadline,
                        { color: colors.label, fontFamily: "Inter_600SemiBold" },
                      ]}
                      numberOfLines={1}
                    >
                      {conv.characterName}
                    </Text>
                    <Text
                      style={[t.footnote, { color: colors.secondaryLabel }]}
                      numberOfLines={1}
                    >
                      {conv.messages.length} messages
                    </Text>
                  </View>
                </View>
                <View style={styles.chatActions}>
                  <Pressable
                    onPress={() =>
                      handleRestore(conv.id, conv.characterName)
                    }
                    style={[
                      styles.actionBtn,
                      {
                        backgroundColor: colors.secondarySystemBackground,
                        width: hitTarget.minimum,
                        height: hitTarget.minimum,
                      },
                    ]}
                    accessibilityLabel={`Restore chat with ${conv.characterName}`}
                    accessibilityRole="button"
                  >
                    <Feather name="rotate-ccw" size={16} color={colors.tint} />
                  </Pressable>
                  <Pressable
                    onPress={() =>
                      handleDelete(conv.id, conv.characterName)
                    }
                    style={[
                      styles.actionBtn,
                      {
                        backgroundColor: colors.secondarySystemBackground,
                        width: hitTarget.minimum,
                        height: hitTarget.minimum,
                      },
                    ]}
                    accessibilityLabel={`Delete chat with ${conv.characterName}`}
                    accessibilityRole="button"
                  >
                    <Feather
                      name="trash-2"
                      size={16}
                      color={colors.destructive}
                    />
                  </Pressable>
                </View>
              </View>
            );
          })
        )}
        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
  },
  headerSpacer: {
    width: 44,
  },
  scrollContent: {
    paddingBottom: 20,
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
  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  chatInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  fallbackAvatar: {
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  chatText: {
    flex: 1,
    gap: 2,
  },
  chatActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionBtn: {
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
});
