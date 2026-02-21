import React, { useState, useEffect } from 'react';

const Toast = ({ toast, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose(toast.id);
        }, 3500);
        return () => clearTimeout(timer);
    }, [toast.id, onClose]);

    const icon = {
        success: '✅',
        error: '❌',
        info: 'ℹ️',
    }[toast.type] || 'ℹ️';

    return (
        <div className={`toast ${toast.type}`}>
            <span>{icon}</span>
            <span className="toast-message">{toast.message}</span>
            <button className="toast-close" onClick={() => onClose(toast.id)}>✕</button>
        </div>
    );
};

const ToastContainer = ({ toasts, onClose }) => {
    return (
        <div className="toast-container">
            {toasts.map((t) => (
                <Toast key={t.id} toast={t} onClose={onClose} />
            ))}
        </div>
    );
};

export default ToastContainer;
