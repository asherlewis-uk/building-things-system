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
import Colors, { spectral } from "@/constants/colors";
import {
  generateConversationId,
  generateMessageId,
  useChats,
  type Message,
} from "@/context/ChatsContext";
import { useSettings } from "@/context/SettingsContext";
import { getCharacterById } from "@/data/characters";
import { getApiUrl } from "@/lib/api";

let messageCounter = 0;
function genId(): string {
  messageCounter++;
  return `msg-${Date.now()}-${messageCounter}-${Math.random().toString(36).substr(2, 9)}`;
}

export default function ChatScreen() {
  const C = Colors.dark;
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getConversation, upsertConversation, updateLastMessage } = useChats();
  const { settings } = useSettings();

  const character = getCharacterById(id);
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [showTyping, setShowTyping] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const initializedRef = useRef(false);
  const convIdRef = useRef<string>("");

  useEffect(() => {
    if (!character || initializedRef.current) return;
    initializedRef.current = true;

    let conv = getConversation(character.id);
    if (!conv) {
      const convId = generateConversationId(character.id);
      convIdRef.current = convId;
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
      convIdRef.current = conv.id;
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
                    updated[updated.length - 1] = { ...last, content: fullContent };
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
      <View style={[styles.container, { backgroundColor: C.background }]}>
        <Text style={{ color: C.text }}>Character not found.</Text>
      </View>
    );
  }

  const reversedMessages = [...localMessages].reverse();
  const bottomPad = insets.bottom + (Platform.OS === "web" ? 34 : 0);

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: C.background }]}
      behavior="padding"
      keyboardVerticalOffset={0}
    >
      <View
        style={[
          styles.header,
          {
            paddingTop: (Platform.OS === "web" ? 67 : insets.top) + 8,
            backgroundColor: C.background,
            borderBottomColor: C.border,
          },
        ]}
      >
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={C.text} />
        </Pressable>
        <View style={styles.headerCenter}>
          <CharacterAvatar
            colors={character.avatarColors}
            emoji={character.avatarEmoji}
            size={36}
          />
          <View>
            <Text style={[styles.headerName, { color: C.text }]}>{character.name}</Text>
            <Text style={[styles.headerStatus, { color: C.teal }]}>Online</Text>
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
            backgroundColor: C.background,
            borderTopColor: C.border,
            paddingBottom: bottomPad + 8,
          },
        ]}
      >
        <View style={[styles.inputRow, { backgroundColor: C.card }]}>
          <TextInput
            ref={inputRef}
            value={inputText}
            onChangeText={setInputText}
            placeholder={`Message ${character.name}...`}
            placeholderTextColor={C.textMuted}
            style={[styles.input, { color: C.text }]}
            multiline
            blurOnSubmit={false}
            onSubmitEditing={handleSend}
            editable={!isStreaming}
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
          >
            {inputText.trim() && !isStreaming ? (
              <LinearGradient
                colors={[spectral.green, spectral.blue, spectral.violet]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.sendGradient}
              >
                <Feather name="arrow-up" size={18} color="#fff" />
              </LinearGradient>
            ) : (
              <View style={[styles.sendGradient, { backgroundColor: C.card }]}>
                <Feather name="arrow-up" size={18} color={C.textMuted} />
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
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
  },
  headerCenter: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  headerRight: {
    width: 40,
  },
  headerName: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  headerStatus: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
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
    borderRadius: 24,
    paddingLeft: 16,
    paddingRight: 6,
    paddingVertical: 6,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    maxHeight: 120,
    paddingTop: 8,
    paddingBottom: 8,
    lineHeight: 22,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: "hidden",
  },
  sendGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
});
