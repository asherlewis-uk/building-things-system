import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  generateMessageId,
  type Message,
  useChats,
} from "@/context/ChatsContext";
import { getExecutionCustomEndpoint, useSettings } from "@/context/SettingsContext";
import { streamChat } from "@/lib/api";
import {
  AppShell,
  Composer,
  MessageBubble,
  ScreenHeader,
  SectionLabel,
} from "@/src/components";
import {
  radii,
  spacing,
  typography,
} from "@/src/theme/tokens";
import { useTheme } from "@/src/theme/useTheme";

const WAITING_MESSAGE = "Waiting for response…";
const NO_RESPONSE_MESSAGE = "No response returned.";
const ERROR_PREFIX = "Request failed: ";

function readSearchParam(param: string | string[] | undefined) {
  if (Array.isArray(param)) {
    return param[0];
  }

  return param;
}

function isTransientAssistantMessage(message: Message) {
  return (
    message.role === "assistant" &&
    (message.content === WAITING_MESSAGE ||
      message.content === NO_RESPONSE_MESSAGE ||
      message.content.startsWith(ERROR_PREFIX))
  );
}

function isFailedAssistantMessage(message: Message) {
  return (
    message.role === "assistant" && message.content.startsWith(ERROR_PREFIX)
  );
}

export default function ChatScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { settings } = useSettings();
  const { addMessage, getConversationById, isLoaded, updateLastMessage } =
    useChats();
  const params = useLocalSearchParams<{
    id?: string | string[];
    initialDraft?: string | string[];
  }>();
  const scrollViewRef = useRef<ScrollView | null>(null);
  const initialDraftHandled = useRef(false);

  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);

  const conversationId = readSearchParam(params.id);
  const initialDraft = readSearchParam(params.initialDraft)?.trim();
  const conversation = conversationId
    ? getConversationById(conversationId)
    : undefined;
  const messages = conversation?.messages ?? [];

  const handleBack = () => {
    router.back();
  };

  const sendMessage = useCallback(
    async (rawDraft: string) => {
      const nextDraft = rawDraft.trim();

      if (!conversationId || !conversation || !nextDraft || isSending) {
        return false;
      }

      const requestMessages = [
        ...conversation.messages
          .filter((message) => !isTransientAssistantMessage(message))
          .map((message) => ({
            role: message.role,
            content: message.content,
          })),
        { role: "user" as const, content: nextDraft },
      ];

      const timestamp = Date.now();
      const userMessage: Message = {
        id: generateMessageId(),
        role: "user",
        content: nextDraft,
        timestamp,
      };
      const assistantMessage: Message = {
        id: generateMessageId(),
        role: "assistant",
        content: WAITING_MESSAGE,
        timestamp: timestamp + 1,
      };

      await addMessage(conversationId, userMessage);
      await addMessage(conversationId, assistantMessage);
      setIsSending(true);

      let assistantContent = "";

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
            assistantContent = assistantContent
              ? `${assistantContent}${chunk.content}`
              : chunk.content;

            void updateLastMessage(conversationId, {
              ...assistantMessage,
              content: assistantContent,
              timestamp: Date.now(),
            });
          },
        );

        if (!assistantContent) {
          await updateLastMessage(conversationId, {
            ...assistantMessage,
            content: NO_RESPONSE_MESSAGE,
            timestamp: Date.now(),
          });
        }

        return true;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unable to reach the chat API.";

        await updateLastMessage(conversationId, {
          ...assistantMessage,
          content: `${ERROR_PREFIX}${errorMessage}`,
          timestamp: Date.now(),
        });

        return false;
      } finally {
        setIsSending(false);
      }
    },
    [
      addMessage,
      conversation,
      conversationId,
      isSending,
      settings.ai.customEndpoint,
      settings.ai.model,
      settings.ai.provider,
      updateLastMessage,
    ],
  );

  const handleSend = useCallback(async () => {
    const sent = await sendMessage(draft);

    if (sent) {
      setDraft("");
    }
  }, [draft, sendMessage]);

  useEffect(() => {
    if (
      initialDraftHandled.current ||
      !conversation ||
      !initialDraft ||
      conversation.messages.length > 0
    ) {
      return;
    }

    initialDraftHandled.current = true;
    void sendMessage(initialDraft);
  }, [conversation, initialDraft, sendMessage]);

  return (
    <AppShell contentStyle={styles.shellContent}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={spacing.base}
        style={styles.keyboardFrame}
      >
        <ScreenHeader
          title={conversation?.characterName ?? "Chat"}
          subtitle="Messages sent here are stored locally and remain available in Chats."
          onBack={handleBack}
        />

        <SectionLabel aside="Stored thread" label="Conversation" />

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
          {!conversation ? (
            <View
              style={[
                styles.emptyState,
                {
                  backgroundColor: theme.surface.glassTint,
                  borderColor: theme.border.idle,
                },
              ]}
            >
              <Text style={[typography.subheadline, { color: theme.text.primary }]}>
                {isLoaded
                  ? initialDraft
                    ? "Preparing saved conversation"
                    : "Conversation unavailable"
                  : "Loading conversation"}
              </Text>
              <Text style={[typography.footnote, { color: theme.text.secondary }]}>
                {isLoaded
                  ? initialDraft
                    ? "Creating a persistent thread and connecting it to the chat API."
                    : "This conversation could not be found in local storage."
                  : "Loading saved chat history from local storage."}
              </Text>
            </View>
          ) : messages.length > 0 ? (
            messages.map((message) => (
              <MessageBubble
                key={message.id}
                failed={isFailedAssistantMessage(message)}
                message={message}
              />
            ))
          ) : (
            <View
              style={[
                styles.emptyState,
                {
                  backgroundColor: theme.surface.glassTint,
                  borderColor: theme.border.idle,
                },
              ]}
            >
              <Text style={[typography.subheadline, { color: theme.text.primary }]}>
                Start a saved conversation
              </Text>
              <Text style={[typography.footnote, { color: theme.text.secondary }]}>
                Messages sent here are stored locally and remain available in Chats.
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
            value={draft}
            onChangeText={setDraft}
            onSend={() => {
              void handleSend();
            }}
            footerContent="Saved conversation"
            placeholder="Send a message..."
            sending={isSending}
            submitLabel="Send"
            disabled={!conversation}
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
    justifyContent: "center",
    gap: spacing.xs,
    marginHorizontal: spacing.base,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.lg,
    borderRadius: radii.card,
    borderWidth: 1,
  },
  composerContainer: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.base,
  },
});
