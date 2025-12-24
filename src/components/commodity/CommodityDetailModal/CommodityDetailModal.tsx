import React, { useState, useMemo } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Bar, ComposedChart, Line } from 'recharts';
import { Commodity } from '@/types';
import { formatCurrency, formatPercent } from '@/utils/formatters';
import styles from './CommodityDetailModal.module.css';

interface CommodityDetailModalProps {
    commodity: Commodity;
    onClose: () => void;
}

type TimeRange = '1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL';

interface ChartDataPoint {
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    fill: string;
    sma20?: number | null;
    sma50?: number | null;
    bbUpper?: number | null;
    bbMiddle?: number | null;
    bbLower?: number | null;
}

export const CommodityDetailModal: React.FC<CommodityDetailModalProps> = ({ commodity, onClose }) => {
    const [timeRange, setTimeRange] = useState<TimeRange>('1M');

    // Advanced Market Data Simulation Engine (Institutional Grade)
    const chartData = useMemo(() => {
        const dataPoints: { [key in TimeRange]: number } = {
            '1D': 24, // Hourly for 1D? Simplified to daily points for now to maintain consistency
            '1W': 14,
            '1M': 30,
            '3M': 90,
            '1Y': 250, // Trading days approx
            'ALL': 500,
        };

        const points = dataPoints[timeRange];
        const data: ChartDataPoint[] = [];

        // 1. Volatility & Market Regime Configuration
        const basePrice = commodity.currentPrice;
        const seed = commodity.id.charCodeAt(0) + commodity.id.charCodeAt(commodity.id.length - 1);

        // Commodity specific volatility profile
        const volProfile: { [key: string]: number } = {
            'ENERGY': 0.02,     // High vol
            'METALS': 0.012,    // Medium vol
            'AGRICULTURE': 0.015,
            'DEFAULT': 0.01
        };
        const baseVol = volProfile[commodity.category] || volProfile['DEFAULT'];

        // Pseudo-random number generator with seed
        let seedState = seed;
        const random = () => {
            const x = Math.sin(seedState++) * 10000;
            return x - Math.floor(x);
        };

        // Box-Muller transform for normal distribution
        const randomNormal = () => {
            let u = 0, v = 0;
            while (u === 0) u = random();
            while (v === 0) v = random();
            return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
        };

        // 2. Trend & Momentum Generation
        const pathChanges: number[] = [];
        let currentVol = baseVol;
        let trend = (random() - 0.5) * 0.005; // Initial small trend

        for (let i = 0; i < points; i++) {
            // Regime switching
            if (random() < 0.05) currentVol = baseVol * (1 + random());
            if (random() < 0.05) currentVol = baseVol;

            // Trend evolution
            if (random() < 0.1) trend = (random() - 0.5) * 0.005;

            const drift = trend;
            const shock = randomNormal() * currentVol;
            const change = drift + shock;
            pathChanges.push(change);
        }

        let startPrice = basePrice;
        for (let i = 0; i < points; i++) {
            startPrice /= (1 + pathChanges[i]);
        }

        let currOpen = startPrice;

        for (let i = 0; i < points; i++) {
            const date = new Date();
            date.setDate(date.getDate() - (points - 1 - i));

            const changePct = pathChanges[points - 1 - i];
            const currClose = currOpen * (1 + changePct);

            const bodyTop = Math.max(currOpen, currClose);
            const bodyBottom = Math.min(currOpen, currClose);

            const high = bodyTop + Math.abs(randomNormal()) * (currOpen * currentVol * 0.5);
            const low = bodyBottom - Math.abs(randomNormal()) * (currOpen * currentVol * 0.5);

            const validHigh = Math.max(high, bodyTop);
            const validLow = Math.min(low, bodyBottom);

            const baseVolume = 100000;
            const volumeSpike = Math.abs(changePct) > currentVol ? 2.5 : 1;
            const volume = Math.floor(baseVolume * (0.8 + random() * 0.4) * volumeSpike);

            data.push({
                date: date.toLocaleDateString('ko-KR', {
                    month: '2-digit',
                    day: '2-digit',
                    ...(timeRange === '1Y' || timeRange === 'ALL' ? { year: '2-digit' } : {})
                }),
                open: Number(currOpen.toFixed(2)),
                high: Number(validHigh.toFixed(2)),
                low: Number(validLow.toFixed(2)),
                close: Number(currClose.toFixed(2)),
                volume,
                fill: currClose >= currOpen ? '#26a69a' : '#ef5350',
            });

            currOpen = currClose;
        }

        // 3. Technical Indicators Calculation
        const calculateSMA = (period: number) => {
            const sma = [];
            for (let i = 0; i < data.length; i++) {
                if (i < period - 1) {
                    sma.push(null);
                    continue;
                }
                let sum = 0;
                for (let j = 0; j < period; j++) {
                    sum += data[i - j].close;
                }
                sma.push(Number((sum / period).toFixed(2)));
            }
            return sma;
        };

        const sma20 = calculateSMA(20);
        const sma50 = calculateSMA(50);

        // Bollinger Bands (20, 2)
        const bb = data.map((_, i) => {
            if (i < 19) return { upper: null, middle: null, lower: null };
            const slice = data.slice(i - 19, i + 1).map(x => x.close);
            const mean = slice.reduce((a, b) => a + b, 0) / 20;
            const variance = slice.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / 20;
            const stdDev = Math.sqrt(variance);
            return {
                upper: Number((mean + 2 * stdDev).toFixed(2)),
                middle: Number(mean.toFixed(2)),
                lower: Number((mean - 2 * stdDev).toFixed(2))
            };
        });

        data.forEach((d, i) => {
            d.sma20 = sma20[i];
            d.sma50 = sma50[i];
            d.bbUpper = bb[i].upper;
            d.bbMiddle = bb[i].middle;
            d.bbLower = bb[i].lower;
        });

        return data;
    }, [commodity, timeRange]);

    const stats = useMemo(() => {
        const prices = chartData.map(d => d.close);
        return {
            high: Math.max(...chartData.map(d => d.high)),
            low: Math.min(...chartData.map(d => d.low)),
            avg: prices.reduce((a, b) => a + b, 0) / prices.length
        };
    }, [chartData]);

    const [selectedCandle, setSelectedCandle] = useState<ChartDataPoint | null>(null);

    const handleCandleClick = (data: ChartDataPoint) => {
        setSelectedCandle(data);
    };

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) onClose();
    };

    return (
        <div className={styles.overlay} onClick={handleOverlayClick}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <div className={styles.headerTitle}>
                        <h2>{commodity.name}</h2>
                        <span className={styles.categoryBadge}>{commodity.category}</span>
                    </div>
                    <button className={styles.closeButton} onClick={onClose}>×</button>
                </div>

                <div className={styles.priceSection}>
                    <div className={styles.currentPrice}>
                        {formatCurrency(commodity.currentPrice, commodity.currency)}
                    </div>
                    <div className={`${styles.priceChange} ${commodity.change >= 0 ? styles.positive : styles.negative}`}>
                        {commodity.change >= 0 ? '▲' : '▼'} {Math.abs(commodity.change)} ({formatPercent(Math.abs(commodity.changePercent))})
                    </div>
                </div>

                <div className={styles.statsGrid}>
                    <div className={styles.statItem}>
                        <span className={styles.statLabel}>고가 (High)</span>
                        <span className={styles.statValue} style={{ color: '#26a69a' }}>{formatCurrency(stats.high, commodity.currency)}</span>
                    </div>
                    <div className={styles.statItem}>
                        <span className={styles.statLabel}>저가 (Low)</span>
                        <span className={styles.statValue} style={{ color: '#ef5350' }}>{formatCurrency(stats.low, commodity.currency)}</span>
                    </div>
                    <div className={styles.statItem}>
                        <span className={styles.statLabel}>이동평균 (SMA 20)</span>
                        <span className={styles.statValue} style={{ color: '#f59e0b' }}>
                            {chartData.length > 0 && chartData[chartData.length - 1].sma20 ? formatCurrency(chartData[chartData.length - 1].sma20!, commodity.currency) : '-'}
                        </span>
                    </div>
                </div>

                <div className={styles.chartSection} style={{ backgroundColor: '#131722', borderRadius: '4px', padding: '16px', border: '1px solid #2a2e39' }}>
                    <div className={styles.chartControls} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid #2a2e39', paddingBottom: '8px' }}>
                        <div className={styles.timeRangeButtons} style={{ display: 'flex', gap: '4px' }}>
                            {(['1D', '1W', '1M', '3M', '1Y', 'ALL'] as TimeRange[]).map((range) => (
                                <button
                                    key={range}
                                    onClick={() => setTimeRange(range)}
                                    style={{
                                        background: timeRange === range ? '#2962ff' : 'transparent',
                                        color: timeRange === range ? '#fff' : '#b2b5be',
                                        border: 'none',
                                        borderRadius: '4px',
                                        padding: '4px 8px',
                                        fontSize: '12px',
                                        cursor: 'pointer',
                                        fontWeight: timeRange === range ? 600 : 400
                                    }}
                                >
                                    {range}
                                </button>
                            ))}
                        </div>
                        <div style={{ display: 'flex', gap: '12px', fontSize: '11px', alignItems: 'center' }}>
                            <span style={{ color: '#f59e0b', display: 'flex', alignItems: 'center' }}><span style={{ width: 8, height: 2, background: '#f59e0b', marginRight: 4 }}></span>SMA 20</span>
                            <span style={{ color: '#2962ff', display: 'flex', alignItems: 'center' }}><span style={{ width: 8, height: 2, background: '#2962ff', marginRight: 4 }}></span>SMA 50</span>
                            <span style={{ color: 'rgba(38, 166, 154, 0.3)', display: 'flex', alignItems: 'center' }}><span style={{ width: 8, height: 10, background: 'rgba(38, 166, 154, 0.3)', border: '1px solid #26a69a', marginRight: 4 }}></span>BB</span>
                        </div>
                    </div>

                    {/* Selected Candle Info Panel */}
                    <div style={{
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        fontSize: '11px',
                        color: '#b2b5be',
                        marginBottom: '8px',
                        padding: '0 8px',
                        backgroundColor: '#1e222d',
                        borderRadius: '4px',
                        border: '1px solid #2a2e39'
                    }}>
                        {selectedCandle ? (
                            <>
                                <span style={{ color: '#fff', fontWeight: 'bold' }}>{selectedCandle.date}</span>
                                <div style={{ width: '1px', height: '12px', backgroundColor: '#333' }}></div>
                                <span>시 <span style={{ color: '#fff' }}>{formatCurrency(selectedCandle.open, commodity.currency)}</span></span>
                                <span>고 <span style={{ color: '#10b981' }}>{formatCurrency(selectedCandle.high, commodity.currency)}</span></span>
                                <span>저 <span style={{ color: '#ef4444' }}>{formatCurrency(selectedCandle.low, commodity.currency)}</span></span>
                                <span>종 <span style={{ color: selectedCandle.close >= selectedCandle.open ? '#10b981' : '#ef4444' }}>{formatCurrency(selectedCandle.close, commodity.currency)}</span></span>
                                <div style={{ width: '1px', height: '12px', backgroundColor: '#333' }}></div>
                                <span>Vol <span style={{ color: '#fff' }}>{selectedCandle.volume.toLocaleString()}</span></span>
                            </>
                        ) : (
                            <span>차트의 캔들을 클릭하여 상세 정보를 확인하세요.</span>
                        )}
                    </div>

                    <div style={{ height: 400, width: '100%', position: 'relative' }}>
                        <ResponsiveContainer>
                            <ComposedChart
                                data={chartData}
                                margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                onClick={(e: any) => {
                                    if (e && e.activePayload && e.activePayload.length > 0) {
                                        handleCandleClick(e.activePayload[0].payload as ChartDataPoint);
                                    }
                                }}
                            >
                                <CartesianGrid stroke="#2a2e39" strokeDasharray="1 1" vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fill: '#b2b5be', fontSize: 10 }}
                                    tickLine={false}
                                    axisLine={{ stroke: '#2a2e39' }}
                                    minTickGap={30}
                                />
                                <YAxis
                                    orientation="right"
                                    domain={['auto', 'auto']}
                                    tick={{ fill: '#b2b5be', fontSize: 10 }}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(val) => val.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 0 })}
                                    width={60}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e222d', borderColor: '#2a2e39', padding: '8px', borderRadius: '4px' }}
                                    itemStyle={{ fontSize: '12px', padding: 0 }}
                                    labelStyle={{ color: '#b2b5be', fontSize: '11px', marginBottom: '4px' }}
                                    cursor={{ stroke: '#2a2e39', strokeDasharray: '3 3' }}
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    formatter={(value: any, name: any) => {
                                        if (name === 'high' || name === 'low' || name === 'open' || name === 'close') return [Number(value).toFixed(2), name.toUpperCase()];
                                        if (name === 'volume') return [Number(value).toLocaleString(), 'Vol'];
                                        return [Number(value).toFixed(2), name];
                                    }}
                                />

                                <Line type="monotone" dataKey="bbUpper" stroke="#26a69a" strokeOpacity={0.2} dot={false} strokeWidth={1} isAnimationActive={false} />
                                <Line type="monotone" dataKey="bbLower" stroke="#26a69a" strokeOpacity={0.2} dot={false} strokeWidth={1} isAnimationActive={false} />

                                <Line type="monotone" dataKey="sma50" stroke="#2962ff" dot={false} strokeWidth={1.5} isAnimationActive={false} connectNulls />
                                <Line type="monotone" dataKey="sma20" stroke="#f59e0b" dot={false} strokeWidth={1.5} isAnimationActive={false} connectNulls />

                                <Bar
                                    dataKey={(entry: ChartDataPoint) => [entry.low, entry.high]}
                                    fill="transparent"
                                    maxBarSize={8}
                                    isAnimationActive={false}
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    shape={(props: any) => {
                                        const { x, y, width, height, payload } = props;
                                        if (!payload || payload.open === undefined || payload.close === undefined) return <g />;

                                        const { open, close, high, low } = payload;
                                        const isUp = close >= open;
                                        const color = isUp ? '#26a69a' : '#ef5350';

                                        const range = high - low;
                                        if (range === 0) return <g />;

                                        const topY = y;
                                        const bottomY = y + height;

                                        const openRatio = (high - open) / range;
                                        const closeRatio = (high - close) / range;

                                        const bodyTopY = y + Math.min(openRatio, closeRatio) * height;
                                        const bodyHeight = Math.abs(openRatio - closeRatio) * height;

                                        const finalBodyHeight = Math.max(1, bodyHeight);
                                        const centerX = x + width / 2;

                                        return (
                                            <g>
                                                <line x1={centerX} y1={topY} x2={centerX} y2={bottomY} stroke={color} strokeWidth={1} />
                                                <rect
                                                    x={x}
                                                    y={bodyTopY}
                                                    width={width}
                                                    height={finalBodyHeight}
                                                    fill={color}
                                                    stroke={color}
                                                />
                                            </g>
                                        );
                                    }}
                                />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>

                    <div className={styles.volumeChart} style={{ marginTop: '16px' }}>
                        <ResponsiveContainer width="100%" height={80}>
                            <ComposedChart data={chartData} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" opacity={0.3} />
                                <XAxis
                                    dataKey="date"
                                    stroke="#666"
                                    style={{ fontSize: '10px' }}
                                    tick={{ fill: '#888' }}
                                    hide
                                />
                                <YAxis
                                    stroke="#666"
                                    style={{ fontSize: '9px' }}
                                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                                    tick={{ fill: '#888' }}
                                    orientation="right"
                                    width={40}
                                />
                                <Bar
                                    dataKey="volume"
                                    fill="#06b6d4"
                                    opacity={0.5}
                                    isAnimationActive={false}
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    shape={(props: any) => {
                                        const { x, y, width, height, payload } = props;
                                        if (!payload) return <g />;
                                        const color = payload.close >= payload.open ? '#26a69a' : '#ef5350';
                                        return (
                                            <rect
                                                x={x}
                                                y={y}
                                                width={width}
                                                height={height}
                                                fill={color}
                                                opacity={0.4}
                                            />
                                        );
                                    }}
                                />
                            </ComposedChart>
                        </ResponsiveContainer>
                        <div style={{ fontSize: '10px', color: '#888', marginTop: '4px', textAlign: 'center' }}>
                            거래량 (Volume)
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
