import React, { useRef, useState, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import { analyzeImage } from '../services/api';

const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: 'user',
};

const CameraView = ({ isDetecting, onFacesDetected, onFrameProcessed }) => {
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const animationRef = useRef(null);
    const detectionInterval = useRef(null);
    const [cameraReady, setCameraReady] = useState(false);
    const [fps, setFps] = useState(0);
    const lastFrameTime = useRef(Date.now());
    const frameCount = useRef(0);

    // Track FPS
    useEffect(() => {
        const fpsInterval = setInterval(() => {
            setFps(frameCount.current);
            frameCount.current = 0;
        }, 1000);
        return () => clearInterval(fpsInterval);
    }, []);

    // Draw bounding boxes and labels on canvas overlay
    const drawOverlay = useCallback((faces) => {
        const canvas = canvasRef.current;
        const video = webcamRef.current?.video;
        if (!canvas || !video) return;

        const ctx = canvas.getContext('2d');
        const videoWidth = video.videoWidth;
        const videoHeight = video.videoHeight;

        // Match canvas to video resolution
        canvas.width = videoWidth;
        canvas.height = videoHeight;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        faces.forEach((face) => {
            const [x1, y1, x2, y2] = face.bbox;
            const w = x2 - x1;
            const h = y2 - y1;

            const isKnown = face.name !== 'Unknown';
            const color = isKnown ? '#10b981' : '#f59e0b';
            const glowColor = isKnown ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)';

            // Glow effect
            ctx.shadowColor = glowColor;
            ctx.shadowBlur = 12;

            // Rounded corners bounding box
            const radius = 8;
            ctx.strokeStyle = color;
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(x1 + radius, y1);
            ctx.lineTo(x2 - radius, y1);
            ctx.quadraticCurveTo(x2, y1, x2, y1 + radius);
            ctx.lineTo(x2, y2 - radius);
            ctx.quadraticCurveTo(x2, y2, x2 - radius, y2);
            ctx.lineTo(x1 + radius, y2);
            ctx.quadraticCurveTo(x1, y2, x1, y2 - radius);
            ctx.lineTo(x1, y1 + radius);
            ctx.quadraticCurveTo(x1, y1, x1 + radius, y1);
            ctx.closePath();
            ctx.stroke();

            // Corner accents (small L-shapes at corners)
            const cornerLen = Math.min(20, w * 0.15, h * 0.15);
            ctx.lineWidth = 3.5;
            ctx.shadowBlur = 16;

            // Top-left
            ctx.beginPath();
            ctx.moveTo(x1, y1 + cornerLen);
            ctx.lineTo(x1, y1);
            ctx.lineTo(x1 + cornerLen, y1);
            ctx.stroke();

            // Top-right
            ctx.beginPath();
            ctx.moveTo(x2 - cornerLen, y1);
            ctx.lineTo(x2, y1);
            ctx.lineTo(x2, y1 + cornerLen);
            ctx.stroke();

            // Bottom-left
            ctx.beginPath();
            ctx.moveTo(x1, y2 - cornerLen);
            ctx.lineTo(x1, y2);
            ctx.lineTo(x1 + cornerLen, y2);
            ctx.stroke();

            // Bottom-right
            ctx.beginPath();
            ctx.moveTo(x2 - cornerLen, y2);
            ctx.lineTo(x2, y2);
            ctx.lineTo(x2, y2 - cornerLen);
            ctx.stroke();

            // Reset shadow for text
            ctx.shadowBlur = 0;

            // Label background
            const similarity = (face.similarity * 100).toFixed(1);
            const label = isKnown ? `${face.name}  ${similarity}%` : `Unknown`;
            ctx.font = '600 14px Inter, sans-serif';
            const textMetrics = ctx.measureText(label);
            const labelWidth = textMetrics.width + 16;
            const labelHeight = 26;
            const labelX = x1;
            const labelY = y1 - labelHeight - 4;

            // Pill-shaped label bg
            ctx.fillStyle = color;
            ctx.beginPath();
            const lr = 6;
            ctx.moveTo(labelX + lr, labelY);
            ctx.lineTo(labelX + labelWidth - lr, labelY);
            ctx.quadraticCurveTo(labelX + labelWidth, labelY, labelX + labelWidth, labelY + lr);
            ctx.lineTo(labelX + labelWidth, labelY + labelHeight - lr);
            ctx.quadraticCurveTo(labelX + labelWidth, labelY + labelHeight, labelX + labelWidth - lr, labelY + labelHeight);
            ctx.lineTo(labelX + lr, labelY + labelHeight);
            ctx.quadraticCurveTo(labelX, labelY + labelHeight, labelX, labelY + labelHeight - lr);
            ctx.lineTo(labelX, labelY + lr);
            ctx.quadraticCurveTo(labelX, labelY, labelX + lr, labelY);
            ctx.closePath();
            ctx.fill();

            // Label text
            ctx.fillStyle = '#ffffff';
            ctx.textBaseline = 'middle';
            ctx.fillText(label, labelX + 8, labelY + labelHeight / 2);
        });
    }, []);

    // Process frame: capture -> send to backend -> draw result
    const processFrame = useCallback(async () => {
        if (!webcamRef.current || !isDetecting) return;

        const imageSrc = webcamRef.current.getScreenshot();
        if (!imageSrc) return;

        try {
            const res = await fetch(imageSrc);
            const blob = await res.blob();
            const file = new File([blob], 'capture.jpg', { type: 'image/jpeg' });

            const result = await analyzeImage(file);
            if (result?.results) {
                const faces = Array.isArray(result.results) ? result.results : [];
                drawOverlay(faces);
                onFacesDetected?.(faces);
                frameCount.current++;
            }
            onFrameProcessed?.();
        } catch (error) {
            console.error('Detection error:', error);
        }
    }, [isDetecting, drawOverlay, onFacesDetected, onFrameProcessed]);

    // Start/stop detection loop
    useEffect(() => {
        if (isDetecting && cameraReady) {
            detectionInterval.current = setInterval(processFrame, 500); // ~2 FPS analysis
        } else {
            if (detectionInterval.current) {
                clearInterval(detectionInterval.current);
                detectionInterval.current = null;
            }
            // Clear canvas when not detecting
            const canvas = canvasRef.current;
            if (canvas) {
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        }

        return () => {
            if (detectionInterval.current) {
                clearInterval(detectionInterval.current);
            }
        };
    }, [isDetecting, cameraReady, processFrame]);

    const handleUserMedia = useCallback(() => {
        setCameraReady(true);
    }, []);

    // Capture a single frame as File for registration
    const captureFrame = useCallback(() => {
        if (!webcamRef.current) return null;
        const imageSrc = webcamRef.current.getScreenshot();
        if (!imageSrc) return null;
        return imageSrc;
    }, []);

    // Expose captureFrame via ref through parent
    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.captureFrame = captureFrame;
        }
    }, [captureFrame]);

    return (
        <div
            className={`camera-wrapper ${isDetecting ? 'detecting' : ''}`}
            ref={containerRef}
            id="camera-container"
        >
            {!cameraReady && (
                <div className="camera-placeholder">
                    <div className="camera-placeholder-icon">📷</div>
                    <div className="camera-placeholder-text">카메라 연결 중...</div>
                    <div className="loading-spinner" style={{ marginTop: 8 }}></div>
                </div>
            )}
            <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={videoConstraints}
                onUserMedia={handleUserMedia}
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: cameraReady ? 'block' : 'none',
                }}
            />
            <canvas
                ref={canvasRef}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                }}
            />
            {cameraReady && (
                <div className="camera-overlay">
                    <div className="camera-stats">
                        <div className="camera-stat">
                            <span className="camera-stat-label">Status</span>
                            <span className="camera-stat-value">
                                {isDetecting ? '🟢 감지 중' : '⏸ 대기'}
                            </span>
                        </div>
                        {isDetecting && (
                            <div className="camera-stat">
                                <span className="camera-stat-label">Analysis/s</span>
                                <span className="camera-stat-value">{fps}</span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

// Expose captureFrame via a forwarded ref-like pattern
export const getCameraCapture = (cameraContainerElement) => {
    return cameraContainerElement?.captureFrame?.();
};

export default CameraView;
