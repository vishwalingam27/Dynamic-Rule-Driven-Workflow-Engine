import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { History, Clock, CheckCircle, XCircle, AlertCircle, Play, ArrowRight, ExternalLink, Trash2, Filter, Search, Terminal, Activity } from 'lucide-react';
import api, { executionService, workflowService } from '../services/api';

const ExecutionHistory = () => {
  const [executions, setExecutions] = useState([]);
  const [workflows, setWorkflows] = useState({});
  const [loading, setLoading] = useState(true);
  const [debugStatus, setDebugStatus] = useState(null);
  const [filter, setFilter] = useState('ALL'); // ALL, COMPLETED, FAILED, IN_PROGRESS
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const res = await api.get('/debug/status');
      const data = res.data;
      if (typeof data === 'object') {
        if (data.status === 'DB_OFFLINE') {
          setDebugStatus(`Database Offline`);
        } else {
          setDebugStatus(data.message || "Backend is ACTIVE");
        }
      } else {
        setDebugStatus(data || "Backend is ACTIVE");
      }
    } catch (e) {
      if (e.response && e.response.status === 404) {
        setDebugStatus("Backend Legacy Version");
      } else {
        setDebugStatus(`Backend Offline`);
      }
    }
  };

  const parseDate = (dateVal) => {
    if (!dateVal) return new Date(0);
    if (Array.isArray(dateVal)) {
      return new Date(dateVal[0], dateVal[1] - 1, dateVal[2], dateVal[3] || 0, dateVal[4] || 0, dateVal[5] || 0);
    }
    return new Date(dateVal);
  };

  const loadData = async () => {
    try {
      const [execRes, wfRes] = await Promise.all([
        executionService.getAll(),
        workflowService.getAll()
      ]);
      
      const executionsData = execRes.data
        .map(exec => ({
          ...exec,
          sortDate: parseDate(exec.startedAt)
        }))
        .sort((a, b) => b.sortDate - a.sortDate);

      setExecutions(executionsData);
      
      const wfMap = {};
      wfRes.data.forEach(wf => {
        wfMap[wf.id] = wf.name;
      });
      setWorkflows(wfMap);
    } catch (error) {
      console.error("Error loading history", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this execution record?")) {
      try {
        await executionService.delete(id);
        loadData();
      } catch (error) {
        console.error("Error deleting execution", error);
      }
    }
  };

  const handleClearAll = async () => {
    if (window.confirm("Permanently clear all execution history?")) {
      try {
        await executionService.deleteAll();
        loadData();
      } catch (error) {
        console.error("Error clearing history", error);
      }
    }
  };

  const filteredExecutions = executions.filter(exec => {
    const matchesFilter = filter === 'ALL' || exec.status === filter;
    const wfName = workflows[exec.workflowId] || '';
    const matchesSearch = wfName.toLowerCase().includes(searchTerm.toLowerCase()) || exec.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
    </div>
  );

  return (
    <div className="animate-in space-y-10 max-w-7xl mx-auto px-4">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-widest">
            <Terminal size={14} /> Telemetry Data
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight">System <span className="text-slate-500">History</span></h1>
          <p className="text-slate-500 font-medium">Review and analyze all past engine deployments and executions.</p>
        </div>
        <div className="flex items-center gap-3">
           <div className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-[10px] font-black uppercase tracking-widest ${
             debugStatus?.includes('ACTIVE') || debugStatus === 'Backend is ACTIVE' 
               ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
               : debugStatus?.includes('Database Offline') 
                 ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' 
                 : 'bg-rose-500/10 border-rose-500/20 text-rose-500'
           }`}>
              <div className={`w-1.5 h-1.5 rounded-full ${
                debugStatus?.includes('ACTIVE') || debugStatus === 'Backend is ACTIVE' 
                  ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' 
                  : debugStatus?.includes('Database Offline') 
                    ? 'bg-amber-500 animate-pulse' 
                    : 'bg-rose-500 animate-pulse'
              }`} />
              {debugStatus || 'Status Unknown'}
           </div>
           {executions.length > 0 && (
             <button onClick={handleClearAll} className="p-2.5 rounded-xl bg-slate-900 border border-white/5 text-rose-400 hover:bg-rose-500 hover:text-white transition-all shadow-xl">
               <Trash2 size={20} />
             </button>
           )}
        </div>
      </header>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between glass-card p-4 border-white/5">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input 
            className="input-field w-full pl-12 py-2.5" 
            placeholder="Search by workflow or ID..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 p-1 bg-slate-950/50 rounded-xl border border-white/5 w-full md:w-auto">
          {['ALL', 'COMPLETED', 'FAILED', 'IN_PROGRESS'].map(f => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 md:flex-none px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${filter === f ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:text-slate-300'}`}
            >
              {f.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden border-white/5 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-slate-900/40">
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Deployment Identity</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Temporal Data</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Execution State</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {filteredExecutions.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-20">
                      <Search size={48} />
                      <p className="font-bold uppercase tracking-widest text-xs">No matching execution records</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredExecutions.map((exec) => (
                  <tr key={exec.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${
                          exec.status === 'COMPLETED' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                          exec.status === 'FAILED' ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' :
                          'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
                        }`}>
                          <Activity size={20} />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-200 group-hover:text-indigo-400 transition-colors">
                            {workflows[exec.workflowId] || 'System Engine'}
                          </span>
                          <span className="text-[10px] text-slate-600 font-mono tracking-tighter">
                            CORE_HEX: {exec.id.substring(0, 12)}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex flex-col">
                         <span className="text-sm font-semibold text-slate-400">{parseDate(exec.startedAt).toLocaleDateString()}</span>
                         <span className="text-xs text-slate-500 tabular-nums">{parseDate(exec.startedAt).toLocaleTimeString()}</span>
                       </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                        exec.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]' :
                        exec.status === 'FAILED' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.1)]' :
                        'bg-blue-500/10 text-blue-400 border-blue-500/20 animate-pulse'
                      }`}>
                        {exec.status === 'COMPLETED' ? <CheckCircle size={12} /> : exec.status === 'FAILED' ? <XCircle size={12} /> : <Clock size={12} />}
                        {exec.status}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link 
                          to={`/executions/${exec.id}`}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-white/5 text-indigo-400 font-bold text-xs hover:bg-indigo-600 hover:text-white hover:shadow-lg hover:shadow-indigo-500/20 transition-all"
                        >
                          Logs <ExternalLink size={14} />
                        </Link>
                        <button 
                          onClick={() => handleDelete(exec.id)}
                          className="p-2 rounded-xl text-slate-700 hover:text-rose-500 hover:bg-rose-500/10 transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ExecutionHistory;
