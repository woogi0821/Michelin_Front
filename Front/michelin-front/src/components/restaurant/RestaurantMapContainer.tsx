import React, { useEffect, useRef, useState } from "react";

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

interface RestaurantMapProps {
  restaurants: Restaurant[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  onCenterChange: (coords: { lat: number; lng: number }) => void;
  center: { lat: number; lng: number };
  userLocation: { lat: number; lng: number } | null;
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
  userLocation,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const clustererRef = useRef<any>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const overlaysMap = useRef<Map<number, any>>(new Map());

  // [1] 지도 초기화
  useEffect(() => {
    window.selectRestaurant = (id: number) => onSelect(id);
    const script = document.createElement("script");
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

        clustererRef.current = new window.kakao.maps.MarkerClusterer({
          map: map,
          averageCenter: true,
          minLevel: 6,
        });

        window.kakao.maps.event.addListener(map, "dragend", () => {
          const latlng = map.getCenter();
          onCenterChange({ lat: latlng.getLat(), lng: latlng.getLng() });
        });

        setIsMapLoaded(true);
      });
    };
  }, []);

  // [2] 마커 및 클러스터러 그리기
 // [2] 마커 및 클러스터러 그리기
  useEffect(() => {
    if (!isMapLoaded || !mapInstance.current || !clustererRef.current) return;

    const clusterer = clustererRef.current;
    const map = mapInstance.current; // 현재 지도 객체 가져오기

    // 기존 데이터 정리
    clusterer.clear();
    overlaysMap.current.forEach((ov) => ov.setMap(null));
    overlaysMap.current.clear();

    const newMarkers = restaurants.map((res) => {
      const position = new window.kakao.maps.LatLng(res.lat, res.lng);

      // 1. 등급(grade)에 따라 스타일과 심볼 결정
      let pinClass = "pin-selected";
      let symbol = "M";

      if (res.grade === "1스타") {
        pinClass = "pin-star";
        symbol = "★";
      } else if (res.grade === "빕 구르망") {
        pinClass = "pin-bib";
        symbol = "♥";
      }

      // 2. 커스텀 오버레이 HTML 생성
      const content = document.createElement('div');
      content.innerHTML = `
        <div class="custom-pin ${pinClass}">
          <span class="pin-content">${symbol}</span>
        </div>
      `;
      
      // 클릭 이벤트 추가 (중요: 커스텀 오버레이는 직접 이벤트를 걸어줘야 함)
      content.onclick = () => {
        onSelect(res.id);
      };

      // 3. 커스텀 오버레이 생성
      const customOverlay = new window.kakao.maps.CustomOverlay({
        position: position,
        content: content,
        yAnchor: 1.3,
      });

      // 지도에 즉시 표시
      customOverlay.setMap(map);
      
      // 관리를 위해 Map에 저장
      overlaysMap.current.set(res.id, customOverlay);

      return customOverlay;
    });

    // 클러스터러에 마커(오버레이) 추가 (참고: 카카오 클러스터러는 기본 Marker 객체에 최적화되어 있어, 
    // 오버레이 사용 시 클러스터링이 안 될 수 있습니다. 만약 클러스터링이 꼭 필요하면 Marker로 돌아가야 합니다.)
    // 일단은 화면 표시를 위해 보존합니다.
    clusterer.addMarkers(newMarkers);

  }, [restaurants, isMapLoaded, selectedId, onSelect]);

  // [3] 지도 중심 이동
  useEffect(() => {
    if (!isMapLoaded || !mapInstance.current) return;
    const map = mapInstance.current;

    if (selectedId) {
      const selectedRes = restaurants.find((r) => r.id === selectedId);
      if (selectedRes) {
        const moveLatLon = new window.kakao.maps.LatLng(
          selectedRes.lat,
          selectedRes.lng,
        );
        map.panTo(moveLatLon);
        return;
      }
    }

    const currentCenter = map.getCenter();
    const diffLat = Math.abs(currentCenter.getLat() - center.lat);
    const diffLng = Math.abs(currentCenter.getLng() - center.lng);

    if (diffLat > 0.001 || diffLng > 0.001) {
      map.setCenter(new window.kakao.maps.LatLng(center.lat, center.lng));
    }
  }, [center, selectedId, isMapLoaded]);

  // [4] 초기 사용자 위치 이동
  useEffect(() => {
    if (!isMapLoaded || !mapInstance.current || !userLocation) return;
    const map = mapInstance.current;
    const myPos = new window.kakao.maps.LatLng(
      userLocation.lat,
      userLocation.lng,
    );
    map.setCenter(myPos);
    map.setLevel(4);
  }, [userLocation, isMapLoaded]);

  return <div ref={mapRef} style={{ width: "100%", height: "100%" }} />;
};

export default RestaurantMapContainer;
