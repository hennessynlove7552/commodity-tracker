import { twelveDataClient } from './client';
import { Commodity } from '@/types';
import { MOCK_COMMODITIES } from '@/utils/constants';

/**
 * Fetch commodity price data
 * For MVP, we'll use mock data. In production, this would call the real API.
 */
export const fetchCommodityPrice = async (symbol: string): Promise<any> => {
    try {
        // Uncomment for real API calls
        // const { data } = await twelveDataClient.get('/price', {
        //   params: { symbol },
        // });
        // return data;

        // Mock data for development
        await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate network delay
        const commodity = MOCK_COMMODITIES.find((c) => c.symbol === symbol);
        if (!commodity) throw new Error('Commodity not found');
        return {
            price: commodity.currentPrice,
            symbol: commodity.symbol,
        };
    } catch (error) {
        console.error('Failed to fetch commodity price:', error);
        throw error;
    }
};

/**
 * Fetch all commodities
 * For MVP, returns mock data
 */
export const fetchAllCommodities = async (): Promise<Commodity[]> => {
    try {
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 800));

        // Return mock data with slight random variations
        return MOCK_COMMODITIES.map((commodity) => ({
            ...commodity,
            currentPrice: commodity.currentPrice * (1 + (Math.random() - 0.5) * 0.02),
            change: commodity.change * (1 + (Math.random() - 0.5) * 0.3),
            changePercent: commodity.changePercent * (1 + (Math.random() - 0.5) * 0.3),
            lastUpdated: new Date(),
        }));
    } catch (error) {
        console.error('Failed to fetch commodities:', error);
        throw error;
    }
};

/**
 * Fetch commodity details
 */
export const fetchCommodityDetails = async (id: string): Promise<Commodity> => {
    try {
        await new Promise((resolve) => setTimeout(resolve, 500));
        const commodity = MOCK_COMMODITIES.find((c) => c.id === id);
        if (!commodity) throw new Error('Commodity not found');
        return {
            ...commodity,
            lastUpdated: new Date(),
        };
    } catch (error) {
        console.error('Failed to fetch commodity details:', error);
        throw error;
    }
};

/**
 * Fetch price history for charts
 */
export const fetchPriceHistory = async (
    symbol: string,
    timeframe: string = '1M'
): Promise<any[]> => {
    try {
        await new Promise((resolve) => setTimeout(resolve, 600));

        // Generate mock historical data
        const points = timeframe === '1D' ? 24 : timeframe === '1W' ? 7 : 30;
        const basePrice = MOCK_COMMODITIES.find((c) => c.symbol === symbol)?.currentPrice || 100;

        return Array.from({ length: points }, (_, i) => {
            const timestamp = new Date();
            timestamp.setDate(timestamp.getDate() - (points - i));

            return {
                timestamp: timestamp.toISOString(),
                open: basePrice * (1 + (Math.random() - 0.5) * 0.05),
                high: basePrice * (1 + Math.random() * 0.03),
                low: basePrice * (1 - Math.random() * 0.03),
                close: basePrice * (1 + (Math.random() - 0.5) * 0.05),
                volume: Math.floor(Math.random() * 1000000),
            };
        });
    } catch (error) {
        console.error('Failed to fetch price history:', error);
        throw error;
    }
};
