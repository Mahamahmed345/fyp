import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Bell, Sun, Moon, User, LogOut, Settings } from 'lucide-react';
import { useAuth } from "../context/AuthContext"; // ✅ Added missing import

const Header = ({ setSidebarOpen, roleLabel, user: userOverride }) => {
  const navigate = useNavigate();
  const { logout, user: contextUser } = useAuth(); // ✅ Use user and logout from context
  
  // Use the override user if provided, else current auth state
  const user = userOverride || contextUser;
  
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);

  React.useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch('http://localhost:3002/api/dashboard-intelligence');
        const data = await response.json();
        
        // Generate real alerts from intelligence data
        const items = data.categoricalData || [];
        const alerts = [];
        items.forEach(store => {
          if (parseFloat(store.stock) < parseFloat(store.demand7d)) {
            alerts.push({
              title: store.category,
              msg: `Stockout Risk: Current stock (${store.stock}) is below 7D forecast (${store.demand7d}).`,
              time: 'Recent'
            });
          }
          if (parseFloat(store.accuracy) < 95) {
            alerts.push({
              title: store.category,
              msg: `Quality Alert: CNN accuracy dropped to ${store.accuracy}%. Review flagged items.`,
              time: 'Review Required'
            });
          }
        });
        setNotifications(alerts.slice(0, 5)); // Keep last 5
      } catch (err) {
        console.error("Notification fetch failed:", err);
      }
    };
    fetchNotifications();
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleLogout = () => {
    logout(); // ✅ Clear context and localStorage
    navigate('/login');
  };

  return (
    <header className="bg-card-bg text-text-main border-b border-border-soft px-4 py-3 flex justify-between items-center w-full sticky top-0 z-40">
      
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile Menu Icon - Purple Glow */}
        <button 
          onClick={() => setSidebarOpen(true)} 
          className="lg:hidden p-1.5 text-[#8b5cf6] hover:bg-[#8b5cf6]/10 rounded-md transition-colors"
          aria-label="Open Menu"
        >
          <Menu size={20} />
        </button>

        {/* Title - Shrinks on mobile to prevent overlap */}
        <h1 className="text-sm md:text-xl font-bold tracking-tight uppercase italic truncate">
          Welcome, <span className="text-[#3b82f6]">{roleLabel || (user?.role === 'admin' ? 'Admin' : 'Manager')}</span>
        </h1>
      </div>

      <div className="flex items-center gap-5 relative">
        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme} 
          className="text-text-muted hover:text-text-main transition-colors"
          aria-label="Toggle Theme"
        >
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfile(false);
            }} 
            className="text-text-muted hover:text-text-main transition-colors relative flex items-center justify-center p-1"
          >
            <Bell size={18} />
            {notifications.length > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-[9px] font-black w-3.5 h-3.5 flex items-center justify-center rounded-full border border-card-bg">
                {notifications.length}
              </span>
            )}
          </button>
          
          {showNotifications && (
            <div className="absolute right-0 mt-4 w-72 bg-card-bg border border-border-soft rounded-xl shadow-2xl py-2 z-50">
              <div className="px-4 py-3 border-b border-border-soft flex justify-between items-center">
                <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Notifications</p>
                <span className="text-[10px] text-[#3b82f6] cursor-pointer hover:underline">Mark all read</span>
              </div>
              <div className="flex flex-col max-h-[300px] overflow-y-auto custom-scrollbar">
                {notifications.length > 0 ? notifications.map((note, i) => (
                  <div key={i} className="px-4 py-3 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer flex flex-col gap-1 border-b border-border-soft transition-colors">
                    <p className="text-xs text-text-main leading-relaxed">
                      <span className="text-[#3b82f6] font-bold">{note.title}:</span> {note.msg}
                    </p>
                    <span className="text-[9px] text-text-muted font-bold uppercase tracking-widest">{note.time}</span>
                  </div>
                )) : (
                  <div className="px-4 py-8 text-center text-[10px] text-text-muted uppercase font-black">
                     No critical system alerts
                  </div>
                )}
              </div>
              <div className="px-4 pt-2 pb-1 text-center border-t border-border-soft mt-2">
                <button className="text-[10px] uppercase font-bold tracking-widest text-[#8b5cf6] hover:text-text-main transition-colors">View All Activities</button>
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button 
            onClick={() => {
              setShowProfile(!showProfile);
              setShowNotifications(false);
            }}
            className="w-8 h-8 rounded-full bg-[#3b82f6]/20 border border-[#3b82f6]/50 flex items-center justify-center hover:bg-[#3b82f6]/40 transition-all hover:scale-105 ml-2"
          >
            <User size={16} className="text-[#3b82f6]" />
          </button>

          {showProfile && (
            <div className="absolute right-0 mt-4 w-56 bg-card-bg border border-border-soft rounded-xl shadow-2xl py-2 z-50">
              <div className="px-4 py-4 border-b border-border-soft flex flex-col gap-1">
                <p className="text-sm font-black text-text-main tracking-tight uppercase italic whitespace-nowrap">{user?.name || 'User'}</p>
                <p className="text-[10px] text-text-muted tracking-widest">{user?.email || (user?.role === 'admin' ? 'admin@smartstock.com' : 'manager@smartstock.com')}</p>
              </div>
              <div className="py-2 flex flex-col gap-1">
                <button className="w-full text-left px-4 py-2.5 text-xs font-bold text-text-muted hover:text-text-main hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-3 transition-colors tracking-widest uppercase">
                  <Settings size={14} className="text-text-muted" /> Settings
                </button>
                <button 
                  onClick={handleLogout} 
                  className="w-full text-left px-4 py-2.5 text-xs font-black text-red-500 hover:text-red-400 hover:bg-red-500/10 flex items-center gap-3 mt-1 transition-colors tracking-widest uppercase"
                >
                  <LogOut size={14} className="text-red-500" /> Terminate Session
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};

export default Header;