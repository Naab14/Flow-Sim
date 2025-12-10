import { useMemo } from 'react';
import { Node, Edge } from 'reactflow';
import { AppNode, NodeType } from '../types';

export interface ValidationWarning {
  id: string;
  type: 'error' | 'warning' | 'info';
  title: string;
  message: string;
  nodeId?: string;
}

export interface ValidationResult {
  isValid: boolean;
  canSimulate: boolean;
  warnings: ValidationWarning[];
  errors: ValidationWarning[];
  info: ValidationWarning[];
}

export function useValidation(nodes: Node[], edges: Edge[]): ValidationResult {
  return useMemo(() => {
    const warnings: ValidationWarning[] = [];
    const errors: ValidationWarning[] = [];
    const info: ValidationWarning[] = [];

    // Check for disconnected nodes
    const connectedNodeIds = new Set<string>();
    edges.forEach(edge => {
      connectedNodeIds.add(edge.source);
      connectedNodeIds.add(edge.target);
    });

    nodes.forEach(node => {
      if (!connectedNodeIds.has(node.id)) {
        warnings.push({
          id: `disconnected-${node.id}`,
          type: 'warning',
          title: 'Disconnected Node',
          message: `"${node.data.label}" is not connected to the flow.`,
          nodeId: node.id
        });
      }
    });

    // Check for missing source node
    const sourceNodes = nodes.filter(n => n.data.type === NodeType.SOURCE);
    if (sourceNodes.length === 0) {
      errors.push({
        id: 'no-source',
        type: 'error',
        title: 'No Source Node',
        message: 'Add a Source node to generate entities for the simulation.'
      });
    }

    // Check for missing sink/shipping node
    const sinkNodes = nodes.filter(n => n.data.type === NodeType.SHIPPING);
    if (sinkNodes.length === 0) {
      warnings.push({
        id: 'no-sink',
        type: 'warning',
        title: 'No Shipping Node',
        message: 'Consider adding a Shipping node to collect completed items.'
      });
    }

    // Check for nodes with no outgoing edges (dead ends) that aren't shipping
    nodes.forEach(node => {
      if (node.data.type === NodeType.SHIPPING) return;
      const hasOutgoing = edges.some(e => e.source === node.id);
      if (!hasOutgoing && connectedNodeIds.has(node.id)) {
        warnings.push({
          id: `dead-end-${node.id}`,
          type: 'warning',
          title: 'Dead End',
          message: `"${node.data.label}" has no outgoing connections.`,
          nodeId: node.id
        });
      }
    });

    // Check for nodes with no incoming edges (orphans) that aren't sources
    nodes.forEach(node => {
      if (node.data.type === NodeType.SOURCE) return;
      const hasIncoming = edges.some(e => e.target === node.id);
      if (!hasIncoming && connectedNodeIds.has(node.id)) {
        warnings.push({
          id: `orphan-${node.id}`,
          type: 'warning',
          title: 'No Input',
          message: `"${node.data.label}" has no incoming connections.`,
          nodeId: node.id
        });
      }
    });

    // Check for potential cycles (basic check)
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    let hasCycle = false;

    const detectCycle = (nodeId: string): boolean => {
      if (recursionStack.has(nodeId)) return true;
      if (visited.has(nodeId)) return false;

      visited.add(nodeId);
      recursionStack.add(nodeId);

      const outEdges = edges.filter(e => e.source === nodeId);
      for (const edge of outEdges) {
        if (detectCycle(edge.target)) {
          return true;
        }
      }

      recursionStack.delete(nodeId);
      return false;
    };

    sourceNodes.forEach(source => {
      if (detectCycle(source.id)) {
        hasCycle = true;
      }
    });

    if (hasCycle) {
      info.push({
        id: 'cycle-detected',
        type: 'info',
        title: 'Cycle Detected',
        message: 'Flow contains a cycle (rework loop). This is valid for quality/rework scenarios.'
      });
    }

    // Check for zero cycle time on process nodes
    nodes.forEach(node => {
      const appNode = node as AppNode;
      if (appNode.data.type === NodeType.PROCESS || appNode.data.type === NodeType.QUALITY) {
        if (appNode.data.cycleTime <= 0) {
          warnings.push({
            id: `zero-cycle-${node.id}`,
            type: 'warning',
            title: 'Zero Cycle Time',
            message: `"${appNode.data.label}" has zero cycle time. This may cause issues.`,
            nodeId: node.id
          });
        }
      }
    });

    // Check for very high defect rates
    nodes.forEach(node => {
      const appNode = node as AppNode;
      if (appNode.data.defectRate > 50) {
        info.push({
          id: `high-defect-${node.id}`,
          type: 'info',
          title: 'High Defect Rate',
          message: `"${appNode.data.label}" has ${appNode.data.defectRate}% defect rate.`,
          nodeId: node.id
        });
      }
    });

    // Check for bottleneck potential (source faster than slowest process)
    if (sourceNodes.length > 0) {
      const sourceCycleTime = Math.min(...sourceNodes.map(s => (s as AppNode).data.cycleTime));
      const processNodes = nodes.filter(n =>
        n.data.type === NodeType.PROCESS || n.data.type === NodeType.QUALITY
      );
      if (processNodes.length > 0) {
        const slowestProcess = Math.max(...processNodes.map(p => {
          const appNode = p as AppNode;
          return appNode.data.cycleTime / (appNode.data.capacity || 1);
        }));
        if (sourceCycleTime < slowestProcess * 0.8) {
          info.push({
            id: 'bottleneck-warning',
            type: 'info',
            title: 'Potential Bottleneck',
            message: `Input rate (${sourceCycleTime}s) is faster than slowest process (${slowestProcess.toFixed(1)}s effective). Expect WIP buildup.`
          });
        }
      }
    }

    const isValid = errors.length === 0;
    const canSimulate = errors.length === 0 && nodes.length > 0;

    return {
      isValid,
      canSimulate,
      warnings,
      errors,
      info
    };
  }, [nodes, edges]);
}
