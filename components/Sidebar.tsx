import React, { useState } from 'react';
import { NodeType } from '../types';
import { Factory, Box, ClipboardCheck, ArrowRight, Play, Activity, Pause, RotateCcw, PanelLeftClose, PanelLeftOpen, Network, Download, FastForward, Timer } from 'lucide-react';

interface SidebarProps {
  simulationTime: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onReset: () => void;
  onLayout: () => void;
  throughput: number;
  wipItems: number;
  onExport: () => void;
  simulationSpeed: number;
  onSpeedChange: (speed: number) => void;
  warmupTime: number;
  onWarmupChange: (time: number) => void;
  isWarmedUp: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  simulationTime,
  isPlaying,
  onTogglePlay,
  onReset,
  onLayout,
  throughput,
  wipItems,
  onExport,
  simulationSpeed,
  onSpeedChange,
  warmupTime,
  onWarmupChange,
  isWarmedUp
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const onDragStart = (event: React.DragEvent, nodeType: NodeType, label: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.setData('application/reactflow-label', label);
    event.dataTransfer.effectAllowed = 'move';
  };

  const items = [
    { type: NodeType.SOURCE, label: 'Source', desc: 'Generates entities', icon: <Play size={20} className="fill-current" />, color: 'text-blue-400', border: 'border-blue-500/30 hover:border-blue-500' },
    { type: NodeType.PROCESS, label: 'Process', desc: 'Machine/Workstation', icon: <Factory size={20} />, color: 'text-emerald-400', border: 'border-emerald-500/30 hover:border-emerald-500' },
    { type: NodeType.INVENTORY, label: 'Buffer', desc: 'Limited capacity storage', icon: <Box size={20} />, color: 'text-amber-400', border: 'border-amber-500/30 hover:border-amber-500' },
    { type: NodeType.QUALITY, label: 'Inspection', desc: 'Quality Check point', icon: <ClipboardCheck size={20} />, color: 'text-purple-400', border: 'border-purple-500/30 hover:border-purple-500' },
    { type: NodeType.SHIPPING, label: 'Shipping', desc: 'Exit point', icon: <ArrowRight size={20} />, color: 'text-indigo-400', border: 'border-indigo-500/30 hover:border-indigo-500' },
  ];

