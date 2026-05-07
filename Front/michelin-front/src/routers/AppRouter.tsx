import { BrowserRouter, Routes, Route } from 'react-router-dom'
import RestaurantListPage from '../pages/restaurant/RestaurantListPage'
import RestaurantDetailPage from '../pages/restaurant/RestaurantDetailPage'
import RestaurantManagePage from '../pages/restaurant/RestaurantManagePage'

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 맛집 */}
        <Route path="/restaurants" element={<RestaurantListPage />} />
        <Route path="/restaurants/:id" element={<RestaurantDetailPage />} />
        <Route path="/restaurants/manage" element={<RestaurantManagePage />} />

        {/* 기본 경로 */}
        <Route path="/" element={<RestaurantListPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter