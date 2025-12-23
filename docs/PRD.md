# Product Requirements Document (PRD)
# 원자재 가격 실시간 뷰어 웹 애플리케이션

**문서 버전:** 1.0  
**작성일:** 2025-12-23  
**프로젝트명:** Commodity Price Tracker

---

## 1. 개요 (Overview)

### 1.1 목적
원자재(상품) 시장의 실시간 가격 정보를 제공하는 웹 기반 대시보드 애플리케이션을 개발하여, 투자자와 트레이더가 시장 동향을 빠르게 파악하고 의사결정을 내릴 수 있도록 지원합니다.

### 1.2 목표
- 실시간 원자재 가격 데이터 시각화
- 직관적이고 현대적인 사용자 인터페이스 제공
- 사용자 맞춤형 관심 목록 관리 기능
- 시장 뉴스 및 분석 정보 통합 제공

### 1.3 대상 사용자
- 개인 투자자
- 데이 트레이더
- 금융 애널리스트
- 원자재 시장 관심자

---

## 2. 핵심 기능 (Core Features)

### 2.1 메인 대시보드
**우선순위:** P0 (필수)

#### 기능 설명
- 주요 원자재의 현재 가격과 변동률을 한눈에 표시
- 카테고리별 원자재 분류 (귀금속, 에너지, 농산물, 산업금속 등)
- 실시간 가격 업데이트

#### UI/UX 요구사항
- **레이아웃:** 그리드 기반 카드 레이아웃
- **카드 구성요소:**
  - 원자재 이름 및 아이콘
  - 현재 가격 (큰 폰트로 강조)
  - 변동률 (%, 색상 코딩: 상승=초록, 하락=빨강)
  - 변동 금액
  - 미니 차트 (간단한 트렌드 라인)
- **다크 모드:** 기본 다크 테마 적용
- **색상 스킴:**
  - 배경: 어두운 네이비/블랙 그라데이션
  - 카드: 반투명 글래스모피즘 효과
  - 강조색: 네온 블루, 시안, 그린/레드 (변동률)

#### 표시 항목 (예시)
- **귀금속:** 금(Gold), 은(Silver), 백금(Platinum), 팔라듐(Palladium)
- **에너지:** WTI 원유, 브렌트유, 천연가스, 휘발유
- **농산물:** 옥수수, 밀, 대두, 커피, 설탕
- **산업금속:** 구리, 알루미늄, 니켈, 아연

### 2.2 세부 가격 차트
**우선순위:** P0 (필수)

#### 기능 설명
- 선택한 원자재의 상세 가격 차트 표시
- 다양한 시간대 선택 (1일, 1주, 1개월, 3개월, 1년, 전체)
- 기술적 지표 표시 옵션

#### UI/UX 요구사항
- **차트 타입:** 캔들스틱 차트 또는 라인 차트 선택 가능
- **인터랙션:**
  - 줌 인/아웃 기능
  - 마우스 호버 시 정확한 가격 및 시간 표시
  - 터치 제스처 지원 (모바일)
- **추가 정보 패널:**
  - 시가, 고가, 저가, 종가 (OHLC)
  - 거래량
  - 52주 최고/최저가
  - 시가총액 (해당 시)
- **차트 라이브러리:** TradingView, Chart.js, 또는 Recharts 사용

### 2.3 뉴스 및 분석
**우선순위:** P1 (중요)

#### 기능 설명
- 원자재 시장 관련 최신 뉴스 피드
- 전문가 분석 및 시장 인사이트
- 뉴스 필터링 (카테고리별, 원자재별)

#### UI/UX 요구사항
- **레이아웃:** 타임라인 형식의 뉴스 피드
- **뉴스 카드 구성:**
  - 헤드라인
  - 요약 (2-3줄)
  - 출처 및 게시 시간
  - 관련 원자재 태그
  - 썸네일 이미지 (선택)
- **인터랙션:**
  - 클릭 시 전체 기사로 이동 (새 탭)
  - 북마크/저장 기능
- **데이터 소스:** RSS 피드, 뉴스 API (예: NewsAPI, Alpha Vantage)

### 2.4 관심 목록 설정
**우선순위:** P1 (중요)

#### 기능 설명
- 사용자가 관심 있는 원자재를 선택하여 맞춤형 대시보드 구성
- 관심 목록 순서 변경 (드래그 앤 드롭)
- 알림 설정 (가격 임계값 도달 시)

