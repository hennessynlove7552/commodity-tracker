# Technical Specification
# 원자재 가격 실시간 뷰어 웹 애플리케이션

**문서 버전:** 1.0  
**작성일:** 2025-12-23  
**프로젝트명:** Commodity Price Tracker  
**관련 문서:** [PRD.md](./PRD.md)

---

## 1. 시스템 아키텍처 (System Architecture)

### 1.1 전체 아키텍처 개요

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           React SPA (Vite + TypeScript)              │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐     │   │
│  │  │ Dashboard  │  │   Chart    │  │    News    │     │   │
│  │  │ Component  │  │ Component  │  │ Component  │     │   │
│  │  └────────────┘  └────────────┘  └────────────┘     │   │
│  │                                                       │   │
│  │  ┌──────────────────────────────────────────────┐   │   │
│  │  │         State Management (Zustand)           │   │   │
│  │  └──────────────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTPS
┌─────────────────────────────────────────────────────────────┐
│                      API Gateway Layer                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Custom API Aggregator (Optional)             │   │
│  │         - Rate Limiting                              │   │
│  │         - Caching (Redis)                            │   │
│  │         - Request Batching                           │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTPS
┌─────────────────────────────────────────────────────────────┐
│                   External Data Sources                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Alpha Vantage│  │  Twelve Data │  │   NewsAPI    │      │
│  │     API      │  │     API      │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 아키텍처 결정 사항

#### 1.2.1 클라이언트 사이드 렌더링 (CSR) 선택
- **이유:**
  - 실시간 데이터 업데이트가 핵심 기능
  - 높은 인터랙티비티 요구
  - SEO 중요도 낮음 (금융 도구 성격)
- **트레이드오프:** 초기 로딩 시간 증가 가능성 → 코드 스플리팅으로 완화

#### 1.2.2 정적 사이트 호스팅
- **배포:** GitHub Pages
- **빌드:** GitHub Actions
- **장점:**
  - 무료 호스팅
  - 자동 배포 파이프라인
  - HTTPS 기본 지원
  - 간단한 설정
- **제약:** 
  - 정적 파일만 호스팅 가능 (서버리스 함수 불가)
  - API 키는 클라이언트에서 직접 관리 (환경 변수로 빌드 시 주입)
  - API 호출 제한 → 클라이언트 사이드 캐싱 필수

---

## 2. 기술 스택 (Technology Stack)

### 2.1 프론트엔드

#### 2.1.1 코어 프레임워크
| 기술 | 버전 | 용도 | 선택 이유 |
|------|------|------|-----------|
| **React** | 18.3+ | UI 라이브러리 | 컴포넌트 재사용성, 생태계 |
| **TypeScript** | 5.3+ | 타입 시스템 | 타입 안정성, 개발 생산성 |
| **Vite** | 5.0+ | 빌드 도구 | 빠른 HMR, 최적화된 번들링 |

#### 2.1.2 상태 관리
```typescript
// Zustand 선택 이유:
// - 보일러플레이트 최소화
// - TypeScript 네이티브 지원
// - DevTools 통합
// - 번들 크기 작음 (~1KB)

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface CommodityStore {
  commodities: Commodity[];
  watchlist: string[];
  addToWatchlist: (id: string) => void;
  removeFromWatchlist: (id: string) => void;
}

const useCommodityStore = create<CommodityStore>()(
  devtools(
    persist(
      (set) => ({
        commodities: [],
        watchlist: [],
        addToWatchlist: (id) => 
          set((state) => ({ 
            watchlist: [...state.watchlist, id] 
          })),
        removeFromWatchlist: (id) => 
          set((state) => ({ 
            watchlist: state.watchlist.filter(w => w !== id) 
          })),
      }),
      { name: 'commodity-storage' }
    )
  )
);
```

#### 2.1.3 스타일링
| 기술 | 용도 | 설정 |
|------|------|------|
| **Vanilla CSS** | 메인 스타일링 | CSS Modules + CSS Variables |
| **CSS Variables** | 테마 시스템 | Dark mode 지원 |
| **PostCSS** | CSS 전처리 | Autoprefixer, Nesting |

