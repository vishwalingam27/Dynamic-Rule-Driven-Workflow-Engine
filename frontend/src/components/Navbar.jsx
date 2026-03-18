import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Activity, Layout, Play, History, Settings } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Workflows', icon: Layout },
    { path: '/history', label: 'History', icon: History },
  ];

  return (
    <nav className="sticky top-0 z-50 mb-12 border-b border-white/5 bg-slate-950/40 backdrop-blur-2xl">
      <div className="container mx-auto px-8 h-24 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-4 group">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-500/40 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
            <Activity className="text-white" size={24} />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-black tracking-tighter text-white">
              RULE<span className="text-indigo-400">FLOW</span>
            </span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em] -mt-1">
              Engine v2.0
            </span>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-2 bg-slate-900/30 p-1.5 rounded-2xl border border-white/5 backdrop-blur-md">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-500 ${
                  isActive 
                    ? 'bg-indigo-600/90 text-white shadow-xl shadow-indigo-500/20' 
                    : 'text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon size={18} className={isActive ? 'animate-pulse' : ''} />
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden lg:flex flex-col items-end">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">System Status</span>
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Operational
            </span>
          </div>
          <button className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-900/50 border border-white/5 text-slate-400 hover:text-white hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all duration-500">
            <Settings size={22} />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
