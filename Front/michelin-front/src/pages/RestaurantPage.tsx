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
  const [searchTerm, setSearchTerm] = useState(""); // 1. 검색어 상태
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // 사이드바가 열려있는지(true) 닫혀있는지(false) 저장
  const [mapCenter, setMapCenter] = useState({ lat: 35.1795, lng: 129.0756 });
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // 2. 필터링 로직 (자바의 Stream 필터 역할)
  const filteredRestaurants = restaurants.filter((res) => {
    const normalizedName = res.restaurantName.replace(/\s+/g, "").toLowerCase();
    const normalizedSearch = searchTerm.replace(/\s+/g, "").toLowerCase();

    return normalizedName.includes(normalizedSearch);
  });

  const selectedRestaurant = restaurants.find((r) => r.id === selectedId);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setUserLocation({ lat, lng });
        setMapCenter({ lat, lng });
      });
    }
  }, []);

  useEffect(() => {
    axios
      .get("http://localhost:8080/api/restaurants/markers", {
        params: { lat: mapCenter.lat, lng: mapCenter.lng },
      })
      .then((response) => {
        setRestaurants(response.data);
      })
      .catch((error) => console.error("데이터 로딩 실패:", error));
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
      {/* [왼쪽 사이드바] */}
      <div
        style={{
          width: isSidebarOpen ? "400px" : "0px", // isSidebarOpen이 true면 400px, false면 0px
          minWidth: isSidebarOpen ? "400px" : "0px",
          transition: "all 0.3s ease", // 부드럽게 움직이게 하는 코드
          overflow: "hidden",
        }}
      >
        {/* 헤더 영역 (검색창 포함) */}
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

          {/* 검색창: 헤더 안에 예쁘게 배치했습니다 */}
          <div style={{ marginTop: "15px" }}>
            <input
              type="text"
              placeholder="식당명 또는 등급 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 15px",
                borderRadius: "20px",
                border: "1px solid #ddd",
                outline: "none",
              }}
            />
          </div>
        </div>

        {/* 하단 내용 영역: 상세 정보 vs 리스트 목록 */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {selectedRestaurant ? (
            /* --- [A] 상세 정보 화면 --- */
            <div style={{ padding: "20px", animation: "fadeIn 0.3s" }}>
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
                목록으로 돌아가기
              </button>
            </div>
          ) : (
            /* --- [B] 검색 리스트 화면 --- */
            <div>
              {filteredRestaurants.length > 0 ? (
                filteredRestaurants.map((res) => (
                  <div
                    key={res.id}
                    onClick={() => setSelectedId(res.id)}
                    style={{
                      padding: "20px",
                      borderBottom: "1px solid #f9f9f9",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ fontWeight: "bold" }}>
                      {res.restaurantName}
                    </div>
                    <div
                      style={{
                        fontSize: "0.8rem",
                        color: "#e62117",
                        marginTop: "5px",
                      }}
                    >
                      {res.grade}
                    </div>
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "#999",
                        marginTop: "5px",
                      }}
                    >
                      {res.address}
                    </div>
                  </div>
                ))
              ) : (
                <div
                  style={{
                    padding: "50px 0",
                    textAlign: "center",
                    color: "#bbb",
                  }}
                >
                  검색 결과가 없습니다.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {/* 토글 버튼  */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)} // 클릭할 때마다 반대로 바꿈 (T <-> F)
        style={{
          position: "absolute",
          left: isSidebarOpen ? "400px" : "0px", // 사이드바 상태에 따라 버튼 위치도 이동
          top: "20px",
          zIndex: 1000, // 지도보다 위에 떠 있어야 함
          padding: "10px 15px",
          cursor: "pointer",
          background: "white",
          border: "1px solid #ddd",
          borderLeft: "none", // 사이드바랑 이어지는 느낌
          borderRadius: "0 8px 8px 0", // 오른쪽만 둥글게 해서 '탭' 느낌 강조
          boxShadow: "2px 0 5px rgba(0,0,0,0.1)", // 입체감
          transition: "left 0.3s ease", // 버튼도 사이드바랑 같이 부드럽게 이동
          fontSize: "1.2rem",
          color: "#e62117", // 포인트 컬러
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* ★ 버튼 안에 화살표가 있어야 클릭이 가능하고 눈에 보입니다! */}
        {isSidebarOpen ? "◀" : "▶"}
      </button>

      {/* [오른쪽 지도 영역] */}
      <div style={{ flex: 1, position: "relative" }}>
        <RestaurantMapContainer
          restaurants={filteredRestaurants} // 필터링된 데이터만 지도에 전달
          selectedId={selectedId}
          onSelect={(id) => {
            setSelectedId(id); // 1. 식당 선택
            setIsSidebarOpen(true); // 2. ★ 사이드바가 닫혀있다면 자동으로 열기!
          }}
          onCenterChange={setMapCenter}
          center={mapCenter}
          userLocation={userLocation}
        />
      </div>

      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
};

export default RestaurantPage;
