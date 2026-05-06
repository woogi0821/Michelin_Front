
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import RestaurantMapContainer from '../components/restaurant/RestaurantMapContainer';

const RestaurantPage = () => {
  const [restaurants, setRestaurants] = useState([]); // 맛집 데이터를 담을 바구니
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [center, setCenter] = useState({ lat: 35.1795, lng: 129.0756 });

  useEffect(() => {
  // 브라우저가 Geolocation을 지원하는지 확인
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        
        // 내 위치로 중심점 이동!
        // 이렇게 하면 1단계에서 만든 데이터 호출 useEffect가 자동으로 반응합니다.
        setCenter({
          lat: position.coords.latitude,
          lng: position.coords.longitude
       });
      });
    }
  }, []);

  useEffect(() => {
    // 1. 백엔드 API 호출 (아까 브라우저에서 확인한 그 주소!)
    // 현재 위치 좌표를 파라미터로 보냅니다.
    axios.get('http://localhost:8080/api/restaurants/markers', {
      params: {
        lat: center.lat,
        lng: center.lng
      }
    })
    .then(response => {
      setRestaurants(response.data); // 데이터 바구니에 저장
    })
    .catch(error => {
      console.error("데이터 로딩 실패:", error);
    });
  }, [center]); // center가 바뀔때마다 데이터 새로 불러오기

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {/* 지도를 화면 전체에 꽉 채웁니다 */}
      <RestaurantMapContainer 
        restaurants={restaurants} 
        selectedId={selectedId}
        onSelect={(id) => setSelectedId(id)}
        onCenterChange={setCenter}
        center={center}
      />
      
      {/* 상단 타이틀 바 (디자인 요소) */}
      <div style={{ 
        position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)',
        zIndex: 100, background: 'white', padding: '10px 20px', borderRadius: '30px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.2)', fontWeight: 'bold', color: '#e62117'
      }}>
        📍 미쉐린 가이드 맛집 지도
      </div>
    </div>
  );
};

export default RestaurantPage;