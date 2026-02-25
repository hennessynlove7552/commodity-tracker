import { useState, useMemo } from 'react';
import { useCommodities } from '@/hooks/useCommodities';
import { useWatchlistStore } from '@/store/watchlistStore';
import { useCurrencyStore, USD_TO_KRW_RATE } from '@/store/currencyStore';
import { CommodityGrid } from '@/components/commodity/CommodityGrid';
import { CommodityDetailModal } from '@/components/commodity/CommodityDetailModal';
import { NewsSection } from '@/components/news';
import { Loading } from '@/components/common/Loading';
import { CATEGORY_LABELS } from '@/utils/constants';
import { PreciousMetalsSubcategory, EnergySubcategory, IndustrialMetalsSubcategory, AgriculturalSubcategory, Commodity } from '@/types';
import styles from './Dashboard.module.css';

// Subcategory labels
const SUBCATEGORY_LABELS = {
    // Precious Metals
    [PreciousMetalsSubcategory.CORE]: '핵심 귀금속',
    [PreciousMetalsSubcategory.PGM_SPECIALTY]: 'PGM/특수',
    // Energy
    [EnergySubcategory.CRUDE_OIL]: '원유',
    [EnergySubcategory.REFINED_PRODUCTS]: '정제유/석유제품',
    [EnergySubcategory.GAS]: '가스 에너지',
    [EnergySubcategory.COAL]: '석탄',
    [EnergySubcategory.ELECTRICITY]: '전력',
    [EnergySubcategory.RENEWABLE]: '신재생 에너지',
    // Industrial Metals
    [IndustrialMetalsSubcategory.BASE_METALS]: '전통 산업금속',
    [IndustrialMetalsSubcategory.FERROUS]: '철강·철계',
    [IndustrialMetalsSubcategory.BATTERY_ENERGY]: '배터리·에너지',
    [IndustrialMetalsSubcategory.RARE_STRATEGIC]: '희소·전략',
    // Agricultural
    [AgriculturalSubcategory.GRAINS]: '곡물',
    [AgriculturalSubcategory.OILSEEDS]: '유지종자/오일',
    [AgriculturalSubcategory.SOFT_COMMODITIES]: '소프트 커머디티',
    [AgriculturalSubcategory.LIVESTOCK]: '축산물',
    [AgriculturalSubcategory.DAIRY]: '유제품',
    [AgriculturalSubcategory.SPECIALTY]: '특수 농산물',
};

