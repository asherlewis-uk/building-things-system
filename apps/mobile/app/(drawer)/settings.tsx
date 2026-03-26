import React, { useEffect, useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useChats } from "@/context/ChatsContext";
import { useLibrary } from "@/context/LibraryContext";
import {
  getExecutionCustomEndpoint,
  type ThemePreference,
  useSettings,
} from "@/context/SettingsContext";
import { runtimeEndpointRepository } from "@/lib/storage/repositories";
import {
  ActionChip,
  AppShell,
  GlassCard,
  PrimaryButton,
  ScreenHeader,
  SectionLabel,
  ToggleRow,
} from "@/src/components";
import { radii, spacing, typography } from "@/src/theme/tokens";
import { useTheme } from "@/src/theme/useTheme";

const themeOptions: ThemePreference[] = ["system", "light", "dark"];

export default function SettingsScreen() {
  const theme = useTheme();
  const {
    settings,
    updateCustomInstructions,
    updateDensity,
    updateHapticFeedback,
    updateReducedMotion,
    updateSendWithEnter,
    updateTheme,
  } = useSettings();
  const currentExecutionEndpoint = getExecutionCustomEndpoint(
    settings.ai.provider,
    settings.ai.customEndpoint,
  );
  const { conversations, archivedConversations } = useChats();
  const { items } = useLibrary();
  const [savedEndpointCount, setSavedEndpointCount] = useState(0);
  const [instructionsDraft, setInstructionsDraft] = useState(
    settings.customInstructions,
  );

  useEffect(() => {
    setInstructionsDraft(settings.customInstructions);
  }, [settings.customInstructions]);

  useEffect(() => {
    let cancelled = false;

    runtimeEndpointRepository.count().then((count) => {
      if (!cancelled) {
        setSavedEndpointCount(count);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const instructionsDirty = useMemo(
    () =>
      instructionsDraft.aboutUser !== settings.customInstructions.aboutUser ||
      instructionsDraft.responseStyle !== settings.customInstructions.responseStyle,
    [instructionsDraft, settings.customInstructions],
  );

  return (
    <AppShell contentStyle={styles.shellContent}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader
          title="Settings"
          subtitle="Behavior, appearance, and local metadata live here once they are not primary workflow destinations."
        />

        <View style={styles.contentStack}>
          <SectionLabel aside="Appearance" label="Theme" />
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

          <SectionLabel aside="Behavior" label="Interaction" />
          <View style={styles.toggleStack}>
            <ToggleRow
              label="Haptic feedback"
              description="Keep tap confirmation enabled for interactive controls."
              value={settings.hapticFeedback}
              onValueChange={(value) => void updateHapticFeedback(value)}
            />
            <ToggleRow
              label="Reduced motion"
              description="Disables stack animation and chat auto-scroll animation where the app controls them."
              value={settings.reducedMotion}
              onValueChange={(value) => void updateReducedMotion(value)}
            />
            <ToggleRow
              label="Send with Enter"
              description="Applies to the web composer only. Native composers still rely on the send button."
              value={settings.sendWithEnter}
              onValueChange={(value) => void updateSendWithEnter(value)}
            />
          </View>

          <SectionLabel aside={settings.density} label="Density" />
          <View style={styles.themeRow}>
            {(["comfortable", "compact"] as const).map((density) => (
              <ActionChip
                key={density}
                label={density === "comfortable" ? "Comfortable" : "Compact"}
                onPress={() => void updateDensity(density)}
                selected={settings.density === density}
              />
            ))}
          </View>

          <SectionLabel
            aside={settings.activeRuntime?.source ?? "provider"}
            label="Current Runtime"
          />
          <View style={styles.cardStack}>
            <GlassCard
              title={settings.activeRuntime?.model ?? settings.ai.model}
              description={
                settings.activeRuntime?.name ??
                "The active runtime metadata has not been resolved beyond the canonical provider/model fields."
              }
              footer={
                currentExecutionEndpoint ??
                "No active endpoint is attached to this runtime."
              }
              meta={settings.ai.provider}
            />
          </View>

          <SectionLabel label="Custom Instructions" />
          <View style={styles.cardStack}>
            <GlassCard
              title="Local instruction profile"
              description="These fields stay local and remain separate from runtime selection."
            >
              <View style={styles.formStack}>
                <TextInput
                  multiline
                  onChangeText={(aboutUser) =>
                    setInstructionsDraft((currentDraft) => ({
                      ...currentDraft,
                      aboutUser,
                    }))
                  }
                  placeholder="About you"
                  placeholderTextColor={theme.text.tertiary}
                  style={[
                    styles.textArea,
                    {
                      color: theme.text.primary,
                      backgroundColor: theme.surface.glassTint,
                      borderColor: theme.border.idle,
                    },
                  ]}
                  textAlignVertical="top"
                  value={instructionsDraft.aboutUser}
                />
                <TextInput
                  multiline
                  onChangeText={(responseStyle) =>
                    setInstructionsDraft((currentDraft) => ({
                      ...currentDraft,
                      responseStyle,
                    }))
                  }
                  placeholder="Preferred response style"
                  placeholderTextColor={theme.text.tertiary}
                  style={[
                    styles.textArea,
                    {
                      color: theme.text.primary,
                      backgroundColor: theme.surface.glassTint,
                      borderColor: theme.border.idle,
                    },
                  ]}
                  textAlignVertical="top"
                  value={instructionsDraft.responseStyle}
                />
                <PrimaryButton
                  active={instructionsDirty}
                  disabled={!instructionsDirty}
                  label="Save Instructions"
                  onPress={() => void updateCustomInstructions(instructionsDraft)}
                />
              </View>
            </GlassCard>
          </View>

          <SectionLabel label="Local Data" />
          <View style={styles.cardStack}>
            <GlassCard
              title="Stored conversations"
              description={`${conversations.length} active threads and ${archivedConversations.length} archived threads are currently stored on this device.`}
            />
            <GlassCard
              title="Stored library items"
              description={`${items.length} reusable note, prompt, or context item${items.length === 1 ? "" : "s"} are available locally.`}
            />
            <GlassCard
              title="Saved runtime endpoints"
              description={`${savedEndpointCount} saved endpoint${savedEndpointCount === 1 ? "" : "s"} are currently feeding the runtime shelf.`}
            />
            <GlassCard
              title="Stored settings"
              description="Theme, haptics, custom instructions, runtime metadata, and behavior preferences are stored locally."
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
  formStack: {
    gap: spacing.sm,
  },
  textArea: {
    minHeight: 112,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: radii.control,
    borderWidth: 1,
  },
});