```css
/* Design Tokens */
:root {
  /* Colors */
  --color-primary: #1E3A8A;
  --color-secondary: #06B6D4;
  --color-success: #10B981;
  --color-danger: #EF4444;
  --color-warning: #F59E0B;
  
  /* Background */
  --bg-primary: #0F172A;
  --bg-secondary: #1E293B;
  --bg-card: rgba(30, 41, 59, 0.5);
  
  /* Typography */
  --font-heading: 'Inter', sans-serif;
  --font-body: 'Inter', sans-serif;
  --font-mono: 'Roboto Mono', monospace;
  
  /* Spacing */
  --spacing-xs: 0.5rem;
  --spacing-sm: 1rem;
  --spacing-md: 1.5rem;
  --spacing-lg: 2rem;
  --spacing-xl: 3rem;
  
  /* Border Radius */
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  
  /* Glassmorphism */
  --glass-bg: rgba(30, 41, 59, 0.7);
  --glass-border: rgba(255, 255, 255, 0.1);
  --glass-blur: blur(10px);
}
```

#### 2.1.4 차트 라이브러리
**선택: Recharts**

```typescript
// 장점:
// - React 네이티브 컴포넌트
// - 선언적 API
// - 반응형 기본 지원
// - 커스터마이징 용이

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const PriceChart: React.FC<{ data: PriceHistory[] }> = ({ data }) => (
  <ResponsiveContainer width="100%" height={400}>
    <LineChart data={data}>
      <XAxis dataKey="timestamp" />
      <YAxis domain={['auto', 'auto']} />
      <Tooltip />
      <Line 
        type="monotone" 
        dataKey="close" 
        stroke="var(--color-secondary)" 
        strokeWidth={2}
        dot={false}
      />
    </LineChart>
  </ResponsiveContainer>
);
```

**대안: Lightweight Charts (TradingView)**
- 더 고성능, 금융 차트 특화
- 러닝 커브 높음
- Phase 2에서 고려

#### 2.1.5 HTTP 클라이언트
**선택: Axios + React Query (TanStack Query)**

```typescript
// React Query 장점:
// - 자동 캐싱 및 리페칭
// - 로딩/에러 상태 관리
// - Optimistic Updates
// - Devtools

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
});

export const useCommodityPrice = (symbol: string) => {
  return useQuery({
    queryKey: ['commodity', symbol],
    queryFn: async () => {
      const { data } = await api.get(`/price/${symbol}`);
      return data;
    },
    refetchInterval: 10000, // 10초마다 자동 리페치
    staleTime: 5000, // 5초 동안 fresh 상태 유지
  });
};
```

#### 2.1.6 유틸리티 라이브러리
| 라이브러리 | 용도 | 버전 |
|-----------|------|------|
| **date-fns** | 날짜 포맷팅 | 3.0+ |
| **numeral** | 숫자 포맷팅 | 2.0+ |
| **react-icons** | 아이콘 | 5.0+ |
| **framer-motion** | 애니메이션 | 11.0+ |

### 2.2 백엔드 / API

#### 2.2.1 데이터 소스 API

**Primary: Alpha Vantage**
```typescript
// 무료 티어: 25 requests/day (너무 제한적)
// 프리미엄: $49.99/month (500 requests/minute)

interface AlphaVantageConfig {
  apiKey: string;
  baseUrl: 'https://www.alphavantage.co/query';
}

// 예시 엔드포인트
const fetchGoldPrice = async () => {
  const response = await fetch(
    `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=XAU&to_currency=USD&apikey=${API_KEY}`
  );
  return response.json();
};
```

