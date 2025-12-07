import React, { useState } from 'react';
import { AppNode, NodeType, GlobalStats, HistoryPoint } from '../types';
import { Zap, Settings, BarChart3, PanelRightClose, PanelRightOpen, Sliders, Activity, Clock, Layers, Target, AlertTriangle, TrendingUp, Gauge } from 'lucide-react';
import KPIChart from './KPIChart';

interface RightSidebarProps {
  selectedNode: AppNode | null;
  onChange: (id: string, data: any) => void;
  onAnalyze: () => void;
  simulationData: GlobalStats & { history: HistoryPoint[] };
  nodes: AppNode[];
}

const RightSidebar: React.FC<RightSidebarProps> = ({ selectedNode, onChange, onAnalyze, simulationData, nodes }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'properties' | 'analysis'>('dashboard');
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Find bottleneck node name
  const bottleneckNode = nodes.find(n => n.id === simulationData.bottleneckNodeId);

  // Switch to properties tab automatically when a node is selected
  React.useEffect(() => {
    if (selectedNode) setActiveTab('properties');
    else if (activeTab === 'properties') setActiveTab('dashboard');
  }, [selectedNode]);

  const handleChange = (field: string, value: string | number) => {
    if (!selectedNode) return;
    onChange(selectedNode.id, {
      ...selectedNode.data,
      [field]: value,
    });
  };

  const isProcess = selectedNode?.data.type === NodeType.PROCESS || selectedNode?.data.type === NodeType.QUALITY;
  const isInventory = selectedNode?.data.type === NodeType.INVENTORY;

  if (isCollapsed) {
     return (
        <div className="w-14 bg-[#0f172a] border-l border-slate-800 flex flex-col items-center py-4 gap-4 z-20">
           <button onClick={() => setIsCollapsed(false)} className="p-2 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors">
              <PanelRightOpen size={20} />
           </button>
           <div className="h-px w-6 bg-slate-800"></div>
           <button onClick={() => { setIsCollapsed(false); setActiveTab('dashboard'); }} className="text-emerald-400 p-2"><BarChart3 size={20}/></button>
           <button onClick={() => { setIsCollapsed(false); setActiveTab('properties'); }} className="text-blue-400 p-2"><Settings size={20}/></button>
        </div>
     );
  }

  return (
    <div className="w-96 bg-[#0f172a] border-l border-slate-800 flex flex-col h-full z-20 shadow-xl transition-all duration-300">
      {/* Tabs */}
      <div className="flex items-center border-b border-slate-800 bg-slate-900/50">
         <button onClick={() => setIsCollapsed(true)} className="p-3 text-slate-500 hover:text-slate-300 border-r border-slate-800 hover:bg-slate-900 transition-colors">
            <PanelRightClose size={18} />
         </button>
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors relative
            ${activeTab === 'dashboard' ? 'text-emerald-400 bg-slate-800/50' : 'text-slate-500 hover:text-slate-300'}
          `}
        >
          KPIs
          {activeTab === 'dashboard' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500"></div>}
        </button>
        <button
          onClick={() => setActiveTab('properties')}
          className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors relative
            ${activeTab === 'properties' ? 'text-blue-400 bg-slate-800/50' : 'text-slate-500 hover:text-slate-300'}
          `}
        >
          Properties
          {activeTab === 'properties' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"></div>}
        </button>
        <button
          onClick={() => setActiveTab('analysis')}
          className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors relative
            ${activeTab === 'analysis' ? 'text-purple-400 bg-slate-800/50' : 'text-slate-500 hover:text-slate-300'}
          `}
        >
          AI
          {activeTab === 'analysis' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500"></div>}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        
        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
            <div className="space-y-4 animate-in fade-in duration-300">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                        <Activity className="text-emerald-500" /> Live Metrics
                    </h2>
                    <span className="text-xs text-slate-500 font-mono animate-pulse">● LIVE</span>
                </div>

                {/* Bottleneck Alert */}
                {bottleneckNode && simulationData.bottleneckUtilization > 80 && (
                  <div className="bg-red-900/30 border border-red-700/50 rounded-lg p-3 flex items-center gap-3">
                    <AlertTriangle className="text-red-400 shrink-0" size={20} />
                    <div>
                      <p className="text-xs font-bold text-red-300">Bottleneck Detected</p>
                      <p className="text-xs text-red-400/80">{bottleneckNode.data.label} at {simulationData.bottleneckUtilization}% utilization</p>
                    </div>
                  </div>
                )}

                {/* OEE Card */}
                <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 rounded-lg p-4 border border-slate-700">
                    <div className="flex justify-between items-start mb-3">
                        <div>
                            <p className="text-xs text-slate-400 uppercase font-semibold">Overall Equipment Effectiveness</p>
                            <p className="text-3xl font-mono text-white">{simulationData.oee.toFixed(1)}<span className="text-lg text-slate-500">%</span></p>
                        </div>
                        <Gauge size={24} className="text-blue-400"/>
                    </div>
                    {/* OEE Breakdown */}
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="bg-slate-800/50 p-2 rounded">
                        <span className="text-slate-500 block">Availability</span>
                        <span className="font-mono text-emerald-400">{simulationData.availability.toFixed(1)}%</span>
                      </div>
                      <div className="bg-slate-800/50 p-2 rounded">
                        <span className="text-slate-500 block">Performance</span>
                        <span className="font-mono text-blue-400">{simulationData.performance.toFixed(1)}%</span>
                      </div>
                      <div className="bg-slate-800/50 p-2 rounded">
                        <span className="text-slate-500 block">Quality</span>
                        <span className="font-mono text-purple-400">{simulationData.quality.toFixed(1)}%</span>
                      </div>
                    </div>
                </div>

                {/* Throughput Card */}
                <div className="bg-slate-800/40 rounded-lg p-4 border border-slate-700">
                    <div className="flex justify-between items-end mb-2">
                        <div>
                            <p className="text-xs text-slate-400 uppercase font-semibold">Throughput</p>
                            <p className="text-2xl font-mono text-white">{simulationData.throughput.toFixed(0)} <span className="text-sm text-slate-500">u/hr</span></p>
                            <p className="text-xs text-slate-500">{simulationData.throughputPerMinute} units in last minute</p>
                        </div>
                        <TrendingUp size={20} className="text-emerald-500 mb-2"/>
                    </div>
                    <KPIChart data={simulationData.history} dataKey="throughput" color="#10b981" label="Throughput" />
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                    {/* WIP */}
                    <div className="bg-slate-800/40 rounded-lg p-3 border border-slate-700">
                        <div className="flex items-center gap-2 mb-1">
                            <Layers size={14} className="text-amber-500"/>
                            <p className="text-xs text-slate-400 uppercase font-semibold">WIP</p>
                        </div>
                        <p className="text-xl font-mono text-white">{simulationData.wip}</p>
                    </div>

                    {/* Lead Time */}
                    <div className="bg-slate-800/40 rounded-lg p-3 border border-slate-700">
                        <div className="flex items-center gap-2 mb-1">
                            <Clock size={14} className="text-cyan-500"/>
                            <p className="text-xs text-slate-400 uppercase font-semibold">Avg Lead Time</p>
                        </div>
                        <p className="text-xl font-mono text-white">{simulationData.averageLeadTime.toFixed(1)}<span className="text-sm text-slate-500">s</span></p>
                    </div>

                    {/* Completed */}
                    <div className="bg-slate-800/40 rounded-lg p-3 border border-slate-700">
                        <div className="flex items-center gap-2 mb-1">
                            <Target size={14} className="text-green-500"/>
                            <p className="text-xs text-slate-400 uppercase font-semibold">Completed</p>
                        </div>
                        <p className="text-xl font-mono text-white">{simulationData.completedCount}</p>
                    </div>

                    {/* Generated */}
                    <div className="bg-slate-800/40 rounded-lg p-3 border border-slate-700">
                        <div className="flex items-center gap-2 mb-1">
                            <Zap size={14} className="text-blue-500"/>
                            <p className="text-xs text-slate-400 uppercase font-semibold">Generated</p>
                        </div>
                        <p className="text-xl font-mono text-white">{simulationData.totalGenerated}</p>
                    </div>
                </div>

                {/* WIP Chart */}
                <div className="bg-slate-800/40 rounded-lg p-4 border border-slate-700">
                    <p className="text-xs text-slate-400 uppercase font-semibold mb-2">WIP Over Time</p>
                    <KPIChart data={simulationData.history} dataKey="wip" color="#f59e0b" label="WIP" />
                </div>
            </div>
        )}

        {/* PROPERTIES TAB */}
        {activeTab === 'properties' && (
          selectedNode ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
                <div className="p-2 bg-slate-800 rounded">
                  <Sliders size={20} className="text-slate-400" />
                </div>
                <div>
                   <h2 className="text-lg font-bold text-slate-100">{selectedNode.data.label}</h2>
                   <p className="text-xs text-slate-500 font-mono">{selectedNode.id}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="group">
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Label</label>
                  <input
                    type="text"
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2.5 text-slate-200 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                    value={selectedNode.data.label}
                    onChange={(e) => handleChange('label', e.target.value)}
                  />
                </div>

                {isProcess && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Cycle Time (sec)</label>
                      <input
                        type="number"
                        min="0"
                        className="w-full bg-slate-900 border border-slate-700 rounded p-2.5 text-slate-200 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                        value={selectedNode.data.cycleTime}
                        onChange={(e) => handleChange('cycleTime', Number(e.target.value))}
                      />
                    </div>

                    <div>
                       <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Capacity (Parallel Units)</label>
                       <input
                         type="number"
                         min="1"
                         className="w-full bg-slate-900 border border-slate-700 rounded p-2.5 text-slate-200 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                         value={selectedNode.data.capacity || 1}
                         onChange={(e) => handleChange('capacity', Number(e.target.value))}
                       />
                       <p className="text-[10px] text-slate-500 mt-1">Number of items processed simultaneously.</p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Defect Rate (%)</label>
                      <div className="relative">
                        <input
                            type="range"
                            min="0"
                            max="100"
                            step="0.1"
                            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                            value={selectedNode.data.defectRate}
                            onChange={(e) => handleChange('defectRate', Number(e.target.value))}
                        />
                        <div className="flex justify-between mt-1 text-xs text-slate-400 font-mono">
                            <span>0%</span>
                            <span className="text-blue-400 font-bold">{selectedNode.data.defectRate}%</span>
                            <span>100%</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {isInventory && (
                    <div>
                       <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Max Storage Capacity</label>
                       <input
                         type="number"
                         min="1"
                         className="w-full bg-slate-900 border border-slate-700 rounded p-2.5 text-slate-200 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                         value={selectedNode.data.capacity || 10}
                         onChange={(e) => handleChange('capacity', Number(e.target.value))}
                       />
                       <p className="text-[10px] text-slate-500 mt-1">Simulates blocking if full.</p>
                    </div>
                )}
                
                {selectedNode.data.type === NodeType.SOURCE && (
                   <div>
                       <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Arrival Interval (sec)</label>
                       <input
                         type="number"
                         min="1"
                         className="w-full bg-slate-900 border border-slate-700 rounded p-2.5 text-slate-200 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                         value={selectedNode.data.cycleTime}
                         onChange={(e) => handleChange('cycleTime', Number(e.target.value))}
                       />
                   </div>
                )}

                <div className="p-4 bg-slate-800/30 rounded border border-slate-700/50 mt-4">
                   <h3 className="text-xs font-bold text-slate-400 uppercase mb-3">Live Statistics</h3>
                   <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                         <span className="block text-[10px] text-slate-500">Total processed</span>
                         <span className="font-mono text-slate-200">{selectedNode.data.stats?.totalProcessed || 0}</span>
                      </div>
                      <div>
                         <span className="block text-[10px] text-slate-500">Avg Utilization</span>
                         <span className="font-mono text-slate-200">{(selectedNode.data.stats?.utilization || 0).toFixed(1)}%</span>
                      </div>
                      <div>
                         <span className="block text-[10px] text-slate-500">Blocked Time</span>
                         <span className="font-mono text-red-400">{(selectedNode.data.stats?.blockedTime || 0).toFixed(1)}s</span>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
              <Settings size={48} className="text-slate-600" strokeWidth={1} />
              <div>
                <p className="text-slate-400 font-medium">Select a Node</p>
                <p className="text-slate-600 text-sm mt-1">Click a station to edit properties.</p>
              </div>
            </div>
          )
        )}
        
        {activeTab === 'analysis' && (
           <div className="space-y-6">
                <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
                <div className="flex items-center gap-2 mb-2">
                    <Zap className="text-purple-500" size={18} />
                    <h3 className="font-bold text-slate-200">AI Optimization</h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    Use Gemini to analyze your production line layout, identify bottlenecks, and suggest Six Sigma improvements.
                </p>
                <button 
                    onClick={onAnalyze}
                    className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg font-semibold shadow-lg shadow-purple-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                    Analyze Flow
                    <Zap size={16} className="fill-white" />
                </button>
                </div>
           </div>
        )}
      </div>
    </div>
  );
};

export default RightSidebar;
