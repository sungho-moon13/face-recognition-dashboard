import React, { useState, useEffect, useCallback } from 'react';
import { getUsers, deleteUser } from '../services/api';

const RegisteredUsers = ({ refreshTrigger, onToast }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getUsers();
            setUsers(data.users || []);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers, refreshTrigger]);

    const handleDelete = async (name) => {
        if (!window.confirm(`'${name}' 사용자를 삭제하시겠습니까?\n등록된 모든 얼굴 데이터와 썸네일이 삭제됩니다.`)) return;

        try {
            await deleteUser(name);
            onToast?.({ type: 'success', message: `'${name}' 삭제 완료` });
            fetchUsers();
        } catch (error) {
            onToast?.({ type: 'error', message: `삭제 실패: ${error.message}` });
        }
    };

    const getInitials = (name) => {
        return name.slice(0, 2).toUpperCase();
    };

    const formatDate = (isoString) => {
        if (!isoString || isoString === 'N/A') return '';
        try {
            const d = new Date(isoString);
            return d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
        } catch {
            return '';
        }
    };

    return (
        <div className="card">
            <div className="card-header">
                <h3 className="card-title">👥 등록된 사용자</h3>
                <span className="card-badge">{users.length}</span>
            </div>

            {loading ? (
                <div className="empty-state">
                    <div className="loading-spinner" />
                </div>
            ) : users.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">📋</div>
                    <p className="empty-state-text">
                        등록된 사용자가 없습니다.<br />
                        얼굴을 등록하세요.
                    </p>
                </div>
            ) : (
                <ul className="user-list" id="registered-users-list">
                    {users.map((user) => (
                        <li className="user-item" key={user.name}>
                            <div className="user-info">
                                {user.thumbnail ? (
                                    <img
                                        src={user.thumbnail}
                                        alt={user.name}
                                        className="user-avatar-thumb"
                                    />
                                ) : (
                                    <div className="user-avatar">{getInitials(user.name)}</div>
                                )}
                                <div>
                                    <div className="user-name">{user.name}</div>
                                    <div className="user-images">
                                        📸 {user.image_count}장
                                        {formatDate(user.updated_at) && ` · ${formatDate(user.updated_at)}`}
                                    </div>
                                </div>
                            </div>
                            <button
                                className="user-delete-btn"
                                onClick={() => handleDelete(user.name)}
                                title="삭제"
                                id={`delete-user-${user.name}`}
                            >
                                🗑️
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default RegisteredUsers;
