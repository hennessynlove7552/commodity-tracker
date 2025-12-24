# 농산물 섹터 원자재 추가 가이드

## 📋 현재 상태

### 기존 원자재 구성 (총 12개)
- **귀금속 (Precious Metals)**: 금, 은, 백금 (3개)
- **에너지 (Energy)**: WTI 원유, 브렌트유, 천연가스 (3개)
- **농산물 (Agricultural)**: 옥수수, 밀, 커피 (3개) ⬅️ **확장 대상**
- **산업금속 (Industrial Metals)**: 구리, 알루미늄, 니켈 (3개)

---

## 🎯 목표

농산물 섹터에 다음 원자재 추가:
1. 대두 (Soybeans)
2. 설탕 (Sugar)
3. 면화 (Cotton)
4. 코코아 (Cocoa)
5. 쌀 (Rice)
6. 오렌지 주스 (Orange Juice)

**총 추가**: 6개 → 농산물 섹터 총 9개

---

## 📝 단계별 진행 절차

### Phase 1: 데이터 구조 설계 (30분)

#### Step 1.1: 원자재 정보 수집

각 원자재에 대해 다음 정보를 조사:

| 원자재 | 심볼 | 거래소 | 단위 | 주요 생산국 | 계절성 |
|--------|------|--------|------|-------------|--------|
| 대두 | ZS | CBOT | bushel | 미국, 브라질 | 9-11월 수확 |
| 설탕 | SB | ICE | lb | 브라질, 인도 | 연중 |
| 면화 | CT | ICE | lb | 중국, 인도 | 10-12월 수확 |
| 코코아 | CC | ICE | ton | 코트디부아르 | 10-3월 주 수확 |
| 쌀 | ZR | CBOT | cwt | 중국, 인도 | 9-10월 수확 |
| 오렌지 주스 | OJ | ICE | lb | 브라질, 미국 | 12-5월 수확 |

**참고 자료:**
- CBOT (Chicago Board of Trade): https://www.cmegroup.com/
- ICE (Intercontinental Exchange): https://www.theice.com/

#### Step 1.2: 현재 가격 조사

각 원자재의 현재 시장 가격을 조사하여 Mock 데이터 생성:

```bash
# 가격 조사 사이트
- TradingView: https://www.tradingview.com/markets/commodities/
- Investing.com: https://www.investing.com/commodities/
- Bloomberg: https://www.bloomberg.com/markets/commodities
```

---

### Phase 2: 코드 수정 (1시간)

#### Step 2.1: `constants.ts` 파일 수정

**파일 위치**: `src/utils/constants.ts`

**작업 내용**:

1. **새로운 원자재 데이터 추가**

```typescript
// 기존 농산물 (3개)
{
  id: '7',
  name: 'Corn',
  nameKo: '옥수수',
  symbol: 'ZC',
  category: 'agricultural',
  currentPrice: 450.25,
  change: 5.75,
  changePercent: 1.29,
  currency: 'USD',
  unit: 'bushel',
  icon: '🌽',
  lastUpdated: new Date(),
},
// ... 밀, 커피

// 🆕 추가할 농산물 (6개)
{
  id: '13',
  name: 'Soybeans',
  nameKo: '대두',
  symbol: 'ZS',
  category: 'agricultural',
  currentPrice: 1425.50,
  change: -12.25,
  changePercent: -0.85,
  currency: 'USD',
  unit: 'bushel',
  icon: '🫘',
  lastUpdated: new Date(),
},
{
  id: '14',
  name: 'Sugar',
  nameKo: '설탕',
  symbol: 'SB',
  category: 'agricultural',
  currentPrice: 24.35,
  change: 0.45,
  changePercent: 1.88,
  currency: 'USD',
  unit: 'lb',
  icon: '🍬',
  lastUpdated: new Date(),
},
{
  id: '15',
  name: 'Cotton',
  nameKo: '면화',
  symbol: 'CT',
  category: 'agricultural',
  currentPrice: 82.15,
  change: -1.20,
  changePercent: -1.44,
  currency: 'USD',
  unit: 'lb',
  icon: '🌾',
  lastUpdated: new Date(),
},
{
  id: '16',
  name: 'Cocoa',
  nameKo: '코코아',
  symbol: 'CC',
  category: 'agricultural',
  currentPrice: 4250.00,
  change: 85.00,
  changePercent: 2.04,
  currency: 'USD',
  unit: 'ton',
  icon: '🍫',
  lastUpdated: new Date(),
},
{
  id: '17',
  name: 'Rice',
  nameKo: '쌀',
  symbol: 'ZR',
  category: 'agricultural',
  currentPrice: 16.75,
  change: 0.25,
  changePercent: 1.52,
  currency: 'USD',
  unit: 'cwt',
  icon: '🍚',
  lastUpdated: new Date(),
},
{
  id: '18',
  name: 'Orange Juice',
  nameKo: '오렌지 주스',
  symbol: 'OJ',
  category: 'agricultural',
  currentPrice: 285.50,
  change: -5.25,
  changePercent: -1.81,
  currency: 'USD',
  unit: 'lb',
  icon: '🍊',
  lastUpdated: new Date(),
},
```

