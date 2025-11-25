import React, { useMemo } from 'react';
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { StockBar, ChartType } from '../types';

interface StockChartProps {
  data: StockBar[];
  comparisonData?: StockBar[];
  type: ChartType;
}

const StockChart: React.FC<StockChartProps> = ({ data, comparisonData, type }) => {
  
  const formattedData = useMemo(() => {
    // Guard against undefined/null data
    if (!data || !Array.isArray(data)) return [];

    return data.map((d, i) => {
       const comp = comparisonData?.[i];
       return {
        ...d,
        date: new Date(d.t).toLocaleDateString(),
        color: d.c >= d.o ? '#10b981' : '#ef4444', // Green if close > open, else Red
        compClose: comp ? comp.c : undefined
      };
    });
  }, [data, comparisonData]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-slate-800 border border-slate-700 p-3 rounded shadow-xl text-xs z-50">
          <p className="text-slate-400 mb-1">{label}</p>
          <p className="text-emerald-400">Open: {d.o}</p>
          <p className="text-emerald-400">High: {d.h}</p>
          <p className="text-red-400">Low: {d.l}</p>
          <p className="text-blue-400">Close: {d.c}</p>
          <p className="text-slate-500 mt-1">Vol: {d.v.toLocaleString()}</p>
          {d.compClose && (
              <p className="text-yellow-400 mt-1 border-t border-slate-600 pt-1">SPY: {d.compClose}</p>
          )}
        </div>
      );
    }
    return null;
  };

  if (!formattedData || formattedData.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center text-slate-500">
        No Data Available
      </div>
    );
  }

  // Prepare range for YAxis (Price)
  const minLow = Math.min(...(data || []).map(d => d.l));
  const maxHigh = Math.max(...(data || []).map(d => d.h));
  const domain = [minLow * 0.98, maxHigh * 1.02];
  
  // Prepare range for Comparison YAxis
  const compMin = comparisonData ? Math.min(...comparisonData.map(d => d.l)) : 0;
  const compMax = comparisonData ? Math.max(...comparisonData.map(d => d.h)) : 100;
  const compDomain = [compMin * 0.98, compMax * 1.02];

  return (
    <div className="h-full w-full select-none">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={formattedData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
          
          <XAxis 
            dataKey="date" 
            tick={{ fill: '#94a3b8', fontSize: 10 }} 
            minTickGap={30}
            axisLine={{ stroke: '#475569' }}
          />
          
          {/* Price Axis (Right) */}
          <YAxis 
            yAxisId="price"
            domain={domain} 
            tick={{ fill: '#94a3b8', fontSize: 10 }} 
            orientation="right"
            axisLine={{ stroke: '#475569' }}
            tickFormatter={(val) => val.toFixed(2)}
          />
          
          {/* Comparison Axis (Right - Offset) */}
          {comparisonData && (
             <YAxis 
                yAxisId="comparison"
                domain={compDomain}
                hide={true} // Hide ticks to keep it clean, just used for scaling the yellow line
             />
          )}

          {/* Volume Axis (Left/Hidden) - Separate axis so bars don't mess up price scale */}
          <YAxis 
            yAxisId="volume"
            orientation="left"
            tick={false}
            axisLine={false}
            hide={true} 
            domain={['auto', 'auto']}
          />

          <Tooltip content={<CustomTooltip />} />
          
          {type === ChartType.LINE ? (
             <Line 
              yAxisId="price"
              type="monotone" 
              dataKey="c" 
              stroke="#10b981" 
              strokeWidth={2} 
              dot={false} 
              animationDuration={500}
            />
          ) : (
            <>
              <Bar 
                dataKey="v" 
                yAxisId="volume" 
                fill="#334155" 
                opacity={0.3} 
                barSize={3} 
              />
              <Line 
                yAxisId="price"
                type="monotone" 
                dataKey="c" 
                stroke="#3b82f6" 
                strokeWidth={2} 
                dot={false} 
              />
              {comparisonData && (
                  <Line 
                    yAxisId="comparison"
                    type="monotone" 
                    dataKey="compClose" 
                    stroke="#fbbf24" // Yellow for benchmark
                    strokeWidth={2} 
                    dot={false} 
                    strokeDasharray="4 4"
                    opacity={0.7}
                  />
              )}
             </>
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StockChart;