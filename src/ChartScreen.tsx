import React, { useRef, useState } from "react";
import { StatusBar } from "expo-status-bar";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native";
import Animated, {
  add,
  diffClamp,
  eq,
  modulo,
  sub,
} from "react-native-reanimated";
import { onGestureEvent, useValues } from "react-native-redash/lib/module/v1";
import {
  State,
  PanGestureHandler,
  GestureHandlerRootView,
  LongPressGestureHandler,
} from "react-native-gesture-handler";
import Chart from "./Chart";
import ChartInfo from "./ChartInfo";
import Svg, { Line } from "react-native-svg";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import data from "./data";

const width = Dimensions.get("window").width;

const BUTTON_WIDTH = (width - 30) / 6;

const StockScreen = () => {
  const [selected, setSelected] = useState(0);
  const [chartData, setChartData] = useState([]);

  const calculateDate = (offset: number) => {
    let rightNow = new Date();
    rightNow.setDate(rightNow.getDate() - offset);
    return rightNow; // actually x days Before
  };

  const formatDate = (d: Date) => {
    let month = `${d.getMonth() + 1}`;
    if (month.toString().length === 1) {
      month = `0${month}`;
    }
    let hours = `${d.getHours() % 12 || 12}`;
    if (hours.toString().length === 1) {
      hours = `0${hours}`;
    }
    const formattedDate = `${d.getFullYear()}-${month}-${d.getDate()} ${hours}:${d.getMinutes()}`;
    return formattedDate;
  };

  const today = new Date();

  const graphs = [
    {
      label: "1D",
      fromDate: formatDate(calculateDate(1)),
      toDate: formatDate(today),
    },
    {
      label: "1W",
      fromDate: formatDate(calculateDate(7)),
      toDate: formatDate(today),
    },
    {
      label: "1M",
      fromDate: formatDate(calculateDate(30)),
      toDate: formatDate(today),
    },
    {
      label: "1Y",
      fromDate: formatDate(calculateDate(365)),
      toDate: formatDate(today),
    },
    {
      label: "3Y",
      fromDate: formatDate(calculateDate(365 * 3)),
      toDate: formatDate(today),
    },
    {
      label: "5Y",
      fromDate: formatDate(calculateDate(365 * 5)),
      toDate: formatDate(today),
    },
  ];

  const [selectedChart, setSelectedChart] = useState(graphs[0]);

  const intervals = [
    { label: "1 min", value: "ONE_MINUTE" },
    { label: "3 min", value: "THREE_MINUTE" },
    { label: "5 min", value: "FIVE_MINUTE" },
    { label: "10 min", value: "TEN_MINUTE" },
    { label: "15 min", value: "FIFTEEN_MINUTE" },
    { label: "30 min", value: "THIRTY_MINUTE" },
    { label: "1 hour", value: "ONE_HOUR" },
    { label: "1 day", value: "ONE_DAY" },
  ];

  const [chartInterval, setChartInterval] = useState(intervals[2]);

  const calculateMinMaxCandles = (data: any[]) => {
    let domain = [0, 0];
    if (data.length > 0) {
      const values = data.map((candle) => [candle.low, candle.high]).flat();
      domain = [Math.min(...values), Math.max(...values)];
    }
    return domain;
  };

  const caliber = width / 30;

  const [x, y, state] = useValues(0, 0, State.UNDETERMINED);
  const gestureHandler = onGestureEvent({ x, y, state });
  const opacity = eq(state, State.ACTIVE);
  const translateY = diffClamp(y, 0, width);
  const translateX = add(sub(x, modulo(x, caliber)), caliber / 2);

  const longPressRef = useRef();

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar style="dark" translucent />
      {/* CHART INFO START */}
      <Animated.View
        style={{
          opacity,
          ...styles.chartInfoContainer,
        }}
        pointerEvents="none"
      >
        <ChartInfo candles={data} caliber={caliber} translateX={translateX} />
      </Animated.View>
      {/* CHART INFO END */}

      {/* STOCK INFO START */}
      <View style={styles.stockInfoContainer}>
        <Image
          source={require("../assets/images/bank.png")}
          resizeMode="contain"
          style={styles.bankImage}
        />

        <View style={styles.stockInfoIconsContainer}>
          <TouchableOpacity activeOpacity={0.7} style={{ marginRight: 10 }}>
            <Ionicons name="bookmark-outline" size={30} color="lightgrey" />
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.7} style={{ marginLeft: 10 }}>
            <Ionicons name="logo-whatsapp" size={30} color="lightgrey" />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.bankNameText}>State Trusted Bank</Text>

      <Text style={styles.lastPriceText}>₹ 514.65</Text>
      {/* STOCK INFO END */}

      {/* CHART INTERVAL INFO START */}
      <View style={styles.chartIntevalContainer}>
        <TouchableOpacity activeOpacity={0.7}>
          <Ionicons name="refresh" size={20} color="lightgrey" />
        </TouchableOpacity>

        <View style={styles.rightContainer}>
          <TouchableOpacity activeOpacity={0.7} style={styles.rightContainer}>
            <Ionicons name="timer-outline" size={20} color="lightgrey" />
            <Text style={styles.intervalText}>5 min</Text>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.7} style={{ marginLeft: 10 }}>
            <MaterialCommunityIcons
              name="triangle-wave"
              size={20}
              color="lightgrey"
            />
          </TouchableOpacity>
        </View>
      </View>
      {/* CHART INTERVAL INFO END */}

      <View>
        {/* CHART START */}
        <Chart
          candles={data}
          size={width}
          caliber={caliber}
          domain={calculateMinMaxCandles(data)}
        />
        {/* CHART END */}

        {/* SCRUBBER START */}
        <LongPressGestureHandler minDurationMs={800} ref={longPressRef}>
          <Animated.View style={StyleSheet.absoluteFill}>
            <PanGestureHandler
              waitFor={longPressRef}
              minDist={0}
              {...gestureHandler}
            >
              <Animated.View style={StyleSheet.absoluteFill}>
                {/* HORIZONTAL LINE START */}
                <Animated.View
                  style={{
                    transform: [{ translateY }],
                    opacity,
                    ...StyleSheet.absoluteFillObject,
                  }}
                >
                  <ScrubberLine x={width} y={0} />
                </Animated.View>
                {/* HORIZONTAL LINE END */}

                {/* VERTICAL LINE START */}
                <Animated.View
                  style={{
                    ...StyleSheet.absoluteFillObject,
                    opacity,
                    transform: [{ translateX }],
                  }}
                >
                  <ScrubberLine x={0} y={width} />
                </Animated.View>
                {/* VERTICAL LINE END */}
              </Animated.View>
            </PanGestureHandler>
          </Animated.View>
        </LongPressGestureHandler>
        {/* SCRUBBER END */}
      </View>

      {/* SELECTION */}
      <View style={[styles.selection, { width: BUTTON_WIDTH }]}>
        <View style={StyleSheet.absoluteFill}>
          <View
            style={[
              styles.backgroundSelection,
              { width: BUTTON_WIDTH },
              { transform: [{ translateX: BUTTON_WIDTH * selected }] },
            ]}
          />
        </View>
        {graphs.map((graph, index) => {
          return (
            <TouchableWithoutFeedback
              key={graph.label}
              onPress={() => {
                setSelected(index);
                setSelectedChart(graph);
              }}
            >
              <View style={[styles.labelContainer, { width: BUTTON_WIDTH }]}>
                <Text
                  style={[
                    styles.label,
                    index === selected
                      ? { color: "#1D8A2F" }
                      : { color: "#fefefe" },
                  ]}
                >
                  {graph.label}
                </Text>
              </View>
            </TouchableWithoutFeedback>
          );
        })}
      </View>
    </GestureHandlerRootView>
  );
};

