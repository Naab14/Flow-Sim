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
  BackgroundVariant
} from 'reactflow';
import Sidebar from './components/Sidebar';
import RightSidebar from './components/RightSidebar';
import CustomNode from './components/CustomNode';
import AnalysisModal from './components/AnalysisModal';
import { INITIAL_NODES, INITIAL_EDGES, NODE_TYPES_CONFIG } from './constants';
import { AppNode, NodeType, SimulationResult } from './types';
import { analyzeFlow } from './services/geminiService';

const App: React.FC = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(INITIAL_NODES);
  const [edges, setEdges, onEdgesChange] = useEdgesState(INITIAL_EDGES);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [selectedNode, setSelectedNode] = useState<AppNode | null>(null);
  
  // Simulation State
  const [isPlaying, setIsPlaying] = useState(false);
  const [simulationTime, setSimulationTime] = useState(0);
  const [processedCount, setProcessedCount] = useState(0);
  
  // Analysis State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<SimulationResult | null>(null);

  const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true, type: 'smoothstep', style: { stroke: '#475569', strokeWidth: 2 } }, eds)),
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

      if (typeof type === 'undefined' || !type) {
        return;
      }

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
          cycleTime: type === NodeType.PROCESS ? 30 : 0, 
          defectRate: 0,
          batchSize: 1,
          capacity: 0,
          inventory: 0,
          processed: 0,
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

  // Simulation Logic Tick
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setSimulationTime(t => t + 1);
        
        setNodes(currentNodes => {
           return currentNodes.map(node => {
              // Simple simulation logic for visualization
              if (node.data.type === NodeType.SOURCE) {
                  // Source always generates if inv < 1000
                  return { ...node, data: { ...node.data, inventory: Math.max(0, node.data.inventory - 1), processed: node.data.processed + 1 } };
              } 
              
              if (node.data.type === NodeType.PROCESS || node.data.type === NodeType.QUALITY) {
                 // Process logic
                 let newProgress = node.data.progress + (100 / (node.data.cycleTime || 10)); // approximate tick
                 let newProcessed = node.data.processed;
                 let newInv = node.data.inventory;
                 
                 // Randomly receive inventory from "upstream" (simulated by random chance for visual effect since we aren't traversing graph every tick)
                 if (Math.random() > 0.8) newInv += 1;

                 if (newProgress >= 100 && newInv > 0) {
                    newProgress = 0;
                    newInv -= 1;
                    newProcessed += 1;
                 } else if (newInv === 0) {
                    newProgress = 0; // Starved
                 }

                 return { 
                    ...node, 
                    data: { 
                       ...node.data, 
                       progress: Math.min(newProgress, 100), 
                       inventory: newInv,
                       processed: newProcessed,
                       status: newInv > 0 ? 'active' : 'starved'
                    } 
                 };
              }

              if (node.data.type === NodeType.INVENTORY) {
                  if (Math.random() > 0.5) return { ...node, data: { ...node.data, inventory: node.data.inventory + 1 }};
              }

              return node;
           });
        });
        
        // Update global processed count mostly for effect
        setProcessedCount(c => c + (Math.random() > 0.7 ? 1 : 0));

      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, setNodes]);

  const handleReset = () => {
    setIsPlaying(false);
    setSimulationTime(0);
    setProcessedCount(0);
    setNodes(nds => nds.map(n => ({
       ...n,
       data: { ...n.data, inventory: n.data.type === NodeType.SOURCE ? 1000 : 0, processed: 0, progress: 0, status: 'idle' }
    })));
  };

  return (
    <div className="flex h-screen w-screen bg-[#020617] overflow-hidden font-sans">
      <ReactFlowProvider>
        {/* Left Sidebar */}
        <Sidebar 
           simulationTime={simulationTime} 
           isPlaying={isPlaying} 
           onTogglePlay={() => setIsPlaying(!isPlaying)}
           onReset={handleReset}
           throughput={simulationTime > 0 ? (processedCount / simulationTime) * 60 : 0}
           wipItems={nodes.reduce((acc, n) => acc + (n.data.inventory || 0), 0)}
        />
        
        {/* Center Canvas */}
        <div className="flex-1 h-full relative" ref={reactFlowWrapper}>
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
            <Controls className="bg-slate-800 border border-slate-700 fill-slate-300" />
            <Background color="#1e293b" gap={24} size={1} variant={BackgroundVariant.Dots} />
            <MiniMap 
                className="!bg-slate-900 !border-slate-800 rounded-lg overflow-hidden"
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