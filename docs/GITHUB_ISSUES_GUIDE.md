# GitHub Issues 생성 가이드

## 📋 개요

이 가이드는 프로젝트의 모든 태스크를 GitHub Issues로 등록하는 방법을 설명합니다.

## 🚀 빠른 시작

### 1. GitHub CLI 설치 확인

```bash
# GitHub CLI 설치 여부 확인
gh --version

# 설치되지 않은 경우
brew install gh  # macOS
```

### 2. GitHub 인증

```bash
# GitHub에 로그인
gh auth login

# 인증 상태 확인
gh auth status
```

### 3. GitHub 저장소 생성

먼저 GitHub에 저장소를 생성해야 합니다:

```bash
# 현재 디렉토리에서 GitHub 저장소 생성
gh repo create commodity-tracker --public --source=. --remote=origin

# 또는 웹에서 수동으로 생성 후
git remote add origin https://github.com/YOUR_USERNAME/commodity-tracker.git
git push -u origin main
```

### 4. Issues 생성 스크립트 실행

```bash
# 스크립트 실행 권한 부여 (이미 완료됨)
chmod +x scripts/create-github-issues.sh

# 스크립트 실행
./scripts/create-github-issues.sh
```

## 📝 생성되는 Issues

스크립트는 다음 Phase의 Issues를 생성합니다:

### Phase 1: Initial Deployment (5개 이슈)
1. **[Phase 1.1] Git Repository Setup**
   - Git 초기화 및 첫 커밋
   - 예상 시간: 15분

2. **[Phase 1.2] GitHub Repository Creation and Push**
   - GitHub 저장소 생성 및 푸시
   - 예상 시간: 10분

3. **[Phase 1.3] GitHub Secrets Configuration**
   - API 키 설정
   - 예상 시간: 15분

4. **[Phase 1.4] GitHub Pages Activation**
   - GitHub Pages 활성화
   - 예상 시간: 10분

5. **[Phase 1.5] First Deployment Verification**
   - 배포 확인 및 테스트
   - 예상 시간: 10분

### Phase 2: Bug Fixes (4개 이슈)
1. **[Phase 2.1] Browser Console Investigation**
2. **[Phase 2.2] Fix Application Display Issue**
3. **[Phase 2.3] Cross-Browser Testing**
4. **[Phase 2.4] Responsive Design Check**

### Phase 3: Core Logic Testing (5개 이슈)
1. **[Phase 3.1] Testing Infrastructure Setup**
2. **[Phase 3.2] Write Tests for Formatters**
3. **[Phase 3.3] Write Tests for API Services**
4. **[Phase 3.4] Write Tests for State Management**
5. **[Phase 3.5] Achieve 80% Code Coverage**

## 📋 Issue 구조

각 Issue는 다음 섹션을 포함합니다:

### 📋 작업 배경 (Background)
- 이 작업이 왜 필요한지 설명
- 프로젝트의 어떤 목표를 달성하는지

### 🎯 작업 내용 (Tasks)
- 구체적으로 수행할 작업 목록
- 체크박스 형태로 진행 상황 추적 가능

### ✅ 인수 조건 (Acceptance Criteria)
- 작업 완료 판단 기준
- 모든 조건이 충족되어야 완료

### 📚 참고 자료 (References)
- 관련 문서 링크
- 관련 Issue 링크

### ⏱️ 예상 시간 (Estimated Time)
- 작업 소요 예상 시간

## 🏷️ Labels

Issues는 다음 라벨로 분류됩니다:

- `phase-1`, `phase-2`, `phase-3` - Phase 구분
- `priority-p0`, `priority-p1`, `priority-p2` - 우선순위
- `deployment` - 배포 관련
- `testing` - 테스트 관련
- `bug` - 버그 수정
- `tdd` - TDD 작업
- `ui` - UI 관련

## 🔧 수동으로 Issue 생성하기

스크립트를 사용하지 않고 수동으로 생성하려면:

```bash
gh issue create \
  --title "[Phase X.Y] Task Title" \
  --label "phase-X,priority-pX" \
  --body "Issue 내용..."
```

또는 GitHub 웹 인터페이스에서:
1. Repository → Issues → New Issue
2. 템플릿 선택: "Phase Task"
3. 내용 작성 후 Submit

## 📊 Issue 관리

### Issue 확인
```bash
# 모든 Issue 보기
gh issue list

# 특정 라벨의 Issue 보기
gh issue list --label "phase-1"

# 열린 Issue만 보기
gh issue list --state open
```

### Issue 할당
```bash
# 자신에게 할당
gh issue develop <issue-number> --checkout

# 다른 사람에게 할당
gh issue edit <issue-number> --add-assignee username
```

### Issue 닫기
```bash
# Issue 완료
gh issue close <issue-number>

# 커밋과 함께 Issue 닫기
git commit -m "Fix: issue description

Closes #<issue-number>"
```

## 🎯 작업 순서

1. **Phase 1 Issues 먼저 완료**
   - 배포 인프라 구축이 최우선

2. **Phase 2 Issues 진행**
   - 버그 수정 및 안정화

3. **Phase 3 Issues 진행**
   - TDD로 코어 로직 테스트

4. **이후 Phase는 필요에 따라 생성**
   - Phase 4-8은 별도로 추가

## 💡 팁

- **Issue 번호 참조**: 커밋 메시지에 `#issue-number`를 포함하면 자동 링크
- **체크리스트 활용**: Issue 본문의 체크박스를 활용해 진행 상황 추적
- **라벨 활용**: 라벨로 필터링하여 작업 우선순위 파악
- **Milestone 설정**: Phase별로 Milestone을 만들어 관리

## 🔍 문제 해결

### GitHub CLI가 설치되지 않음
```bash
# macOS
brew install gh

# Windows
winget install GitHub.cli

# Linux
# https://github.com/cli/cli/blob/trunk/docs/install_linux.md
```

### 인증 실패
```bash
# 재인증
gh auth logout
gh auth login
```

### 저장소가 없음
```bash
# 저장소 생성
gh repo create commodity-tracker --public --source=.
```

## 📚 추가 자료

- [GitHub CLI 문서](https://cli.github.com/manual/)
- [GitHub Issues 가이드](https://docs.github.com/en/issues)
- [ROADMAP.md](../ROADMAP.md) - 전체 프로젝트 로드맵

---

**준비 완료!** 스크립트를 실행하여 모든 Issues를 생성하세요.
