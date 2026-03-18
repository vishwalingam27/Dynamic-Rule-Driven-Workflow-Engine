import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Play, Edit, Trash2, ArrowRight, Activity, Zap, Shield, Layout, Settings } from 'lucide-react';
import { workflowService } from '../services/api';

const WorkflowList = () => {
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [activeFlows, setActiveFlows] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);

  useEffect(() => {
    loadWorkflows();
    loadStats();
    
    const interval = setInterval(() => {
      loadStats();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const loadWorkflows = async () => {
    try {
      const response = await workflowService.getAll();
      setWorkflows(response.data);
    } catch (error) {
      console.error("Error loading workflows", error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const { dashboardService } = await import('../services/api');
      const [activeFlowsRes, totalStepsRes] = await Promise.all([
        dashboardService.getActiveFlows(),
        dashboardService.getTotalSteps()
      ]);
      setActiveFlows(activeFlowsRes.data.count);
      setTotalSteps(totalStepsRes.data.count);
    } catch (error) {
      console.error("Error loading dashboard stats", error);
    }
  };

  const handleDeleteWorkflow = async (id) => {
    if (window.confirm("Delete this workflow and all associated steps/rules?")) {
      try {
        await workflowService.delete(id);
        loadWorkflows();
      } catch (error) {
        console.error("Error deleting workflow", error);
      }
    }
  };

  const stats = [
    { label: 'Active Flows', value: activeFlows, icon: Zap, color: 'text-indigo-400' },
    { label: 'Total Engines', value: workflows.length, icon: Shield, color: 'text-emerald-400' },
    { label: 'Total Logic Steps', value: totalSteps, icon: Activity, color: 'text-rose-400' },
  ];

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
    </div>
  );

  return (
    <div className="animate-in space-y-16 max-w-7xl mx-auto px-8">
      {/* Hero / Stats Section */}
      <section className="relative">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-600/10 blur-[120px] rounded-full pulse-glow" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-fuchsia-600/5 blur-[120px] rounded-full pulse-glow" style={{ animationDelay: '2s' }} />
        
        <div className="flex flex-col md:flex-row justify-between items-end gap-10 mb-16 relative z-10">
          <div className="space-y-4 max-w-2xl">
            <h1 className="text-7xl font-black tracking-tight leading-tight">
              Logic <br />
              <span className="text-gradient">Orchestration</span>
            </h1>
            <p className="text-slate-400 font-medium text-xl leading-relaxed">
              Design, execute, and monitor complex business logic with high-performance automated workflows.
            </p>
          </div>
          <Link to="/workflows/new" className="btn-premium group shadow-2xl shadow-indigo-500/20 min-w-[240px]">
            <span className="flex items-center gap-3">
              <Plus size={22} className="group-hover:rotate-180 transition-transform duration-700" />
              Initialize Engine
            </span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((stat, i) => (
            <div key={i} className="glass-card-premium p-8 flex items-center gap-8 group">
              <div className={`w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center border border-white/5 shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:border-indigo-500/30`}>
                <stat.icon className={`${stat.color} group-hover:scale-110 transition-transform duration-500`} size={28} />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">{stat.label}</p>
                <p className="text-4xl font-black text-white tabular-nums">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Workflows Grid */}
      <section className="space-y-8 relative">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.4em] flex items-center gap-3">
            <Layout size={16} className="text-indigo-400 mb-0.5" /> 
            Active Modules
          </h2>
          <div className="h-px flex-1 mx-8 bg-gradient-to-r from-slate-800/50 to-transparent" />
        </div>

        {workflows.length === 0 ? (
          <div className="glass-card-premium p-24 text-center space-y-8">
            <div className="w-24 h-24 bg-slate-950 rounded-3xl mx-auto flex items-center justify-center border border-white/5 shadow-inner group-hover:border-indigo-500/20 transition-all">
               <Plus size={48} className="text-slate-800 animate-pulse" />
            </div>
            <div className="max-w-md mx-auto space-y-3">
              <h3 className="text-2xl font-black text-slate-200">System Ready for Deployment</h3>
              <p className="text-slate-500 text-lg leading-relaxed">Initialize your first automation engine to begin processing business logic nodes.</p>
            </div>
            <Link to="/workflows/new" className="inline-flex items-center gap-3 text-indigo-400 font-black hover:text-indigo-300 transition-colors uppercase tracking-widest text-sm">
              Create Baseline Module <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {workflows.map(workflow => (
              <div key={workflow.id} className="glass-card-premium group flex flex-col h-full hover:shadow-[0_0_50px_-12px_rgba(99,102,241,0.2)]">
                <div className="p-10 space-y-8 flex-1">
                  <div className="flex justify-between items-start">
                    <div className="w-14 h-14 bg-indigo-600/10 rounded-2xl flex items-center justify-center border border-indigo-500/20 group-hover:bg-indigo-600 transition-all duration-700 shadow-inner">
                      <Zap className="text-indigo-400 group-hover:text-white transition-all duration-700" size={24} />
                    </div>
                    <div className={`status-pill ${workflow.isActive ? 'status-active' : 'status-idle'}`}>
                      {workflow.isActive ? 'Operational' : 'Offline'}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                       <span className="text-[10px] font-black text-indigo-500/80 uppercase tracking-widest">Version {workflow.version || '1.0.0'}</span>
                       <span className="h-px flex-1 ml-4 bg-slate-800/40" />
                    </div>
                    <h3 className="text-3xl font-black text-white group-hover:text-indigo-300 transition-colors tracking-tighter">{workflow.name}</h3>
                    <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed font-medium capitalize">
                      {workflow.description || `Dynamic orchestration engine for ${workflow.name.toLowerCase()} processing.`}
                    </p>
                  </div>

                  <div className="flex items-center gap-6 pt-4">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-600 font-black uppercase tracking-widest">Nodes</span>
                      <span className="text-lg font-black text-slate-300 tabular-nums">04</span>
                    </div>
                    <div className="w-px h-10 bg-slate-800/80" />
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-600 font-black uppercase tracking-widest">Success Rate</span>
                      <span className="text-lg font-black text-emerald-400/90 tabular-nums">99.2%</span>
                    </div>
                  </div>
                </div>
                
                <div className="px-10 py-6 bg-slate-950/40 border-t border-white/5 flex items-center justify-between backdrop-blur-md">
                  <div className="flex items-center gap-2">
                    <Link to={`/workflows/${workflow.id}`} className="p-3 rounded-xl bg-slate-900/50 border border-white/5 hover:border-indigo-500/30 text-slate-400 hover:text-white transition-all duration-500" title="Configuration">
                      <Settings size={20} />
                    </Link>
                    <button 
                      onClick={() => handleDeleteWorkflow(workflow.id)}
                      className="p-3 rounded-xl bg-slate-900/50 border border-white/5 hover:border-rose-500/30 text-slate-400 hover:text-rose-500 transition-all duration-500" 
                      title="Decommission"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                  
                  <button 
                    onClick={() => navigate(`/execute/${workflow.id}`)}
                    className="flex items-center gap-3 text-indigo-400 hover:text-indigo-300 font-black text-sm uppercase tracking-widest transition-all group-hover:gap-5"
                  >
                    Deploy <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default WorkflowList;
