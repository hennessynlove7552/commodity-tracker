import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Commodity } from '@/types';
import { CommodityCard } from '../CommodityCard';
import styles from './CommodityGrid.module.css';

interface CommodityGridProps {
    commodities: Commodity[];
    watchlist: string[];
    onToggleWatchlist: (id: string) => void;
}

export const CommodityGrid = memo<CommodityGridProps>(({
    commodities,
    watchlist,
    onToggleWatchlist
}) => {
    const navigate = useNavigate();

    const handleCardClick = (id: string) => {
        navigate(`/commodity/${id}`);
    };

    if (commodities.length === 0) {
        return (
            <div className={styles.empty}>
                <div className={styles.emptyIcon}>📊</div>
                <p className={styles.emptyText}>표시할 원자재가 없습니다</p>
                <p className={styles.emptySubtext}>필터를 조정하거나 나중에 다시 시도해주세요</p>
            </div>
        );
    }

    return (
        <div className={styles.grid}>
            {commodities.map((commodity) => (
                <CommodityCard
                    key={commodity.id}
                    commodity={commodity}
                    onClick={handleCardClick}
                    isInWatchlist={watchlist.includes(commodity.id)}
                    onToggleWatchlist={onToggleWatchlist}
                />
            ))}
        </div>
    );
});

CommodityGrid.displayName = 'CommodityGrid';
