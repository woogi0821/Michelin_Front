import React, { useEffect, useRef, useState } from 'react';

interface Restaurant {
  id: number;
  restaurantName: string;
  lat: number;
  lng: number;
  grade: string;
  markerColor: string;
  address?: string;     
  phone?: string;
  imageUrl?: string;
}

// [수정] interface에 userLocation을 추가해서 부모와 약속을 맞춥니다.
interface RestaurantMapProps {
  restaurants: Restaurant[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  onCenterChange: (coords: { lat: number, lng: number }) => void; 
  center: { lat: number, lng: number };
  userLocation: { lat: number; lng: number } | null; // ★ 추가
}

declare global {
  interface Window {
    kakao: any;
    selectRestaurant: (id: number) => void;
  }
}

const RestaurantMapContainer: React.FC<RestaurantMapProps> = ({
  restaurants,
  selectedId,
  onSelect,
  onCenterChange,
  center,
  userLocation // ★ Props에서 받아옵/니다.
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const clustererRef = useRef<any>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const overlaysMap = useRef<Map<number, any>>(new Map());
  const kakaoMarkersMap = useRef<Map<number, any>>(new Map());

  

  // [기능 1] 지도 초기화 및 idle 이벤트 등록
  useEffect(() => {
    window.selectRestaurant = (id: number) => onSelect(id);
    const script = document.createElement('script');
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=5cc1f47f2bb48afc9e7ef7f4c698644b&libraries=services,clusterer&autoload=false`;
    script.async = true;
    document.head.appendChild(script);

    script.onload = () => {
      window.kakao.maps.load(() => {
        if (!mapRef.current) return;
        const map = new window.kakao.maps.Map(mapRef.current, {
          center: new window.kakao.maps.LatLng(center.lat, center.lng),
          level: 5,
        });
        mapInstance.current = map;

        window.kakao.maps.event.addListener(map, 'idle', () => {
          const latlng = map.getCenter();
          onCenterChange({ lat: latlng.getLat(), lng: latlng.getLng() });
        });

        clustererRef.current = new window.kakao.maps.MarkerClusterer({
          map, averageCenter: true, minLevel: 6, gridSize: 60,
        });
        setIsMapLoaded(true);
      });
    };
  }, []);

// 맛집 마커들 그리기
useEffect(() => {
  if (!isMapLoaded || !mapInstance.current) return;
  const map = mapInstance.current;
  
  restaurants.forEach((res) => {
    let overlay = overlaysMap.current.get(res.id);
    if (!overlay) {
      const container = document.createElement('div');
      container.onclick = () => window.selectRestaurant(res.id);
      const isSelected = selectedId === res.id;
      container.innerHTML = `
        <div style="display:flex; flex-direction:column; align-items:center; ${isSelected ? 'transform:scale(1.2);' : ''}">
          <div style="background:${res.markerColor}; color:white; padding:4px 8px; border-radius:12px; font-size:11px; font-weight:bold; border:2px solid white;">
            ${res.restaurantName}
          </div>
        </div>`;
      overlay = new window.kakao.maps.CustomOverlay({
        position: new window.kakao.maps.LatLng(res.lat, res.lng),
        content: container, yAnchor: 1.2,
      });
      overlaysMap.current.set(res.id, overlay);
    }
    // ★ 줌 레벨이 10보다 낮을 때(더 가까울 때) 무조건 보이도록 설정
    overlay.setMap(map.getLevel() < 10 ? map : null);
  });
}, [restaurants, isMapLoaded, selectedId]);

// [추가] 지도의 중심 이동만 전담하는 새로운 로직
useEffect(() => {
  if (!isMapLoaded || !mapInstance.current || !center) return;

  const map = mapInstance.current;
  const currentCenter = map.getCenter();
  
  // 현재 지도의 실제 중심과 부모가 준 좌표(center)가 다를 때만 이동
  const diffLat = Math.abs(currentCenter.getLat() - center.lat);
  const diffLng = Math.abs(currentCenter.getLng() - center.lng);

  // 차이가 0.0001보다 클 때(즉, 리스트에서 식당을 클릭했을 때 등)만 이동
  if (diffLat > 0.0001 || diffLng > 0.0001) {
    map.panTo(new window.kakao.maps.LatLng(center.lat, center.lng));
  }
}, [center, isMapLoaded]);

  // 내 위치로 지도만 이동
useEffect(() => {
  if (!isMapLoaded || !mapInstance.current || !userLocation) return;

  const map = mapInstance.current;
  const myPos = new window.kakao.maps.LatLng(userLocation.lat, userLocation.lng);

  // 1. 지도의 중심을 내 위치로 이동 (핀 찍는 코드는 아예 넣지 않았습니다!)
  map.setCenter(myPos);

  // 2. 줌 레벨을 5로 설정 (반경 수백 미터~1km 정도가 맛집과 함께 잘 보입니다)
  // 숫자가 작을수록 지도가 가까워집니다. 8은 너무 멀었네요! 4~5가 적당합니다.
  map.setLevel(4);

}, [userLocation, isMapLoaded]);

useEffect(() => {
  // 선택된 맛집이 바뀌면 해당 위치로 지도 중심을 부드럽게 이동
  if (!isMapLoaded || !mapInstance.current || !selectedId) return;

  // 전체 맛집 목록에서 선택된 ID와 일치하는 맛집 찾기
  const selectedRes = restaurants.find(r => r.id === selectedId);
  if (selectedRes) {
    const moveLatLon = new window.kakao.maps.LatLng(selectedRes.lat, selectedRes.lng);
    
    // panTo는 지도를 부드럽게 이동시킵니다. (자바의 부드러운 메서드 체이닝 느낌!)
    mapInstance.current.panTo(moveLatLon);
  }
}, [selectedId, restaurants, isMapLoaded]);

  return <div ref={mapRef} style={{ width: '100%', height: '100%' }} />;
};

export default RestaurantMapContainer;