export default StockScreen;

const ScrubberLine = ({ x, y }) => {
  return (
    <Svg style={StyleSheet.absoluteFill}>
      <Line
        x1={0}
        y1={0}
        x2={x}
        y2={y}
        strokeWidth={2}
        stroke="#B5B6B7"
        strokeDasharray="6 6"
      />
    </Svg>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 50,
    flex: 1,
    padding: 10,
    backgroundColor: "black",
  },
  chartInfoContainer: {
    position: "absolute",
    top: 10,
    left: 10,
    right: 10,
    zIndex: 1,
  },
  stockInfoContainer: {
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  bankImage: {
    height: 50,
    width: 50,
  },
  stockInfoIconsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  bankNameText: {
    fontSize: 20,
    color: "white",
    fontWeight: "600",
    marginBottom: 10,
  },
  lastPriceText: {
    fontSize: 24,
    color: "white",
    fontWeight: "bold",
    marginBottom: 19,
  },
  chartIntevalContainer: {
    height: 40,
    padding: 10,
    marginBottom: 10,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "grey",
  },
  rightContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  intervalText: {
    fontSize: 16,
    marginLeft: 5,
    color: "lightgrey",
  },
  selection: {
    marginTop: 10,
    flexDirection: "row",
  },
  backgroundSelection: {
    backgroundColor: "#1B331F",
    ...StyleSheet.absoluteFillObject,
    borderRadius: 15,
  },
  labelContainer: {
    padding: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
  },
});
