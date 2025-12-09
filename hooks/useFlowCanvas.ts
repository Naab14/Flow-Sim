import { useState, useCallback, useRef } from 'react';
import {
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Node,
  Edge,
  MarkerType,
  Position
} from 'reactflow';
import dagre from 'dagre';
import { AppNode, NodeType } from '../types';
import { INITIAL_NODES, INITIAL_EDGES } from '../constants';

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

export interface FlowCanvasState {
  nodes: Node[];
  edges: Edge[];
  selectedNode: AppNode | null;
  reactFlowInstance: any;
  clipboardNode: AppNode | null;
}

export interface FlowCanvasActions {
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  onNodesChange: (changes: any) => void;
  onEdgesChange: (changes: any) => void;
  onConnect: (params: Connection) => void;
  onDragOver: (event: React.DragEvent) => void;
  onDrop: (event: React.DragEvent) => void;
  onNodeClick: (event: React.MouseEvent, node: Node) => void;
  onPaneClick: () => void;
  onLayout: () => void;
  setReactFlowInstance: (instance: any) => void;
  updateNodeData: (id: string, newData: any) => void;
  deleteNode: () => void;
  duplicateNode: () => void;
  copyNode: () => void;
  pasteNode: () => void;
  setSelectedNode: (node: AppNode | null) => void;
  loadScenario: (nodes: Node[], edges: Edge[]) => void;
}

export function useFlowCanvas(): [FlowCanvasState, FlowCanvasActions] {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(INITIAL_NODES);
  const [edges, setEdges, onEdgesChange] = useEdgesState(INITIAL_EDGES);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [selectedNode, setSelectedNode] = useState<AppNode | null>(null);
  const [clipboardNode, setClipboardNode] = useState<AppNode | null>(null);

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
          cycleTimeVariation: 0,
          defectRate: 0,
          batchSize: 1,
          capacity: type === NodeType.INVENTORY ? 10 : 1,
          stats: {
            totalProcessed: 0, busyTime: 0, blockedTime: 0, starvedTime: 0, breakTime: 0, utilization: 0, queueLength: 0, avgCycleTime: 0
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

  // Delete selected node
  const deleteNode = useCallback(() => {
    if (selectedNode) {
      setNodes(nds => nds.filter(n => n.id !== selectedNode.id));
      setEdges(eds => eds.filter(e => e.source !== selectedNode.id && e.target !== selectedNode.id));
      setSelectedNode(null);
    }
  }, [selectedNode, setNodes, setEdges]);

  // Duplicate selected node
  const duplicateNode = useCallback(() => {
    if (selectedNode) {
      const newNode: AppNode = {
        id: `node_${Date.now()}`,
        type: 'custom',
        position: {
          x: selectedNode.position.x + 50,
          y: selectedNode.position.y + 50
        },
        data: {
          ...selectedNode.data,
          label: `${selectedNode.data.label} (copy)`,
          stats: {
            totalProcessed: 0, busyTime: 0, blockedTime: 0, starvedTime: 0, breakTime: 0, utilization: 0, queueLength: 0, avgCycleTime: 0
          },
          status: 'idle',
          progress: 0
        },
      };
      setNodes(nds => nds.concat(newNode));
      setSelectedNode(newNode);
    }
  }, [selectedNode, setNodes]);

  // Copy selected node to clipboard
  const copyNode = useCallback(() => {
    if (selectedNode) {
      setClipboardNode(selectedNode);
    }
  }, [selectedNode]);

  // Paste node from clipboard
  const pasteNode = useCallback(() => {
    if (clipboardNode) {
      const newNode: AppNode = {
        id: `node_${Date.now()}`,
        type: 'custom',
        position: {
          x: clipboardNode.position.x + 100,
          y: clipboardNode.position.y + 50
        },
        data: {
          ...clipboardNode.data,
          label: `${clipboardNode.data.label} (copy)`,
          stats: {
            totalProcessed: 0, busyTime: 0, blockedTime: 0, starvedTime: 0, breakTime: 0, utilization: 0, queueLength: 0, avgCycleTime: 0
          },
          status: 'idle',
          progress: 0
        },
      };
      setNodes(nds => nds.concat(newNode));
      setSelectedNode(newNode);
    }
  }, [clipboardNode, setNodes]);

  // Load scenario (nodes and edges from JSON)
  const loadScenario = useCallback((newNodes: Node[], newEdges: Edge[]) => {
    setNodes(newNodes);
    setEdges(newEdges);
    setSelectedNode(null);
  }, [setNodes, setEdges]);

  const state: FlowCanvasState = {
    nodes,
    edges,
    selectedNode,
    reactFlowInstance,
    clipboardNode
  };

  const actions: FlowCanvasActions = {
    setNodes,
    setEdges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onDragOver,
    onDrop,
    onNodeClick,
    onPaneClick,
    onLayout,
    setReactFlowInstance,
    updateNodeData,
    deleteNode,
    duplicateNode,
    copyNode,
    pasteNode,
    setSelectedNode,
    loadScenario
  };

  return [state, actions];
}
