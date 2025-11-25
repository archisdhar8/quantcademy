import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

interface StrategySimulationProps {
  strategyName: string;
}

const StrategySimulation: React.FC<StrategySimulationProps> = ({ strategyName }) => {
  // Generate a mock equity curve simulation
  const simulationData = useMemo(() => {
    const data = [];
    let capital = 10000;
    let benchmark = 10000;
    
    // Different characteristics based on strategy name
    const isMeanReversion = strategyName.toLowerCase().includes('mean');
    const isTrend = strategyName.toLowerCase().includes('trend');
    
    for (let i = 0; i < 90; i++) {
        // Benchmark (Market) - Random walk with drift
        const marketReturn = (Math.random() - 0.45) * 0.02; // slight upward drift
        benchmark = benchmark * (1 + marketReturn);

        // Strategy Logic Simulation
        let strategyReturn = 0;
        if (isMeanReversion) {
             // Perform better in chop, worse in strong trends
             strategyReturn = (Math.random() - 0.4) * 0.015;
        } else if (isTrend) {
             // Capture big moves, bleed in chop
             const r = Math.random();
             strategyReturn = r > 0.8 ? 0.05 : -0.005; 
        } else {
             strategyReturn = (Math.random() - 0.45) * 0.025; // High vol
        }

        capital = capital * (1 + strategyReturn);

        data.push({
            day: i,
            Strategy: parseFloat(capital.toFixed(2)),
            Benchmark: parseFloat(benchmark.toFixed(2))
        });
    }
    return data;
  }, [strategyName]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mt-6">
        <div className="flex justify-between items-center mb-4">
            <div>
                <h4 className="text-emerald-400 font-bold text-sm uppercase tracking-wide">Strategy Simulation</h4>
                <p className="text-xs text-slate-500">Hypothetical Backtest (90 Days) - $10k Starting Capital</p>
            </div>
            <div className="flex space-x-4 text-xs font-mono">
                <div className="flex items-center"><span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>Strategy</div>
                <div className="flex items-center"><span className="w-2 h-2 bg-slate-500 rounded-full mr-2"></span>Benchmark (SPY)</div>
            </div>
        </div>
        
        <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={simulationData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                    <XAxis dataKey="day" hide />
                    <YAxis 
                        domain={['auto', 'auto']} 
                        tick={{ fill: '#94a3b8', fontSize: 10 }} 
                        axisLine={{ stroke: '#475569' }}
                        tickFormatter={(val) => `$${(val/1000).toFixed(1)}k`}
                    />
                    <Tooltip 
                        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }}
                        itemStyle={{ fontSize: 12 }}
                    />
                    <Line type="monotone" dataKey="Benchmark" stroke="#64748b" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                    <Line type="monotone" dataKey="Strategy" stroke="#10b981" strokeWidth={2} dot={false} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    </div>
  );
};

export default StrategySimulation;