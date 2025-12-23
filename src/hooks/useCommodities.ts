import { useQuery } from '@tanstack/react-query';
import { fetchAllCommodities, fetchCommodityDetails, fetchPriceHistory } from '@/services/api/commodities';
import type { Commodity } from '@/types';

/**
 * Hook to fetch all commodities
 */
export const useCommodities = () => {
    return useQuery<Commodity[], Error>({
        queryKey: ['commodities'],
        queryFn: fetchAllCommodities,
        staleTime: 30 * 1000, // 30 seconds
        refetchInterval: 30 * 1000, // Auto-refetch every 30 seconds
    });
};

/**
 * Hook to fetch single commodity details
 */
export const useCommodity = (id: string) => {
    return useQuery<Commodity, Error>({
        queryKey: ['commodity', id],
        queryFn: () => fetchCommodityDetails(id),
        enabled: !!id,
    });
};

/**
 * Hook to fetch price history
 */
export const usePriceHistory = (symbol: string, timeframe: string = '1M') => {
    return useQuery({
        queryKey: ['priceHistory', symbol, timeframe],
        queryFn: () => fetchPriceHistory(symbol, timeframe),
        enabled: !!symbol,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};
