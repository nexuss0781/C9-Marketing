// src/routes/AppRoutes.tsx
import { Routes, Route } from 'react-router-dom';
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/LoginPage';
import SignupPage from '../pages/SignupPage';
import DashboardPage from '../pages/DashboardPage';
import SellItemPage from '../pages/SellItemPage';
import ProductDetailPage from '../pages/ProductDetailPage';
import ChatPage from '../pages/ChatPage';
import SettingsPage from '../pages/SettingsPage';
import ProfilePage from '../pages/ProfilePage';
import CategoryPage from '../pages/CategoryPage'; // New
import OrdersPage from '../pages/OrdersPage'; // New (will create in next step)
import { ProtectedRoute } from './ProtectedRoute';

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/sell" element={<SellItemPage />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/chat/:id" element={<ChatPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/profile/:username" element={<ProfilePage />} />
        <Route path="/category/:categoryName" element={<CategoryPage />} />
        <Route path="/my-orders" element={<OrdersPage />} />
      </Route>
    </Routes>
  );
};
