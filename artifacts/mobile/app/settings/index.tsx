import { router } from "expo-router";
import React from "react";
import {
  Alert,
  Linking,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  View,
} from "react-native";

import { useChats } from "@/context/ChatsContext";
import { useSettings, type ThemePreference } from "@/context/SettingsContext";
import { ListRow } from "@/src/components/ListRow";
import { ScreenHeader } from "@/src/components/ScreenHeader";
import { SectionHeader } from "@/src/components/SectionHeader";
import { SegmentedControl } from "@/src/components/SegmentedControl";
import { Surface } from "@/src/components/Surface";
import { useTheme } from "@/src/theme/useTheme";

const PRIVACY_URL = "https://persona.app/privacy";
const TERMS_URL = "https://persona.app/terms";

function providerLabel(id: string): string {
  const labels: Record<string, string> = {
    openai: "OpenAI",
    anthropic: "Anthropic",
    gemini: "Gemini",
    ollama: "Ollama",
    custom: "Custom",
  };
  return labels[id] ?? id;
}

const themeOptions: { label: string; value: ThemePreference }[] = [
  { label: "System", value: "system" },
  { label: "Light", value: "light" },
  { label: "Dark", value: "dark" },
];

export default function SettingsScreen() {
  const { colors, spacing: sp, typography: t, screenInsets, layout } = useTheme();
  const { settings, updateTheme, updateHapticFeedback } = useSettings();
  const { clearAllConversations, exportAllData, archivedConversations } =
    useChats();

  const handleClearAll = () => {
    Alert.alert(
      "Clear All Chats",
      "This will permanently delete all your conversations and archived chats. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete All",
          style: "destructive",
          onPress: async () => {
            await clearAllConversations();
          },
        },
      ]
    );
  };

  const handleExport = async () => {
    const data = exportAllData();
    if (Platform.OS === "web") {
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `persona-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      await Share.share({
        message: data,
        title: "Persona Chat Export",
      });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.groupedBackground }]}>
      <ScreenHeader title="Settings" onBack={() => router.back()} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        contentInsetAdjustmentBehavior="automatic"
      >
        <SectionHeader title="General" />
        <Surface variant="grouped" style={{ marginHorizontal: screenInsets.groupedHorizontal }}>
          <View style={[styles.themeRow, { paddingHorizontal: sp.base }]}>
            <ListRow
              icon="smartphone"
              title="Haptic Feedback"
              accessory="switch"
              switchValue={settings.hapticFeedback}
              onSwitchChange={updateHapticFeedback}
              showSeparator={false}
            />
          </View>
          <View
            style={[styles.sep, { backgroundColor: colors.separator, marginLeft: sp.base }]}
          />
          <View style={[styles.themeRow, { paddingHorizontal: sp.base }]}>
            <SegmentedControl
              options={themeOptions}
              selected={settings.theme}
              onChange={updateTheme}
            />
          </View>
        </Surface>

        <SectionHeader title="AI Provider" />
        <Surface variant="grouped" style={{ marginHorizontal: screenInsets.groupedHorizontal }}>
          <ListRow
            icon="cpu"
            title="AI Provider"
            subtitle={`${providerLabel(settings.ai.provider)} · ${settings.ai.model}`}
            accessory="disclosureIndicator"
            onPress={() => router.push("/settings/ai-provider")}
            showSeparator={false}
          />
        </Surface>

        <SectionHeader title="Personalization" />
        <Surface variant="grouped" style={{ marginHorizontal: screenInsets.groupedHorizontal }}>
          <ListRow
            icon="edit-3"
            title="Custom Instructions"
            accessory="disclosureIndicator"
            onPress={() => router.push("/settings/custom-instructions")}
            showSeparator={false}
          />
        </Surface>

        <SectionHeader title="Data & Storage" />
        <Surface variant="grouped" style={{ marginHorizontal: screenInsets.groupedHorizontal }}>
          <ListRow
            icon="archive"
            title="Archived Chats"
            accessory="disclosureIndicator"
            badgeText={`${archivedConversations.length}`}
            onPress={() => router.push("/settings/archived-chats")}
          />
          <ListRow
            icon="download"
            title="Export Data"
            accessory="disclosureIndicator"
            onPress={handleExport}
          />
          <ListRow
            icon="trash-2"
            title="Clear All Chats"
            destructive
            onPress={handleClearAll}
            showSeparator={false}
          />
        </Surface>

        <SectionHeader title="About" />
        <Surface variant="grouped" style={{ marginHorizontal: screenInsets.groupedHorizontal }}>
          <ListRow
            icon="info"
            title="Version"
            accessory="badge"
            badgeText="1.0.0"
          />
          <ListRow
            icon="shield"
            title="Privacy Policy"
            accessory="disclosureIndicator"
            onPress={() => Linking.openURL(PRIVACY_URL)}
          />
          <ListRow
            icon="file-text"
            title="Terms of Service"
            accessory="disclosureIndicator"
            onPress={() => Linking.openURL(TERMS_URL)}
            showSeparator={false}
          />
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
  scrollContent: {
    paddingBottom: 20,
  },
  themeRow: {
    paddingVertical: 12,
  },
  sep: {
    height: StyleSheet.hairlineWidth,
  },
});