**Secondary: Twelve Data**
```typescript
// 무료 티어: 800 requests/day
// 더 관대한 제한, 원자재 데이터 지원

interface TwelveDataConfig {
  apiKey: string;
  baseUrl: 'https://api.twelvedata.com';
}

const fetchCommodity = async (symbol: string) => {
  const response = await fetch(
    `https://api.twelvedata.com/price?symbol=${symbol}&apikey=${API_KEY}`
  );
  return response.json();
};
```

**Tertiary: Finnhub (뉴스용)**
```typescript
// 무료 티어: 60 requests/minute
// 뉴스 및 시장 데이터

const fetchCommodityNews = async () => {
  const response = await fetch(
    `https://finnhub.io/api/v1/news?category=forex&token=${API_KEY}`
  );
  return response.json();
};
```

#### 2.2.2 API 통합 전략

**GitHub Pages 환경: 클라이언트 직접 호출**

GitHub Pages는 정적 호스팅만 지원하므로 클라이언트에서 직접 API를 호출합니다.

```typescript
// src/services/api/client.ts

import axios from 'axios';

// API 키는 빌드 시 환경 변수로 주입
const apiKeys = {
  alphaVantage: import.meta.env.VITE_ALPHA_VANTAGE_API_KEY,
  twelveData: import.meta.env.VITE_TWELVE_DATA_API_KEY,
  news: import.meta.env.VITE_NEWS_API_KEY,
};

// Alpha Vantage API 클라이언트
export const alphaVantageClient = axios.create({
  baseURL: 'https://www.alphavantage.co/query',
  timeout: 10000,
});

// Twelve Data API 클라이언트
export const twelveDataClient = axios.create({
  baseURL: 'https://api.twelvedata.com',
  timeout: 10000,
});

// 원자재 가격 조회
export const fetchCommodityPrice = async (symbol: string) => {
  try {
    const { data } = await twelveDataClient.get('/price', {
      params: {
        symbol,
        apikey: apiKeys.twelveData,
      },
    });
    return data;
  } catch (error) {
    console.error('Failed to fetch commodity price:', error);
    throw error;
  }
};
```

**보안 고려사항:**
- API 키는 GitHub Secrets에 저장하고 빌드 시에만 주입
- 프론트엔드 코드에 노출되지만, 무료 티어 API 사용으로 위험 최소화
- Rate limiting은 React Query의 캐싱으로 완화
- 향후 백엔드 추가 시 Cloudflare Workers 또는 AWS Lambda로 마이그레이션 가능

#### 2.2.3 캐싱 전략

**레이어 1: React Query 캐싱 (메모리)**
```typescript
// src/config/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5분 - 데이터가 fresh한 상태로 유지되는 시간
      cacheTime: 10 * 60 * 1000, // 10분 - 캐시에 보관되는 시간
      refetchOnWindowFocus: false, // 윈도우 포커스 시 자동 리페치 비활성화
      refetchInterval: 30 * 1000, // 30초마다 자동 리페치 (실시간성 유지)
      retry: 2, // 실패 시 2번 재시도
    },
  },
});
```

**레이어 2: 로컬 스토리지 캐싱 (선택적)**
```typescript
// src/utils/cache.ts
interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export class LocalStorageCache {
  static set<T>(key: string, data: T, ttlMs: number = 5 * 60 * 1000): void {
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
    };
    localStorage.setItem(key, JSON.stringify(item));
  }

  static get<T>(key: string): T | null {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) return null;

    const item: CacheItem<T> = JSON.parse(itemStr);
    const isExpired = Date.now() - item.timestamp > item.ttl;

    if (isExpired) {
      localStorage.removeItem(key);
      return null;
    }

    return item.data;
  }
}
```

**레이어 3: Service Worker 캐싱 (Phase 2)**
- PWA 지원 시 Service Worker로 네트워크 요청 캐싱
- Workbox 라이브러리 사용

### 2.3 개발 도구

#### 2.3.1 코드 품질
```json
// package.json
{
  "devDependencies": {
    "eslint": "^8.56.0",
    "eslint-config-airbnb-typescript": "^17.1.0",
    "prettier": "^3.1.1",
    "typescript": "^5.3.3",
    "vitest": "^1.1.0",
    "@testing-library/react": "^14.1.2"
  },
  "scripts": {
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "format": "prettier --write \"src/**/*.{ts,tsx,css}\"",
    "test": "vitest",
    "type-check": "tsc --noEmit"
  }
}
```

#### 2.3.2 Git Hooks
```bash
# .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npm run lint
npm run type-check
npm run test -- --run
```

---

## 3. 데이터 모델 및 타입 정의

### 3.1 TypeScript 인터페이스

```typescript
// src/types/commodity.ts

