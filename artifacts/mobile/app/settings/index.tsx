import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
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

import { SpectralToggle } from "@/components/SpectralToggle";
import Colors, { spectral } from "@/constants/colors";
import { useChats } from "@/context/ChatsContext";
import { useSettings, type ThemePreference } from "@/context/SettingsContext";

type FeatherIconName = React.ComponentProps<typeof Feather>["name"];

type SettingRowProps = {
  icon: FeatherIconName;
  label: string;
  value?: string;
  onPress?: () => void;
  destructive?: boolean;
  rightElement?: React.ReactNode;
};

function SettingRow({
  icon,
  label,
  value,
  onPress,
  destructive,
  rightElement,
}: SettingRowProps) {
  const C = Colors.dark;
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress && !rightElement}
      style={({ pressed }) => [
        styles.settingRow,
        { opacity: pressed && onPress ? 0.7 : 1 },
      ]}
    >
      <View style={[styles.settingIcon, { backgroundColor: C.cardAlt }]}>
        <Feather
          name={icon}
          size={16}
          color={destructive ? C.error : C.teal}
        />
      </View>
      <Text
        style={[
          styles.settingLabel,
          { color: destructive ? C.error : C.text },
        ]}
      >
        {label}
      </Text>
      <View style={styles.settingRight}>
        {rightElement}
        {!rightElement && value && (
          <Text style={[styles.settingValue, { color: C.tealMuted }]}>
            {value}
          </Text>
        )}
        {!rightElement && onPress && !destructive && (
          <Feather name="chevron-right" size={16} color={C.tealMuted} />
        )}
      </View>
    </Pressable>
  );
}

function ThemeSelector() {
  const C = Colors.dark;
  const { settings, updateTheme } = useSettings();
  const options: { label: string; value: ThemePreference }[] = [
    { label: "System", value: "system" },
    { label: "Light", value: "light" },
    { label: "Dark", value: "dark" },
  ];

  return (
    <View style={styles.themeSelector}>
      {options.map((opt) => {
        const isSelected = settings.theme === opt.value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => updateTheme(opt.value)}
            style={styles.themeOption}
          >
            {isSelected ? (
              <LinearGradient
                colors={[spectral.green, spectral.blue, spectral.violet]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.themeOptionSelected}
              >
                <Text style={[styles.themeLabel, { color: "#fff" }]}>
                  {opt.label}
                </Text>
              </LinearGradient>
            ) : (
              <View
                style={[
                  styles.themeOptionInactive,
                  { backgroundColor: C.cardAlt, borderColor: C.border },
                ]}
              >
                <Text style={[styles.themeLabel, { color: C.tealDim }]}>
                  {opt.label}
                </Text>
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const PRIVACY_URL = "https://persona.app/privacy";
const TERMS_URL = "https://persona.app/terms";

export default function SettingsScreen() {
  const C = Colors.dark;
  const insets = useSafeAreaInsets();
  const { settings, updateHapticFeedback } = useSettings();
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

  const handleOpenLink = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <View style={[styles.container, { backgroundColor: C.background }]}>
      <View
        style={[
          styles.header,
          {
            paddingTop: topPad + 8,
            borderBottomColor: C.border,
          },
        ]}
      >
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={C.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: C.text }]}>Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={[styles.sectionHeader, { color: C.tealMuted }]}>
          GENERAL
        </Text>
        <View style={[styles.settingsGroup, { backgroundColor: C.card }]}>
          <View style={styles.settingRow}>
            <View style={[styles.settingIcon, { backgroundColor: C.cardAlt }]}>
              <Feather name="sun" size={16} color={C.teal} />
            </View>
            <Text style={[styles.settingLabel, { color: C.text }]}>Theme</Text>
          </View>
          <ThemeSelector />
          <View style={[styles.rowDivider, { backgroundColor: C.border }]} />
          <SettingRow
            icon="smartphone"
            label="Haptic Feedback"
            rightElement={
              <SpectralToggle
                value={settings.hapticFeedback}
                onValueChange={updateHapticFeedback}
              />
            }
          />
        </View>

        <Text style={[styles.sectionHeader, { color: C.tealMuted }]}>
          PERSONALIZATION
        </Text>
        <View style={[styles.settingsGroup, { backgroundColor: C.card }]}>
          <SettingRow
            icon="edit-3"
            label="Custom Instructions"
            onPress={() => router.push("/settings/custom-instructions")}
          />
        </View>

        <Text style={[styles.sectionHeader, { color: C.tealMuted }]}>
          DATA & STORAGE
        </Text>
        <View style={[styles.settingsGroup, { backgroundColor: C.card }]}>
          <SettingRow
            icon="archive"
            label="Archived Chats"
            value={`${archivedConversations.length}`}
            onPress={() => router.push("/settings/archived-chats")}
          />
          <View style={[styles.rowDivider, { backgroundColor: C.border }]} />
          <SettingRow
            icon="download"
            label="Export Data"
            onPress={handleExport}
          />
          <View style={[styles.rowDivider, { backgroundColor: C.border }]} />
          <SettingRow
            icon="trash-2"
            label="Clear All Chats"
            destructive
            onPress={handleClearAll}
          />
        </View>

        <Text style={[styles.sectionHeader, { color: C.tealMuted }]}>
          ABOUT
        </Text>
        <View style={[styles.settingsGroup, { backgroundColor: C.card }]}>
          <SettingRow icon="info" label="Version" value="1.0.0" />
          <View style={[styles.rowDivider, { backgroundColor: C.border }]} />
          <SettingRow
            icon="shield"
            label="Privacy Policy"
            onPress={() => handleOpenLink(PRIVACY_URL)}
          />
          <View style={[styles.rowDivider, { backgroundColor: C.border }]} />
          <SettingRow
            icon="file-text"
            label="Terms of Service"
            onPress={() => handleOpenLink(TERMS_URL)}
          />
        </View>

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
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
  },
  headerSpacer: {
    width: 40,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  sectionHeader: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.2,
    paddingHorizontal: 20,
    paddingBottom: 8,
    paddingTop: 20,
  },
  settingsGroup: {
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: "hidden",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  settingIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  settingLabel: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_500Medium",
  },
  settingRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  settingValue: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  rowDivider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 60,
  },
  themeSelector: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  themeOption: {
    flex: 1,
  },
  themeOptionSelected: {
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: "center",
  },
  themeOptionInactive: {
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: "center",
    borderWidth: 1,
  },
  themeLabel: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
});
