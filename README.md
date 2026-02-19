# 얼굴 인식 대시보드 (Face Recognition Dashboard)

[PRD.md](./PRD.md)를 기반으로 작성된 얼굴 인식 및 분석 시스템입니다.

## 기술 스택 (Tech Stack)
- **Frontend**: React + Vite
- **Backend**: FastAPI + Python (InsightFace)

## 프로젝트 구조 (Project Structure)
- `backend/`: FastAPI 애플리케이션 및 AI 모델 로직.
- `frontend/`: React 웹 애플리케이션.
- `docs/`: 프로젝트 문서.
- `tests/`: 테스트 코드.
- `PROJECT_PLAN.md`: 상세 프로젝트 계획.

## 시작하기 (Getting Started)

### Backend (Python/FastAPI)
1. 가상 환경 활성화:
   ```bash
   # Windows
   .\venv\Scripts\activate
   ```
2. 의존성 설치:
   ```bash
   pip install -r backend/requirements.txt
   ```
3. 서버 실행:
   ```bash
   uvicorn backend.main:app --reload
   ```
   서버는 `http://127.0.0.1:8000`에서 실행됩니다.

### Frontend (React/Vite)
1. 디렉토리 이동:
   ```bash
   cd frontend
   ```
2. 의존성 설치:
   ```bash
   npm install
   ```
3. 개발 서버 실행:
   ```bash
   npm run dev
   ```
   웹 앱은 `http://localhost:5173`에서 실행됩니다.
