import React, { useState, useEffect } from 'react';
import { fetchStockData, fetchCompanyDetails, fetchStockFinancials } from '../services/polygonService';
import { getTradeAnalysis } from '../services/geminiService';
import { StockBar, ChartType, CompanyDetails, FinancialsResponse, TradeAnalysis } from '../types';
import StockChart from './StockChart';
import AITutor from './AITutor';

interface StockResearchProps {
  polygonKey: string;
}

const StockResearch: React.FC<StockResearchProps> = ({ polygonKey }) => {
  const [ticker, setTicker] = useState("NVDA");
  const [searchInput, setSearchInput] = useState("NVDA");
  const [stockData, setStockData] = useState<StockBar[]>([]);
  const [comparisonData, setComparisonData] = useState<StockBar[] | undefined>(undefined);
  const [details, setDetails] = useState<CompanyDetails | null>(null);
  const [financials, setFinancials] = useState<FinancialsResponse['results'][0] | null>(null);
  const [loading, setLoading] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  
  // AI Trade Analysis State
  const [tradePlan, setTradePlan] = useState<TradeAnalysis | null>(null);
  const [analyzingPlan, setAnalyzingPlan] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    setTradePlan(null); // Reset previous plan
    setTicker(searchInput.toUpperCase());
    
    try {
        const [bars, compDetails, fins] = await Promise.all([
            fetchStockData(searchInput, polygonKey),
            fetchCompanyDetails(searchInput, polygonKey),
            fetchStockFinancials(searchInput, polygonKey)
        ]);
        
        setStockData(bars);
        setDetails(compDetails);
        setFinancials(fins);
        
        if (showComparison) {
            fetchComparison();
        } else {
            setComparisonData(undefined);
        }

        // Trigger AI Plan Analysis automatically after data load
        analyzeTradePlan(searchInput, bars, compDetails?.name || searchInput);

    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  };

  const analyzeTradePlan = async (sym: string, bars: StockBar[], name: string) => {
      setAnalyzingPlan(true);
      const plan = await getTradeAnalysis(sym, bars, name);
      setTradePlan(plan);
      setAnalyzingPlan(false);
  };

  const fetchComparison = async () => {
      try {
          const spyData = await fetchStockData('SPY', polygonKey);
          setComparisonData(spyData);
      } catch (e) {
          console.error("Failed to fetch comparison", e);
      }
  };

  useEffect(() => {
    if (showComparison) {
        fetchComparison();
    } else {
        setComparisonData(undefined);
    }
  }, [showComparison]);

  useEffect(() => {
    handleSearch();
  }, []);

  const formatLargeNum = (num?: number) => {
    if (num === undefined || num === null) return 'N/A';
    if (num > 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num > 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num > 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    return `$${num.toLocaleString()}`;
  };

  // Trend Calculation
  const calculateTrend = () => {
      if (stockData.length < 2) return { val: 0, text: 'Neutral' };
      const start = stockData[0].c;
      const end = stockData[stockData.length - 1].c;
      const pct = ((end - start) / start) * 100;
      return { 
          val: pct, 
          text: pct > 20 ? 'Strong Bull' : pct > 0 ? 'Bullish' : pct < -20 ? 'Strong Bear' : 'Bearish'
      };
  };

  const trend = calculateTrend();

  const quickActions = [
      { label: 'Explain Chart', icon: '📈', prompt: 'Explain the technical chart patterns you see for this stock right now.' },
      { label: 'Risks', icon: '⚠️', prompt: 'What are the biggest downside risks for this company currently?' },
      { label: 'Competitors', icon: '⚔️', prompt: 'Compare this stock to its top 3 competitors.' },
      { label: 'Generate PDF Report', icon: '📄', prompt: 'Generate a research report PDF for this stock.' }
  ];

  return (
    <div className="flex h-full w-full overflow-hidden">
        <div className="flex-1 bg-slate-950 p-8 overflow-y-auto flex flex-col custom-scrollbar">
            {/* Header Search */}
            <div className="flex justify-between items-end mb-8 border-b border-slate-800 pb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Market Research Terminal</h1>
                        <p className="text-slate-400 text-sm">Deep dive into company fundamentals and price action.</p>
                    </div>
                    <div className="flex space-x-2">
                        <input 
                            type="text" 
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            placeholder="Enter Ticker (e.g. AAPL)"
                            className="bg-slate-900 border border-slate-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-emerald-500 w-64"
                        />
                        <button 
                            onClick={handleSearch}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg transition-colors font-medium"
                        >
                            Analyze
                        </button>
                    </div>
            </div>

            {loading ? (
                <div className="flex-1 flex items-center justify-center text-emerald-500">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col space-y-6 pb-20">
                    
                    {/* Top Row: Info & Stats */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Company Profile */}
                        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 relative">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center space-x-4">
                                        {details?.branding?.icon_url ? (
                                            <img src={`${details.branding.icon_url}?apiKey=${polygonKey}`} alt="logo" className="w-12 h-12 rounded bg-white object-contain p-1" />
                                        ) : (
                                            <div className="w-12 h-12 rounded bg-slate-800 flex items-center justify-center text-xl font-bold border border-slate-700">{ticker[0]}</div>
                                        )}
                                        <div>
                                            <h2 className="text-2xl font-bold text-white">{details?.name || ticker}</h2>
                                            <div className="flex space-x-2 text-xs text-slate-500 mt-1">
                                                <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700">{details?.ticker}</span>
                                                <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700">{details?.currency_name || 'USD'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs text-slate-500 uppercase">Market Cap</div>
                                        <div className="text-xl font-mono text-emerald-400">{formatLargeNum(details?.market_cap)}</div>
                                    </div>
                                </div>
                                <div className="mb-4 flex space-x-2">
                                     {details?.sic_sector && <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-1 rounded-full uppercase font-bold">{details.sic_sector}</span>}
                                     {details?.sic_industry && <span className="text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-1 rounded-full uppercase font-bold">{details.sic_industry}</span>}
                                </div>
                                <p className="text-sm text-slate-400 leading-relaxed line-clamp-3 hover:line-clamp-none transition-all cursor-pointer mb-4">
                                    {details?.description || "No description available."}
                                </p>
                                
                                {/* Financial Stats Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-800">
                                    <div>
                                        <div className="text-[10px] text-slate-500 uppercase">Revenue (TTM)</div>
                                        <div className="text-sm font-mono text-slate-200">{formatLargeNum(financials?.financials?.income_statement?.revenues?.value)}</div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-slate-500 uppercase">Net Income</div>
                                        <div className="text-sm font-mono text-slate-200">{formatLargeNum(financials?.financials?.income_statement?.net_income_loss?.value)}</div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-slate-500 uppercase">Gross Profit</div>
                                        <div className="text-sm font-mono text-slate-200">{formatLargeNum(financials?.financials?.income_statement?.gross_profit?.value)}</div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-slate-500 uppercase">Total Assets</div>
                                        <div className="text-sm font-mono text-slate-200">{formatLargeNum(financials?.financials?.balance_sheet?.assets?.value)}</div>
                                    </div>
                                </div>
                        </div>

                        {/* Performance Card */}
                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between">
                                <div>
                                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Performance (90d)</h3>
                                    <div className={`text-4xl font-bold ${trend.val >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {trend.val > 0 ? '+' : ''}{trend.val.toFixed(2)}%
                                    </div>
                                    <div className="text-sm text-slate-500 mt-1">{trend.text} Trend</div>
                                </div>
                                <div className="space-y-3 mt-6">
                                    <div className="flex justify-between items-center text-sm border-b border-slate-800 pb-2">
                                        <span className="text-slate-500">Current Price</span>
                                        <span className="text-slate-200 font-mono">${stockData[stockData.length-1]?.c.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm border-b border-slate-800 pb-2">
                                        <span className="text-slate-500">Period Low</span>
                                        <span className="text-slate-200 font-mono">${Math.min(...stockData.map(d=>d.l)).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-500">Period High</span>
                                        <span className="text-slate-200 font-mono">${Math.max(...stockData.map(d=>d.h)).toFixed(2)}</span>
                                    </div>
                                </div>
                        </div>
                    </div>

                    {/* Chart Section */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 min-h-[400px] flex flex-col">
                            <div className="flex justify-between items-center mb-4 px-2">
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Technical Analysis</h3>
                                <div className="flex items-center space-x-4">
                                     <button 
                                        onClick={() => setShowComparison(!showComparison)}
                                        className={`text-xs px-3 py-1 rounded border transition-colors ${showComparison ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/50' : 'text-slate-500 border-slate-700 hover:text-slate-300'}`}
                                     >
                                         {showComparison ? 'Hide SPY Comparison' : 'Compare vs SPY'}
                                     </button>
                                     <div className="text-xs text-slate-500">Candlestick + Volume</div>
                                </div>
                            </div>
                            <div className="flex-1 w-full relative h-[400px]">
                                <StockChart data={stockData} comparisonData={comparisonData} type={ChartType.CANDLESTICK} />
                            </div>
                    </div>

                    {/* AI Trading Plan Section */}
                    <div className="border-t border-slate-800 pt-6">
                        <div className="flex items-center mb-4">
                            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse mr-3"></div>
                            <h3 className="text-xl font-bold text-white">AI Quantitative Analysis Plan</h3>
                        </div>
                        
                        {analyzingPlan ? (
                            <div className="w-full h-32 flex items-center justify-center bg-slate-900 rounded-xl border border-slate-800">
                                <span className="text-slate-500 animate-pulse font-mono text-sm">Synthesizing Price Action & Fundamentals...</span>
                            </div>
                        ) : tradePlan ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Long Term */}
                                <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl hover:border-blue-500/30 transition-colors">
                                    <div className="flex justify-between items-center mb-3">
                                        <h4 className="font-bold text-blue-400">Long-term Investing</h4>
                                        <span className={`text-xs px-2 py-0.5 rounded font-bold ${tradePlan.longTerm.outlook === 'Bullish' ? 'bg-green-500/20 text-green-400' : tradePlan.longTerm.outlook === 'Bearish' ? 'bg-red-500/20 text-red-400' : 'bg-slate-700 text-slate-300'}`}>
                                            {tradePlan.longTerm.outlook}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-400 mb-3">{tradePlan.longTerm.thesis}</p>
                                    <div className="text-xs font-mono text-slate-500 pt-2 border-t border-slate-800">
                                        Key Levels: <span className="text-slate-300">{tradePlan.longTerm.keyLevels}</span>
                                    </div>
                                </div>

                                {/* Swing Trade */}
                                <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl hover:border-purple-500/30 transition-colors">
                                    <h4 className="font-bold text-purple-400 mb-3">Swing Trading Setup</h4>
                                    <p className="text-xs text-slate-400 mb-3">{tradePlan.swing.setup}</p>
                                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                                        <div>
                                            <span className="text-slate-500 block">Entry</span>
                                            <span className="text-emerald-400">{tradePlan.swing.entry}</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-500 block">Target</span>
                                            <span className="text-blue-400">{tradePlan.swing.target}</span>
                                        </div>
                                        <div className="col-span-2">
                                            <span className="text-slate-500 block">Stop Loss</span>
                                            <span className="text-red-400">{tradePlan.swing.stopLoss}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Day Trade */}
                                <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl hover:border-yellow-500/30 transition-colors">
                                    <div className="flex justify-between items-center mb-3">
                                        <h4 className="font-bold text-yellow-400">Day Trading Outlook</h4>
                                        <span className="text-xs px-2 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-300">{tradePlan.dayTrade.bias} Bias</span>
                                    </div>
                                    <p className="text-xs text-slate-400 mb-3">{tradePlan.dayTrade.plan}</p>
                                    <div className="text-xs font-mono text-slate-500 pt-2 border-t border-slate-800 italic">
                                        "{tradePlan.dayTrade.volatilityNote}"
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center text-slate-500 py-10">Unable to generate plan.</div>
                        )}
                    </div>
                </div>
            )}
        </div>
        
        {/* Integrated AI Tutor Sidebar with Quick Actions */}
        <AITutor 
            context={`Researching Ticker: ${ticker}. ${details ? `Company: ${details.name}. Market Cap: ${formatLargeNum(details.market_cap)}.` : ''} Latest Price: ${stockData[stockData.length-1]?.c}`} 
            initialMessage={`I can help you analyze ${ticker}'s chart, risks, and competitors. Or ask me to generate a PDF report.`} 
            quickActions={quickActions}
        />
    </div>
  );
};

export default StockResearch;