export enum CommodityCategory {
  PRECIOUS_METALS = 'PRECIOUS_METALS',
  ENERGY = 'ENERGY',
  AGRICULTURE = 'AGRICULTURE',
  INDUSTRIAL_METALS = 'INDUSTRIAL_METALS',
}

export interface Commodity {
  id: string;
  symbol: string; // 예: "XAUUSD", "CL=F"
  name: string;
  nameKo: string;
  category: CommodityCategory;
  currentPrice: number;
  currency: string;
  change: number;
  changePercent: number;
  lastUpdated: Date;
  icon?: string;
  marketCap?: number;
  volume24h?: number;
}

export interface PriceHistory {
  timestamp: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface ChartData {
  commodityId: string;
  timeframe: '1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL';
  data: PriceHistory[];
}

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  publishedAt: Date;
  relatedCommodities: string[];
  imageUrl?: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
}

export interface UserWatchlist {
  commodities: string[];
  alerts: PriceAlert[];
}

export interface PriceAlert {
  id: string;
  commodityId: string;
  condition: 'above' | 'below';
  targetPrice: number;
  enabled: boolean;
  createdAt: Date;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  status: 'success' | 'error';
  message?: string;
  timestamp: Date;
}

export interface PriceUpdateEvent {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  timestamp: Date;
}
```

### 3.2 API 매핑 레이어

```typescript
// src/services/api/mappers.ts

import type { Commodity } from '@/types/commodity';

// Alpha Vantage 응답을 내부 모델로 변환
export const mapAlphaVantageToComm modity = (
  apiData: any,
  metadata: { id: string; name: string; category: CommodityCategory }
): Commodity => {
  const quote = apiData['Global Quote'];
  
  return {
    id: metadata.id,
    symbol: quote['01. symbol'],
    name: metadata.name,
    nameKo: metadata.name, // 별도 매핑 필요
    category: metadata.category,
    currentPrice: parseFloat(quote['05. price']),
    currency: 'USD',
    change: parseFloat(quote['09. change']),
    changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
    lastUpdated: new Date(quote['07. latest trading day']),
  };
};

