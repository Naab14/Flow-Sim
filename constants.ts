import { NodeType } from './types';
import { MarkerType } from 'reactflow';

export const INITIAL_NODES = [
  {
    id: '1',
    type: 'custom',
    data: {
      label: 'Raw Material',
      type: NodeType.SOURCE,
      cycleTime: 5,
      cycleTimeVariation: 0,
      defectRate: 0,
      batchSize: 100,
      capacity: 1,
      stats: { totalProcessed: 0, busyTime: 0, blockedTime: 0, starvedTime: 0, utilization: 0, queueLength: 0, avgCycleTime: 0 },
      status: 'idle',
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
      cycleTime: 10,
      cycleTimeVariation: 10, // ±10% variation - realistic for manual operation
      defectRate: 1,
      batchSize: 1,
      capacity: 1,
      stats: { totalProcessed: 0, busyTime: 0, blockedTime: 0, starvedTime: 0, utilization: 0, queueLength: 0, avgCycleTime: 0 },
      status: 'idle',
      progress: 0
    },
    position: { x: 300, y: 100 },
  },
  {
    id: '3',
    type: 'custom',
    data: {
      label: 'Buffer',
      type: NodeType.INVENTORY,
      cycleTime: 0,
      cycleTimeVariation: 0,
      defectRate: 0,
      batchSize: 10,
      capacity: 5, // Limited space
      stats: { totalProcessed: 0, busyTime: 0, blockedTime: 0, starvedTime: 0, utilization: 0, queueLength: 0, avgCycleTime: 0 },
      status: 'idle',
      progress: 0
    },
    position: { x: 550, y: 100 },
  },
  {
    id: '4',
    type: 'custom',
    data: {
      label: 'Assembly',
      type: NodeType.PROCESS,
      cycleTime: 15, // Slower than machining -> Bottleneck
      cycleTimeVariation: 15, // ±15% variation - higher for manual assembly
      defectRate: 0,
      batchSize: 1,
      capacity: 1,
      stats: { totalProcessed: 0, busyTime: 0, blockedTime: 0, starvedTime: 0, utilization: 0, queueLength: 0, avgCycleTime: 0 },
      status: 'idle',
      progress: 0
    },
    position: { x: 800, y: 100 },
  },
  {
    id: '5',
    type: 'custom',
    data: {
      label: 'Shipping',
      type: NodeType.SHIPPING,
      cycleTime: 0,
      cycleTimeVariation: 0,
      defectRate: 0,
      batchSize: 1,
      capacity: 1,
      stats: { totalProcessed: 0, busyTime: 0, blockedTime: 0, starvedTime: 0, utilization: 0, queueLength: 0, avgCycleTime: 0 },
      status: 'idle',
      progress: 0
    },
    position: { x: 1050, y: 100 },
  },
];

export const INITIAL_EDGES = [
  { 
    id: 'e1-2', 
    source: '1', 
    target: '2', 
    animated: true, 
    type: 'smoothstep',
    style: { stroke: '#475569', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#475569' }
  },
  { 
    id: 'e2-3', 
    source: '2', 
    target: '3', 
    animated: true, 
    type: 'smoothstep',
    style: { stroke: '#475569', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#475569' }
  },
  { 
    id: 'e3-4', 
    source: '3', 
    target: '4', 
    animated: true, 
    type: 'smoothstep',
    style: { stroke: '#475569', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#475569' }
  },
  { 
    id: 'e4-5', 
    source: '4', 
    target: '5', 
    animated: true, 
    type: 'smoothstep',
    style: { stroke: '#475569', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#475569' }
  },
];

export const NODE_TYPES_CONFIG = {
  [NodeType.SOURCE]: { color: 'border-blue-500', iconColor: 'text-blue-400', label: 'Source' },
  [NodeType.PROCESS]: { color: 'border-emerald-500', iconColor: 'text-emerald-400', label: 'Process' },
  [NodeType.QUALITY]: { color: 'border-purple-500', iconColor: 'text-purple-400', label: 'Inspection' },
  [NodeType.INVENTORY]: { color: 'border-amber-500', iconColor: 'text-amber-400', label: 'Buffer' },
  [NodeType.SHIPPING]: { color: 'border-indigo-500', iconColor: 'text-indigo-400', label: 'Customer' },
};