**전체 수정 명령어**:

```bash
# 파일 편집
code src/utils/constants.ts

# 또는 vim
vim src/utils/constants.ts
```

#### Step 2.2: TypeScript 타입 확인

**파일 위치**: `src/types/index.ts`

기존 타입 정의가 새로운 원자재를 지원하는지 확인:

```typescript
export type CommodityCategory = 
  | 'precious-metals'
  | 'energy'
  | 'agricultural'  // ✅ 이미 정의됨
  | 'industrial-metals';

export interface Commodity {
  id: string;
  name: string;
  nameKo: string;
  symbol: string;
  category: CommodityCategory;
  currentPrice: number;
  change: number;
  changePercent: number;
  currency: string;
  unit: string;
  icon: string;
  lastUpdated: Date;
}
```

**확인 사항**: ✅ 추가 수정 불필요

---

### Phase 3: 테스트 및 검증 (30분)

#### Step 3.1: 로컬 개발 서버 확인

```bash
# 개발 서버 실행 (이미 실행 중이면 생략)
npm run dev

# 브라우저에서 확인
# http://localhost:5173/commodity-tracker/
```

**확인 사항**:
- [ ] 대시보드에 새로운 농산물 9개가 모두 표시되는가?
- [ ] 농산물 카테고리 필터가 정상 작동하는가?
- [ ] 각 원자재 카드의 정보가 올바르게 표시되는가?
- [ ] 아이콘이 제대로 표시되는가?
- [ ] 가격 변동률 색상이 올바른가? (양수=초록, 음수=빨강)

#### Step 3.2: 검색 기능 테스트

```
테스트 케이스:
1. "대두" 검색 → 대두만 표시
2. "ZS" 검색 → 대두만 표시
3. "Soybeans" 검색 → 대두만 표시
4. "농산물" 필터 → 9개 농산물 모두 표시
```

#### Step 3.3: 반응형 디자인 확인

브라우저 개발자 도구 (F12) → Device Toolbar:
- [ ] 모바일 (375px): 카드가 1열로 표시
- [ ] 태블릿 (768px): 카드가 2열로 표시
- [ ] 데스크톱 (1024px+): 카드가 3-4열로 표시

---

### Phase 4: 코드 품질 검증 (15분)

#### Step 4.1: Lint 검사

```bash
npm run lint
```

**예상 결과**: ✅ No errors

#### Step 4.2: TypeScript 타입 체크

```bash
npm run type-check
```

**예상 결과**: ✅ No errors

#### Step 4.3: 빌드 테스트

```bash
npm run build
```

**예상 결과**: ✅ Build successful

---

### Phase 5: Git 커밋 및 배포 (15분)

#### Step 5.1: 변경사항 확인

```bash
git status
git diff src/utils/constants.ts
```

#### Step 5.2: 커밋

