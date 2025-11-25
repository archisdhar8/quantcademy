import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import LessonView from './components/LessonView';
import HomeView from './components/HomeView';
import StockResearch from './components/StockResearch';
import QuantAnalyzer from './components/QuantAnalyzer';
import { CURRICULUM, DEFAULT_POLYGON_KEY } from './constants';
import { Module } from './types';

const App: React.FC = () => {
  const [currentModule, setCurrentModule] = useState<Module>(CURRICULUM[0]);
  const [currentTopic, setCurrentTopic] = useState<string | null>(null);
  
  // State for optional Polygon Key (Since user can provide one)
  const [polygonKey, setPolygonKey] = useState<string>(DEFAULT_POLYGON_KEY);
  const [showSettings, setShowSettings] = useState(false);

  const handleSelectModule = (m: Module) => {
    setCurrentModule(m);
    // If it's a tool module like Stock Research or Quant Analyzer, we don't need a specific topic immediately
    if (m.id === 'stock-research') {
        setCurrentTopic('Research Terminal'); 
    } else if (m.id === 'quant-analyzer') {
        setCurrentTopic('Document Analysis');
    } else {
        setCurrentTopic(null);
    }
  };

  const handleSelectTopic = (t: string) => {
    setCurrentTopic(t);
  };

  const handleStartLearning = () => {
    // Jump to the first topic of the first module as a quick start
    setCurrentModule(CURRICULUM[0]);
    setCurrentTopic(CURRICULUM[0].topics[0]);
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 font-sans">
      <Sidebar 
        currentModule={currentModule} 
        onSelectModule={handleSelectModule} 
        onSelectTopic={handleSelectTopic}
        currentTopic={currentTopic}
      />
      
      <main className="flex-1 flex flex-col relative">
        {/* Settings Icon (Absolute Top Right) */}
        <button 
            onClick={() => setShowSettings(!showSettings)}
            className="absolute top-4 right-4 z-50 text-slate-500 hover:text-emerald-400 transition-colors"
            title="API Settings"
        >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
        </button>

        {showSettings && (
            <div className="absolute top-12 right-4 z-50 bg-slate-800 border border-slate-700 p-4 rounded shadow-xl w-72">
                <h4 className="text-sm font-bold text-slate-300 mb-2">Polygon.io API Key</h4>
                <input 
                    type="password" 
                    value={polygonKey}
                    onChange={(e) => setPolygonKey(e.target.value)}
                    placeholder="Enter Key"
                    className="w-full bg-slate-900 border border-slate-600 rounded px-2 py-1 text-sm mb-2"
                />
                <p className="text-[10px] text-slate-500">
                   {polygonKey === DEFAULT_POLYGON_KEY ? "Using default provided key." : "Using custom key."}
                </p>
            </div>
        )}

        {/* View Switcher Logic */}
        {(() => {
            if (currentModule.id === 'stock-research') {
                return <StockResearch polygonKey={polygonKey} />;
            }
            if (currentModule.id === 'quant-analyzer') {
                return <QuantAnalyzer />;
            }
            if (!currentTopic) {
                return <HomeView onStart={handleStartLearning} polygonKey={polygonKey} />;
            }
            return <LessonView module={currentModule} topic={currentTopic} polygonKey={polygonKey} />;
        })()}

      </main>
    </div>
  );
};

export default App;