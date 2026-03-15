import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

import Colors, { spectral } from "@/constants/colors";

type Props = {
  value: boolean;
  onValueChange: (val: boolean) => void;
};

export function SpectralToggle({ value, onValueChange }: Props) {
  const C = Colors.dark;

  return (
    <Pressable
      onPress={() => onValueChange(!value)}
      style={styles.wrapper}
    >
      {value ? (
        <LinearGradient
          colors={[spectral.green, spectral.blue, spectral.violet]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.track}
        >
          <View style={[styles.thumbArea, { justifyContent: "flex-end" }]}>
            <View style={styles.thumb} />
          </View>
        </LinearGradient>
      ) : (
        <View style={[styles.track, { backgroundColor: C.cardAlt }]}>
          <View style={[styles.thumbArea, { justifyContent: "flex-start" }]}>
            <View style={styles.thumb} />
          </View>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: 50,
    height: 30,
  },
  track: {
    width: 50,
    height: 30,
    borderRadius: 15,
    overflow: "hidden",
  },
  thumbArea: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 3,
  },
  thumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#fff",
  },
});
