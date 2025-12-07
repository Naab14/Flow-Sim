import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  Connection,
  Edge,
  Node,
  MiniMap,
  BackgroundVariant,
  MarkerType,
  useReactFlow,
  Position
} from 'reactflow';
import dagre from 'dagre';
import Sidebar from './components/Sidebar';
import RightSidebar from './components/RightSidebar';
import CustomNode from './components/CustomNode';
import AnalysisModal from './components/AnalysisModal';
import { INITIAL_NODES, INITIAL_EDGES, NODE_TYPES_CONFIG } from './constants';
import { AppNode, NodeType, SimulationResult, Entity, GlobalStats, HistoryPoint } from './types';
import { analyzeFlow } from './services/geminiService';
import { Simulator } from './engine/Simulator';
import { useTheme } from './contexts/ThemeContext';

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'LR') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 220, height: 120 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      targetPosition: isHorizontal ? Position.Left : Position.Top,
      sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
      position: {
        x: nodeWithPosition.x - 220 / 2,
        y: nodeWithPosition.y - 120 / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

const simulator = new Simulator();

const App: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(INITIAL_NODES);
  const [edges, setEdges, onEdgesChange] = useEdgesState(INITIAL_EDGES);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [selectedNode, setSelectedNode] = useState<AppNode | null>(null);
  
  // Simulation State
  const [isPlaying, setIsPlaying] = useState(false);
  const [simulationTime, setSimulationTime] = useState(0);
  const [simulationSpeed, setSimulationSpeed] = useState(5); // 1x, 2x, 5x, 10x
  const [warmupTime, setWarmupTime] = useState(0); // Warm-up period in seconds
  const [isWarmedUp, setIsWarmedUp] = useState(false);
  const [globalStats, setGlobalStats] = useState<GlobalStats & { history: HistoryPoint[] }>({
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
  });
  
  // Visual entities
  const [movingEntities, setMovingEntities] = useState<Entity[]>([]);

  // Analysis State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<SimulationResult | null>(null);

  const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);

  const onLayout = useCallback(() => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      nodes,
      edges
    );
    setNodes([...layoutedNodes]);
    setEdges([...layoutedEdges]);
  }, [nodes, edges, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ 
        ...params, 
        animated: true, 
        type: 'smoothstep', 
        style: { stroke: '#475569', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#475569' }
    }, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow') as NodeType;
      const label = event.dataTransfer.getData('application/reactflow-label');
      if (typeof type === 'undefined' || !type) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      
      const newNode: AppNode = {
        id: `node_${Date.now()}`,
        type: 'custom',
        position,
        data: {
          label: label,
          type: type,
          cycleTime: type === NodeType.PROCESS ? 10 : (type === NodeType.SOURCE ? 5 : 0),
          cycleTimeVariation: 0, // % variation (0 = deterministic, 10 = ±10%)
          defectRate: 0,
          batchSize: 1,
          capacity: type === NodeType.INVENTORY ? 10 : 1,
          stats: {
              totalProcessed: 0, busyTime: 0, blockedTime: 0, starvedTime: 0, utilization: 0, queueLength: 0, avgCycleTime: 0
          },
          status: 'idle',
          progress: 0
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node as AppNode);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const updateNodeData = useCallback((id: string, newData: any) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          const updatedNode = { ...node, data: newData };
          if (selectedNode?.id === id) {
             setSelectedNode(updatedNode as AppNode);
          }
          return updatedNode;
        }
        return node;
      })
    );
  }, [setNodes, selectedNode]);

  // Handle Export CSV - Enhanced with all KPI metrics
  const handleExport = () => {
     // Time series data
     const timeHeaders = "Time (s),Throughput (u/min),WIP,OEE (%)\n";
     const timeRows = simulator.history.map(row =>
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
     link.setAttribute("download", `leanflow_report_${new Date().toISOString().slice(0,10)}.csv`);
     document.body.appendChild(link);
     link.click();
     document.body.removeChild(link);
  };

  // Save current scenario (nodes, edges, settings) to JSON file
  const handleSaveScenario = () => {
    const scenario = {
      version: '1.0',
      name: `LeanFlow Scenario - ${new Date().toLocaleDateString()}`,
      createdAt: new Date().toISOString(),
      settings: {
        warmupTime,
        simulationSpeed
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
          capacity: n.data.capacity
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
    link.download = `leanflow_scenario_${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Load scenario from JSON file
  const handleLoadScenario = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const scenario = JSON.parse(e.target?.result as string);

        // Validate basic structure
        if (!scenario.nodes || !scenario.edges) {
          alert('Invalid scenario file: missing nodes or edges');
          return;
        }

        // Stop simulation and reset
        setIsPlaying(false);
        setSimulationTime(0);
        setIsWarmedUp(false);

        // Load settings if present
        if (scenario.settings) {
          if (scenario.settings.warmupTime !== undefined) {
            setWarmupTime(scenario.settings.warmupTime);
          }
          if (scenario.settings.simulationSpeed !== undefined) {
            setSimulationSpeed(scenario.settings.simulationSpeed);
          }
        }

        // Load nodes with default stats
        const loadedNodes = scenario.nodes.map((n: any) => ({
          ...n,
          data: {
            ...n.data,
            cycleTimeVariation: n.data.cycleTimeVariation || 0,
            stats: {
              totalProcessed: 0,
              busyTime: 0,
              blockedTime: 0,
              starvedTime: 0,
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

        setNodes(loadedNodes);
        setEdges(loadedEdges);
        setMovingEntities([]);
        setGlobalStats({
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
        });

        console.log(`Loaded scenario: ${scenario.name || 'Unknown'}`);
      } catch (error) {
        console.error('Failed to load scenario:', error);
        alert('Failed to load scenario file. Please check the file format.');
      }
    };
    reader.readAsText(file);
  };

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    setIsModalOpen(true);
    setAnalysisResult(null);
    try {
      const result = await analyzeFlow(nodes as AppNode[], edges);
      setAnalysisResult(result);
    } catch (error) {
      console.error(error);
      alert("Analysis failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
      setIsPlaying(false);
      setSimulationTime(0);
      setIsWarmedUp(false);
      simulator.initialize(nodes as AppNode[], edges);
      simulator.setWarmupTime(warmupTime); // Apply current warmup setting
      setMovingEntities([]);
      setGlobalStats({
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
      });
      setNodes(nds => nds.map(n => ({
          ...n,
          data: { ...n.data, status: 'idle', progress: 0, stats: { ...n.data.stats, queueLength: 0, utilization: 0, totalProcessed: 0 } }
      })));
  };

  // Main Simulation Loop
  useEffect(() => {
    if (!isPlaying) return;

    // Initialize only if fresh start
    if (simulationTime === 0) {
        simulator.initialize(nodes as AppNode[], edges);
        simulator.setWarmupTime(warmupTime); // Set warm-up period
    }

    let lastTime = performance.now();
    let frameId: number;

    const loop = (time: number) => {
        const dt = (time - lastTime) / 1000;
        lastTime = time;

        // Run simulation step with configurable speed
        // Manufacturing analogy: Fast-forward the production day to see results quicker
        const speedFactor = simulationSpeed; // User-controlled: 1x, 2x, 5x, 10x

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
  }, [isPlaying, edges, simulationSpeed, warmupTime]); // Re-run if speed or warmup changes

  // Render Moving Entities Overlay
  const renderEntities = () => {
    if (!reactFlowInstance) return null;
    
    return movingEntities.map(entity => {
        // entity.currentLocation is Edge ID "Source->Target"
        const [sourceId, targetId] = entity.currentLocation.split('->');
        const sourceNode = reactFlowInstance.getNode(sourceId);
        const targetNode = reactFlowInstance.getNode(targetId);
        
        if (!sourceNode || !targetNode) return null;

        const sx = sourceNode.position.x + 180; // Approximate right handle
        const sy = sourceNode.position.y + 40;
        const tx = targetNode.position.x; // Approximate left handle
        const ty = targetNode.position.y + 40;
        
        const x = sx + (tx - sx) * entity.progress;
        const y = sy + (ty - sy) * entity.progress;
        
        return (
            <div 
                key={entity.id}
                className="absolute w-3 h-3 bg-blue-400 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)] border border-white z-50 pointer-events-none transition-transform"
                style={{ 
                    transform: `translate(${x}px, ${y}px)`,
                    opacity: 0.9
                }}
            />
        );
    });
  };

  return (
    <div className={`flex h-screen w-screen overflow-hidden font-sans transition-colors duration-300 ${
      theme === 'light' ? 'bg-white' : 'bg-[#020617]'
    }`}>
      <ReactFlowProvider>
        {/* Left Sidebar */}
        <Sidebar
           simulationTime={simulationTime}
           isPlaying={isPlaying}
           onTogglePlay={() => setIsPlaying(!isPlaying)}
           onReset={handleReset}
           onLayout={onLayout}
           throughput={globalStats.throughput}
           wipItems={globalStats.wip}
           onExport={handleExport}
           simulationSpeed={simulationSpeed}
           onSpeedChange={setSimulationSpeed}
           warmupTime={warmupTime}
           onWarmupChange={setWarmupTime}
           isWarmedUp={isWarmedUp}
           onSaveScenario={handleSaveScenario}
           onLoadScenario={handleLoadScenario}
           theme={theme}
           onToggleTheme={toggleTheme}
        />
        
        {/* Center Canvas */}
        <div className="flex-1 h-full relative flex flex-col" ref={reactFlowWrapper}>
          <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
             {/* Entity Layer */}
             <div className="relative w-full h-full transform-gpu">
                 {/* Needs to transform with viewport. Simplification: Just render if not panning heavily. 
                     For true syncing, we'd use a CustomLayer in ReactFlow. 
                     Here we use absolute overlay but it won't pan with zoom correctly without `useViewport`.
                     Let's stick to Node status visualizations which are robust.
                     OR: Just render entities if using screenToFlow logic reverse.
                 */}
             </div>
          </div>

          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            fitView
            proOptions={{ hideAttribution: true }}
            minZoom={0.5}
            maxZoom={2}
          >
            <Controls className={`${theme === 'light'
              ? 'bg-white border border-slate-200 fill-slate-600'
              : 'bg-slate-800 border border-slate-700 fill-slate-300'
            }`} />
            <Background
              color={theme === 'light' ? '#e2e8f0' : '#1e293b'}
              gap={24}
              size={1}
              variant={BackgroundVariant.Dots}
            />
            <MiniMap
                className={`rounded-lg overflow-hidden ${theme === 'light'
                  ? '!bg-slate-50 !border-slate-200'
                  : '!bg-slate-900 !border-slate-800'
                }`}
                nodeColor={(n) => {
                    const t = n.data?.type;
                    if (t === NodeType.SOURCE) return '#3b82f6';
                    if (t === NodeType.PROCESS) return '#10b981';
                    if (t === NodeType.QUALITY) return '#a855f7';
                    if (t === NodeType.INVENTORY) return '#f59e0b';
                    return '#6366f1';
                }}
            />
          </ReactFlow>
        </div>

        {/* Right Sidebar */}
        <RightSidebar
           selectedNode={selectedNode}
           onChange={updateNodeData}
           onAnalyze={handleRunAnalysis}
           simulationData={globalStats}
           nodes={nodes as AppNode[]}
           simulationTime={simulationTime}
           warmupTime={warmupTime}
           isWarmedUp={isWarmedUp}
           theme={theme}
        />
      </ReactFlowProvider>

      <AnalysisModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        result={analysisResult}
        isLoading={isAnalyzing}
      />
    </div>
  );
};

export default App;