// Twelve Data 응답 매핑
export const mapTwelveDataToCommodity = (
  apiData: any,
  metadata: { id: string; name: string; category: CommodityCategory }
): Commodity => {
  return {
    id: metadata.id,
    symbol: apiData.symbol,
    name: metadata.name,
    nameKo: metadata.name,
    category: metadata.category,
    currentPrice: parseFloat(apiData.price),
    currency: 'USD',
    change: parseFloat(apiData.change),
    changePercent: parseFloat(apiData.percent_change),
    lastUpdated: new Date(),
  };
};
```

---

## 4. 컴포넌트 아키텍처

### 4.1 폴더 구조

```
src/
├── assets/              # 정적 리소스
│   ├── icons/
│   └── images/
├── components/          # 재사용 가능한 컴포넌트
│   ├── common/         # 공통 컴포넌트
│   │   ├── Button/
│   │   ├── Card/
│   │   ├── Input/
│   │   └── Loading/
│   ├── commodity/      # 원자재 관련 컴포넌트
│   │   ├── CommodityCard/
│   │   ├── CommodityGrid/
│   │   └── PriceChange/
│   ├── chart/          # 차트 컴포넌트
│   │   ├── LineChart/
│   │   ├── CandlestickChart/
│   │   └── MiniChart/
│   └── news/           # 뉴스 컴포넌트
│       ├── NewsCard/
│       └── NewsFeed/
├── features/           # 기능별 모듈
│   ├── dashboard/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── Dashboard.tsx
│   ├── detail/
│   │   └── CommodityDetail.tsx
│   ├── news/
│   │   └── NewsPage.tsx
│   └── settings/
│       └── WatchlistSettings.tsx
├── hooks/              # 커스텀 훅
│   ├── useCommodityPrice.ts
│   ├── usePriceHistory.ts
│   ├── useNews.ts
│   └── useWatchlist.ts
├── services/           # API 서비스
│   ├── api/
│   │   ├── client.ts
│   │   ├── commodities.ts
│   │   ├── news.ts
│   │   └── mappers.ts
│   └── websocket/      # WebSocket (Phase 2)
│       └── priceStream.ts
├── store/              # 상태 관리
│   ├── commodityStore.ts
│   ├── watchlistStore.ts
│   └── uiStore.ts
├── styles/             # 글로벌 스타일
│   ├── globals.css
│   ├── variables.css
│   └── animations.css
├── types/              # TypeScript 타입
│   ├── commodity.ts
│   ├── news.ts
│   └── api.ts
├── utils/              # 유틸리티 함수
│   ├── formatters.ts
│   ├── validators.ts
│   └── constants.ts
├── App.tsx
├── main.tsx
└── vite-env.d.ts
```

### 4.2 핵심 컴포넌트 설계

#### 4.2.1 CommodityCard
```typescript
// src/components/commodity/CommodityCard/CommodityCard.tsx

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'react-icons/fi';
import type { Commodity } from '@/types/commodity';
import { formatCurrency, formatPercent } from '@/utils/formatters';
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
  
  return (
    <motion.div
      className={styles.card}
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(commodity.id)}
    >
      <div className={styles.header}>
        <span className={styles.icon}>{commodity.icon}</span>
        <h3 className={styles.name}>{commodity.nameKo}</h3>
        <button
          className={styles.watchlistBtn}
          onClick={(e) => {
            e.stopPropagation();
            onToggleWatchlist(commodity.id);
          }}
        >
          {isInWatchlist ? '★' : '☆'}
        </button>
      </div>
      
      <div className={styles.price}>
        {formatCurrency(commodity.currentPrice, commodity.currency)}
      </div>
      
      <div className={`${styles.change} ${isPositive ? styles.positive : styles.negative}`}>
        {isPositive ? <TrendingUp /> : <TrendingDown />}
        <span>{formatPercent(commodity.changePercent)}</span>
        <span className={styles.changeAmount}>
          {formatCurrency(Math.abs(commodity.change), commodity.currency)}
        </span>
      </div>
      
      {/* Mini Chart Placeholder */}
      <div className={styles.miniChart}>
        {/* TBD: Sparkline chart */}
      </div>
    </motion.div>
  );
};
```

#### 4.2.2 Dashboard
```typescript
// src/features/dashboard/Dashboard.tsx

import { useState } from 'react';
import { useCommodities } from '@/hooks/useCommodities';
import { useWatchlistStore } from '@/store/watchlistStore';
import { CommodityGrid } from '@/components/commodity/CommodityGrid';
import { CategoryFilter } from './components/CategoryFilter';
import { SearchBar } from './components/SearchBar';
import styles from './Dashboard.module.css';

export const Dashboard: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: commodities, isLoading, error } = useCommodities();
  const { watchlist, toggleWatchlist } = useWatchlistStore();
  
  const filteredCommodities = commodities?.filter((c) => {
    const matchesCategory = selectedCategory === 'ALL' || c.category === selectedCategory;
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         c.nameKo.includes(searchQuery);
    return matchesCategory && matchesSearch;
  });
  
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <h1>원자재 시장 대시보드</h1>
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
      </header>
      
      <CategoryFilter
        selected={selectedCategory}
        onChange={setSelectedCategory}
      />
      
      <CommodityGrid
        commodities={filteredCommodities}
        watchlist={watchlist}
        onToggleWatchlist={toggleWatchlist}
      />
    </div>
  );
};
```

---

## 5. API 설계

### 5.1 엔드포인트 정의

```typescript
// API Routes (Serverless Functions)

