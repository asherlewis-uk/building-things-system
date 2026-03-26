import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { useChats } from "@/context/ChatsContext";
import {
  ActionChip,
  AppShell,
  GlassCard,
  PrimaryButton,
  ScreenHeader,
  SectionLabel,
} from "@/src/components";
import {
  radii,
  spacing,
  typography,
} from "@/src/theme/tokens";
import { useTheme } from "@/src/theme/useTheme";

const chatFilters = ["All", "Recent"] as const;

export default function ChatsScreen() {
  const router = useRouter();
  const { conversations, archivedConversations, isLoaded } = useChats();
  const theme = useTheme();
  const [selectedFilter, setSelectedFilter] =
    useState<(typeof chatFilters)[number]>("Recent");
  const visibleConversations =
    selectedFilter === "All" ? conversations : conversations.slice(0, 8);

  return (
    <AppShell contentStyle={styles.shellContent}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader
          title="Chats"
          subtitle="Stored conversations belong here, separate from Temporary Chat and other one-off local drafting flows."
        />

        <View style={styles.contentStack}>
          <GlassCard
            title="Saved conversation history"
            description="This screen is the persistent conversation destination. Temporary Chat remains a separate route and should never quietly appear here."
            footer="The first pass stays lightweight: a clear home for saved threads without deep history tooling."
            meta="Stored"
          >
            <PrimaryButton
              label="Open Temporary Chat"
              onPress={() => router.push("/temporary-chat")}
            />
          </GlassCard>

          <SectionLabel aside={selectedFilter} label="Saved Threads" />
          <View style={styles.filterRow}>
            {chatFilters.map((filter) => (
              <ActionChip
                key={filter}
                label={filter}
                onPress={() => setSelectedFilter(filter)}
                selected={selectedFilter === filter}
              />
            ))}
          </View>

          <View style={styles.sectionBody}>
            {isLoaded && visibleConversations.length > 0 ? (
              visibleConversations.map((conversation) => (
                <Pressable
                  key={conversation.id}
                  onPress={() =>
                    router.push({
                      pathname: "/chat/[id]",
                      params: {
                        id: conversation.id,
                      },
                    })
                  }
                >
                  {({ pressed }) => (
                    <View
                      style={[
                        styles.chatRow,
                        {
                          backgroundColor: theme.surface.glassTint,
                          borderColor: theme.border.idle,
                        },
                        pressed && {
                          opacity: 0.92,
                          borderColor: theme.border.active,
                        },
                      ]}
                    >
                      <View style={styles.chatCopy}>
                        <Text
                          numberOfLines={1}
                          style={[
                            typography.subheadline,
                            styles.chatTitle,
                            { color: theme.text.primary },
                          ]}
                        >
                          {conversation.characterName}
                        </Text>
                        <Text
                          numberOfLines={2}
                          style={[
                            typography.footnote,
                            { color: theme.text.secondary },
                          ]}
                        >
                          {conversation.lastMessage || "No messages yet."}
                        </Text>
                      </View>
                      <View style={styles.chatMeta}>
                        <Text
                          style={[typography.caption1, { color: theme.text.tertiary }]}
                        >
                          {new Date(conversation.lastMessageTime).toLocaleDateString()}
                        </Text>
                        {conversation.unread ? (
                          <View
                            style={[
                              styles.unreadPill,
                              {
                                backgroundColor: theme.surface.elevated,
                                borderColor: theme.border.idle,
                              },
                            ]}
                          >
                            <Text
                              style={[
                                typography.caption2,
                                styles.unreadLabel,
                                { color: theme.text.primary },
                              ]}
                            >
                              Unread
                            </Text>
                          </View>
                        ) : null}
                      </View>
                    </View>
                  )}
                </Pressable>
              ))
            ) : (
              <GlassCard
                title="No saved chats yet"
                description="Conversations you keep will collect here once persistent chat flows are used."
              />
            )}
          </View>

          <SectionLabel label="Archived" />
          <View style={styles.sectionBody}>
            {isLoaded && archivedConversations.length > 0 ? (
              archivedConversations.map((conversation) => (
                <View
                  key={conversation.id}
                  style={[
                    styles.chatRow,
                    {
                      backgroundColor: theme.surface.glassTint,
                      borderColor: theme.border.idle,
                    },
                  ]}
                >
                  <View style={styles.chatCopy}>
                    <Text
                      numberOfLines={1}
                      style={[
                        typography.subheadline,
                        styles.chatTitle,
                        { color: theme.text.primary },
                      ]}
                    >
                      {conversation.characterName}
                    </Text>
                    <Text
                      numberOfLines={2}
                      style={[typography.footnote, { color: theme.text.secondary }]}
                    >
                      {conversation.lastMessage || "No messages yet."}
                    </Text>
                  </View>
                  <Text style={[typography.caption1, { color: theme.text.tertiary }]}>
                    Archived
                  </Text>
                </View>
              ))
            ) : (
              <GlassCard
                title="No archived threads"
                description="Archived conversations stay visible here without blending into active history."
              />
            )}
          </View>
        </View>
      </ScrollView>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  shellContent: {
    flex: 1,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  scrollContent: {
    paddingBottom: spacing.xxxl,
  },
  contentStack: {
    gap: spacing.sm,
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    paddingHorizontal: spacing.base,
  },
  sectionBody: {
    gap: spacing.sm,
    paddingHorizontal: spacing.base,
  },
  chatRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.base,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.base,
    borderRadius: radii.card,
    borderWidth: 1,
  },
  chatCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  chatTitle: {
    fontFamily: "Inter_500Medium",
  },
  chatMeta: {
    alignItems: "flex-end",
    gap: spacing.sm,
  },
  unreadPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
    borderWidth: 1,
  },
  unreadLabel: {
    fontFamily: "Inter_600SemiBold",
  },
});
