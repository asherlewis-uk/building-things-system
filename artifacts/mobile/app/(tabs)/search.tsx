import React, { useMemo, useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { CharacterCard } from "@/components/CharacterCard";
import { SearchBar } from "@/components/SearchBar";
import { useTheme } from "@/src/theme/useTheme";
import { CATEGORIES, CHARACTERS } from "@/data/characters";

export default function SearchScreen() {
  const { colors, spacing: sp, typography: t, radii, screenInsets } = useTheme();
  const [query, setQuery] = useState("");

  const topPadding = Platform.OS === "web" ? 67 : 0;

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return CHARACTERS.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.tagline.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.tags.some((tag) => tag.toLowerCase().includes(q)) ||
        c.category.toLowerCase().includes(q)
    );
  }, [query]);

  const hasQuery = query.trim().length > 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.systemBackground }]}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: Platform.OS === "web" ? topPadding : 0 },
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
            Search
          </Text>
          <SearchBar
            value={query}
            onChangeText={setQuery}
            placeholder="Search personas, genres..."
          />
        </View>

        {!hasQuery ? (
          <>
            <Text
              style={[
                t.title3,
                {
                  color: colors.label,
                  paddingHorizontal: screenInsets.horizontal,
                  paddingBottom: sp.md,
                  paddingTop: sp.xs,
                },
              ]}
            >
              Browse by category
            </Text>
            <View style={[styles.categoryGrid, { paddingHorizontal: sp.md }]}>
              {CATEGORIES.filter(
                (c) => c !== "All" && c !== "Featured"
              ).map((cat, i) => {
                const tileColors = [
                  "#7C3AED",
                  "#059669",
                  "#DC2626",
                  "#0E7490",
                  "#D97706",
                  "#DB2777",
                  "#1D4ED8",
                ];
                const accent = tileColors[i % tileColors.length];
                return (
                  <View
                    key={cat}
                    style={[
                      styles.categoryTile,
                      {
                        backgroundColor: accent + "1A",
                        borderColor: accent + "33",
                        borderRadius: radii.lg,
                      },
                    ]}
                    accessibilityLabel={`${cat} category`}
                  >
                    <Text
                      style={[
                        t.subheadline,
                        { color: accent, fontFamily: "Inter_600SemiBold" },
                      ]}
                    >
                      {cat}
                    </Text>
                  </View>
                );
              })}
            </View>
          </>
        ) : results.length === 0 ? (
          <View style={styles.noResults}>
            <Text style={[t.title3, { color: colors.label }]}>
              No results
            </Text>
            <Text
              style={[
                t.subheadline,
                { color: colors.secondaryLabel, textAlign: "center" },
              ]}
            >
              Try a different name, genre, or personality type
            </Text>
          </View>
        ) : (
          <>
            <Text
              style={[
                t.footnote,
                {
                  color: colors.tertiaryLabel,
                  paddingHorizontal: screenInsets.horizontal,
                  paddingBottom: 10,
                },
              ]}
            >
              {results.length} result{results.length !== 1 ? "s" : ""}
            </Text>
            <View style={[styles.grid, { paddingHorizontal: sp.md }]}>
              {results.map((char) => (
                <CharacterCard
                  key={char.id}
                  character={char}
                  style={styles.gridItem}
                />
              ))}
            </View>
          </>
        )}

        <View style={{ height: 100 }} />
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
    paddingBottom: 12,
    gap: 12,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  categoryTile: {
    width: "47%",
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  gridItem: {
    width: "47%",
  },
  noResults: {
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 40,
    gap: 8,
  },
});
