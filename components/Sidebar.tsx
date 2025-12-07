import React, { useState, useRef } from 'react';
import { NodeType } from '../types';
import { Factory, Box, ClipboardCheck, ArrowRight, Play, Activity, Pause, RotateCcw, PanelLeftClose, PanelLeftOpen, Network, Download, FastForward, Timer, Save, FolderOpen, Sun, Moon } from 'lucide-react';

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
  onSaveScenario: () => void;
  onLoadScenario: (file: File) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
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
  isWarmedUp,
  onSaveScenario,
  onLoadScenario,
  theme,
  onToggleTheme
}) => {
  const isLight = theme === 'light';
  const [isCollapsed, setIsCollapsed] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onLoadScenario(file);
      // Reset input so same file can be loaded again
      e.target.value = '';
    }
  };

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
       className={`${isCollapsed ? 'w-20' : 'w-72'} flex flex-col h-full z-20 shadow-xl transition-all duration-300 ease-in-out ${
         isLight
           ? 'bg-white border-r border-slate-200'
           : 'bg-[#0f172a] border-r border-slate-800'
       }`}
    >
      {/* Header */}
      <div className={`p-5 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} transition-all ${
        isLight ? 'border-b border-slate-200' : 'border-b border-slate-800'
      }`}>
        <div className="flex items-center gap-3 overflow-hidden">
           <Activity className="text-blue-500 shrink-0" size={24} />
           {!isCollapsed && <h1 className={`text-xl font-bold whitespace-nowrap opacity-100 transition-opacity duration-300 ${
             isLight ? 'text-slate-800' : 'text-slate-100'
           }`}>LeanFlow</h1>}
        </div>
        <div className="flex items-center gap-2">
          {!isCollapsed && (
            <button
              onClick={onToggleTheme}
              className={`p-1.5 rounded transition-colors ${
                isLight
                  ? 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
              }`}
              title={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
            >
              {isLight ? <Moon size={16} /> : <Sun size={16} />}
            </button>
          )}
          {!isCollapsed && (
             <button onClick={() => setIsCollapsed(true)} className={`${
               isLight ? 'text-slate-500 hover:text-slate-700' : 'text-slate-500 hover:text-slate-300'
             }`}>
                <PanelLeftClose size={18} />
             </button>
          )}
        </div>
      </div>

      {isCollapsed && (
         <button onClick={() => setIsCollapsed(false)} className={`mx-auto mt-2 p-2 ${
           isLight ? 'text-slate-500 hover:text-slate-700' : 'text-slate-500 hover:text-slate-300'
         }`}>
            <PanelLeftOpen size={18} />
         </button>
      )}

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 custom-scrollbar flex flex-col gap-6">
        <div>
           {!isCollapsed && <h2 className={`text-xs font-bold uppercase tracking-widest mb-4 whitespace-nowrap ${
             isLight ? 'text-slate-400' : 'text-slate-500'
           }`}>Building Blocks</h2>}
           
           <div className="flex flex-col gap-3">
             {items.map((item) => (
               <div
                 key={item.type}
                 className={`group flex items-center gap-3 rounded-lg cursor-grab border transition-all duration-200 hover:shadow-lg ${item.border}
                    ${isCollapsed ? 'justify-center p-3' : 'p-3'}
                    ${isLight
                      ? 'bg-slate-50 hover:bg-slate-100'
                      : 'bg-slate-800/50 hover:bg-slate-800'
                    }
                 `}
                 onDragStart={(event) => onDragStart(event, item.type, item.label)}
                 draggable
                 title={isCollapsed ? item.label : undefined}
               >
                 <div className={`p-2 rounded shrink-0 ${item.color} ${
                   isLight ? 'bg-slate-200' : 'bg-slate-900'
                 }`}>
                   {item.icon}
                 </div>
                 {!isCollapsed && (
                    <div className="min-w-0">
                      <span className={`block text-sm font-semibold truncate ${
                        isLight ? 'text-slate-700 group-hover:text-slate-900' : 'text-slate-200 group-hover:text-white'
                      }`}>{item.label}</span>
                      <span className={`block text-[10px] truncate ${
                        isLight ? 'text-slate-400' : 'text-slate-500'
                      }`}>{item.desc}</span>
                    </div>
                 )}
               </div>
             ))}
           </div>
        </div>

        <div>
           {!isCollapsed && <h2 className={`text-xs font-bold uppercase tracking-widest mb-4 whitespace-nowrap ${
             isLight ? 'text-slate-400' : 'text-slate-500'
           }`}>Controls</h2>}
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
                  className={`rounded transition-colors flex items-center justify-center
                     ${isCollapsed ? 'p-3 w-full aspect-square' : 'p-3'}
                     ${isLight
                       ? 'bg-slate-100 text-slate-500 hover:text-slate-700 hover:bg-slate-200 border border-slate-200'
                       : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 border border-slate-700'
                     }
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
                   <FastForward size={14} className={isLight ? 'text-slate-400' : 'text-slate-500'} />
                   <span className={`text-xs font-semibold uppercase ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>Speed</span>
                 </div>
                 <div className="flex gap-1">
                   {[1, 2, 5, 10].map(speed => (
                     <button
                       key={speed}
                       onClick={() => onSpeedChange(speed)}
                       className={`flex-1 py-1.5 text-xs font-bold rounded transition-all
                         ${simulationSpeed === speed
                           ? 'bg-blue-600 text-white shadow-[0_0_10px_rgba(59,130,246,0.4)]'
                           : isLight
                             ? 'bg-slate-100 text-slate-500 hover:text-slate-700 hover:bg-slate-200 border border-slate-200'
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
                     <Timer size={14} className={isLight ? 'text-slate-400' : 'text-slate-500'} />
                     <span className={`text-xs font-semibold uppercase ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>Warm-up</span>
                   </div>
                   {isWarmedUp ? (
                     <span className="text-[10px] text-emerald-500 font-semibold">READY</span>
                   ) : warmupTime > 0 ? (
                     <span className="text-[10px] text-amber-500 font-semibold animate-pulse">WARMING</span>
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
                           : isLight
                             ? 'bg-slate-100 text-slate-500 hover:text-slate-700 hover:bg-slate-200 border border-slate-200'
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
                 <p className={`text-[10px] mt-1 ${isLight ? 'text-slate-400' : 'text-slate-600'}`}>Stats reset after warm-up</p>
               </div>
             )}

             <button
                onClick={onLayout}
                className={`rounded transition-all flex items-center justify-center gap-2
                   ${isCollapsed ? 'p-3 w-full aspect-square' : 'py-2 px-3'}
                   ${isLight
                     ? 'bg-slate-100 text-blue-600 hover:text-blue-700 hover:bg-slate-200 hover:border-blue-300 border border-slate-200'
                     : 'bg-slate-800 text-blue-400 hover:text-white hover:bg-slate-700 hover:border-blue-500/50 border border-slate-700'
                   }
                `}
                title="Auto Layout"
             >
                <Network size={18} />
                {!isCollapsed && <span className="text-sm font-medium">Auto Layout</span>}
             </button>

             <button
                onClick={onExport}
                className={`rounded transition-all flex items-center justify-center gap-2
                   ${isCollapsed ? 'p-3 w-full aspect-square' : 'py-2 px-3'}
                   ${isLight
                     ? 'bg-slate-100 text-slate-500 hover:text-emerald-600 hover:bg-slate-200 hover:border-emerald-300 border border-slate-200'
                     : 'bg-slate-800 text-slate-400 hover:text-emerald-400 hover:bg-slate-700 hover:border-emerald-500/50 border border-slate-700'
                   }
                `}
                title="Export Data"
             >
                <Download size={18} />
                {!isCollapsed && <span className="text-sm font-medium">Export CSV</span>}
             </button>

             {/* Scenario Save/Load */}
             <div className={`flex ${isCollapsed ? 'flex-col' : 'flex-row'} gap-2 mt-2`}>
               <button
                  onClick={onSaveScenario}
                  className={`rounded transition-all flex items-center justify-center gap-2
                     ${isCollapsed ? 'p-3 w-full aspect-square' : 'flex-1 py-2 px-3'}
                     ${isLight
                       ? 'bg-slate-100 text-slate-500 hover:text-cyan-600 hover:bg-slate-200 hover:border-cyan-300 border border-slate-200'
                       : 'bg-slate-800 text-slate-400 hover:text-cyan-400 hover:bg-slate-700 hover:border-cyan-500/50 border border-slate-700'
                     }
                  `}
                  title="Save Scenario"
               >
                  <Save size={16} />
                  {!isCollapsed && <span className="text-sm font-medium">Save</span>}
               </button>
               <button
                  onClick={() => fileInputRef.current?.click()}
                  className={`rounded transition-all flex items-center justify-center gap-2
                     ${isCollapsed ? 'p-3 w-full aspect-square' : 'flex-1 py-2 px-3'}
                     ${isLight
                       ? 'bg-slate-100 text-slate-500 hover:text-amber-600 hover:bg-slate-200 hover:border-amber-300 border border-slate-200'
                       : 'bg-slate-800 text-slate-400 hover:text-amber-400 hover:bg-slate-700 hover:border-amber-500/50 border border-slate-700'
                     }
                  `}
                  title="Load Scenario"
               >
                  <FolderOpen size={16} />
                  {!isCollapsed && <span className="text-sm font-medium">Load</span>}
               </button>
               <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileChange}
                  className="hidden"
               />
             </div>
           </div>

           {!isCollapsed && (
             <div className={`mt-3 text-center text-xs font-mono rounded py-1 ${
               isLight ? 'text-slate-500 bg-slate-100' : 'text-slate-500 bg-slate-900'
             }`}>
                {formatTime(simulationTime)}
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
