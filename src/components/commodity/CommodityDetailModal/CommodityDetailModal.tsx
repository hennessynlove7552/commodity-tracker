import React, { useState, useMemo } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Bar, ComposedChart } from 'recharts';
import { Commodity } from '@/types';
import { formatCurrency, formatPercent } from '@/utils/formatters';
import styles from './CommodityDetailModal.module.css';

interface CommodityDetailModalProps {
    commodity: Commodity;
    onClose: () => void;
}

type TimeRange = '1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL';

export const CommodityDetailModal: React.FC<CommodityDetailModalProps> = ({ commodity, onClose }) => {
    const [timeRange, setTimeRange] = useState<TimeRange>('1M');

    // Generate mock historical candlestick data (OHLC)
    const chartData = useMemo(() => {
        const dataPoints: { [key in TimeRange]: number } = {
            '1D': 24,
            '1W': 7,
            '1M': 30,
            '3M': 90,
            '1Y': 365,
            'ALL': 730,
        };

        const points = dataPoints[timeRange];
        const data = [];
        const basePrice = commodity.currentPrice;
        const volatility = basePrice * 0.02; // 2% daily volatility

        // Use commodity ID as seed for deterministic random
        const seed = commodity.id.charCodeAt(0) || 1;
        let previousClose = basePrice;

        for (let i = points; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);

            // Generate OHLC data
            const openSeed = Math.sin(seed * i * 1.1) * 10000;
            const highSeed = Math.sin(seed * i * 1.2) * 10000;
            const lowSeed = Math.sin(seed * i * 1.3) * 10000;
            const closeSeed = Math.sin(seed * i * 1.4) * 10000;

            const openChange = (openSeed - Math.floor(openSeed) - 0.5) * volatility;
            const open = Number((previousClose + openChange).toFixed(2));

            const highChange = Math.abs((highSeed - Math.floor(highSeed))) * volatility;
            const high = Number((Math.max(open, previousClose) + highChange).toFixed(2));

            const lowChange = Math.abs((lowSeed - Math.floor(lowSeed))) * volatility;
            const low = Number((Math.min(open, previousClose) - lowChange).toFixed(2));

            const closeChange = (closeSeed - Math.floor(closeSeed) - 0.5) * volatility;
            const close = Number((open + closeChange).toFixed(2));

            previousClose = close;

            data.push({
                date: date.toLocaleDateString('ko-KR', {
                    month: 'short',
                    day: 'numeric',
                    ...(timeRange === '1Y' || timeRange === 'ALL' ? { year: '2-digit' } : {})
                }),
                open,
                high: Math.max(open, high, close),
                low: Math.min(open, low, close),
                close,
                fill: close >= open ? '#10b981' : '#ef4444', // green if up, red if down
            });
        }

        return data;
    }, [commodity.currentPrice, commodity.id, timeRange]);

    const stats = useMemo(() => {
        const highs = chartData.map(d => d.high);
        const lows = chartData.map(d => d.low);
        const closes = chartData.map(d => d.close);
        const seed = commodity.id.charCodeAt(0) || 1;
        const pseudoRandom = Math.sin(seed * 999) * 10000;
        const volume = Math.floor((pseudoRandom - Math.floor(pseudoRandom)) * 1000000) + 500000;

        return {
            high: Math.max(...highs),
            low: Math.min(...lows),
            avg: closes.reduce((a, b) => a + b, 0) / closes.length,
            volume,
        };
    }, [chartData, commodity.id]);

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className={styles.overlay} onClick={handleOverlayClick}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <div className={styles.titleSection}>
                        <div className={styles.titleRow}>
                            <span className={styles.icon}>{commodity.icon}</span>
                            <h2 className={styles.title}>{commodity.nameKo}</h2>
                        </div>
                        <p className={styles.subtitle}>{commodity.name} ({commodity.symbol})</p>
                    </div>
                    <button className={styles.closeButton} onClick={onClose}>
                        ×
                    </button>
                </div>

                <div className={styles.priceSection}>
                    <div className={styles.priceCard}>
                        <div className={styles.priceLabel}>현재가</div>
                        <div className={styles.priceValue}>
                            {formatCurrency(commodity.currentPrice, commodity.currency)}
                        </div>
                        <div className={`${styles.priceChange} ${commodity.change >= 0 ? styles.positive : styles.negative}`}>
                            {commodity.change >= 0 ? '▲' : '▼'} {formatCurrency(Math.abs(commodity.change), commodity.currency)} ({formatPercent(commodity.changePercent)})
                        </div>
                    </div>

                    <div className={styles.priceCard}>
                        <div className={styles.priceLabel}>최고가</div>
                        <div className={styles.priceValue}>
                            {formatCurrency(stats.high, commodity.currency)}
                        </div>
                    </div>

                    <div className={styles.priceCard}>
                        <div className={styles.priceLabel}>최저가</div>
                        <div className={styles.priceValue}>
                            {formatCurrency(stats.low, commodity.currency)}
                        </div>
                    </div>

                    <div className={styles.priceCard}>
                        <div className={styles.priceLabel}>평균가</div>
                        <div className={styles.priceValue}>
                            {formatCurrency(stats.avg, commodity.currency)}
                        </div>
                    </div>
                </div>

                <div className={styles.chartSection}>
                    <div className={styles.chartHeader}>
                        <h3 className={styles.chartTitle}>가격 추이</h3>
                        <div className={styles.timeRangeButtons}>
                            {(['1D', '1W', '1M', '3M', '1Y', 'ALL'] as TimeRange[]).map((range) => (
                                <button
                                    key={range}
                                    className={`${styles.timeRangeButton} ${timeRange === range ? styles.active : ''}`}
                                    onClick={() => setTimeRange(range)}
                                >
                                    {range}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className={styles.chartContainer}>
                        <ResponsiveContainer width="100%" height={400}>
                            <ComposedChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                <XAxis
                                    dataKey="date"
                                    stroke="#888"
                                    style={{ fontSize: '12px' }}
                                />
                                <YAxis
                                    stroke="#888"
                                    style={{ fontSize: '12px' }}
                                    domain={['dataMin - 5', 'dataMax + 5']}
                                    tickFormatter={(value) => `${value.toFixed(0)}`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1a1a1a',
                                        border: '1px solid #333',
                                        borderRadius: '8px',
                                        color: '#fff'
                                    }}
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            const data = payload[0].payload;
                                            const isUp = data.close >= data.open;
                                            return (
                                                <div style={{
                                                    backgroundColor: '#1a1a1a',
                                                    border: '1px solid #333',
                                                    borderRadius: '8px',
                                                    padding: '12px',
                                                    color: '#fff'
                                                }}>
                                                    <p style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>{data.date}</p>
                                                    <p style={{ margin: '4px 0', color: '#888' }}>시가: {formatCurrency(data.open, commodity.currency)}</p>
                                                    <p style={{ margin: '4px 0', color: '#10b981' }}>고가: {formatCurrency(data.high, commodity.currency)}</p>
                                                    <p style={{ margin: '4px 0', color: '#ef4444' }}>저가: {formatCurrency(data.low, commodity.currency)}</p>
                                                    <p style={{ margin: '4px 0', color: isUp ? '#10b981' : '#ef4444', fontWeight: 'bold' }}>
                                                        종가: {formatCurrency(data.close, commodity.currency)}
                                                    </p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                {/* Candlestick wicks (high-low lines) */}
                                <Bar
                                    dataKey={(data: { low: number; high: number }) => [data.low, data.high]}
                                    fill="#888"
                                    barSize={1}
                                />
                                {/* Candlestick bodies (open-close rectangles) */}
                                <Bar
                                    dataKey={(data: { open: number; close: number }) => [Math.min(data.open, data.close), Math.max(data.open, data.close)]}
                                    fill="#06b6d4"
                                    barSize={8}
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    shape={(props: any) => {
                                        const { x, y, width, height, payload } = props;
                                        const isUp = payload.close >= payload.open;
                                        const color = isUp ? '#10b981' : '#ef4444';

                                        return (
                                            <g>
                                                {/* Wick (high-low line) - This calculation is problematic as explained above, but following instruction */}
                                                <line
                                                    x1={x + width / 2}
                                                    y1={y - (payload.high - Math.max(payload.open, payload.close)) * (height / (Math.abs(payload.open - payload.close) || 1))}
                                                    x2={x + width / 2}
                                                    y2={y + height + (Math.min(payload.open, payload.close) - payload.low) * (height / (Math.abs(payload.open - payload.close) || 1))}
                                                    stroke={color}
                                                    strokeWidth={1}
                                                />
                                                {/* Body (open-close rectangle) */}
                                                <rect
                                                    x={x}
                                                    y={y}
                                                    width={width}
                                                    height={height || 1} // Ensure height is at least 1 for flat candles
                                                    fill={color}
                                                    stroke={color}
                                                    strokeWidth={1}
                                                />
                                            </g>
                                        );
                                    }}
                                />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className={styles.statsSection}>
                    <div className={styles.statCard}>
                        <div className={styles.statLabel}>거래량 (24h)</div>
                        <div className={styles.statValue}>{stats.volume.toLocaleString()}</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statLabel}>카테고리</div>
                        <div className={styles.statValue}>{commodity.category}</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statLabel}>통화</div>
                        <div className={styles.statValue}>{commodity.currency}</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statLabel}>마지막 업데이트</div>
                        <div className={styles.statValue}>
                            {new Date(commodity.lastUpdated).toLocaleString('ko-KR')}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
