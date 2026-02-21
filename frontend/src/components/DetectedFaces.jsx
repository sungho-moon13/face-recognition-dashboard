import React from 'react';

const DetectedFaces = ({ faces }) => {
    if (!faces || faces.length === 0) {
        return (
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">🔍 감지된 얼굴</h3>
                    <span className="card-badge">0</span>
                </div>
                <div className="empty-state">
                    <div className="empty-state-icon">👤</div>
                    <p className="empty-state-text">
                        감지를 시작하면 여기에<br />인식된 얼굴이 표시됩니다
                    </p>
                </div>
            </div>
        );
    }

    const getSimilarityLevel = (sim) => {
        if (sim >= 0.6) return 'high';
        if (sim >= 0.4) return 'medium';
        return 'low';
    };

    return (
        <div className="card">
            <div className="card-header">
                <h3 className="card-title">🔍 감지된 얼굴</h3>
                <span className="card-badge">{faces.length}</span>
            </div>
            <ul className="face-list" id="detected-faces-list">
                {faces.map((face, idx) => {
                    const isKnown = face.name !== 'Unknown';
                    const similarity = (face.similarity * 100).toFixed(1);
                    const level = getSimilarityLevel(face.similarity);

                    return (
                        <li className="face-item" key={idx}>
                            <div className={`face-avatar ${isKnown ? 'known' : 'unknown'}`}>
                                {isKnown ? '✅' : '❓'}
                            </div>
                            <div className="face-info">
                                <div className="face-name">{face.name}</div>
                                <div className="face-similarity">
                                    유사도: {similarity}% · 감지: {(face.score * 100).toFixed(0)}%
                                </div>
                                <div className="face-score-bar">
                                    <div
                                        className={`face-score-fill ${level}`}
                                        style={{ width: `${Math.min(face.similarity * 100, 100)}%` }}
                                    />
                                </div>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default DetectedFaces;