#### UI/UX 요구사항
- **설정 화면:**
  - 전체 원자재 목록 표시
  - 체크박스 또는 토글 스위치로 선택
  - 카테고리별 필터링
  - 검색 기능
- **저장 방식:** 로컬 스토리지 또는 사용자 계정 (로그인 시)
- **알림 설정:**
  - 가격 상승/하락 임계값 설정
  - 브라우저 푸시 알림 또는 이메일 알림

---

## 3. 기술 요구사항 (Technical Requirements)

### 3.1 프론트엔드
- **프레임워크:** React.js (Next.js 또는 Vite)
- **스타일링:** Vanilla CSS 또는 Tailwind CSS
- **차트 라이브러리:** Recharts, Chart.js, 또는 TradingView Widget
- **상태 관리:** React Context API 또는 Zustand
- **HTTP 클라이언트:** Axios 또는 Fetch API

### 3.2 백엔드/데이터 소스
- **실시간 가격 데이터 API:**
  - Alpha Vantage (무료 티어 제한 있음)
  - Twelve Data
  - Finnhub
  - CoinGecko (암호화폐)
  - Yahoo Finance API (비공식)
- **뉴스 API:**
  - NewsAPI
  - Finnhub News
  - RSS 피드 파싱

### 3.3 배포
- **호스팅:** Vercel, Netlify, 또는 GitHub Pages
- **도메인:** 커스텀 도메인 (선택)
- **SSL:** HTTPS 필수

### 3.4 성능 요구사항
- **초기 로딩 시간:** 3초 이내
- **실시간 업데이트 주기:** 5-10초 (API 제한 고려)
- **반응형 디자인:** 모바일, 태블릿, 데스크톱 지원
- **브라우저 호환성:** Chrome, Firefox, Safari, Edge 최신 버전

---

## 4. 디자인 가이드라인

### 4.1 디자인 시스템
- **컬러 팔레트:**
  - Primary: `#1E3A8A` (Deep Blue)
  - Secondary: `#06B6D4` (Cyan)
  - Success: `#10B981` (Green)
  - Danger: `#EF4444` (Red)
  - Background: `#0F172A` (Dark Navy)
  - Card Background: `rgba(30, 41, 59, 0.5)` (Semi-transparent)
- **타이포그래피:**
  - 헤딩: Inter, Outfit (Bold)
  - 본문: Inter, Roboto (Regular)
  - 숫자: Roboto Mono (Monospace)
- **간격 시스템:** 8px 기준 (8, 16, 24, 32, 48, 64)

### 4.2 UI 컴포넌트
- **카드:** 글래스모피즘 효과 (backdrop-filter: blur)
- **버튼:** 그라데이션 배경, 호버 시 밝아지는 효과
- **입력 필드:** 어두운 배경, 포커스 시 네온 테두리
- **차트:** 다크 테마, 그리드 라인 최소화

### 4.3 애니메이션
- **페이지 전환:** 부드러운 페이드 인/아웃
- **카드 호버:** 살짝 떠오르는 효과 (translateY)
- **가격 변동:** 숫자 변경 시 깜빡임 효과 (flash)
- **로딩:** 스켈레톤 UI 또는 스피너

---

## 5. 사용자 플로우 (User Flow)

### 5.1 첫 방문 사용자
1. 랜딩 페이지 진입
2. 메인 대시보드 표시 (기본 원자재 목록)
3. 관심 원자재 클릭 → 세부 차트 화면 이동
4. 설정 버튼 클릭 → 관심 목록 커스터마이징
5. 저장 → 맞춤형 대시보드 표시

### 5.2 재방문 사용자
1. 랜딩 페이지 진입
2. 저장된 관심 목록 기반 대시보드 자동 로드
3. 실시간 가격 업데이트 확인
4. 뉴스 탭에서 최신 시장 동향 확인

---

## 6. 비기능 요구사항 (Non-Functional Requirements)

### 6.1 보안
- HTTPS 통신 필수
- API 키 환경 변수로 관리 (노출 방지)
- XSS, CSRF 공격 방어

### 6.2 접근성
- WCAG 2.1 AA 수준 준수
- 키보드 네비게이션 지원
- 스크린 리더 호환성

### 6.3 SEO
- 메타 태그 최적화
- 시맨틱 HTML 사용
- Open Graph 태그 추가

### 6.4 분석
- Google Analytics 또는 Plausible 통합
- 사용자 행동 추적 (페이지뷰, 클릭 이벤트)

