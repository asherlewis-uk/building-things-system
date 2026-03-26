import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { Message } from "@/context/ChatsContext";
import {
  getExecutionCustomEndpoint,
  useSettings,
} from "@/context/SettingsContext";
import { streamChat } from "@/lib/api";
import {
  AppShell,
  Composer,
  GlassCard,
  IconButton,
  MessageBubble,
  ScreenHeader,
  SectionLabel,
} from "@/src/components";
import {
  spacing,
  typography,
} from "@/src/theme/tokens";
import { useTheme } from "@/src/theme/useTheme";

type TemporaryMessage = Message & {
  failed?: boolean;
};

function createTemporaryMessage(
  role: TemporaryMessage["role"],
  content: string,
  failed = false,
): TemporaryMessage {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    role,
    content,
    timestamp: Date.now(),
    failed,
  };
}

export default function TemporaryChatScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { settings } = useSettings();
  const scrollViewRef = useRef<ScrollView | null>(null);

  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState<TemporaryMessage[]>([]);

  const handleClose = () => {
    router.back();
  };

  const handleSend = async () => {
    const nextDraft = draft.trim();

    if (!nextDraft || isSending) {
      return;
    }

    const requestMessages = [
      ...messages
        .filter((message) => !message.failed)
        .map((message) => ({
          role: message.role,
          content: message.content,
        })),
      { role: "user" as const, content: nextDraft },
    ];

    const userMessage = createTemporaryMessage("user", nextDraft);
    const assistantMessage = createTemporaryMessage(
      "assistant",
      "Waiting for response…",
    );

    setMessages((currentMessages) => [
      ...currentMessages,
      userMessage,
      assistantMessage,
    ]);
    setDraft("");
    setIsSending(true);

    try {
      await streamChat(
        {
          messages: requestMessages,
          provider: settings.ai.provider,
          model: settings.ai.model,
          customEndpoint: getExecutionCustomEndpoint(
            settings.ai.provider,
            settings.ai.customEndpoint,
          ),
        },
        (chunk) => {
          setMessages((currentMessages) =>
            currentMessages.map((message) =>
              message.id === assistantMessage.id
                ? {
                    ...message,
                    content:
                      message.content === "Waiting for response…"
                        ? chunk.content
                        : `${message.content}${chunk.content}`,
                    failed: false,
                  }
                : message,
            ),
          );
        },
      );

      setMessages((currentMessages) =>
        currentMessages.map((message) =>
          message.id === assistantMessage.id &&
          message.content === "Waiting for response…"
            ? {
                ...message,
                content: "No response returned.",
              }
            : message,
        ),
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unable to reach the chat API.";

      setMessages((currentMessages) =>
        currentMessages.map((message) =>
          message.id === assistantMessage.id
            ? {
                ...message,
                content: `Request failed: ${errorMessage}`,
                failed: true,
              }
            : message,
        ),
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <AppShell contentStyle={styles.shellContent}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={spacing.base}
        style={styles.keyboardFrame}
      >
        <ScreenHeader
          title="Temporary Chat"
          subtitle="A non-persistent conversation surface for quick drafting. Leaving this route should not quietly create a saved thread."
          trailing={
            <IconButton icon="x" label="Close" onPress={handleClose} />
          }
        />

        <GlassCard
          title="Non-persistent by design"
          description="Use Temporary Chat for quick drafting or prompt testing without creating a stored thread."
          meta="Not saved"
        />

        <SectionLabel aside="Ephemeral route" label="Conversation" />

        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.messageListContent}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() =>
            scrollViewRef.current?.scrollToEnd({
              animated: !settings.reducedMotion,
            })
          }
          showsVerticalScrollIndicator={false}
          style={styles.messageList}
        >
          {messages.length > 0 ? (
            messages.map((message) => (
              <MessageBubble
                key={message.id}
                failed={message.failed}
                message={message}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={[typography.subheadline, { color: theme.text.primary }]}>
                Start an unsaved conversation
              </Text>
              <Text style={[typography.footnote, { color: theme.text.secondary }]}>
                Messages stay local to this modal and are discarded when you leave.
              </Text>
            </View>
          )}
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
            onChangeText={setDraft}
            onSend={() => {
              void handleSend();
            }}
            footerContent="Temporary session only"
            placeholder="Write a quick prompt without saving it to history…"
            sending={isSending}
            submitLabel="Send"
            value={draft}
          />
        </View>
      </KeyboardAvoidingView>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  shellContent: {
    flex: 1,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  keyboardFrame: {
    flex: 1,
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    flexGrow: 1,
    paddingBottom: spacing.lg,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.xxl,
  },
  composerContainer: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.base,
  },
});
