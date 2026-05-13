import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MainPage from '../pages/MainPage'
import RestaurantListPage from '../pages/restaurant/RestaurantListPage'
import RestaurantDetailPage from '../pages/restaurant/RestaurantDetailPage'
import RestaurantManagePage from '../pages/restaurant/RestaurantManagePage'
import NotFoundPage from '../pages/NotFoundPage'
import NoticesPage from '../pages/NoticesPage'
import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'
import AuthModal from '../components/common/AuthModal'

function AppRouter() {
  return (
    <BrowserRouter>
      <Navbar />
      <AuthModal />
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/restaurants" element={<RestaurantListPage />} />
        <Route path="/restaurants/:id" element={<RestaurantDetailPage />} />
        <Route path="/restaurants/manage" element={<RestaurantManagePage />} />
        <Route path="/notices" element={<NoticesPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  )
}

export default AppRouter