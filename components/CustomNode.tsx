import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { NodeData, NodeType } from '../types';
import { NODE_TYPES_CONFIG } from '../constants';
import { Factory, Box, ClipboardCheck, Play, ArrowRight, Database } from 'lucide-react';

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

  const isSource = data.type === NodeType.SOURCE;
  const isSink = data.type === NodeType.SHIPPING;

  return (
    <div className={`relative min-w-[180px] bg-slate-900/90 backdrop-blur-md rounded-lg border-2 transition-all duration-300 overflow-hidden group
      ${selected ? 'border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]' : `border-slate-700 hover:border-slate-500`}
    `}>
      {/* Selection Glow Indicator based on type color */}
      <div className={`absolute inset-0 opacity-10 pointer-events-none ${config.color.replace('border', 'bg')}`}></div>
      
      {!isSource && (
        <Handle
          type="target"
          position={Position.Left}
          className="!bg-slate-400 !w-3 !h-3 !-left-2 !border-slate-900"
        />
      )}

      <div className="p-3">
        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <div className={`p-2 rounded-md bg-slate-800 ${config.iconColor}`}>
            {getIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-slate-100 truncate leading-tight">{data.label}</h3>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">{config.label}</p>
          </div>
          {/* Status Dot */}
          <div className={`w-2 h-2 rounded-full ${data.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-slate-600'}`}></div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs mb-2">
          <div className="bg-slate-800/50 p-1.5 rounded border border-slate-700/50">
            <span className="text-slate-400 block text-[10px]">Inv</span>
            <span className="text-slate-200 font-mono font-medium">{data.inventory}</span>
          </div>
          <div className="bg-slate-800/50 p-1.5 rounded border border-slate-700/50">
            <span className="text-slate-400 block text-[10px]">Done</span>
            <span className="text-slate-200 font-mono font-medium">{data.processed}</span>
          </div>
        </div>

        {/* Progress Bar */}
        {(data.type === NodeType.PROCESS || data.type === NodeType.QUALITY) && (
          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all duration-200 ease-linear"
              style={{ width: `${data.progress}%` }}
            />
          </div>
        )}
      </div>

      {!isSink && (
        <Handle
          type="source"
          position={Position.Right}
          className="!bg-slate-400 !w-3 !h-3 !-right-2 !border-slate-900"
        />
      )}
    </div>
  );
};

export default memo(CustomNode);