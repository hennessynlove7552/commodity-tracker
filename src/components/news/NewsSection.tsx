import { useState, useMemo } from 'react';
import { NewsArticle } from '@/types';
import { NewsCard } from './NewsCard';
import { MOCK_NEWS } from '@/utils/constants';
import styles from './NewsSection.module.css';

export const NewsSection: React.FC = () => {
    const [selectedFilter, setSelectedFilter] = useState<'all' | 'positive' | 'negative'>('all');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredNews = useMemo(() => {
        return MOCK_NEWS.filter((news: NewsArticle) => {
            const matchesFilter = selectedFilter === 'all' || news.sentiment === selectedFilter;
            const matchesSearch =
                news.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                news.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
                news.source.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesFilter && matchesSearch;
        });
    }, [selectedFilter, searchQuery]);

    return (
        <div className={styles.newsSection}>
            <div className={styles.header}>
                <div className={styles.titleSection}>
                    <h2 className={styles.title}>📰 시장 뉴스 & 인사이트</h2>
                    <p className={styles.subtitle}>
                        원자재 시장의 최신 동향과 주요 이슈를 확인하세요
                    </p>
                </div>

                <div className={styles.controls}>
                    <div className={styles.searchBar}>
                        <svg
                            className={styles.searchIcon}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                        </svg>
                        <input
                            type="text"
                            className={styles.searchInput}
                            placeholder="뉴스 검색..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className={styles.filters}>
                        <button
                            className={`${styles.filterBtn} ${selectedFilter === 'all' ? styles.active : ''}`}
                            onClick={() => setSelectedFilter('all')}
                        >
                            전체
                        </button>
                        <button
                            className={`${styles.filterBtn} ${selectedFilter === 'positive' ? styles.active : ''}`}
                            onClick={() => setSelectedFilter('positive')}
                        >
                            호재
                        </button>
                        <button
                            className={`${styles.filterBtn} ${selectedFilter === 'negative' ? styles.active : ''}`}
                            onClick={() => setSelectedFilter('negative')}
                        >
                            악재
                        </button>
                    </div>
                </div>
            </div>

            <div className={styles.resultsInfo}>
                <span>{filteredNews.length}개의 뉴스</span>
            </div>

            {filteredNews.length === 0 ? (
                <div className={styles.emptyState}>
                    <svg
                        className={styles.emptyIcon}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                    <h3 className={styles.emptyTitle}>검색 결과가 없습니다</h3>
                    <p className={styles.emptySubtitle}>다른 검색어를 시도해보세요</p>
                </div>
            ) : (
                <div className={styles.newsGrid}>
                    {filteredNews.map((news) => (
                        <NewsCard key={news.id} news={news} />
                    ))}
                </div>
            )}
        </div>
    );
};