// GET /api/commodities
// 모든 원자재 목록 조회
interface GetCommoditiesResponse {
  data: Commodity[];
  lastUpdated: Date;
}

// GET /api/commodities/:symbol
// 특정 원자재 상세 정보
interface GetCommodityResponse {
  data: Commodity;
}

// GET /api/commodities/:symbol/history
// 가격 히스토리 조회
interface GetPriceHistoryRequest {
  symbol: string;
  timeframe: '1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL';
}
interface GetPriceHistoryResponse {
  data: PriceHistory[];
}

// GET /api/news
// 뉴스 피드 조회
interface GetNewsRequest {
  category?: string;
  commodityId?: string;
  limit?: number;
}
interface GetNewsResponse {
  data: NewsArticle[];
  total: number;
}
```

### 5.2 에러 핸들링

```typescript
// src/services/api/errors.ts

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const handleApiError = (error: unknown): ApiError => {
  if (error instanceof ApiError) {
    return error;
  }
  
  if (axios.isAxiosError(error)) {
    return new ApiError(
      error.response?.status || 500,
      error.response?.data?.message || 'Network error',
      error.response?.data
    );
  }
  
  return new ApiError(500, 'Unknown error occurred');
};
```

---

## 6. 성능 최적화

### 6.1 코드 스플리팅
```typescript
// src/App.tsx

import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

const Dashboard = lazy(() => import('@/features/dashboard/Dashboard'));
const CommodityDetail = lazy(() => import('@/features/detail/CommodityDetail'));
const NewsPage = lazy(() => import('@/features/news/NewsPage'));
const Settings = lazy(() => import('@/features/settings/WatchlistSettings'));

export const App = () => (
  <BrowserRouter>
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/commodity/:symbol" element={<CommodityDetail />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Suspense>
  </BrowserRouter>
);
```

### 6.2 이미지 최적화
```typescript
// vite.config.ts

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { imagetools } from 'vite-imagetools';

export default defineConfig({
  plugins: [
    react(),
    imagetools(), // 자동 이미지 최적화
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'chart-vendor': ['recharts'],
          'query-vendor': ['@tanstack/react-query'],
        },
      },
    },
  },
});
```

### 6.3 메모이제이션
```typescript
// src/components/commodity/CommodityGrid/CommodityGrid.tsx

import { memo, useMemo } from 'react';

export const CommodityGrid = memo<CommodityGridProps>(({ commodities, watchlist }) => {
  const sortedCommodities = useMemo(() => {
    return [...commodities].sort((a, b) => {
      // 관심 목록 우선 정렬
      const aInWatchlist = watchlist.includes(a.id);
      const bInWatchlist = watchlist.includes(b.id);
      if (aInWatchlist && !bInWatchlist) return -1;
      if (!aInWatchlist && bInWatchlist) return 1;
      return b.changePercent - a.changePercent;
    });
  }, [commodities, watchlist]);
  
  return (
    <div className={styles.grid}>
      {sortedCommodities.map((commodity) => (
        <CommodityCard key={commodity.id} commodity={commodity} />
      ))}
    </div>
  );
});
```

---

## 7. 보안

### 7.1 환경 변수 관리
```bash
# .env.example
VITE_ALPHA_VANTAGE_API_KEY=your_api_key_here
VITE_TWELVE_DATA_API_KEY=your_api_key_here
VITE_NEWS_API_KEY=your_api_key_here
VITE_API_BASE_URL=https://your-domain.com/api
```

```typescript
// src/config/env.ts

const requiredEnvVars = [
  'VITE_ALPHA_VANTAGE_API_KEY',
  'VITE_API_BASE_URL',
] as const;

export const validateEnv = () => {
  const missing = requiredEnvVars.filter(
    (key) => !import.meta.env[key]
  );
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};

