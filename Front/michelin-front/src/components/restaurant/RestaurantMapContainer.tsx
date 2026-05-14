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
          map: map, // 마커들이 추가될 지도
          averageCenter: true, // 마커들의 중간 지점에 숫자 표시
          minLevel: 6, // 6레벨부터 숫자로 뭉치기 시작
        });

        window.kakao.maps.event.addListener(map, "dragend", () => {
          // 드래그(마우스로 끌기)가 끝났을 때의 표시
          const latlng = map.getCenter();
          onCenterChange({ lat: latlng.getLat(), lng: latlng.getLng() });
        });

        setIsMapLoaded(true);
      });
    };
  }, []);

  // [2] 마커(기본 핀) 및 클러스터러 그리기 (수정 버전)
  useEffect(() => {
    if (!isMapLoaded || !mapInstance.current || !clustererRef.current) return;

    const clusterer = clustererRef.current;

    // 1. 기존 마커 및 오버레이 초기화
    clusterer.clear();
    // 이름표(Overlay)는 더 이상 쓰지 않지만, 혹시 잔상이 남지 않게 지도에서 제거합니다.
    overlaysMap.current.forEach((ov) => ov.setMap(null));
    overlaysMap.current.clear();

    // 2. 새로운 마커 객체들을 만듭니다. (핀만 나오도록)
    const newMarkers = restaurants.map((res) => {
      const position = new window.kakao.maps.LatLng(res.lat, res.lng);

      // --- [체크 1] 데이터 확인을 위한 로그 ---
      const color = res.markerColor ? res.markerColor.toLowerCase() : "";
      console.log(`식당: ${res.restaurantName}, 색상값: ${color}`);

      // --- [체크 2] 색상 커스터마이징 로직 ---
      // --- [체크 2] 색상 커스터마이징 로직 (최종판) ---
      let markerImageUrl = "";

      if (color === "yellow" || color === "#ffff00") {
        markerImageUrl = '/pin-yellow.png';
      } else if (color === "blue" || color === "#0000ff") {
        markerImageUrl = '/pin-blue.png';
      } else if (color === "orange" || color === "#ffa500") { 
        markerImageUrl = '/pin-orange.png';
      } else if (color === "red" || color === "#ff0000") { 
        markerImageUrl = '/pin-red.png';
      } else if (color === "green" || color === "#008000") { 
        markerImageUrl = '/pin-green.png';
      } else {
        markerImageUrl = "/pin-green.png"; 
      }

      const markerImage = markerImageUrl
        ? new window.kakao.maps.MarkerImage(
            markerImageUrl,
            new window.kakao.maps.Size(35, 35),
          )
        : null;

      // --- [체크 3] 핀 마커 생성 및 클릭 이벤트 ---
      const marker = new window.kakao.maps.Marker({
        position: position,
        image: markerImage,
        title: res.restaurantName,
      });

      window.kakao.maps.event.addListener(marker, "click", () => {
        window.selectRestaurant(res.id);
      });

      return marker; // 맵 함수의 끝
    }); // newMarkers 배열 생성 완료

    // 3. 기계에 마커 뭉치 전달
    clusterer.addMarkers(newMarkers);

    // cleanup: 컴포넌트 언마운트 시 이벤트 제거
    return () => {
      newMarkers.forEach((marker) => {
        window.kakao.maps.event.removeListener(marker, "click");
      });
    };
  }, [restaurants, isMapLoaded, selectedId]);

  // [3] 지도 중심 이동 관리 (중복 제거 통합 버전)
  useEffect(() => {
    if (!isMapLoaded || !mapInstance.current) return;
    const map = mapInstance.current;

    // 1순위: 특정 식당이 선택되었을 때 (리스트 클릭)
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

    // 2순위: 부모의 center 좌표가 외부 요인(검색 등)으로 크게 변했을 때
    const currentCenter = map.getCenter();
    const diffLat = Math.abs(currentCenter.getLat() - center.lat);
    const diffLng = Math.abs(currentCenter.getLng() - center.lng);

    if (diffLat > 0.001 || diffLng > 0.001) {
      map.setCenter(new window.kakao.maps.LatLng(center.lat, center.lng));
    }
  }, [center, selectedId, isMapLoaded]);

  // [4] 초기 사용자 위치 이동 (한 번만 실행되도록 설정 권장)
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
