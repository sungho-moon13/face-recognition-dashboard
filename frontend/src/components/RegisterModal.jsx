import React, { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { registerMultipleFaces } from '../services/api';

const videoConstraints = {
    width: 640,
    height: 480,
    facingMode: 'user',
};

const RegisterModal = ({ isOpen, onClose, onSuccess, onToast }) => {
    const [step, setStep] = useState(1); // 1: name, 2: capture, 3: review, 4: uploading
    const [name, setName] = useState('');
    const [capturedImages, setCapturedImages] = useState([]); // array of {src: base64, blob: Blob}
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [result, setResult] = useState(null);
    const webcamRef = useRef(null);
    const fileInputRef = useRef(null);

    const resetModal = useCallback(() => {
        setStep(1);
        setName('');
        setCapturedImages([]);
        setIsSubmitting(false);
        setResult(null);
    }, []);

    const handleClose = () => {
        resetModal();
        onClose();
    };

    // Step 1 → Step 2
    const handleNameSubmit = () => {
        if (!name.trim()) {
            onToast?.({ type: 'error', message: '이름을 입력해주세요.' });
            return;
        }
        setStep(2);
    };

    // Capture from webcam
    const handleCapture = () => {
        if (!webcamRef.current) return;
        const imageSrc = webcamRef.current.getScreenshot();
        if (!imageSrc) return;

        // Convert base64 to blob
        fetch(imageSrc)
            .then((res) => res.blob())
            .then((blob) => {
                setCapturedImages((prev) => [
                    ...prev,
                    { src: imageSrc, blob, source: 'camera' },
                ]);
            });
    };

    // Upload from file
    const handleFileUpload = (e) => {
        const files = Array.from(e.target.files);
        files.forEach((file) => {
            const reader = new FileReader();
            reader.onload = () => {
                setCapturedImages((prev) => [
                    ...prev,
                    { src: reader.result, blob: file, source: 'file' },
                ]);
            };
            reader.readAsDataURL(file);
        });
        // Reset file input
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // Remove a captured image
    const handleRemoveImage = (index) => {
        setCapturedImages((prev) => prev.filter((_, i) => i !== index));
    };

    // Step 2 → Step 3
    const handleReview = () => {
        if (capturedImages.length === 0) {
            onToast?.({ type: 'error', message: '최소 1장의 사진을 캡처해주세요.' });
            return;
        }
        setStep(3);
    };

    // Submit registration
    const handleSubmit = async () => {
        setStep(4);
        setIsSubmitting(true);

        try {
            const files = capturedImages.map(
                (img, idx) => new File([img.blob], `face_${idx}.jpg`, { type: 'image/jpeg' })
            );

            const result = await registerMultipleFaces(name.trim(), files);
            setResult(result);

            if (result.status === 'success') {
                onToast?.({
                    type: 'success',
                    message: `'${name.trim()}' 등록 완료! (${result.total_images}장)`,
                });
                onSuccess?.();
            } else {
                onToast?.({ type: 'error', message: result.message || '등록 실패' });
            }
        } catch (error) {
            const msg = error.response?.data?.detail || error.message || '등록 실패';
            setResult({ status: 'error', message: msg });
            onToast?.({ type: 'error', message: msg });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-backdrop" onClick={handleClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()} id="register-modal">
                {/* Header */}
                <div className="modal-header">
                    <h2 className="modal-title">
                        {step === 1 && '📝 이름 입력'}
                        {step === 2 && '📸 사진 캡처'}
                        {step === 3 && '✅ 등록 확인'}
                        {step === 4 && '⏳ 등록 중...'}
                    </h2>
                    <button className="modal-close" onClick={handleClose}>✕</button>
                </div>

                {/* Progress Steps */}
                <div className="modal-steps">
                    {[1, 2, 3, 4].map((s) => (
                        <div
                            key={s}
                            className={`modal-step ${step === s ? 'active' : ''} ${step > s ? 'done' : ''}`}
                        >
                            <div className="modal-step-dot">
                                {step > s ? '✓' : s}
                            </div>
                            <span className="modal-step-label">
                                {s === 1 && '이름'}
                                {s === 2 && '촬영'}
                                {s === 3 && '확인'}
                                {s === 4 && '완료'}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Step Content */}
                <div className="modal-body">
                    {/* Step 1: Name Input */}
                    {step === 1 && (
                        <div className="modal-step-content animate-fade-in">
                            <p className="modal-description">
                                등록할 사람의 이름을 입력하세요. 한글 이름을 지원합니다.
                            </p>
                            <input
                                type="text"
                                className="modal-input"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleNameSubmit()}
                                placeholder="이름 입력 (예: 홍길동)"
                                autoFocus
                                id="modal-name-input"
                            />
                            <div className="modal-actions">
                                <button className="btn btn-ghost" onClick={handleClose}>취소</button>
                                <button
                                    className="btn btn-primary"
                                    onClick={handleNameSubmit}
                                    disabled={!name.trim()}
                                    style={{ opacity: !name.trim() ? 0.5 : 1 }}
                                >
                                    다음 →
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Capture Images */}
                    {step === 2 && (
                        <div className="modal-step-content animate-fade-in">
                            <p className="modal-description">
                                <strong>'{name}'</strong>님의 얼굴 사진을 촬영하세요.
                                여러 각도에서 <strong>2장 이상</strong> 촬영하면 인식 정확도가 향상됩니다.
                            </p>

                            <div className="modal-camera-area">
                                <div className="modal-webcam-wrapper">
                                    <Webcam
                                        audio={false}
                                        ref={webcamRef}
                                        screenshotFormat="image/jpeg"
                                        videoConstraints={videoConstraints}
                                        className="modal-webcam"
                                    />
                                    <button
                                        className="modal-capture-btn"
                                        onClick={handleCapture}
                                        id="modal-capture-btn"
                                        title="사진 촬영"
                                    >
                                        <div className="capture-ring" />
                                    </button>
                                </div>
                            </div>

                            {/* Captured Images Preview */}
                            <div className="modal-captured-grid">
                                {capturedImages.map((img, idx) => (
                                    <div className="modal-captured-item" key={idx}>
                                        <img src={img.src} alt={`Captured ${idx + 1}`} />
                                        <button
                                            className="modal-captured-remove"
                                            onClick={() => handleRemoveImage(idx)}
                                            title="삭제"
                                        >
                                            ✕
                                        </button>
                                        <span className="modal-captured-badge">
                                            {img.source === 'camera' ? '📷' : '📁'}
                                        </span>
                                    </div>
                                ))}
                                {/* Upload button */}
                                <label className="modal-upload-btn" title="파일에서 업로드">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleFileUpload}
                                        style={{ display: 'none' }}
                                        id="modal-file-upload"
                                    />
                                    <span className="modal-upload-icon">+</span>
                                    <span className="modal-upload-text">업로드</span>
                                </label>
                            </div>

                            <p className="modal-hint">
                                📸 {capturedImages.length}장 촬영됨
                                {capturedImages.length >= 2 && ' ✅ 충분한 사진!'}
                                {capturedImages.length === 1 && ' (1장 더 촬영 권장)'}
                            </p>

                            <div className="modal-actions">
                                <button className="btn btn-ghost" onClick={() => setStep(1)}>← 이전</button>
                                <button
                                    className="btn btn-primary"
                                    onClick={handleReview}
                                    disabled={capturedImages.length === 0}
                                    style={{ opacity: capturedImages.length === 0 ? 0.5 : 1 }}
                                >
                                    다음 →
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Review & Confirm */}
                    {step === 3 && (
                        <div className="modal-step-content animate-fade-in">
                            <div className="modal-review">
                                <div className="modal-review-name">
                                    <span className="modal-review-label">이름</span>
                                    <span className="modal-review-value">{name}</span>
                                </div>
                                <div className="modal-review-name">
                                    <span className="modal-review-label">사진 수</span>
                                    <span className="modal-review-value">{capturedImages.length}장</span>
                                </div>
                            </div>

                            <div className="modal-captured-grid review">
                                {capturedImages.map((img, idx) => (
                                    <div className="modal-captured-item" key={idx}>
                                        <img src={img.src} alt={`Review ${idx + 1}`} />
                                        <span className="modal-captured-number">{idx + 1}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="modal-actions">
                                <button className="btn btn-ghost" onClick={() => setStep(2)}>← 사진 추가</button>
                                <button className="btn btn-success" onClick={handleSubmit} id="modal-submit-btn">
                                    🚀 등록하기
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Submitting / Result */}
                    {step === 4 && (
                        <div className="modal-step-content animate-fade-in" style={{ textAlign: 'center' }}>
                            {isSubmitting ? (
                                <div className="modal-uploading">
                                    <div className="modal-uploading-spinner" />
                                    <p className="modal-uploading-text">
                                        얼굴 임베딩 분석 중...
                                    </p>
                                    <p className="modal-uploading-sub">
                                        {capturedImages.length}장의 사진을 처리하고 있습니다.
                                    </p>
                                </div>
                            ) : result?.status === 'success' ? (
                                <div className="modal-result success">
                                    <div className="modal-result-icon">🎉</div>
                                    <h3 className="modal-result-title">등록 완료!</h3>
                                    <p className="modal-result-text">{result.message}</p>
                                    <button className="btn btn-primary" onClick={handleClose} style={{ marginTop: 16 }}>
                                        닫기
                                    </button>
                                </div>
                            ) : (
                                <div className="modal-result error">
                                    <div className="modal-result-icon">😞</div>
                                    <h3 className="modal-result-title">등록 실패</h3>
                                    <p className="modal-result-text">{result?.message || '알 수 없는 오류'}</p>
                                    <div className="modal-actions" style={{ justifyContent: 'center' }}>
                                        <button className="btn btn-ghost" onClick={() => setStep(2)}>← 다시 촬영</button>
                                        <button className="btn btn-primary" onClick={handleClose}>닫기</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RegisterModal;
