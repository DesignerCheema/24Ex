import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/Layout/ProtectedRoute';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Deliveries from './pages/Deliveries';
import Transport from './pages/Transport';
import WarehousePage from './pages/Warehouse';
import Returns from './pages/Returns';
import NotFound from './pages/NotFound';
import Accounting from './pages/Accounting';
import Analytics from './pages/Analytics';
import Users from './pages/Users';
import Settings from './pages/Settings';
import PublicTracking from './pages/PublicTracking';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ProtectedRoute>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="orders" element={<Orders />} />
              <Route path="deliveries" element={<Deliveries />} />
              <Route path="transport" element={<Transport />} />
              <Route path="warehouse" element={<WarehousePage />} />
              <Route path="returns" element={<Returns />} />
              <Route path="accounting" element={<Accounting />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="users" element={<Users />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            <Route path="/track" element={<PublicTracking />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ProtectedRoute>
      </AuthProvider>
    </Router>
  );
}

export default App;