```bash
git add src/utils/constants.ts
git commit -m "feat(agricultural): add 6 new agricultural commodities

Added commodities:
- Soybeans (대두) - ZS
- Sugar (설탕) - SB
- Cotton (면화) - CT
- Cocoa (코코아) - CC
- Rice (쌀) - ZR
- Orange Juice (오렌지 주스) - OJ

Total agricultural commodities: 3 → 9
Total commodities in app: 12 → 18

Changes:
- Updated MOCK_COMMODITIES in constants.ts
- Added appropriate icons and market data
- Maintained consistent data structure"
```

#### Step 5.3: GitHub 푸시

```bash
git push origin main
```

#### Step 5.4: 배포 확인

```bash
# GitHub Actions 워크플로우 모니터링
gh run watch

# 또는 웹에서 확인
# https://github.com/hennessynlove7552/commodity-tracker/actions
```

**배포 완료 후 확인**:
- [ ] https://hennessynlove7552.github.io/commodity-tracker/ 접속
- [ ] 새로운 농산물 9개가 표시되는지 확인

---

## 📊 예상 결과

### Before (12개)
```
귀금속: 3개
에너지: 3개
농산물: 3개 ⬅️
산업금속: 3개
```

### After (18개)
```
귀금속: 3개
에너지: 3개
농산물: 9개 ⬅️ +6개 추가
산업금속: 3개
```

---

## 🔧 문제 해결

### 문제 1: 아이콘이 표시되지 않음

**원인**: 이모지 지원 문제
**해결**: 
```typescript
// 대체 아이콘 사용
icon: '🫘' → icon: '🌱'  // 대두
icon: '🍬' → icon: '🧂'  // 설탕
```

### 문제 2: 가격이 너무 높거나 낮게 표시됨

**원인**: 단위 불일치
**해결**:
```typescript
// 단위 확인 및 가격 조정
unit: 'bushel' // 곡물류
unit: 'lb'     // 파운드 (설탕, 면화, OJ)
unit: 'ton'    // 톤 (코코아)
unit: 'cwt'    // 100파운드 (쌀)
```

### 문제 3: 빌드 실패

**원인**: TypeScript 에러
**해결**:
```bash
# 타입 체크
npm run type-check

# 에러 확인 후 수정
```

---

## 📚 추가 개선 사항 (선택)

### 1. 실제 API 연동 준비

```typescript
// src/services/api/commodities.ts
const AGRICULTURAL_SYMBOLS = {
  corn: 'ZC',
  wheat: 'ZW',
  coffee: 'KC',
  soybeans: 'ZS',
  sugar: 'SB',
  cotton: 'CT',
  cocoa: 'CC',
  rice: 'ZR',
  orangeJuice: 'OJ',
};
```

### 2. 계절성 정보 추가

```typescript
interface Commodity {
  // ... 기존 필드
  seasonality?: {
    harvestMonths: number[];  // [9, 10, 11] = 9-11월
    peakDemand: number[];     // 수요 피크 월
  };
}
```

### 3. 생산국 정보 추가

```typescript
interface Commodity {
  // ... 기존 필드
  topProducers?: string[];  // ['미국', '브라질', '아르헨티나']
}
```

---

## ⏱️ 총 예상 소요 시간

| Phase | 작업 | 시간 |
|-------|------|------|
| Phase 1 | 데이터 구조 설계 | 30분 |
| Phase 2 | 코드 수정 | 1시간 |
| Phase 3 | 테스트 및 검증 | 30분 |
| Phase 4 | 코드 품질 검증 | 15분 |
| Phase 5 | Git 커밋 및 배포 | 15분 |
| **합계** | | **2시간 30분** |

---

## ✅ 체크리스트

작업 완료 시 다음 항목을 확인하세요:

- [ ] `constants.ts`에 6개 농산물 추가 완료
- [ ] 로컬에서 정상 작동 확인
- [ ] Lint 및 TypeScript 검사 통과
- [ ] 빌드 성공
- [ ] Git 커밋 및 푸시 완료
- [ ] GitHub Actions 배포 성공
- [ ] 프로덕션 사이트에서 확인 완료

---

**다음 단계**: 다른 섹터(귀금속, 에너지, 산업금속)도 동일한 방식으로 확장 가능합니다!
