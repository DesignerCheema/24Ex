import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/Layout/ProtectedRoute';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import CreateOrder from './pages/Orders/CreateOrder';
import PendingOrders from './pages/Orders/PendingOrders';
import CompletedOrders from './pages/Orders/CompletedOrders';
import DeliveryRoutes from './pages/Deliveries/DeliveryRoutes';
import DeliveryAgents from './pages/Deliveries/DeliveryAgents';
import DeliveryHistory from './pages/Deliveries/DeliveryHistory';
import AddVehicle from './pages/Transport/AddVehicle';
import MaintenanceManagement from './pages/Transport/MaintenanceManagement';
import FuelTracking from './pages/Transport/FuelTracking';
import InventoryManagement from './pages/Warehouse/InventoryManagement';
import ReceivingManagement from './pages/Warehouse/ReceivingManagement';
import PickingTasks from './pages/Warehouse/PickingTasks';
import CreateReturn from './pages/Returns/CreateReturn';
import PendingReturns from './pages/Returns/PendingReturns';
import ProcessedReturns from './pages/Returns/ProcessedReturns';
import AddUser from './pages/Users/AddUser';
import RolesPermissions from './pages/Users/RolesPermissions';
import UserActivity from './pages/Users/UserActivity';
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
              <Route path="orders/create" element={<CreateOrder />} />
              <Route path="orders/pending" element={<PendingOrders />} />
              <Route path="orders/completed" element={<CompletedOrders />} />
              <Route path="deliveries" element={<Deliveries />} />
              <Route path="deliveries/routes" element={<DeliveryRoutes />} />
              <Route path="deliveries/agents" element={<DeliveryAgents />} />
              <Route path="deliveries/history" element={<DeliveryHistory />} />
              <Route path="transport" element={<Transport />} />
              <Route path="transport/add" element={<AddVehicle />} />
              <Route path="transport/maintenance" element={<MaintenanceManagement />} />
              <Route path="transport/fuel" element={<FuelTracking />} />
              <Route path="warehouse" element={<WarehousePage />} />
              <Route path="warehouse/inventory" element={<InventoryManagement />} />
              <Route path="warehouse/receiving" element={<ReceivingManagement />} />
              <Route path="warehouse/picking" element={<PickingTasks />} />
              <Route path="returns" element={<Returns />} />
              <Route path="returns/create" element={<CreateReturn />} />
              <Route path="returns/pending" element={<PendingReturns />} />
              <Route path="returns/processed" element={<ProcessedReturns />} />
              <Route path="accounting" element={<Accounting />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="users" element={<Users />} />
              <Route path="users/add" element={<AddUser />} />
              <Route path="users/roles" element={<RolesPermissions />} />
              <Route path="users/activity" element={<UserActivity />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            <Route path="/track" element={<PublicTracking />} />
          </Routes>
        </ProtectedRoute>
        <Routes>
          <Route path="/track" element={<PublicTracking />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;