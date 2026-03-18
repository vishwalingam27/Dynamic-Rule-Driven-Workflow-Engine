import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Play, CheckCircle, Clock, AlertCircle, Terminal, ArrowRight, Activity, ChevronRight, Zap, Target } from 'lucide-react';
import api, { workflowService, executionService, stepService } from '../services/api';

const ExecutionView = () => {
  const { id, executionId } = useParams();
  const navigate = useNavigate();
  const [workflow, setWorkflow] = useState(null);
  const [inputData, setInputData] = useState('{}');
  const [execution, setExecution] = useState(null);
  const [logs, setLogs] = useState([]);
  const [allRules, setAllRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const logContainerRef = React.useRef(null);

  useEffect(() => {
    if (executionId) {
      loadExistingExecution();
    } else {
      loadWorkflow();
    }
  }, [id, executionId]);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const loadWorkflow = async () => {
    try {
      const [wfRes, stepsRes] = await Promise.all([
        workflowService.getById(id),
        stepService.getByWorkflow(id)
      ]);
      const fetchedSteps = stepsRes.data.sort((a, b) => a.stepOrder - b.stepOrder);
      setWorkflow({ ...wfRes.data, steps: fetchedSteps });
      setInputData(wfRes.data.inputSchema);

      // Fetch all rules
      const rulesPromises = fetchedSteps.map(s => ruleService.getByStep(s.id));
      const rulesResponses = await Promise.all(rulesPromises);
      setAllRules(rulesResponses.flatMap(res => res.data));
    } catch (error) {
      console.error("Error loading workflow", error);
    } finally {
      setLoading(false);
    }
  };

  const loadExistingExecution = async () => {
    try {
      const execRes = await executionService.getById(executionId);
      setExecution(execRes.data);
      
      const [wfRes, stepsRes, logsRes] = await Promise.allSettled([
        workflowService.getById(execRes.data.workflowId),
        stepService.getByWorkflow(execRes.data.workflowId),
        api.get(`/executions/${executionId}/logs`)
      ]);
      
      if (wfRes.status === 'fulfilled') {
        const wfData = wfRes.value.data;
        const steps = stepsRes.status === 'fulfilled' ? stepsRes.value.data.sort((a, b) => a.stepOrder - b.stepOrder) : [];
        setWorkflow({ ...wfData, steps });
        setInputData(execRes.data.data);

        // Fetch all rules
        const rulesPromises = steps.map(s => ruleService.getByStep(s.id));
        const rulesResponses = await Promise.all(rulesPromises);
        setAllRules(rulesResponses.flatMap(res => res.data));
      } else {
        // Fallback for deleted workflow
        setWorkflow({ 
          name: "Deleted Workflow", 
          version: execRes.data.workflowVersion || "Unknown", 
          steps: [],
          isDeleted: true 
        });
        setInputData(execRes.data.data);
      }

      if (logsRes.status === 'fulfilled') {
        setLogs(logsRes.value.data || []);
      }
      
      if (execRes.data.status === 'IN_PROGRESS') {
        pollStatus(executionId);
      }
    } catch (error) {
      console.error("Error loading execution", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExecute = async () => {
    try {
      setLogs([]);
      const res = await executionService.execute(id, { data: inputData, triggeredBy: 'User' });
      setExecution(res.data);
      // Update URL without reloading to reflect execution state
      navigate(`/execute/${id}/${res.data.id}`, { replace: true });
      pollStatus(res.data.id);
    } catch (e) {
      console.error(e);
    }
  };

  const pollStatus = (execId) => {
    const interval = setInterval(async () => {
      try {
        const execRes = await executionService.getById(execId);
        setExecution(execRes.data);
        
        const logsRes = await api.get(`/executions/${execId}/logs`);
        if (logsRes.data) {
          setLogs(logsRes.data);
        }

        if (['COMPLETED', 'FAILED', 'CANCELED'].includes(execRes.data.status)) {
          clearInterval(interval);
        }
      } catch (e) {
        clearInterval(interval);
      }
    }, 1000);
  };

  const isValidJson = (str) => {
    try { JSON.parse(str); return true; } catch (e) { return false; }
  };

  const getStepName = (stepId) => {
    if (!workflow || !workflow.steps) return stepId;
    const step = workflow.steps.find(s => s.id === stepId);
    return step ? step.name : stepId;
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
    </div>
  );

  const completedStepIds = logs.map(l => {
    const step = (workflow.steps || []).find(s => s.name === l.stepName);
    return step ? step.id : null;
  }).filter(id => id);

  return (
    <div className="animate-in space-y-12 max-w-7xl mx-auto px-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative">
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-indigo-500/10 blur-[100px] -z-10 animate-pulse" />
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">
            <Link to="/" className="hover:text-indigo-400 transition-colors">Infrastructure</Link>
            <ChevronRight size={12} className="text-slate-700" />
            <span className="text-slate-400">Execution Control</span>
          </div>
          <h1 className="text-6xl font-black flex items-center gap-6 tracking-tighter">
            {workflow?.name || 'INITIALIZING...'}
            <div className="flex items-center gap-3">
              <span className="text-slate-600 font-black text-2xl">v{workflow?.version || '0'}</span>
              {workflow?.isDeleted && <span className="status-pill bg-rose-500/10 text-rose-500 border-rose-500/20">ARCHIVED</span>}
            </div>
          </h1>
        </div>
        {execution && (
          <div className="glass-card-premium px-8 py-4 flex items-center gap-6 border-white/5 shadow-2xl">
             <div className="flex flex-col items-end">
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-1">Global Status</span>
               <div className="flex items-center gap-3">
                 <div className={`w-2 h-2 rounded-full ${execution.status === 'IN_PROGRESS' ? 'bg-indigo-500 animate-pulse shadow-[0_0_10px_rgba(99,102,241,0.5)]' : execution.status === 'COMPLETED' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]'}`} />
                 <span className="font-black text-sm tracking-widest uppercase text-white">{execution.status}</span>
               </div>
             </div>
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Configuration & Input */}
        <div className="lg:col-span-4 space-y-8">
          <div className="glass-card-premium p-10 space-y-8">
            <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-glow-indigo" />
              Deployment Trigger
            </h2>
            
            <div className="space-y-6">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Input Payload</label>
                <button 
                  onClick={() => {
                    try { setInputData(JSON.stringify(JSON.parse(inputData), null, 2)); } catch (e) {}
                  }}
                  className="text-[9px] text-indigo-400 font-black uppercase tracking-widest hover:text-white transition-colors"
                >
                  Refactor
                </button>
              </div>
              <textarea 
                className={`neo-input w-full h-64 font-mono text-xs leading-relaxed border-white/5 bg-slate-950/60 transition-all duration-500 ${!isValidJson(inputData) ? 'border-rose-500/40 ring-4 ring-rose-500/5' : 'focus:border-indigo-500/40'}`}
                value={inputData}
                onChange={e => setInputData(e.target.value)}
                disabled={execution && execution.status === 'IN_PROGRESS'}
              />
              <button 
                onClick={handleExecute}
                className="btn-premium w-full py-5 shadow-2xl shadow-indigo-500/20 disabled:opacity-50 disabled:grayscale transition-all duration-500"
                disabled={(execution && execution.status === 'IN_PROGRESS') || !isValidJson(inputData)}
              >
                <span className="flex items-center gap-3 uppercase tracking-[0.2em] text-xs font-black">
                  <Activity size={20} className={execution?.status === 'IN_PROGRESS' ? 'animate-spin' : ''} />
                  {execution?.status === 'IN_PROGRESS' ? 'Processing Engine...' : 'Initialize Logic Flow'}
                </span>
              </button>
            </div>
          </div>

          <div className="glass-card-premium p-10 overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl -z-10 group-hover:bg-emerald-500/10 transition-all duration-700" />
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-10 flex items-center gap-3">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
               Real-time Graph
            </h3>
            <div className="relative min-h-[500px]">
              {(workflow?.steps || []).length === 0 ? (
                <div className="text-[10px] text-slate-600 font-bold uppercase tracking-widest leading-relaxed pt-4 text-center">
                  {workflow?.isDeleted ? "KERNEL DEFINITION TERMINATED." : "WAITING FOR DEPLOYMENT..."}
                </div>
              ) : (
                <svg className="w-full h-full min-h-[500px]" viewBox={`0 0 240 ${Math.max(500, (workflow?.steps || []).length * 100)}`}>
                  <defs>
                    <marker id="arrowhead-exec" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                      <polygon points="0 0, 10 3.5, 0 7" fill="currentColor" />
                    </marker>
                  </defs>

                  {/* Connection Lines based on Rules */}
                  {(workflow?.steps || []).map((s, i) => {
                    const stepRules = allRules.filter(r => r.stepId === s.id);
                    return stepRules.map((rule, ri) => {
                      const targetIdx = (workflow?.steps || []).findIndex(ts => ts.id === rule.nextStepId);
                      if (targetIdx === -1) return null;

                      const startX = 120;
                      const startY = i * 100 + 40;
                      const endX = 120;
                      const endY = targetIdx * 100 + 20;
                      
                      const isForward = targetIdx > i;
                      const offset = isForward ? (ri * 10 - (stepRules.length * 5)) : -30;
                      const curve = isForward ? `L ${startX + offset} ${startY + 20} L ${endX + offset} ${endY - 20}` : `C ${startX - 50} ${startY} ${startX - 50} ${endY} ${endX} ${endY}`;

                      // Check if this path was taken
                      const pathWasTaken = logs.some(l => l.stepName === s.name && l.selectedNextStep === rule.nextStepId);

                      return (
                        <path 
                          key={`path-${rule.id}`}
                          d={`M ${startX} ${startY} ${curve} L ${endX} ${endY}`}
                          stroke={pathWasTaken ? "#6366f1" : "rgba(255,255,255,0.05)"}
                          strokeWidth={pathWasTaken ? "2" : "1"}
                          fill="none"
                          markerEnd="url(#arrowhead-exec)"
                          className={`transition-all duration-700 ${pathWasTaken ? 'opacity-100 shadow-glow-indigo' : 'opacity-20'}`}
                          strokeDasharray={pathWasTaken ? "" : "4 2"}
                        />
                      );
                    });
                  })}

                  {/* Nodes */}
                  {(workflow?.steps || []).map((step, idx) => {
                    const isActive = execution?.currentStepId === step.id;
                    const isCompleted = completedStepIds.includes(step.id);
                    
                    return (
                      <g key={step.id} className="group/node">
                        <circle 
                          cx="120" 
                          cy={idx * 100 + 30} 
                          r="20" 
                          className={`transition-all duration-700 fill-slate-950 stroke-2 ${
                            isActive ? 'stroke-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.5)]' : 
                            isCompleted ? 'stroke-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 
                            'stroke-slate-800'
                          }`}
                        />
                        <foreignObject x="20" y={idx * 100 + 55} width="200" height="40">
                          <div className="text-center">
                             <p className={`text-[10px] font-black uppercase tracking-tighter truncate px-4 ${
                               isActive ? 'text-indigo-400' : isCompleted ? 'text-emerald-400' : 'text-slate-600'
                             }`}>
                               {step.name}
                             </p>
                          </div>
                        </foreignObject>
                        <text 
                          x="120" 
                          y={idx * 100 + 34} 
                          textAnchor="middle" 
                          className={`text-[8px] font-black pointer-events-none ${
                            isActive ? 'fill-indigo-400' : isCompleted ? 'fill-emerald-400' : 'fill-slate-700'
                          }`}
                        >
                          {idx + 1}
                        </text>
                        {isActive && (
                          <circle 
                            cx="120" 
                            cy={idx * 100 + 30} 
                            r="28" 
                            fill="none" 
                            stroke="#6366f1" 
                            strokeWidth="1" 
                            strokeDasharray="4 4" 
                            className="animate-spin-slow opacity-40"
                          />
                        )}
                      </g>
                    );
                  })}
                </svg>
              )}
            </div>
          </div>
        </div>

        {/* Right: Console Logs */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          <div className="glass-card-premium flex-1 min-h-[660px] flex flex-col overflow-hidden bg-slate-950/60 border-white/5 shadow-2xl">
            <div className="h-16 border-b border-white/5 bg-slate-950/80 flex items-center justify-between px-8 shrink-0 relative">
               <div className="absolute inset-0 bg-indigo-600/5 pulse-glow" />
               <div className="flex items-center gap-4 relative z-10">
                 <div className="w-8 h-8 rounded-lg bg-indigo-600/10 flex items-center justify-center border border-indigo-500/20 shadow-inner">
                   <Terminal size={16} className="text-indigo-400" />
                 </div>
                 <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">Integrated Kernel Console</span>
               </div>
               {execution && <span className="text-[10px] font-mono text-indigo-500/60 tracking-wider font-bold relative z-10 uppercase">EXEC_ID: {execution.id.split('-')[0]}...</span>}
            </div>
            
            <div 
              className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar" 
              ref={logContainerRef}
            >
              {logs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-30 select-none">
                  <div className="p-6 rounded-full bg-slate-900 border border-slate-800 mb-4 animate-pulse">
                    <Target size={32} className="text-slate-500" />
                  </div>
                  <p className="font-mono text-xs text-slate-500 tracking-widest uppercase">Awaiting instruction...</p>
                </div>
              ) : (
                logs.map((log, i) => (
                  <div key={i} className="animate-in group relative">
                    <div className="flex items-start gap-4">
                      <div className={`shrink-0 mt-1 w-1.5 h-1.5 rounded-full ${log.status === 'FAILED' ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]' : 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]'}`} />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-black text-white tracking-wide uppercase">{log.stepName}</span>
                            <span className="text-[9px] bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded text-slate-500 font-bold uppercase tracking-widest">{log.stepType}</span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-600">{new Date(log.startedAt).toLocaleTimeString()}</span>
                        </div>
                        
                        <div className="bg-slate-950/60 rounded-xl p-4 font-mono text-[11px] leading-relaxed border border-white/5 text-slate-400 group-hover:border-white/10 transition-colors shadow-inner">
                          {(log.evaluatedRules || '').split('\n').filter(l => l.trim()).map((line, j) => (
                            <div key={j} className={line.includes('-> true') ? 'text-indigo-300 font-bold' : ''}>
                              <span className="text-slate-700 mr-2">$</span> {line}
                            </div>
                          ))}
                          {log.errorMessage && (
                            <div className="text-rose-400 bg-rose-500/5 p-3 mt-2 rounded-lg border border-rose-500/10 flex gap-3">
                              <AlertCircle size={14} className="shrink-0" />
                              <span>{log.errorMessage}</span>
                            </div>
                          )}
                          {!log.selectedNextStep && !log.errorMessage && log.status === 'SUCCESS' && (
                             <div className="text-emerald-400/80 mt-2 font-bold flex items-center gap-1.5">
                               <CheckCircle size={12} />
                               Workflow Termination Condition Met
                             </div>
                          )}
                        </div>
                        
                        {log.selectedNextStep && (
                          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 px-1 uppercase tracking-widest">
                            <ChevronRight size={10} className="text-indigo-500" />
                            Transitioning to <span className="text-indigo-400">{getStepName(log.selectedNextStep)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExecutionView;
