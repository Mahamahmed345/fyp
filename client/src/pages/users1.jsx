import React, { useState, useEffect } from 'react';
import { Users as UsersIcon, UserPlus, ShieldCheck, Mail, CheckCircle, XCircle, Activity } from 'lucide-react';
import Sidebar from '../components/sidebar'; 
import Header from '../components/header';
import axios from 'axios';

const Users = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://localhost:3002/api/users');
        setUsersList(response.data);
      } catch (err) {
        console.error("Failed to fetch team members:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-global-bg text-text-main font-sans overflow-hidden">
      <Sidebar isSidebarOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <div className="flex-1 flex flex-col h-screen overflow-y-auto min-w-0 custom-scrollbar">
        <Header setSidebarOpen={setSidebarOpen} />
        
        <main className="p-4 md:p-8 lg:p-10">
          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-black uppercase italic flex items-center gap-3 tracking-tighter">
                <UsersIcon className="text-[#3b82f6]" /> Intelligence Access Control
              </h2>
              <p className="text-[10px] text-text-muted uppercase font-bold tracking-widest mt-1">Audit Manager Qualifications & Terminal Access</p>
            </div>
            <div className="px-4 py-2 bg-blue-500/10 rounded-xl border border-blue-500/20 text-[9px] font-black uppercase tracking-widest text-blue-500 flex items-center gap-2">
               <ShieldCheck size={14} /> Read-Only Audit Mode v1.0
            </div>
          </header>

          <div className="grid grid-cols-1 gap-6">
            <div className="dashboard-card overflow-hidden">
              {loading ? (
                <div className="p-20 text-center space-y-4">
                  <Activity className="text-[#3b82f6] animate-spin mx-auto" size={40} />
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#3b82f6]">Decrypting Team Manifest...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-white/5 text-text-muted text-[10px] uppercase font-black tracking-widest">
                        <th className="px-6 py-4">Manager Profile</th>
                        <th className="px-6 py-4">Security Role</th>
                        <th className="px-6 py-4 text-center">Data Intake Rights</th>
                        <th className="px-6 py-4 text-center">Model Scan Rights</th>
                        <th className="px-6 py-4 text-right">Audit Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {usersList.map((user) => (
                        <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 shrink-0 rounded-xl bg-[#3b82f6]/10 flex items-center justify-center text-[#3b82f6] border border-[#3b82f6]/20 font-black italic shadow-inner">
                                {user.name[0]}
                              </div>
                              <div className="min-w-0">
                                <h4 className="font-bold text-sm truncate uppercase tracking-tighter italic">{user.name}</h4>
                                <p className="text-[10px] text-text-muted truncate flex items-center gap-1">
                                  <Mail size={10} /> {user.email}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <span className="text-[10px] font-black text-text-main uppercase tracking-widest bg-white/5 px-2 py-1 rounded">
                              {user.role === 'admin' ? 'Strategic Admin' : `Store Manager (${user.role})`}
                            </span>
                          </td>
                          <td className="px-6 py-5 text-center">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20 text-green-500">
                              <CheckCircle size={14} />
                              <span className="text-[9px] font-black uppercase tracking-tighter">Verified</span>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-center">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#3b82f6]/10 border border-[#3b82f6]/20 text-[#3b82f6]">
                               <CheckCircle size={14} />
                               <span className="text-[9px] font-black uppercase tracking-tighter">Authorized</span>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-right">
                             <span className="text-[9px] font-black uppercase italic text-text-muted">Cleared for Hub</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="dashboard-card p-6 bg-gradient-to-r from-[#1e293b] to-transparent border-l-4 border-[#8b5cf6]">
              <div className="flex items-start gap-4">
                <ShieldCheck className="text-[#8b5cf6] shrink-0" size={24} />
                <div>
                  <h4 className="text-sm font-black uppercase tracking-widest text-[#8b5cf6]">Read-Only Access Verification</h4>
                  <p className="text-[11px] text-text-muted mt-1 leading-relaxed">
                    This view displays real-time accounts derived from the central authentication database. In this configuration, Strategic Permissions are managed directly via the server initialization scripts to ensure absolute security for the GitHub repository state.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Users;