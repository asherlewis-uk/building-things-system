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
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ChatListItem } from "@/components/ChatListItem";
import Colors, { spectral } from "@/constants/colors";
import { useChats } from "@/context/ChatsContext";
import { getCharacterById } from "@/data/characters";

function SwipeActions({
  onArchive,
  onDelete,
}: {
  onArchive: () => void;
  onDelete: () => void;
}) {
  const C = Colors.dark;
  return (
    <View style={styles.swipeActions}>
      <Pressable
        onPress={onArchive}
        style={[styles.swipeBtn, { backgroundColor: C.teal }]}
      >
        <Feather name="archive" size={18} color="#fff" />
        <Text style={styles.swipeBtnText}>Archive</Text>
      </Pressable>
      <Pressable
        onPress={onDelete}
        style={[styles.swipeBtn, { backgroundColor: C.error }]}
      >
        <Feather name="trash-2" size={18} color="#fff" />
        <Text style={styles.swipeBtnText}>Delete</Text>
      </Pressable>
    </View>
  );
}

export default function ChatsScreen() {
  const C = Colors.dark;
  const insets = useSafeAreaInsets();
  const { conversations, isLoaded, archiveConversation, deleteConversation } =
    useChats();

  const topPadding = Platform.OS === "web" ? 67 : 0;

  const validConversations = conversations.filter((c) => {
    const char = getCharacterById(c.characterId);
    return !!char;
  });

  const handleArchive = (id: string, name: string) => {
    Alert.alert("Archive Chat", `Archive your conversation with ${name}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Archive",
        onPress: () => archiveConversation(id),
      },
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
    <View style={[styles.container, { backgroundColor: C.background }]}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: Platform.OS === "web" ? topPadding : 0 },
        ]}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: C.text }]}>Chats</Text>
        </View>

        {!isLoaded ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: C.textSecondary }]}>
              Loading...
            </Text>
          </View>
        ) : validConversations.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={[styles.emptyIcon, { backgroundColor: C.card }]}>
              <Feather name="message-circle" size={32} color={C.tealMuted} />
            </View>
            <Text style={[styles.emptyTitle, { color: C.text }]}>
              No chats yet
            </Text>
            <Text style={[styles.emptyText, { color: C.textSecondary }]}>
              Discover personas and start a conversation
            </Text>
            <Pressable
              onPress={() => router.push("/")}
              style={styles.discoverBtn}
            >
              <LinearGradient
                colors={[spectral.green, spectral.blue, spectral.violet]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.discoverBtnGradient}
              >
                <Text style={styles.discoverBtnText}>Browse Personas</Text>
              </LinearGradient>
            </Pressable>
          </View>
        ) : (
          <>
            <View style={[styles.divider, { backgroundColor: C.border }]} />
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
                    <View style={{ backgroundColor: C.background }}>
                      <ChatListItem conversation={conv} character={char} />
                    </View>
                  </Swipeable>
                  <View
                    style={[
                      styles.itemDivider,
                      { backgroundColor: C.border, marginLeft: 84 },
                    ]}
                  />
                </View>
              );
            })}
          </>
        )}

        <View style={{ height: 100 }} />
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontFamily: "Inter_700Bold",
  },
  divider: {
    height: 1,
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
  emptyTitle: {
    fontSize: 20,
    fontFamily: "Inter_600SemiBold",
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 20,
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
  discoverBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
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
  swipeBtnText: {
    color: "#fff",
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
});
