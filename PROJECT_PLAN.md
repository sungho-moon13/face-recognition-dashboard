# 얼굴 인식 대시보드 프로젝트 계획 (Face Recognition Dashboard Project Plan)

이 문서는 `PRD.md`를 바탕으로 얼굴 인식 대시보드 애플리케이션의 개발 계획과 마일스톤을 정의합니다.

## 기술 스택 (Tech Stack)
- **Frontend**: React, Vite
- **Backend**: Python, FastAPI
- **AI/ML**: InsightFace (Face Analysis), PyTorch/ONNX Runtime
- **Database/Storage**: 로컬 파일 시스템 또는 SQLite (등록된 얼굴 데이터 저장)

## 마일스톤 1: 프로젝트 설정 및 환경 구축 (Project Setup)
목표: 개발 환경을 설정하고 기본 프로젝트 구조를 잡습니다.

- [x] Git 리포지토리 초기화 및 GitHub 연결. (완료)
- [x] Python 가상 환경 생성 및 `requirements.txt` 작성. (완료)
- [x] 프로젝트 폴더 구조 정의. (완료)
- [x] Frontend 프로젝트 생성 (Vite + React). (완료)
- [x] Backend 프로젝트 구조 설정 (FastAPI). (완료)

## 마일스톤 2: 백엔드 개발 - 핵심 기능 (Backend Core)
목표: FastAPI와 InsightFace를 사용하여 얼굴 인식 및 등록 API를 구축합니다.

- [ ] FastAPI 기본 서버 구축 및 `Hello World` 테스트.
- [ ] InsightFace 라이브러리 연동 및 모델 로드.
- [ ] **이미지 분석 API 구현 (`POST /predict`)**:
    - 프론트엔드에서 전송된 이미지를 받아 얼굴 감지 및 식별 수행.
    - 바운딩 박스(Bounding Box) 좌표와 식별된 이름 반환.
- [ ] **얼굴 등록 API 구현 (`POST /register`)**:
    - 이름과 사진(2장 이상 가능)을 받아 임베딩 벡터 추출 및 저장.
    - 한글 이름 깨짐 방지 처리 (UTF-8 인코딩 확인).
- [ ] 등록된 사용자 데이터 관리 (조회/수정/삭제).

## 마일스톤 3: 프론트엔드 개발 - UI 및 카메라 연동 (Frontend UI & Camera)
목표: React를 사용하여 웹 브라우저에서 카메라를 제어하고 백엔드와 통신합니다.

- [ ] Vite를 이용한 React 프로젝트 초기화 및 스타일링 설정 (CSS).
- [ ] **웹캠 연동**:
    - 브라우저의 `navigator.mediaDevices.getUserMedia` API 활용.
    - 화면에 실시간 카메라 피드 표시.
- [ ] **실시간 추론 연동**:
    - 일정 간격(예: 30FPS 또는 성능에 맞춰 조절)으로 프레임을 캡처하여 백엔드 API로 전송.
    - 백엔드 응답(좌표, 이름)을 받아 캔버스(Canvas) 위에 오버레이(Overlay)로 그리기.
- [ ] UI 디자인 적용:
    - 현대적이고 직관적인 대시보드 레이아웃.

## 마일스톤 4: 얼굴 등록 및 관리 기능 (Registration & Management)
목표: 사용자 친화적인 얼굴 등록 절차를 구현합니다.

- [ ] **얼굴 등록 모달/페이지 구현**:
    - 이름 입력 필드 (한글 지원).
    - 사진 캡처 및 업로드 UI (여러 장 등록 지원).
- [ ] 등록된 사용자 목록 표시 (이름, 썸네일).
- [ ] 등록 프로세스 UX 최적화 (등록 성공/실패 알림).

## 마일스톤 5: 최적화 및 문서화 (Optimization & Documentation)
목표: 성능을 개선하고 배포 준비를 마칩니다.

- [ ] **성능 최적화**:
    - 백엔드 추론 속도 개선 (ONNX Runtime 활용 등).
    - 프론트엔드 전송 주기 조절 (네트워크 부하 관리).
- [ ] 코드 리팩토링 및 주석 작성.
- [ ] **README.md 업데이트**: 실행 방법, API 명세, 설치 가이드.
- [ ] GitHub Issues 및 마일스톤 정리.
