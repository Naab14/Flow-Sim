import React from 'react';
import { NodeType } from '../types';
import { Factory, Box, ClipboardCheck, ArrowRight, Play, Activity, Pause, RotateCcw } from 'lucide-react';

interface SidebarProps {
  simulationTime: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onReset: () => void;
  throughput: number;
  wipItems: number;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  simulationTime, 
  isPlaying, 
  onTogglePlay, 
  onReset,
  throughput,
  wipItems
}) => {
  const onDragStart = (event: React.DragEvent, nodeType: NodeType, label: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.setData('application/reactflow-label', label);
    event.dataTransfer.effectAllowed = 'move';
  };

  const items = [
    { type: NodeType.SOURCE, label: 'Source', desc: 'Raw material input', icon: <Play size={20} className="fill-current" />, color: 'text-blue-400', border: 'border-blue-500/30 hover:border-blue-500' },
    { type: NodeType.PROCESS, label: 'Process', desc: 'Value-add step', icon: <Factory size={20} />, color: 'text-emerald-400', border: 'border-emerald-500/30 hover:border-emerald-500' },
    { type: NodeType.INVENTORY, label: 'Buffer', desc: 'Inventory storage', icon: <Box size={20} />, color: 'text-amber-400', border: 'border-amber-500/30 hover:border-amber-500' },
    { type: NodeType.QUALITY, label: 'Quality', desc: 'Inspection step', icon: <ClipboardCheck size={20} />, color: 'text-purple-400', border: 'border-purple-500/30 hover:border-purple-500' },
    { type: NodeType.SHIPPING, label: 'Customer', desc: 'Final output', icon: <ArrowRight size={20} />, color: 'text-indigo-400', border: 'border-indigo-500/30 hover:border-indigo-500' },
  ];

  return (
    <div className="w-72 bg-[#0f172a] border-r border-slate-800 flex flex-col h-full z-20 shadow-xl">
      {/* Header */}
      <div className="p-5 border-b border-slate-800 flex items-center gap-3">
        <Activity className="text-blue-500" size={24} />
        <h1 className="text-xl font-bold text-slate-100">LeanFlow Sim</h1>
      </div>
      
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Building Blocks</h2>
        <p className="text-xs text-slate-500 mb-4">Drag blocks to canvas</p>
        
        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <div
              key={item.type}
              className={`group flex items-center gap-3 p-3 rounded-lg cursor-grab bg-slate-800/50 border transition-all duration-200 hover:bg-slate-800 hover:shadow-lg ${item.border}`}
              onDragStart={(event) => onDragStart(event, item.type, item.label)}
              draggable
            >
              <div className={`p-2 rounded bg-slate-900 ${item.color}`}>
                {item.icon}
              </div>
              <div>
                <span className="block text-sm font-semibold text-slate-200 group-hover:text-white">{item.label}</span>
                <span className="block text-[10px] text-slate-500">{item.desc}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8">
           <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Simulation Control</h2>
           <div className="flex gap-2 mb-3">
              <button 
                onClick={onTogglePlay}
                className={`flex-1 py-3 rounded flex items-center justify-center gap-2 font-semibold transition-all
                  ${isPlaying 
                    ? 'bg-red-600 hover:bg-red-700 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]' 
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-[0_0_15px_rgba(5,150,105,0.4)]'
                  }`}
              >
                 {isPlaying ? <Pause size={18} className="fill-current" /> : <Play size={18} className="fill-current" />}
                 {isPlaying ? 'Pause' : 'Start'}
              </button>
              <button 
                onClick={onReset}
                className="p-3 bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 rounded border border-slate-700 transition-colors"
              >
                <RotateCcw size={18} />
              </button>
           </div>
           
           <div className="text-center text-xs text-slate-500 font-mono">
              Time: {simulationTime}s | Speed: 1x
           </div>
        </div>
      </div>

      {/* Footer Stats */}
      <div className="p-5 bg-slate-900 border-t border-slate-800">
         <div className="flex justify-between items-center text-sm mb-2">
            <span className="text-slate-400">Throughput:</span>
            <span className="text-emerald-400 font-mono">{throughput.toFixed(1)} /min</span>
         </div>
         <div className="flex justify-between items-center text-sm">
            <span className="text-slate-400">WIP Items:</span>
            <span className="text-amber-400 font-mono">{wipItems}</span>
         </div>
      </div>
    </div>
  );
};

export default Sidebar;