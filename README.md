# 얼굴 인식 대시보드 (Face Recognition Dashboard)

[PRD.md](./PRD.md)를 기반으로 초기화된 프로젝트입니다.

## 프로젝트 구조 (Project Structure)
- `src/`: 소스 코드 디렉터리.
  - `src/camera/`: 카메라 캡처 로직.
  - `src/model/`: 얼굴 인식 모델 통합.
  - `src/web/`: 웹 애플리케이션 인터페이스.
  - `src/utils/`: 유틸리티 함수.
- `docs/`: 프로젝트 문서.
- `tests/`: 단위 및 통합 테스트.
- `PROJECT_PLAN.md`: 상세 프로젝트 계획 및 GitHub 마일스톤.

## 사용 방법 (Usage)
1.  의존성 설치: `pip install -r requirements.txt`
2.  애플리케이션 실행: `python src/web/app.py`
