
export interface StockBar {
  t: number; // Timestamp
  o: number; // Open
  h: number; // High
  l: number; // Low
  c: number; // Close
  v: number; // Volume
}

export interface PolygonResponse {
  ticker: string;
  queryCount: number;
  resultsCount: number;
  adjusted: boolean;
  results: StockBar[];
  status: string;
  request_id: string;
  count: number;
}

export interface CompanyDetails {
  ticker: string;
  name: string;
  description?: string;
  sic_description?: string;
  sic_sector?: string;
  sic_industry?: string;
  homepage_url?: string;
  market_cap?: number;
  currency_name?: string;
  branding?: {
    logo_url?: string;
    icon_url?: string;
  };
}

export interface FinancialDataPoint {
  value: number;
  unit: string;
  label: string;
  order: number;
}

export interface FinancialsResponse {
  results: {
    start_date: string;
    end_date: string;
    filing_date: string;
    fiscal_period: string;
    fiscal_year: string;
    financials: {
      income_statement?: {
        revenues?: FinancialDataPoint;
        net_income_loss?: FinancialDataPoint;
        gross_profit?: FinancialDataPoint;
        operating_expenses?: FinancialDataPoint;
      };
      balance_sheet?: {
        assets?: FinancialDataPoint;
        liabilities?: FinancialDataPoint;
        equity?: FinancialDataPoint;
      };
      cash_flow_statement?: {
        net_cash_flow?: FinancialDataPoint;
      };
    };
  }[];
  status: string;
}

export enum Difficulty {
  BEGINNER = 'Beginner',
  INTERMEDIATE = 'Intermediate',
  ADVANCED = 'Advanced',
  EXPERT = 'Expert'
}

export interface Module {
  id: string;
  title: string;
  difficulty: Difficulty;
  description: string;
  topics: string[];
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  isThinking?: boolean;
}

export enum ChartType {
  CANDLESTICK = 'CANDLESTICK',
  LINE = 'LINE'
}

// Visualization Types
export type VisualType = 'FLOW' | 'PROCESS' | 'NONE';

export interface VisualNode {
  id: string;
  label: string;
  row: number; // 0-2
  col: number; // 0-2
  icon?: string; // Emoji or simple icon name
}

export interface VisualEdge {
  from: string;
  to: string;
  label: string;
  color?: string; // 'green', 'red', 'blue'
}

export interface VisualData {
  nodes: VisualNode[];
  edges: VisualEdge[];
}

export interface LessonStep {
  title: string;
  explanation: string;
  visualType: VisualType;
  visualData?: VisualData;
}

export interface LessonResponse {
  steps: LessonStep[];
}

export interface TradeAnalysis {
  longTerm: {
    outlook: 'Bullish' | 'Bearish' | 'Neutral';
    thesis: string;
    keyLevels: string;
  };
  swing: {
    setup: string;
    entry: string;
    stopLoss: string;
    target: string;
  };
  dayTrade: {
    bias: 'Long' | 'Short' | 'Chop';
    plan: string;
    volatilityNote: string;
  };
}

export interface DocumentAnalysis {
  summary: string;
  keyPoints: string[];
  sentiment: 'Positive' | 'Negative' | 'Neutral';
  recommendation: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string; // Explained if user gets it wrong
}

export interface QuizResponse {
  questions: QuizQuestion[];
}
