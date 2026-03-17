import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { AppShell, GlassCard, ScreenHeader, SectionLabel } from "@/src/components";
import { spacing, typography } from "@/src/theme/tokens";
import { useTheme } from "@/src/theme/useTheme";

const libraryGroups = [
  {
    title: "Saved Context",
    items: [
      {
        id: "workspace",
        name: "Workspace Notes",
        type: "Context bundle",
        summary: "Pinned constraints, repo references, and the last working plan for active tasks.",
      },
      {
        id: "product",
        name: "Product Voice",
        type: "Reference",
        summary: "The tone and decision rules used to keep ai.mine outputs consistent across screens.",
      },
    ],
  },
  {
    title: "Knowledge Objects",
    items: [
      {
        id: "patterns",
        name: "Prompt Patterns",
        type: "Reusable object",
        summary: "Saved starter flows for planning, review, summarization, and structured drafting.",
      },
      {
        id: "sources",
        name: "Research Stack",
        type: "Saved source set",
        summary: "A compact set of documents and notes you can pull back into a future session.",
      },
    ],
  },
] as const;

export default function LibraryScreen() {
  const theme = useTheme();
  const [selectedItemId, setSelectedItemId] = useState<string>("workspace");

  return (
    <AppShell contentStyle={styles.shellContent}>
      <ScreenHeader
        title="Library"
        subtitle="Reusable saved context, notes, and references belong here when they are meant to support later work."
      />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.intro}>
          <Text style={[typography.body, styles.introTitle, { color: theme.text.primary }]}>
            Reusable saved material
          </Text>
          <Text style={[typography.footnote, { color: theme.text.secondary }]}>
            Context objects stay subdued until selected so the active card can carry the spectral emphasis.
          </Text>
        </View>

        {libraryGroups.map((group) => (
          <View key={group.title} style={styles.group}>
            <SectionLabel title={group.title} />
            <View style={styles.cardStack}>
              {group.items.map((item) => (
                <GlassCard
                  key={item.id}
                  onPress={() => setSelectedItemId(item.id)}
                  selected={selectedItemId === item.id}
                  contentStyle={styles.cardContent}
                >
                  <View style={styles.cardHeader}>
                    <Text
                      style={[
                        typography.subheadline,
                        styles.cardTitle,
                        { color: theme.text.primary },
                      ]}
                    >
                      {item.name}
                    </Text>
                    <Text style={[typography.caption1, { color: theme.text.tertiary }]}>
                      {item.type}
                    </Text>
                  </View>
                  <Text style={[typography.footnote, { color: theme.text.secondary }]}>
                    {item.summary}
                  </Text>
                </GlassCard>
              ))}
            </View>
          </View>
        ))}
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
  intro: {
    gap: spacing.xs,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.sm,
  },
  introTitle: {
    fontFamily: "Inter_600SemiBold",
  },
  group: {
    gap: spacing.sm,
  },
  cardStack: {
    gap: spacing.sm,
    paddingHorizontal: spacing.base,
  },
  cardContent: {
    gap: spacing.sm,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.base,
  },
  cardHeader: {
    gap: spacing.xs,
  },
  cardTitle: {
    fontFamily: "Inter_500Medium",
  },
});
