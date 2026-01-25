import { NewsArticle } from '@/types';
import styles from './NewsCard.module.css';

interface NewsCardProps {
    news: NewsArticle;
}

export const NewsCard: React.FC<NewsCardProps> = ({ news }) => {
    const formatDate = (date: Date) => {
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffHours / 24);

        if (diffHours < 1) return '방금 전';
        if (diffHours < 24) return `${diffHours}시간 전`;
        if (diffDays < 7) return `${diffDays}일 전`;

        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getSentimentColor = (sentiment?: 'positive' | 'negative' | 'neutral') => {
        switch (sentiment) {
            case 'positive': return '#10b981';
            case 'negative': return '#ef4444';
            default: return '#6b7280';
        }
    };

    const getSentimentLabel = (sentiment?: 'positive' | 'negative' | 'neutral') => {
        switch (sentiment) {
            case 'positive': return '호재';
            case 'negative': return '악재';
            default: return '중립';
        }
    };

    return (
        <article className={styles.newsCard}>
            {news.imageUrl && (
                <div className={styles.imageWrapper}>
                    <img src={news.imageUrl} alt={news.title} className={styles.image} />
                    {news.sentiment && (
                        <span
                            className={styles.sentimentBadge}
                            style={{ backgroundColor: getSentimentColor(news.sentiment) }}
                        >
                            {getSentimentLabel(news.sentiment)}
                        </span>
                    )}
                </div>
            )}
            <div className={styles.content}>
                <div className={styles.meta}>
                    <span className={styles.source}>{news.source}</span>
                    <span className={styles.divider}>•</span>
                    <span className={styles.date}>{formatDate(news.publishedAt)}</span>
                </div>
                <h3 className={styles.title}>
                    <a href={news.url} target="_blank" rel="noopener noreferrer">
                        {news.title}
                    </a>
                </h3>
                <p className={styles.summary}>{news.summary}</p>
                {news.relatedCommodities && news.relatedCommodities.length > 0 && (
                    <div className={styles.tags}>
                        {news.relatedCommodities.slice(0, 3).map((commodity, index) => (
                            <span key={index} className={styles.tag}>
                                #{commodity}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </article>
    );
};
