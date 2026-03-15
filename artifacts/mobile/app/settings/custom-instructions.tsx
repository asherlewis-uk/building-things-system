import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Surface } from "@/src/components/Surface";
import { useTheme } from "@/src/theme/useTheme";
import { useSettings } from "@/context/SettingsContext";

export default function CustomInstructionsScreen() {
  const { colors, spacing: sp, typography: t, radii, screenInsets } = useTheme();
  const insets = useSafeAreaInsets();
  const { settings, updateCustomInstructions } = useSettings();

  const [aboutUser, setAboutUser] = useState(
    settings.customInstructions.aboutUser
  );
  const [responseStyle, setResponseStyle] = useState(
    settings.customInstructions.responseStyle
  );

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleAutosave = (newAbout: string, newStyle: string) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      updateCustomInstructions({
        aboutUser: newAbout,
        responseStyle: newStyle,
      });
    }, 500);
  };

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  const handleAboutChange = (text: string) => {
    setAboutUser(text);
    scheduleAutosave(text, responseStyle);
  };

  const handleStyleChange = (text: string) => {
    setResponseStyle(text);
    scheduleAutosave(aboutUser, text);
  };

  const handleBack = () => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    updateCustomInstructions({ aboutUser, responseStyle });
    router.back();
  };

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View
      style={[styles.container, { backgroundColor: colors.groupedBackground }]}
    >
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
          onPress={handleBack}
          style={styles.backBtn}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Feather name="arrow-left" size={22} color={colors.label} />
        </Pressable>
        <Text style={[t.headline, { color: colors.label }]}>
          Custom Instructions
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingHorizontal: screenInsets.horizontal },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.section}>
          <Text style={[t.subheadline, { color: colors.label, fontFamily: "Inter_600SemiBold" }]}>
            What would you like the AI to know about you?
          </Text>
          <Text style={[t.footnote, { color: colors.tintMuted }]}>
            This context is shared with every persona you chat with.
          </Text>
          <Surface
            variant="grouped"
            style={[styles.inputWrapper, { borderRadius: radii.lg }]}
          >
            <TextInput
              value={aboutUser}
              onChangeText={handleAboutChange}
              placeholder="e.g. I'm a graduate student studying philosophy. I enjoy deep conversations about ethics and the meaning of life."
              placeholderTextColor={colors.placeholderText}
              style={[styles.textInput, t.callout, { color: colors.label }]}
              multiline
              textAlignVertical="top"
              maxLength={1500}
              accessibilityLabel="About you"
            />
          </Surface>
          <Text style={[t.caption2, { color: colors.tertiaryLabel, textAlign: "right" }]}>
            {aboutUser.length}/1500
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[t.subheadline, { color: colors.label, fontFamily: "Inter_600SemiBold" }]}>
            How would you like the AI to respond?
          </Text>
          <Text style={[t.footnote, { color: colors.tintMuted }]}>
            Set preferences for tone, format, and detail level.
          </Text>
          <Surface
            variant="grouped"
            style={[styles.inputWrapper, { borderRadius: radii.lg }]}
          >
            <TextInput
              value={responseStyle}
              onChangeText={handleStyleChange}
              placeholder="e.g. Be concise and direct. Use examples when explaining complex topics. Avoid overly formal language."
              placeholderTextColor={colors.placeholderText}
              style={[styles.textInput, t.callout, { color: colors.label }]}
              multiline
              textAlignVertical="top"
              maxLength={1500}
              accessibilityLabel="Response style preferences"
            />
          </Surface>
          <Text style={[t.caption2, { color: colors.tertiaryLabel, textAlign: "right" }]}>
            {responseStyle.length}/1500
          </Text>
        </View>

        <Surface variant="grouped" style={[styles.infoBox, { borderRadius: radii.md }]}>
          <Feather name="info" size={14} color={colors.tint} />
          <Text style={[t.footnote, { color: colors.secondaryLabel, flex: 1 }]}>
            Custom instructions are automatically included in every
            conversation. Changes apply to new messages only.
          </Text>
        </Surface>

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
  section: {
    marginTop: 24,
    gap: 8,
  },
  inputWrapper: {
    padding: 12,
  },
  textInput: {
    minHeight: 120,
    padding: 0,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginTop: 24,
    padding: 14,
  },
});
