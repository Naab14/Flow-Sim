import { useCallback } from 'react';
import { Node, Edge, MarkerType } from 'reactflow';
import { AppNode } from '../types';

export interface ScenarioSettings {
  warmupTime: number;
  simulationSpeed: number;
}

export interface Scenario {
  version: string;
  name: string;
  createdAt: string;
  settings: ScenarioSettings;
  nodes: Node[];
  edges: Edge[];
}

export interface ScenarioManagerActions {
  saveScenario: () => void;
  loadScenario: (
    file: File,
    callbacks: {
      onSuccess: (scenario: Scenario) => void;
      onError: (message: string) => void;
    }
  ) => void;
  exportCSV: (
    simulationTime: number,
    warmupTime: number,
    globalStats: any,
    history: any[]
  ) => void;
}

export function useScenarioManager(
  nodes: Node[],
  edges: Edge[],
  settings: ScenarioSettings
): ScenarioManagerActions {
  // Save current scenario to JSON file
  const saveScenario = useCallback(() => {
    const scenario: Scenario = {
      version: '1.0',
      name: `LeanFlow Scenario - ${new Date().toLocaleDateString()}`,
      createdAt: new Date().toISOString(),
      settings: {
        warmupTime: settings.warmupTime,
        simulationSpeed: settings.simulationSpeed
      },
      nodes: nodes.map(n => ({
        id: n.id,
        type: n.type,
        position: n.position,
        data: {
          label: n.data.label,
          type: n.data.type,
          cycleTime: n.data.cycleTime,
          cycleTimeVariation: n.data.cycleTimeVariation || 0,
          defectRate: n.data.defectRate,
          batchSize: n.data.batchSize,
          capacity: n.data.capacity,
          shiftPattern: (n.data as any).shiftPattern
        }
      })),
      edges: edges.map(e => ({
        id: e.id,
        source: e.source,
        target: e.target,
        type: e.type
      }))
    };

    const jsonContent = JSON.stringify(scenario, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `leanflow_scenario_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [nodes, edges, settings]);

  // Load scenario from JSON file
  const loadScenario = useCallback((
    file: File,
    callbacks: {
      onSuccess: (scenario: Scenario) => void;
      onError: (message: string) => void;
    }
  ) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const scenario = JSON.parse(e.target?.result as string);

        // Validate basic structure
        if (!scenario.nodes || !scenario.edges) {
          callbacks.onError('Invalid scenario file: missing nodes or edges');
          return;
        }

        // Load nodes with default stats
        const loadedNodes = scenario.nodes.map((n: any) => ({
          ...n,
          data: {
            ...n.data,
            cycleTimeVariation: n.data.cycleTimeVariation || 0,
            shiftPattern: n.data.shiftPattern || undefined,
            stats: {
              totalProcessed: 0,
              busyTime: 0,
              blockedTime: 0,
              starvedTime: 0,
              breakTime: 0,
              utilization: 0,
              queueLength: 0,
              avgCycleTime: 0
            },
            status: 'idle',
            progress: 0
          }
        }));

        // Load edges with styling
        const loadedEdges = scenario.edges.map((e: any) => ({
          ...e,
          animated: true,
          type: e.type || 'smoothstep',
          style: { stroke: '#475569', strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: '#475569' }
        }));

        callbacks.onSuccess({
          ...scenario,
          nodes: loadedNodes,
          edges: loadedEdges
        });

        console.log(`Loaded scenario: ${scenario.name || 'Unknown'}`);
      } catch (error) {
        console.error('Failed to load scenario:', error);
        callbacks.onError('Failed to load scenario file. Please check the file format.');
      }
    };
    reader.readAsText(file);
  }, []);

  // Export CSV with enhanced KPI metrics
  const exportCSV = useCallback((
    simulationTime: number,
    warmupTime: number,
    globalStats: any,
    history: any[]
  ) => {
    // Time series data
    const timeHeaders = "Time (s),Throughput (u/min),WIP,OEE (%)\n";
    const timeRows = history.map((row: any) =>
      `${row.time.toFixed(1)},${row.throughput},${row.wip},${row.oee.toFixed(1)}`
    ).join("\n");

    // Summary stats section
    const summarySection = [
      "",
      "--- SUMMARY ---",
      `Simulation Duration (s),${simulationTime.toFixed(1)}`,
      `Warm-up Period (s),${warmupTime}`,
      "",
      "--- KPI METRICS ---",
      `Throughput (u/hr),${globalStats.throughput.toFixed(1)}`,
      `Throughput (u/min window),${globalStats.throughputPerMinute}`,
      `WIP (units),${globalStats.wip}`,
      `Avg Lead Time (s),${globalStats.averageLeadTime.toFixed(1)}`,
      `Completed Count,${globalStats.completedCount}`,
      `Total Generated,${globalStats.totalGenerated}`,
      "",
      "--- OEE BREAKDOWN ---",
      `OEE (%),${globalStats.oee.toFixed(1)}`,
      `Availability (%),${globalStats.availability.toFixed(1)}`,
      `Performance (%),${globalStats.performance.toFixed(1)}`,
      `Quality (%),${globalStats.quality.toFixed(1)}`,
      "",
      "--- BOTTLENECK ---",
      `Bottleneck Node,${globalStats.bottleneckNodeId || 'None'}`,
      `Bottleneck Utilization (%),${globalStats.bottleneckUtilization.toFixed(1)}`
    ].join("\n");

    const csvContent = "data:text/csv;charset=utf-8," + timeHeaders + timeRows + "\n" + summarySection;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `leanflow_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  return {
    saveScenario,
    loadScenario,
    exportCSV
  };
}
