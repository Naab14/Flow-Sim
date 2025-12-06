import { Node, Edge } from 'reactflow';

export enum NodeType {
  SOURCE = 'source',
  PROCESS = 'process',
  QUALITY = 'quality',
  INVENTORY = 'inventory',
  SHIPPING = 'shipping',
}

export interface Entity {
  id: string;
  createdAt: number;
  completedAt?: number;
  path: string[]; // List of Node IDs visited
  currentLocation: string; // Node ID or Edge ID
  state: 'queued' | 'processing' | 'moving' | 'completed';
  type: 'good' | 'defect';
  progress: number; // 0-1 for moving/processing
}

export interface StationStats {
  totalProcessed: number;
  totalGenerated?: number; // For source
  busyTime: number;
  blockedTime: number;
  starvedTime: number;
  utilization: number; // 0-100%
  queueLength: number;
  avgCycleTime: number;
}

export interface NodeData {
  label: string;
  type: NodeType;
  cycleTime: number; // seconds
  defectRate: number; // %
  batchSize: number;
  capacity: number; // Max concurrent units (or storage size for inventory)
  
  // Simulation State (Real-time)
  stats: StationStats;
  status: 'active' | 'idle' | 'blocked' | 'starved';
  progress: number; // 0-100%
}

export type AppNode = Node<NodeData>;
export type AppEdge = Edge;

export interface SimulationResult {
  bottleneckNodeId: string | null;
  maxThroughput: number;
  totalCycleTime: number;
  yield: number;
  suggestions: string[];
  analysisText: string;
}

export interface GlobalStats {
  throughput: number; // Units per minute (rolling avg)
  wip: number;
  averageLeadTime: number; // Seconds
  completedCount: number;
  oee: number; // Overall Equipment Effectiveness (Global proxy)
}
