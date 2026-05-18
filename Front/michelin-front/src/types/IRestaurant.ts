// ── 공통 베이스 ─────────────────────────────────────────────────
export interface IRestaurantBase {
  id: number
  restaurantName: string
  grade: string
  lat: number
  lng: number
}

// ── P2 목록 / 상세 페이지용 (RestaurantListPage, RestaurantDetailPage, MainPage) ──
export interface IRestaurant extends IRestaurantBase {
  city: string
  district: string
  address: string
  phone: string
  isGreenStar: string
  viewCount: number
  mainImageUrl: string | null
  kakaoPlaceUrl: string
}

// ── MainPage 축약형 (필드 적게 쓰는 경우) ────────────────────────
export interface IRestaurantSummary extends IRestaurantBase {
  district: string
  mainImageUrl: string | null
}

// ── P4 지도 마커용 (RestaurantPage, RestaurantMapContainer) ───────
export interface IRestaurantMarker extends IRestaurantBase {
  markerColor: string
  category: string
  address?: string
  phone?: string
  imageUrl?: string
}