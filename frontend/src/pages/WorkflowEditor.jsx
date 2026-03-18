import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Save, Plus, Trash2, ArrowRight, ChevronDown, ChevronUp, Play, Settings, Database, Activity, GitBranch } from 'lucide-react';
import { workflowService, stepService, ruleService } from '../services/api';

const WorkflowEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workflow, setWorkflow] = useState({ name: '', version: '1.0', isActive: true, inputSchema: '{}', startStepId: '' });
  const [steps, setSteps] = useState([]);
  const [allRules, setAllRules] = useState([]); // Store all rules for the graph
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('settings'); // settings, steps
  const [previewData, setPreviewData] = useState({});
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (id) {
      loadWorkflowData();
    } else {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    try {
      const parsed = JSON.parse(workflow.inputSchema);
      setPreviewData(parsed);
    } catch (e) {
      // Ignore invalid JSON while typing
    }
  }, [workflow.inputSchema]);

  const loadWorkflowData = async () => {
    try {
      const [wfRes, stepsRes] = await Promise.all([
        workflowService.getById(id),
        stepService.getByWorkflow(id)
      ]);
      const fetchedSteps = stepsRes.data.sort((a, b) => a.stepOrder - b.stepOrder);
      setWorkflow(wfRes.data);
      setSteps(fetchedSteps);

      // Fetch all rules for the graph
      const rulesPromises = fetchedSteps.map(s => ruleService.getByStep(s.id));
      const rulesResponses = await Promise.all(rulesPromises);
      const flattenedRules = rulesResponses.flatMap(res => res.data);
      setAllRules(flattenedRules);
    } catch (error) {
      console.error("Error loading workflow data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveWorkflow = async () => {
    try {
      if (id) {
        await workflowService.update(id, workflow);
      } else {
        const res = await workflowService.create(workflow);
        navigate(`/workflows/${res.data.id}`);
      }
    } catch (error) {
      console.error("Error saving workflow", error);
    }
  };

  const addStep = async () => {
    if (!id) return alert("Save workflow first");
    const newStep = { name: 'New Step', stepType: 'TASK', stepOrder: steps.length + 1, metadata: '{}' };
    try {
      const res = await stepService.create(id, newStep);
      setSteps([...steps, res.data]);
    } catch (error) {
      console.error("Error adding step", error);
    }
  };

  const handleDeleteStep = async (stepId) => {
    if (window.confirm("Are you sure you want to delete this step?")) {
      try {
        await stepService.delete(stepId);
        loadWorkflowData();
      } catch (error) {
        console.error("Error deleting step", error);
      }
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
    </div>
  );

  return (
    <div className="animate-in space-y-12 max-w-7xl mx-auto px-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative">
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-indigo-500/10 blur-[100px] -z-10 animate-pulse" />
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">
            <Link to="/" className="hover:text-indigo-400 transition-colors">Infrastructure</Link>
            <ArrowRight size={12} className="text-slate-700" />
            <span className="text-slate-400">{id ? 'Configuration' : 'New Module'}</span>
          </div>
          <h1 className="text-6xl font-black flex items-center gap-6 tracking-tighter">
            {workflow.name || 'Untitled Module'}
            {workflow.isActive && (
              <div className="status-pill status-active flex items-center gap-2 py-1.5 px-4">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Operational
              </div>
            )}
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(`/execute/${id}`)} 
            className="px-8 py-4 rounded-2xl bg-slate-900/50 border border-white/5 text-slate-300 font-black text-xs uppercase tracking-widest hover:border-indigo-500/30 hover:bg-slate-900 transition-all duration-500 flex items-center gap-3 group"
          >
            <Play size={18} className="group-hover:text-indigo-400 transition-colors" /> Simulated Run
          </button>
          <button 
            onClick={handleSaveWorkflow} 
            className="btn-premium px-10 py-4 shadow-2xl shadow-indigo-500/20"
          >
            <span className="flex items-center gap-3">
              <Save size={18} /> {id ? 'Commit Changes' : 'Initialize Module'}
            </span>
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <div className="flex gap-2 p-1.5 bg-slate-950/40 rounded-2xl border border-white/5 w-fit backdrop-blur-md">
            <button 
              onClick={() => setActiveTab('settings')}
              className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-500 ${activeTab === 'settings' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:text-white'}`}
            >
              Kernel Settings
            </button>
            <button 
              onClick={() => setActiveTab('steps')}
              className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-500 ${activeTab === 'steps' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:text-white'}`}
            >
              Logical Units ({steps.length})
            </button>
          </div>

          {activeTab === 'settings' ? (
            <div className="glass-card-premium p-10 animate-in space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    Module Identifier
                  </label>
                  <input 
                    className="neo-input w-full text-xl font-black tracking-tight py-4"
                    value={workflow.name}
                    onChange={e => setWorkflow({...workflow, name: e.target.value})}
                    placeholder="e.g. CORE_LOGISTICS_BRAIN"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Version Agent</label>
                  <input 
                    className="input-field w-full"
                    value={workflow.version}
                    onChange={e => setWorkflow({...workflow, version: e.target.value})}
                  />
                </div>
              </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    Entry Configuration
                  </label>
                  <div className="p-6 rounded-2xl bg-slate-950/40 border border-white/5 flex items-center justify-between backdrop-blur-md group hover:border-indigo-500/20 transition-all duration-500">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-500/20 shadow-inner group-hover:bg-indigo-600 transition-all duration-700">
                        <Play size={22} className="text-indigo-400 group-hover:text-white transition-all duration-700 translate-x-0.5" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-white uppercase tracking-widest">Entry Point</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Define initial execution node</p>
                      </div>
                    </div>
                    <select 
                      className="neo-input min-w-[280px] font-bold text-slate-300"
                      value={workflow.startStepId || ''}
                      onChange={e => setWorkflow({...workflow, startStepId: e.target.value})}
                    >
                      <option value="">-- No Start Step --</option>
                      {steps.map(s => (
                        <option key={s.id} value={s.id}>UNIT {s.stepOrder}: {s.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-4">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                      Input Schema
                    </label>
                    <button 
                      onClick={() => {
                        try {
                          const obj = JSON.parse(workflow.inputSchema);
                          setWorkflow({...workflow, inputSchema: JSON.stringify(obj, null, 2)});
                        } catch (e) { alert("Invalid JSON format"); }
                      }}
                      className="text-[9px] text-indigo-400 hover:text-white font-black uppercase tracking-[0.2em] transition-colors"
                    >
                      Refactor JSON
                    </button>
                  </div>
                  <div className="relative group">
                    <textarea 
                      className="neo-input w-full h-64 font-mono text-xs leading-relaxed border-white/5 focus:border-indigo-500/40 bg-slate-950/60"
                      value={workflow.inputSchema}
                      onChange={e => setWorkflow({...workflow, inputSchema: e.target.value})}
                      placeholder='{ "amount": 0, "status": "new" }'
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Kernel Data Explorer
                  </label>
                  <div className="glass-card-premium p-8 h-64 overflow-auto custom-scrollbar font-mono text-[11px] bg-slate-950/40 border-white/5">
                    <div className="space-y-3">
                      {Object.keys(previewData).length === 0 ? (
                        <p className="text-slate-600 italic uppercase tracking-widest text-[9px] text-center pt-20">Awaiting Valid Schema...</p>
                      ) : (
                        Object.entries(previewData).map(([key, val]) => (
                          <div key={key} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0 group/data">
                            <span className="text-indigo-400 font-bold group-hover:text-indigo-300 transition-colors uppercase tracking-tighter">{key}</span>
                            <span className="text-slate-500 font-bold">{typeof val === 'object' ? 'OBJ' : String(val).toUpperCase()}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.1em] mt-2 italic px-1">Engine variables available for SpEL evaluation.</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="animate-in space-y-4">
              <div className="flex justify-between items-center px-2">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Execution Sequence</h3>
                <button onClick={addStep} className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 font-semibold text-sm transition-colors">
                  <Plus size={16} /> Add Process Step
                </button>
              </div>

              <div className="space-y-4">
                {steps.length === 0 ? (
                  <div className="glass-card p-12 text-center space-y-4">
                    <div className="w-16 h-16 bg-slate-800 rounded-2xl mx-auto flex items-center justify-center text-slate-600">
                      <Plus size={32} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-400">No steps defined</h4>
                      <p className="text-sm text-slate-600">Start by adding the first action in your workflow</p>
                    </div>
                    <button onClick={addStep} className="text-indigo-400 border border-indigo-500/30 px-6 py-2 rounded-xl text-sm font-bold hover:bg-indigo-500/10 transition-all">
                      Create First Step
                    </button>
                  </div>
                ) : (
                  steps.map((step) => (
                    <StepItem 
                      key={step.id} 
                      step={step} 
                      allSteps={steps} 
                      onUpdate={() => loadWorkflowData()} 
                      onDelete={() => handleDeleteStep(step.id)}
                    />
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="glass-card-premium p-6 h-fit sticky top-28 overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl -z-10 group-hover:bg-indigo-500/10 transition-all duration-700" />
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              Neural Architecture
            </h3>
            
            <div className="relative min-h-[400px]">
              {steps.length === 0 ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center opacity-20 bg-slate-950/20 rounded-2xl border border-dashed border-slate-800">
                   <GitBranch size={40} className="mb-4" />
                   <p className="text-[10px] uppercase font-bold tracking-widest leading-relaxed">System ready.<br/>awaiting logic nodes...</p>
                </div>
              ) : (
                <svg className="w-full h-full min-h-[500px]" viewBox={`0 0 240 ${Math.max(500, steps.length * 100)}`}>
                  <defs>
                    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                      <polygon points="0 0, 10 3.5, 0 7" fill="#6366f1" opacity="0.6" />
                    </marker>
                    <linearGradient id="activeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#818cf8" stopOpacity="0.4" />
                    </linearGradient>
                  </defs>
                  
                  {/* Connection Lines based on Rules */}
                  {steps.map((s, i) => {
                    const stepRules = allRules.filter(r => r.stepId === s.id);
                    return stepRules.map((rule, ri) => {
                      const targetIdx = steps.findIndex(ts => ts.id === rule.nextStepId);
                      if (targetIdx === -1) return null; // Ends workflow

                      const startX = 120;
                      const startY = i * 100 + 45;
                      const endX = 120;
                      const endY = targetIdx * 100 + 15;
                      
                      const isForward = targetIdx > i;
                      const offset = isForward ? (ri * 10 - (stepRules.length * 5)) : -30;
                      const curve = isForward ? `L ${startX + offset} ${startY + 20} L ${endX + offset} ${endY - 20}` : `C ${startX - 50} ${startY} ${startX - 50} ${endY} ${endX} ${endY}`;

                      return (
                        <path 
                          key={`path-${rule.id}`}
                          d={`M ${startX} ${startY} ${curve} L ${endX} ${endY}`}
                          stroke="#6366f1"
                          strokeWidth="1.5"
                          fill="none"
                          markerEnd="url(#arrowhead)"
                          className="opacity-30 hover:opacity-100 transition-opacity duration-300"
                          strokeDasharray={!rule.condition || rule.condition === 'true' ? "" : "4 2"}
                        />
                      );
                    });
                  })}

                  {/* Nodes */}
                  {steps.map((s, i) => (
                    <g key={`node-${s.id}`} className="group/node">
                      <circle 
                        cx="120" 
                        cy={i * 100 + 30} 
                        r="22" 
                        className={`transition-all duration-500 fill-slate-950 stroke-2 ${workflow.startStepId === s.id ? 'stroke-indigo-500 shadow-xl' : 'stroke-slate-800 group-hover/node:stroke-indigo-400'}`}
                      />
                      <foreignObject x="20" y={i * 100 + 58} width="200" height="30">
                        <div className="text-center">
                           <p className={`text-[10px] font-black uppercase tracking-tighter truncate px-4 ${workflow.startStepId === s.id ? 'text-indigo-400' : 'text-slate-500 group-hover/node:text-slate-200'}`}>
                             {s.name}
                           </p>
                        </div>
                      </foreignObject>
                      <text 
                        x="120" 
                        y={i * 100 + 34} 
                        textAnchor="middle" 
                        className={`text-[9px] font-black pointer-events-none ${workflow.startStepId === s.id ? 'fill-indigo-400' : 'fill-slate-600'}`}
                      >
                        {s.stepOrder}
                      </text>
                    </g>
                  ))}
                </svg>
              )}
            </div>

            <div className="mt-8 pt-6 border-t border-white/5 space-y-4">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500">
                 <span>Latency Projection</span>
                 <span className="text-emerald-400">~1.5ms</span>
              </div>
              <div className="w-full h-1 bg-slate-950 rounded-full overflow-hidden">
                 <div className="w-2/3 h-full bg-indigo-500 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StepItem = ({ step, allSteps, onUpdate, onDelete }) => {
  const [expanded, setExpanded] = useState(false);
  const [rules, setRules] = useState([]);

  useEffect(() => {
    if (expanded) loadRules();
  }, [expanded]);

  const loadRules = async () => {
    const res = await ruleService.getByStep(step.id);
    setRules(res.data.sort((a, b) => a.priority - b.priority));
  };

  const addRule = async () => {
    await ruleService.create(step.id, { condition: '', nextStepId: '', priority: rules.length + 1 });
    loadRules();
  };

  const handleDeleteRule = async (ruleId) => {
    if (window.confirm("Delete this rule?")) {
      try {
        await ruleService.delete(ruleId);
        loadRules();
      } catch (error) {
        console.error("Error deleting rule", error);
      }
    }
  };

  const [localStep, setLocalStep] = useState(step);

  useEffect(() => {
    setLocalStep(step);
  }, [step.id]); // Only reset local state if the step ID changes

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localStep.name !== step.name || localStep.stepType !== step.stepType) {
        handleUpdateStep(localStep);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [localStep]);

  const handleUpdateStep = async (updates) => {
    try {
      await stepService.update(step.id, { ...step, ...updates });
      onUpdate();
    } catch (error) {
      console.error("Error updating step", error);
    }
  };

  return (
    <div className={`glass-card overflow-hidden group/item ${expanded ? 'ring-1 ring-indigo-500/30 bg-slate-900/40' : ''}`}>
      <div 
        className={`p-5 flex items-center justify-between cursor-pointer transition-all ${expanded ? 'bg-indigo-500/[0.03]' : 'hover:bg-white/[0.02]'}`}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-5">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm border transition-all ${
            expanded ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-500/20' : 'bg-slate-800 text-slate-400 border-slate-700'
          }`}>
            {step.stepOrder}
          </div>
          <div>
            <h3 className="font-bold text-slate-200">{step.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-[9px] font-black tracking-widest uppercase px-1.5 py-0.5 rounded ${
                step.stepType === 'APPROVAL' ? 'bg-amber-500/10 text-amber-500' :
                step.stepType === 'NOTIFICATION' ? 'bg-cyan-500/10 text-cyan-500' :
                'bg-slate-500/10 text-slate-400'
              }`}>{step.stepType}</span>
              <span className="text-[10px] text-slate-600 font-medium">• {rules.length} branches</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="p-2.5 opacity-0 group-hover/item:opacity-100 hover:bg-rose-500/10 rounded-xl text-slate-600 hover:text-rose-500 transition-all"
          >
            <Trash2 size={18} />
          </button>
          <div className={`p-2 rounded-lg transition-transform duration-300 ${expanded ? 'rotate-180 text-indigo-400' : 'text-slate-600'}`}>
            <ChevronDown size={20} />
          </div>
        </div>
      </div>

      {expanded && (
        <div className="p-8 border-t border-white/5 space-y-8 animate-in backdrop-blur-sm bg-indigo-500/[0.01]">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">Label</label>
              <input 
                className="input-field w-full text-sm font-semibold"
                value={localStep.name}
                onChange={(e) => {
                  e.stopPropagation();
                  setLocalStep({ ...localStep, name: e.target.value });
                }}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">Type</label>
              <select 
                className="input-field w-full text-sm font-semibold"
                value={localStep.stepType}
                onChange={(e) => {
                  e.stopPropagation();
                  setLocalStep({ ...localStep, stepType: e.target.value });
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <option value="TASK">Manual Task</option>
                <option value="APPROVAL">Decision / Approval</option>
                <option value="NOTIFICATION">Auto Notification</option>
              </select>
            </div>

          <div className="space-y-6">
            <div className="flex justify-between items-center px-1">
              <div className="flex items-center gap-2">
                <GitBranch size={16} className="text-indigo-400" />
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Logic Channels</h4>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); addRule(); }}
                className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 uppercase tracking-wider flex items-center gap-1.5 transition-colors"
              >
                <Plus size={14} /> New Branch
              </button>
            </div>
            
            <div className="space-y-3">
              {rules.length === 0 ? (
                <div className="p-10 border-2 border-dashed border-slate-800 rounded-2xl text-center">
                  <p className="text-xs text-slate-600 font-medium">No branching rules defined for this step.</p>
                </div>
              ) : (
                rules.map(rule => (
                  <RuleItem 
                    key={rule.id} 
                    rule={rule} 
                    allSteps={allSteps} 
                    currentStepId={step.id}
                    onDelete={() => handleDeleteRule(rule.id)}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const RuleItem = ({ rule, allSteps, currentStepId, onDelete }) => {
  const [localRule, setLocalRule] = useState(rule);

  useEffect(() => {
    setLocalRule(rule);
  }, [rule.id]); // Only reset if the rule ID itself changes (e.g. after a reload)

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localRule.condition !== rule.condition || localRule.nextStepId !== rule.nextStepId) {
        ruleService.update(rule.id, localRule).then(() => {
           // Optionally we can call a lighter refresh here if needed
        });
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [localRule]);

  const isDefault = !localRule.condition || 
                    localRule.condition.toUpperCase() === 'DEFAULT' || 
                    localRule.condition.toUpperCase() === 'TRUE' ||
                    localRule.condition.trim() === '';

  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 bg-slate-900/60 p-2 rounded-2xl border border-white/5 hover:border-indigo-500/30 transition-all group/rule">
      <div className="relative flex-[2] min-w-0">
        <input 
          placeholder="Condition (e.g. amount > 100)" 
          className={`input-field w-full text-sm font-mono py-2.5 !bg-slate-950/80 !visible !opacity-100 !flex ${isDefault ? 'text-indigo-400 border-indigo-500/20' : 'text-white border-white/10'}`}
          style={{ display: 'block' }}
          value={localRule.condition || ''}
          onChange={(e) => {
            e.stopPropagation();
            setLocalRule({ ...localRule, condition: e.target.value });
          }}
          onClick={(e) => e.stopPropagation()}
        />
        {isDefault && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 rounded bg-indigo-500/20 border border-indigo-500/30 text-[8px] font-black text-indigo-300 uppercase tracking-tighter shadow-lg pointer-events-none">
            Default
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <ArrowRight size={16} className="text-slate-600 shrink-0 hidden md:block" />
        <select 
          className="input-field text-xs font-semibold py-2.5 !bg-slate-900/80 flex-1 min-w-0"
          value={localRule.nextStepId || ''}
          onChange={(e) => {
            e.stopPropagation();
            setLocalRule({ ...localRule, nextStepId: e.target.value });
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <option value="">🏁 End Workflow</option>
          {allSteps.filter(s => s.id !== currentStepId).map(s => (
            <option key={s.id} value={s.id}>↳ {s.name}</option>
          ))}
        </select>
        
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="p-2.5 text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all opacity-0 group-hover/rule:opacity-100 shrink-0"
          title="Delete Rule"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};

export default WorkflowEditor;
