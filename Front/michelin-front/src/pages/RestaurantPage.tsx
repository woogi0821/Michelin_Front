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
  category: string;
  address?: string;
  phone?: string;
  imageUrl?: string;
}

const RestaurantPage = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [mapCenter, setMapCenter] = useState({ lat: 35.1795, lng: 129.0756 });
  // 실제로 서버에서 데이터를 불러올 "기준" 좌표 (지도가 멈췄을 때만 업데이트)
  const [fetchLocation, setFetchLocation] = useState({
    lat: 35.1795,
    lng: 129.0756,
  });
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const categories = ["전체", "한식", "일식", "중식", "양식", "아시안"];
  const [isSearching, setIsSearching] = useState(false);

  const filteredRestaurants = restaurants.filter((res) => {
    const normalizedName = res.restaurantName.replace(/\s+/g, "").toLowerCase();
    const normalizedSearch = searchTerm.replace(/\s+/g, "").toLowerCase();
    const isNameMatch = normalizedName.includes(normalizedSearch);
    const isCategoryMatch =
      selectedCategory === "전체" || res.category === selectedCategory;
    return isNameMatch && isCategoryMatch;
  });

  const selectedRestaurant = restaurants.find((r) => r.id === selectedId);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setUserLocation({ lat, lng });
        setMapCenter({ lat, lng });
        setFetchLocation({ lat, lng }); // 초기 위치 설정
      });
    }
  }, []);

  useEffect(() => {
    // 검색 모드가 아닐 때만 주변 식당을 가져옵니다.
    if (!isSearching) {
      axios
        .get("http://localhost:8080/api/restaurants/markers", {
          params: { lat: fetchLocation.lat, lng: fetchLocation.lng },
        })
        .then((response) => {
          setRestaurants(response.data);
        });
    }
  }, [fetchLocation, isSearching]); // mapCenter 대신 fetchLocation을 감시

  const handleSearch = async (e?: React.KeyboardEvent<HTMLInputElement>) => {
    if (e && e.key !== "Enter") return;
    if (!searchTerm.trim()) {
      setIsSearching(false); // 검색어 없으면 검색 모드 해제
      return;
    }

    try {
      setIsSearching(true); // ★ 검색 모드 시작 (주변 식당 불러오기 중단)
      const response = await axios.get(
        "http://localhost:8080/api/restaurants/search",
        {
          params: { name: searchTerm },
        },
      );
      setRestaurants(response.data);
    } catch (error) {
      console.error("검색 실패:", error);
      alert("검색 중 오류가 발생했습니다.");
    }
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      {/* 1. 바탕이 되는 지도 영역 (전체 화면 차지) */}
      <div style={{ width: "100%", height: "100%", zIndex: 1 }}>
        <RestaurantMapContainer
          restaurants={filteredRestaurants}
          selectedId={selectedId}
          onSelect={(id) => {
            setSelectedId(id);
            setIsSidebarOpen(true);
            const selected = restaurants.find((r) => r.id === id);
            if (selected) {
              // 식당 클릭 시 지도를 해당 위치로 "강제 고정" 이동
              setMapCenter({ lat: selected.lat, lng: selected.lng });
              setFetchLocation({ lat: selected.lat, lng: selected.lng });
            }
          }}
          //  지도를 드래그할 때마다 서버를 부르지 않도록 설정
          onCenterChange={(newCenter) => {
            // 검색 모드가 아닐 때만 현재 지도의 중심 좌표를 부모 상태에 저장합니다.
            if (!isSearching) {
              
              //  검색 중이 아닐 때만 fetchLocation도 업데이트
              // (드래그 할 때마다 서버를 부르는 게 부담되면 이 부분을 '나중에' 호출하게 조절해야함)
              setFetchLocation(newCenter);
            }
          }}
          center={mapCenter}
          userLocation={userLocation}
        />
      </div>

      {/* 2. 지도 위에 뜨는 사이드바 */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "400px",
          height: "100%",
          backgroundColor: "white",
          zIndex: 100,
          boxShadow: "5px 0 15px rgba(0,0,0,0.1)",
          transform: isSidebarOpen ? "translateX(0)" : "translateX(-400px)",
          transition: "transform 0.3s ease",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* 상단 검색 및 카테고리 영역 */}
        <div style={{ padding: "20px", borderBottom: "1px solid #eee" }}>
          <h2 style={{ margin: 0, fontSize: "1.2rem", color: "#e62117" }}>
            📍 미쉐린 가이드
          </h2>
          <div style={{ marginTop: "15px" }}>
            <input
              type="text"
              placeholder="식당 검색 후 엔터..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleSearch} // ★ 엔터 키 이벤트 연결 부분
              style={{
                width: "80%",
                maxWidth: "300px",
                padding: "8px 12px",
                fontSize: "0.9rem",
                borderRadius: "20px",
                border: "1px solid #ddd",
                outline: "none",
                display: "block",
                margin: "0 auto",
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
              marginTop: "15px",
            }}
          >
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setIsSearching(false); // 카테고리 누르면 검색 모드 해제 (주변 찾기 활성화)
                }}
                style={{
                  padding: "6px 12px",
                  borderRadius: "20px",
                  border: "1px solid #ddd",
                  backgroundColor:
                    selectedCategory === cat ? "#e62117" : "white",
                  color: selectedCategory === cat ? "white" : "#333",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* 리스트/상세정보 영역 */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {selectedRestaurant ? (
            /* --- 상세 정보 화면 --- */
            <div style={{ padding: "20px", animation: "fadeIn 0.3s" }}>
              <div
                style={{
                  width: "100%",
                  height: "200px",
                  background: "#eee",
                  borderRadius: "12px",
                  marginBottom: "15px",
                  overflow: "hidden",
                }}
              >
                <img
                  src={selectedRestaurant.imageUrl || "기본이미지주소"}
                  alt="식당이미지"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
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
                    marginRight: "8px",
                  }}
                >
                  {selectedRestaurant.grade}
                </span>
                <span style={{ color: "#888", fontSize: "0.9rem" }}>
                  {selectedRestaurant.category}
                </span>
              </div>
              <div style={{ fontSize: "0.9rem", lineHeight: "1.8" }}>
                <p>🏠 주소: {selectedRestaurant.address || "주소 없음"}</p>
                <p>📞 전화: {selectedRestaurant.phone || "전화 없음"}</p>
              </div>
              <button
                onClick={() => setSelectedId(null)}
                style={{
                  width: "100%",
                  padding: "12px",
                  marginTop: "20px",
                  borderRadius: "8px",
                  border: "1px solid #ddd",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                목록으로 돌아가기
              </button>
            </div>
          ) : (
            /* --- 검색 리스트 화면 --- */
            <div>
              {filteredRestaurants.length > 0 ? (
                filteredRestaurants.map((res) => (
                  <div
                    key={res.id}
                    onClick={() => {
                      setSelectedId(res.id);
                      // 리스트 클릭 시 해당 위치로 지도 이동
                      setMapCenter({ lat: res.lat, lng: res.lng });
                    }}
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
                      {res.grade} | {res.category}
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

        {/* 사이드바 토글 버튼 */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          style={{
            position: "absolute",
            right: "-30px",
            top: "50%",
            transform: "translateY(-50%)",
            width: "30px",
            height: "60px",
            backgroundColor: "white",
            border: "1px solid #ddd",
            borderLeft: "none",
            borderRadius: "0 8px 8px 0",
            cursor: "pointer",
            color: "#e62117",
          }}
        >
          {isSidebarOpen ? "◀" : "▶"}
        </button>
      </div>

      <style>{`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
    </div>
  );
};
export default RestaurantPage;
