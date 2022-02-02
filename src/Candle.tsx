import React from "react";
import { Line, Rect } from "react-native-svg";

const MARGIN = 4;

const Candle = ({ index, candle, caliber, scaleY, scaleBody }) => {
  const { close, open, high, low } = candle;
  const fill = close > open ? "#4AFA9A" : "#E33F64";
  const x = index * caliber;
  const max = Math.max(open, close);
  const min = Math.min(open, close);
  return (
    <>
      <Line
        x1={x + caliber / 2}
        y1={scaleY(low)}
        x2={x + caliber / 2}
        y2={scaleY(high)}
        stroke={fill}
        strokeWidth={1}
      />
      <Rect
        x={x + MARGIN}
        y={scaleY(max)}
        width={caliber - MARGIN * 2}
        height={scaleBody(max - min)}
        {...{ fill }}
      />
    </>
  );
};

export default Candle;
