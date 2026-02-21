import { useState, useCallback, useEffect } from 'react';
import CameraView from './components/CameraView';
import DetectedFaces from './components/DetectedFaces';
import RegisteredUsers from './components/RegisteredUsers';
import RegisterModal from './components/RegisterModal';
import ToastContainer from './components/Toast';
import { healthCheck } from './services/api';
import './App.css';

let toastIdCounter = 0;

function App() {
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectedFaces, setDetectedFaces] = useState([]);
  const [backendOnline, setBackendOnline] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [userRefreshTrigger, setUserRefreshTrigger] = useState(0);

  // Check backend health on load
  useEffect(() => {
    const check = async () => {
      const online = await healthCheck();
      setBackendOnline(online);
    };
    check();
    const interval = setInterval(check, 10000);
    return () => clearInterval(interval);
  }, []);

  const addToast = useCallback((toast) => {
    const id = ++toastIdCounter;
    setToasts((prev) => [...prev, { ...toast, id }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const handleToggleDetection = () => {
    if (!backendOnline) {
      addToast({ type: 'error', message: '백엔드 서버에 연결할 수 없습니다.' });
      return;
    }
    setIsDetecting((prev) => {
      if (prev) setDetectedFaces([]);
      return !prev;
    });
  };

  const handleFacesDetected = useCallback((faces) => {
    setDetectedFaces(faces);
  }, []);

  const handleOpenRegister = () => {
    if (!backendOnline) {
      addToast({ type: 'error', message: '백엔드 서버에 연결할 수 없습니다.' });
      return;
    }
    // Pause detection while registering
    setIsDetecting(false);
    setDetectedFaces([]);
    setShowRegisterModal(true);
  };

  const handleRegisterSuccess = () => {
    setUserRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-brand">
          <div className="header-logo">🤖</div>
          <h1 className="header-title">Face Recognition Dashboard</h1>
        </div>
        <div className="header-status">
          <div className="status-badge">
            <div className={`status-dot ${backendOnline ? 'online' : 'offline'}`} />
            {backendOnline ? 'API 연결됨' : 'API 오프라인'}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {/* Camera Section */}
        <section className="camera-section">
          <div className="section-header">
            <h2 className="section-title">📹 실시간 카메라</h2>
            <div className="controls">
              <button
                className="btn btn-ghost"
                onClick={handleOpenRegister}
                id="open-register-btn"
              >
                ➕ 얼굴 등록
              </button>
              <button
                className={isDetecting ? 'btn btn-danger' : 'btn btn-primary'}
                onClick={handleToggleDetection}
                id="toggle-detection-btn"
              >
                {isDetecting ? '⏹ 감지 중지' : '▶ 감지 시작'}
              </button>
            </div>
          </div>

          <CameraView
            isDetecting={isDetecting}
            onFacesDetected={handleFacesDetected}
          />
        </section>

        {/* Side Panel */}
        <aside className="side-panel">
          <DetectedFaces faces={detectedFaces} />
          <RegisteredUsers
            refreshTrigger={userRefreshTrigger}
            onToast={addToast}
          />
        </aside>
      </main>

      {/* Register Modal */}
      <RegisterModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onSuccess={handleRegisterSuccess}
        onToast={addToast}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}

export default App;
