// Commodity Types
export enum CommodityCategory {
    PRECIOUS_METALS = 'PRECIOUS_METALS',
    ENERGY = 'ENERGY',
    AGRICULTURE = 'AGRICULTURE',
    INDUSTRIAL_METALS = 'INDUSTRIAL_METALS',
}

export interface Commodity {
    id: string;
    symbol: string;
    name: string;
    nameKo: string;
    category: CommodityCategory;
    currentPrice: number;
    currency: string;
    change: number;
    changePercent: number;
    lastUpdated: Date;
    icon?: string;
    marketCap?: number;
    volume24h?: number;
}

export interface PriceHistory {
    timestamp: Date;
    open: number;
    high: number;
    low: number;
    close: number;
    volume?: number;
}

export interface ChartData {
    commodityId: string;
    timeframe: '1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL';
    data: PriceHistory[];
}

// News Types
export interface NewsArticle {
    id: string;
    title: string;
    summary: string;
    url: string;
    source: string;
    publishedAt: Date;
    relatedCommodities: string[];
    imageUrl?: string;
    sentiment?: 'positive' | 'negative' | 'neutral';
}

// User Watchlist Types
export interface UserWatchlist {
    commodities: string[];
    alerts: PriceAlert[];
}

export interface PriceAlert {
    id: string;
    commodityId: string;
    condition: 'above' | 'below';
    targetPrice: number;
    enabled: boolean;
    createdAt: Date;
}

// API Response Types
export interface ApiResponse<T> {
    data: T;
    status: 'success' | 'error';
    message?: string;
    timestamp: Date;
}

export interface PriceUpdateEvent {
    symbol: string;
    price: number;
    change: number;
    changePercent: number;
    timestamp: Date;
}
