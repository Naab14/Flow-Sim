import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { NodeData, NodeType } from '../types';
import { NODE_TYPES_CONFIG } from '../constants';
import { Factory, Box, ClipboardCheck, Play, ArrowRight, Database, Ban, Hourglass, BarChart2 } from 'lucide-react';

const CustomNode: React.FC<NodeProps<NodeData>> = ({ data, selected }) => {
  const config = NODE_TYPES_CONFIG[data.type];
  
  const getIcon = () => {
    switch(data.type) {
      case NodeType.SOURCE: return <Play size={16} className="fill-current" />;
      case NodeType.PROCESS: return <Factory size={16} />;
      case NodeType.INVENTORY: return <Database size={16} />;
      case NodeType.QUALITY: return <ClipboardCheck size={16} />;
      case NodeType.SHIPPING: return <ArrowRight size={16} />;
      default: return <Box size={16} />;
    }
  };

  const getStatusStyles = () => {
    if (selected) return 'border-white shadow-[0_0_20px_rgba(255,255,255,0.4)] scale-[1.02] z-30';
    
    switch (data.status) {
      case 'active':
        return 'border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]';
      case 'blocked':
        return 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)] bg-red-950/20';
      case 'starved':
        return 'border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)] bg-amber-950/20 opacity-90';
      case 'idle':
      default:
        return 'border-slate-700 hover:border-slate-500';
    }
  };

  const getStatusIcon = () => {
    if (data.status === 'blocked') return <Ban size={14} className="text-red-400 animate-pulse" />;
    if (data.status === 'starved') return <Hourglass size={14} className="text-amber-400 animate-pulse" />;
    return null;
  };

  const isSource = data.type === NodeType.SOURCE;
  const isSink = data.type === NodeType.SHIPPING;
  const isInventory = data.type === NodeType.INVENTORY;

  return (
    <div className={`relative min-w-[200px] bg-slate-900/90 backdrop-blur-md rounded-lg border-2 transition-all duration-300 overflow-visible group
      ${getStatusStyles()}
    `}>
      {/* Queue Badge */}
      {!isSource && data.stats && data.stats.queueLength > 0 && (
          <div className="absolute -top-3 -left-3 z-40 bg-blue-600 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-slate-900 shadow-lg">
             {data.stats.queueLength}
          </div>
      )}

      {/* Handles */}
      {!isSource && (
        <Handle
          type="target"
          position={Position.Left}
          className="!bg-slate-300 !w-4 !h-4 !-left-2.5 !border-2 !border-slate-900 transition-all hover:!bg-white hover:scale-125 z-20 shadow-lg shadow-blue-500/50"
          id="target"
        />
      )}

      <div className="p-3">
        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <div className={`p-2 rounded-md bg-slate-800 transition-colors ${config.iconColor} 
             ${data.status === 'active' ? 'bg-slate-800' : 'bg-slate-800/50'}
          `}>
            {getIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-slate-100 truncate leading-tight">{data.label}</h3>
            <div className="flex items-center gap-2">
               <p className="text-[10px] text-slate-400 uppercase tracking-wider">{config.label}</p>
               {getStatusIcon()}
            </div>
          </div>
          {/* Status Dot */}
          <div className={`w-2 h-2 rounded-full transition-colors duration-500
            ${data.status === 'active' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]' : 
              data.status === 'blocked' ? 'bg-red-500' :
              data.status === 'starved' ? 'bg-amber-500' : 'bg-slate-600'}
          `}></div>
        </div>

        {/* Real-time KPI Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs mb-2">
          {/* Inventory / Queue */}
          <div className={`p-1.5 rounded border transition-colors ${data.stats?.queueLength > 5 ? 'bg-amber-900/20 border-amber-800/50' : 'bg-slate-800/50 border-slate-700/50'}`}>
            <span className="text-slate-400 block text-[10px]">{isInventory ? 'Stock' : 'Queue'}</span>
            <span className={`font-mono font-medium ${data.stats?.queueLength > 5 ? 'text-amber-400' : 'text-slate-200'}`}>
                {data.stats ? data.stats.queueLength : 0}
            </span>
          </div>
          
          {/* Utilization / Output */}
          <div className="bg-slate-800/50 p-1.5 rounded border border-slate-700/50">
            <span className="text-slate-400 block text-[10px]">{isSource || isSink ? 'Total' : 'Util %'}</span>
            <span className="text-slate-200 font-mono font-medium">
                {isSource || isSink 
                   ? (data.stats?.totalProcessed || 0) 
                   : `${(data.stats?.utilization || 0).toFixed(0)}%`}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        {(data.type === NodeType.PROCESS || data.type === NodeType.QUALITY) && (
          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden relative">
             {data.status === 'blocked' && (
                <div className="absolute inset-0 w-full h-full bg-[linear-gradient(45deg,transparent_25%,rgba(239,68,68,0.2)_25%,rgba(239,68,68,0.2)_50%,transparent_50%,transparent_75%,rgba(239,68,68,0.2)_75%,rgba(239,68,68,0.2)_100%)] bg-[length:10px_10px]"></div>
             )}
            <div 
              className={`h-full transition-all duration-200 ease-linear
                 ${data.status === 'blocked' ? 'bg-red-500 w-full' : 
                   data.status === 'starved' ? 'bg-amber-500' : 'bg-blue-500'}
              `}
              style={{ width: `${data.status === 'blocked' ? 100 : data.status === 'starved' ? 0 : 100}%`, opacity: data.status === 'active' ? 1 : 0.5 }}
            />
          </div>
        )}
      </div>

      {!isSink && (
        <Handle
          type="source"
          position={Position.Right}
          className="!bg-slate-300 !w-4 !h-4 !-right-2.5 !border-2 !border-slate-900 transition-all hover:!bg-white hover:scale-125 z-20 shadow-lg shadow-blue-500/50"
          id="source"
        />
      )}
    </div>
  );
};

export default memo(CustomNode);