  const formatTime = (seconds: number) => {
     const h = Math.floor(seconds / 3600);
     const m = Math.floor((seconds % 3600) / 60);
     const s = Math.floor(seconds % 60);
     return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div 
       className={`${isCollapsed ? 'w-20' : 'w-72'} bg-[#0f172a] border-r border-slate-800 flex flex-col h-full z-20 shadow-xl transition-all duration-300 ease-in-out`}
    >
      {/* Header */}
      <div className={`p-5 border-b border-slate-800 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} transition-all`}>
        <div className="flex items-center gap-3 overflow-hidden">
           <Activity className="text-blue-500 shrink-0" size={24} />
           {!isCollapsed && <h1 className="text-xl font-bold text-slate-100 whitespace-nowrap opacity-100 transition-opacity duration-300">LeanFlow</h1>}
        </div>
        {!isCollapsed && (
           <button onClick={() => setIsCollapsed(true)} className="text-slate-500 hover:text-slate-300">
              <PanelLeftClose size={18} />
           </button>
        )}
      </div>

      {isCollapsed && (
         <button onClick={() => setIsCollapsed(false)} className="mx-auto mt-2 p-2 text-slate-500 hover:text-slate-300">
            <PanelLeftOpen size={18} />
         </button>
      )}
      
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 custom-scrollbar flex flex-col gap-6">
        <div>
           {!isCollapsed && <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 whitespace-nowrap">Building Blocks</h2>}
           
           <div className="flex flex-col gap-3">
             {items.map((item) => (
               <div
                 key={item.type}
                 className={`group flex items-center gap-3 rounded-lg cursor-grab bg-slate-800/50 border transition-all duration-200 hover:bg-slate-800 hover:shadow-lg ${item.border}
                    ${isCollapsed ? 'justify-center p-3' : 'p-3'}
                 `}
                 onDragStart={(event) => onDragStart(event, item.type, item.label)}
                 draggable
                 title={isCollapsed ? item.label : undefined}
               >
                 <div className={`p-2 rounded bg-slate-900 shrink-0 ${item.color}`}>
                   {item.icon}
                 </div>
                 {!isCollapsed && (
                    <div className="min-w-0">
                      <span className="block text-sm font-semibold text-slate-200 group-hover:text-white truncate">{item.label}</span>
                      <span className="block text-[10px] text-slate-500 truncate">{item.desc}</span>
                    </div>
                 )}
               </div>
             ))}
           </div>
        </div>

        <div>
           {!isCollapsed && <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 whitespace-nowrap">Controls</h2>}
           <div className="flex flex-col gap-2">
             <div className={`flex ${isCollapsed ? 'flex-col' : 'flex-row'} gap-2`}>
                <button
                  onClick={onTogglePlay}
                  className={`rounded flex items-center justify-center gap-2 font-semibold transition-all
                    ${isPlaying
                      ? 'bg-red-600 hover:bg-red-700 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-[0_0_15px_rgba(5,150,105,0.4)]'
                    }
                    ${isCollapsed ? 'p-3 w-full aspect-square' : 'flex-1 py-3'}
                  `}
                  title={isPlaying ? "Pause" : "Start"}
                >
                   {isPlaying ? <Pause size={18} className="fill-current" /> : <Play size={18} className="fill-current" />}
                   {!isCollapsed && (isPlaying ? 'Pause' : 'Start')}
                </button>
                <button
                  onClick={onReset}
                  className={`bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 rounded border border-slate-700 transition-colors flex items-center justify-center
                     ${isCollapsed ? 'p-3 w-full aspect-square' : 'p-3'}
                  `}
                  title="Reset"
                >
                  <RotateCcw size={18} />
                </button>
             </div>

             {/* Simulation Speed Control */}
             {!isCollapsed && (
               <div className="mt-2">
                 <div className="flex items-center gap-2 mb-1.5">
                   <FastForward size={14} className="text-slate-500" />
                   <span className="text-xs text-slate-500 font-semibold uppercase">Speed</span>
                 </div>
                 <div className="flex gap-1">
                   {[1, 2, 5, 10].map(speed => (
                     <button
                       key={speed}
                       onClick={() => onSpeedChange(speed)}
                       className={`flex-1 py-1.5 text-xs font-bold rounded transition-all
                         ${simulationSpeed === speed
                           ? 'bg-blue-600 text-white shadow-[0_0_10px_rgba(59,130,246,0.4)]'
                           : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 border border-slate-700'
                         }
                       `}
                       title={`${speed}x simulation speed`}
                     >
                       {speed}x
                     </button>
                   ))}
                 </div>
               </div>
             )}

             {/* Warm-up Time Control */}
             {!isCollapsed && (
               <div className="mt-2">
                 <div className="flex items-center justify-between mb-1.5">
                   <div className="flex items-center gap-2">
                     <Timer size={14} className="text-slate-500" />
                     <span className="text-xs text-slate-500 font-semibold uppercase">Warm-up</span>
                   </div>
                   {isWarmedUp ? (
                     <span className="text-[10px] text-emerald-400 font-semibold">READY</span>
                   ) : warmupTime > 0 ? (
                     <span className="text-[10px] text-amber-400 font-semibold animate-pulse">WARMING</span>
                   ) : null}
                 </div>
                 <div className="flex gap-1">
                   {[0, 30, 60, 120].map(time => (
                     <button
                       key={time}
                       onClick={() => onWarmupChange(time)}
                       disabled={isPlaying}
                       className={`flex-1 py-1.5 text-xs font-bold rounded transition-all
                         ${warmupTime === time
                           ? 'bg-amber-600 text-white shadow-[0_0_10px_rgba(245,158,11,0.4)]'
                           : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 border border-slate-700'
                         }
                         ${isPlaying ? 'opacity-50 cursor-not-allowed' : ''}
                       `}
                       title={time === 0 ? 'No warm-up' : `${time}s warm-up period`}
                     >
                       {time === 0 ? 'Off' : `${time}s`}
                     </button>
                   ))}
                 </div>
                 <p className="text-[10px] text-slate-600 mt-1">Stats reset after warm-up</p>
               </div>
             )}
             
             <button 
                onClick={onLayout}
                className={`bg-slate-800 text-blue-400 hover:text-white hover:bg-slate-700 hover:border-blue-500/50 rounded border border-slate-700 transition-all flex items-center justify-center gap-2
                   ${isCollapsed ? 'p-3 w-full aspect-square' : 'py-2 px-3'}
                `}
                title="Auto Layout"
             >
                <Network size={18} />
                {!isCollapsed && <span className="text-sm font-medium">Auto Layout</span>}
             </button>
             
             <button 
                onClick={onExport}
                className={`bg-slate-800 text-slate-400 hover:text-emerald-400 hover:bg-slate-700 hover:border-emerald-500/50 rounded border border-slate-700 transition-all flex items-center justify-center gap-2
                   ${isCollapsed ? 'p-3 w-full aspect-square' : 'py-2 px-3'}
                `}
                title="Export Data"
             >
                <Download size={18} />
                {!isCollapsed && <span className="text-sm font-medium">Export CSV</span>}
             </button>
           </div>
           
           {!isCollapsed && (
             <div className="mt-3 text-center text-xs text-slate-500 font-mono bg-slate-900 rounded py-1">
                {formatTime(simulationTime)}
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
