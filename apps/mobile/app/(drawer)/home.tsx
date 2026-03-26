import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useChats } from "@/context/ChatsContext";
import { useLibrary } from "@/context/LibraryContext";
import { useSettings } from "@/context/SettingsContext";
import { formatRelativeTime } from "@/lib/format";
import {
  AppShell,
  Composer,
  GlassCard,
  PrimaryButton,
  ScreenHeader,
  SectionLabel,
} from "@/src/components";
import { radii, spacing, typography } from "@/src/theme/tokens";
import { useTheme } from "@/src/theme/useTheme";

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { settings } = useSettings();
  const { createConversation, conversations, isLoaded } = useChats();
  const { items } = useLibrary();
  const [draft, setDraft] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitLockRef = useRef(false);
  const recentChats = conversations.slice(0, 5);

  const handleOpenTemporaryChat = () => {
    router.push("/temporary-chat");
  };

  const handleSend = async () => {
    const nextDraft = draft.trim();

    if (!nextDraft || !isLoaded || submitLockRef.current) {
      return;
    }

    submitLockRef.current = true;
    setIsSubmitting(true);

    try {
      const conversation = await createConversation({
        initialPrompt: nextDraft,
      });

      setDraft("");
      router.push({
        pathname: "/chat/[id]",
        params: {
          id: conversation.id,
          initialDraft: nextDraft,
        },
      });
    } finally {
      submitLockRef.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <AppShell contentStyle={styles.shellContent}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={spacing.base}
        style={styles.keyboardFrame}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <ScreenHeader
            title="Home"
            subtitle="Resume saved work, check runtime state, or start a fresh saved thread without losing the split between persistent and temporary chat."
          />

          <View style={styles.contentStack}>
            <GlassCard
              title="Workspace snapshot"
              description={`${conversations.length} saved chat${conversations.length === 1 ? "" : "s"}, ${items.length} library item${items.length === 1 ? "" : "s"}, and a visible current runtime summary.`}
              footer={
                settings.activeRuntime?.baseUrl ??
                "No explicit endpoint is attached to the current runtime."
              }
              meta="On-device"
            >
              <Text style={[typography.subheadline, { color: theme.text.primary }]}>
                {settings.activeRuntime?.model ?? settings.ai.model}
              </Text>
              <Text style={[typography.footnote, { color: theme.text.secondary }]}>
                {settings.activeRuntime?.name ?? `Provider ${settings.ai.provider}`}
              </Text>
              <View style={styles.primaryActionRow}>
                <PrimaryButton
                  active
                  label="Open Temporary Chat"
                  onPress={handleOpenTemporaryChat}
                />
                <PrimaryButton
                  label="Manage Models"
                  onPress={() => router.push("/models")}
                />
              </View>
            </GlassCard>

            <SectionLabel
              aside={recentChats.length > 0 ? `${recentChats.length} recent` : "Empty"}
              label="Recent Chats"
            />
            <View style={styles.cardStack}>
              {recentChats.length > 0 ? (
                recentChats.map((conversation) => (
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
                            borderColor: pressed
                              ? theme.border.active
                              : theme.border.idle,
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
                          {formatRelativeTime(conversation.lastMessageTime)}
                        </Text>
                      </View>
                    )}
                  </Pressable>
                ))
              ) : (
                <GlassCard
                  title="No saved chats yet"
                  description="Start a saved conversation from the composer below, or use Temporary Chat when nothing should persist."
                />
              )}
            </View>

            <SectionLabel
              aside={items.length > 0 ? `${items.length} stored` : "Ready"}
              label="Quick Access"
            />
            <View style={styles.cardStack}>
              <GlassCard
                title="Library"
                description={
                  items.length > 0
                    ? "Open reusable notes, prompts, and context items."
                    : "Your Library is empty. Add reusable notes, prompts, or context."
                }
                meta="Reusable"
              >
                <PrimaryButton
                  label="Open Library"
                  onPress={() => router.push("/library")}
                />
              </GlassCard>
              <GlassCard
                title="Settings"
                description="Adjust theme, haptics, motion, density, composer behavior, and local instruction metadata."
                meta="Preferences"
              >
                <PrimaryButton
                  label="Open Settings"
                  onPress={() => router.push("/settings")}
                />
              </GlassCard>
            </View>

            <SectionLabel aside="Saved chat" label="Start Work" />
            <Text
              style={[
                typography.footnote,
                styles.entryCopy,
                { color: theme.text.secondary },
              ]}
            >
              Sending here still creates a saved conversation first, then opens the persistent chat route.
            </Text>
          </View>
        </ScrollView>

        <View
          style={[
            styles.composerContainer,
            {
              paddingBottom: insets.bottom,
            },
          ]}
        >
          <Composer
            value={draft}
            onChangeText={setDraft}
            onSend={() => {
              void handleSend();
            }}
            footerContent="Creates a saved chat and opens it immediately"
            placeholder="Start a saved chat..."
            sending={isSubmitting}
            submitLabel="Start Saved Chat"
          />
        </View>
      </KeyboardAvoidingView>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  shellContent: {
    paddingHorizontal: 0,
    paddingBottom: spacing.base,
    paddingTop: 0,
  },
  keyboardFrame: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  contentStack: {
    gap: spacing.sm,
  },
  cardStack: {
    gap: spacing.sm,
    paddingHorizontal: spacing.base,
  },
  primaryActionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
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
  entryCopy: {
    paddingHorizontal: spacing.base,
  },
  composerContainer: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.base,
  },
});
