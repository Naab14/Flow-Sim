import React, { useState } from 'react';
import { AppNode, NodeType, GlobalStats, HistoryPoint, ShiftPattern, BreakPeriod } from '../types';
import { Zap, Settings, BarChart3, PanelRightClose, PanelRightOpen, Sliders, Activity, Clock, Layers, Target, AlertTriangle, TrendingUp, Gauge, Timer, Coffee, Plus, Trash2 } from 'lucide-react';
import KPIChart from './KPIChart';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

interface RightSidebarProps {
  selectedNode: AppNode | null;
  onChange: (id: string, data: any) => void;
  onAnalyze: () => void;
  simulationData: GlobalStats & { history: HistoryPoint[] };
  nodes: AppNode[];
  simulationTime?: number;
  warmupTime?: number;
  isWarmedUp?: boolean;
}

const RightSidebar: React.FC<RightSidebarProps> = ({
  selectedNode,
  onChange,
  onAnalyze,
  simulationData,
  nodes,
  simulationTime = 0,
  warmupTime = 0,
  isWarmedUp = true
}) => {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const isLight = !isDark;
  const [activeTab, setActiveTab] = useState<'dashboard' | 'properties' | 'analysis'>('dashboard');
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Calculate warm-up progress
  const warmupProgress = warmupTime > 0 ? Math.min((simulationTime / warmupTime) * 100, 100) : 100;

  // Find bottleneck node name
  const bottleneckNode = nodes.find(n => n.id === simulationData.bottleneckNodeId);

  // Switch to properties tab automatically when a node is selected
  React.useEffect(() => {
    if (selectedNode) setActiveTab('properties');
    else if (activeTab === 'properties') setActiveTab('dashboard');
  }, [selectedNode]);

  const handleChange = (field: string, value: string | number | ShiftPattern) => {
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
        <div className={`w-14 flex flex-col items-center py-4 gap-4 z-20 transition-colors duration-300 ${
          isLight ? 'bg-white border-l border-slate-200' : 'bg-[#0f172a] border-l border-slate-800'
        }`}>
           <button onClick={() => setIsCollapsed(false)} className={`p-2 rounded transition-colors ${
             isLight ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-slate-800'
           }`}>
              <PanelRightOpen size={20} />
           </button>
           <div className={`h-px w-6 ${isLight ? 'bg-slate-200' : 'bg-slate-800'}`}></div>
           <button onClick={() => { setIsCollapsed(false); setActiveTab('dashboard'); }} className="text-emerald-500 p-2"><BarChart3 size={20}/></button>
           <button onClick={() => { setIsCollapsed(false); setActiveTab('properties'); }} className="text-blue-500 p-2"><Settings size={20}/></button>
        </div>
     );
  }

  return (
    <div
      className="w-96 flex flex-col h-full z-20 shadow-xl transition-all duration-300 theme-transition"
      style={{
        backgroundColor: 'var(--bg-secondary)',
        borderLeft: '1px solid var(--border-primary)'
      }}
    >
      {/* Tabs */}
      <div className={`flex items-center ${
        isLight ? 'border-b border-slate-200 bg-slate-50' : 'border-b border-slate-800 bg-slate-900/50'
      }`}>
         <button onClick={() => setIsCollapsed(true)} className={`p-3 transition-colors ${
           isLight
             ? 'text-slate-400 hover:text-slate-600 border-r border-slate-200 hover:bg-slate-100'
             : 'text-slate-500 hover:text-slate-300 border-r border-slate-800 hover:bg-slate-900'
         }`}>
            <PanelRightClose size={18} />
         </button>
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors relative
            ${activeTab === 'dashboard'
              ? `text-emerald-500 ${isLight ? 'bg-white' : 'bg-slate-800/50'}`
              : `${isLight ? 'text-slate-400 hover:text-slate-600' : 'text-slate-500 hover:text-slate-300'}`}
          `}
        >
          {t('dashboard.kpis')}
          {activeTab === 'dashboard' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500"></div>}
        </button>
        <button
          onClick={() => setActiveTab('properties')}
          className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors relative
            ${activeTab === 'properties'
              ? `text-blue-500 ${isLight ? 'bg-white' : 'bg-slate-800/50'}`
              : `${isLight ? 'text-slate-400 hover:text-slate-600' : 'text-slate-500 hover:text-slate-300'}`}
          `}
        >
          {t('dashboard.properties')}
          {activeTab === 'properties' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"></div>}
        </button>
        <button
          onClick={() => setActiveTab('analysis')}
          className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors relative
            ${activeTab === 'analysis'
              ? `text-purple-500 ${isLight ? 'bg-white' : 'bg-slate-800/50'}`
              : `${isLight ? 'text-slate-400 hover:text-slate-600' : 'text-slate-500 hover:text-slate-300'}`}
          `}
        >
          {t('dashboard.analysis')}
          {activeTab === 'analysis' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500"></div>}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        
        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
            <div className="space-y-4 animate-in fade-in duration-300">
                <div className="flex items-center justify-between">
                    <h2 className={`text-lg font-bold flex items-center gap-2 ${isLight ? 'text-slate-800' : 'text-slate-100'}`}>
                        <Activity className="text-emerald-500" /> {t('dashboard.title')}
                    </h2>
                    <span className={`text-xs font-mono animate-pulse ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>● {t('dashboard.live')}</span>
                </div>

                {/* Warm-up Progress Indicator */}
                {warmupTime > 0 && !isWarmedUp && (
                  <div className={`rounded-lg p-3 ${isLight ? 'bg-amber-50 border border-amber-200' : 'bg-amber-900/30 border border-amber-700/50'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Timer className="text-amber-500 animate-pulse" size={16} />
                      <span className={`text-xs font-bold ${isLight ? 'text-amber-700' : 'text-amber-300'}`}>{t('warmup.inProgress')}</span>
                      <span className={`text-xs ml-auto ${isLight ? 'text-amber-600' : 'text-amber-400/70'}`}>
                        {Math.max(0, warmupTime - simulationTime).toFixed(0)}s {t('warmup.remaining')}
                      </span>
                    </div>
                    <div className={`w-full rounded-full h-1.5 ${isLight ? 'bg-amber-100' : 'bg-slate-800'}`}>
                      <div
                        className="bg-amber-500 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${warmupProgress}%` }}
                      />
                    </div>
                    <p className={`text-[10px] mt-1 ${isLight ? 'text-amber-600/70' : 'text-amber-500/60'}`}>{t('warmup.statsReset')}</p>
                  </div>
                )}

                {/* Warm-up Complete Notification (shows briefly) */}
                {warmupTime > 0 && isWarmedUp && simulationTime < warmupTime + 10 && (
                  <div className={`rounded-lg p-3 flex items-center gap-2 ${isLight ? 'bg-emerald-50 border border-emerald-200' : 'bg-emerald-900/30 border border-emerald-700/50'}`}>
                    <Timer className="text-emerald-500" size={16} />
                    <span className={`text-xs font-bold ${isLight ? 'text-emerald-700' : 'text-emerald-300'}`}>{t('warmup.complete')}</span>
                  </div>
                )}

                {/* Bottleneck Alert */}
                {bottleneckNode && simulationData.bottleneckUtilization > 80 && (
                  <div className={`rounded-lg p-3 flex items-center gap-3 ${isLight ? 'bg-red-50 border border-red-200' : 'bg-red-900/30 border border-red-700/50'}`}>
                    <AlertTriangle className="text-red-500 shrink-0" size={20} />
                    <div>
                      <p className={`text-xs font-bold ${isLight ? 'text-red-700' : 'text-red-300'}`}>{t('dashboard.bottleneckDetected')}</p>
                      <p className={`text-xs ${isLight ? 'text-red-600' : 'text-red-400/80'}`}>{bottleneckNode.data.label} - {simulationData.bottleneckUtilization}% {t('dashboard.utilization')}</p>
                    </div>
                  </div>
                )}

                {/* OEE Card */}
                <div className={`rounded-lg p-4 ${
                  isLight
                    ? 'bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200'
                    : 'bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-slate-700'
                }`}>
                    <div className="flex justify-between items-start mb-3">
                        <div>
                            <p className={`text-xs uppercase font-semibold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{t('dashboard.oee')}</p>
                            <p className={`text-3xl font-mono ${isLight ? 'text-slate-800' : 'text-white'}`}>{simulationData.oee.toFixed(1)}<span className={`text-lg ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>%</span></p>
                        </div>
                        <Gauge size={24} className="text-blue-500"/>
                    </div>
                    {/* OEE Breakdown */}
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className={`p-2 rounded ${isLight ? 'bg-slate-100' : 'bg-slate-800/50'}`}>
                        <span className={`block ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>{t('dashboard.availability')}</span>
                        <span className="font-mono text-emerald-500">{simulationData.availability.toFixed(1)}%</span>
                      </div>
                      <div className={`p-2 rounded ${isLight ? 'bg-slate-100' : 'bg-slate-800/50'}`}>
                        <span className={`block ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>{t('dashboard.performance')}</span>
                        <span className="font-mono text-blue-500">{simulationData.performance.toFixed(1)}%</span>
                      </div>
                      <div className={`p-2 rounded ${isLight ? 'bg-slate-100' : 'bg-slate-800/50'}`}>
                        <span className={`block ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>{t('dashboard.quality')}</span>
                        <span className="font-mono text-purple-500">{simulationData.quality.toFixed(1)}%</span>
                      </div>
                    </div>
                    {/* OEE Chart */}
                    <div className="mt-3">
                      <KPIChart data={simulationData.history} dataKey="oee" color="#3b82f6" label="OEE %" />
                    </div>
                </div>

                {/* Throughput Card */}
                <div className={`rounded-lg p-4 ${isLight ? 'bg-slate-50 border border-slate-200' : 'bg-slate-800/40 border border-slate-700'}`}>
                    <div className="flex justify-between items-end mb-2">
                        <div>
                            <p className={`text-xs uppercase font-semibold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{t('dashboard.throughput')}</p>
                            <p className={`text-2xl font-mono ${isLight ? 'text-slate-800' : 'text-white'}`}>{simulationData.throughput.toFixed(0)} <span className={`text-sm ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>{t('dashboard.throughputUnit')}</span></p>
                            <p className={`text-xs ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>{simulationData.throughputPerMinute} units/min</p>
                        </div>
                        <TrendingUp size={20} className="text-emerald-500 mb-2"/>
                    </div>
                    <KPIChart data={simulationData.history} dataKey="throughput" color="#10b981" label={t('dashboard.throughput')} />
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                    {/* WIP */}
                    <div className={`rounded-lg p-3 ${isLight ? 'bg-slate-50 border border-slate-200' : 'bg-slate-800/40 border border-slate-700'}`}>
                        <div className="flex items-center gap-2 mb-1">
                            <Layers size={14} className="text-amber-500"/>
                            <p className={`text-xs uppercase font-semibold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{t('dashboard.wip')}</p>
                        </div>
                        <p className={`text-xl font-mono ${isLight ? 'text-slate-800' : 'text-white'}`}>{simulationData.wip}</p>
                    </div>

                    {/* Lead Time */}
                    <div className={`rounded-lg p-3 ${isLight ? 'bg-slate-50 border border-slate-200' : 'bg-slate-800/40 border border-slate-700'}`}>
                        <div className="flex items-center gap-2 mb-1">
                            <Clock size={14} className="text-cyan-500"/>
                            <p className={`text-xs uppercase font-semibold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{t('dashboard.leadTime')}</p>
                        </div>
                        <p className={`text-xl font-mono ${isLight ? 'text-slate-800' : 'text-white'}`}>{simulationData.averageLeadTime.toFixed(1)}<span className={`text-sm ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>s</span></p>
                    </div>

                    {/* Completed */}
                    <div className={`rounded-lg p-3 ${isLight ? 'bg-slate-50 border border-slate-200' : 'bg-slate-800/40 border border-slate-700'}`}>
                        <div className="flex items-center gap-2 mb-1">
                            <Target size={14} className="text-green-500"/>
                            <p className={`text-xs uppercase font-semibold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{t('dashboard.completed')}</p>
                        </div>
                        <p className={`text-xl font-mono ${isLight ? 'text-slate-800' : 'text-white'}`}>{simulationData.completedCount}</p>
                    </div>

                    {/* Generated */}
                    <div className={`rounded-lg p-3 ${isLight ? 'bg-slate-50 border border-slate-200' : 'bg-slate-800/40 border border-slate-700'}`}>
                        <div className="flex items-center gap-2 mb-1">
                            <Zap size={14} className="text-blue-500"/>
                            <p className={`text-xs uppercase font-semibold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{t('dashboard.generated')}</p>
                        </div>
                        <p className={`text-xl font-mono ${isLight ? 'text-slate-800' : 'text-white'}`}>{simulationData.totalGenerated}</p>
                    </div>
                </div>

                {/* WIP Chart */}
                <div className={`rounded-lg p-4 ${isLight ? 'bg-slate-50 border border-slate-200' : 'bg-slate-800/40 border border-slate-700'}`}>
                    <p className={`text-xs uppercase font-semibold mb-2 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{t('dashboard.wipOverTime')}</p>
                    <KPIChart data={simulationData.history} dataKey="wip" color="#f59e0b" label={t('dashboard.wip')} />
                </div>
            </div>
        )}

        {/* PROPERTIES TAB */}
        {activeTab === 'properties' && (
          selectedNode ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className={`flex items-center gap-3 pb-4 border-b ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
                <div className={`p-2 rounded ${isLight ? 'bg-slate-100' : 'bg-slate-800'}`}>
                  <Sliders size={20} className={isLight ? 'text-slate-500' : 'text-slate-400'} />
                </div>
                <div>
                   <h2 className={`text-lg font-bold ${isLight ? 'text-slate-800' : 'text-slate-100'}`}>{selectedNode.data.label}</h2>
                   <p className={`text-xs font-mono ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>{selectedNode.id}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="group">
                  <label className={`block text-xs font-semibold mb-1.5 uppercase ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>Label</label>
                  <input
                    type="text"
                    className={`w-full rounded p-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all ${
                      isLight
                        ? 'bg-white border border-slate-300 text-slate-800'
                        : 'bg-slate-900 border border-slate-700 text-slate-200'
                    }`}
                    value={selectedNode.data.label}
                    onChange={(e) => handleChange('label', e.target.value)}
                  />
                </div>

                {isProcess && (
                  <>
                    <div>
                      <label className={`block text-xs font-semibold mb-1.5 uppercase ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>Cycle Time (sec)</label>
                      <input
                        type="number"
                        min="0"
                        className={`w-full rounded p-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all ${
                          isLight
                            ? 'bg-white border border-slate-300 text-slate-800'
                            : 'bg-slate-900 border border-slate-700 text-slate-200'
                        }`}
                        value={selectedNode.data.cycleTime}
                        onChange={(e) => handleChange('cycleTime', Number(e.target.value))}
                      />
                    </div>

                    <div>
                      <label className={`block text-xs font-semibold mb-1.5 uppercase ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>Cycle Time Variation (%)</label>
                      <div className="relative">
                        <input
                            type="range"
                            min="0"
                            max="50"
                            step="1"
                            className={`w-full h-2 rounded-lg appearance-none cursor-pointer accent-cyan-500 ${isLight ? 'bg-slate-200' : 'bg-slate-800'}`}
                            value={selectedNode.data.cycleTimeVariation || 0}
                            onChange={(e) => handleChange('cycleTimeVariation', Number(e.target.value))}
                        />
                        <div className={`flex justify-between mt-1 text-xs font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                            <span>0%</span>
                            <span className="text-cyan-500 font-bold">±{selectedNode.data.cycleTimeVariation || 0}%</span>
                            <span>50%</span>
                        </div>
                      </div>
                      <p className={`text-[10px] mt-1 ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                        Random variation: {(selectedNode.data.cycleTime * (1 - (selectedNode.data.cycleTimeVariation || 0)/100)).toFixed(1)}s - {(selectedNode.data.cycleTime * (1 + (selectedNode.data.cycleTimeVariation || 0)/100)).toFixed(1)}s
                      </p>
                    </div>

                    <div>
                       <label className={`block text-xs font-semibold mb-1.5 uppercase ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>Capacity (Parallel Units)</label>
                       <input
                         type="number"
                         min="1"
                         className={`w-full rounded p-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all ${
                           isLight
                             ? 'bg-white border border-slate-300 text-slate-800'
                             : 'bg-slate-900 border border-slate-700 text-slate-200'
                         }`}
                         value={selectedNode.data.capacity || 1}
                         onChange={(e) => handleChange('capacity', Number(e.target.value))}
                       />
                       <p className={`text-[10px] mt-1 ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>Number of items processed simultaneously.</p>
                    </div>

                    <div>
                      <label className={`block text-xs font-semibold mb-1.5 uppercase ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>Defect Rate (%)</label>
                      <div className="relative">
                        <input
                            type="range"
                            min="0"
                            max="100"
                            step="0.1"
                            className={`w-full h-2 rounded-lg appearance-none cursor-pointer accent-blue-500 ${isLight ? 'bg-slate-200' : 'bg-slate-800'}`}
                            value={selectedNode.data.defectRate}
                            onChange={(e) => handleChange('defectRate', Number(e.target.value))}
                        />
                        <div className={`flex justify-between mt-1 text-xs font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                            <span>0%</span>
                            <span className="text-blue-500 font-bold">{selectedNode.data.defectRate}%</span>
                            <span>100%</span>
                        </div>
                      </div>
                    </div>

                    {/* Shift Pattern Section */}
                    <div className={`p-3 rounded-lg ${isLight ? 'bg-purple-50 border border-purple-200' : 'bg-purple-900/20 border border-purple-800/30'}`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Coffee size={14} className="text-purple-500" />
                          <label className={`text-xs font-semibold uppercase ${isLight ? 'text-purple-700' : 'text-purple-300'}`}>Shift Pattern</label>
                        </div>
                        <button
                          onClick={() => {
                            const currentPattern = selectedNode.data.shiftPattern || { enabled: false, shiftDurationHours: 8, breaks: [] };
                            handleChange('shiftPattern', { ...currentPattern, enabled: !currentPattern.enabled });
                          }}
                          className={`relative w-10 h-5 rounded-full transition-colors ${
                            selectedNode.data.shiftPattern?.enabled
                              ? 'bg-purple-500'
                              : isLight ? 'bg-slate-300' : 'bg-slate-700'
                          }`}
                        >
                          <div
                            className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                              selectedNode.data.shiftPattern?.enabled ? 'translate-x-5' : 'translate-x-0.5'
                            }`}
                          />
                        </button>
                      </div>

                      {selectedNode.data.shiftPattern?.enabled && (
                        <div className="space-y-3">
                          <div>
                            <label className={`block text-[10px] mb-1 ${isLight ? 'text-purple-600' : 'text-purple-400'}`}>Shift Duration (hours)</label>
                            <input
                              type="number"
                              min="1"
                              max="24"
                              className={`w-full rounded p-2 text-sm ${
                                isLight
                                  ? 'bg-white border border-purple-200 text-slate-800'
                                  : 'bg-slate-900 border border-purple-700/50 text-slate-200'
                              }`}
                              value={selectedNode.data.shiftPattern?.shiftDurationHours || 8}
                              onChange={(e) => {
                                const currentPattern = selectedNode.data.shiftPattern || { enabled: true, shiftDurationHours: 8, breaks: [] };
                                handleChange('shiftPattern', { ...currentPattern, shiftDurationHours: Number(e.target.value) });
                              }}
                            />
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <label className={`text-[10px] ${isLight ? 'text-purple-600' : 'text-purple-400'}`}>Scheduled Breaks</label>
                              <button
                                onClick={() => {
                                  const currentPattern = selectedNode.data.shiftPattern || { enabled: true, shiftDurationHours: 8, breaks: [] };
                                  const newBreak: BreakPeriod = { startMinute: 120, durationMinutes: 30, name: 'Break' };
                                  handleChange('shiftPattern', { ...currentPattern, breaks: [...currentPattern.breaks, newBreak] });
                                }}
                                className={`p-1 rounded transition-colors ${
                                  isLight ? 'hover:bg-purple-100 text-purple-600' : 'hover:bg-purple-800/30 text-purple-400'
                                }`}
                              >
                                <Plus size={14} />
                              </button>
                            </div>

                            {(selectedNode.data.shiftPattern?.breaks || []).length === 0 && (
                              <p className={`text-[10px] text-center py-2 ${isLight ? 'text-purple-400' : 'text-purple-500'}`}>
                                No breaks configured
                              </p>
                            )}

                            {(selectedNode.data.shiftPattern?.breaks || []).map((breakItem: BreakPeriod, index: number) => (
                              <div key={index} className={`flex gap-2 items-center mb-2 p-2 rounded ${isLight ? 'bg-white' : 'bg-slate-800/50'}`}>
                                <input
                                  type="text"
                                  placeholder="Name"
                                  className={`w-20 text-[10px] p-1 rounded ${
                                    isLight ? 'bg-slate-50 border border-slate-200' : 'bg-slate-900 border border-slate-700'
                                  }`}
                                  value={breakItem.name}
                                  onChange={(e) => {
                                    const currentPattern = selectedNode.data.shiftPattern!;
                                    const newBreaks = [...currentPattern.breaks];
                                    newBreaks[index] = { ...newBreaks[index], name: e.target.value };
                                    handleChange('shiftPattern', { ...currentPattern, breaks: newBreaks });
                                  }}
                                />
                                <div className="flex-1 flex items-center gap-1">
                                  <input
                                    type="number"
                                    min="0"
                                    className={`w-12 text-[10px] p-1 rounded text-center ${
                                      isLight ? 'bg-slate-50 border border-slate-200' : 'bg-slate-900 border border-slate-700'
                                    }`}
                                    value={breakItem.startMinute}
                                    onChange={(e) => {
                                      const currentPattern = selectedNode.data.shiftPattern!;
                                      const newBreaks = [...currentPattern.breaks];
                                      newBreaks[index] = { ...newBreaks[index], startMinute: Number(e.target.value) };
                                      handleChange('shiftPattern', { ...currentPattern, breaks: newBreaks });
                                    }}
                                  />
                                  <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>min</span>
                                  <span className={`text-[10px] ${isLight ? 'text-slate-400' : 'text-slate-600'}`}>for</span>
                                  <input
                                    type="number"
                                    min="1"
                                    className={`w-10 text-[10px] p-1 rounded text-center ${
                                      isLight ? 'bg-slate-50 border border-slate-200' : 'bg-slate-900 border border-slate-700'
                                    }`}
                                    value={breakItem.durationMinutes}
                                    onChange={(e) => {
                                      const currentPattern = selectedNode.data.shiftPattern!;
                                      const newBreaks = [...currentPattern.breaks];
                                      newBreaks[index] = { ...newBreaks[index], durationMinutes: Number(e.target.value) };
                                      handleChange('shiftPattern', { ...currentPattern, breaks: newBreaks });
                                    }}
                                  />
                                  <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>min</span>
                                </div>
                                <button
                                  onClick={() => {
                                    const currentPattern = selectedNode.data.shiftPattern!;
                                    const newBreaks = currentPattern.breaks.filter((_: BreakPeriod, i: number) => i !== index);
                                    handleChange('shiftPattern', { ...currentPattern, breaks: newBreaks });
                                  }}
                                  className={`p-1 rounded transition-colors ${
                                    isLight ? 'hover:bg-red-100 text-red-400' : 'hover:bg-red-900/30 text-red-400'
                                  }`}
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            ))}
                          </div>

                          <p className={`text-[10px] ${isLight ? 'text-purple-500' : 'text-purple-500/70'}`}>
                            Machine pauses during scheduled breaks. Shift repeats cyclically.
                          </p>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {isInventory && (
                    <div>
                       <label className={`block text-xs font-semibold mb-1.5 uppercase ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>Max Storage Capacity</label>
                       <input
                         type="number"
                         min="1"
                         className={`w-full rounded p-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all ${
                           isLight
                             ? 'bg-white border border-slate-300 text-slate-800'
                             : 'bg-slate-900 border border-slate-700 text-slate-200'
                         }`}
                         value={selectedNode.data.capacity || 10}
                         onChange={(e) => handleChange('capacity', Number(e.target.value))}
                       />
                       <p className={`text-[10px] mt-1 ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>Simulates blocking if full.</p>
                    </div>
                )}

                {selectedNode.data.type === NodeType.SOURCE && (
                   <div>
                       <label className={`block text-xs font-semibold mb-1.5 uppercase ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>Arrival Interval (sec)</label>
                       <input
                         type="number"
                         min="1"
                         className={`w-full rounded p-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all ${
                           isLight
                             ? 'bg-white border border-slate-300 text-slate-800'
                             : 'bg-slate-900 border border-slate-700 text-slate-200'
                         }`}
                         value={selectedNode.data.cycleTime}
                         onChange={(e) => handleChange('cycleTime', Number(e.target.value))}
                       />
                   </div>
                )}

                <div className={`p-4 rounded mt-4 ${isLight ? 'bg-slate-50 border border-slate-200' : 'bg-slate-800/30 border border-slate-700/50'}`}>
                   <h3 className={`text-xs font-bold uppercase mb-3 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Live Statistics</h3>
                   <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                         <span className={`block text-[10px] ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>Total processed</span>
                         <span className={`font-mono ${isLight ? 'text-slate-700' : 'text-slate-200'}`}>{selectedNode.data.stats?.totalProcessed || 0}</span>
                      </div>
                      <div>
                         <span className={`block text-[10px] ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>Avg Utilization</span>
                         <span className={`font-mono ${isLight ? 'text-slate-700' : 'text-slate-200'}`}>{(selectedNode.data.stats?.utilization || 0).toFixed(1)}%</span>
                      </div>
                      <div>
                         <span className={`block text-[10px] ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>Blocked Time</span>
                         <span className="font-mono text-red-500">{(selectedNode.data.stats?.blockedTime || 0).toFixed(1)}s</span>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
              <Settings size={48} className={isLight ? 'text-slate-300' : 'text-slate-600'} strokeWidth={1} />
              <div>
                <p className={isLight ? 'text-slate-500 font-medium' : 'text-slate-400 font-medium'}>{t('properties.selectNode')}</p>
                <p className={`text-sm mt-1 ${isLight ? 'text-slate-400' : 'text-slate-600'}`}>{t('properties.clickToEdit')}</p>
              </div>
            </div>
          )
        )}
        
        {activeTab === 'analysis' && (
           <div className="space-y-6">
                <div className={`p-4 rounded-lg ${isLight ? 'bg-slate-50 border border-slate-200' : 'bg-slate-800/30 border border-slate-700/50'}`}>
                <div className="flex items-center gap-2 mb-2">
                    <Zap className="text-purple-500" size={18} />
                    <h3 className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-200'}`}>{t('analysis.title')}</h3>
                </div>
                <p className={`text-xs leading-relaxed mb-4 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    {t('analysis.description')}
                </p>
                <button
                    onClick={onAnalyze}
                    className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg font-semibold shadow-lg shadow-purple-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                    {t('analysis.analyzeFlow')}
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
