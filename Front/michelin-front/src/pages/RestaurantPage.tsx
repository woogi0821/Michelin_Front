import React, { useEffect, useState } from "react";
import axios from "axios";
import RestaurantMapContainer from "../components/restaurant/RestaurantMapContainer";

interface Restaurant {
  id: number;
  restaurantName: string;
  lat: number;
  lng: number;
  grade: string;
  markerColor: string;
  address?: string;
  phone?: string;
}

const RestaurantPage = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [mapCenter, setMapCenter] = useState({ lat: 35.1795, lng: 129.0756 });
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  // 현재 선택된 식당 데이터 찾기
  const selectedRestaurant = restaurants.find((r) => r.id === selectedId);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setUserLocation({ lat, lng }); // 내 실제 위치 저장
        setMapCenter({ lat, lng }); // 처음 지도를 내 위치로 이동
      });
    }
  }, []);

  useEffect(() => {
    axios
      .get("http://localhost:8080/api/restaurants/markers", {
        params: { lat: mapCenter.lat, lng: mapCenter.lng },
      })
      .then(response => {
    // ★ 이 코드를 넣고 브라우저에서 F12를 눌러 Console 탭을 확인하세요!
    console.log("전체 데이터:", response.data);
    if(response.data.length > 0) {
      console.log("첫 번째 맛집 상세 필드명:", Object.keys(response.data[0]));
    }
    setRestaurants(response.data);
  })
  .catch(error => console.error("데이터 로딩 실패:", error));
}, [mapCenter]);

  return (
    <div
      style={{
        display: "flex",
        width: "100vw",
        height: "100vh",
        margin: 0,
        padding: 0,
        overflow: "hidden",
      }}
    >
      {/* [왼쪽 사이드바] 상세 정보 카드 영역 */}
      <div
        style={{
          width: "400px",
          minWidth: "400px",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          borderRight: "1px solid #ddd",
          background: "white",
          zIndex: 100,
        }}
      >
        {/* 사이드바 헤더 */}
        <div
          style={{
            padding: "20px",
            background: "white",
            borderBottom: "1px solid #eee",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "1.2rem", color: "#e62117" }}>
            📍 미쉐린 가이드
          </h2>
          <p style={{ margin: "5px 0 0", fontSize: "0.85rem", color: "#888" }}>
            내 주변의 특별한 맛집을 찾아보세요
          </p>
        </div>

        {/* 상세 정보 내용 */}
        <div style={{ flex: 1, padding: "20px", overflowY: "auto" }}>
          {selectedRestaurant ? (
            <div style={{ animation: "fadeIn 0.3s" }}>
              {/* 식당 이미지 (데이터에 이미지 URL이 있다면) */}
              <div
                style={{
                  width: "100%",
                  height: "200px",
                  background: "#eee",
                  borderRadius: "12px",
                  marginBottom: "15px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#aaa",
                }}
              >
                {/* <img src={selectedRestaurant.imageUrl} /> 대체 */}
                이미지 준비 중
              </div>

              <h1 style={{ fontSize: "1.5rem", marginBottom: "10px" }}>
                {selectedRestaurant.restaurantName}
              </h1>

              <div style={{ marginBottom: "15px" }}>
                <span
                  style={{
                    background: selectedRestaurant.markerColor,
                    color: "white",
                    padding: "4px 10px",
                    borderRadius: "20px",
                    fontSize: "0.8rem",
                    fontWeight: "bold",
                  }}
                >
                  {selectedRestaurant.grade}
                </span>
              </div>

              <div
                style={{
                  marginTop: "20px",
                  fontSize: "0.9rem",
                  lineHeight: "1.6",
                }}
              >
                <p>
                  <strong>🏠 주소:</strong>{" "}
                  {selectedRestaurant.address || "주소 정보가 없습니다."}
                </p>
                {/* ★ 여기를 .phone으로 변경합니다 */}
                <p>
                  <strong>📞 전화:</strong>{" "}
                  {selectedRestaurant.phone || "전화번호 정보가 없습니다."}
                </p>
              </div>

              <button
                onClick={() => setSelectedId(null)}
                style={{
                  width: "100%",
                  padding: "12px",
                  marginTop: "20px",
                  borderRadius: "8px",
                  border: "1px solid #ddd",
                  background: "white",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                닫기
              </button>
            </div>
          ) : (
            <div
              style={{ textAlign: "center", marginTop: "100px", color: "#bbb" }}
            >
              <p>
                지도의 마커를 클릭하여
                <br />
                상세 정보를 확인하세요!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* [오른쪽 영역] 지도 영역 */}
      <div style={{ flex: 1, position: "relative" }}>
        <RestaurantMapContainer
          restaurants={restaurants}
          selectedId={selectedId}
          onSelect={(id) => setSelectedId(id)}
          onCenterChange={setMapCenter}
          center={mapCenter}
          userLocation={userLocation}
        />
      </div>

      {/* 애니메이션 효과용 CSS */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default RestaurantPage;
