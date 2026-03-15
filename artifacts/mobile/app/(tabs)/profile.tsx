import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { ListRow } from "@/src/components/ListRow";
import { SectionHeader } from "@/src/components/SectionHeader";
import { Surface } from "@/src/components/Surface";
import { useTheme } from "@/src/theme/useTheme";
import { useChats } from "@/context/ChatsContext";

export default function ProfileScreen() {
  const { colors, spacing: sp, typography: t, gradients, radii, screenInsets, opacity: op, layout } =
    useTheme();
  const { conversations } = useChats();

  const totalMessages = conversations.reduce(
    (sum, c) => sum + c.messages.length,
    0
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.groupedBackground }]}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: Platform.OS === "web" ? layout.webTopPadding : 0 },
        ]}
      >
        <View
          style={[
            styles.header,
            { paddingHorizontal: screenInsets.horizontal },
          ]}
        >
          <Text
            style={[t.largeTitle, { color: colors.label }]}
            accessibilityRole="header"
          >
            Profile
          </Text>
          <Pressable
            onPress={() => router.push("/settings")}
            style={({ pressed }) => [
              styles.gearBtn,
              { opacity: pressed ? op.pressed : 1 },
            ]}
            accessibilityLabel="Open settings"
            accessibilityRole="button"
          >
            <Feather name="settings" size={22} color={colors.tint} />
          </Pressable>
        </View>

        <View style={styles.profileSection}>
          <LinearGradient
            colors={gradients.spectralDiagonal.colors}
            start={gradients.spectralDiagonal.start}
            end={gradients.spectralDiagonal.end}
            style={styles.avatarGradient}
          >
            <Feather name="user" size={32} color={colors.onTint} />
          </LinearGradient>
          <Text style={[t.title2, { color: colors.label }]}>You</Text>
          <Text style={[t.subheadline, { color: colors.tintDim }]}>
            @explorer
          </Text>
        </View>

        <Surface
          variant="grouped"
          style={[
            styles.statsRow,
            { marginHorizontal: screenInsets.groupedHorizontal },
          ]}
        >
          <View style={styles.statItem}>
            <Text style={[t.title2, { color: colors.label }]}>
              {conversations.length}
            </Text>
            <Text style={[t.caption1, { color: colors.tintMuted }]}>
              Personas
            </Text>
          </View>
          <View
            style={[styles.statDivider, { backgroundColor: colors.separator }]}
          />
          <View style={styles.statItem}>
            <Text style={[t.title2, { color: colors.label }]}>
              {totalMessages}
            </Text>
            <Text style={[t.caption1, { color: colors.tintMuted }]}>
              Messages
            </Text>
          </View>
          <View
            style={[styles.statDivider, { backgroundColor: colors.separator }]}
          />
          <View style={styles.statItem}>
            <Text style={[t.title2, { color: colors.label }]}>∞</Text>
            <Text style={[t.caption1, { color: colors.tintMuted }]}>Free</Text>
          </View>
        </Surface>

        <SectionHeader title="Account" />
        <Surface
          variant="grouped"
          style={{ marginHorizontal: screenInsets.groupedHorizontal }}
        >
          <ListRow
            icon="sliders"
            title="Settings & Preferences"
            accessory="disclosureIndicator"
            onPress={() => router.push("/settings")}
            showSeparator={false}
          />
        </Surface>

        <View style={{ height: layout.bottomSpacerHeight }} />
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
  header: {
    paddingTop: 20,
    paddingBottom: 4,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  gearBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
  },
  profileSection: {
    alignItems: "center",
    paddingVertical: 28,
    gap: 8,
  },
  avatarGradient: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  statsRow: {
    flexDirection: "row",
    overflow: "hidden",
    marginBottom: 8,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 18,
    gap: 4,
  },
  statDivider: {
    width: StyleSheet.hairlineWidth,
    marginVertical: 12,
  },
});
