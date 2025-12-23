#!/bin/bash

# GitHub Issues Creation Script
# This script creates GitHub issues for all phases in the roadmap

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Creating GitHub Issues for Commodity Price Tracker${NC}"
echo "=================================================="
echo ""

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "Error: GitHub CLI (gh) is not installed."
    echo "Install it from: https://cli.github.com/"
    exit 1
fi

# Check if user is authenticated
if ! gh auth status &> /dev/null; then
    echo "Error: Not authenticated with GitHub CLI."
    echo "Run: gh auth login"
    exit 1
fi

echo "Creating issues..."
echo ""

# Phase 1: Initial Deployment
echo -e "${GREEN}Creating Phase 1 issues...${NC}"

gh issue create \
  --title "[Phase 1.1] Git Repository Setup" \
  --label "phase-1,priority-p0,deployment" \
  --body "## 📋 작업 배경

프로젝트를 GitHub에 업로드하고 버전 관리를 시작하기 위해 Git 저장소를 초기화하고 GitHub에 푸시해야 합니다.

## 🎯 작업 내용

- [ ] Git 저장소 초기화 (\`git init\`)
- [ ] .gitignore 파일 확인
- [ ] 모든 파일 스테이징 (\`git add .\`)
- [ ] 초기 커밋 생성
- [ ] main 브랜치로 설정 (\`git branch -M main\`)

## ✅ 인수 조건

- [ ] Git 저장소가 초기화됨
- [ ] 모든 필요한 파일이 커밋됨
- [ ] 불필요한 파일(.env, node_modules 등)이 제외됨
- [ ] 커밋 메시지가 명확함

## 📚 참고 자료

- [GIT_COMMIT_GUIDE.md](../GIT_COMMIT_GUIDE.md)
- [ROADMAP.md - Phase 1.1](../ROADMAP.md#11-git-repository-setup-15-min)

## ⏱️ 예상 시간

15분"

gh issue create \
  --title "[Phase 1.2] GitHub Repository Creation and Push" \
  --label "phase-1,priority-p0,deployment" \
  --body "## 📋 작업 배경

로컬 Git 저장소를 GitHub에 업로드하여 원격 협업과 CI/CD를 가능하게 합니다.

## 🎯 작업 내용

- [ ] GitHub에서 새 저장소 생성
- [ ] 저장소 설명 추가
- [ ] Public/Private 선택
- [ ] 원격 저장소 연결 (\`git remote add origin\`)
- [ ] GitHub에 푸시 (\`git push -u origin main\`)

## ✅ 인수 조건

- [ ] GitHub 저장소가 생성됨
- [ ] 로컬 코드가 GitHub에 푸시됨
- [ ] 저장소 README가 표시됨
- [ ] 모든 파일이 올바르게 업로드됨

## 📚 참고 자료

- [GIT_COMMIT_GUIDE.md](../GIT_COMMIT_GUIDE.md)

## ⏱️ 예상 시간

10분"

gh issue create \
  --title "[Phase 1.3] GitHub Secrets Configuration" \
  --label "phase-1,priority-p0,deployment,config" \
  --body "## 📋 작업 배경

API 키를 안전하게 관리하고 GitHub Actions에서 사용하기 위해 GitHub Secrets를 설정합니다.

## 🎯 작업 내용

- [ ] Settings → Secrets and variables → Actions로 이동
- [ ] \`ALPHA_VANTAGE_API_KEY\` 추가 (선택사항)
- [ ] \`TWELVE_DATA_API_KEY\` 추가 (선택사항)
- [ ] \`VITE_NEWS_API_KEY\` 추가 (선택사항)
- [ ] Secrets 저장 확인

## ✅ 인수 조건

- [ ] 모든 필요한 Secrets가 추가됨
- [ ] Secret 이름이 정확함
- [ ] Secret 값이 올바르게 저장됨

## 📚 참고 자료

- [DEPLOYMENT_GUIDE.md](../DEPLOYMENT_GUIDE.md)
- [.env.example](../.env.example)

## ⏱️ 예상 시간

15분

## 💡 참고

현재는 Mock 데이터를 사용하므로 API 키 없이도 앱이 작동합니다."

gh issue create \
  --title "[Phase 1.4] GitHub Pages Activation" \
  --label "phase-1,priority-p0,deployment" \
  --body "## 📋 작업 배경

GitHub Pages를 활성화하여 웹 애플리케이션을 자동으로 배포합니다.

## 🎯 작업 내용

- [ ] Settings → Pages로 이동
- [ ] Source를 'GitHub Actions'로 선택
- [ ] 설정 저장
- [ ] Pages 활성화 확인

## ✅ 인수 조건

- [ ] GitHub Pages가 활성화됨
- [ ] Source가 'GitHub Actions'로 설정됨
- [ ] 배포 URL이 생성됨

## 📚 참고 자료

- [DEPLOYMENT_GUIDE.md](../DEPLOYMENT_GUIDE.md)

## ⏱️ 예상 시간

10분"

gh issue create \
  --title "[Phase 1.5] First Deployment Verification" \
  --label "phase-1,priority-p0,deployment,testing" \
  --body "## 📋 작업 배경

첫 배포가 성공적으로 완료되었는지 확인하고 배포된 애플리케이션을 테스트합니다.

## 🎯 작업 내용

- [ ] Actions 탭에서 워크플로우 모니터링
- [ ] 빌드 로그 확인
- [ ] 배포 완료 대기
- [ ] 배포된 URL 접속
- [ ] 기본 기능 테스트

## ✅ 인수 조건

- [ ] 워크플로우가 성공적으로 완료됨
- [ ] 애플리케이션이 \`https://USERNAME.github.io/commodity-tracker/\`에서 접근 가능
- [ ] 대시보드가 정상적으로 로드됨
- [ ] 콘솔 에러가 없음
- [ ] 기본 기능(검색, 필터)이 작동함

## 📚 참고 자료

- [DEPLOYMENT_CHECKLIST.md](../DEPLOYMENT_CHECKLIST.md)

## ⏱️ 예상 시간

10분"

echo -e "${GREEN}Phase 1 issues created!${NC}"
echo ""

# Phase 2: Bug Fixes
echo -e "${GREEN}Creating Phase 2 issues...${NC}"

gh issue create \
  --title "[Phase 2.1] Browser Console Investigation" \
  --label "phase-2,priority-p0,bug" \
  --body "## 📋 작업 배경

현재 웹 애플리케이션이 화면에 표시되지 않는 문제가 있습니다. 브라우저 콘솔을 통해 원인을 파악해야 합니다.

## 🎯 작업 내용

- [ ] 브라우저 DevTools 열기 (F12)
- [ ] Console 탭에서 에러 확인
- [ ] Network 탭에서 실패한 요청 확인
- [ ] 에러 스크린샷 저장
- [ ] 근본 원인 파악

## ✅ 인수 조건

- [ ] 모든 에러가 문서화됨
- [ ] 에러 스크린샷이 저장됨
- [ ] 근본 원인이 파악됨
- [ ] 수정 방안이 결정됨

## 📚 참고 자료

- [ROADMAP.md - Phase 2.1](../ROADMAP.md#21-browser-console-investigation-30-min)

## ⏱️ 예상 시간

30분"

gh issue create \
  --title "[Phase 2.2] Fix Application Display Issue" \
  --label "phase-2,priority-p0,bug" \
  --body "## 📋 작업 배경

Phase 2.1에서 파악한 에러를 수정하여 애플리케이션이 정상적으로 표시되도록 합니다.

## 🎯 작업 내용

- [ ] JavaScript 번들 에러 수정
- [ ] Import 경로 문제 해결
- [ ] TypeScript 컴파일 에러 수정
- [ ] 모든 의존성 로드 확인
- [ ] Hot Module Replacement 테스트
- [ ] 브라우저 캐시 클리어 후 재테스트

## ✅ 인수 조건

- [ ] 애플리케이션이 화면에 표시됨
- [ ] 콘솔 에러가 없음
- [ ] 모든 컴포넌트가 렌더링됨
- [ ] Hot reload가 작동함

## 📚 참고 자료

- Issue #[Phase 2.1 번호]

## ⏱️ 예상 시간

1-2시간"

gh issue create \
  --title "[Phase 2.3] Cross-Browser Testing" \
  --label "phase-2,priority-p0,testing" \
  --body "## 📋 작업 배경

다양한 브라우저에서 애플리케이션이 정상적으로 작동하는지 확인합니다.

## 🎯 작업 내용

- [ ] Chrome에서 테스트
- [ ] Firefox에서 테스트
- [ ] Safari에서 테스트
- [ ] Edge에서 테스트
- [ ] 브라우저별 이슈 문서화

## ✅ 인수 조건

- [ ] 모든 주요 브라우저에서 테스트 완료
- [ ] 브라우저별 이슈가 문서화됨
- [ ] 크리티컬한 이슈가 없음

## ⏱️ 예상 시간

30분"

gh issue create \
  --title "[Phase 2.4] Responsive Design Check" \
  --label "phase-2,priority-p0,testing,ui" \
  --body "## 📋 작업 배경

모바일, 태블릿, 데스크톱 등 다양한 화면 크기에서 레이아웃이 올바르게 표시되는지 확인합니다.

## 🎯 작업 내용

- [ ] 모바일 뷰 테스트 (< 768px)
- [ ] 태블릿 뷰 테스트 (768px - 1024px)
- [ ] 데스크톱 뷰 테스트 (> 1024px)
- [ ] 레이아웃 이슈 수정
- [ ] 터치 인터랙션 확인

## ✅ 인수 조건

- [ ] 모든 화면 크기에서 레이아웃이 올바름
- [ ] 텍스트가 읽기 쉬움
- [ ] 버튼과 인터랙티브 요소가 터치하기 쉬움
- [ ] 가로/세로 모드 모두 지원

## ⏱️ 예상 시간

30분"

echo -e "${GREEN}Phase 2 issues created!${NC}"
echo ""

# Phase 3: Core Logic Testing
echo -e "${GREEN}Creating Phase 3 issues...${NC}"

gh issue create \
  --title "[Phase 3.1] Testing Infrastructure Setup" \
  --label "phase-3,priority-p1,testing,infrastructure" \
  --body "## 📋 작업 배경

코어 로직에 대한 TDD를 시작하기 위해 테스팅 인프라를 구축합니다.

## 🎯 작업 내용

- [ ] \`@vitest/coverage-v8\` 설치
- [ ] \`vitest.config.ts\`에 커버리지 임계값 설정
- [ ] 테스트 파일 구조 생성
- [ ] 테스트 유틸리티 및 헬퍼 작성
- [ ] CI에서 테스트 실행 설정

## ✅ 인수 조건

- [ ] \`npm run test\` 명령어가 작동함
- [ ] \`npm run test:coverage\` 명령어가 작동함
- [ ] 커버리지 리포트가 생성됨
- [ ] CI에서 테스트가 자동 실행됨

## 📚 참고 자료

- [.agent/rules/TDD.md](../.agent/rules/TDD.md)
- [docs/TESTING_STRATEGY.md](../docs/TESTING_STRATEGY.md)

## ⏱️ 예상 시간

1시간"

gh issue create \
  --title "[Phase 3.2] Write Tests for Formatters" \
  --label "phase-3,priority-p1,testing,tdd" \
  --body "## 📋 작업 배경

\`src/utils/formatters.ts\`의 모든 함수에 대한 단위 테스트를 작성합니다. TDD 원칙을 따라 이미 작성된 코드에 대한 테스트를 추가합니다.

## 🎯 작업 내용

### formatCurrency 테스트
- [ ] USD 포맷팅
- [ ] KRW 포맷팅
- [ ] 음수 값 처리
- [ ] 0 값 처리
- [ ] 매우 큰 숫자 처리

### formatPercent 테스트
- [ ] 양수 퍼센트
- [ ] 음수 퍼센트
- [ ] 0 퍼센트

### formatLargeNumber 테스트
- [ ] 천 단위 (K)
- [ ] 백만 단위 (M)
- [ ] 십억 단위 (B)
- [ ] 조 단위 (T)

### 기타 함수 테스트
- [ ] formatDate
- [ ] formatRelativeTime
- [ ] getChangeColor
- [ ] getTrendIcon

## ✅ 인수 조건

- [ ] 모든 함수에 대한 테스트 작성 완료
- [ ] 모든 테스트가 통과함
- [ ] formatters.ts의 커버리지가 80% 이상
- [ ] 엣지 케이스가 모두 테스트됨

## 📚 참고 자료

- [src/utils/formatters.ts](../src/utils/formatters.ts)
- [ROADMAP.md - Phase 3.2](../ROADMAP.md#32-write-unit-tests-for-utilities-core-logic)

## ⏱️ 예상 시간

2시간"

gh issue create \
  --title "[Phase 3.3] Write Tests for API Services" \
  --label "phase-3,priority-p1,testing,tdd" \
  --body "## 📋 작업 배경

API 서비스 레이어의 모든 함수에 대한 테스트를 작성합니다. axios를 모킹하여 실제 API 호출 없이 테스트합니다.

## 🎯 작업 내용

### fetchAllCommodities 테스트
- [ ] 성공 응답 처리
- [ ] 에러 핸들링
- [ ] 데이터 변환 로직

### fetchCommodityDetails 테스트
- [ ] 유효한 ID로 조회
- [ ] 유효하지 않은 ID 처리
- [ ] 에러 핸들링

### fetchPriceHistory 테스트
- [ ] 1D 타임프레임
- [ ] 1W 타임프레임
- [ ] 1M 타임프레임
- [ ] 데이터 포맷 검증
- [ ] API 에러 인터셉터

## ✅ 인수 조건

- [ ] 모든 API 함수에 대한 테스트 작성
- [ ] axios가 올바르게 모킹됨
- [ ] 모든 테스트가 통과함
- [ ] API 서비스의 커버리지가 80% 이상

## 📚 참고 자료

- [src/services/api/commodities.ts](../src/services/api/commodities.ts)

## ⏱️ 예상 시간

3시간"

gh issue create \
  --title "[Phase 3.4] Write Tests for State Management" \
  --label "phase-3,priority-p1,testing,tdd" \
  --body "## 📋 작업 배경

Zustand 상태 관리 스토어의 모든 액션과 셀렉터에 대한 테스트를 작성합니다.

## 🎯 작업 내용

### watchlistStore 테스트
- [ ] addToWatchlist - 아이템 추가
- [ ] addToWatchlist - 중복 방지
- [ ] removeFromWatchlist - 아이템 제거
- [ ] removeFromWatchlist - 존재하지 않는 아이템 처리
- [ ] toggleWatchlist - 추가 동작
- [ ] toggleWatchlist - 제거 동작
- [ ] isInWatchlist - true/false 반환
- [ ] clearWatchlist - 목록 비우기
- [ ] localStorage 영속성
- [ ] 스토어 초기화

## ✅ 인수 조건

- [ ] 모든 스토어 액션에 대한 테스트 작성
- [ ] localStorage 모킹 및 테스트
- [ ] 모든 테스트가 통과함
- [ ] 스토어의 커버리지가 100%

## 📚 참고 자료

- [src/store/watchlistStore.ts](../src/store/watchlistStore.ts)

## ⏱️ 예상 시간

2시간"

gh issue create \
  --title "[Phase 3.5] Achieve 80% Code Coverage" \
  --label "phase-3,priority-p1,testing,coverage" \
  --body "## 📋 작업 배경

코어 로직의 코드 커버리지 목표인 80%를 달성합니다.

## 🎯 작업 내용

- [ ] 커버리지 리포트 실행
- [ ] 커버되지 않은 코드 식별
- [ ] 누락된 테스트 작성
- [ ] 전체 커버리지 80% 달성
- [ ] 크리티컬 패스 100% 커버리지 달성
- [ ] HTML 커버리지 리포트 생성
- [ ] 커버리지 결과 문서화

## ✅ 인수 조건

- [ ] 코어 로직 커버리지 ≥ 80%
- [ ] 크리티컬 패스 커버리지 = 100%
- [ ] 모든 테스트가 통과함
- [ ] 커버리지 리포트가 생성됨

## 📚 참고 자료

- [docs/TESTING_STRATEGY.md](../docs/TESTING_STRATEGY.md)

## ⏱️ 예상 시간

2시간

## 💡 참고

UI 컴포넌트는 커버리지에서 제외됩니다."

echo -e "${GREEN}Phase 3 issues created!${NC}"
echo ""

echo -e "${BLUE}=================================================="
echo "✅ GitHub issues created successfully!"
echo "=================================================="
echo ""
echo "Next steps:"
echo "1. Review issues on GitHub"
echo "2. Assign issues to team members"
echo "3. Start working on Phase 1"
echo ""
