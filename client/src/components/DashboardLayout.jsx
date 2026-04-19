import React, { useState } from 'react';
import Sidebar from './sidebar';

const DashboardLayout = ({ children }) => {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      {/* Sidebar remains fixed or becomes a drawer on mobile */}
      <Sidebar />
      
      {/* Main content adjusts width dynamically */}
      <main className="flex-1 p-4 md:p-8 lg:p-10 w-full overflow-x-hidden">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;