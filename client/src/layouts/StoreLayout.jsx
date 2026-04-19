import React, { useState } from 'react';
import { Outlet, useParams, useLocation } from 'react-router-dom';
import Sidebar from '../components/sidebar';
import Header from '../components/header';
import { useAuth } from '../context/AuthContext';

const StoreLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const { id } = useParams(); // e.g., 's1', 's2'
  const location = useLocation();
  const { user } = useAuth();

  // Determine context: are we in the Operational Manager Terminal or Strategic Admin View?
  const isOperational = location.pathname.startsWith('/manager');
  const roleLabel = isOperational ? 'Manager' : 'Admin';

  // If we are in the operational view, we want the sidebar to behave as a Manager
  // If we are in the strategic view (/s/), the sidebar should behave according to the user's actual role
  // But we can force the Manager perspective if needed by passing a store role.
  const sidebarUser = isOperational ? { role: `store${id?.replace('s', '')}` } : { role: 'admin' };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-global-bg text-white overflow-hidden">
      <Sidebar 
        isSidebarOpen={isSidebarOpen} 
        setSidebarOpen={setSidebarOpen} 
        user={sidebarUser} 
      />

      <div className="flex-1 flex flex-col h-screen overflow-y-auto">
        <Header setSidebarOpen={setSidebarOpen} roleLabel={roleLabel} user={user} />
        
        <div className="flex-1">
          <Outlet /> 
        </div>
      </div>
    </div>
  );
};

export default StoreLayout;