import React, { useRef, useState, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import { analyzeImage } from '../services/api';

const videoConstraints = {
    width: 640,
    height: 480,
    facingMode: "user"
};

const CameraView = () => {
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);
    const [isDetecting, setIsDetecting] = useState(false);
    const [detectedFaces, setDetectedFaces] = useState([]);
    const detectionInterval = useRef(null);

    const capture = useCallback(() => {
        if (webcamRef.current) {
            const imageSrc = webcamRef.current.getScreenshot();
            return imageSrc;
        }
        return null;
    }, [webcamRef]);

    const drawFaces = (faces) => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        faces.forEach(face => {
            const [x1, y1, x2, y2] = face.bbox;
            const width = x2 - x1;
            const height = y2 - y1;

            // Draw bounding box
            ctx.strokeStyle = '#00FF00';
            ctx.lineWidth = 2;
            ctx.strokeRect(x1, y1, width, height);

            // Draw name and score
            ctx.fillStyle = '#00FF00';
            ctx.font = '16px Arial';
            ctx.fillText(`${face.name} (${(face.similarity * 100).toFixed(1)}%)`, x1, y1 - 5);
        });
    };

    const processFrame = async () => {
        if (!webcamRef.current) return;

        const imageSrc = capture();
        if (!imageSrc) return;

        // Convert base64 to blob/file
        const res = await fetch(imageSrc);
        const blob = await res.blob();
        const file = new File([blob], "capture.jpg", { type: "image/jpeg" });

        try {
            const result = await analyzeImage(file);
            // Assuming result is { results: [...] } based on backend
            if (result && result.results) {
                setDetectedFaces(result.results);
                drawFaces(result.results);
            }
        } catch (error) {
            console.error("Detection error:", error);
        }
    };

    const toggleDetection = () => {
        if (isDetecting) {
            clearInterval(detectionInterval.current);
            setIsDetecting(false);
            setDetectedFaces([]);
            // Clear canvas
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        } else {
            setIsDetecting(true);
            detectionInterval.current = setInterval(processFrame, 500); // 2 FPS for now to avoid overload
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (detectionInterval.current) {
                clearInterval(detectionInterval.current);
            }
        };
    }, []);

    return (
        <div className="camera-container" style={{ position: 'relative', width: 640, height: 480 }}>
            <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={videoConstraints}
                style={{ position: 'absolute', top: 0, left: 0 }}
            />
            <canvas
                ref={canvasRef}
                width={640}
                height={480}
                style={{ position: 'absolute', top: 0, left: 0 }}
            />
            <div style={{ position: 'absolute', bottom: 10, left: 10, zIndex: 10 }}>
                <button onClick={toggleDetection}>
                    {isDetecting ? 'Stop Detection' : 'Start Detection'}
                </button>
            </div>
        </div>
    );
};

export default CameraView;
