import { NodeType } from '../types';

export interface ScenarioTemplate {
  id: string;
  name: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: 'assembly' | 'quality' | 'buffer' | 'complex';
  nodes: any[];
  edges: any[];
  settings: {
    warmupTime: number;
    simulationSpeed: number;
  };
}

export const scenarioTemplates: ScenarioTemplate[] = [
  {
    id: 'simple-assembly',
    name: 'Simple Assembly Line',
    description: 'A basic 3-station assembly line. Great for learning the fundamentals of production flow and identifying bottlenecks.',
    difficulty: 'beginner',
    category: 'assembly',
    settings: {
      warmupTime: 30,
      simulationSpeed: 5
    },
    nodes: [
      {
        id: 'source_1',
        type: 'custom',
        position: { x: 50, y: 150 },
        data: {
          label: 'Raw Materials',
          type: NodeType.SOURCE,
          cycleTime: 8,
          cycleTimeVariation: 0,
          defectRate: 0,
          batchSize: 1,
          capacity: 1
        }
      },
      {
        id: 'process_1',
        type: 'custom',
        position: { x: 300, y: 150 },
        data: {
          label: 'Assembly Station 1',
          type: NodeType.PROCESS,
          cycleTime: 10,
          cycleTimeVariation: 10,
          defectRate: 2,
          batchSize: 1,
          capacity: 1
        }
      },
      {
        id: 'process_2',
        type: 'custom',
        position: { x: 550, y: 150 },
        data: {
          label: 'Assembly Station 2',
          type: NodeType.PROCESS,
          cycleTime: 12,
          cycleTimeVariation: 15,
          defectRate: 3,
          batchSize: 1,
          capacity: 1
        }
      },
      {
        id: 'process_3',
        type: 'custom',
        position: { x: 800, y: 150 },
        data: {
          label: 'Final Assembly',
          type: NodeType.PROCESS,
          cycleTime: 8,
          cycleTimeVariation: 5,
          defectRate: 1,
          batchSize: 1,
          capacity: 1
        }
      },
      {
        id: 'shipping_1',
        type: 'custom',
        position: { x: 1050, y: 150 },
        data: {
          label: 'Shipping',
          type: NodeType.SHIPPING,
          cycleTime: 0,
          cycleTimeVariation: 0,
          defectRate: 0,
          batchSize: 1,
          capacity: 1
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: 'source_1', target: 'process_1', type: 'smoothstep' },
      { id: 'e2-3', source: 'process_1', target: 'process_2', type: 'smoothstep' },
      { id: 'e3-4', source: 'process_2', target: 'process_3', type: 'smoothstep' },
      { id: 'e4-5', source: 'process_3', target: 'shipping_1', type: 'smoothstep' }
    ]
  },
  {
    id: 'quality-gate-rework',
    name: 'Quality Gate with Rework Loop',
    description: 'Assembly line with quality inspection. Defective items are routed back for rework, simulating real manufacturing QC processes.',
    difficulty: 'intermediate',
    category: 'quality',
    settings: {
      warmupTime: 60,
      simulationSpeed: 5
    },
    nodes: [
      {
        id: 'source_1',
        type: 'custom',
        position: { x: 50, y: 200 },
        data: {
          label: 'Parts Incoming',
          type: NodeType.SOURCE,
          cycleTime: 6,
          cycleTimeVariation: 0,
          defectRate: 0,
          batchSize: 1,
          capacity: 1
        }
      },
      {
        id: 'process_1',
        type: 'custom',
        position: { x: 300, y: 200 },
        data: {
          label: 'Main Assembly',
          type: NodeType.PROCESS,
          cycleTime: 10,
          cycleTimeVariation: 20,
          defectRate: 5,
          batchSize: 1,
          capacity: 2
        }
      },
      {
        id: 'quality_1',
        type: 'custom',
        position: { x: 550, y: 200 },
        data: {
          label: 'Quality Inspection',
          type: NodeType.QUALITY,
          cycleTime: 5,
          cycleTimeVariation: 10,
          defectRate: 15,
          batchSize: 1,
          capacity: 1
        }
      },
      {
        id: 'process_2',
        type: 'custom',
        position: { x: 550, y: 350 },
        data: {
          label: 'Rework Station',
          type: NodeType.PROCESS,
          cycleTime: 15,
          cycleTimeVariation: 25,
          defectRate: 2,
          batchSize: 1,
          capacity: 1
        }
      },
      {
        id: 'process_3',
        type: 'custom',
        position: { x: 800, y: 200 },
        data: {
          label: 'Packaging',
          type: NodeType.PROCESS,
          cycleTime: 4,
          cycleTimeVariation: 5,
          defectRate: 0,
          batchSize: 1,
          capacity: 1
        }
      },
      {
        id: 'shipping_1',
        type: 'custom',
        position: { x: 1050, y: 200 },
        data: {
          label: 'Shipping',
          type: NodeType.SHIPPING,
          cycleTime: 0,
          cycleTimeVariation: 0,
          defectRate: 0,
          batchSize: 1,
          capacity: 1
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: 'source_1', target: 'process_1', type: 'smoothstep' },
      { id: 'e2-3', source: 'process_1', target: 'quality_1', type: 'smoothstep' },
      { id: 'e3-4', source: 'quality_1', target: 'process_3', type: 'smoothstep' },
      { id: 'e3-rework', source: 'quality_1', target: 'process_2', type: 'smoothstep' },
      { id: 'e-rework-qa', source: 'process_2', target: 'quality_1', type: 'smoothstep' },
      { id: 'e4-5', source: 'process_3', target: 'shipping_1', type: 'smoothstep' }
    ]
  },
  {
    id: 'multi-stage-buffer',
    name: 'Multi-Stage with Buffer Inventory',
    description: 'Complex manufacturing line with intermediate inventory buffers to handle variability and prevent blocking/starving.',
    difficulty: 'intermediate',
    category: 'buffer',
    settings: {
      warmupTime: 60,
      simulationSpeed: 5
    },
    nodes: [
      {
        id: 'source_1',
        type: 'custom',
        position: { x: 50, y: 150 },
        data: {
          label: 'Material Feed',
          type: NodeType.SOURCE,
          cycleTime: 5,
          cycleTimeVariation: 0,
          defectRate: 0,
          batchSize: 1,
          capacity: 1
        }
      },
      {
        id: 'process_1',
        type: 'custom',
        position: { x: 250, y: 150 },
        data: {
          label: 'Cutting',
          type: NodeType.PROCESS,
          cycleTime: 8,
          cycleTimeVariation: 15,
          defectRate: 2,
          batchSize: 1,
          capacity: 1
        }
      },
      {
        id: 'buffer_1',
        type: 'custom',
        position: { x: 450, y: 150 },
        data: {
          label: 'Buffer 1',
          type: NodeType.INVENTORY,
          cycleTime: 0,
          cycleTimeVariation: 0,
          defectRate: 0,
          batchSize: 1,
          capacity: 10
        }
      },
      {
        id: 'process_2',
        type: 'custom',
        position: { x: 650, y: 150 },
        data: {
          label: 'Machining',
          type: NodeType.PROCESS,
          cycleTime: 15,
          cycleTimeVariation: 20,
          defectRate: 5,
          batchSize: 1,
          capacity: 2
        }
      },
      {
        id: 'buffer_2',
        type: 'custom',
        position: { x: 850, y: 150 },
        data: {
          label: 'Buffer 2',
          type: NodeType.INVENTORY,
          cycleTime: 0,
          cycleTimeVariation: 0,
          defectRate: 0,
          batchSize: 1,
          capacity: 8
        }
      },
      {
        id: 'process_3',
        type: 'custom',
        position: { x: 1050, y: 150 },
        data: {
          label: 'Finishing',
          type: NodeType.PROCESS,
          cycleTime: 10,
          cycleTimeVariation: 10,
          defectRate: 1,
          batchSize: 1,
          capacity: 1
        }
      },
      {
        id: 'shipping_1',
        type: 'custom',
        position: { x: 1250, y: 150 },
        data: {
          label: 'Shipping',
          type: NodeType.SHIPPING,
          cycleTime: 0,
          cycleTimeVariation: 0,
          defectRate: 0,
          batchSize: 1,
          capacity: 1
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: 'source_1', target: 'process_1', type: 'smoothstep' },
      { id: 'e2-3', source: 'process_1', target: 'buffer_1', type: 'smoothstep' },
      { id: 'e3-4', source: 'buffer_1', target: 'process_2', type: 'smoothstep' },
      { id: 'e4-5', source: 'process_2', target: 'buffer_2', type: 'smoothstep' },
      { id: 'e5-6', source: 'buffer_2', target: 'process_3', type: 'smoothstep' },
      { id: 'e6-7', source: 'process_3', target: 'shipping_1', type: 'smoothstep' }
    ]
  },
  {
    id: 'parallel-workstations',
    name: 'Parallel Workstations',
    description: 'Two parallel processing lines that merge. Demonstrates load balancing and how parallel capacity affects throughput.',
    difficulty: 'intermediate',
    category: 'complex',
    settings: {
      warmupTime: 45,
      simulationSpeed: 5
    },
    nodes: [
      {
        id: 'source_1',
        type: 'custom',
        position: { x: 50, y: 225 },
        data: {
          label: 'Orders',
          type: NodeType.SOURCE,
          cycleTime: 4,
          cycleTimeVariation: 0,
          defectRate: 0,
          batchSize: 1,
          capacity: 1
        }
      },
      {
        id: 'process_1a',
        type: 'custom',
        position: { x: 300, y: 100 },
        data: {
          label: 'Line A - Station 1',
          type: NodeType.PROCESS,
          cycleTime: 12,
          cycleTimeVariation: 15,
          defectRate: 3,
          batchSize: 1,
          capacity: 1
        }
      },
      {
        id: 'process_1b',
        type: 'custom',
        position: { x: 300, y: 350 },
        data: {
          label: 'Line B - Station 1',
          type: NodeType.PROCESS,
          cycleTime: 10,
          cycleTimeVariation: 10,
          defectRate: 2,
          batchSize: 1,
          capacity: 1
        }
      },
      {
        id: 'process_2a',
        type: 'custom',
        position: { x: 550, y: 100 },
        data: {
          label: 'Line A - Station 2',
          type: NodeType.PROCESS,
          cycleTime: 8,
          cycleTimeVariation: 10,
          defectRate: 1,
          batchSize: 1,
          capacity: 1
        }
      },
      {
        id: 'process_2b',
        type: 'custom',
        position: { x: 550, y: 350 },
        data: {
          label: 'Line B - Station 2',
          type: NodeType.PROCESS,
          cycleTime: 14,
          cycleTimeVariation: 20,
          defectRate: 4,
          batchSize: 1,
          capacity: 1
        }
      },
      {
        id: 'buffer_1',
        type: 'custom',
        position: { x: 800, y: 225 },
        data: {
          label: 'Merge Buffer',
          type: NodeType.INVENTORY,
          cycleTime: 0,
          cycleTimeVariation: 0,
          defectRate: 0,
          batchSize: 1,
          capacity: 15
        }
      },
      {
        id: 'process_3',
        type: 'custom',
        position: { x: 1000, y: 225 },
        data: {
          label: 'Final Processing',
          type: NodeType.PROCESS,
          cycleTime: 6,
          cycleTimeVariation: 5,
          defectRate: 1,
          batchSize: 1,
          capacity: 1
        }
      },
      {
        id: 'shipping_1',
        type: 'custom',
        position: { x: 1200, y: 225 },
        data: {
          label: 'Shipping',
          type: NodeType.SHIPPING,
          cycleTime: 0,
          cycleTimeVariation: 0,
          defectRate: 0,
          batchSize: 1,
          capacity: 1
        }
      }
    ],
    edges: [
      { id: 'e-s-1a', source: 'source_1', target: 'process_1a', type: 'smoothstep' },
      { id: 'e-s-1b', source: 'source_1', target: 'process_1b', type: 'smoothstep' },
      { id: 'e-1a-2a', source: 'process_1a', target: 'process_2a', type: 'smoothstep' },
      { id: 'e-1b-2b', source: 'process_1b', target: 'process_2b', type: 'smoothstep' },
      { id: 'e-2a-buf', source: 'process_2a', target: 'buffer_1', type: 'smoothstep' },
      { id: 'e-2b-buf', source: 'process_2b', target: 'buffer_1', type: 'smoothstep' },
      { id: 'e-buf-3', source: 'buffer_1', target: 'process_3', type: 'smoothstep' },
      { id: 'e-3-ship', source: 'process_3', target: 'shipping_1', type: 'smoothstep' }
    ]
  },
  {
    id: 'bottleneck-demo',
    name: 'Bottleneck Demonstration',
    description: 'A deliberately unbalanced line to demonstrate bottleneck effects. The slow middle station will limit overall throughput.',
    difficulty: 'beginner',
    category: 'assembly',
    settings: {
      warmupTime: 30,
      simulationSpeed: 5
    },
    nodes: [
      {
        id: 'source_1',
        type: 'custom',
        position: { x: 50, y: 150 },
        data: {
          label: 'Fast Input',
          type: NodeType.SOURCE,
          cycleTime: 3,
          cycleTimeVariation: 0,
          defectRate: 0,
          batchSize: 1,
          capacity: 1
        }
      },
      {
        id: 'process_1',
        type: 'custom',
        position: { x: 300, y: 150 },
        data: {
          label: 'Fast Station',
          type: NodeType.PROCESS,
          cycleTime: 5,
          cycleTimeVariation: 5,
          defectRate: 1,
          batchSize: 1,
          capacity: 1
        }
      },
      {
        id: 'process_2',
        type: 'custom',
        position: { x: 550, y: 150 },
        data: {
          label: 'BOTTLENECK',
          type: NodeType.PROCESS,
          cycleTime: 20,
          cycleTimeVariation: 10,
          defectRate: 5,
          batchSize: 1,
          capacity: 1
        }
      },
      {
        id: 'process_3',
        type: 'custom',
        position: { x: 800, y: 150 },
        data: {
          label: 'Fast Station',
          type: NodeType.PROCESS,
          cycleTime: 4,
          cycleTimeVariation: 5,
          defectRate: 1,
          batchSize: 1,
          capacity: 1
        }
      },
      {
        id: 'shipping_1',
        type: 'custom',
        position: { x: 1050, y: 150 },
        data: {
          label: 'Shipping',
          type: NodeType.SHIPPING,
          cycleTime: 0,
          cycleTimeVariation: 0,
          defectRate: 0,
          batchSize: 1,
          capacity: 1
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: 'source_1', target: 'process_1', type: 'smoothstep' },
      { id: 'e2-3', source: 'process_1', target: 'process_2', type: 'smoothstep' },
      { id: 'e3-4', source: 'process_2', target: 'process_3', type: 'smoothstep' },
      { id: 'e4-5', source: 'process_3', target: 'shipping_1', type: 'smoothstep' }
    ]
  },
  {
    id: 'high-variability',
    name: 'High Variability Line',
    description: 'Experience the impact of process variability on production. High cycle time variations cause unpredictable flow.',
    difficulty: 'advanced',
    category: 'complex',
    settings: {
      warmupTime: 90,
      simulationSpeed: 5
    },
    nodes: [
      {
        id: 'source_1',
        type: 'custom',
        position: { x: 50, y: 150 },
        data: {
          label: 'Variable Arrivals',
          type: NodeType.SOURCE,
          cycleTime: 8,
          cycleTimeVariation: 0,
          defectRate: 0,
          batchSize: 1,
          capacity: 1
        }
      },
      {
        id: 'process_1',
        type: 'custom',
        position: { x: 300, y: 150 },
        data: {
          label: 'High Var Station 1',
          type: NodeType.PROCESS,
          cycleTime: 10,
          cycleTimeVariation: 40,
          defectRate: 5,
          batchSize: 1,
          capacity: 1
        }
      },
      {
        id: 'process_2',
        type: 'custom',
        position: { x: 550, y: 150 },
        data: {
          label: 'High Var Station 2',
          type: NodeType.PROCESS,
          cycleTime: 12,
          cycleTimeVariation: 45,
          defectRate: 8,
          batchSize: 1,
          capacity: 1
        }
      },
      {
        id: 'quality_1',
        type: 'custom',
        position: { x: 800, y: 150 },
        data: {
          label: 'QC Check',
          type: NodeType.QUALITY,
          cycleTime: 5,
          cycleTimeVariation: 30,
          defectRate: 10,
          batchSize: 1,
          capacity: 1
        }
      },
      {
        id: 'shipping_1',
        type: 'custom',
        position: { x: 1050, y: 150 },
        data: {
          label: 'Shipping',
          type: NodeType.SHIPPING,
          cycleTime: 0,
          cycleTimeVariation: 0,
          defectRate: 0,
          batchSize: 1,
          capacity: 1
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: 'source_1', target: 'process_1', type: 'smoothstep' },
      { id: 'e2-3', source: 'process_1', target: 'process_2', type: 'smoothstep' },
      { id: 'e3-4', source: 'process_2', target: 'quality_1', type: 'smoothstep' },
      { id: 'e4-5', source: 'quality_1', target: 'shipping_1', type: 'smoothstep' }
    ]
  }
];

export const getTemplateById = (id: string): ScenarioTemplate | undefined => {
  return scenarioTemplates.find(t => t.id === id);
};

export const getTemplatesByCategory = (category: ScenarioTemplate['category']): ScenarioTemplate[] => {
  return scenarioTemplates.filter(t => t.category === category);
};

export const getTemplatesByDifficulty = (difficulty: ScenarioTemplate['difficulty']): ScenarioTemplate[] => {
  return scenarioTemplates.filter(t => t.difficulty === difficulty);
};
