import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

// Components Folder (Casing checked against filesystem)
import Login from "./components/Login";
import Signup from "./components/Signup";
import AdminDashboard from "./components/admindashboard"; 
import Sidebar from "./components/sidebar";
import Header from "./components/header";

// Pages Folder (Casing checked against filesystem)
import AdminChat from "./pages/AdminChat";
import UserChat from "./pages/UserChat";
import StoreAdminView from "./components/StoreAdminView"; 
import StoreManagerDashboard from "./components/StoreManagerDashboard"; 
import Store1Analytics from "./pages/Store1Analytics";
import FaultDetection from "./pages/FaultDetection";
import Users from "./pages/users1";

// Layouts Folder
import StoreLayout from "./layouts/StoreLayout";

// A component to protect routes
const ProtectedRoute = ({ children }) => {
  // Bypassing auth for now
  return children;
};

// A component to enforce role-based access
const RoleGate = ({ children, allowedRoles }) => {
  // Bypassing role gate for now
  return children;
};

// A simple component to redirect based on role
const DashboardDispatcher = () => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  if (user.role === 'admin') {
    return <Navigate to="/admindashboard" replace />;
  }

  // Managers go to their PRIVATE workstations
  if (user.role.startsWith('store')) {
    const storeNode = user.role.replace('store', 's');
    return <Navigate to={`/manager/${storeNode}/dashboard`} replace />;
  }

  return <Navigate to="/admindashboard" replace />;
};

// Intelligently redirect for the catch-all
const CatchAllRedirect = () => {
  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Dashboard Dispatcher */}
        <Route path="/dashboard" element={<DashboardDispatcher />} />

        {/* Admin Dashboard Routes - Protected */}
        <Route path="/admindashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><AdminChat /></ProtectedRoute>} />
        <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />

        {/* 1. STRATEGIC STORE VIEWS (Admin Only) */}
        <Route path="/s/:id" element={<RoleGate allowedRoles={['admin']}><StoreLayout /></RoleGate>}>
          <Route path="dashboard" element={<StoreAdminView />} />
          <Route path="analytics" element={<Store1Analytics />} />
          <Route path="faults" element={<FaultDetection />} />
          <Route path="chat" element={<UserChat />} />
        </Route>

        {/* 2. OPERATIONAL MANAGER TERMINALS (Private to Managers) */}
        <Route path="/manager/:id" element={<RoleGate allowedRoles={['store1', 'store2', 'store3', 'store4']}><StoreLayout /></RoleGate>}>
          <Route path="dashboard" element={<StoreManagerDashboard />} />
          <Route path="chat" element={<UserChat />} />
        </Route>

        {/* Redirects for common misspellings or requested aliases */}
        <Route path="/s1/dashboard" element={<Navigate to="/s/s1/dashboard" replace />} />
        <Route path="/store1-dashboard" element={<Navigate to="/s/s1/dashboard" replace />} />
        <Route path="/admindahsbapord" element={<Navigate to="/admindashboard" replace />} />
        <Route path="/admindahsbaord" element={<Navigate to="/admindashboard" replace />} />

        <Route path="*" element={<CatchAllRedirect />} />
      </Routes>
    </Router>
  );
}

export default App;