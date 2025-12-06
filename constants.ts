import { NodeType } from './types';

export const INITIAL_NODES = [
  {
    id: '1',
    type: 'custom',
    data: { 
      label: 'Raw Material', 
      type: NodeType.SOURCE, 
      cycleTime: 5, 
      defectRate: 0, 
      batchSize: 100, 
      capacity: 0,
      inventory: 1000,
      processed: 0,
      status: 'active',
      progress: 0
    },
    position: { x: 50, y: 100 },
  },
  {
    id: '2',
    type: 'custom',
    data: { 
      label: 'Machining', 
      type: NodeType.PROCESS, 
      cycleTime: 15, 
      defectRate: 1, 
      batchSize: 1, 
      capacity: 0,
      inventory: 4,
      processed: 6,
      status: 'active',
      progress: 60
    },
    position: { x: 300, y: 100 },
  },
  {
    id: '3',
    type: 'custom',
    data: { 
      label: 'WIP Store', 
      type: NodeType.INVENTORY, 
      cycleTime: 0, 
      defectRate: 0, 
      batchSize: 10, 
      capacity: 0,
      inventory: 0,
      processed: 0,
      status: 'idle',
      progress: 0
    },
    position: { x: 550, y: 100 },
  },
];

export const INITIAL_EDGES = [
  { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#475569' } },
  { id: 'e2-3', source: '2', target: '3', animated: true, style: { stroke: '#475569' } },
];

export const NODE_TYPES_CONFIG = {
  [NodeType.SOURCE]: { color: 'border-blue-500', iconColor: 'text-blue-400', label: 'Source' },
  [NodeType.PROCESS]: { color: 'border-emerald-500', iconColor: 'text-emerald-400', label: 'Process' },
  [NodeType.QUALITY]: { color: 'border-purple-500', iconColor: 'text-purple-400', label: 'Inspection' },
  [NodeType.INVENTORY]: { color: 'border-amber-500', iconColor: 'text-amber-400', label: 'Buffer' },
  [NodeType.SHIPPING]: { color: 'border-indigo-500', iconColor: 'text-indigo-400', label: 'Customer' },
};