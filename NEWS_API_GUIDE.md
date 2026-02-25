# 🔄 실시간 뉴스 API 연동 가이드

현재 앱은 50개의 Mock 뉴스 데이터를 사용하고 있습니다. 더 많은 최신 뉴스를 얻으려면 실시간 뉴스 API를 연동하세요.

## 📡 추천 뉴스 API

### 1. **NewsAPI** (가장 쉬움)
- **무료 플랜**: 100 requests/day
- **장점**: 간단한 API, 다양한 소스, 한국어 지원
- **가격**: 무료 (개발용), $449/month (Production)
- **웹사이트**: https://newsapi.org

#### 설정 방법:
```bash
# 1. NewsAPI 가입 후 API 키 받기
# https://newsapi.org/register

# 2. .env 파일에 키 추가
echo "VITE_NEWSAPI_KEY=your_api_key_here" >> .env

# 3. 뉴스 서비스 파일 생성
```

```typescript
// src/services/api/news.ts
const NEWSAPI_KEY = import.meta.env.VITE_NEWSAPI_KEY;
const BASE_URL = 'https://newsapi.org/v2';

export const fetchCommodityNews = async (query:string = 'commodity OR gold OR oil') => {
  const response = await fetch(
    `${BASE_URL}/everything?q=${query}&apiKey=${NEWSAPI_KEY}&language=en&sortBy=publishedAt&pageSize=50`
  );
  const data = await response.json();
  
  // NewsAPI 형식을 우리 형식으로 변환
  return data.articles.map((article: any, index: number) => ({
    id: `news-${Date.now()}-${index}`,
    title: article.title,
    summary: article.description || article.content?.slice(0, 200),
    url: article.url,
    source: article.source.name,
    publishedAt: new Date(article.publishedAt),
    imageUrl: article.urlToImage,
    sentiment: analyzeSentiment(article.title + article.description), // 간단한 감정 분석
    relatedCommodities: extractCommodities(article.title + article.description)
  }));
};

function analyzeSentiment(text: string): 'positive' | 'negative' | 'neutral' {
  const positive = ['surge', 'rally', 'gain', 'rise', 'up', 'bull', 'high'];
  const negative = ['fall', 'drop', 'decline', 'down', 'bear', 'low', 'crash'];
  
  const lowerText = text.toLowerCase();
  const posCount = positive.filter(word => lowerText.includes(word)).length;
  const negCount = negative.filter(word => lowerText.includes(word)).length;
  
  if (posCount > negCount) return 'positive';
  if (negCount > posCount) return 'negative';
  return 'neutral';
}
```

### 2. **Finnhub** (금융 특화)
- **무료 플랜**: 60 API calls/minute
- **장점**: 금융/원자재 뉴스 특화, 실시간 데이터
- **가격**: 무료, $49/month (Professional)
- **웹사이트**: https://finnhub.io

```typescript
const FINNHUB_KEY = import.meta.env.VITE_FINNHUB_KEY;

export const fetchFinancialNews = async (category: string = 'forex') => {
  const response = await fetch(
    `https://finnhub.io/api/v1/news?category=${category}&token=${FINNHUB_KEY}`
  );
  return await response.json();
};
```

### 3. **Alpha Vantage** (완전 무료)
- **무료 플랜**: 25 requests/day
- **장점**: API 키만으로 무료, 금융 데이터 풍부
- **가격**: 완전 무료 (제한적), $49.99/month
- **웹사이트**: https://www.alphavantage.co

```typescript
const ALPHA_VANTAGE_KEY = import.meta.env.VITE_ALPHA_VANTAGE_KEY;

export const fetchMarketNews = async (ticker: string = 'GLD') => {
  const response = await fetch(
    `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&tickers=${ticker}&apikey=${ALPHA_VANTAGE_KEY}`
  );
  return await response.json();
};
```

### 4. **RSS 피드 파싱** (완전 무료, API 키 불필요)

```typescript
// RSS 피드 소스 (API 키 필요 없음)
const RSS_FEEDS = [
  'https://www.mining.com/feed/',
  'https://oilprice.com/rss/main',
  'https://www.kitco.com/rss/live-gold-prices.xml',
  'https://www.metalbulletin.com/rss/',
];