export const env = {
  alphaVantageApiKey: import.meta.env.VITE_ALPHA_VANTAGE_API_KEY,
  twelveDataApiKey: import.meta.env.VITE_TWELVE_DATA_API_KEY,
  newsApiKey: import.meta.env.VITE_NEWS_API_KEY,
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
} as const;
```

### 7.2 CSP (Content Security Policy)
```html
<!-- index.html -->
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline'; 
               style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; 
               font-src 'self' https://fonts.gstatic.com;
               img-src 'self' data: https:;
               connect-src 'self' https://www.alphavantage.co https://api.twelvedata.com;">
```

---

## 8. 테스트 전략

### 8.1 단위 테스트 (Vitest)
```typescript
// src/utils/__tests__/formatters.test.ts

import { describe, it, expect } from 'vitest';
import { formatCurrency, formatPercent } from '../formatters';

describe('formatters', () => {
  describe('formatCurrency', () => {
    it('should format USD correctly', () => {
      expect(formatCurrency(1234.56, 'USD')).toBe('$1,234.56');
    });
    
    it('should handle negative values', () => {
      expect(formatCurrency(-100, 'USD')).toBe('-$100.00');
    });
  });
  
  describe('formatPercent', () => {
    it('should format positive percent', () => {
      expect(formatPercent(5.25)).toBe('+5.25%');
    });
    
    it('should format negative percent', () => {
      expect(formatPercent(-2.5)).toBe('-2.50%');
    });
  });
});
```

### 8.2 컴포넌트 테스트
```typescript
// src/components/commodity/CommodityCard/__tests__/CommodityCard.test.tsx

import { render, screen, fireEvent } from '@testing-library/react';
import { CommodityCard } from '../CommodityCard';

const mockCommodity: Commodity = {
  id: '1',
  symbol: 'XAUUSD',
  name: 'Gold',
  nameKo: '금',
  category: CommodityCategory.PRECIOUS_METALS,
  currentPrice: 2050.50,
  currency: 'USD',
  change: 15.25,
  changePercent: 0.75,
  lastUpdated: new Date(),
};

describe('CommodityCard', () => {
  it('should render commodity information', () => {
    render(
      <CommodityCard
        commodity={mockCommodity}
        onClick={vi.fn()}
        isInWatchlist={false}
        onToggleWatchlist={vi.fn()}
      />
    );
    
    expect(screen.getByText('금')).toBeInTheDocument();
    expect(screen.getByText('$2,050.50')).toBeInTheDocument();
    expect(screen.getByText('+0.75%')).toBeInTheDocument();
  });
  
  it('should call onClick when card is clicked', () => {
    const handleClick = vi.fn();
    render(
      <CommodityCard
        commodity={mockCommodity}
        onClick={handleClick}
        isInWatchlist={false}
        onToggleWatchlist={vi.fn()}
      />
    );
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledWith('1');
  });
});
```

### 8.3 E2E 테스트 (Playwright - Phase 2)
```typescript
// e2e/dashboard.spec.ts

import { test, expect } from '@playwright/test';

