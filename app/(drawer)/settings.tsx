import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { useChats } from "@/context/ChatsContext";
import {
  type ThemePreference,
  useSettings,
} from "@/context/SettingsContext";
import {
  ActionChip,
  AppShell,
  GlassCard,
  ScreenHeader,
  SectionLabel,
  ToggleRow,
} from "@/src/components";
import { spacing } from "@/src/theme/tokens";

const themeOptions: ThemePreference[] = ["system", "light", "dark"];

export default function SettingsScreen() {
  const { settings, updateHapticFeedback, updateTheme } = useSettings();
  const { conversations, archivedConversations } = useChats();

  return (
    <AppShell contentStyle={styles.shellContent}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader
          title="Settings"
          subtitle="Preferences and system-level behavior belong here once they stop being core workflow destinations."
        />

        <View style={styles.contentStack}>
          <SectionLabel aside="Appearance" label="Preferences" />
          <View style={styles.themeRow}>
            {themeOptions.map((option) => (
              <ActionChip
                key={option}
                label={option === "system" ? "System" : option === "light" ? "Light" : "Dark"}
                onPress={() => void updateTheme(option)}
                selected={settings.theme === option}
              />
            ))}
          </View>
          <View style={styles.toggleStack}>
            <ToggleRow
              label="Haptic feedback"
              description="Keep tap confirmation enabled for interactive controls."
              value={settings.hapticFeedback}
              onValueChange={(value) => void updateHapticFeedback(value)}
            />
          </View>

          <SectionLabel label="Local Data" />
          <View style={styles.cardStack}>
            <GlassCard
              title="Stored conversations"
              description={`${conversations.length} active threads and ${archivedConversations.length} archived threads are currently stored on this device.`}
            />
            <GlassCard
              title="Stored settings"
              description={`Appearance, haptic, and AI runtime preferences are stored locally alongside your conversation data.`}
            />
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
  themeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    paddingHorizontal: spacing.base,
  },
  toggleStack: {
    gap: spacing.sm,
    paddingHorizontal: spacing.base,
  },
  cardStack: {
    gap: spacing.sm,
    paddingHorizontal: spacing.base,
  },
});
