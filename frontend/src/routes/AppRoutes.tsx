// src/routes/AppRoutes.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/LoginPage';
import SignupPage from '../pages/SignupPage';
import DashboardPage from '../pages/DashboardPage';
import SellItemPage from '../pages/SellItemPage';
import ProductDetailPage from '../pages/ProductDetailPage'; // Import the new page
import { ProtectedRoute } from './ProtectedRoute';

// The /chat/:id route will be added in a future step
const ChatPage = () => <div>Chat Page</div>;

export const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/sell" element={<SellItemPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/chat/:id" element={<ChatPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
