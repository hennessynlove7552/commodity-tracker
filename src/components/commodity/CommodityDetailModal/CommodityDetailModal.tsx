import React, { useState, useMemo, useRef, useCallback } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Bar, ComposedChart, Line, ReferenceLine } from 'recharts';
import { Commodity } from '@/types';
import { formatCurrency, formatPercent } from '@/utils/formatters';
import styles from './CommodityDetailModal.module.css';

interface CommodityDetailModalProps {
    commodity: Commodity;
    onClose: () => void;
}

type TimeRange = '1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL';
type DrawingTool = 'none' | 'horizontal' | 'trendline' | 'fibonacci';

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
    ema12?: number | null;
    ema26?: number | null;
    bbUpper?: number | null;
    bbMiddle?: number | null;
    bbLower?: number | null;
    rsi?: number | null;
    macd?: number | null;
    macdSignal?: number | null;
    macdHistogram?: number | null;
    atr?: number | null;
}

interface DrawingObject {
    id: string;
    type: DrawingTool;
    price?: number; // For horizontal line
    startIndex?: number; // For trendline and fibonacci
    endIndex?: number;
    startPrice?: number;
    endPrice?: number;
    color: string;
}

export const CommodityDetailModal: React.FC<CommodityDetailModalProps> = ({ commodity, onClose }) => {
    const [timeRange, setTimeRange] = useState<TimeRange>('1M');
    const [activeIndicators, setActiveIndicators] = useState({
        sma20: true,
        sma50: true,
        ema12: false,
        ema26: false,
        bb: true,
        rsi: true,
        macd: true,
        atr: false,
    });

    const [activeTool, setActiveTool] = useState<DrawingTool>('none');
    const [drawings, setDrawings] = useState<DrawingObject[]>([]);
    const [drawingStart, setDrawingStart] = useState<{ index: number; price: number } | null>(null);
    const chartRef = useRef<HTMLDivElement>(null);

    // Advanced Market Data Simulation Engine (Institutional Grade)
    const chartData = useMemo(() => {
        const dataPoints: { [key in TimeRange]: number } = {
            '1D': 24,
            '1W': 14,
            '1M': 30,
            '3M': 90,
            '1Y': 250,
            'ALL': 500,
        };

        const points = dataPoints[timeRange];
        const data: ChartDataPoint[] = [];

        const basePrice = commodity.currentPrice;
        const seed = commodity.id.charCodeAt(0) + commodity.id.charCodeAt(commodity.id.length - 1);

        const volProfile: { [key: string]: number } = {
            'ENERGY': 0.02,
            'METALS': 0.012,
            'AGRICULTURE': 0.015,
            'DEFAULT': 0.01
        };
        const baseVol = volProfile[commodity.category] || volProfile['DEFAULT'];

        let seedState = seed;
        const random = () => {
            const x = Math.sin(seedState++) * 10000;
            return x - Math.floor(x);
        };

        const randomNormal = () => {
            let u = 0, v = 0;
            while (u === 0) u = random();
            while (v === 0) v = random();
            return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
        };

        const pathChanges: number[] = [];
        let currentVol = baseVol;
        let trend = (random() - 0.5) * 0.005;

        for (let i = 0; i < points; i++) {
            if (random() < 0.05) currentVol = baseVol * (1 + random());
            if (random() < 0.05) currentVol = baseVol;
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

        // Technical Indicators Calculation

        // SMA
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

        // EMA
        const calculateEMA = (period: number): (number | null)[] => {
            const ema: (number | null)[] = [];
            const multiplier = 2 / (period + 1);

            for (let i = 0; i < data.length; i++) {
                if (i < period - 1) {
                    ema.push(null);
                } else if (i === period - 1) {
                    let sum = 0;
                    for (let j = 0; j < period; j++) {
                        sum += data[i - j].close;
                    }
                    ema.push(Number((sum / period).toFixed(2)));
                } else {
                    const prevEma: number = ema[i - 1] as number;
                    const newEma: number = (data[i].close - prevEma) * multiplier + prevEma;
                    ema.push(Number(newEma.toFixed(2)));
                }
            }
            return ema;
        };

        // RSI
        const calculateRSI = (period: number = 14): (number | null)[] => {
            const rsi: (number | null)[] = [];
            const gains: number[] = [];
            const losses: number[] = [];

            for (let i = 0; i < data.length; i++) {
                if (i === 0) {
                    gains.push(0);
                    losses.push(0);
                    rsi.push(null);
                    continue;
                }

                const change = data[i].close - data[i - 1].close;
                gains.push(change > 0 ? change : 0);
                losses.push(change < 0 ? Math.abs(change) : 0);

                if (i < period) {
                    rsi.push(null);
                } else if (i === period) {
                    const avgGain = gains.slice(1, period + 1).reduce((a, b) => a + b, 0) / period;
                    const avgLoss = losses.slice(1, period + 1).reduce((a, b) => a + b, 0) / period;
                    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
                    rsi.push(Number((100 - (100 / (1 + rs))).toFixed(2)));
                } else {
                    const prevRSI: number | null = rsi[i - 1];
                    if (prevRSI === null) {
                        rsi.push(null);
                        continue;
                    }

                    const prevAvgGain: number = ((100 - prevRSI) !== 0) ? (prevRSI * (period - 1) / (100 - prevRSI)) / (period - 1) : 0;
                    const prevAvgLoss: number = prevAvgGain !== 0 ? prevAvgGain * (100 / prevRSI - 1) : 0;

                    const avgGain: number = (prevAvgGain * (period - 1) + gains[i]) / period;
                    const avgLoss: number = (prevAvgLoss * (period - 1) + losses[i]) / period;

                    const rs: number = avgLoss === 0 ? 100 : avgGain / avgLoss;
                    rsi.push(Number((100 - (100 / (1 + rs))).toFixed(2)));
                }
            }
            return rsi;
        };

        // MACD
        const calculateMACD = () => {
            const ema12 = calculateEMA(12);
            const ema26 = calculateEMA(26);
            const macdLine = [];

            for (let i = 0; i < data.length; i++) {
                if (ema12[i] === null || ema26[i] === null) {
                    macdLine.push(null);
                } else {
                    macdLine.push(Number((ema12[i]! - ema26[i]!).toFixed(2)));
                }
            }

            const signalLine: (number | null)[] = [];
            const signalPeriod = 9;
            const multiplier = 2 / (signalPeriod + 1);

            for (let i = 0; i < macdLine.length; i++) {
                if (macdLine[i] === null) {
                    signalLine.push(null);
                } else if (i < 25 + signalPeriod - 1) {
                    signalLine.push(null);
                } else if (i === 25 + signalPeriod - 1) {
                    let sum = 0;
                    let count = 0;
                    for (let j = 0; j < signalPeriod; j++) {
                        if (macdLine[i - j] !== null) {
                            sum += macdLine[i - j]!;
                            count++;
                        }
                    }
                    signalLine.push(count > 0 ? Number((sum / count).toFixed(2)) : null);
                } else {
                    const prevSignal: number | null = signalLine[i - 1];
                    if (prevSignal === null) {
                        signalLine.push(null);
                    } else {
                        const newSignal: number = (macdLine[i]! - prevSignal) * multiplier + prevSignal;
                        signalLine.push(Number(newSignal.toFixed(2)));
                    }
                }
            }

            const histogram = macdLine.map((macd, i) => {
                if (macd === null || signalLine[i] === null) return null;
                return Number((macd - signalLine[i]!).toFixed(2));
            });

            return { macdLine, signalLine, histogram };
        };

        // ATR
        const calculateATR = (period: number = 14) => {
            const trueRanges = [];

            for (let i = 0; i < data.length; i++) {
                if (i === 0) {
                    trueRanges.push(data[i].high - data[i].low);
                } else {
                    const tr = Math.max(
                        data[i].high - data[i].low,
                        Math.abs(data[i].high - data[i - 1].close),
                        Math.abs(data[i].low - data[i - 1].close)
                    );
                    trueRanges.push(tr);
                }
            }

            const atr = [];
            for (let i = 0; i < data.length; i++) {
                if (i < period - 1) {
                    atr.push(null);
                } else if (i === period - 1) {
                    const sum = trueRanges.slice(0, period).reduce((a, b) => a + b, 0);
                    atr.push(Number((sum / period).toFixed(2)));
                } else {
                    const prevATR: number = atr[i - 1] as number;
                    const newATR: number = (prevATR * (period - 1) + trueRanges[i]) / period;
                    atr.push(Number(newATR.toFixed(2)));
                }
            }
            return atr;
        };

        const sma20 = calculateSMA(20);
        const sma50 = calculateSMA(50);
        const ema12 = calculateEMA(12);
        const ema26 = calculateEMA(26);
        const rsi = calculateRSI(14);
        const { macdLine, signalLine, histogram } = calculateMACD();
        const atr = calculateATR(14);

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
            d.ema12 = ema12[i];
            d.ema26 = ema26[i];
            d.bbUpper = bb[i].upper;
            d.bbMiddle = bb[i].middle;
            d.bbLower = bb[i].lower;
            d.rsi = rsi[i];
            d.macd = macdLine[i];
            d.macdSignal = signalLine[i];
            d.macdHistogram = histogram[i];
            d.atr = atr[i];
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

    const toggleIndicator = (indicator: keyof typeof activeIndicators) => {
        setActiveIndicators(prev => ({
            ...prev,
            [indicator]: !prev[indicator]
        }));
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleChartClick = useCallback((e: any) => {
        if (activeTool === 'none' || !e || !e.activePayload || e.activePayload.length === 0) {
            if (e && e.activePayload && e.activePayload.length > 0) {
                handleCandleClick(e.activePayload[0].payload as ChartDataPoint);
            }
            return;
        }

        const clickedData = e.activePayload[0].payload as ChartDataPoint;
        const clickedIndex = chartData.findIndex(d => d.date === clickedData.date);
        const clickedPrice = clickedData.close;

        if (activeTool === 'horizontal') {
            // Add horizontal line
            const newDrawing: DrawingObject = {
                id: `h-${Date.now()}`,
                type: 'horizontal',
                price: clickedPrice,
                color: '#2196f3'
            };
            setDrawings(prev => [...prev, newDrawing]);
            setActiveTool('none');
        } else if (activeTool === 'trendline' || activeTool === 'fibonacci') {
            if (!drawingStart) {
                // First click - set start point
                setDrawingStart({ index: clickedIndex, price: clickedPrice });
            } else {
                // Second click - complete drawing
                const newDrawing: DrawingObject = {
                    id: `${activeTool}-${Date.now()}`,
                    type: activeTool,
                    startIndex: drawingStart.index,
                    endIndex: clickedIndex,
                    startPrice: drawingStart.price,
                    endPrice: clickedPrice,
                    color: activeTool === 'trendline' ? '#ff9800' : '#9c27b0'
                };
                setDrawings(prev => [...prev, newDrawing]);
                setDrawingStart(null);
                setActiveTool('none');
            }
        }
    }, [activeTool, drawingStart, chartData]);

    const clearDrawings = () => {
        setDrawings([]);
        setDrawingStart(null);
        setActiveTool('none');
    };

    const removeDrawing = (id: string) => {
        setDrawings(prev => prev.filter(d => d.id !== id));
    };

    // Render drawing objects as ReferenceLine components
    const renderDrawings = () => {
        return drawings.map(drawing => {
            if (drawing.type === 'horizontal') {
                return (
                    <ReferenceLine
                        key={drawing.id}
                        y={drawing.price}
                        stroke={drawing.color}
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        label={{
                            value: `${drawing.price?.toFixed(2)}`,
                            position: 'right',
                            fill: drawing.color,
                            fontSize: 10
                        }}
                    />
                );
            }
            // Trendline and Fibonacci will be rendered as custom SVG overlays
            return null;
        });
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
                    {/* Drawing Tools */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px solid #2a2e39' }}>
                        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                            <span style={{ fontSize: '10px', color: '#888', marginRight: '8px' }}>드로잉 도구:</span>
                            <button
                                onClick={() => setActiveTool(activeTool === 'horizontal' ? 'none' : 'horizontal')}
                                style={{
                                    background: activeTool === 'horizontal' ? '#2196f3' : 'transparent',
                                    color: activeTool === 'horizontal' ? '#fff' : '#2196f3',
                                    border: `1px solid #2196f3`,
                                    borderRadius: '3px',
                                    padding: '4px 8px',
                                    fontSize: '10px',
                                    cursor: 'pointer',
                                    fontWeight: activeTool === 'horizontal' ? 600 : 400
                                }}
                                title="수평선 그리기"
                            >
                                ─ 수평선
                            </button>
                            <button
                                onClick={() => {
                                    setActiveTool(activeTool === 'trendline' ? 'none' : 'trendline');
                                    setDrawingStart(null);
                                }}
                                style={{
                                    background: activeTool === 'trendline' ? '#ff9800' : 'transparent',
                                    color: activeTool === 'trendline' ? '#fff' : '#ff9800',
                                    border: `1px solid #ff9800`,
                                    borderRadius: '3px',
                                    padding: '4px 8px',
                                    fontSize: '10px',
                                    cursor: 'pointer',
                                    fontWeight: activeTool === 'trendline' ? 600 : 400
                                }}
                                title="추세선 그리기"
                            >
                                ╱ 추세선
                            </button>
                            <button
                                onClick={() => {
                                    setActiveTool(activeTool === 'fibonacci' ? 'none' : 'fibonacci');
                                    setDrawingStart(null);
                                }}
                                style={{
                                    background: activeTool === 'fibonacci' ? '#9c27b0' : 'transparent',
                                    color: activeTool === 'fibonacci' ? '#fff' : '#9c27b0',
                                    border: `1px solid #9c27b0`,
                                    borderRadius: '3px',
                                    padding: '4px 8px',
                                    fontSize: '10px',
                                    cursor: 'pointer',
                                    fontWeight: activeTool === 'fibonacci' ? 600 : 400
                                }}
                                title="피보나치 되돌림"
                            >
                                φ 피보나치
                            </button>
                            {drawings.length > 0 && (
                                <button
                                    onClick={clearDrawings}
                                    style={{
                                        background: 'transparent',
                                        color: '#ef4444',
                                        border: `1px solid #ef4444`,
                                        borderRadius: '3px',
                                        padding: '4px 8px',
                                        fontSize: '10px',
                                        cursor: 'pointer',
                                        marginLeft: '8px'
                                    }}
                                    title="모든 드로잉 삭제"
                                >
                                    × 전체 삭제
                                </button>
                            )}
                        </div>
                        {activeTool !== 'none' && (
                            <div style={{ fontSize: '10px', color: '#f59e0b', fontStyle: 'italic' }}>
                                {activeTool === 'horizontal' && '차트를 클릭하여 수평선을 그립니다'}
                                {activeTool === 'trendline' && (drawingStart ? '끝점을 클릭하세요' : '시작점을 클릭하세요')}
                                {activeTool === 'fibonacci' && (drawingStart ? '끝점을 클릭하세요' : '시작점을 클릭하세요')}
                            </div>
                        )}
                    </div>

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
                        <div style={{ display: 'flex', gap: '8px', fontSize: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <button onClick={() => toggleIndicator('sma20')} style={{
                                background: activeIndicators.sma20 ? '#f59e0b20' : 'transparent',
                                color: activeIndicators.sma20 ? '#f59e0b' : '#666',
                                border: `1px solid ${activeIndicators.sma20 ? '#f59e0b' : '#444'}`,
                                borderRadius: '3px',
                                padding: '2px 6px',
                                cursor: 'pointer'
                            }}>SMA20</button>
                            <button onClick={() => toggleIndicator('sma50')} style={{
                                background: activeIndicators.sma50 ? '#2962ff20' : 'transparent',
                                color: activeIndicators.sma50 ? '#2962ff' : '#666',
                                border: `1px solid ${activeIndicators.sma50 ? '#2962ff' : '#444'}`,
                                borderRadius: '3px',
                                padding: '2px 6px',
                                cursor: 'pointer'
                            }}>SMA50</button>
                            <button onClick={() => toggleIndicator('ema12')} style={{
                                background: activeIndicators.ema12 ? '#10b98120' : 'transparent',
                                color: activeIndicators.ema12 ? '#10b981' : '#666',
                                border: `1px solid ${activeIndicators.ema12 ? '#10b981' : '#444'}`,
                                borderRadius: '3px',
                                padding: '2px 6px',
                                cursor: 'pointer'
                            }}>EMA12</button>
                            <button onClick={() => toggleIndicator('ema26')} style={{
                                background: activeIndicators.ema26 ? '#ec489920' : 'transparent',
                                color: activeIndicators.ema26 ? '#ec4899' : '#666',
                                border: `1px solid ${activeIndicators.ema26 ? '#ec4899' : '#444'}`,
                                borderRadius: '3px',
                                padding: '2px 6px',
                                cursor: 'pointer'
                            }}>EMA26</button>
                            <button onClick={() => toggleIndicator('bb')} style={{
                                background: activeIndicators.bb ? '#26a69a20' : 'transparent',
                                color: activeIndicators.bb ? '#26a69a' : '#666',
                                border: `1px solid ${activeIndicators.bb ? '#26a69a' : '#444'}`,
                                borderRadius: '3px',
                                padding: '2px 6px',
                                cursor: 'pointer'
                            }}>BB</button>
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
                                {selectedCandle.rsi && <span>RSI <span style={{ color: selectedCandle.rsi > 70 ? '#ef4444' : selectedCandle.rsi < 30 ? '#10b981' : '#fff' }}>{selectedCandle.rsi.toFixed(1)}</span></span>}
                            </>
                        ) : (
                            <span>차트의 캔들을 클릭하여 상세 정보를 확인하세요.</span>
                        )}
                    </div>

                    {/* Main Price Chart */}
                    <div ref={chartRef} style={{ height: 350, width: '100%', position: 'relative' }}>
                        <ResponsiveContainer>
                            <ComposedChart
                                data={chartData}
                                margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
                                onClick={handleChartClick}
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

                                {/* Render drawings */}
                                {renderDrawings()}

                                {activeIndicators.bb && (
                                    <>
                                        <Line type="monotone" dataKey="bbUpper" stroke="#26a69a" strokeOpacity={0.2} dot={false} strokeWidth={1} isAnimationActive={false} />
                                        <Line type="monotone" dataKey="bbLower" stroke="#26a69a" strokeOpacity={0.2} dot={false} strokeWidth={1} isAnimationActive={false} />
                                    </>
                                )}

                                {activeIndicators.sma50 && <Line type="monotone" dataKey="sma50" stroke="#2962ff" dot={false} strokeWidth={1.5} isAnimationActive={false} connectNulls />}
                                {activeIndicators.sma20 && <Line type="monotone" dataKey="sma20" stroke="#f59e0b" dot={false} strokeWidth={1.5} isAnimationActive={false} connectNulls />}
                                {activeIndicators.ema12 && <Line type="monotone" dataKey="ema12" stroke="#10b981" dot={false} strokeWidth={1.5} isAnimationActive={false} connectNulls strokeDasharray="3 3" />}
                                {activeIndicators.ema26 && <Line type="monotone" dataKey="ema26" stroke="#ec4899" dot={false} strokeWidth={1.5} isAnimationActive={false} connectNulls strokeDasharray="3 3" />}

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

                    {/* Drawings List */}
                    {drawings.length > 0 && (
                        <div style={{ marginTop: '8px', padding: '8px', backgroundColor: '#1e222d', borderRadius: '4px', border: '1px solid #2a2e39' }}>
                            <div style={{ fontSize: '10px', color: '#888', marginBottom: '4px' }}>드로잉 목록:</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                {drawings.map(drawing => (
                                    <div key={drawing.id} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        padding: '2px 6px',
                                        backgroundColor: '#131722',
                                        borderRadius: '3px',
                                        fontSize: '10px',
                                        border: `1px solid ${drawing.color}`
                                    }}>
                                        <span style={{ color: drawing.color }}>
                                            {drawing.type === 'horizontal' && '─'}
                                            {drawing.type === 'trendline' && '╱'}
                                            {drawing.type === 'fibonacci' && 'φ'}
                                        </span>
                                        <span style={{ color: '#b2b5be' }}>
                                            {drawing.type === 'horizontal' && `${drawing.price?.toFixed(2)}`}
                                            {drawing.type === 'trendline' && '추세선'}
                                            {drawing.type === 'fibonacci' && '피보나치'}
                                        </span>
                                        <button
                                            onClick={() => removeDrawing(drawing.id)}
                                            style={{
                                                background: 'transparent',
                                                border: 'none',
                                                color: '#ef4444',
                                                cursor: 'pointer',
                                                padding: '0 2px',
                                                fontSize: '12px'
                                            }}
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Volume Chart */}
                    <div style={{ marginTop: '16px' }}>
                        <div style={{ fontSize: '10px', color: '#888', marginBottom: '4px', paddingLeft: '8px' }}>거래량 (Volume)</div>
                        <ResponsiveContainer width="100%" height={80}>
                            <ComposedChart data={chartData} margin={{ top: 0, right: 5, left: 5, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" opacity={0.3} vertical={false} />
                                <XAxis dataKey="date" hide />
                                <YAxis
                                    orientation="right"
                                    tick={{ fill: '#666', fontSize: 9 }}
                                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                                    width={40}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Bar
                                    dataKey="volume"
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
                    </div>

                    {/* RSI Panel */}
                    {activeIndicators.rsi && (
                        <div style={{ marginTop: '16px' }}>
                            <div style={{ fontSize: '10px', color: '#888', marginBottom: '4px', paddingLeft: '8px' }}>RSI (14)</div>
                            <ResponsiveContainer width="100%" height={100}>
                                <ComposedChart data={chartData} margin={{ top: 0, right: 5, left: 5, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" opacity={0.3} vertical={false} />
                                    <XAxis dataKey="date" hide />
                                    <YAxis
                                        orientation="right"
                                        domain={[0, 100]}
                                        ticks={[30, 50, 70]}
                                        tick={{ fill: '#666', fontSize: 9 }}
                                        width={40}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="3 3" opacity={0.5} />
                                    <ReferenceLine y={50} stroke="#666" strokeDasharray="3 3" opacity={0.3} />
                                    <ReferenceLine y={30} stroke="#10b981" strokeDasharray="3 3" opacity={0.5} />
                                    <Line
                                        type="monotone"
                                        dataKey="rsi"
                                        stroke="#9333ea"
                                        dot={false}
                                        strokeWidth={1.5}
                                        isAnimationActive={false}
                                        connectNulls
                                    />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    {/* MACD Panel */}
                    {activeIndicators.macd && (
                        <div style={{ marginTop: '16px' }}>
                            <div style={{ fontSize: '10px', color: '#888', marginBottom: '4px', paddingLeft: '8px' }}>MACD (12, 26, 9)</div>
                            <ResponsiveContainer width="100%" height={100}>
                                <ComposedChart data={chartData} margin={{ top: 0, right: 5, left: 5, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" opacity={0.3} vertical={false} />
                                    <XAxis dataKey="date" hide />
                                    <YAxis
                                        orientation="right"
                                        tick={{ fill: '#666', fontSize: 9 }}
                                        width={40}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" opacity={0.5} />
                                    <Bar
                                        dataKey="macdHistogram"
                                        isAnimationActive={false}
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        shape={(props: any) => {
                                            const { x, y, width, height, payload } = props;
                                            if (!payload || payload.macdHistogram === null) return <g />;
                                            const color = payload.macdHistogram >= 0 ? '#26a69a' : '#ef5350';
                                            return (
                                                <rect
                                                    x={x}
                                                    y={y}
                                                    width={width}
                                                    height={height}
                                                    fill={color}
                                                    opacity={0.6}
                                                />
                                            );
                                        }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="macd"
                                        stroke="#2196f3"
                                        dot={false}
                                        strokeWidth={1.5}
                                        isAnimationActive={false}
                                        connectNulls
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="macdSignal"
                                        stroke="#ff9800"
                                        dot={false}
                                        strokeWidth={1.5}
                                        isAnimationActive={false}
                                        connectNulls
                                    />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
