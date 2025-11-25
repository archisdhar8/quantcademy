import { PolygonResponse, StockBar, CompanyDetails, FinancialsResponse } from '../types';
import { generateMockData } from '../constants';

export const fetchStockData = async (ticker: string, apiKey: string): Promise<StockBar[]> => {
  if (!apiKey) {
    console.warn("No Polygon API Key provided. Using mock data.");
    return new Promise(resolve => setTimeout(() => resolve(generateMockData(100)), 500));
  }

  // Date range calculation (last 3 months approx)
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 90);
  
  const formatDate = (date: Date) => date.toISOString().split('T')[0];

  const url = `https://api.polygon.io/v2/aggs/ticker/${ticker.toUpperCase()}/range/1/day/${formatDate(startDate)}/${formatDate(endDate)}?adjusted=true&sort=asc&limit=5000&apiKey=${apiKey}`;

  try {
    const response = await fetch(url);
    
    if (response.status === 429) {
        console.warn("Polygon Rate Limit Hit. Showing Mock Data.");
        return generateMockData(100);
    }

    if (!response.ok) {
        console.warn(`Polygon API Error (${response.statusText}). Falling back to simulation.`);
        return generateMockData(100);
    }

    const data: PolygonResponse = await response.json();

    if (data.results && data.results.length > 0) {
      return data.results;
    } else {
      // If ticker not found or empty
      return generateMockData(100);
    }
  } catch (error) {
    console.error("Failed to fetch Polygon data, using simulation:", error);
    return generateMockData(100);
  }
};

export const fetchCompanyDetails = async (ticker: string, apiKey: string): Promise<CompanyDetails | null> => {
    if (!apiKey) return null;
    
    const url = `https://api.polygon.io/v3/reference/tickers/${ticker.toUpperCase()}?apiKey=${apiKey}`;
    
    try {
        const response = await fetch(url);
        if(!response.ok) return null;
        
        const data = await response.json();
        if(data.status === 'OK' && data.results) {
            return data.results as CompanyDetails;
        }
        return null;
    } catch (error) {
        console.error("Error fetching company details", error);
        return null;
    }
};

export const fetchStockFinancials = async (ticker: string, apiKey: string): Promise<FinancialsResponse['results'][0] | null> => {
    if (!apiKey) return null;

    // Using vX as requested for experimental/standard financials
    const url = `https://api.polygon.io/vX/reference/financials?ticker=${ticker.toUpperCase()}&limit=1&apiKey=${apiKey}`;

    try {
        const response = await fetch(url);
        if (!response.ok) return null;

        const data: FinancialsResponse = await response.json();
        if (data.status === 'OK' && data.results && data.results.length > 0) {
            return data.results[0];
        }
        return null;
    } catch (error) {
        console.error("Error fetching financials", error);
        return null;
    }
};