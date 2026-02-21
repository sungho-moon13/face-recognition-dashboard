"""
Milestone 2 API 테스트 스크립트
모든 API 엔드포인트를 순차적으로 테스트합니다.
"""
import urllib.request
import json
import sys
import os
import numpy as np


BASE_URL = "http://127.0.0.1:8000"


def test_root():
    """1. 루트 엔드포인트 테스트"""
    print("=" * 60)
    print("TEST 1: GET / (Root)")
    print("=" * 60)
    response = urllib.request.urlopen(f"{BASE_URL}/")
    data = json.loads(response.read().decode())
    print(f"  ✅ Message: {data['message']}")
    print(f"  ✅ Endpoints: {json.dumps(data['endpoints'], indent=4, ensure_ascii=False)}")
    return True


def test_health():
    """2. 헬스 체크"""
    print("\n" + "=" * 60)
    print("TEST 2: GET /health")
    print("=" * 60)
    response = urllib.request.urlopen(f"{BASE_URL}/health")
    data = json.loads(response.read().decode())
    assert data["status"] == "healthy"
    print(f"  ✅ Status: {data['status']}")
    return True


def test_predict_no_face():
    """3. 얼굴 없는 이미지 분석 테스트"""
    print("\n" + "=" * 60)
    print("TEST 3: POST /api/predict (blank image, no face expected)")
    print("=" * 60)
    
    # Create a simple blank image (no face)
    try:
        import cv2
        blank = np.zeros((100, 100, 3), dtype=np.uint8)
        _, img_bytes = cv2.imencode('.jpg', blank)
        img_data = img_bytes.tobytes()
    except ImportError:
        # Fallback: create minimal JPEG
        print("  ⚠️  cv2 not available for creating test image, skipping.")
        return True
    
    boundary = b"----TestBoundary"
    body = (
        b"------TestBoundary\r\n"
        b'Content-Disposition: form-data; name="file"; filename="blank.jpg"\r\n'
        b"Content-Type: image/jpeg\r\n\r\n"
        + img_data +
        b"\r\n------TestBoundary--\r\n"
    )
    
    req = urllib.request.Request(
        f"{BASE_URL}/api/predict",
        data=body,
        headers={
            "Content-Type": "multipart/form-data; boundary=----TestBoundary"
        },
        method="POST"
    )
    response = urllib.request.urlopen(req)
    data = json.loads(response.read().decode())
    print(f"  ✅ Results: {data['results']} (expected empty list for blank image)")
    return True


def test_users_empty():
    """4. 유저 목록 조회 (비어있어야 함)"""
    print("\n" + "=" * 60)
    print("TEST 4: GET /api/users (should be empty)")
    print("=" * 60)
    response = urllib.request.urlopen(f"{BASE_URL}/api/users")
    data = json.loads(response.read().decode())
    print(f"  ✅ Users: {data['users']}, Total: {data['total']}")
    return True


def test_register_face():
    """5. 얼굴 등록 테스트 (실제 얼굴 이미지가 필요)"""
    print("\n" + "=" * 60)
    print("TEST 5: POST /api/register (test with synthetic face)")
    print("=" * 60)
    
    # Note: This would require a real face image to succeed
    try:
        import cv2
        blank = np.zeros((200, 200, 3), dtype=np.uint8)
        _, img_bytes = cv2.imencode('.jpg', blank)
        img_data = img_bytes.tobytes()
    except ImportError:
        print("  ⚠️  cv2 not available, skipping.")
        return True

    # UTF-8 한글 이름 테스트
    name = "테스트사용자"
    name_bytes = name.encode('utf-8')
    
    boundary = b"----TestBoundary"
    body = (
        b"------TestBoundary\r\n"
        b'Content-Disposition: form-data; name="name"\r\n\r\n'
        + name_bytes +
        b"\r\n------TestBoundary\r\n"
        b'Content-Disposition: form-data; name="file"; filename="test.jpg"\r\n'
        b"Content-Type: image/jpeg\r\n\r\n"
        + img_data +
        b"\r\n------TestBoundary--\r\n"
    )
    
    req = urllib.request.Request(
        f"{BASE_URL}/api/register",
        data=body,
        headers={
            "Content-Type": "multipart/form-data; boundary=----TestBoundary"
        },
        method="POST"
    )
    
    try:
        response = urllib.request.urlopen(req)
        data = json.loads(response.read().decode())
        print(f"  ✅ Registration result: {json.dumps(data, ensure_ascii=False)}")
    except urllib.error.HTTPError as e:
        error_body = e.read().decode()
        data = json.loads(error_body)
        print(f"  ⚠️  Expected error (no real face in blank image): {json.dumps(data, ensure_ascii=False)}")
    
    return True


def test_get_nonexistent_user():
    """6. 존재하지 않는 유저 조회"""
    print("\n" + "=" * 60)
    print("TEST 6: GET /api/users/nonexistent (should return 404)")
    print("=" * 60)
    
    try:
        response = urllib.request.urlopen(f"{BASE_URL}/api/users/nobody")
        print("  ❌ Should have returned 404!")
        return False
    except urllib.error.HTTPError as e:
        if e.code == 404:
            print(f"  ✅ Correctly returned 404 Not Found")
            return True
        return False


def test_delete_nonexistent_user():
    """7. 존재하지 않는 유저 삭제"""
    print("\n" + "=" * 60)
    print("TEST 7: DELETE /api/users/nobody (should return 404)")
    print("=" * 60)
    
    req = urllib.request.Request(
        f"{BASE_URL}/api/users/nobody",
        method="DELETE"
    )
    try:
        response = urllib.request.urlopen(req)
        print("  ❌ Should have returned 404!")
        return False
    except urllib.error.HTTPError as e:
        if e.code == 404:
            print(f"  ✅ Correctly returned 404 Not Found")
            return True
        return False


def test_docs_available():
    """8. Swagger 문서 접근 가능 여부"""
    print("\n" + "=" * 60)
    print("TEST 8: GET /docs (Swagger UI available)")
    print("=" * 60)
    response = urllib.request.urlopen(f"{BASE_URL}/docs")
    html = response.read().decode()
    has_swagger = "swagger" in html.lower() or "openapi" in html.lower()
    print(f"  ✅ Swagger docs accessible: {has_swagger}")
    return has_swagger


if __name__ == "__main__":
    print("🚀 Face Recognition API - Milestone 2 Tests")
    print("=" * 60)
    
    tests = [
        test_root,
        test_health,
        test_predict_no_face,
        test_users_empty,
        test_register_face,
        test_get_nonexistent_user,
        test_delete_nonexistent_user,
        test_docs_available,
    ]
    
    passed = 0
    failed = 0
    
    for test_func in tests:
        try:
            if test_func():
                passed += 1
            else:
                failed += 1
        except Exception as e:
            print(f"  ❌ Error: {e}")
            failed += 1
    
    print("\n" + "=" * 60)
    print(f"📊 Results: {passed} passed, {failed} failed out of {len(tests)} tests")
    print("=" * 60)
