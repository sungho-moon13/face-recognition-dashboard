# 🤖 Face Recognition Dashboard

실시간 AI 얼굴 인식 및 사용자 관리 대시보드입니다. **InsightFace** 아키텍처를 기반으로 하며, FastAPI 백엔드와 React(Vite) 프론트엔드로 구성되어 있습니다.

![Main Dashboard](https://img.shields.io/badge/AI-InsightFace-blueviolet) ![Backend](https://img.shields.io/badge/Backend-FastAPI-green) ![Frontend](https://img.shields.io/badge/Frontend-React-blue)

## ✨ 주요 기능

- **실시간 얼굴 감지 (Face Detection)**: 카메라 피드에서 실시간으로 얼굴을 찾고 바운딩 박스를 표시합니다.
- **얼굴 식별 (Face Recognition)**: 등록된 사용자와 비교하여 누구인지 식별합니다 (유사도 표시).
- **지능형 얼굴 등록**: 이름 입력과 함께 여러 각도의 사진을 촬영/업로드하여 사용자를 등록합니다.
- **사용자 관리**: 등록된 사용자 목록 조회, 썸네일 확인, 데이터 삭제 기능을 제공합니다.
- **프리미엄 UI/UX**: 다크 모드, Glassmorphism 디자인, 부드러운 애니메이션이 적용된 현대적인 인터페이스.

## 🛠 기술 스택

- **AI Model**: InsightFace (buffalo_l model pack)
- **Backend API**: Python, FastAPI, ONNX Runtime, OpenCV
- **Frontend**: React, Vite, Axios, React-Webcam
- **Styling**: Vanilla CSS (Modern Design System)

## 🚀 시작하기

### 1. 요구 사항
- Python 3.10 이상
- Node.js 18 이상

### 2. 백엔드 설정 및 실행
```bash
# 가상환경 활성화 (필요시)
.\venv\Scripts\activate

# 백엔드 이동
cd backend

# 서버 실행
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

### 3. 프론트엔드 설정 및 실행
```bash
# 프론트엔드 이동
cd frontend

# 의존성 설치 (최초 1회)
npm install

# 개발 서버 실행
npm run dev
```
이후 브라우저에서 `http://localhost:5173`에 접속합니다.

## 📡 API 명세 (API Endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/predict` | 이미지 전송 시 얼굴 감지 및 식별 결과 반환 |
| POST | `/api/register` | 이름과 단일 이미지로 사용자 등록 |
| POST | `/api/register/multiple` | 이름과 여러 장의 이미지로 사용자 등록 |
| GET | `/api/users` | 등록된 모든 사용자 목록 및 썸네일 조회 |
| DELETE | `/api/users/{name}` | 특정 사용자 정보 및 얼굴 서명 삭제 |

상세한 API 문서는 서버 실행 후 `http://127.0.0.1:8000/docs`에서 확인할 수 있습니다.

## 📁 프로젝트 구조

```text
├── backend/            # FastAPI 백엔드 소스 코드
│   ├── app/
│   │   ├── api/        # API 엔드포인트 정의
│   │   └── services/   # InsightFace 엔진 및 비즈니스 로직
│   └── data/           # 얼굴 임베딩 및 썸네일 데이터 저장소
├── frontend/           # React 프론트엔드 소스 코드
│   ├── src/
│   │   ├── components/ # React 컴포넌트 (Camera, Modal 등)
│   │   └── services/   # 백엔드 API 통신 로직
└── README.md           # 현재 문서
```

## ⚠️ 주의 사항
- 최초 실행 시 InsightFace 모델 다운로드로 인해 시간이 다소 소요될 수 있습니다.
- 원활한 인식을 위해 충분한 조명이 있는 환경에서 정면 사진을 등록하는 것이 좋습니다.
