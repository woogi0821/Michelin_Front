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
  const [mapLevel, setMapLevel] = useState(5);

  // 💡 가비지 컬렉션 및 깜빡임 방지를 위한 캐싱 Map 객체 구조 유지
  const customOverlaysMap = useRef<Map<number, { overlay: any; element: HTMLElement }>>(new Map());
  const kakaoMarkersMap = useRef<Map<number, any>>(new Map());

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
          gridSize: 60,
          disableClickZoom: true,
        });

        // 지도 드래그 종료 시 이벤트 내부 디바운스나 스로틀 처리가 백엔드에 있으면 좋습니다.
        window.kakao.maps.event.addListener(map, "dragend", () => {
          const latlng = map.getCenter();
          onCenterChange({ lat: latlng.getLat(), lng: latlng.getLng() });
        });

        window.kakao.maps.event.addListener(map, "zoom_changed", () => {
          setMapLevel(map.getLevel());
        });

        setIsMapLoaded(true);
      });
    };
  }, []);

  // [2] 마커 및 클러스터러 그리기 (✨ 깜빡임 및 제멋대로 작동 방지 대규모 수정 파트)
  useEffect(() => {
    const map = mapInstance.current;
    if (!isMapLoaded || !map || !clustererRef.current) return;

    const transparentImage = new window.kakao.maps.MarkerImage(
      "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
      new window.kakao.maps.Size(1, 1)
    );

    // 현재 백엔드로부터 새로 들어온 식당들의 ID 셋 빌드
    const incomingIds = new Set(restaurants.map((r) => r.id));

    // 🔴 1. 기존에 그려둔 오버레이/마커 중 '이번 백엔드 응답에서 사라진 식당'들만 골라내서 부드럽게 숨김 처리
    customOverlaysMap.current.forEach((obj, id) => {
      if (!incomingIds.has(id)) {
        obj.overlay.setMap(null); // 이번 범위에 없는 식당은 지도에서 off
      }
    });

    const markersToCluster: any[] = [];

    // 🟢 2. 현재 화면에 표출되어야 하는 식당 루프 순회
    restaurants.forEach((res) => {
      let markerObj = customOverlaysMap.current.get(res.id);

      if (!markerObj) {
        const container = document.createElement("div");
        container.style.cursor = "pointer";
        container.onclick = () => window.selectRestaurant(res.id);

container.innerHTML = `
  <div class="marker-wrapper" style="display:flex; flex-direction:column; align-items:center; transition: transform 0.2s;">
    <div style="width:30px; height:36px; position:relative;">
      <svg class="marker-svg" viewBox="0 0 24 24" style="width:30px; height:36px;">
        <path class="marker-path" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
        <circle cx="12" cy="9" r="3" fill="white"/>
      </svg>
    </div>
    <div class="occupancy-label" style="display: none; margin-top:4px; padding:2px 8px; border-radius:12px; font-size:11px; font-weight:bold; white-space:nowrap; border:1px solid transparent;"></div>
  </div>`;

        const overlay = new window.kakao.maps.CustomOverlay({
          position: new window.kakao.maps.LatLng(res.lat, res.lng),
          content: container,
          yAnchor: 0.9,
        });

        markerObj = { overlay, element: container };
        customOverlaysMap.current.set(res.id, markerObj);
      }

      // 위치 갱신
      markerObj.overlay.setPosition(new window.kakao.maps.LatLng(res.lat, res.lng));

      const isSelected = selectedId === res.id;

      const michelinColors: Record<string, string> = {
        "선정 레스토랑": "#2563EB", 
        "선정레스토랑": "#2563EB",   
        "빕 구르망": "#22C55E",     
        "1스타": "#DAA520",         
        "2스타": "#DAA520",         
        "3스타": "#DAA520",         
      };

      const targetColor = michelinColors[res.grade] || "#94A3B8";

      const wrapper = markerObj.element.querySelector(".marker-wrapper") as HTMLElement;
      const path = markerObj.element.querySelector(".marker-path") as HTMLElement;
      const label = markerObj.element.querySelector(".occupancy-label") as HTMLElement;

      wrapper.style.transform = isSelected ? "scale(1.3) translateY(-7px)" : "scale(1)";
      path.setAttribute("fill", targetColor);
      label.textContent = res.restaurantName;
      
      label.style.background = isSelected ? targetColor : "rgba(255,255,255,0.9)";
      label.style.color = isSelected ? "white" : "#333";
      label.style.borderColor = targetColor;

      // 6레벨 이상 축소 시 커스텀 디자인을 숨겨 클러스터 숫자와 겹치지 않게 방어
      if (mapLevel >= 6) {
        markerObj.overlay.setMap(null);
      } else {
        markerObj.overlay.setMap(map); // 화면 범위 안에 들어와있고 5레벨 이하면 노출
      }

      markerObj.overlay.setZIndex(isSelected ? 100 : 1);

      // 클러스터 등록용 투명 백그라운드 카카오 마커 관리
      let kakaoMarker = kakaoMarkersMap.current.get(res.id);
      if (!kakaoMarker) {
        kakaoMarker = new window.kakao.maps.Marker({
          position: new window.kakao.maps.LatLng(res.lat, res.lng),
          image: transparentImage,
        });
        window.kakao.maps.event.addListener(kakaoMarker, "click", () => onSelect(res.id));
        kakaoMarkersMap.current.set(res.id, kakaoMarker);
      } else {
        kakaoMarker.setPosition(new window.kakao.maps.LatLng(res.lat, res.lng));
      }
      markersToCluster.push(kakaoMarker);
    });

    // 🔴 3. 카카오 마커 맵에서도 현재 없는 마커 객체 정리
    kakaoMarkersMap.current.forEach((_, id) => {
      if (!incomingIds.has(id)) {
        kakaoMarkersMap.current.delete(id);
      }
    });

    // 클러스터 집합 동기화 및 가상 마커 재연산
    clustererRef.current.clear();
    if (markersToCluster.length > 0) {
      clustererRef.current.addMarkers(markersToCluster);
    }
  }, [restaurants, isMapLoaded, selectedId, mapLevel, onSelect]);

  // [3] 지도 중심 이동
  useEffect(() => {
    if (!isMapLoaded || !mapInstance.current) return;
    const map = mapInstance.current;

    if (selectedId) {
      const selectedRes = restaurants.find((r) => r.id === selectedId);
      if (selectedRes) {
        const moveLatLon = new window.kakao.maps.LatLng(selectedRes.lat, selectedRes.lng);
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
    const myPos = new window.kakao.maps.LatLng(userLocation.lat, userLocation.lng);
    map.setCenter(myPos);
    map.setLevel(4);
  }, [userLocation, isMapLoaded]);

  return <div ref={mapRef} style={{ width: "100%", height: "100%" }} />;
};

export default RestaurantMapContainer;