# 🎃 DevJack Blog

Java & Kotlin 백엔드 개발자 박종혁의 개인 기술 블로그입니다.

## 📝 소개

이 블로그는 React와 Supabase를 활용하여 구축된 개인 기술 블로그입니다. 백엔드 개발 경험과 학습 내용을 공유하며, 포트폴리오와 프로젝트 경험을 소개합니다.

## 🛠 기술 스택

### Frontend
- ⚛️ **React** 19.0
- 🎨 **Material-UI (MUI)** - UI 컴포넌트 라이브러리
- 🧭 **React Router** - 라우팅
- 📄 **React Markdown** - 마크다운 렌더링
- 🧮 **KaTeX** - 수식 렌더링
- 📊 **Mermaid** - 글 안의 다이어그램 렌더링
- ✏️ **@uiw/react-md-editor** - 마크다운 에디터
- 🎬 **Framer Motion** - 애니메이션

### Database & Services
- 🗄️ **Supabase** - BaaS (Backend as a Service)
  - 🐘 PostgreSQL - 데이터베이스
  - 🔐 Authentication - GitHub OAuth 인증
  - 📦 Storage - 이미지 업로드 및 관리

### 배포
- 🚀 **GitHub Pages** - 정적 사이트 호스팅
- ⚙️ **GitHub Actions** - CI/CD 자동 배포
- 🤖 **Puppeteer** - 빌드 뒤 모든 페이지를 미리 렌더링(프리렌더)해 검색엔진이 본문을 읽게 함

## 🚢 배포 정보

- 🌐 **배포 URL**: https://devtaco30.github.io/blog
- 🔄 **배포 방식**: master에 push하면 GitHub Actions가 빌드 → 프리렌더(`npm run prerender`) → GitHub Pages 배포 순으로 자동 실행
