import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  BarChart3, AlertTriangle, ShieldCheck, FileText, Download, Send, CheckCircle, Activity,
  Gauge, Truck, Eye
} from 'lucide-react';
import axios from 'axios';
import { jsPDF } from "jspdf"; 
import autoTable from 'jspdf-autotable'; 
import IntelligenceHub from '../components/IntelligenceHub';

const StoreDashboard = () => {
  const { id } = useParams(); // e.g., 's1'
  const storeId = id || 's1';
  const storeName = storeId.toUpperCase().replace('S', 'Store ');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportReady, setReportReady] = useState(false);
  const [storeData, setStoreData] = useState(null);
  const [loading, setLoading] = useState(true);

  // FETCH STORE DATA
  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        const response = await axios.get(`http://localhost:3002/api/dashboard-intelligence?store=${storeId}`);
        if (response.data) {
          setStoreData(response.data);
        }
      } catch (err) {
        console.error("Failed to fetch store intelligence:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStoreData();
  }, [storeId]);

  const generatePDFReport = () => {
    if (!storeData) return;
    const { categoricalData, lastTerminalSync, kpis } = storeData;
    const doc = new jsPDF();
    
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text(`SUPPLY CHAIN REQUISITION: ${storeName}`, 14, 22);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);
    doc.text(`Terminal Sync: ${new Date(lastTerminalSync).toLocaleString()}`, 14, 35);

    autoTable(doc, {
      startY: 45,
      head: [['Category', 'On-Hand Stock', '7D Forecast', 'QA (Anomaly Rate)', 'Operational Status']],
      body: categoricalData.map(c => [
        c.category,
        c.stock,
        c.demand7d,
        c.accuracy + "%",
        c.status
      ]),
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] }
    });

    const yPos = doc.lastAutoTable.finalY + 15;
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Demand Projection & QA Summary:", 14, yPos);
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`- Local Reliability Score: ${kpis.forecastMarginMAE} Accuracy`, 14, yPos + 8);
    doc.text(`- Quality Assurance: ${kpis.anomalyCount} Flagged Items in current batch.`, 14, yPos + 13);

    let listY = yPos + 23;
    doc.setFont("helvetica", "bold");
    doc.text("Recommended Requisition Actions:", 14, listY);
    doc.setFont("helvetica", "normal");
    
    categoricalData.forEach((c) => {
      if (c.status === 'Critical' || c.status === 'Low') {
        const req = Math.max(50, Math.round(c.demand7d * 1.5));
        doc.text(`- REQUISITION: ${req} units of ${c.category} to address 7-day predicted deficit.`, 14, listY + 7);
        listY += 6;
      }
    });
    
    doc.save(`${storeName}_Supply_Chain_Requisition.pdf`);
  };

  const handleGenerateReport = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setReportReady(true);
    }, 1500);
  };

  if (loading || !storeData) return <div className="p-20 text-center animate-pulse text-[#3b82f6] font-black italic uppercase">Synchronizing Local Assets...</div>;

  const { categoricalData, kpis, transferSuggestions } = storeData;

  return (
    <main className="p-4 md:p-8 space-y-10">
      {/* 1. OPERATIONAL HEADER */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card-bg/20 p-6 rounded-2xl border border-white/5 shadow-2xl">
        <div className="flex items-center gap-4">
           <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
              <Gauge size={24} />
           </div>
           <div>
              <h2 className="text-2xl font-black italic text-text-main uppercase tracking-tighter">{storeName} Terminal Health</h2>
              <p className="text-text-muted text-[10px] font-bold uppercase tracking-widest">Live Operational Intelligence Platform</p>
           </div>
        </div>
        
        <button 
          onClick={handleGenerateReport}
          disabled={isGenerating}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
            isGenerating ? 'bg-white/5 text-text-muted' : 'bg-[#3b82f6] text-white hover:scale-105 active:scale-95 shadow-lg shadow-[#3b82f6]/20'
          }`}
        >
          {isGenerating ? 'Analyzing Patterns...' : <><FileText size={16} /> Run Operational Audit</>}
        </button>
      </header>

      {/* 2. REUSABLE ANALYTICS HUB */}
      <IntelligenceHub storeId={storeId} liveData={categoricalData} />

      {/* 3. PERFORMANCE RATIO GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <section className="lg:col-span-2 space-y-6">
          <div className="dashboard-card p-6">
            <h3 className="text-xs font-black uppercase text-[#3b82f6] flex items-center gap-2 mb-8 tracking-widest">
              <BarChart3 size={16} /> Product Category Intelligence
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px]">
                <thead>
                  <tr className="text-text-muted uppercase border-b border-white/5 font-black tracking-widest">
                    <th className="pb-3 px-2">Category</th>
                    <th className="pb-3 px-2">Current Stock</th>
                    <th className="pb-3 px-2">7-Day Demand</th>
                    <th className="pb-3 px-2">Days of Cover</th>
                    <th className="pb-3 px-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="font-bold text-text-main">
                  {categoricalData.map((row, i) => (
                    <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-2">{row.category}</td>
                      <td className="py-4 px-2 font-mono">{row.stock}</td>
                      <td className="py-4 px-2 font-mono text-[#3b82f6]">{row.demand7d}</td>
                      <td className="py-4 px-2 font-mono">{row.daysOfCover}d</td>
                      <td className="py-4 px-2 text-right">
                        <span className={`text-[9px] font-black px-2 py-1 rounded uppercase tracking-tighter ${
                          row.status === 'Critical' ? 'bg-red-500/10 text-red-500' : 
                          row.status === 'Low' ? 'bg-orange-500/10 text-orange-500' : 
                          'bg-green-500/10 text-green-500'
                        }`}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="dashboard-card p-6 border-l-4 border-green-500">
            <h3 className="text-xs font-black uppercase text-green-500 flex items-center gap-2 mb-6 tracking-widest">
              <Eye size={16} /> Inventory Integrity Audit
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-black/20 p-4 rounded-xl border border-white/5">
                <div>
                  <p className="text-sm font-bold text-text-main">CNN Vision Anomaly Check</p>
                  <p className="text-[10px] text-text-muted uppercase font-black">Detected {kpis.anomalyCount} items with status deviation</p>
                </div>
                <span className="bg-green-500/10 text-green-500 px-3 py-1 rounded-full text-[9px] font-black italic uppercase">Scan Pass</span>
              </div>
            </div>
          </div>
        </section>

        {/* 4. TACTICAL RESTOCK PRIORITIES */}
        <section className="dashboard-card p-6 space-y-8">
          <div>
            <h3 className="text-xs font-black uppercase text-blue-500 flex items-center gap-2 mb-6 tracking-widest">
              <Truck size={16} /> Tactical Stock Suggestions
            </h3>
            <div className="space-y-4">
               {transferSuggestions.length > 0 ? transferSuggestions.map((t, i) => (
                 <div key={i} className="p-4 bg-blue-500/5 rounded-xl border border-blue-500/10">
                    <p className="text-[10px] font-bold text-text-main leading-relaxed">{t.msg}</p>
                    <span className="text-[8px] font-black uppercase text-blue-500 mt-2 block">Priority: {t.priority}</span>
                 </div>
               )) : (
                 <div className="p-8 text-center border border-dashed border-white/5 rounded-xl">
                    <CheckCircle size={24} className="text-green-500 mx-auto mb-2" />
                    <p className="text-[10px] text-text-muted font-bold uppercase">Optimal Balance</p>
                 </div>
               )}
            </div>
          </div>

          <div className="pt-6 border-t border-white/5">
            {reportReady && (
              <div className="flex flex-col gap-3">
                <button onClick={generatePDFReport} className="w-full flex items-center justify-center gap-2 py-3 bg-[#3b82f6] rounded-xl text-white font-black text-[10px] uppercase shadow-lg shadow-[#3b82f6]/20">
                  <Download size={14} /> Download Requisition Order
                </button>
                <button className="w-full flex items-center justify-center gap-2 py-3 bg-white/5 rounded-xl text-text-muted font-black text-[10px] uppercase">
                  <Send size={14} /> Transmit to Procurement
                </button>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
};

export default StoreDashboard;