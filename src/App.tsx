// src/App.tsx
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import PrivateRoute from './components/layout/PrivateRoute';
import LoadingScreen from './components/ui/LoadingScreen';

import LoginPage from './pages/LoginPage';
import ShiftSelectionPage from './pages/ShiftSelectionPage';
import InventoryPage from './pages/InventoryPage';
import ReportsPage from './pages/ReportsPage';

const AppRoutes: React.FC = () => {
  const { loading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    if (!loading) {
      const splashTimeout = setTimeout(() => setShowSplash(false), 3000);
      return () => clearTimeout(splashTimeout);
    }
  }, [loading]);

  if (loading || showSplash) {
    return <LoadingScreen />;
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<PrivateRoute />}>
          <Route path="/" element={<ShiftSelectionPage />} />
          <Route path="/inventory/:shift" element={<InventoryPage />} />
          <Route path="/reports" element={<ReportsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

const App: React.FC = () => (
  <AuthProvider>
    <AppRoutes />
  </AuthProvider>
);

export default App;
