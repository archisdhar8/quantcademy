import { Module, Difficulty, StockBar } from './types';

export const MOCK_TICKER = 'SPY';
export const DEFAULT_POLYGON_KEY = 'xZXyMiBKEZEOQq9GHHm0UDx_8ytcPikp';

export const CURRICULUM: Module[] = [
  {
    id: 'intro-markets',
    title: '1. Market Mechanics',
    difficulty: Difficulty.BEGINNER,
    description: 'Foundational knowledge of market structure, participants, and order execution.',
    topics: [
      'What is a Stock & Equity?',
      'The Order Book (Bid/Ask/Spread)',
      'Market vs Limit vs Stop Orders',
      'Liquidity Providers vs Takers',
      'Exchanges vs Dark Pools'
    ]
  },
  {
    id: 'basic-econ',
    title: '2. Macro Economics',
    difficulty: Difficulty.BEGINNER,
    description: 'Understanding the global economic forces that drive asset prices.',
    topics: [
      'The Federal Reserve & Monetary Policy',
      'Interest Rates & Discounted Cash Flow',
      'Inflation (CPI, PPI, PCE)',
      'GDP & Business Cycles',
      'Unemployment & Labor Markets',
      'Bond Yields & Inverted Yield Curves'
    ]
  },
  {
    id: 'tech-analysis',
    title: '3. Technical Analysis',
    difficulty: Difficulty.INTERMEDIATE,
    description: 'Mastering chart reading, indicators, and price action patterns.',
    topics: [
      'Candlestick Anatomy & Patterns',
      'Support, Resistance & Trendlines',
      'Moving Averages (SMA, EMA, VWAP)',
      'Momentum Indicators (RSI, MACD)',
      'Volatility Indicators (Bollinger Bands, ATR)',
      'Volume Analysis & accumulation'
    ]
  },
  {
    id: 'fund-analysis',
    title: '3.5. Fundamental Analysis',
    difficulty: Difficulty.INTERMEDIATE,
    description: 'Evaluating the intrinsic value of a company using financial statements and ratios.',
    topics: [
      'P/E Ratio (Price-to-Earnings)',
      'EPS (Earnings Per Share)',
      'P/B Ratio (Price-to-Book)',
      'ROE (Return on Equity)',
      'PEG Ratio (Growth Adjusted)',
      'Free Cash Flow',
      'Debt-to-Equity Ratio'
    ]
  },
  {
    id: 'intro-quant',
    title: '4. Quant Strategies',
    difficulty: Difficulty.ADVANCED,
    description: 'Systematic trading, algorithm design, and statistical edges.',
    topics: [
      'Introduction to Backtesting',
      'Mean Reversion Strategies (Pairs Trading)',
      'Trend Following & Momentum',
      'Statistical Arbitrage',
      'Market Making & HFT Basics',
      'Sentiment Analysis (NLP) in Trading'
    ]
  },
  {
    id: 'risk-hedging',
    title: '5. Advanced Options',
    difficulty: Difficulty.EXPERT,
    description: 'Complex derivative strategies for income generation and portfolio protection.',
    topics: [
      'The Greeks (Delta, Gamma, Theta, Vega)',
      'Implied Volatility (IV) & Skew',
      'Covered Calls (Income Generation)',
      'Cash Secured Puts',
      'Iron Condors (Range Bound)',
      'Straddles & Strangles (Volatility Plays)',
      'Vertical Spreads (Bull/Bear Call/Put)',
      'Tail Risk Hedging'
    ]
  },
  {
    id: 'stock-research',
    title: '6. Stock Research Tool',
    difficulty: Difficulty.EXPERT,
    description: 'Real-time fundamental and technical analysis tool.',
    topics: ['Research Terminal']
  },
  {
    id: 'quant-analyzer',
    title: '7. Quant Analyzer',
    difficulty: Difficulty.EXPERT,
    description: 'Upload financial documents (PDFs, Charts) for AI-driven insights.',
    topics: ['Document Analysis']
  }
];

// Mock data generator for when Polygon key is missing or limit reached
export const generateMockData = (count: number = 100): StockBar[] => {
  const data: StockBar[] = [];
  let price = 450;
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;

  for (let i = count; i > 0; i--) {
    const time = now - i * day;
    const volatility = price * 0.015;
    const change = (Math.random() - 0.5) * volatility;
    const open = price;
    const close = price + change;
    const high = Math.max(open, close) + Math.random() * volatility * 0.5;
    const low = Math.min(open, close) - Math.random() * volatility * 0.5;
    const volume = Math.floor(Math.random() * 5000000) + 1000000;
    
    data.push({
      t: time,
      o: Number(open.toFixed(2)),
      h: Number(high.toFixed(2)),
      l: Number(low.toFixed(2)),
      c: Number(close.toFixed(2)),
      v: volume
    });
    price = close;
  }
  return data;
};