import React, { useEffect, useState } from 'react';
import StockChart from './StockChart';
import { fetchStockData } from '../services/polygonService';
import { ChartType, StockBar } from '../types';

interface HomeViewProps {
  onStart: () => void;
  polygonKey: string;
}

const HomeView: React.FC<HomeViewProps> = ({ onStart, polygonKey }) => {
  const [marketData, setMarketData] = useState<StockBar[]>([]);

  useEffect(() => {
    const loadData = async () => {
      // Fetch SPY as a general market overview
      const data = await fetchStockData('SPY', polygonKey);
      setMarketData(data);
    };
    loadData();
  }, [polygonKey]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-slate-950 p-8 overflow-y-auto">
      <div className="max-w-4xl w-full text-center space-y-8">
        
        {/* Hero Section */}
        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-br from-emerald-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
            QuantCademy
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Democratizing advanced financial engineering. From basic economics to algorithmic hedging strategies.
          </p>
        </div>

        {/* Market Visual */}
        <div className="h-64 w-full bg-slate-900/50 rounded-2xl border border-slate-800/60 p-6 relative overflow-hidden group">
            <div className="absolute top-4 left-6 z-10 text-left">
                <div className="text-xs text-emerald-400 font-bold tracking-widest uppercase mb-1">Market Pulse</div>
                <div className="text-2xl font-mono text-white">S&P 500 ETF (SPY)</div>
            </div>
            <StockChart data={marketData} type={ChartType.LINE} />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent pointer-events-none"></div>
        </div>

        {/* CTA */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
             <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 transition-colors">
                <div className="text-2xl mb-2">📊</div>
                <h3 className="font-bold text-slate-200">Interactive Data</h3>
                <p className="text-sm text-slate-500 mt-2">Live charts powered by Polygon.io. Visualize price action and indicators.</p>
             </div>
             <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 transition-colors">
                <div className="text-2xl mb-2">🧠</div>
                <h3 className="font-bold text-slate-200">AI Tutor</h3>
                <p className="text-sm text-slate-500 mt-2">Get instant answers and python code for complex strategies.</p>
             </div>
             <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 transition-colors">
                <div className="text-2xl mb-2">⚡</div>
                <h3 className="font-bold text-slate-200">Visual Learning</h3>
                <p className="text-sm text-slate-500 mt-2">Understand money flows and logic with dynamic node graphs.</p>
             </div>
        </div>

        <button 
            onClick={onStart}
            className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full font-bold text-lg shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all transform hover:scale-105"
        >
            Start Learning
        </button>

      </div>
    </div>
  );
};

export default HomeView;