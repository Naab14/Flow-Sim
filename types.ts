import { Node, Edge } from 'reactflow';

export enum NodeType {
  SOURCE = 'source',
  PROCESS = 'process',
  QUALITY = 'quality',
  INVENTORY = 'inventory',
  SHIPPING = 'shipping',
}

export interface NodeData {
  label: string;
  type: NodeType;
  cycleTime: number; // in seconds
  defectRate: number; // in percentage (0-100)
  batchSize: number; // units
  capacity: number; // units per hour (calculated or fixed)
  // Simulation State
  inventory: number;
  processed: number;
  status: 'active' | 'idle' | 'blocked' | 'starved';
  progress: number; // 0-100 for current cycle
}

export type AppNode = Node<NodeData>;
export type AppEdge = Edge;

export interface SimulationResult {
  bottleneckNodeId: string | null;
  maxThroughput: number; // units per hour
  totalCycleTime: number; // seconds (critical path)
  yield: number; // percentage
  suggestions: string[];
  analysisText: string;
}

export interface AnalysisRequest {
  nodes: AppNode[];
  edges: AppEdge[];
}