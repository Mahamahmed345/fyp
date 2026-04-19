import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Database, FileText, MessageSquare, 
  ChevronDown, ChevronRight, Store, X, Users, Activity, LogOut, ShieldCheck
} from 'lucide-react';
import { useAuth } from "../context/AuthContext";
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const Sidebar = ({ isSidebarOpen, setSidebarOpen, onViewChange, user: userOverride }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user: contextUser } = useAuth();
  
  // Extract role from localStorage if context is empty (for direct URL access)
  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const user = userOverride || contextUser || storedUser;
  
  // URL-BASED ROLE OVERRIDE (Source of Truth for Testing/Access)
  let effectiveRole = user?.role || 'admin';
  if (location.pathname.startsWith('/admindashboard') || location.pathname.startsWith('/s/')) {
    effectiveRole = 'admin';
  } else if (location.pathname.startsWith('/manager/')) {
    // If we are on a manager path, ensure we use a manager role (even if logged in as admin)
    const storeId = location.pathname.split('/')[2]?.replace('s', '') || '1';
    effectiveRole = `store${storeId}`;
  }
  
  const isAdmin = effectiveRole === 'admin';
  const isManager = effectiveRole.startsWith('store');
  
  // States to handle dropdown toggles
  const [isStoresOpen, setStoresOpen] = useState(false);
  const [isReportsOpen, setReportsOpen] = useState(false);

  const stores = [
    { id: 1, name: 'Store 1', path: '/s/s1/dashboard', managerPath: '/manager/s1/dashboard' },
    { id: 2, name: 'Store 2', path: '/s/s2/dashboard', managerPath: '/manager/s2/dashboard' },
    { id: 3, name: 'Store 3', path: '/s/s3/dashboard', managerPath: '/manager/s3/dashboard' },
    { id: 4, name: 'Store 4', path: '/s/s4/dashboard', managerPath: '/manager/s4/dashboard' },
  ];

  // For Manager view: Find their specific store
  const personalTerminal = stores.find(s => s.managerPath.includes(user?.role?.replace('store', 's'))) || stores[0];

  const generateGlobalAuditReport = async () => {
    try {
      const response = await fetch('http://localhost:3002/strategic-intelligence');
      const data = await response.json();
      const { kpis, inventoryAudit } = data;

      const doc = new jsPDF();
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text("GLOBAL STRATEGIC COMMAND HUB: AUDIT", 14, 22);
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
      doc.text(`Strategic Integrity: Verified Model Snapshot`, 14, 35);

      // Global Summary Table
      const summaryBody = inventoryAudit.reduce((acc, curr) => {
        const store = curr.name || curr.storeId;
        if (!acc[store]) acc[store] = { name: store, val: 0, anom: 0, stock: 0, demand: 0 };
        acc[store].val += (curr.stock * curr.avgPrice);
        acc[store].anom += parseInt(curr.anomalyCount || 0);
        acc[store].stock += curr.stock;
        acc[store].demand += curr.demand;
        return acc;
      }, {});

      const tableData = Object.values(summaryBody).map(s => [
        s.name,
        `$${Math.round(s.val).toLocaleString()}`,
        s.anom,
        (s.demand / (s.stock / 30 || 1)).toFixed(1) + "x",
        s.anom > 20 ? 'Action Required' : 'Optimal'
      ]);

      autoTable(doc, {
        startY: 45,
        head: [['Store Terminal', 'Total Asset Value', 'Anomalies (QA)', 'Avg Turnover', 'Operational Status']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [139, 92, 246] }
      });

      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      const finalY = doc.lastAutoTable.finalY + 15;
      doc.text("Executive Summary:", 14, finalY);
      doc.setFont("helvetica", "normal");
      doc.text(`- Global Capital at Risk: $${kpis.totalValue.toLocaleString()}`, 14, finalY + 7);
      doc.text(`- Combined Anomaly Rate: ${kpis.totalAnomalies} Flagged Items`, 14, finalY + 14);

      doc.save("Global_Strategic_Audit.pdf");
    } catch (err) {
      console.error("Global Audit Print Failed:", err);
    }
  };

  const generateStoreReport = async (storeName) => {
    try {
      const storeIdArg = storeName.toLowerCase().replace('store ', 's');
      const response = await fetch(`http://localhost:3002/api/dashboard-intelligence?store=${storeIdArg}`);
      const data = await response.json();

      const doc = new jsPDF();
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text(`SUPPLY CHAIN REQUISITION: ${storeName.toUpperCase()}`, 14, 22);
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139); // Corrected from doc.fillColor
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);
      doc.text(`Terminal Sync: ${new Date(data.lastTerminalSync).toLocaleString()}`, 14, 35);
      
      autoTable(doc, {
        startY: 45,
        head: [['Category', 'On-Hand', '7D Forecast', 'QA Integrity', 'Status']],
        body: data.categoricalData.map(c => [
          c.category,
          c.stock,
          c.demand7d,
          c.accuracy + "%",
          c.status
        ]),
        theme: 'striped',
        headStyles: { fillColor: [59, 130, 246] }
      });

      const yPos = doc.lastAutoTable.finalY + 15;
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(40, 44, 52);
      doc.text("Quality Assurance (QA) Summary:", 14, yPos);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text(`- Detected ${data.kpis.anomalyCount} categorical anomalies during latest terminal scan.`, 14, yPos + 8);
      doc.text(`- Prophet Forecast Margin Delta: ${data.kpis.forecastMarginMAE}`, 14, yPos + 13);
      
      doc.save(`${storeName}_Operational_Audit.pdf`);
    } catch (err) {
      console.error("Store Audit Print Failed:", err);
    }
  };

  const NavItem = ({ icon, label, path, onClick, hasDropdown, isOpen }) => {
    const isActive = location.pathname === path;
    return (
      <div>
        <button 
          onClick={onClick || (() => {
            navigate(path);
            if (window.innerWidth < 1024) setSidebarOpen(false);
          })}
          className={`flex items-center justify-between w-full p-3 rounded-xl transition-all duration-200 ${
            isActive ? 'bg-[#8b5cf6] text-white font-bold' : 'text-text-muted hover:text-text-main hover:bg-black/5 dark:hover:bg-white/5'
          }`}
        >
          <div className="flex items-center gap-3">
            {icon}
            <span className="text-[11px] font-black uppercase tracking-widest">{label}</span>
          </div>
          {hasDropdown && (isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />)}
        </button>
      </div>
    );
  };

  return (
    <>
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-card-bg border-r border-border-soft p-6 flex flex-col gap-4 transition-transform duration-300 lg:translate-x-0 lg:static lg:h-screen ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-black tracking-tighter text-text-main uppercase italic">Smart<span className="text-[#3b82f6]">Stock</span></h1>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 text-text-muted"><X size={24} /></button>
        </div>

        <nav className="flex flex-col gap-1 flex-1 overflow-y-auto custom-scrollbar pr-2">
          {(() => {
            switch (effectiveRole) {
              case 'admin':
                return (
                  <>
                    <NavItem 
                      icon={<LayoutDashboard size={18} />} 
                      label="OVERVIEW" 
                      path="/admindashboard" 
                      onClick={() => {
                        if (onViewChange) onViewChange({ type: 'overview' });
                        navigate('/admindashboard');
                        if (window.innerWidth < 1024) setSidebarOpen(false);
                      }} 
                    />
                    <div className="my-2 border-t border-white/5" />
                    <NavItem 
                      icon={<Activity size={18} />} 
                      label="STORES TERMINAL" 
                      hasDropdown 
                      isOpen={isStoresOpen} 
                      onClick={() => setStoresOpen(!isStoresOpen)} 
                    />
                    {isStoresOpen && (
                      <div className="ml-9 flex flex-col gap-1 border-l border-border-soft mt-1">
                        {stores.map(store => (
                          <button 
                            key={store.id}
                            onClick={() => {
                              navigate(store.path);
                              if (window.innerWidth < 1024) setSidebarOpen(false);
                            }}
                            className="text-left py-2 px-4 text-[10px] font-bold text-text-muted hover:text-[#3b82f6] uppercase tracking-widest transition-colors"
                          >
                            {store.name.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    )}
                    <NavItem 
                      icon={<FileText size={18} />} 
                      label="REPORT HUB" 
                      hasDropdown 
                      isOpen={isReportsOpen} 
                      onClick={() => setReportsOpen(!isReportsOpen)} 
                    />
                    {isReportsOpen && (
                      <div className="ml-9 flex flex-col gap-1 border-l border-border-soft mt-1">
                        <button 
                          onClick={() => generateGlobalAuditReport()}
                          className="text-left py-2 px-4 text-[10px] font-black text-[#8b5cf6] hover:bg-[#8b5cf6]/5 uppercase tracking-widest transition-colors border-b border-white/5 mb-1"
                        >
                          GLOBAL STRATEGIC AUDIT
                        </button>
                        {stores.map(store => (
                          <button 
                            key={store.id}
                            onClick={() => generateStoreReport(store.name)}
                            className="text-left py-2 px-4 text-[10px] font-bold text-text-muted hover:text-[#10b981] uppercase tracking-widest transition-colors"
                          >
                            {store.name.toUpperCase()} RESTOCK PDF
                          </button>
                        ))}
                      </div>
                    )}
                    <NavItem 
                      icon={<MessageSquare size={18} />} 
                      label="MANAGER CHAT" 
                      path="/chat" 
                    />
                    <div className="mt-8 mb-2">
                      <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] mb-4 px-3">ADMINISTRATION</p>
                      <NavItem 
                        icon={<ShieldCheck size={18} className="text-[#8b5cf6]" />} 
                        label="MANAGER CONTROLS" 
                        path="/users" 
                      />
                    </div>
                  </>
                );
              default: // Manager roles (store1, store2, etc.)
                return (
                  <>
                    {/* 1. Return to Terminal */}
                    <NavItem 
                      icon={<Store size={18} />} 
                      label="PERSONAL TERMINAL" 
                      path={personalTerminal.managerPath} 
                    />

                    <div className="my-2 border-t border-white/5" />

                    {/* 2. ONLY Local Reports (Specifically as requested) */}
                    <NavItem 
                      icon={<FileText size={18} />} 
                      label="REPORT HUB" 
                      hasDropdown 
                      isOpen={isReportsOpen} 
                      onClick={() => setReportsOpen(!isReportsOpen)} 
                    />
                    {isReportsOpen && (
                      <div className="ml-9 flex flex-col gap-1 border-l border-border-soft mt-1">
                        <button 
                          onClick={() => generateStoreReport(personalTerminal.name)}
                          className="text-left py-2 px-4 text-[10px] font-bold text-text-muted hover:text-[#10b981] uppercase tracking-widest transition-colors"
                        >
                          {personalTerminal.name.toUpperCase()} DETAILED AUDIT
                        </button>
                      </div>
                    )}

                    <NavItem 
                      icon={<MessageSquare size={18} />} 
                      label="MANAGER CHAT" 
                      path="/chat" 
                    />

                    <div className="mt-8 mb-2">
                      <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] mb-4 px-3">ADMINISTRATION</p>
                      <NavItem 
                        icon={<ShieldCheck size={18} className="text-blue-400" />} 
                        label="AUDIT LOGS" 
                        path="/protected" 
                      />
                    </div>
                  </>
                );
            }
          })()}
        </nav>

        <div className="mt-auto pt-6 border-t border-border-soft">
          <button 
            onClick={() => {
              logout();
              navigate('/login');
            }} 
            className="flex items-center gap-3 text-red-400 p-3 w-full hover:bg-red-500/10 rounded-xl transition-colors"
          >
            <LogOut size={16} />
            <span className="font-bold uppercase text-[10px] tracking-widest">Terminate Session</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;