---

## 7. 마일스톤 및 일정

### Phase 1: MVP (2주)
- [x] 메인 대시보드 구현
- [x] 세부 가격 차트 구현
- [x] 실시간 데이터 연동
- [x] 반응형 디자인 적용

### Phase 2: 핵심 기능 추가 (1주)
- [ ] 관심 목록 설정 기능
- [ ] 뉴스 피드 통합
- [ ] 로컬 스토리지 저장

### Phase 3: 고급 기능 (1주)
- [ ] 알림 기능
- [ ] 다국어 지원 (한국어, 영어)
- [ ] 사용자 계정 시스템 (선택)

### Phase 4: 최적화 및 배포 (3일)
- [ ] 성능 최적화
- [ ] 크로스 브라우저 테스트
- [ ] 프로덕션 배포

---

## 8. 성공 지표 (Success Metrics)

- **사용자 참여도:**
  - 일일 활성 사용자(DAU) 목표: 100명 (첫 달)
  - 평균 세션 시간: 5분 이상
  - 재방문율: 40% 이상

- **기술 지표:**
  - 페이지 로딩 시간: 3초 이내
  - API 응답 시간: 1초 이내
  - 에러율: 1% 미만

- **비즈니스 지표:**
  - 사용자 만족도: 4.0/5.0 이상
  - 관심 목록 설정률: 60% 이상

---

## 9. 위험 요소 및 대응 방안

### 9.1 API 제한
- **위험:** 무료 API의 호출 제한으로 실시간 업데이트 불가
- **대응:** 
  - 캐싱 전략 구현
  - 여러 API 조합 사용
  - 유료 플랜 고려

### 9.2 데이터 정확성
- **위험:** API 데이터의 지연 또는 오류
- **대응:**
  - 여러 데이터 소스 크로스 체크
  - 데이터 검증 로직 구현
  - 면책 조항 표시

### 9.3 성능 이슈
- **위험:** 대량의 실시간 데이터로 인한 성능 저하
- **대응:**
  - 가상화 기법 사용 (React Virtualized)
  - 불필요한 리렌더링 방지 (React.memo, useMemo)
  - 웹 워커 활용

---

## 10. 참고 자료

### 10.1 디자인 레퍼런스
- 첨부된 스크린샷 (stitch_7 폴더)
  - 메인_대시보드/screen.png
  - 세부_가격_차트/screen.png
  - 뉴스_및_분석/screen.png
  - 관심_목록_설정/screen.png

### 10.2 유사 서비스
- TradingView
- Investing.com
- Bloomberg Terminal
- Yahoo Finance

### 10.3 기술 문서
- [Alpha Vantage API Documentation](https://www.alphavantage.co/documentation/)
- [Recharts Documentation](https://recharts.org/)
- [React Documentation](https://react.dev/)

---

## 부록: 데이터 모델

### Commodity (원자재)
```typescript
interface Commodity {
  id: string;
  symbol: string; // 예: "XAUUSD" (금/달러)
  name: string; // 예: "Gold"
  nameKo: string; // 예: "금"
  category: CommodityCategory;
  currentPrice: number;
  currency: string; // 예: "USD"
  change: number; // 변동 금액
  changePercent: number; // 변동률 (%)
  lastUpdated: Date;
  icon?: string; // 아이콘 URL 또는 이모지
}

enum CommodityCategory {
  PRECIOUS_METALS = "귀금속",
  ENERGY = "에너지",
  AGRICULTURE = "농산물",
  INDUSTRIAL_METALS = "산업금속"
}
```

### PriceHistory (가격 이력)
```typescript
interface PriceHistory {
  commodityId: string;
  timestamp: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}
```

### NewsArticle (뉴스 기사)
```typescript
interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  publishedAt: Date;
  relatedCommodities: string[]; // Commodity IDs
  imageUrl?: string;
}
```

### UserWatchlist (사용자 관심 목록)
```typescript
interface UserWatchlist {
  userId?: string; // 로그인 시
  commodities: string[]; // Commodity IDs
  alerts?: PriceAlert[];
}

interface PriceAlert {
  commodityId: string;
  condition: "above" | "below";
  targetPrice: number;
  enabled: boolean;
}
```

---

**문서 승인:**
- [ ] 제품 관리자
- [ ] 개발 리드
- [ ] 디자인 리드
- [ ] 이해관계자

**변경 이력:**
- v1.0 (2025-12-23): 초안 작성
