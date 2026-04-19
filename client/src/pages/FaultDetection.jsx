import React, { useState, useEffect } from 'react';
import { 
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { AlertTriangle, ShieldCheck, Activity, Search, ShieldAlert, Eye } from 'lucide-react';
import Sidebar from '../components/sidebar'; 
import Header from '../components/header'; 
import axios from 'axios';
import { useParams } from 'react-router-dom';

const FaultDetection = () => {
  const { id } = useParams();
  const storeId = id ? id.toUpperCase() : 'S1';
  const displayStore = id ? id.toUpperCase().replace('S', 'Store ') : 'Store 1';
  
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const PIE_COLORS = ['#ef4444', '#f97316', '#f59e0b', '#3b82f6']; // Red, Orange, Amber, Blue

  useEffect(() => {
    const fetchFaultIntelligence = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`http://localhost:3002/api/dashboard-intelligence?store=${id || 's1'}`);
        setData(response.data);
      } catch (err) {
        console.error("Failed to fetch fault intelligence:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFaultIntelligence();
  }, [id]);

  if (loading || !data) {
    return (
      <div className="h-screen flex flex-col items-center justify-center space-y-4 bg-global-bg">
        <Activity className="text-[#3b82f6] animate-spin" size={48} />
        <p className="text-xs font-black uppercase tracking-widest text-[#3b82f6]">Initializing QA Audit Scan...</p>
      </div>
    );
  }

  const { faultBreakdown, categoricalData, kpis } = data;

  // Map breakdown to Chart
  const distribution = [
    { name: 'Loss Sale', value: faultBreakdown.lossSale },
    { name: 'Revenue Gaps', value: faultBreakdown.revenueGap },
    { name: 'Dead Stock', value: faultBreakdown.deadStock },
    { name: 'Pricing Corrections', value: faultBreakdown.marketGap }
  ].filter(d => d.value > 0);

  // Map Categorical Data to Log Entries
  const auditLogs = categoricalData.map((item, idx) => ({
    id: `QA-${1000 + idx}`,
    category: item.category,
    accuracy: item.accuracy + '%',
    status: item.status,
    impact: item.status === 'Critical' ? 'High Risk' : 'Standard Audit'
  }));

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-global-bg text-text-main font-sans overflow-hidden">
      <Sidebar isSidebarOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto custom-scrollbar">
        <Header setSidebarOpen={setSidebarOpen} />

        <main className="p-4 md:p-8 lg:p-10 space-y-8">
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card-bg p-8 rounded-3xl border border-white/5 shadow-2xl">
            <div>
              <h2 className="text-2xl font-black tracking-tight uppercase italic flex items-center gap-3">
                <ShieldAlert className="text-[#ef4444]" /> Quality Assurance Audit: {displayStore}
              </h2>
              <p className="text-text-muted text-[10px] font-black uppercase tracking-widest mt-2">Anomaly Detection v4.2 | Real Trained Model Insights</p>
            </div>
            <div className="px-4 py-2 bg-green-500/10 rounded-xl border border-green-500/20 text-xs font-black uppercase text-green-500 flex items-center gap-2">
               <ShieldCheck size={16} /> Operational Integrity Verified
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* 1. DISTRIBUTION PIE CHART */}
            <section className="lg:col-span-4 dashboard-card p-8 flex flex-col items-center min-h-[450px]">
              <h3 className="w-full text-xs font-black mb-8 uppercase tracking-widest text-[#3b82f6] italic">Qualitative Fault Distribution</h3>
              <div className="h-64 w-full">
                {distribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={distribution}
                        innerRadius={60}
                        outerRadius={85}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {distribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} stroke="none" />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }}
                        itemStyle={{ color: '#fff', fontSize: '10px', textTransform: 'uppercase', fontWeight: '900' }}
                      />
                      <Legend 
                        verticalAlign="bottom" 
                        iconType="circle"
                        formatter={(value) => <span className="text-[9px] font-black uppercase text-text-muted">{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                    <ShieldCheck size={48} className="text-green-500/20" />
                    <p className="text-[10px] font-black uppercase text-text-muted">No Model Violations Detected</p>
                  </div>
                )}
              </div>
            </section>

            {/* 2. REAL-TIME INSPECTION LOG */}
            <section className="lg:col-span-8 dashboard-card p-8 overflow-hidden min-h-[450px]">
              <h3 className="text-xs font-black mb-8 uppercase tracking-widest text-[#8b5cf6] italic flex items-center gap-2">
                <Eye size={18} /> Model Inspection Logs
              </h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/5 pb-4 text-[10px] font-black uppercase text-text-muted tracking-widest italic">
                      <th className="pb-4">Audit ID</th>
                      <th className="pb-4">Intake Category</th>
                      <th className="pb-4 text-center">Prediction Reliability</th>
                      <th className="pb-4 text-right">Audit Impact</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.05]">
                    {auditLogs.map((log, index) => (
                      <tr key={index} className="group hover:bg-white/[0.02] transition-colors">
                        <td className="py-5 font-mono text-[#64748b] text-xs">{log.id}</td>
                        <td className="py-5 font-black text-xs uppercase tracking-tighter italic text-text-main group-hover:translate-x-1 transition-transform">{log.category}</td>
                        <td className="py-5 text-center">
                          <span className="text-xs font-black text-[#3b82f6] bg-[#3b82f6]/10 px-2 py-0.5 rounded">{log.accuracy}</span>
                        </td>
                        <td className="py-5 text-right">
                          <span className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest ${
                            log.impact === 'High Risk' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-green-500/10 text-green-500 border border-green-500/20'
                          }`}>
                            {log.impact}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          {/* 3. DYNAMIC SUMMARY CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <SummaryStat 
              icon={<AlertTriangle className="text-[#ef4444]" />} 
              val={kpis.forecastMarginMAE} 
              label="Audit Error Margin" 
            />
            <SummaryStat 
              icon={<Activity className="text-[#3b82f6]" />} 
              val={kpis.anomalyCount} 
              label="Model Flagged Violations" 
            />
            <SummaryStat 
              icon={<Search className="text-[#8b5cf6]" />} 
              val={kpis.shelfUtilization} 
              label="Physical Capacity Index" 
            />
          </div>
        </main>
      </div>
    </div>
  );
};

const SummaryStat = ({ icon, val, label }) => (
  <div className="dashboard-card p-8 flex flex-col items-center sm:items-start transition-all hover:scale-[1.02]">
    <div className="p-3 bg-white/5 rounded-xl mb-4">
      {React.cloneElement(icon, { size: 24 })}
    </div>
    <p className="text-3xl font-black italic tracking-tighter text-text-main">{val}</p>
    <p className="text-[10px] uppercase font-black text-text-muted tracking-[0.2em] mt-1">{label}</p>
  </div>
);

export default FaultDetection;