import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useChats } from "@/context/ChatsContext";
import {
  ActionChip,
  AppShell,
  Composer,
  GlassCard,
  HeroBlock,
  PrimaryButton,
  ScreenHeader,
  SectionLabel,
} from "@/src/components";
import { spacing } from "@/src/theme/tokens";

const suggestedActions = [
  {
    id: "scratchpad",
    label: "Scratchpad",
    prompt: "Help me sketch a clean starting point for this idea.",
  },
  {
    id: "summarize",
    label: "Summarize notes",
    prompt: "Summarize these notes into the most important takeaways.",
  },
  {
    id: "review",
    label: "Review ideas",
    prompt: "Review these ideas for blind spots, tradeoffs, and the strongest next move.",
  },
  {
    id: "plan",
    label: "Plan the day",
    prompt: "Help me plan the rest of today in clear next steps.",
  },
] as const;

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { createConversation, isLoaded } = useChats();
  const [draft, setDraft] = useState("");
  const [selectedActionId, setSelectedActionId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitLockRef = useRef(false);
  const selectedActionLabel =
    suggestedActions.find((action) => action.id === selectedActionId)?.label ??
    "Local draft only";

  const handleActionPress = (actionId: string, prompt: string) => {
    if (selectedActionId === actionId) {
      setSelectedActionId(null);
      setDraft("");
      return;
    }

    setSelectedActionId(actionId);
    setDraft(prompt);
  };

  const handleDraftChange = (value: string) => {
    setDraft(value);
    if (selectedActionId) {
      setSelectedActionId(null);
    }
  };

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
      setSelectedActionId(null);
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
            subtitle="A calm starting point for saved work, quick entry actions, and non-persistent session launch."
          />

          <View style={styles.topContent}>
            <HeroBlock
              title="Start locally, stay in control."
              description="ai.mine is a privacy-first, local-first workspace for shaping thoughts, exploring context, and opening focused sessions without turning the app into a cluttered control panel."
            >
              <PrimaryButton
                active
                label="Open Temporary Chat"
                onPress={handleOpenTemporaryChat}
              />
              <PrimaryButton
                label="Open Library"
                onPress={() => router.push("/library")}
              />
            </HeroBlock>

            <SectionLabel aside="Quick entry" label="Session Actions" />
            <View style={styles.chipGrid}>
              {suggestedActions.map((action) => (
                <ActionChip
                  key={action.id}
                  label={action.label}
                  onPress={() => handleActionPress(action.id, action.prompt)}
                  selected={selectedActionId === action.id}
                  style={styles.chip}
                />
              ))}
            </View>

            <GlassCard
              title="Temporary session access"
              description="Temporary Chat stays behaviorally separate from saved chats and is the fastest way to start a non-persistent session."
              footer="No hidden persistence or quiet thread creation when you use the unsaved route."
            >
              <PrimaryButton
                active
                label="Start Temporary Chat"
                onPress={handleOpenTemporaryChat}
              />
            </GlassCard>

            <SectionLabel aside={selectedActionLabel} label="Primary Composer" />
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
            onChangeText={handleDraftChange}
            onSend={() => {
              void handleSend();
            }}
            footerContent={
              selectedActionId
                ? `${selectedActionLabel} selected for the next saved thread.`
                : "Sending opens a saved conversation in Chats."
            }
            placeholder="Sketch a thought, outline a task, or begin a private local draft…"
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
    flexGrow: 1,
    paddingBottom: spacing.xl,
  },
  topContent: {
    gap: spacing.base,
  },
  chipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    paddingHorizontal: spacing.base,
  },
  chip: {},
  composerContainer: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.base,
  },
});
