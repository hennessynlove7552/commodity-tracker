# GitHub Pages 배포 가이드

## 📋 사전 준비

### 1. GitHub 저장소 생성

1. GitHub에서 새 저장소 생성
2. 저장소 이름: `commodity-tracker` (또는 원하는 이름)
3. Public 또는 Private 선택

### 2. 로컬 프로젝트 Git 초기화

```bash
cd /Users/leehyunzu/Downloads/stitch_\ 7/commodity-tracker

# Git 초기화
git init

# 모든 파일 추가
git add .

# 첫 커밋
git commit -m "Initial commit: Commodity Price Tracker MVP"

# 기본 브랜치를 main으로 설정
git branch -M main

# 원격 저장소 연결 (YOUR_USERNAME를 실제 GitHub 사용자명으로 변경)
git remote add origin https://github.com/YOUR_USERNAME/commodity-tracker.git

# 푸시
git push -u origin main
```

## 🔑 GitHub Secrets 설정

저장소에 API 키를 안전하게 저장합니다.

1. GitHub 저장소 페이지로 이동
2. **Settings** → **Secrets and variables** → **Actions** 클릭
3. **New repository secret** 버튼 클릭
4. 다음 3개의 Secret 추가:

### Secret 1: ALPHA_VANTAGE_API_KEY
- Name: `ALPHA_VANTAGE_API_KEY`
- Value: (Alpha Vantage API 키)
- 무료 키 발급: https://www.alphavantage.co/support/#api-key

### Secret 2: TWELVE_DATA_API_KEY
- Name: `TWELVE_DATA_API_KEY`
- Value: (Twelve Data API 키)
- 무료 키 발급: https://twelvedata.com/pricing

### Secret 3: NEWS_API_KEY
- Name: `VITE_NEWS_API_KEY`
- Value: (News API 키)
- 무료 키 발급: https://newsapi.org/register

> **참고**: 현재는 Mock 데이터를 사용하므로 API 키가 없어도 앱이 작동합니다. 
> 실제 API를 연동하려면 `src/services/api/commodities.ts` 파일의 주석을 해제하세요.

## 🚀 GitHub Pages 활성화

1. GitHub 저장소 페이지로 이동
2. **Settings** → **Pages** 클릭
3. **Source** 섹션에서:
   - Source: **GitHub Actions** 선택
4. 저장

## ✅ 배포 확인

### 자동 배포 트리거

`main` 브랜치에 푸시하면 자동으로 배포가 시작됩니다:

```bash
# 코드 수정 후
git add .
git commit -m "Update: 기능 추가"
git push
```

### 배포 상태 확인

1. GitHub 저장소의 **Actions** 탭 클릭
2. "Deploy to GitHub Pages" 워크플로우 확인
3. 진행 상황:
   - ✅ Checkout
   - ✅ Setup Node.js
   - ✅ Install dependencies
   - ✅ Lint
   - ✅ Type check
   - ✅ Test
   - ✅ Build
   - ✅ Deploy to GitHub Pages

### 배포된 사이트 접속

배포가 완료되면 다음 URL에서 접속 가능:

```
https://YOUR_USERNAME.github.io/commodity-tracker/
```

## 🔧 Vite 설정 확인

`vite.config.ts`의 `base` 경로가 저장소 이름과 일치하는지 확인:

```typescript
export default defineConfig({
  base: '/commodity-tracker/', // 저장소 이름과 동일해야 함
  // ...
});
```

만약 저장소 이름을 다르게 설정했다면:

```typescript
export default defineConfig({
  base: '/your-repo-name/', // 실제 저장소 이름으로 변경
  // ...
});
```

## 🎯 배포 워크플로우

### 1. Deploy Workflow (deploy.yml)
- **트리거**: `main` 브랜치에 푸시 시
- **작업**:
  1. 코드 체크아웃
  2. Node.js 설정
  3. 의존성 설치
  4. Lint 검사
  5. 타입 체크
  6. 테스트 실행
  7. 프로덕션 빌드
  8. GitHub Pages 배포

### 2. PR Check Workflow (pr-check.yml)
- **트리거**: Pull Request 생성 시
- **작업**:
  1. 코드 체크아웃
  2. Node.js 설정
  3. 의존성 설치
  4. Lint 검사
  5. 타입 체크
  6. 테스트 실행 (커버리지 포함)
  7. 빌드 검증

## 🐛 문제 해결

### 배포 실패 시

1. **Actions 탭에서 에러 로그 확인**
   - 빌드 에러: TypeScript 타입 오류 확인
   - Lint 에러: ESLint 규칙 위반 확인

2. **로컬에서 빌드 테스트**
   ```bash
   npm run type-check
   npm run lint
   npm run build
   ```

3. **API 키 확인**
   - GitHub Secrets에 올바르게 설정되었는지 확인
   - Secret 이름이 정확한지 확인

### 404 에러 발생 시

1. **base 경로 확인**
   - `vite.config.ts`의 `base` 값이 저장소 이름과 일치하는지 확인

2. **GitHub Pages 설정 확인**
   - Settings → Pages에서 Source가 "GitHub Actions"로 설정되었는지 확인

3. **브라우저 캐시 삭제**
   - 하드 리프레시: `Cmd + Shift + R` (Mac) 또는 `Ctrl + Shift + R` (Windows)

## 📊 배포 후 확인사항

- [ ] 페이지가 정상적으로 로드되는가?
- [ ] 다크 테마가 적용되었는가?
- [ ] 원자재 카드들이 표시되는가?
- [ ] 검색 기능이 작동하는가?
- [ ] 카테고리 필터가 작동하는가?
- [ ] 관심 목록 추가/제거가 작동하는가?
- [ ] 모바일에서도 정상 작동하는가?

## 🔄 업데이트 배포

코드 수정 후 배포:

```bash
# 수정 사항 커밋
git add .
git commit -m "feat: 새로운 기능 추가"

# 푸시 (자동으로 배포 시작)
git push
```

## 🌐 커스텀 도메인 설정 (선택사항)

1. Settings → Pages → Custom domain
2. 도메인 입력 (예: `commodities.example.com`)
3. DNS 설정:
   ```
   Type: CNAME
   Name: commodities
   Value: YOUR_USERNAME.github.io
   ```

---

**배포 완료 후 URL**: `https://YOUR_USERNAME.github.io/commodity-tracker/`

**문제가 발생하면**: GitHub Actions 탭에서 로그를 확인하거나 이슈를 생성하세요.