// rss-parser 라이브러리 사용
import Parser from 'rss-parser';

export const fetchRSSNews = async () => {
  const parser = new Parser();
  const allNews = [];
  
  for (const feedUrl of RSS_FEEDS) {
    try {
      const feed = await parser.parseURL(feedUrl);
      const news = feed.items.map((item: any) => ({
        title: item.title,
        summary: item.contentSnippet || item.content,
        url: item.link,
        source: feed.title,
        publishedAt: new Date(item.pubDate),
      }));
      allNews.push(...news);
    } catch (error) {
      console.error(`Failed to fetch ${feedUrl}:`, error);
    }
  }
  
  return allNews.sort((a, b) => 
    b.publishedAt.getTime() - a.publishedAt.getTime()
  );
};
```

설치:
```bash
npm install rss-parser
```

## 🔧 통합 방법

### NewsSection 컴포넌트 수정

```typescript
// src/components/news/NewsSection.tsx
import { useState, useEffect } from 'react';
import { fetchCommodityNews } from '@/services/api/news';

export const NewsSection: React.FC = () => {
  const [news, setNews] = useState(MOCK_NEWS); // 초기값은 Mock
  const [loading, setLoading] = useState(false);
  
  // 실시간 뉴스 로드
  useEffect(() => {
    const loadNews = async () => {
      setLoading(true);
      try {
        const liveNews = await fetchCommodityNews();
        setNews(liveNews);
      } catch (error) {
        console.error('Failed to load news:', error);
        // 에러 시 Mock 데이터 사용
        setNews(MOCK_NEWS);
      } finally {
        setLoading(false);
      }
    };
    
    loadNews();
    
    // 10분마다 자동 새로고침
    const interval = setInterval(loadNews, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);
  
  // ... 나머지 코드
};
```

## 📊 추가 정보 소스

### 경제 지표 API
- **FRED (Federal Reserve)**: https://fred.stlouisfed.org/docs/api/
- **World Bank**: https://datahelpdesk.worldbank.org/
- **Trading Economics**: https://tradingeconomics.com/API

### 원자재 가격 API
- **Quandl**: https://www.quandl.com/
- **Metals-API**: https://metals-api.com/
- **CoinAPI** (crypto): https://www.coinapi.io/

## 🎯 권장 구현 순서

1. **단기 (지금)**: 50개 Mock 데이터 활용 ✅ 완료
2. **중기 (1-2주)**: RSS 피드 통합 (무료, API 키 불필요)
3. **장기 (1개월)**: NewsAPI 또는 Finnhub 유료 플랜

## 💡 팁

### 뉴스 캐싱
```typescript
// localStorage에 캐싱하여 API 호출 줄이기
const CACHE_KEY = 'commodity_news_cache';
const CACHE_DURATION = 10 * 60 * 1000; // 10분

export const getCachedNews = () => {
  const cached = localStorage.getItem(CACHE_KEY);
  if (!cached) return null;
  
  const { data, timestamp } = JSON.parse(cached);
  if (Date.now() - timestamp > CACHE_DURATION) return null;
  
  return data;
};

export const setCachedNews = (data: any) => {
  localStorage.setItem(CACHE_KEY, JSON.stringify({
    data,
    timestamp: Date.now()
  }));
};
```

### 감정 분석 향상
```bash
# 더 정교한 감정 분석을 위해 라이브러리 사용
npm install sentiment
```

```typescript
import Sentiment from 'sentiment';

const sentiment = new Sentiment();
const result = sentiment.analyze(text);
// result.score: 양수(긍정), 음수(부정), 0(중립)
```

## 📝 주의사항

1. **API 키 보안**: `.env` 파일 사용, GitHub에 커밋하지 말 것
2. **Rate Limiting**: 과도한 요청 방지, 캐싱 활용
3. **에러 처리**: API 실패 시 Mock 데이터로 폴백
4. **CORS 문제**: 필요 시 백엔드 프록시 구성

이 가이드를 따라 실시간 뉴스 API를 연동하면 수백, 수천 개의 최신 뉴스를 실시간으로 제공할 수 있습니다! 🚀
