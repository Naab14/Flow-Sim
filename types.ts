import { Node, Edge } from 'reactflow';

// Shift patterns for scheduled downtime
export interface BreakPeriod {
  startMinute: number; // Minutes from shift start (e.g., 120 = 2 hours into shift)
  durationMinutes: number; // Duration in minutes
  name: string; // e.g., "Lunch Break", "15min Break"
}

export interface ShiftPattern {
  enabled: boolean;
  shiftDurationHours: number; // Total shift length (e.g., 8 hours)
  breaks: BreakPeriod[];
}

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
  totalGenerated?: number; // For source nodes
  totalDefects?: number; // For quality/inspection nodes - defects found
  totalScrapped?: number; // Items scrapped (no rework path)
  busyTime: number;
  blockedTime: number;
  starvedTime: number;
  breakTime: number; // Time spent on scheduled breaks
  utilization: number; // 0-100%
  queueLength: number;
  avgCycleTime: number;
}

export interface NodeData {
  label: string;
  type: NodeType;
  cycleTime: number; // seconds (mean/target)
  cycleTimeVariation: number; // % variation (e.g., 10 means ±10%)
  defectRate: number; // %
  batchSize: number;
  capacity: number; // Max concurrent units (or storage size for inventory)

  // Shift Pattern (optional)
  shiftPattern?: ShiftPattern;

  // Simulation State (Real-time)
  stats: StationStats;
  status: 'active' | 'idle' | 'blocked' | 'starved' | 'break';
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
  throughput: number; // Units per hour (rate-based)
  throughputPerMinute: number; // Units per minute (rolling 60s window)
  wip: number;
  averageLeadTime: number; // Seconds from creation to completion
  completedCount: number;
  totalGenerated: number;
  oee: number; // Overall Equipment Effectiveness (0-100%)
  availability: number; // OEE component: uptime %
  performance: number; // OEE component: speed %
  quality: number; // OEE component: good units %
  bottleneckNodeId: string | null; // ID of current bottleneck
  bottleneckUtilization: number; // Utilization % of bottleneck
}

// History point for charts
export interface HistoryPoint {
  time: number;
  throughput: number;
  wip: number;
  oee: number;
}
