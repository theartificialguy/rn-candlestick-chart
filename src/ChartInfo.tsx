import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  call,
  divide,
  floor,
  onChange,
  useCode,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import moment from "moment";
import { Ionicons } from "@expo/vector-icons";

interface RowProps {
  label: string;
  value: string;
  color: string;
}

interface ChartInfoProps {
  translateX: Animated.Node<number>;
  caliber: number;
  candles: any[];
}

const ChartInfo = ({ translateX, caliber, candles }: ChartInfoProps) => {
  const [{ timestamp, open, close, high, low }, setCandle] = useState(
    candles[0]
  );

  useCode(
    () =>
      onChange(
        translateX,
        call([floor(divide(translateX, caliber))], ([index]) => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setCandle(candles[index]);
        })
      ),
    [caliber, candles, translateX]
  );
  const diff = `${((close - open) * 100) / open}`;
  const change = close - open < 0 ? diff.substring(0, 5) : diff.substring(0, 4);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.table}>
        <View style={styles.column}>
          <Row label="Open" value={`₹${open}`} color="lightgrey" />
          <Row label="Close" value={`₹${close}`} color="lightgrey" />
        </View>
        <View style={styles.separator} />
        <View style={styles.column}>
          <Row label="High" value={`₹${high}`} color="lightgrey" />
          <Row label="Low" value={`₹${low}`} color="lightgrey" />
          <Row
            label="Change"
            value={`${change}%`}
            color={close - open > 0 ? "#4AFA9A" : "#E33F64"}
          />
        </View>
      </View>
      <Text style={styles.date}>
        {moment(timestamp).format("h:mm MMM Do, YYYY")}
      </Text>
    </SafeAreaView>
  );
};

export default ChartInfo;

const Row = ({ label, value, color }: RowProps) => (
  <View style={styles.rowContainer}>
    <Text style={styles.label}>{label} : </Text>
    {label === "Change" ? (
      color === "#E33F64" ? (
        <Ionicons name="caret-down-sharp" size={20} color="#E33F64" />
      ) : (
        <Ionicons name="caret-up-sharp" size={20} color="#4AFA9A" />
      )
    ) : null}
    <Text style={[styles.value, { color }]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: "black",
    borderRadius: 12,
    paddingTop: -30,
  },
  table: {
    flexDirection: "row",
    padding: 16,
  },
  column: {
    flex: 1,
  },
  separator: {
    width: 16,
  },
  rowContainer: {
    marginVertical: 2,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontSize: 18,
    color: "grey",
  },
  value: {
    fontSize: 18,
  },
  date: {
    color: "lightgrey",
    textAlign: "center",
    fontSize: 20,
    fontWeight: "500",
    marginBottom: 12,
  },
});
