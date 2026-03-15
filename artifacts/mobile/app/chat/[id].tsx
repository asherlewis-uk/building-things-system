import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { fetch } from "expo/fetch";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CharacterAvatar } from "@/components/CharacterAvatar";
import { MessageBubble } from "@/components/MessageBubble";
import { TypingIndicator } from "@/components/TypingIndicator";
import {
  generateConversationId,
  useChats,
  type Message,
} from "@/context/ChatsContext";
import { useSettings } from "@/context/SettingsContext";
import { useTheme } from "@/src/theme/useTheme";
import { getCharacterById } from "@/data/characters";
import { getApiUrl } from "@/lib/api";

let messageCounter = 0;
function genId(): string {
  messageCounter++;
  return `msg-${Date.now()}-${messageCounter}-${Math.random().toString(36).substr(2, 9)}`;
}

export default function ChatScreen() {
  const { colors, spacing: sp, typography: t, radii, gradients, hitTarget } =
    useTheme();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getConversation, upsertConversation } = useChats();
  const { settings } = useSettings();

  const character = getCharacterById(id);
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [showTyping, setShowTyping] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!character || initializedRef.current) return;
    initializedRef.current = true;

    let conv = getConversation(character.id);
    if (!conv) {
      const convId = generateConversationId(character.id);
      const greeting: Message = {
        id: genId(),
        role: "assistant",
        content: character.greeting,
        timestamp: Date.now(),
      };
      conv = {
        id: convId,
        characterId: character.id,
        characterName: character.name,
        lastMessage: character.greeting.slice(0, 80),
        lastMessageTime: Date.now(),
        messages: [greeting],
      };
      upsertConversation(conv);
      setLocalMessages([greeting]);
    } else {
      setLocalMessages(conv.messages);
    }
  }, [character]);

  const buildSystemPrompt = (): string => {
    let prompt = character?.systemPrompt ?? "";
    const { aboutUser, responseStyle } = settings.customInstructions;
    if (aboutUser.trim()) {
      prompt += `\n\n[User context: ${aboutUser.trim()}]`;
    }
    if (responseStyle.trim()) {
      prompt += `\n\n[Response preferences: ${responseStyle.trim()}]`;
    }
    return prompt;
  };

  const handleSend = async () => {
    if (!inputText.trim() || isStreaming || !character) return;

    const text = inputText.trim();
    setInputText("");
    if (settings.hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const capturedMessages = [...localMessages];
    const userMsg: Message = {
      id: genId(),
      role: "user",
      content: text,
      timestamp: Date.now(),
    };

    setLocalMessages((prev) => [...prev, userMsg]);
    setIsStreaming(true);
    setShowTyping(true);

    const apiMessages = [
      { role: "system", content: buildSystemPrompt() },
      ...capturedMessages.map((m) => ({ role: m.role, content: m.content })),
      { role: "user", content: text },
    ];

    try {
      const baseUrl = getApiUrl();
      const response = await fetch(`${baseUrl}api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
        },
        body: JSON.stringify({ messages: apiMessages }),
      });

      if (!response.ok) throw new Error("Failed");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No body");

      const decoder = new TextDecoder();
      let fullContent = "";
      let buffer = "";
      let assistantAdded = false;
      const assistantId = genId();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6);
          if (data === "[DONE]") continue;
          try {
            const parsed = JSON.parse(data);
            if (parsed.content) {
              fullContent += parsed.content;
              if (!assistantAdded) {
                setShowTyping(false);
                setLocalMessages((prev) => [
                  ...prev,
                  {
                    id: assistantId,
                    role: "assistant",
                    content: fullContent,
                    timestamp: Date.now(),
                  },
                ]);
                assistantAdded = true;
              } else {
                setLocalMessages((prev) => {
                  const updated = [...prev];
                  const last = updated[updated.length - 1];
                  if (last?.id === assistantId) {
                    updated[updated.length - 1] = {
                      ...last,
                      content: fullContent,
                    };
                  }
                  return updated;
                });
              }
            }
          } catch {}
        }
      }

      const assistantMsg: Message = {
        id: assistantId,
        role: "assistant",
        content: fullContent || "...",
        timestamp: Date.now(),
      };
      const conv = getConversation(character.id);
      if (conv) {
        const updatedConv = {
          ...conv,
          messages: [...capturedMessages, userMsg, assistantMsg],
          lastMessage: assistantMsg.content.slice(0, 80),
          lastMessageTime: assistantMsg.timestamp,
        };
        await upsertConversation(updatedConv);
      }
    } catch (err) {
      setShowTyping(false);
      const errMsg: Message = {
        id: genId(),
        role: "assistant",
        content: "Sorry, something went wrong. Please try again.",
        timestamp: Date.now(),
      };
      setLocalMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsStreaming(false);
      setShowTyping(false);
    }
  };

  if (!character) {
    return (
      <View
        style={[styles.container, { backgroundColor: colors.systemBackground }]}
      >
        <Text style={[t.body, { color: colors.label }]}>
          Character not found.
        </Text>
      </View>
    );
  }

  const reversedMessages = [...localMessages].reverse();
  const bottomPad = insets.bottom + (Platform.OS === "web" ? 34 : 0);

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.systemBackground }]}
      behavior="padding"
      keyboardVerticalOffset={0}
    >
      <View
        style={[
          styles.header,
          {
            paddingTop: (Platform.OS === "web" ? 67 : insets.top) + 8,
            backgroundColor: colors.systemBackground,
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
        <View style={styles.headerCenter}>
          <CharacterAvatar
            colors={character.avatarColors}
            emoji={character.avatarEmoji}
            size={36}
          />
          <View>
            <Text
              style={[
                t.callout,
                { color: colors.label, fontFamily: "Inter_600SemiBold" },
              ]}
            >
              {character.name}
            </Text>
            <Text style={[t.caption2, { color: colors.tint }]}>Online</Text>
          </View>
        </View>
        <View style={styles.headerRight} />
      </View>

      <FlatList
        data={reversedMessages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <MessageBubble message={item} />}
        inverted={localMessages.length > 0}
        ListHeaderComponent={showTyping ? <TypingIndicator /> : null}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.messageList}
        showsVerticalScrollIndicator={false}
      />

      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: colors.systemBackground,
            borderTopColor: colors.separator,
            paddingBottom: bottomPad + 8,
          },
        ]}
      >
        <View
          style={[
            styles.inputRow,
            {
              backgroundColor: colors.secondarySystemBackground,
              borderRadius: radii.full,
            },
          ]}
        >
          <TextInput
            ref={inputRef}
            value={inputText}
            onChangeText={setInputText}
            placeholder={`Message ${character.name}...`}
            placeholderTextColor={colors.placeholderText}
            style={[styles.input, t.body, { color: colors.label }]}
            multiline
            blurOnSubmit={false}
            onSubmitEditing={handleSend}
            editable={!isStreaming}
            accessibilityLabel={`Message ${character.name}`}
          />
          <Pressable
            onPress={() => {
              handleSend();
              inputRef.current?.focus();
            }}
            disabled={!inputText.trim() || isStreaming}
            style={({ pressed }) => [
              styles.sendBtn,
              { opacity: pressed ? 0.8 : 1 },
            ]}
            accessibilityLabel="Send message"
            accessibilityRole="button"
          >
            {inputText.trim() && !isStreaming ? (
              <LinearGradient
                colors={
                  gradients.spectralDiagonal.colors
                }
                start={gradients.spectralDiagonal.start}
                end={gradients.spectralDiagonal.end}
                style={styles.sendGradient}
              >
                <Feather name="arrow-up" size={18} color="#fff" />
              </LinearGradient>
            ) : (
              <View
                style={[
                  styles.sendGradient,
                  { backgroundColor: colors.fill },
                ]}
              >
                <Feather
                  name="arrow-up"
                  size={18}
                  color={colors.tertiaryLabel}
                />
              </View>
            )}
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
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
  headerCenter: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  headerRight: {
    width: 44,
  },
  messageList: {
    paddingVertical: 12,
  },
  inputContainer: {
    paddingHorizontal: 12,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingLeft: 16,
    paddingRight: 6,
    paddingVertical: 6,
    gap: 8,
  },
  input: {
    flex: 1,
    maxHeight: 120,
    paddingTop: 8,
    paddingBottom: 8,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: "hidden",
  },
  sendGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
});
