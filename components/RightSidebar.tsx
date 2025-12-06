import React, { useState } from 'react';
import { AppNode, NodeType } from '../types';
import { Zap, Settings, BarChart3, AlertCircle } from 'lucide-react';

interface RightSidebarProps {
  selectedNode: AppNode | null;
  onChange: (id: string, data: any) => void;
  onAnalyze: () => void;
}

const RightSidebar: React.FC<RightSidebarProps> = ({ selectedNode, onChange, onAnalyze }) => {
  const [activeTab, setActiveTab] = useState<'properties' | 'analysis'>('properties');

  const handleChange = (field: string, value: string | number) => {
    if (!selectedNode) return;
    onChange(selectedNode.id, {
      ...selectedNode.data,
      [field]: value,
    });
  };

  const isProcess = selectedNode?.data.type === NodeType.PROCESS || selectedNode?.data.type === NodeType.QUALITY;

  return (
    <div className="w-80 bg-[#0f172a] border-l border-slate-800 flex flex-col h-full z-20 shadow-xl">
      {/* Tabs */}
      <div className="flex border-b border-slate-800">
        <button
          onClick={() => setActiveTab('properties')}
          className={`flex-1 py-3 text-sm font-medium transition-colors relative
            ${activeTab === 'properties' ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'}
          `}
        >
          Properties
          {activeTab === 'properties' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>}
        </button>
        <button
          onClick={() => setActiveTab('analysis')}
          className={`flex-1 py-3 text-sm font-medium transition-colors relative
            ${activeTab === 'analysis' ? 'text-purple-400' : 'text-slate-500 hover:text-slate-300'}
          `}
        >
          Analysis
          {activeTab === 'analysis' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]"></div>}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        {activeTab === 'properties' ? (
          selectedNode ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
                <div className="p-2 bg-slate-800 rounded">
                  <Settings size={20} className="text-slate-400" />
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

                <div>
                   <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Batch Size</label>
                   <input
                     type="number"
                     min="1"
                     className="w-full bg-slate-900 border border-slate-700 rounded p-2.5 text-slate-200 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                     value={selectedNode.data.batchSize}
                     onChange={(e) => handleChange('batchSize', Number(e.target.value))}
                   />
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
              <Zap size={48} className="text-slate-600" strokeWidth={1} />
              <div>
                <p className="text-slate-400 font-medium">No Selection</p>
                <p className="text-slate-600 text-sm mt-1">Select a workstation to edit properties.</p>
              </div>
            </div>
          )
        ) : (
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

             <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700/50 opacity-60 pointer-events-none">
                 <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="text-emerald-500" size={18} />
                    <h3 className="font-bold text-slate-200">Live Metrics</h3>
                 </div>
                 <p className="text-xs text-slate-400">Run simulation to gather real-time data.</p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RightSidebar;