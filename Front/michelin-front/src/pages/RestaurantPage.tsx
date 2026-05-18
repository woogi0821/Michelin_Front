import React, { useEffect, useState } from "react";
import RestaurantMapContainer from "../components/restaurant/RestaurantMapContainer";
import { useNavigate } from "react-router-dom";
import { getRestaurantMarkers, searchRestaurantsByName } from "../service/restaurantApi";
// ✅ interface 제거 → IRestaurantMarker import
import { IRestaurantMarker } from "../types/IRestaurant";

const RestaurantPage = () => {
  // ✅ Restaurant[] → IRestaurantMarker[]
  const [restaurants, setRestaurants] = useState<IRestaurantMarker[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<IRestaurantMarker[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [mapCenter, setMapCenter] = useState({ lat: 35.1795, lng: 129.0756 });
  const [fetchLocation, setFetchLocation] = useState({ lat: 35.1795, lng: 129.0756 });
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const categories = ["전체", "한식", "일식", "중식", "양식", "아시안"];
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const filteredRestaurants = restaurants.filter((res) => {
    const normalizedName = res.restaurantName.replace(/\s+/g, "").toLowerCase();
    const normalizedSearch = searchTerm.replace(/\s+/g, "").toLowerCase();
    const isNameMatch = normalizedName.includes(normalizedSearch);
    const isCategoryMatch = selectedCategory === "전체" || res.category === selectedCategory;
    return isNameMatch && isCategoryMatch;
  });

  // ✅ Restaurant | undefined → IRestaurantMarker | undefined
  const selectedRestaurant = restaurants.find((r) => r.id === selectedId);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setUserLocation({ lat, lng });
        setMapCenter({ lat, lng });
        setFetchLocation({ lat, lng });
      });
    }
  }, []);

  useEffect(() => {
    if (!isSearching) {
      getRestaurantMarkers(fetchLocation.lat, fetchLocation.lng)
        .then((response) => {
          setRestaurants(response.data);
        });
    }
  }, [fetchLocation, isSearching]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value.trim().length > 0) {
      const filtered = restaurants
        .filter((r) => r.restaurantName.toLowerCase().includes(value.toLowerCase()))
        .slice(0, 5);
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSearch = async (targetName?: string) => {
    const query = typeof targetName === "string" ? targetName : searchTerm;
    if (!query.trim()) {
      setIsSearching(false);
      return;
    }
    try {
      setIsSearching(true);
      const response = await searchRestaurantsByName(query);
      setRestaurants(response.data);
      setShowSuggestions(false);
    } catch (error) {
      console.error("검색 실패:", error);
      alert("검색 중 오류가 발생했습니다.");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleImageClick = (id: number) => {
    navigate(`/restaurants/${id}`);
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh", overflow: "hidden" }}>
      <div style={{ width: "100%", height: "100%", zIndex: 1 }}>
        <RestaurantMapContainer
          restaurants={filteredRestaurants}
          selectedId={selectedId}
          onSelect={(id: number) => {
            setSelectedId(id);
            setIsSidebarOpen(true);
            const selected = restaurants.find((r) => r.id === id);
            if (selected) {
              setMapCenter({ lat: selected.lat, lng: selected.lng });
              setFetchLocation({ lat: selected.lat, lng: selected.lng });
            }
          }}
          onCenterChange={(newCenter: { lat: number; lng: number }) => {
            if (!isSearching) setFetchLocation(newCenter);
          }}
          center={mapCenter}
          userLocation={userLocation}
        />
      </div>

      <div
        style={{
          position: "absolute", top: 0, left: 0, width: "400px", height: "100%",
          backgroundColor: "white", zIndex: 100,
          boxShadow: "5px 0 15px rgba(0,0,0,0.1)",
          transform: isSidebarOpen ? "translateX(0)" : "translateX(-400px)",
          transition: "transform 0.3s ease", display: "flex", flexDirection: "column",
        }}
      >
        <div style={{ padding: "20px", borderBottom: "1px solid #eee" }}>
          <h2 style={{ margin: 0, marginBottom: "15px", fontSize: "1.2rem", color: "#e62117" }}>
            📍 미쉐린 가이드
          </h2>
          <div className="search-container" style={{ position: "relative" }}>
            <input
              type="text"
              value={searchTerm}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="식당 이름을 입력하세요"
              style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ddd" }}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            />
            {showSuggestions && suggestions.length > 0 && (
              <ul
                style={{
                  position: "absolute", top: "100%", left: 0, right: 0,
                  backgroundColor: "white", border: "1px solid #ccc",
                  zIndex: 1000, listStyle: "none", padding: 0, margin: 0,
                  borderRadius: "0 0 8px 8px",
                }}
              >
                {suggestions.map((s) => (
                  <li
                    key={s.id}
                    onClick={() => { setSearchTerm(s.restaurantName); handleSearch(s.restaurantName); }}
                    style={{ padding: "10px", cursor: "pointer", borderBottom: "1px solid #eee" }}
                  >
                    {s.restaurantName}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "15px" }}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => { setSelectedCategory(cat); setIsSearching(false); }}
                style={{
                  padding: "6px 12px", borderRadius: "20px", border: "1px solid #ddd",
                  backgroundColor: selectedCategory === cat ? "#e62117" : "white",
                  color: selectedCategory === cat ? "white" : "#333",
                  cursor: "pointer", fontSize: "0.85rem",
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto" }}>
          {selectedRestaurant ? (
            <div style={{ padding: "20px", animation: "fadeIn 0.3s" }}>
              <div
                onClick={() => handleImageClick(selectedRestaurant.id)}
                style={{
                  width: "100%", height: "200px", background: "#eee",
                  borderRadius: "12px", marginBottom: "15px",
                  overflow: "hidden", cursor: "pointer",
                }}
              >
                <img
                  src={selectedRestaurant.imageUrl || "기본이미지주소"}
                  alt="식당이미지"
                  style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s ease" }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                />
              </div>

              <h1 style={{ fontSize: "1.5rem", marginBottom: "10px" }}>
                {selectedRestaurant.restaurantName}
              </h1>

              <div style={{ marginBottom: "15px" }}>
                <span
                  style={{
                    background:
                      selectedRestaurant.markerColor.toLowerCase() === "yellow" ||
                      selectedRestaurant.markerColor === "#ffff00"
                        ? "#FFD700" : selectedRestaurant.markerColor,
                    color:
                      selectedRestaurant.markerColor.toLowerCase() === "yellow" ||
                      selectedRestaurant.markerColor === "#ffff00"
                        ? "#000000" : "white",
                    padding: "4px 12px", borderRadius: "20px",
                    fontSize: "0.85rem", fontWeight: "bold",
                    marginRight: "8px", display: "inline-block",
                  }}
                >
                  {selectedRestaurant.grade}
                </span>
                <span style={{ color: "#555", fontSize: "0.9rem", fontWeight: "500" }}>
                  {selectedRestaurant.category}
                </span>
              </div>

              <div style={{ fontSize: "0.9rem", lineHeight: "1.8" }}>
                <p>🏠 주소: {selectedRestaurant.address || "주소 없음"}</p>
                <p>📞 전화: {selectedRestaurant.phone || "전화 없음"}</p>
              </div>

              <button
                onClick={() => handleImageClick(selectedRestaurant.id)}
                style={{
                  width: "100%", padding: "12px", marginTop: "12px",
                  borderRadius: "8px", border: "none",
                  backgroundColor: "#e62117", color: "white",
                  cursor: "pointer", fontWeight: "bold", fontSize: "0.9rem",
                }}
              >
                상세페이지로 이동 →
              </button>

              <button
                onClick={() => setSelectedId(null)}
                style={{
                  width: "100%", padding: "12px", marginTop: "8px",
                  borderRadius: "8px", border: "1px solid #ddd",
                  cursor: "pointer", fontWeight: "bold",
                }}
              >
                목록으로 돌아가기
              </button>
            </div>
          ) : (
            <div>
              {filteredRestaurants.length > 0 ? (
                filteredRestaurants.map((res) => (
                  <div
                    key={res.id}
                    onClick={() => { setSelectedId(res.id); setMapCenter({ lat: res.lat, lng: res.lng }); }}
                    style={{ padding: "20px", borderBottom: "1px solid #f9f9f9", cursor: "pointer" }}
                  >
                    <div style={{ fontWeight: "bold" }}>{res.restaurantName}</div>
                    <div style={{ fontSize: "0.8rem", marginTop: "5px", display: "flex", alignItems: "center", gap: "5px" }}>
                      <span style={{ color: res.markerColor.toLowerCase() === "yellow" ? "#b8860b" : res.markerColor, fontWeight: "bold" }}>
                        {res.grade}
                      </span>
                      <span style={{ color: "#ddd" }}>|</span>
                      <span style={{ color: "#666" }}>{res.category}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ padding: "50px 0", textAlign: "center", color: "#bbb" }}>
                  검색 결과가 없습니다.
                </div>
              )}
            </div>
          )}
        </div>

        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          style={{
            position: "absolute", right: "-30px", top: "50%",
            transform: "translateY(-50%)", width: "30px", height: "60px",
            backgroundColor: "white", border: "1px solid #ddd",
            borderLeft: "none", borderRadius: "0 8px 8px 0",
            cursor: "pointer", color: "#e62117",
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