export const Dashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'prices' | 'news'>('prices');
    const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
    const [selectedSubcategory, setSelectedSubcategory] = useState<string>('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCommodity, setSelectedCommodity] = useState<Commodity | null>(null);

    const { data: commodities, isLoading, error } = useCommodities();
    const { watchlist, toggleWatchlist } = useWatchlistStore();
    const { currency, toggleCurrency } = useCurrencyStore();

    // Get available subcategories for selected category
    const availableSubcategories = useMemo(() => {
        if (!commodities || selectedCategory === 'ALL') return [];

        const subcats = new Set<string>();
        commodities
            .filter(c => c.category === selectedCategory)
            .forEach(c => {
                if (c.subcategory) {
                    subcats.add(c.subcategory);
                }
            });

        return Array.from(subcats);
    }, [commodities, selectedCategory]);

    // Filter commodities based on category, subcategory and search query
    const filteredCommodities = useMemo(() => {
        if (!commodities) return [];

        return commodities.filter((commodity) => {
            const matchesCategory = selectedCategory === 'ALL' || commodity.category === selectedCategory;
            const matchesSubcategory = selectedSubcategory === 'ALL' || commodity.subcategory === selectedSubcategory;
            const matchesSearch =
                commodity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                commodity.nameKo.includes(searchQuery) ||
                commodity.symbol.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSubcategory && matchesSearch;
        });
    }, [commodities, selectedCategory, selectedSubcategory, searchQuery]);

    // Calculate stats
    const stats = useMemo(() => {
        if (!commodities) return { total: 0, gainers: 0, losers: 0 };

        return {
            total: commodities.length,
            gainers: commodities.filter((c) => c.changePercent > 0).length,
            losers: commodities.filter((c) => c.changePercent < 0).length,
        };
    }, [commodities]);

    // Reset subcategory when category changes
    const handleCategoryChange = (category: string) => {
        setSelectedCategory(category);
        setSelectedSubcategory('ALL');
    };

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
                    <div className={styles.headerTop}>
                        <div>
                            <h1 className={styles.title}>원자재 시장 대시보드</h1>
                            <p className={styles.subtitle}>
                                실시간 원자재 가격 정보를 확인하세요
                            </p>
                        </div>
                        <div className={styles.currencyToggleWrapper}>
                            <button
                                id="currency-toggle-btn"
                                className={styles.currencyToggleBtn}
                                onClick={toggleCurrency}
                                aria-label={`통화 전환: 현재 ${currency}`}
                            >
                                <span className={currency === 'USD' ? styles.currencyActive : styles.currencyInactive}>
                                    $ USD
                                </span>
                                <span className={styles.currencyDivider}>|</span>
                                <span className={currency === 'KRW' ? styles.currencyActive : styles.currencyInactive}>
                                    ₩ KRW
                                </span>
                            </button>
                            <p className={styles.exchangeRate}>
                                기준환율 1 USD = {USD_TO_KRW_RATE.toLocaleString()}원
                            </p>
                        </div>
                    </div>

                    {/* Tab Navigation */}
                    <div className={styles.tabs}>
                        <button
                            className={`${styles.tab} ${activeTab === 'prices' ? styles.activeTab : ''}`}
                            onClick={() => setActiveTab('prices')}
                        >
                            💰 가격
                        </button>
                        <button
                            className={`${styles.tab} ${activeTab === 'news' ? styles.activeTab : ''}`}
                            onClick={() => setActiveTab('news')}
                        >
                            📰 뉴스
                        </button>
                    </div>
                </header>

                {activeTab === 'prices' ? (
                    <>
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

                            {/* Main Category Filters */}
                            <div className={styles.filters}>
                                <button
                                    className={`${styles.filterBtn} ${selectedCategory === 'ALL' ? styles.active : ''}`}
                                    onClick={() => handleCategoryChange('ALL')}
                                >
                                    전체
                                </button>
                                {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                                    <button
                                        key={key}
                                        className={`${styles.filterBtn} ${selectedCategory === key ? styles.active : ''}`}
                                        onClick={() => handleCategoryChange(key)}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>

                            {/* Subcategory Filters */}
                            {availableSubcategories.length > 0 && (
                                <div className={styles.subFilters}>
                                    <span className={styles.subFilterLabel}>세부 분류:</span>
                                    <button
                                        className={`${styles.subFilterBtn} ${selectedSubcategory === 'ALL' ? styles.active : ''}`}
                                        onClick={() => setSelectedSubcategory('ALL')}
                                    >
                                        전체
                                    </button>
                                    {availableSubcategories.map((subcat) => (
                                        <button
                                            key={subcat}
                                            className={`${styles.subFilterBtn} ${selectedSubcategory === subcat ? styles.active : ''}`}
                                            onClick={() => setSelectedSubcategory(subcat)}
                                        >
                                            {SUBCATEGORY_LABELS[subcat as keyof typeof SUBCATEGORY_LABELS] || subcat}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Results count */}
                        <div className={styles.resultsInfo}>
                            <span>{filteredCommodities.length}개의 원자재</span>
                            {selectedSubcategory !== 'ALL' && (
                                <span className={styles.activeFilter}>
                                    {' · '}{SUBCATEGORY_LABELS[selectedSubcategory as keyof typeof SUBCATEGORY_LABELS]}
                                </span>
                            )}
                        </div>

                        {/* Commodity Grid */}
                        <CommodityGrid
                            commodities={filteredCommodities}
                            watchlist={watchlist}
                            onToggleWatchlist={toggleWatchlist}
                            onClick={(id: string) => {
                                const commodity = filteredCommodities.find(c => c.id === id);
                                if (commodity) setSelectedCommodity(commodity);
                            }}
                        />
                    </>
                ) : (
                    <NewsSection />
                )}

                {selectedCommodity && (
                    <CommodityDetailModal
                        commodity={selectedCommodity}
                        onClose={() => setSelectedCommodity(null)}
                    />
                )}
            </div>
        </div>
    );
};
