import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, AreaChart, Area
} from 'recharts';
import { Package, Filter, Activity, PieChart as PieIcon, TrendingUp, BarChart3, Clock } from 'lucide-react';
import Sidebar from '../components/sidebar'; 
import Header from '../components/header'; 
import axios from 'axios';
import { useParams } from 'react-router-dom';

const Store1Analytics = () => {
  const { id } = useParams();
  const displayStore = id ? id.toUpperCase().replace('S', 'Store ') : 'Store 1';
  
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`http://localhost:3002/api/dashboard-intelligence?store=${id || 's1'}`);
        setData(response.data);
        if (response.data.categoricalData?.length > 0) {
          setSelectedCategory(response.data.categoricalData[0].category);
        }
      } catch (err) {
        console.error("Failed to fetch terminal analytics:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalyticsData();
  }, [id]);

  if (loading || !data) {
    return (
      <div className="h-screen flex flex-col items-center justify-center space-y-4 bg-global-bg">
        <Clock className="text-[#8b5cf6] animate-pulse" size={48} />
        <p className="text-xs font-black uppercase tracking-widest text-[#8b5cf6]">Synchronizing Terminal Data...</p>
      </div>
    );
  }

  const { categoricalData, timeSeriesDemand, kpis, lastTerminalSync } = data;
  const activeDetail = categoricalData.find(c => c.category === selectedCategory) || categoricalData[0];

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-global-bg text-text-main font-sans overflow-hidden">
      <Sidebar isSidebarOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto custom-scrollbar">
        <Header setSidebarOpen={setSidebarOpen} />

        <main className="p-4 md:p-8 lg:p-10 space-y-10">
          {/* SECURE ANALYTICS HEADER */}
          <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-card-bg p-8 rounded-3xl border border-white/5">
             <div className="flex items-center gap-4">
                <div className="p-4 bg-[#8b5cf6]/10 rounded-2xl text-[#8b5cf6] shadow-xl shadow-[#8b5cf6]/10">
                    <TrendingUp size={28} />
                </div>
                <div>
                    <h2 className="text-3xl font-black italic text-text-main uppercase tracking-tighter leading-none">{displayStore} Terminal Analytics</h2>
                    <p className="text-text-muted text-[10px] font-black uppercase tracking-[0.3em] mt-2 italic flex items-center gap-2">
                        <Activity size={12} className="text-[#8b5cf6]" /> Model Sync: {new Date(lastTerminalSync).toLocaleTimeString()}
                    </p>
                </div>
             </div>

             <div className="flex items-center gap-4 bg-black/20 p-4 rounded-2xl border border-white/5">
                <div className="flex items-center gap-2">
                    <Filter size={16} className="text-[#8b5cf6]" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Analyze:</span>
                </div>
                <select 
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="bg-transparent border-none text-xs font-black uppercase text-[#8b5cf6] focus:ring-0 cursor-pointer"
                >
                    {categoricalData.map(c => <option key={c.category} value={c.category} className="bg-card-bg">{c.category.toUpperCase()}</option>)}
                </select>
             </div>
          </header>

          {/* DYNAMIC KPI CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="dashboard-card p-8 border-l-4 border-[#3b82f6] shadow-2xl">
               <Activity size={24} className="text-[#3b82f6] mb-4" />
               <p className="text-[10px] text-text-muted font-black uppercase tracking-widest">Model Precision (MAE)</p>
               <p className="text-3xl font-black text-text-main italic tracking-tighter">{kpis.forecastMarginMAE}</p>
               <p className="text-[9px] text-text-muted mt-2 font-bold uppercase">Optimal Error Delta Corridor</p>
            </div>
            <div className="dashboard-card p-8 border-l-4 border-[#8b5cf6] shadow-2xl">
               <Package size={24} className="text-[#8b5cf6] mb-4" />
               <p className="text-[10px] text-text-muted font-black uppercase tracking-widest">Prediction Cover</p>
               <p className="text-3xl font-black text-text-main italic tracking-tighter">{activeDetail.daysOfCover} Days</p>
               <p className="text-[9px] text-text-muted mt-2 font-bold uppercase">Categorical On-Hand Forecast</p>
            </div>
            <div className="dashboard-card p-8 border-l-4 border-amber-500 shadow-2xl">
               <BarChart3 size={24} className="text-amber-500 mb-4" />
               <p className="text-[10px] text-text-muted font-black uppercase tracking-widest">Strategic Intake Point</p>
               <p className="text-3xl font-black text-amber-500 italic tracking-tighter">{Math.round(activeDetail.demand / 30 * 5)} Units</p>
               <p className="text-[9px] text-text-muted mt-2 font-bold uppercase">Prophet Reorder Intelligence</p>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* HISTORICAL DEMAND LINE CHART */}
            <section className="dashboard-card p-8 min-h-[450px]">
              <h3 className="text-[11px] font-black mb-8 uppercase tracking-[0.2em] text-[#3b82f6] italic flex items-center gap-2">
                <Clock size={18} /> Terminal Transaction History (7D)
              </h3>
              <div className="h-80 w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timeSeriesDemand}>
                    <defs>
                        <linearGradient id="colorDemand" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis 
                        dataKey="date" 
                        stroke="#64748b" 
                        fontSize={10} 
                        tickLine={false} 
                        axisLine={false} 
                        tickFormatter={(val) => new Date(val).toLocaleDateString([], {weekday: 'short'})}
                        fontWeight={900}
                    />
                    <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} fontWeight={900} />
                    <Tooltip 
                        contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px' }}
                        itemStyle={{ color: '#fff', fontSize: '11px', fontWeight: 'bold' }}
                    />
                    <Area type="monotone" dataKey="demand" name="Units Sold" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorDemand)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </section>

            {/* CATEGORICAL VELOCITY BAR CHART */}
            <section className="dashboard-card p-8 min-h-[450px]">
              <h3 className="text-[11px] font-black mb-8 uppercase tracking-[0.2em] text-[#8b5cf6] italic flex items-center gap-2">
                <PieIcon size={18} /> Terminal Velocity Distribution
              </h3>
              <div className="h-80 w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoricalData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis 
                        dataKey="category" 
                        stroke="#64748b" 
                        fontSize={9} 
                        tickLine={false} 
                        axisLine={false} 
                        fontWeight={900} 
                        tickFormatter={(val) => val.toUpperCase()} 
                    />
                    <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} fontWeight={900} />
                    <Tooltip 
                        contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px' }}
                        itemStyle={{ color: '#fff', fontSize: '11px', fontWeight: 'bold' }}
                    />
                    <Bar dataKey="stock" name="Current Stock" fill="#8b5cf6" radius={[6, 6, 0, 0]} barSize={20} />
                    <Bar dataKey="demand7d" name="Predicted Demand" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Store1Analytics;