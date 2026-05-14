import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import MainPage from '../pages/MainPage'
import RestaurantListPage from '../pages/restaurant/RestaurantListPage'
import RestaurantDetailPage from '../pages/restaurant/RestaurantDetailPage'
import RestaurantManagePage from '../pages/restaurant/RestaurantManagePage'
import RestaurantPage from '../pages/RestaurantPage'
import NotFoundPage from '../pages/NotFoundPage'
import NoticesPage from '../pages/NoticesPage'
import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'
import AuthModal from '../components/common/AuthModal'

// ✅ Footer를 /map 페이지에서만 숨기기
function Layout() {
  const location = useLocation()
  const isMapPage = location.pathname === '/map'

  return (
    <>
      <Navbar />
      <AuthModal />
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/restaurants" element={<RestaurantListPage />} />
        <Route path="/restaurants/:id" element={<RestaurantDetailPage />} />
        <Route path="/restaurants/manage" element={<RestaurantManagePage />} />
        <Route path="/map" element={<RestaurantPage />} />
        <Route path="/notices" element={<NoticesPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      {!isMapPage && <Footer />}
    </>
  )
}

function AppRouter() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  )
}

export default AppRouter