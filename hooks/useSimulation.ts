import { useState, useEffect, useCallback, useRef } from 'react';
import { Node, Edge } from 'reactflow';
import { AppNode, Entity, GlobalStats, HistoryPoint } from '../types';
import { Simulator } from '../engine/Simulator';

export interface SimulationState {
  isPlaying: boolean;
  simulationTime: number;
  simulationSpeed: number;
  warmupTime: number;
  isWarmedUp: boolean;
  globalStats: GlobalStats & { history: HistoryPoint[] };
  movingEntities: Entity[];
}

export interface SimulationActions {
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  reset: () => void;
  setSpeed: (speed: number) => void;
  setWarmupTime: (time: number) => void;
}

const initialGlobalStats: GlobalStats & { history: HistoryPoint[] } = {
  throughput: 0,
  throughputPerMinute: 0,
  wip: 0,
  averageLeadTime: 0,
  completedCount: 0,
  totalGenerated: 0,
  oee: 0,
  availability: 100,
  performance: 0,
  quality: 100,
  bottleneckNodeId: null,
  bottleneckUtilization: 0,
  history: []
};

export function useSimulation(
  nodes: Node[],
  edges: Edge[],
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>
): [SimulationState, SimulationActions, Simulator] {
  const simulatorRef = useRef<Simulator>(new Simulator());
  const simulator = simulatorRef.current;

  const [isPlaying, setIsPlaying] = useState(false);
  const [simulationTime, setSimulationTime] = useState(0);
  const [simulationSpeed, setSimulationSpeed] = useState(5);
  const [warmupTime, setWarmupTime] = useState(0);
  const [isWarmedUp, setIsWarmedUp] = useState(false);
  const [globalStats, setGlobalStats] = useState<GlobalStats & { history: HistoryPoint[] }>(initialGlobalStats);
  const [movingEntities, setMovingEntities] = useState<Entity[]>([]);

  // Reset simulation
  const reset = useCallback(() => {
    setIsPlaying(false);
    setSimulationTime(0);
    setIsWarmedUp(false);
    simulator.initialize(nodes as AppNode[], edges);
    simulator.setWarmupTime(warmupTime);
    setMovingEntities([]);
    setGlobalStats(initialGlobalStats);
    setNodes(nds => nds.map(n => ({
      ...n,
      data: {
        ...n.data,
        status: 'idle',
        progress: 0,
        stats: {
          ...n.data.stats,
          queueLength: 0,
          utilization: 0,
          totalProcessed: 0,
          breakTime: 0
        }
      }
    })));
  }, [nodes, edges, warmupTime, simulator, setNodes]);

  // Play/Pause controls
  const play = useCallback(() => setIsPlaying(true), []);
  const pause = useCallback(() => setIsPlaying(false), []);
  const togglePlay = useCallback(() => setIsPlaying(prev => !prev), []);

  // Speed control
  const setSpeed = useCallback((speed: number) => {
    setSimulationSpeed(speed);
  }, []);

  // Warmup time control
  const handleSetWarmupTime = useCallback((time: number) => {
    setWarmupTime(time);
  }, []);

  // Main Simulation Loop
  useEffect(() => {
    if (!isPlaying) return;

    // Initialize only if fresh start
    if (simulationTime === 0) {
      simulator.initialize(nodes as AppNode[], edges);
      simulator.setWarmupTime(warmupTime);
    }

    let lastTime = performance.now();
    let frameId: number;

    const loop = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      // Run simulation step with configurable speed
      const speedFactor = simulationSpeed;

      // Advance simulation physics
      const updateResult = simulator.update(dt * speedFactor);

      setSimulationTime(t => t + dt * speedFactor);

      // Track warm-up status from simulator
      setIsWarmedUp(simulator.getIsWarmedUp());

      // Sync React State (every frame for smooth visualization)
      // 1. Update Nodes Visuals
      setNodes(currentNodes => currentNodes.map(n => {
        const simState = updateResult.nodes.get(n.id);
        if (simState) {
          return {
            ...n,
            data: {
              ...n.data,
              status: simState.status,
              stats: simState.stats
            }
          };
        }
        return n;
      }));

      // 2. Update Stats (use simulator's history for charts)
      setGlobalStats({
        ...updateResult.stats,
        history: simulator.history
      });

      // 3. Update Moving Entities
      setMovingEntities(updateResult.entities);

      frameId = requestAnimationFrame(loop);
    };

    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, [isPlaying, edges, simulationSpeed, warmupTime, simulator, setNodes]);

  const state: SimulationState = {
    isPlaying,
    simulationTime,
    simulationSpeed,
    warmupTime,
    isWarmedUp,
    globalStats,
    movingEntities
  };

  const actions: SimulationActions = {
    play,
    pause,
    togglePlay,
    reset,
    setSpeed,
    setWarmupTime: handleSetWarmupTime
  };

  return [state, actions, simulator];
}
