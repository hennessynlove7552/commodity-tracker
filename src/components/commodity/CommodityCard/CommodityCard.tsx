import React from 'react';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import type { Commodity } from '@/types';
import { formatPercent, formatPriceWithCurrency } from '@/utils/formatters';
import { useCurrencyStore } from '@/store/currencyStore';
import styles from './CommodityCard.module.css';

interface CommodityCardProps {
    commodity: Commodity;
    onClick: (id: string) => void;
    isInWatchlist: boolean;
    onToggleWatchlist: (id: string) => void;
}

export const CommodityCard: React.FC<CommodityCardProps> = ({
    commodity,
    onClick,
    isInWatchlist,
    onToggleWatchlist,
}) => {
    const isPositive = commodity.changePercent >= 0;
    const { currency } = useCurrencyStore();

    return (
        <motion.div
            className={styles.card}
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onClick(commodity.id)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className={styles.header}>
                <span className={styles.icon}>{commodity.icon}</span>
                <div style={{ flex: 1 }}>
                    <h3 className={styles.name}>{commodity.nameKo}</h3>
                    <span className={styles.symbol}>{commodity.symbol}</span>
                </div>
                <button
                    className={`${styles.watchlistBtn} ${isInWatchlist ? styles.active : ''}`}
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggleWatchlist(commodity.id);
                    }}
                    aria-label={isInWatchlist ? '관심 목록에서 제거' : '관심 목록에 추가'}
                >
                    {isInWatchlist ? '★' : '☆'}
                </button>
            </div>

            <div className={styles.price}>
                {formatPriceWithCurrency(commodity.currentPrice, currency)}
            </div>

            <div className={`${styles.change} ${isPositive ? styles.positive : styles.negative}`}>
                {isPositive ? <FiTrendingUp size={16} /> : <FiTrendingDown size={16} />}
                <span>{formatPercent(commodity.changePercent)}</span>
                <span className={styles.changeAmount}>
                    ({formatPriceWithCurrency(Math.abs(commodity.change), currency)})
                </span>
            </div>
        </motion.div>
    );
};
