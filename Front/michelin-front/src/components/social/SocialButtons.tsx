import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface SocialProps {
    userId: number;
    restaurantId: number;
}

const SocialButtons = ({ userId, restaurantId }: SocialProps) => {
    const [status, setStatus] = useState({ isLiked: false, isBookmarked: false });
    const [loading, setLoading] = useState(false);

    // [Step 1] 페이지 로딩 시 현재 상태 가져오기
    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/api/social/status`, {
                    params: { userId, restaurantId }
                });
                setStatus(response.data);
            } catch (error) {
                console.error("상태를 가져오는데 실패했습니다.", error);
            }
        };
        fetchStatus();
    }, [restaurantId]);

    // [Step 2] 좋아요 토글 함수
    const handleLike = async () => {
        if (loading) return; // 중복 클릭 방지
        setLoading(true);
        try {
            const response = await axios.post(`http://localhost:8080/api/social/like`, {
                userId,
                restaurantId
            });
            // 서버에서 반환한 최신 상태(true/false)로 업데이트
            setStatus(prev => ({ ...prev, isLiked: response.data }));
        } finally {
            setLoading(false);
        }
    };

    // [Step 3] 북마크 토글 함수
    const handleBookmark = async () => {
        if (loading) return;
        setLoading(true);
        try {
            const response = await axios.post(`http://localhost:8080/api/social/bookmark`, {
                userId,
                restaurantId
            });
            setStatus(prev => ({ ...prev, isBookmarked: response.data }));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', gap: '15px', padding: '10px' }}>
            <button onClick={handleLike} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '24px' }}>
                {status.isLiked ? '❤️' : '🤍'}
            </button>
            <button onClick={handleBookmark} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '24px' }}>
                {status.isBookmarked ? '🔖' : '⬜'}
            </button>
        </div>
    );
};

export default SocialButtons;