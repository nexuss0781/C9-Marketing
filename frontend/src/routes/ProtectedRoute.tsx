// src/routes/ProtectedRoute.tsx
import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

export const ProtectedRoute = () => {
  const auth = useContext(AuthContext);

  if (auth?.isAuthenticated === false) {
    // User is not authenticated, redirect to login page
    return <Navigate to="/login" replace />;
  }

  // If authentication is still loading, you might want to show a spinner
  if (auth?.isAuthenticated === undefined) {
      return <div>Loading...</div>; // Or a proper loading spinner component
  }

  // User is authenticated, render the child route content
  return <Outlet />;
};
