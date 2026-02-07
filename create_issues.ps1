
$owner = "sungho-moon13"
$repo = "face-recognition-dashboard"

# Define Milestones and their tasks
$milestones = @(
    @{
        Title = "마일스톤 1: 프로젝트 설정 및 환경 구축 (Project Setup & Environment)"
        Description = "목표: 개발 환경을 설정하고 프로젝트 구조를 잡습니다."
        Tasks = @(
            "Git 리포지토리 초기화 및 GitHub 연결",
            "Python 가상 환경 생성 및 requirements.txt 작성",
            "프로젝트 디렉터리 구조 정의 (src, docs, tests 등)",
            "프로젝트 개요가 포함된 초기 README.md 작성",
            "Python 및 민감 정보를 위한 .gitignore 설정"
        )
    },
    @{
        Title = "마일스톤 2: 카메라 연동 (Camera Integration)"
        Description = "목표: Python을 사용하여 웹캠에서 비디오 스트림을 성공적으로 캡처합니다."
        Tasks = @(
            "카메라 액세스를 위한 Python 라이브러리 조사 (예: OpenCV, PyAV)",
            "비디오 프레임을 캡처하는 CameraStream 클래스 구현",
            "실시간 카메라 피드를 윈도우 창에 띄우는 간단한 스크립트 작성",
            "저지연(Low latency) 스트리밍 최적화 시작",
            "카메라 오류 및 연결 끊김 예외 처리"
        )
    },
    @{
        Title = "마일스톤 3: 머신러닝 모델 통합 (Machine Learning Model Integration)"
        Description = "목표: Hugging Face의 사전 학습된 얼굴 인식 모델을 통합합니다."
        Tasks = @(
            "Hugging Face에서 모델 조사 (예: face-detection, face-recognition)",
            "requirements.txt에 transformers, torch 등 필요한 의존성 추가",
            "이미지를 로드하고 추론을 실행하는 FaceModel 클래스 구현",
            "샘플 이미지에서 모델 로드 및 얼굴 감지 테스트를 위한 단위 테스트(Unit tests) 작성",
            "모델 추론 속도 최적화 (필요시 양자화 등)"
        )
    },
    @{
        Title = "마일스톤 4: 핵심 로직 통합 (Core Logic Integration)"
        Description = "목표: 카메라 피드와 ML 모델을 결합하여 실시간으로 얼굴을 감지합니다."
        Tasks = @(
            "처리 파이프라인 생성: 프레임 캡처 -> 얼굴 감지 -> 바운딩 박스 그리기",
            "비디오 스트림을 처리하는 메인 루프 구현",
            "비디오 피드가 지나치게 지연되지 않도록 감지 로직 효율화",
            "감지 이벤트에 대한 로깅(Logging) 추가"
        )
    },
    @{
        Title = "마일스톤 5: 웹 대시보드 개발 (Web Dashboard Development)"
        Description = "목표: 카메라 피드와 감지 결과를 볼 수 있는 웹 인터페이스를 만듭니다."
        Tasks = @(
            "웹 프레임워크 선택 (Streamlit 또는 Flask)",
            "기본 웹 서버 구조 설정",
            "웹 브라우저로 비디오 스트리밍 구현 (예: MJPEG 스트림)",
            "통계(예: 감지된 얼굴 수)를 보여주는 대시보드 레이아웃 생성",
            "카메라 시작/중지 또는 모델 설정을 변경하는 제어 기능 추가"
        )
    },
    @{
        Title = "마일스톤 6: 문서화 및 최종 마무리 (Documentation & Final Polish)"
        Description = "목표: 배포/데모를 위해 프로젝트를 마무리합니다."
        Tasks = @(
            "README.md에 포괄적인 사용자 문서 작성",
            "코드 주석 및 Docstring 추가",
            "코드 정리 및 임시 파일 제거",
            "전체 애플리케이션 흐름에 대한 최종 테스트"
        )
    }
)

foreach ($m in $milestones) {
    Write-Host "Creating Milestone: $($m.Title)"
    
    # Create Milestone via API
    $milestone = gh api "repos/$owner/$repo/milestones" -f title="$($m.Title)" -f description="$($m.Description)" --method POST | ConvertFrom-Json
    
    if ($milestone) {
        Write-Host "Milestone created with number: $($milestone.number)"
        
        foreach ($task in $m.Tasks) {
            Write-Host "  Creating Issue: $task"
            gh issue create --title "$task" --body "$task - Part of $($m.Title)" --milestone "$($m.Title)" --repo "$owner/$repo"
        }
    } else {
        Write-Error "Failed to create milestone: $($m.Title)"
    }
}
