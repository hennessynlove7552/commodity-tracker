# Git Commit Guide

## 📁 정리된 프로젝트 구조

```
commodity-tracker/
├── .agent/                    # 프로젝트 규칙 (gitignore됨)
│   └── rules/
│       ├── TDD.md            # TDD 규칙
│       └── SOLID.md          # SOLID 원칙
├── .github/                   # GitHub Actions 워크플로우
│   └── workflows/
│       ├── deploy.yml        # 자동 배포
│       └── pr-check.yml      # PR 검증
├── docs/                      # 문서
│   ├── README.md             # 문서 인덱스
│   ├── PRD.md                # 제품 요구사항
│   ├── TECH_SPEC.md          # 기술 사양
│   └── design-reference/     # 디자인 참고 자료
│       ├── 메인_대시보드/
│       ├── 세부_가격_차트/
│       ├── 뉴스_및_분석/
│       └── 관심_목록_설정/
├── src/                       # 소스 코드
│   ├── components/           # UI 컴포넌트
│   ├── features/             # 기능별 페이지
│   ├── hooks/                # 커스텀 훅
│   ├── services/             # API 서비스
│   ├── store/                # 상태 관리
│   ├── styles/               # 글로벌 스타일
│   ├── types/                # TypeScript 타입
│   ├── utils/                # 유틸리티
│   ├── test/                 # 테스트 설정
│   ├── App.tsx
│   └── main.tsx
├── .env.example              # 환경 변수 템플릿
├── .gitignore
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── vitest.config.ts
├── README.md
├── DEVELOPMENT_REPORT.md
├── DEPLOYMENT_GUIDE.md
└── DEPLOYMENT_CHECKLIST.md
```

## 🚀 Git 커밋 단계

### 1. Git 초기화 및 첫 커밋

```bash
cd /Users/leehyunzu/Downloads/stitch_\ 7/commodity-tracker

# Git 초기화
git init

# 모든 파일 스테이징
git add .

# 첫 커밋
git commit -m "Initial commit: Commodity Price Tracker MVP

Features:
- Real-time commodity price dashboard
- Category filtering and search
- Watchlist management with localStorage
- Dark theme with glassmorphism design
- Responsive layout for all devices
- TDD and SOLID principles setup

Tech Stack:
- React 18 + TypeScript
- Vite build tool
- Zustand state management
- React Query data fetching
- Framer Motion animations
- Vitest testing framework

Documentation:
- PRD and Technical Specification
- Deployment guides
- TDD and SOLID principles rules
- Design reference screenshots"

# 기본 브랜치를 main으로 설정
git branch -M main
```

### 2. GitHub 저장소 연결

```bash
# 원격 저장소 추가 (YOUR_USERNAME을 실제 사용자명으로 변경)
git remote add origin https://github.com/YOUR_USERNAME/commodity-tracker.git

# 푸시
git push -u origin main
```

### 3. GitHub 설정

#### A. GitHub Secrets 설정 (선택사항)
Repository Settings → Secrets and variables → Actions:
- `ALPHA_VANTAGE_API_KEY`
- `TWELVE_DATA_API_KEY`
- `VITE_NEWS_API_KEY`

#### B. GitHub Pages 활성화
Repository Settings → Pages:
- Source: **GitHub Actions** 선택

### 4. 배포 확인

1. Actions 탭에서 워크플로우 실행 확인
2. 완료 후 `https://YOUR_USERNAME.github.io/commodity-tracker/` 접속

## 📝 커밋 메시지 컨벤션

앞으로의 커밋은 다음 형식을 따르세요:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type
- `feat`: 새로운 기능
- `fix`: 버그 수정
- `docs`: 문서 변경
- `style`: 코드 포맷팅 (기능 변경 없음)
- `refactor`: 코드 리팩토링
- `test`: 테스트 추가/수정
- `chore`: 빌드 프로세스, 도구 설정 등

### Examples
```bash
git commit -m "feat(dashboard): add real-time price updates"
git commit -m "fix(watchlist): resolve localStorage persistence issue"
git commit -m "test(formatters): add unit tests for currency formatting"
git commit -m "docs(readme): update installation instructions"
```

## ✅ 커밋 전 체크리스트

- [ ] 코드가 정상적으로 빌드되는가? (`npm run build`)
- [ ] Lint 검사를 통과하는가? (`npm run lint`)
- [ ] 타입 체크를 통과하는가? (`npm run type-check`)
- [ ] 테스트가 모두 통과하는가? (`npm run test`)
- [ ] .env 파일이 gitignore에 포함되어 있는가?
- [ ] 민감한 정보(API 키 등)가 코드에 하드코딩되지 않았는가?
- [ ] 불필요한 파일(node_modules, dist 등)이 제외되었는가?

## 🔍 커밋 전 확인 명령어

```bash
# 전체 검증
npm run type-check && npm run lint && npm run test && npm run build

# 스테이징된 파일 확인
git status

# 변경 사항 확인
git diff --staged
```

## 📌 주의사항

1. **API 키 관리**
   - `.env` 파일은 절대 커밋하지 마세요
   - `.env.example`만 커밋하세요
   - GitHub Secrets에 실제 키를 저장하세요

2. **대용량 파일**
   - 이미지는 최적화된 상태로 커밋
   - 불필요한 디자인 파일은 제외

3. **브랜치 전략**
   - `main`: 프로덕션 코드
   - `develop`: 개발 중인 코드
   - `feature/*`: 새로운 기능
   - `fix/*`: 버그 수정

---

**준비 완료!** 위의 명령어를 순서대로 실행하면 첫 커밋이 완료됩니다.
