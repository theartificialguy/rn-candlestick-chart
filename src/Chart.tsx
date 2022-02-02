import React from "react";
import Svg from "react-native-svg";
import Candle from "./Candle";
import { scaleLinear } from "d3-scale";

interface ChartProps {
  domain: any[];
  candles: any[];
  size: number;
  caliber: number;
}

const Chart = ({ domain, candles, size, caliber }: ChartProps) => {
  const scaleY = scaleLinear().domain(domain).range([size, 0]);
  const scaleBody = scaleLinear()
    .domain([0, domain[1] - domain[0]])
    .range([0, size]);
  return (
    <Svg width={size} height={size}>
      {candles.map((candle, index) => (
        <Candle
          key={index}
          index={index}
          candle={candle}
          caliber={caliber}
          scaleY={scaleY}
          scaleBody={scaleBody}
        />
      ))}
    </Svg>
  );
};

export default Chart;
