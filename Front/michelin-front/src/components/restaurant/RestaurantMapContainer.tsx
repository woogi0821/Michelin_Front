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
  useEffect(() => {
    if (!isMapLoaded || !mapInstance.current || !clustererRef.current) return;

    const clusterer = clustererRef.current;

    clusterer.clear();
    overlaysMap.current.forEach((ov) => ov.setMap(null));
    overlaysMap.current.clear();

    const newMarkers = restaurants.map((res) => {
      const position = new window.kakao.maps.LatLng(res.lat, res.lng);
      const color = res.markerColor ? res.markerColor.toLowerCase() : "";

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

      const marker = new window.kakao.maps.Marker({
        position: position,
        image: markerImage,
        title: res.restaurantName,
      });

      window.kakao.maps.event.addListener(marker, "click", () => {
        window.selectRestaurant(res.id);
      });

      return marker;
    });

    clusterer.addMarkers(newMarkers);

    return () => {
      newMarkers.forEach((marker) => {
        window.kakao.maps.event.removeListener(marker, "click");
      });
    };
  }, [restaurants, isMapLoaded, selectedId]);

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
