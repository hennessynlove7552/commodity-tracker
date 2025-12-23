import axios from 'axios';

// API keys from environment variables
const apiKeys = {
    alphaVantage: import.meta.env.VITE_ALPHA_VANTAGE_API_KEY || '',
    twelveData: import.meta.env.VITE_TWELVE_DATA_API_KEY || '',
    news: import.meta.env.VITE_NEWS_API_KEY || '',
};

// Alpha Vantage API client
export const alphaVantageClient = axios.create({
    baseURL: 'https://www.alphavantage.co/query',
    timeout: 10000,
    params: {
        apikey: apiKeys.alphaVantage,
    },
});

// Twelve Data API client
export const twelveDataClient = axios.create({
    baseURL: 'https://api.twelvedata.com',
    timeout: 10000,
    params: {
        apikey: apiKeys.twelveData,
    },
});

// Finnhub API client (for news)
export const finnhubClient = axios.create({
    baseURL: 'https://finnhub.io/api/v1',
    timeout: 10000,
    params: {
        token: apiKeys.news,
    },
});

// Error handling interceptor
const errorInterceptor = (error: unknown) => {
    if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status: number; data: unknown } };
        console.error('API Error:', axiosError.response?.status, axiosError.response?.data);
    } else if (error && typeof error === 'object' && 'request' in error && 'message' in error) {
        const requestError = error as unknown as { message: string };
        console.error('Network Error:', requestError.message);
    } else {
        const genericError = error as { message?: string };
        console.error('Error:', genericError.message || 'Unknown error');
    }
    return Promise.reject(error);
};

alphaVantageClient.interceptors.response.use((response) => response, errorInterceptor);
twelveDataClient.interceptors.response.use((response) => response, errorInterceptor);
finnhubClient.interceptors.response.use((response) => response, errorInterceptor);
