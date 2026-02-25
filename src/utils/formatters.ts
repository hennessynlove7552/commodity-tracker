import numeral from 'numeral';
import { format, formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

/**
 * Format currency value
 * KRW는 소수점 없이 정수 표시, USD/기타는 소수점 2자리 표시
 */
export const formatCurrency = (value: number, currency: string = 'USD'): string => {
    const symbols: Record<string, string> = {
        USD: '$',
        KRW: '₩',
        EUR: '€',
        GBP: '£',
        JPY: '¥',
    };

    const symbol = symbols[currency] || currency;

    if (currency === 'KRW' || currency === 'JPY') {
        // 원화/엔화는 정수 표시
        const formatted = numeral(value).format('0,0');
        return `${symbol}${formatted}`;
    }

    const formatted = numeral(value).format('0,0.00');
    return `${symbol}${formatted}`;
};

/**
 * Format price with currency conversion
 * USD 기준 가격을 선택한 통화로 변환 후 포맷
 */
export const formatPriceWithCurrency = (
    usdPrice: number,
    displayCurrency: 'USD' | 'KRW',
    usdToKrwRate: number = 1450
): string => {
    if (displayCurrency === 'KRW') {
        const krwPrice = usdPrice * usdToKrwRate;
        return formatCurrency(krwPrice, 'KRW');
    }
    return formatCurrency(usdPrice, 'USD');
};

/**
 * Format percentage value
 */
export const formatPercent = (value: number, decimals: number = 2): string => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${numeral(value).format(`0,0.${'0'.repeat(decimals)}`)}%`;
};

/**
 * Format large numbers (e.g., market cap)
 */
export const formatLargeNumber = (value: number): string => {
    if (value >= 1e12) {
        return numeral(value).format('0.00a').toUpperCase(); // T for trillion
    }
    if (value >= 1e9) {
        return numeral(value).format('0.00a').toUpperCase(); // B for billion
    }
    if (value >= 1e6) {
        return numeral(value).format('0.00a').toUpperCase(); // M for million
    }
    if (value >= 1e3) {
        return numeral(value).format('0.00a').toUpperCase(); // K for thousand
    }
    return numeral(value).format('0,0');
};

/**
 * Format date
 */
export const formatDate = (date: Date | string, formatStr: string = 'yyyy-MM-dd'): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, formatStr, { locale: ko });
};

/**
 * Format relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return formatDistanceToNow(dateObj, { addSuffix: true, locale: ko });
};

/**
 * Format time only
 */
export const formatTime = (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, 'HH:mm:ss', { locale: ko });
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return `${text.slice(0, maxLength)}...`;
};

/**
 * Get color class based on value change
 */
export const getChangeColor = (value: number): string => {
    if (value > 0) return 'var(--color-success)';
    if (value < 0) return 'var(--color-danger)';
    return 'var(--text-secondary)';
};

/**
 * Get trend icon based on value change
 */
export const getTrendIcon = (value: number): '↑' | '↓' | '→' => {
    if (value > 0) return '↑';
    if (value < 0) return '↓';
    return '→';
};
