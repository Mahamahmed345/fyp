import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Activity, AlertCircle, TrendingUp, Zap, Clock,
  CheckCircle2, Server, ShieldCheck
} from 'lucide-react';
import Sidebar from '../components/sidebar';
import Header from '../components/header';
import AdminChat from '../pages/AdminChat';
import IntelligenceHub from '../components/IntelligenceHub';
import { useAuth } from '../context/AuthContext';

// No mock data allowed

const AdminDashboard = () => {
  const { user } = useAuth();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState({ type: 'overview' });
  const [strategicData, setStrategicData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [selectedStoreReport, setSelectedStoreReport] = useState('all');

  // FETCH REAL STRATEGIC ANALYTICS
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://localhost:3002/strategic-intelligence');
        if (response.data) {
          setStrategicData(response.data);
          setError(false);
        }
      } catch (err) {
        console.error("Strategic Analytics Fetch Failed:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const OverviewContent = () => {
    const { kpis, inventoryAudit } = strategicData || { kpis: {}, inventoryAudit: [] };
    
    // Task Queue Logic: Critical Stock & Anomalies
    const tasks = inventoryAudit
        .filter(item => item.status === 'Critical' || item.anomalyCount > 0)
        .map((item, idx) => ({
            id: idx,
            type: item.status === 'Critical' ? 'Critical' : 'Anomaly',
            msg: item.status === 'Critical' 
                ? `Action: ${item.name} ${item.category} is Critical - Restock Now`
                : `Audit: ${item.name} ${item.category} has ${item.anomalyCount} Anomalies`,
            color: item.status === 'Critical' ? '#ef4444' : '#f59e0b'
        }));

    return (
        <div className="space-y-8">
            {/* 1. STRATEGIC KPI ROW */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                <div className="dashboard-card p-6 border-l-4 border-[#3b82f6]">
                    <p className="text-[9px] font-black uppercase text-text-muted mb-2 tracking-widest">Capital at Risk</p>
                    <p className="text-3xl font-black text-text-main">${kpis.totalValue?.toLocaleString()}</p>
                    <p className="text-[10px] text-text-muted mt-1 uppercase font-bold">Total Potential Revenue</p>
                </div>
                <div className="dashboard-card p-6 border-l-4 border-[#ef4444]">
                    <p className="text-[9px] font-black uppercase text-text-muted mb-2 tracking-widest">Predicted Stockouts</p>
                    <p className="text-3xl font-black text-text-main">{kpis.predictedStockouts}</p>
                    <p className="text-[10px] text-text-muted mt-1 uppercase font-bold">Items below demand threshold</p>
                </div>
                <div className="dashboard-card p-6 border-l-4 border-[#f59e0b]">
                    <p className="text-[9px] font-black uppercase text-text-muted mb-2 tracking-widest">Anomalies Detected</p>
                    <p className="text-3xl font-black text-text-main">{kpis.totalAnomalies}</p>
                    <p className="text-[10px] text-text-muted mt-1 uppercase font-bold">Quality deviations detected</p>
                </div>
                <div className="dashboard-card p-6 border-l-4 border-[#10b981]">
                    <p className="text-[9px] font-black uppercase text-text-muted mb-2 tracking-widest">Inventory Turnover</p>
                    <p className="text-3xl font-black text-text-main">{kpis.inventoryTurnover}</p>
                    <p className="text-[10px] text-text-muted mt-1 uppercase font-bold">Sales Velocity: {kpis.lastUpdate}</p>
                </div>
            </div>

            {/* 2. REUSABLE STRATEGIC INTELLIGENCE HUB (CHARTS) */}
            <IntelligenceHub storeId="all" liveData={inventoryAudit} />

            {/* 3. TASK QUEUE (ACTION REQUIRED) */}
            <section className="dashboard-card p-6">
                <h3 className="text-xs font-black uppercase text-[#3b82f6] flex items-center gap-2 mb-4 tracking-widest italic">
                    <Activity size={14} /> Priority Task Queue
                </h3>
                <div className="space-y-3">
                    {tasks.length > 0 ? tasks.slice(0, 4).map((task, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-white/5 border border-border-soft rounded-xl hover:bg-white/10 transition-all cursor-pointer">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: task.color }} />
                                <p className="text-xs font-bold text-text-main">{task.msg}</p>
                            </div>
                            <span className="text-[9px] font-black uppercase text-text-muted">Analyze</span>
                        </div>
                    )) : (
                        <div className="p-4 text-center border border-dashed border-white/10 rounded-xl">
                            <p className="text-[10px] text-text-muted uppercase font-bold">No Urgent Actions Required</p>
                        </div>
                    )}
                </div>
            </section>

            {/* 3. MULTI-STORE INVENTORY HEALTH AUDIT TABLE */}
            <section className="dashboard-card p-8 mb-10 overflow-hidden">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-lg font-black tracking-tight uppercase italic text-text-main flex items-center gap-2">
                        <Activity className="text-[#3b82f6]" size={20} /> Multi-Store Inventory Health Audit
                    </h3>
                    <span className="px-3 py-1 bg-blue-500/10 text-blue-500 rounded-full text-[9px] font-black uppercase border border-blue-500/20">Live Sync</span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs min-w-[600px]">
                        <thead>
                            <tr className="border-b border-border-soft text-text-muted uppercase font-black tracking-widest text-[9px]">
                                <th className="pb-5 px-4">#</th>
                                <th className="pb-5 px-4">Terminal Name</th>
                                <th className="pb-5 px-4">Stock</th>
                                <th className="pb-5 px-4">Monthly Demand</th>
                                <th className="pb-5 px-4 text-center">Days of Cover</th>
                                <th className="pb-5 px-4 text-right">Strategic Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-soft font-bold">
                            {inventoryAudit.map((row, i) => (
                                <tr key={i} className="group hover:bg-white/5 transition-all">
                                    <td className="py-6 px-4 font-mono text-text-muted">0{i + 1}</td>
                                    <td className="py-6 px-4">
                                        <p className="text-sm font-black text-text-main tracking-tight">
                                            {row.name} - <span className="text-[#3b82f6]">{row.category}</span>
                                        </p>
                                    </td>
                                    <td className="py-6 px-4 font-mono text-text-main">{row.stock} Units</td>
                                    <td className="py-6 px-4 font-mono text-[#3b82f6]">{row.demand} Units</td>
                                    <td className="py-6 px-4 text-center">
                                        <p className={`font-mono ${row.daysOfCover < 10 ? 'text-red-500' : 'text-text-main'}`}>{row.daysOfCover}</p>
                                        <p className="text-[8px] uppercase text-text-muted">Days</p>
                                    </td>
                                    <td className="py-6 px-4 text-right">
                                        <span className={`px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${
                                            row.status === 'Critical' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                                            row.status === 'Reorder' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' :
                                            row.status === 'Dead Stock' ? 'bg-gray-500/10 text-text-muted border border-white/10' :
                                            'bg-green-500/10 text-green-500 border border-green-500/20'
                                        }`}>
                                            {row.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-global-bg text-text-main font-sans overflow-hidden">
      <Sidebar isSidebarOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen} onViewChange={setActiveView} user={{ role: 'admin' }} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header setSidebarOpen={setSidebarOpen} roleLabel="Admin" user={user} />

        <main className="flex-1 p-4 md:p-8 lg:p-10 overflow-y-auto h-full custom-scrollbar">
          {activeView.type === 'overview' && (
            loading && !strategicData ? (
              <div className="flex-1 flex flex-col items-center justify-center h-[60vh] space-y-4">
                <Server className="text-[#3b82f6] animate-bounce" size={48} />
                <p className="text-xs font-black uppercase tracking-[0.3em] text-text-muted">Synchronizing AI Models...</p>
              </div>
            ) : <OverviewContent />
          )}
          {activeView.type === 'chat' && (
            <div className="h-full min-h-[600px] w-full rounded-xl overflow-hidden shadow-lg border border-border-soft flex flex-col">
              <AdminChat />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;