import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CharacterCard } from "@/components/CharacterCard";
import { FeaturedBanner } from "@/components/FeaturedBanner";
import { Chip } from "@/src/components/Chip";
import { useTheme } from "@/src/theme/useTheme";
import {
  CATEGORIES,
  FEATURED_CHARACTERS,
  getCharactersByCategory,
} from "@/data/characters";

export default function DiscoverScreen() {
  const { colors, spacing: sp, typography: t, screenInsets } = useTheme();
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState("All");

  const topPadding = Platform.OS === "web" ? 67 : 0;
  const displayedChars = getCharactersByCategory(selectedCategory);
  const featured = FEATURED_CHARACTERS.slice(0, 3);

  return (
    <View style={[styles.container, { backgroundColor: colors.systemBackground }]}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: Platform.OS === "web" ? topPadding : 0 },
        ]}
      >
        <View
          style={[styles.header, { paddingHorizontal: screenInsets.horizontal }]}
          accessibilityRole="header"
        >
          <Text
            style={[t.largeTitle, { color: colors.label }]}
            accessibilityRole="header"
          >
            Discover
          </Text>
          <Text style={[t.subheadline, { color: colors.secondaryLabel }]}>
            Find your perfect companion
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[
            styles.featuredList,
            { paddingHorizontal: screenInsets.horizontal },
          ]}
          snapToInterval={320 + sp.md}
          decelerationRate="fast"
        >
          {featured.map((char) => (
            <View
              key={char.id}
              style={styles.featuredItem}
              accessibilityLabel={`Featured persona: ${char.name}`}
            >
              <FeaturedBanner character={char} />
            </View>
          ))}
        </ScrollView>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[
            styles.chipList,
            { paddingHorizontal: screenInsets.horizontal },
          ]}
        >
          {CATEGORIES.map((cat) => (
            <Chip
              key={cat}
              label={cat}
              selected={selectedCategory === cat}
              onPress={() => setSelectedCategory(cat)}
            />
          ))}
        </ScrollView>

        <View
          style={[
            styles.sectionHeader,
            { paddingHorizontal: screenInsets.horizontal },
          ]}
        >
          <Text style={[t.title3, { color: colors.label }]}>
            {selectedCategory === "All" ? "All Personas" : selectedCategory}
          </Text>
          <Text style={[t.footnote, { color: colors.tertiaryLabel }]}>
            {displayedChars.length}
          </Text>
        </View>

        <View style={[styles.grid, { paddingHorizontal: sp.md }]}>
          {displayedChars.map((char) => (
            <CharacterCard
              key={char.id}
              character={char}
              style={styles.gridItem}
            />
          ))}
        </View>

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
    paddingBottom: 16,
    gap: 4,
  },
  featuredList: {
    gap: 12,
    paddingBottom: 4,
  },
  featuredItem: {
    width: 320,
  },
  chipList: {
    paddingVertical: 12,
    gap: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 4,
    paddingBottom: 12,
    gap: 8,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  gridItem: {
    width: "47%",
  },
});
