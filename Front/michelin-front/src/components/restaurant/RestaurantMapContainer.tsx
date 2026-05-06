import React, { useEffect, useRef, useState } from 'react';

// 1. 맛집 데이터 인터페이스 정의
interface Restaurant {
  id: number;
  restaurantName: string;
  lat: number;
  lng: number;
  grade: string;
  markerColor: string;
}

// 2. Props 인터페이스 수정 (onCenterChange 추가)
interface RestaurantMapProps {
  restaurants: Restaurant[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  onCenterChange: (coords: { lat: number, lng: number }) => void; 
  center: { lat: number, lng: number };
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
  center // ★ 추가됨
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const clustererRef = useRef<any>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const myLocationMarkerRef = useRef<any>(null); // 내 위치 마커를 기억해둘 변수

  const overlaysMap = useRef<Map<number, any>>(new Map());
  const kakaoMarkersMap = useRef<Map<number, any>>(new Map());

  useEffect(() => {
    window.selectRestaurant = (id: number) => onSelect(id);

    const script = document.createElement('script');
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=5cc1f47f2bb48afc9e7ef7f4c698644b&libraries=services,clusterer&autoload=false`;
    script.async = true;
    document.head.appendChild(script);

    script.onload = () => {
      window.kakao.maps.load(() => {
        if (!mapRef.current) return;
        
        // 지도를 처음 만들 때
        const map = new window.kakao.maps.Map(mapRef.current, {
          center: new window.kakao.maps.LatLng(35.1795, 129.0756), // 부산으로 시작!
          level: 5,
        });
        mapInstance.current = map;

        // ★ [1단계 핵심] 지도가 멈추면(idle) 부모에게 좌표를 알려주는 이벤트 리스너 추가
        window.kakao.maps.event.addListener(map, 'idle', () => {
          const latlng = map.getCenter(); // 중앙 좌표 가져오기
          onCenterChange({
            lat: latlng.getLat(),
            lng: latlng.getLng()
          });
        });

        clustererRef.current = new window.kakao.maps.MarkerClusterer({
          map,
          averageCenter: true,
          minLevel: 6,
          gridSize: 60,
        });

        setIsMapLoaded(true);
      });
    };
  }, []); // 이펙트는 처음에 한 번만 실행

  useEffect(() => {
    if (!isMapLoaded || !mapInstance.current) return;

    const map = mapInstance.current;
    const clusterer = clustererRef.current;
    const markersToCluster: any[] = [];

    const transparentImage = new window.kakao.maps.MarkerImage(
      'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
      new window.kakao.maps.Size(1, 1)
    );

    // 식당 마커 그리기 로직
    restaurants.forEach((res) => {
      let overlay = overlaysMap.current.get(res.id);
      if (!overlay) {
        const container = document.createElement('div');
        container.style.cursor = 'pointer';
        container.onclick = () => window.selectRestaurant(res.id);
        
        const isSelected = selectedId === res.id;
        container.innerHTML = `
          <div style="display:flex; flex-direction:column; align-items:center; transition: transform 0.2s; ${isSelected ? 'transform:scale(1.3); z-index:10;' : ''}">
            <div style="background:${res.markerColor}; color:white; padding:4px 8px; border-radius:12px; font-size:11px; font-weight:bold; white-space:nowrap; border:2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);">
              ${res.restaurantName}
            </div>
            <div style="width:0; height:0; border-left:6px solid transparent; border-right:6px solid transparent; border-top:8px solid ${res.markerColor}; margin-top:-1px;"></div>
          </div>`;

        overlay = new window.kakao.maps.CustomOverlay({
          position: new window.kakao.maps.LatLng(res.lat, res.lng),
          content: container,
          yAnchor: 1.1,
        });
        overlaysMap.current.set(res.id, overlay);
      }

      overlay.setMap(map.getLevel() < 6 ? map : null);

      let kakaoMarker = kakaoMarkersMap.current.get(res.id);
      if (!kakaoMarker) {
        kakaoMarker = new window.kakao.maps.Marker({
          position: new window.kakao.maps.LatLng(res.lat, res.lng),
          image: transparentImage,
        });
        kakaoMarkersMap.current.set(res.id, kakaoMarker);
      }
      markersToCluster.push(kakaoMarker);
    });

    clusterer.clear();
    clusterer.addMarkers(markersToCluster);
  }, [restaurants, isMapLoaded, selectedId]);

  useEffect(() => {
  if (isMapLoaded && mapInstance.current) {
    // onCenterChange가 아니라 center를 사용해야 합니다!
    const newCenter = new window.kakao.maps.LatLng(center.lat, center.lng);
    
    // 1. 지도를 부드럽게 이동
    mapInstance.current.panTo(newCenter);
  // 2. 기존에 내 위치 마커가 있다면 제거
    if (myLocationMarkerRef.current) {
      myLocationMarkerRef.current.setMap(null);
    }

    // 3. 내 위치를 알리는 새로운 마커 생성 (파란색 원형 마커 느낌)
    const markerContent = `
      <div style="width: 15px; height: 15px; background: #ff0000; border: 3px solid white; border-radius: 50%; box-shadow: 0 0 8px rgba(0,0,0,0.5);"></div>
    `;

    myLocationMarkerRef.current = new window.kakao.maps.CustomOverlay({
      position: newCenter,
      content: markerContent,
      map: mapInstance.current,
      zIndex: 100 // 맛집 마커들보다 항상 위에 보이도록 설정
    });
  }
}, [center.lat, center.lng]);

  // ★ Return문 수정: Page에서 작성한 부분을 여기에 쓰는 게 아니라, 
  // 실제 지도가 그려질 div만 반환해야 합니다.
  return <div ref={mapRef} style={{ width: '100%', height: '100%' }} />;
};

export default RestaurantMapContainer;