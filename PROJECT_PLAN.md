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

- [x] FastAPI 기본 서버 구축 및 `Hello World` 테스트. (완료)
- [x] InsightFace 라이브러리 연동 및 모델 로드. (완료 - buffalo_l 모델)
- [x] **이미지 분석 API 구현 (`POST /predict`)**: (완료)
    - 프론트엔드에서 전송된 이미지를 받아 얼굴 감지 및 식별 수행.
    - 바운딩 박스(Bounding Box) 좌표와 식별된 이름 반환.
- [x] **얼굴 등록 API 구현 (`POST /register`)**: (완료)
    - 이름과 사진(2장 이상 가능)을 받아 임베딩 벡터 추출 및 저장.
    - 한글 이름 깨짐 방지 처리 (UTF-8 인코딩 확인).
    - 다중 이미지 등록 API (`POST /register/multiple`) 추가.
- [x] 등록된 사용자 데이터 관리 (조회/수정/삭제). (완료)
    - `GET /api/users` - 전체 사용자 목록 조회
    - `GET /api/users/{name}` - 개별 사용자 조회
    - `PUT /api/users/{name}` - 사용자 이름 수정
    - `DELETE /api/users/{name}` - 사용자 삭제

## 마일스톤 3: 프론트엔드 개발 - UI 및 카메라 연동 (Frontend UI & Camera)
목표: React를 사용하여 웹 브라우저에서 카메라를 제어하고 백엔드와 통신합니다.

- [x] Vite를 이용한 React 프로젝트 초기화 및 스타일링 설정 (CSS). (완료 - 프리미엄 디자인 시스템)
- [x] **웹캠 연동**: (완료)
    - 브라우저의 `navigator.mediaDevices.getUserMedia` API 활용 (react-webcam).
    - 화면에 실시간 카메라 피드 표시.
- [x] **실시간 추론 연동**: (완료)
    - ~2FPS 간격으로 프레임을 캡처하여 백엔드 API로 전송.
    - 백엔드 응답(좌표, 이름)을 받아 캔버스(Canvas) 위에 오버레이(Overlay)로 그리기.
    - 바운딩 박스: 둥근 모서리 + 코너 강조 + 글로우 효과 + 이름 라벨.
- [x] UI 디자인 적용: (완료)
    - 현대적이고 직관적인 대시보드 레이아웃.
    - 다크 모드, glassmorphism, 스캔라인 애니메이션, 토스트 알림.

## 마일스톤 4: 얼굴 등록 및 관리 기능 (Registration & Management)
목표: 사용자 친화적인 얼굴 등록 절차를 구현합니다.

- [x] **얼굴 등록 모달 구현**: (완료)
    - 4단계 프로세스 (이름 -> 촬영 -> 리뷰 -> 업로드).
    - 브라우저 웹캠 촬영 및 로컬 파일 업로드 동시 지원.
    - 다중 이미지(여러 장) 등록으로 인식률 향상.
- [x] **등록된 사용자 목록 표시**: (완료)
    - 이름 이니셜 아바타 대신 실제 등록된 얼굴 **썸네일** 표시.
    - 등록된 사진 장수 및 최근 업데이트 날짜 표시.
- [x] **등록 프로세스 UX 최적화**: (완료)
    - 단계별 진행 상태 인디케이터 지원.
    - 등록 성공/실패 시 애니메이션 결과 화면 및 토스트 알림.
    - 등록 중 카메라 감지 자동 일시정지 처리.

## 마일스톤 5: 최적화 및 문서화 (Optimization & Documentation)
목표: 성능을 개선하고 배포 준비를 마칩니다.

- [x] **성능 최적화**: (완료)
    - 백엔드: Numpy 행렬 연산을 활용한 벡터화된 코사인 유사도 계산 적용 (대량 식별 속도 최적화).
    - 프론트엔드: FPS 카운터 적용 및 최적화된 프레임 캡처 주기(2FPS) 설정.
- [x] 코드 리팩토링 및 주석 작성. (완료)
- [x] **README.md 업데이트**: (완료)
    - 설치 스텝, 실행 가이드, 기술 스택, API 명세, 아키텍처 구조 설명 포함.
- [x] GitHub Issues 및 마일스톤 정리. (완료)

---
**🎉 얼굴 인식 대시보드 프로젝트가 성공적으로 완료되었습니다!**

