import React from 'react';
import { useParams } from 'react-router-dom';
import { 
  TrendingUp, BarChart3, ShieldCheck, BrainCircuit, Activity,
  Truck, AlertCircle, Eye, Gauge, ArrowRight
} from 'lucide-react';
import axios from 'axios';
import IntelligenceHub from './IntelligenceHub';

const StoreAdminView = () => {
  const { id } = useParams(); // e.g., 's1', 's2'
  const storeName = id ? id.toUpperCase().replace('S', 'Store ') : 'Store 1';
  const [liveData, setLiveData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`http://localhost:3002/api/dashboard-intelligence?store=${id || 's1'}`);
        if (response.data) {
          setLiveData(response.data);
        }
      } catch (err) {
        console.error("Failed to fetch operational data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading || !liveData) return <div className="p-20 text-center animate-pulse text-[#3b82f6] font-black italic uppercase">Synchronizing Local Assets...</div>;

  const { categoricalData, kpis, lastTerminalSync, transferSuggestions } = liveData;

  return (
    <main className="p-4 md:p-8 space-y-10">
      {/* 1. OPERATIONAL HEADER */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-card-bg/30 p-8 rounded-3xl border border-white/5 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
            <Gauge size={24} />
          </div>
          <div>
            <h2 className="text-3xl font-black italic text-text-main uppercase tracking-tighter leading-none">{storeName} Operational Health</h2>
            <p className="text-[10px] font-black text-text-muted mt-2 uppercase tracking-[0.3em] flex items-center gap-2">
              <Activity size={12} className="text-blue-500" /> Active Terminal Monitoring
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="bg-black/40 px-6 py-3 rounded-2xl border border-white/5 flex items-center gap-3">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]" />
            <p className="text-[10px] font-black uppercase text-text-main tracking-widest">Last Terminal Sync: {new Date(lastTerminalSync).toLocaleTimeString()}</p>
          </div>
        </div>
      </header>

      {/* 2. OPERATIONAL KPI ROW */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="dashboard-card p-6 border-l-4 border-blue-500">
           <p className="text-[9px] font-black uppercase text-text-muted mb-2 tracking-widest">Shelf Capacity Utilization</p>
           <p className="text-3xl font-black text-text-main">{kpis.shelfUtilization}</p>
           <div className="w-full h-1.5 bg-white/5 rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-blue-500" style={{ width: kpis.shelfUtilization }}></div>
           </div>
        </div>
        <div className="dashboard-card p-6 border-l-4 border-[#8b5cf6]">
           <p className="text-[9px] font-black uppercase text-text-muted mb-2 tracking-widest">Forecast Margin (MAE)</p>
           <p className="text-3xl font-black text-text-main">{kpis.forecastMarginMAE}</p>
           <p className="text-[10px] text-text-muted mt-1 font-bold uppercase">Optimal Prediction Corridor</p>
        </div>
        <div className="dashboard-card p-6 border-l-4 border-orange-500">
           <p className="text-[9px] font-black uppercase text-text-muted mb-2 tracking-widest">Total Capital at Risk</p>
           <p className="text-3xl font-black text-text-main">${kpis.capitalAtRisk.toLocaleString()}</p>
           <p className="text-[10px] text-text-muted mt-1 font-bold uppercase">Categorical Valuation</p>
        </div>
        <div className="dashboard-card p-6 border-l-4 border-green-500">
           <p className="text-[9px] font-black uppercase text-text-muted mb-2 tracking-widest">Anomalies Detected</p>
           <p className="text-3xl font-black text-text-main">{kpis.anomalyCount}</p>
           <p className="text-[10px] text-text-muted mt-1 font-bold uppercase">Pending Quality Audits</p>
        </div>
      </div>

      {/* 3. INTELLIGENCE HUB (CHARTS) */}
      <IntelligenceHub storeId={id || 's1'} liveData={categoricalData} />

      {/* 4. STRATEGIC INSIGHTS AND TACTICAL RESTOCK */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2 dashboard-card p-8">
          <h3 className="text-xs font-black uppercase tracking-widest text-[#3b82f6] mb-8 flex items-center gap-3">
            <BarChart3 size={18} /> Category Intelligence & Stock Management
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px]">
              <thead>
                <tr className="text-text-muted uppercase border-b border-white/5 font-black tracking-widest">
                  <th className="pb-4 px-2">Category</th>
                  <th className="pb-4 px-2">Stock Level</th>
                  <th className="pb-4 px-2">7-Day Forecast</th>
                  <th className="pb-4 px-2">Days of Cover</th>
                  <th className="pb-4 px-2 text-right">Operational Status</th>
                </tr>
              </thead>
              <tbody className="font-bold text-text-main">
                {categoricalData.map((row, i) => (
                  <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                    <td className="py-5 px-2 text-sm">{row.category}</td>
                    <td className="py-5 px-2 font-mono">{row.stock} Units</td>
                    <td className="py-5 px-2 font-mono text-[#3b82f6]">{row.demand7d} Units</td>
                    <td className="py-5 px-2 font-mono">
                      <span className={parseFloat(row.daysOfCover) < 10 ? 'text-orange-500' : 'text-text-main'}>
                        {row.daysOfCover} Days
                      </span>
                    </td>
                    <td className="py-5 px-2 text-right">
                      <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest ${
                        row.status === 'Critical' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                        row.status === 'Low' ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' :
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

        <section className="space-y-8">
            {/* TACTICAL RESTOCK / TRANSFERS */}
            <div className="dashboard-card p-6 border-t-4 border-blue-500">
                <h3 className="text-xs font-black uppercase text-blue-500 flex items-center gap-2 mb-6 tracking-widest">
                    <Truck size={16} /> Tactical Stock Transfers
                </h3>
                <div className="space-y-4">
                    {transferSuggestions.length > 0 ? transferSuggestions.map((transfer, i) => (
                        <div key={i} className="p-4 bg-blue-500/5 rounded-xl border border-blue-500/10 flex items-start gap-3 group cursor-pointer hover:bg-blue-500/10 transition-all">
                            <AlertCircle size={16} className="text-blue-500 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-[10px] font-bold text-text-main leading-tight">{transfer.msg}</p>
                                <div className="flex items-center gap-1 mt-2 text-[9px] font-black uppercase text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                    Authorize Transfer <ArrowRight size={10} />
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="p-8 text-center border border-dashed border-white/5 rounded-xl">
                            <p className="text-[10px] text-text-muted font-bold uppercase">Inventory Balance Optimal</p>
                        </div>
                    )}
                </div>
            </div>

            {/* CNN INTEGRITY AUDIT */}
            <div className="dashboard-card p-6 border-t-4 border-green-500">
                <h3 className="text-xs font-black uppercase text-green-500 flex items-center gap-2 mb-6 tracking-widest">
                    <Eye size={16} /> Inventory Integrity Audit
                </h3>
                <div className="flex justify-between items-center bg-green-500/5 p-4 rounded-xl border border-green-500/10 mb-4">
                    <div>
                        <p className="text-xs font-black text-text-main">{kpis.anomalyCount} Anomalies Flagged</p>
                        <p className="text-[9px] text-text-muted uppercase font-bold">In-Transit Categorical Variances</p>
                    </div>
                </div>
                <button className="w-full py-3 bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-text-muted hover:bg-white/10 hover:text-text-main transition-all flex items-center justify-center gap-2">
                    <ShieldCheck size={14} className="text-green-500" /> View Flagged Item Images
                </button>
            </div>
        </section>
      </div>
    </main>
  );
};

export default StoreAdminView;
