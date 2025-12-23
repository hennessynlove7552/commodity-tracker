import { useState, useMemo } from 'react';
import { useCommodities } from '@/hooks/useCommodities';
import { useWatchlistStore } from '@/store/watchlistStore';
import { CommodityGrid } from '@/components/commodity/CommodityGrid';
import { Loading } from '@/components/common/Loading';
import { CATEGORY_LABELS } from '@/utils/constants';
import styles from './Dashboard.module.css';

export const Dashboard: React.FC = () => {
    const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
    const [searchQuery, setSearchQuery] = useState('');

    const { data: commodities, isLoading, error } = useCommodities();
    const { watchlist, toggleWatchlist } = useWatchlistStore();

    // Filter commodities based on category and search query
    const filteredCommodities = useMemo(() => {
        if (!commodities) return [];

        return commodities.filter((commodity) => {
            const matchesCategory = selectedCategory === 'ALL' || commodity.category === selectedCategory;
            const matchesSearch =
                commodity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                commodity.nameKo.includes(searchQuery) ||
                commodity.symbol.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [commodities, selectedCategory, searchQuery]);

    // Sort: watchlist items first, then by change percent
    const sortedCommodities = useMemo(() => {
        return [...filteredCommodities].sort((a, b) => {
            const aInWatchlist = watchlist.includes(a.id);
            const bInWatchlist = watchlist.includes(b.id);

            if (aInWatchlist && !bInWatchlist) return -1;
            if (!aInWatchlist && bInWatchlist) return 1;

            return Math.abs(b.changePercent) - Math.abs(a.changePercent);
        });
    }, [filteredCommodities, watchlist]);

    // Calculate stats
    const stats = useMemo(() => {
        if (!commodities) return { total: 0, gainers: 0, losers: 0 };

        return {
            total: commodities.length,
            gainers: commodities.filter((c) => c.changePercent > 0).length,
            losers: commodities.filter((c) => c.changePercent < 0).length,
        };
    }, [commodities]);

    if (isLoading) {
        return <Loading text="원자재 데이터를 불러오는 중..." />;
    }

    if (error) {
        return (
            <div className="container">
                <div className={styles.error}>
                    <h3>데이터를 불러오는데 실패했습니다</h3>
                    <p>{error.message}</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.dashboard}>
            <div className="container">
                <header className={styles.header}>
                    <h1 className={styles.title}>원자재 시장 대시보드</h1>
                    <p className={styles.subtitle}>
                        실시간 원자재 가격 정보를 확인하세요
                    </p>
                </header>

                {/* Stats */}
                <div className={styles.stats}>
                    <div className={styles.statCard}>
                        <div className={styles.statLabel}>전체 원자재</div>
                        <div className={styles.statValue}>{stats.total}</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statLabel}>상승</div>
                        <div className={styles.statValue} style={{ color: 'var(--color-success)' }}>
                            {stats.gainers}
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statLabel}>하락</div>
                        <div className={styles.statValue} style={{ color: 'var(--color-danger)' }}>
                            {stats.losers}
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statLabel}>관심 목록</div>
                        <div className={styles.statValue} style={{ color: 'var(--color-warning)' }}>
                            {watchlist.length}
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className={styles.controls}>
                    <div className={styles.searchBar}>
                        <input
                            type="text"
                            className={styles.searchInput}
                            placeholder="원자재 검색... (예: 금, Gold, XAUUSD)"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className={styles.filters}>
                        <button
                            className={`${styles.filterBtn} ${selectedCategory === 'ALL' ? styles.active : ''}`}
                            onClick={() => setSelectedCategory('ALL')}
                        >
                            전체
                        </button>
                        {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                            <button
                                key={key}
                                className={`${styles.filterBtn} ${selectedCategory === key ? styles.active : ''}`}
                                onClick={() => setSelectedCategory(key)}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Commodity Grid */}
                <CommodityGrid
                    commodities={sortedCommodities}
                    watchlist={watchlist}
                    onToggleWatchlist={toggleWatchlist}
                />
            </div>
        </div>
    );
};