test('should display commodity dashboard', async ({ page }) => {
  await page.goto('/');
  
  // 대시보드 로딩 확인
  await expect(page.locator('h1')).toContainText('원자재 시장 대시보드');
  
  // 원자재 카드 표시 확인
  const cards = page.locator('[data-testid="commodity-card"]');
  await expect(cards).toHaveCountGreaterThan(0);
  
  // 카드 클릭 시 상세 페이지 이동
  await cards.first().click();
  await expect(page).toHaveURL(/\/commodity\/.+/);
});
```

---

## 9. 배포 및 CI/CD

### 9.1 GitHub Pages 배포 설정

#### 9.1.1 Vite 설정
```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  base: '/commodity-tracker/', // GitHub Pages 저장소 이름으로 변경
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'chart-vendor': ['recharts'],
          'query-vendor': ['@tanstack/react-query', 'axios'],
        },
      },
    },
  },
});
```

#### 9.1.2 GitHub Pages 설정
1. GitHub 저장소 Settings → Pages
2. Source: GitHub Actions 선택
3. Custom domain (선택사항)

### 9.2 GitHub Actions Workflows

#### 9.2.1 CI/CD Pipeline
```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Lint
        run: npm run lint
      
      - name: Type check
        run: npm run type-check
      
      - name: Test
        run: npm run test -- --run
      
      - name: Build
        run: npm run build
        env:
          VITE_ALPHA_VANTAGE_API_KEY: ${{ secrets.ALPHA_VANTAGE_API_KEY }}
          VITE_TWELVE_DATA_API_KEY: ${{ secrets.TWELVE_DATA_API_KEY }}
          VITE_NEWS_API_KEY: ${{ secrets.NEWS_API_KEY }}
      
      - name: Setup Pages
        uses: actions/configure-pages@v4
      
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'
      
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4

  # PR 체크용 별도 워크플로우
  pr-check:
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request'
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Lint
        run: npm run lint
      
      - name: Type check
        run: npm run type-check
      
      - name: Test
        run: npm run test -- --run
      
      - name: Build
        run: npm run build
```

#### 9.2.2 Pull Request 체크
```yaml
# .github/workflows/pr-check.yml
name: PR Check

on:
  pull_request:
    branches: [main, develop]

jobs:
  check:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Lint
        run: npm run lint
      
      - name: Type check
        run: npm run type-check
      
      - name: Test with coverage
        run: npm run test -- --run --coverage
      
      - name: Build
        run: npm run build
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
          flags: unittests
          name: codecov-umbrella
```

---

## 10. 모니터링 및 분석

### 10.1 에러 트래킹 (Sentry)
```typescript
// src/main.tsx

import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  tracesSampleRate: 1.0,
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay(),
  ],
});
```

### 10.2 성능 모니터링
```typescript
// src/utils/performance.ts

export const measurePerformance = (metricName: string) => {
  if ('performance' in window) {
    performance.mark(`${metricName}-start`);
    
    return () => {
      performance.mark(`${metricName}-end`);
      performance.measure(
        metricName,
        `${metricName}-start`,
        `${metricName}-end`
      );
      
      const measure = performance.getEntriesByName(metricName)[0];
      console.log(`${metricName}: ${measure.duration}ms`);
      
      // Send to analytics
      if (window.gtag) {
        window.gtag('event', 'timing_complete', {
          name: metricName,
          value: Math.round(measure.duration),
        });
      }
    };
  }
  
  return () => {};
};
```

---

## 11. 향후 개선 사항 (Roadmap)

### Phase 2 (1-2개월)
- [ ] WebSocket 실시간 스트리밍
- [ ] 사용자 인증 시스템 (Firebase Auth)
- [ ] 포트폴리오 추적 기능
- [ ] 모바일 앱 (React Native)

### Phase 3 (3-6개월)
- [ ] AI 기반 가격 예측
- [ ] 소셜 기능 (커뮤니티, 댓글)
- [ ] 프리미엄 구독 모델
- [ ] 다국어 지원 (i18n)

---

## 부록

### A. 개발 환경 설정

```bash
# 프로젝트 초기화
npm create vite@latest commodity-tracker -- --template react-ts
cd commodity-tracker

# 의존성 설치
npm install

# 개발 도구 설치
npm install -D eslint prettier husky lint-staged

# 라이브러리 설치
npm install zustand @tanstack/react-query axios
npm install recharts date-fns numeral
npm install framer-motion react-icons
npm install react-router-dom

# 타입 정의 설치
npm install -D @types/numeral

# 개발 서버 실행
npm run dev
```

### B. 유용한 리소스

- [Vite Documentation](https://vitejs.dev/)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [Recharts Examples](https://recharts.org/en-US/examples)
- [Alpha Vantage API Docs](https://www.alphavantage.co/documentation/)

---

**문서 승인:**
- [ ] 기술 리드
- [ ] 시니어 개발자
- [ ] DevOps 엔지니어

**변경 이력:**
- v1.0 (2025-12-23): 초안 작성
