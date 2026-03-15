import * as Haptics from "expo-haptics";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useTheme } from "../theme/useTheme";

type Props<T extends string> = {
  options: { label: string; value: T }[];
  selected: T;
  onChange: (value: T) => void;
  disabled?: boolean;
};

export function SegmentedControl<T extends string>({
  options,
  selected,
  onChange,
  disabled = false,
}: Props<T>) {
  const { colors, spacing: sp, radii, typography: t, hitTarget, elevation: elev } = useTheme();
  const slideAnim = useRef(new Animated.Value(0)).current;
  const widthRef = useRef(0);
  const selectedIndex = options.findIndex((o) => o.value === selected);

  useEffect(() => {
    if (widthRef.current > 0) {
      const segmentWidth = widthRef.current / options.length;
      Animated.spring(slideAnim, {
        toValue: selectedIndex * segmentWidth,
        useNativeDriver: true,
        damping: 20,
        stiffness: 200,
      }).start();
    }
  }, [selectedIndex, options.length]);

  const handleLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    widthRef.current = w;
    const segmentWidth = w / options.length;
    slideAnim.setValue(selectedIndex * segmentWidth);
  };

  const handlePress = (value: T) => {
    if (disabled || value === selected) return;
    Haptics.selectionAsync();
    onChange(value);
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.fill, borderRadius: radii.sm },
      ]}
      onLayout={handleLayout}
      accessibilityRole="tablist"
    >
      <Animated.View
        style={[
          styles.thumb,
          elev.sm,
          {
            width: `${100 / options.length}%`,
            backgroundColor: colors.secondarySystemBackground,
            borderRadius: radii.sm - 1,
            transform: [{ translateX: slideAnim }],
          },
        ]}
      />
      {options.map((opt) => {
        const isSelected = opt.value === selected;
        return (
          <Pressable
            key={opt.value}
            onPress={() => handlePress(opt.value)}
            disabled={disabled}
            style={[styles.segment, { minHeight: hitTarget.minimum }]}
            accessibilityRole="tab"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={opt.label}
          >
            <Text
              style={[
                t.subheadline,
                {
                  fontFamily: isSelected ? "Inter_500Medium" : "Inter_400Regular",
                  color: isSelected ? colors.label : colors.secondaryLabel,
                },
              ]}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 2,
    position: "relative",
  },
  thumb: {
    position: "absolute",
    top: 2,
    bottom: 2,
  },
  segment: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
    paddingVertical: 6,
  },
});
