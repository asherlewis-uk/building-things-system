import React, { useMemo, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { CharacterCard } from "@/components/CharacterCard";
import { SearchBar } from "@/components/SearchBar";
import { useTheme } from "@/src/theme/useTheme";
import { spectralColors } from "@/src/theme/tokens";
import { CATEGORIES, CHARACTERS, getCharactersByCategory } from "@/data/characters";

const CATEGORY_COLORS: Record<string, string> = (() => {
  const palette = Object.values(spectralColors);
  const filteredCats = CATEGORIES.filter((c) => c !== "All" && c !== "Featured");
  const map: Record<string, string> = {};
  filteredCats.forEach((cat, i) => {
    map[cat] = palette[i % palette.length];
  });
  return map;
})();

export default function SearchScreen() {
  const { colors, spacing: sp, typography: t, radii, screenInsets, opacity: op, layout } = useTheme();
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const results = useMemo(() => {
    if (selectedCategory) {
      return getCharactersByCategory(selectedCategory);
    }
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
  }, [query, selectedCategory]);

  const hasQuery = query.trim().length > 0 || selectedCategory !== null;

  const handleTilePress = (cat: string) => {
    setSelectedCategory(cat);
    setQuery("");
  };

  const handleQueryChange = (text: string) => {
    setQuery(text);
    if (selectedCategory) setSelectedCategory(null);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.systemBackground }]}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
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
            Search
          </Text>
          <SearchBar
            value={selectedCategory ? "" : query}
            onChangeText={handleQueryChange}
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
              ).map((cat) => {
                const accent = CATEGORY_COLORS[cat];
                return (
                  <Pressable
                    key={cat}
                    onPress={() => handleTilePress(cat)}
                    style={({ pressed }) => [
                      styles.categoryTile,
                      {
                        backgroundColor: accent + "1A",
                        borderColor: accent + "33",
                        borderRadius: radii.lg,
                        width: layout.gridItemWidth,
                        opacity: pressed ? op.pressed : 1,
                      },
                    ]}
                    accessibilityLabel={`${cat} category`}
                    accessibilityRole="button"
                  >
                    <Text
                      style={[
                        t.subheadline,
                        { color: accent, fontFamily: "Inter_600SemiBold" },
                      ]}
                    >
                      {cat}
                    </Text>
                  </Pressable>
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
            <View style={[styles.resultHeader, { paddingHorizontal: screenInsets.horizontal }]}>
              <Text
                style={[
                  t.footnote,
                  {
                    color: colors.tertiaryLabel,
                    paddingBottom: 10,
                  },
                ]}
              >
                {selectedCategory
                  ? `${selectedCategory} · ${results.length} result${results.length !== 1 ? "s" : ""}`
                  : `${results.length} result${results.length !== 1 ? "s" : ""}`}
              </Text>
              {selectedCategory && (
                <Pressable
                  onPress={() => setSelectedCategory(null)}
                  style={({ pressed }) => [{ opacity: pressed ? op.pressed : 1 }]}
                  accessibilityLabel="Clear category filter"
                  accessibilityRole="button"
                >
                  <Text style={[t.footnote, { color: colors.tint }]}>Clear</Text>
                </Pressable>
              )}
            </View>
            <View style={[styles.grid, { paddingHorizontal: sp.md }]}>
              {results.map((char) => (
                <CharacterCard
                  key={char.id}
                  character={char}
                  style={{ width: layout.gridItemWidth }}
                />
              ))}
            </View>
          </>
        )}

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
    paddingBottom: 12,
    gap: 12,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  categoryTile: {
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
  resultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  noResults: {
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 40,
    gap: 8,
  },
});
