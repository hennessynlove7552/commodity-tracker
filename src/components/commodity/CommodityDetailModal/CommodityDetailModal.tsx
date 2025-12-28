import React, { useState, useMemo, useCallback } from 'react';
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

    const latestData = chartData[chartData.length - 1];

    return (
        <div className={styles.overlay} onClick={handleOverlayClick}>
            <div className={styles.modal}>
                {/* Header */}
                <div className={styles.header}>
                    <div className={styles.headerLeft}>
                        <div className={styles.headerTitle}>
                            <h2 className={styles.commodityName}>{commodity.name}</h2>
                            <div className={styles.commodityMeta}>
                                <span>{commodity.category}</span>
                                <span>•</span>
                                <span>1 Month • OANDA</span>
                            </div>
                        </div>
                        <div className={styles.priceInfo}>
                            <div className={styles.currentPrice}>
                                {formatCurrency(commodity.currentPrice, commodity.currency)}
                            </div>
                            <div className={`${styles.priceChange} ${commodity.change >= 0 ? styles.positive : styles.negative}`}>
                                {commodity.change >= 0 ? '+' : ''}{commodity.change} ({commodity.change >= 0 ? '+' : ''}{formatPercent(commodity.changePercent)})
                            </div>
                            <div className={styles.dayRange}>
                                <span>L: {formatCurrency(stats.low, commodity.currency)}</span>
                                <span>H: {formatCurrency(stats.high, commodity.currency)}</span>
                            </div>
                        </div>
                    </div>
                    <div className={styles.headerRight}>
                        <button className={styles.closeButton} onClick={onClose}>×</button>
                    </div>
                </div>

                {/* Main Content - 3 Column Layout */}
                <div className={styles.content}>
                    {/* Left Sidebar - Indicators */}
                    <div className={styles.leftSidebar}>
                        <div className={styles.indicatorsList}>
                            {activeIndicators.sma20 && latestData.sma20 && (
                                <div className={styles.indicatorItem}>
                                    <div className={styles.indicatorLabel}>
                                        <div className={styles.indicatorColor} style={{ background: '#f59e0b' }}></div>
                                        <span className={styles.indicatorName}>SMA 20</span>
                                    </div>
                                    <span className={styles.indicatorValue}>{latestData.sma20.toFixed(2)}</span>
                                </div>
                            )}
                            {activeIndicators.sma50 && latestData.sma50 && (
                                <div className={styles.indicatorItem}>
                                    <div className={styles.indicatorLabel}>
                                        <div className={styles.indicatorColor} style={{ background: '#2962ff' }}></div>
                                        <span className={styles.indicatorName}>SMA 50</span>
                                    </div>
                                    <span className={styles.indicatorValue}>{latestData.sma50.toFixed(2)}</span>
                                </div>
                            )}
                            {activeIndicators.ema12 && latestData.ema12 && (
                                <div className={styles.indicatorItem}>
                                    <div className={styles.indicatorLabel}>
                                        <div className={styles.indicatorColor} style={{ background: '#10b981' }}></div>
                                        <span className={styles.indicatorName}>EMA 12</span>
                                    </div>
                                    <span className={styles.indicatorValue}>{latestData.ema12.toFixed(2)}</span>
                                </div>
                            )}
                            {activeIndicators.bb && latestData.bbUpper && (
                                <>
                                    <div className={styles.indicatorItem}>
                                        <div className={styles.indicatorLabel}>
                                            <div className={styles.indicatorColor} style={{ background: '#26a69a' }}></div>
                                            <span className={styles.indicatorName}>BB Upper</span>
                                        </div>
                                        <span className={styles.indicatorValue}>{latestData.bbUpper.toFixed(2)}</span>
                                    </div>
                                    <div className={styles.indicatorItem}>
                                        <div className={styles.indicatorLabel}>
                                            <div className={styles.indicatorColor} style={{ background: '#26a69a' }}></div>
                                            <span className={styles.indicatorName}>BB Lower</span>
                                        </div>
                                        <span className={styles.indicatorValue}>{latestData.bbLower?.toFixed(2)}</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Center - Chart Area */}
                    <div className={styles.chartArea}>
                        {/* Chart Controls */}
                        <div className={styles.chartControls}>
                            <div className={styles.timeRangeButtons}>
                                {(['1D', '1W', '1M', '3M', '1Y', 'ALL'] as TimeRange[]).map((range) => (
                                    <button
                                        key={range}
                                        onClick={() => setTimeRange(range)}
                                        className={`${styles.timeRangeButton} ${timeRange === range ? styles.active : ''}`}
                                    >
                                        {range}
                                    </button>
                                ))}
                            </div>
                            <div className={styles.drawingTools}>
                                <button
                                    onClick={() => setActiveTool(activeTool === 'horizontal' ? 'none' : 'horizontal')}
                                    className={`${styles.toolButton} ${activeTool === 'horizontal' ? styles.active : ''}`}
                                >
                                    ─ 수평선
                                </button>
                                <button
                                    onClick={() => {
                                        setActiveTool(activeTool === 'trendline' ? 'none' : 'trendline');
                                        setDrawingStart(null);
                                    }}
                                    className={`${styles.toolButton} ${activeTool === 'trendline' ? styles.active : ''}`}
                                >
                                    ╱ 추세선
                                </button>
                                {drawings.length > 0 && (
                                    <button onClick={clearDrawings} className={styles.toolButton} style={{ color: '#ef4444', borderColor: '#ef4444' }}>
                                        × 삭제
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Main Chart */}
                        <div className={styles.chartWrapper}>
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart
                                    data={chartData}
                                    margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
                                    onClick={handleChartClick}
                                >
                                    <CartesianGrid stroke="#1a1f3a" strokeDasharray="3 3" vertical={false} />
                                    <XAxis
                                        dataKey="date"
                                        tick={{ fill: '#6b7280', fontSize: 10 }}
                                        tickLine={false}
                                        axisLine={{ stroke: '#1a1f3a' }}
                                        minTickGap={40}
                                    />
                                    <YAxis
                                        orientation="right"
                                        domain={['auto', 'auto']}
                                        tick={{ fill: '#6b7280', fontSize: 10 }}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(val) => val.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 0 })}
                                        width={70}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#0d1129', borderColor: '#1a1f3a', padding: '8px', borderRadius: '4px' }}
                                        itemStyle={{ fontSize: '11px', padding: 0, color: '#e0e3eb' }}
                                        labelStyle={{ color: '#9ca3af', fontSize: '10px', marginBottom: '4px' }}
                                        cursor={{ stroke: '#1a1f3a', strokeDasharray: '3 3' }}
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        formatter={(value: any, name: any) => {
                                            if (name === 'high' || name === 'low' || name === 'open' || name === 'close') return [Number(value).toFixed(2), name.toUpperCase()];
                                            return [Number(value).toFixed(2), name];
                                        }}
                                    />

                                    {/* Drawings */}
                                    {renderDrawings()}

                                    {/* Bollinger Bands */}
                                    {activeIndicators.bb && (
                                        <>
                                            <Line type="monotone" dataKey="bbUpper" stroke="#26a69a" strokeOpacity={0.3} dot={false} strokeWidth={1} isAnimationActive={false} />
                                            <Line type="monotone" dataKey="bbLower" stroke="#26a69a" strokeOpacity={0.3} dot={false} strokeWidth={1} isAnimationActive={false} />
                                        </>
                                    )}

                                    {/* Moving Averages */}
                                    {activeIndicators.sma50 && <Line type="monotone" dataKey="sma50" stroke="#2962ff" dot={false} strokeWidth={2} isAnimationActive={false} connectNulls />}
                                    {activeIndicators.sma20 && <Line type="monotone" dataKey="sma20" stroke="#f59e0b" dot={false} strokeWidth={2} isAnimationActive={false} connectNulls />}
                                    {activeIndicators.ema12 && <Line type="monotone" dataKey="ema12" stroke="#10b981" dot={false} strokeWidth={2} isAnimationActive={false} connectNulls strokeDasharray="4 4" />}
                                    {activeIndicators.ema26 && <Line type="monotone" dataKey="ema26" stroke="#ec4899" dot={false} strokeWidth={2} isAnimationActive={false} connectNulls strokeDasharray="4 4" />}

                                    {/* Candlesticks */}
                                    <Bar
                                        dataKey={(entry: ChartDataPoint) => [entry.low, entry.high]}
                                        fill="transparent"
                                        maxBarSize={12}
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

                                            const openRatio = (high - open) / range;
                                            const closeRatio = (high - close) / range;

                                            const bodyTopY = y + Math.min(openRatio, closeRatio) * height;
                                            const bodyHeight = Math.abs(openRatio - closeRatio) * height;
                                            const finalBodyHeight = Math.max(1, bodyHeight);
                                            const centerX = x + width / 2;

                                            return (
                                                <g>
                                                    <line x1={centerX} y1={y} x2={centerX} y2={y + height} stroke={color} strokeWidth={1.5} />
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

                        {/* Candle Info Bar */}
                        <div className={styles.candleInfo}>
                            {selectedCandle ? (
                                <>
                                    <div className={styles.candleInfoItem}>
                                        <span className={styles.candleInfoLabel}>Date:</span>
                                        <span className={styles.candleInfoValue}>{selectedCandle.date}</span>
                                    </div>
                                    <div className={styles.candleInfoItem}>
                                        <span className={styles.candleInfoLabel}>O:</span>
                                        <span className={styles.candleInfoValue}>{formatCurrency(selectedCandle.open, commodity.currency)}</span>
                                    </div>
                                    <div className={styles.candleInfoItem}>
                                        <span className={styles.candleInfoLabel}>H:</span>
                                        <span className={styles.candleInfoValue} style={{ color: '#10b981' }}>{formatCurrency(selectedCandle.high, commodity.currency)}</span>
                                    </div>
                                    <div className={styles.candleInfoItem}>
                                        <span className={styles.candleInfoLabel}>L:</span>
                                        <span className={styles.candleInfoValue} style={{ color: '#ef4444' }}>{formatCurrency(selectedCandle.low, commodity.currency)}</span>
                                    </div>
                                    <div className={styles.candleInfoItem}>
                                        <span className={styles.candleInfoLabel}>C:</span>
                                        <span className={styles.candleInfoValue}>{formatCurrency(selectedCandle.close, commodity.currency)}</span>
                                    </div>
                                    <div className={styles.candleInfoItem}>
                                        <span className={styles.candleInfoLabel}>Vol:</span>
                                        <span className={styles.candleInfoValue}>{selectedCandle.volume.toLocaleString()}</span>
                                    </div>
                                    {selectedCandle.rsi && (
                                        <div className={styles.candleInfoItem}>
                                            <span className={styles.candleInfoLabel}>RSI:</span>
                                            <span className={styles.candleInfoValue} style={{ color: selectedCandle.rsi > 70 ? '#ef4444' : selectedCandle.rsi < 30 ? '#10b981' : '#e0e3eb' }}>
                                                {selectedCandle.rsi.toFixed(1)}
                                            </span>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <span>Click a candle to view details</span>
                            )}
                        </div>
                    </div>

                    {/* Right Sidebar - Stats & Info */}
                    <div className={styles.rightSidebar}>
                        <div className={styles.sidebarSection}>
                            <div className={styles.sidebarTitle}>Statistics</div>
                            <div className={styles.statsGrid}>
                                <div className={styles.statItem}>
                                    <span className={styles.statLabel}>High</span>
                                    <span className={styles.statValue} style={{ color: '#10b981' }}>{formatCurrency(stats.high, commodity.currency)}</span>
                                </div>
                                <div className={styles.statItem}>
                                    <span className={styles.statLabel}>Low</span>
                                    <span className={styles.statValue} style={{ color: '#ef4444' }}>{formatCurrency(stats.low, commodity.currency)}</span>
                                </div>
                                <div className={styles.statItem}>
                                    <span className={styles.statLabel}>Average</span>
                                    <span className={styles.statValue}>{formatCurrency(stats.avg, commodity.currency)}</span>
                                </div>
                            </div>
                        </div>

                        <div className={styles.sidebarSection}>
                            <div className={styles.sidebarTitle}>Indicators</div>
                            <div className={styles.statsGrid}>
                                <div className={styles.statItem} onClick={() => toggleIndicator('sma20')} style={{ cursor: 'pointer', opacity: activeIndicators.sma20 ? 1 : 0.5 }}>
                                    <span className={styles.statLabel}>SMA 20</span>
                                    <span className={styles.statValue} style={{ color: '#f59e0b' }}>
                                        {latestData.sma20 ? latestData.sma20.toFixed(2) : '-'}
                                    </span>
                                </div>
                                <div className={styles.statItem} onClick={() => toggleIndicator('sma50')} style={{ cursor: 'pointer', opacity: activeIndicators.sma50 ? 1 : 0.5 }}>
                                    <span className={styles.statLabel}>SMA 50</span>
                                    <span className={styles.statValue} style={{ color: '#2962ff' }}>
                                        {latestData.sma50 ? latestData.sma50.toFixed(2) : '-'}
                                    </span>
                                </div>
                                <div className={styles.statItem} onClick={() => toggleIndicator('rsi')} style={{ cursor: 'pointer', opacity: activeIndicators.rsi ? 1 : 0.5 }}>
                                    <span className={styles.statLabel}>RSI (14)</span>
                                    <span className={styles.statValue} style={{ color: latestData.rsi && latestData.rsi > 70 ? '#ef4444' : latestData.rsi && latestData.rsi < 30 ? '#10b981' : '#e0e3eb' }}>
                                        {latestData.rsi ? latestData.rsi.toFixed(1) : '-'}
                                    </span>
                                </div>
                                <div className={styles.statItem} onClick={() => toggleIndicator('macd')} style={{ cursor: 'pointer', opacity: activeIndicators.macd ? 1 : 0.5 }}>
                                    <span className={styles.statLabel}>MACD</span>
                                    <span className={styles.statValue}>
                                        {latestData.macd ? latestData.macd.toFixed(2) : '-'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {drawings.length > 0 && (
                            <div className={styles.sidebarSection}>
                                <div className={styles.sidebarTitle}>Drawings</div>
                                <div className={styles.statsGrid}>
                                    {drawings.map(drawing => (
                                        <div key={drawing.id} className={styles.statItem} style={{ cursor: 'pointer' }} onClick={() => removeDrawing(drawing.id)}>
                                            <span className={styles.statLabel} style={{ color: drawing.color }}>
                                                {drawing.type === 'horizontal' && '─ Horizontal'}
                                                {drawing.type === 'trendline' && '╱ Trendline'}
                                                {drawing.type === 'fibonacci' && 'φ Fibonacci'}
                                            </span>
                                            <span className={styles.statValue} style={{ color: '#ef4444', fontSize: '14px' }}>×</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
