import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Alert,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useChats } from "@/context/ChatsContext";
import { useSettings, type ThemePreference } from "@/context/SettingsContext";
import { ListRow } from "@/src/components/ListRow";
import { SectionHeader } from "@/src/components/SectionHeader";
import { SegmentedControl } from "@/src/components/SegmentedControl";
import { Surface } from "@/src/components/Surface";
import { useTheme } from "@/src/theme/useTheme";

const PRIVACY_URL = "https://persona.app/privacy";
const TERMS_URL = "https://persona.app/terms";

const themeOptions: { label: string; value: ThemePreference }[] = [
  { label: "System", value: "system" },
  { label: "Light", value: "light" },
  { label: "Dark", value: "dark" },
];

export default function SettingsScreen() {
  const { colors, spacing: sp, typography: t, screenInsets } = useTheme();
  const insets = useSafeAreaInsets();
  const { settings, updateTheme, updateHapticFeedback } = useSettings();
  const { clearAllConversations, exportAllData, archivedConversations } =
    useChats();

  const topPad = Platform.OS === "web" ? 67 : insets.top;

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
          onPress={() => router.back()}
          style={styles.backBtn}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Feather name="arrow-left" size={22} color={colors.label} />
        </Pressable>
        <Text style={[t.headline, { color: colors.label }]}>Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        contentInsetAdjustmentBehavior="automatic"
      >
        <SectionHeader title="General" />
        <Surface variant="grouped" style={{ marginHorizontal: screenInsets.groupedHorizontal }}>
          <View style={[styles.themeRow, { paddingHorizontal: sp.base }]}>
            <Text style={[t.body, { color: colors.label, marginBottom: sp.sm }]}>
              Theme
            </Text>
            <SegmentedControl
              options={themeOptions}
              selected={settings.theme}
              onChange={updateTheme}
            />
          </View>
          <View
            style={[styles.sep, { backgroundColor: colors.separator, marginLeft: sp.base }]}
          />
          <ListRow
            icon="smartphone"
            title="Haptic Feedback"
            accessory="switch"
            switchValue={settings.hapticFeedback}
            onSwitchChange={updateHapticFeedback}
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
  themeRow: {
    paddingVertical: 12,
  },
  sep: {
    height: StyleSheet.hairlineWidth,
  },
});
