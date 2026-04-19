import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Package, AlertTriangle, ShieldAlert, Zap,
  CheckCircle2, RefreshCw, Eye, Camera,
  TrendingUp, ListTodo, Activity, ArrowUpRight,
  ShieldCheck, Users, DollarSign, Gauge, Video,
  FileText, Download, PieChart as PieIcon,
  BarChart3, LineChart as LineIcon
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, AreaChart, Area,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const StoreManagerDashboard = () => {
  const { id } = useParams(); // e.g., 's1', 's2'
  const storeId = id ? id.toUpperCase().replace('S', 'Store ') : 'Store 1';

  // States
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState('Sync Required');

  // Constants
  const ALERT_THRESHOLD_DAYS = 7;
  const PIE_COLORS = ['#ef4444', '#f97316', '#f59e0b', '#3b82f6']; // Red, Orange, Amber, Blue

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`http://localhost:3002/api/dashboard-intelligence?store=${id || 's1'}`);
      setData(response.data);
      setLastSync(new Date(response.data.lastTerminalSync).toLocaleTimeString());
    } catch (err) {
      console.error("Dashboard Fetch Failed:", err);
      setData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const generateLocalReport = () => {
    if (!data) return;
    const doc = new jsPDF();
    const timestamp = new Date().toLocaleString();

    // 1. Header
    doc.setFontSize(22);
    doc.setTextColor(40);
    doc.text('CONFIDENTIAL: Local Performance Audit', 14, 22);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Store Identity: ${storeId}`, 14, 32);
    doc.text(`Generated: ${timestamp}`, 14, 37);
    doc.text(`Data Integrity: Model-Driven (Real Trained Data)`, 14, 42);

    // 2. Operational KPIs
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text('I. Operational Baseline', 14, 55);

    const kpiData = [
      ['Metric', 'Value', 'Status'],
      ['Total Asset Value', `$${(data.categoricalData.reduce((acc, curr) => acc + (curr.stock * curr.avg_price), 0)).toLocaleString()}`, 'Current'],
      ['Physical Shelf Utilization', data.kpis.shelfUtilization, parseFloat(data.kpis.shelfUtilization) > 90 ? 'OVER CAPACITY' : 'Optimal'],
      ['QA Anomalies Detected', data.kpis.anomalyCount.toString(), data.kpis.anomalyCount > 0 ? 'Action Required' : 'Healthy'],
      ['Audit Reliability', data.kpis.forecastMarginMAE, 'High']
    ];

    autoTable(doc, {
      startY: 60,
      head: [kpiData[0]],
      body: kpiData.slice(1),
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] }
    });

    // 3. Fault Detection Analysis
    doc.text('II. Quality Assurance (QA) Breakdown', 14, doc.lastAutoTable.finalY + 15);
    const faultData = [
      ['Quadrant', 'Count', 'Business Impact'],
      ['Loss Sale (Critical Stockouts)', data.faultBreakdown.lossSale.toString(), 'Urgent Replenishment Needed'],
      ['Revenue Gaps (Data Discrepancy)', data.faultBreakdown.revenueGap.toString(), 'Audit Correction Required'],
      ['Dead Stock (Zero Demand)', data.faultBreakdown.deadStock.toString(), 'Inventory Liquidation Priority'],
      ['Pricing Corrections (Market Gap)', data.faultBreakdown.marketGap.toString(), 'Competitive Adjusting Required']
    ];

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 20,
      head: [faultData[0]],
      body: faultData.slice(1),
      theme: 'striped',
      headStyles: { fillColor: [239, 68, 68] }
    });

    // 4. Restock Manifest
    doc.text('III. Tactical Restock Manifest', 14, doc.lastAutoTable.finalY + 15);
    const criticalItems = data.categoricalData
      .filter(item => item.status === 'Critical' || item.status === 'Low')
      .map(item => [
        item.category,
        item.stock,
        item.demand7d,
        item.demand7d * 2, // Logic: Demand7d * 2
        'TACTICAL ORDER'
      ]);

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 20,
      head: [['Category', 'Current Stock', 'Weekly Demand', 'Reorder Qty', 'Priority']],
      body: criticalItems.length > 0 ? criticalItems : [['-', '-', '-', '-', 'N/A']],
      theme: 'grid',
      headStyles: { fillColor: [0, 255, 136], textColor: [0, 0, 0] }
    });

    doc.setFontSize(8);
    doc.setTextColor(150);
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.text(`Page ${i} of ${pageCount} - Confidential Audit Data`, 105, 290, null, null, 'center');
    }

    doc.save(`${storeId}_Performance_Audit.pdf`);
  };

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center space-y-4 bg-global-bg">
        <Activity className="text-[#3b82f6] animate-spin" size={48} />
        <p className="text-xs font-black uppercase tracking-widest text-[#3b82f6]">Initializing Operational Hub...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="h-screen flex flex-col items-center justify-center space-y-4 bg-global-bg">
        <AlertTriangle className="text-red-500" size={48} />
        <p className="text-sm font-black uppercase text-text-main">Operational Data Offline</p>
        <button onClick={fetchData} className="px-6 py-2 bg-[#3b82f6] text-white rounded-xl font-bold">Restart Hub</button>
      </div>
    );
  }

  const { categoricalData, kpis, faultBreakdown } = data;

  // Real Logic Calculations
  const totalStock = categoricalData.reduce((acc, curr) => acc + curr.stock, 0);
  const shelfUtilization = ((totalStock / 10000) * 100).toFixed(1);
  const revenuePotential = categoricalData.reduce((acc, curr) => acc + (curr.stock * curr.avg_price), 0);
  const criticalStockouts = categoricalData.filter(d => d.status === 'Critical').length;

  // Pie Chart Data
  const pieData = [
    { name: 'Loss Sale', value: faultBreakdown.lossSale },
    { name: 'Revenue Gaps', value: faultBreakdown.revenueGap },
    { name: 'Dead Stock', value: faultBreakdown.deadStock },
    { name: 'Pricing Corrections', value: faultBreakdown.marketGap }
  ].filter(d => d.value > 0);

  // Stock Forecast Data (Categorical Demand Mapping)
  const forecastData = categoricalData.map(d => ({
    category: d.category,
    prediction: d.demand7d
  }));

  // Dynamic Task Queue
  const autoTasks = [];
  // 1. URGENT: Shelf Replenishment (High Stockout Risk)
  categoricalData.forEach(item => {
    if (item.status === 'Critical') {
      autoTasks.push({
        title: `URGENT: Shelf Replenishment [${item.category}]`,
        priority: 'High',
        msg: `Forecast identifies a critical stockout risk. Immediate replenishment of ${item.demand7d * 2} units required.`
      });
    }
  });

  // 2. QA: Dead Stock Liquidation
  if (faultBreakdown.deadStock > 0) {
    autoTasks.push({
      title: 'QA ACTION: Inventory Liquidation',
      priority: 'Medium',
      msg: `${faultBreakdown.deadStock} items identified as 'Dead Stock'. Initiate price markdown or warehouse transfer.`
    });
  }

  // 3. QA: Pricing / Market Alignment
  if (faultBreakdown.marketGap > 0) {
    autoTasks.push({
      title: 'QA ACTION: Market Price Alignment',
      priority: 'Low',
      msg: `${faultBreakdown.marketGap} items identified with pricing gaps. Synchronize local tags with model suggested prices.`
    });
  }

  // 4. LOGISTICS: Inter-Store Transfer
  if (data.transferSuggestions && data.transferSuggestions.length > 0) {
    data.transferSuggestions.forEach(ts => {
      autoTasks.push({
        title: 'LOGISTICS: Tactical Requisition',
        priority: ts.priority || 'Medium',
        msg: ts.msg
      });
    });
  }

  // 5. CAPACITY: Warehouse Warning
  if (parseFloat(shelfUtilization) > 90) {
    autoTasks.push({
      title: 'SYSTEM: Capacity Alert',
      priority: 'Low',
      msg: `Physical shelf utilization (${shelfUtilization}%) is approaching terminal limits. Clear dead stock to avoid intake bottlenecks.`
    });
  }

  return (
    <main className="p-4 md:p-8 space-y-8 max-w-[1700px] mx-auto bg-global-bg min-h-screen font-sans">
      {/* 1. OPERATIONAL HUB HEADER */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-card-bg p-8 rounded-3xl border border-border-soft shadow-2xl">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-[#3b82f6]/10 rounded-2xl text-[#3b82f6] shadow-inner">
            <Gauge size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black italic text-text-main uppercase tracking-tighter leading-none">{storeId}</h1>
            {/* <p className="text-text-muted text-[10px] font-black uppercase tracking-[0.3em] mt-2">Prophet Intelligence & Qualitative Audit</p> */}
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            {/* <p className="text-[9px] font-black text-text-muted uppercase">Inventory Health Status</p>
            <p className="text-sm font-black text-[#3b82f6] italic">{lastSync}</p> */}
          </div>
          <button
            onClick={generateLocalReport}
            className="flex items-center gap-2 px-8 py-4 bg-[#3b82f6] text-white rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-xl shadow-[#3b82f6]/20"
          >
            <Download size={16} /> Export Local Performance Audit
          </button>
        </div>
      </header>

      {/* 2. TOP KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="dashboard-card p-6 border-l-4 border-green-500">
          <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2 flex items-center gap-2">
            <DollarSign size={14} className="text-green-500" /> Revenue Potential
          </p>
          <p className="text-xl font-black text-text-main tracking-tighter">${revenuePotential.toLocaleString()}</p>
          <span className="text-[10px] font-bold text-green-500 mt-2 block italic tracking-widest">Strategic Asset Valuation</span>
        </div>

        <div className={`dashboard-card p-6 border-l-4 ${shelfUtilization > 90 ? 'border-red-500 bg-red-500/5' : 'border-[#3b82f6]'}`}>
          <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2 flex items-center gap-2">
            <Package size={14} className="text-[#3b82f6]" /> Shelf Capacity
          </p>
          <p className="text-xl font-black text-text-main tracking-tighter">{shelfUtilization}%</p>
          <span className="text-[9px] font-black text-text-muted uppercase mt-2 block tracking-widest">{shelfUtilization > 90 ? 'WAREHOUSE ALERT' : 'Utilization Optimal'}</span>
        </div>

        <div className="dashboard-card p-6 border-l-4 border-red-500">
          <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2 flex items-center gap-2">
            <AlertTriangle size={14} className="text-red-500" /> Critical Stockouts
          </p>
          <p className="text-xl font-black text-text-main tracking-tighter">{criticalStockouts}</p>
          <span className="text-[9px] font-black text-red-500 uppercase mt-2 block tracking-widest font-black">Tactical Reorder Signal Required</span>
        </div>

        <div className="dashboard-card p-6 border-l-4 border-purple-500">
          <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2 flex items-center gap-2">
            <ShieldAlert size={14} className="text-purple-500" /> Fault Detection Audit
          </p>
          <div className="flex items-center justify-between mt-1">
            <p className="text-xl font-black text-text-main tracking-tighter">{kpis.anomalyCount}</p>
            <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${kpis.anomalyCount === 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
              {kpis.anomalyCount === 0 ? 'System Clear' : 'Action Required'}
            </span>
          </div>
          <span className="text-[9px] font-black text-text-muted uppercase mt-2 block tracking-widest">Anomaly Detection v4.2</span>
        </div>

        <div className="dashboard-card p-6 border-l-4 border-amber-500">
          <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2 flex items-center gap-2">
            <Zap size={14} className="text-amber-500" /> Predict. Performance
          </p>
          <p className="text-xl font-black text-text-main tracking-tighter">{kpis.forecastMarginMAE.replace('%', '')}%</p>
          <span className="text-[9px] font-black text-text-muted uppercase mt-2 block tracking-widest">Model Confidence Interval</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* 3. MIDDLE LEFT: FAULT ANALYSIS PIE CHART */}
        <div className="xl:col-span-4 flex flex-col gap-8">
          <section className="dashboard-card p-6 h-full min-h-[400px]">
            <h3 className="text-[11px] font-black uppercase text-text-main flex items-center gap-2 mb-8 tracking-widest italic font-black">
              <PieIcon size={18} className="text-red-500" /> Qualitative Fault Index
            </h3>

            <div className="h-[280px] w-full">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                      itemStyle={{ color: '#fff', fontSize: '10px', textTransform: 'uppercase', fontWeight: '900' }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      formatter={(value) => <span className="text-[9px] font-black uppercase text-text-muted tracking-tighter">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                  <ShieldCheck size={48} className="text-green-500/20" />
                  <p className="text-[10px] font-black uppercase text-text-muted">No Model Violations Detected</p>
                </div>
              )}
            </div>

            <p className="text-[8px] text-text-muted font-black uppercase text-center mt-6 tracking-widest opacity-50 italic">Source: Anomaly Detection v4.2</p>
          </section>

          {/* DYNAMIC TASK QUEUE */}
          <section className="dashboard-card p-6 border-t-4 border-[#3b82f6]">
            <h3 className="text-[10px] font-black uppercase text-text-main flex items-center gap-2 mb-6 tracking-widest">
              <ListTodo size={16} className="text-[#3b82f6]" /> Operational Task Queue
            </h3>
            <div className="space-y-3">
              {autoTasks.map((task, i) => (
                <div key={i} className="p-4 bg-black/20 rounded-xl border border-white/5 hover:border-[#3b82f6]/30 transition-all group">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-[10px] font-black text-text-main uppercase tracking-tighter group-hover:text-[#3b82f6] text-sm">{task.title}</p>
                    <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase ${task.priority === 'High' ? 'bg-red-500 text-white' : 'bg-[#3b82f6]/20 text-[#3b82f6]'}`}>
                      {task.priority}
                    </span>
                  </div>
                  <p className="text-[10px] text-text-muted font-bold leading-relaxed">{task.msg}</p>
                </div>
              ))}
              {autoTasks.length === 0 && (
                <div className="text-center py-8">
                  <CheckCircle2 size={32} className="text-green-500/20 mx-auto mb-2" />
                  <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">Terminal Status: Stable | Model-Driven Baselines Synchronized</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* 4. MIDDLE RIGHT: STOCK DEMAND FORECAST */}
        <div className="xl:col-span-8">
          <section className="dashboard-card p-8 h-full min-h-[500px]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
              <div>
                <h3 className="text-xl font-black uppercase text-text-main flex items-center gap-3 tracking-tighter italic">
                  <BarChart3 size={24} className="text-[#3b82f6]" /> 7-Day Stock Demand Projection
                </h3>
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] mt-1">Statistical Analysis: Prophet Intelligence v2.0</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="px-4 py-2 bg-[#3b82f6]/10 rounded-xl border border-[#3b82f6]/20 text-center">
                  <span className="text-[8px] font-black text-text-muted uppercase block">Predicted Peak</span>
                  <p className="text-xl font-black text-[#3b82f6] tracking-tighter italic">
                    {Math.max(...forecastData.map(d => d.prediction), 0)} Units
                  </p>
                </div>
              </div>
            </div>

            <div className="h-[400px] w-full mt-10">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={forecastData}>
                  <defs>
                    <linearGradient id="colorDemand" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis
                    dataKey="category"
                    stroke="#64748b"
                    fontSize={11}
                    axisLine={false}
                    tickLine={false}
                    fontFamily="inherit"
                    fontWeight={900}
                    tickFormatter={(val) => val.toUpperCase()}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={10}
                    axisLine={false}
                    tickLine={false}
                    label={{ value: 'PROPHET FORECAST (UNITS)', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#64748b', fontWeight: '900' }}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', shadow: 'none', color: '#fff' }}
                    itemStyle={{ color: '#fff', fontSize: '11px', fontWeight: 'bold' }}
                    labelStyle={{ color: '#3b82f6', fontWeight: 'black', marginBottom: '4px' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="prediction"
                    stroke="#3b82f6"
                    strokeWidth={4}
                    fillOpacity={1}
                    fill="url(#colorDemand)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-8 p-6 bg-black/20 rounded-2xl border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Activity size={20} className="text-[#3b82f6] animate-pulse" />
                <div>
                  <p className="text-[10px] font-black uppercase text-text-main tracking-widest">Model Integrity Scan</p>
                  <p className="text-[11px] text-text-muted font-bold mt-1 leading-relaxed">
                    Prophet Intelligence is currently monitoring <span className="text-[#3b82f6]">{categoricalData.length}</span> categories to detect demand deviations at <span className="text-[#3b82f6] truncate">{storeId}</span>.
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-black text-text-muted uppercase tracking-widest">Model Confidence</p>
                <p className="text-lg font-black text-green-500 italic">
                  {(100 - parseFloat(kpis.forecastMarginMAE)).toFixed(1)}%
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* 5. BOTTOM: INTERACTIVE INVENTORY */}
      <section className="dashboard-card p-8 shadow-2xl">
        <h3 className="text-sm font-black uppercase text-text-main flex items-center gap-3 mb-8 tracking-tighter italic">
          <TrendingUp size={20} className="text-[#00ff88]" /> Inventory Health & Tactical Reorder
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-text-muted uppercase border-b border-white/5 font-black tracking-widest text-[9px]">
                <th className="pb-5 px-4">Category (Item)</th>
                <th className="pb-5 px-4 text-center">Stock Level</th>
                <th className="pb-5 px-4 text-center">Prophet Forecast</th>
                <th className="pb-5 px-4 text-center">Days of Cover</th>
                <th className="pb-5 px-4 text-center">Audit Reliability</th>
                <th className="pb-5 px-4 text-right">Fulfillment Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {categoricalData.map((item, i) => {
                const doc = (item.stock / (item.demand7d / 7 || 1)).toFixed(1);
                return (
                  <tr key={i} className="hover:bg-white/[0.02] transition-all group">
                    <td className="py-6 px-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-1.5 h-1.5 rounded-full ${item.status === 'Critical' ? 'bg-red-500 animate-pulse' : 'bg-[#3b82f6]'}`} />
                        <p className="text-xs font-black uppercase text-text-main group-hover:translate-x-1 transition-transform">{item.category}</p>
                      </div>
                    </td>
                    <td className="py-6 px-4 text-center">
                      <span className="text-sm font-black text-text-main tabular-nums">{item.stock}</span>
                    </td>
                    <td className="py-6 px-4 text-center">
                      <span className="text-xs font-black text-[#3b82f6] tabular-nums">{item.demand7d} <span className="text-[10px] opacity-50">/7D</span></span>
                    </td>
                    <td className="py-6 px-4 text-center">
                      <div className="flex flex-col items-center">
                        <span className={`text-xs font-black italic ${parseFloat(doc) < ALERT_THRESHOLD_DAYS ? 'text-red-500' : 'text-text-main'}`}>{doc} Days</span>
                        <div className="w-16 h-1 bg-white/5 rounded-full mt-1 overflow-hidden">
                          <div
                            className={`h-full ${parseFloat(doc) < ALERT_THRESHOLD_DAYS ? 'bg-red-500' : 'bg-[#00ff88]'}`}
                            style={{ width: `${Math.min(100, parseFloat(doc) * 10)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-6 px-4 text-center">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#3b82f6]/5 border border-[#3b82f6]/20 text-[9px] font-black text-[#3b82f6] uppercase tracking-tighter">
                        <ShieldCheck size={12} /> {item.accuracy}% Reliability
                      </div>
                    </td>
                    <td className="py-6 px-4 text-right">
                      <button
                        disabled={item.status === 'Healthy'}
                        className={`flex items-center gap-2 ml-auto px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${item.status === 'Healthy'
                          ? 'bg-white/5 text-text-muted cursor-not-allowed opacity-30'
                          : 'bg-[#00ff88] text-black hover:scale-105 active:scale-95 shadow-lg shadow-[#00ff88]/20'
                          }`}
                      >
                        Order Now <Package size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
};

export default StoreManagerDashboard;
