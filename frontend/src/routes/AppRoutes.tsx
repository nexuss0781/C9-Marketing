// src/routes/AppRoutes.tsx
import { Routes, Route } from 'react-router-dom';
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/LoginPage';
import SignupPage from '../pages/SignupPage';
import DashboardPage from '../pages/DashboardPage';
import SellItemPage from '../pages/SellItemPage';
import ProductDetailPage from '../pages/ProductDetailPage';
import ChatPage from '../pages/ChatPage'; // Import the real ChatPage
import { ProtectedRoute } from './ProtectedRoute';

export const AppRoutes = () => {
  return (
    // BrowserRouter is now in App.tsx
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/sell" element={<SellItemPage />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/chat/:id" element={<ChatPage />} />
      </Route>
    </Routes>
  );
};
