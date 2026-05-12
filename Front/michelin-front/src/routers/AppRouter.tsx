import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MainPage from '../pages/MainPage'
import RestaurantListPage from '../pages/restaurant/RestaurantListPage'
import RestaurantDetailPage from '../pages/restaurant/RestaurantDetailPage'
import RestaurantManagePage from '../pages/restaurant/RestaurantManagePage'
import NotFoundPage from '../pages/NotFoundPage'
import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'

function AppRouter() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/restaurants" element={<RestaurantListPage />} />
        <Route path="/restaurants/:id" element={<RestaurantDetailPage />} />
        <Route path="/restaurants/manage" element={<RestaurantManagePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  )
}

export default AppRouter