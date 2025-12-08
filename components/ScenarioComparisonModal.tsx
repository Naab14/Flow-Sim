import React, { useState, useCallback } from 'react';
import { X, Upload, BarChart3, ArrowRight, Layers, Clock, Zap, AlertTriangle, CheckCircle } from 'lucide-react';
import { NodeType } from '../types';

interface ScenarioData {
  name: string;
  createdAt?: string;
  settings: {
    warmupTime: number;
    simulationSpeed: number;
  };
  nodes: Array<{
    id: string;
    data: {
      label: string;
      type: NodeType;
      cycleTime: number;
      cycleTimeVariation?: number;
      defectRate: number;
      batchSize: number;
      capacity: number;
    };
  }>;
  edges: Array<{
    source: string;
    target: string;
  }>;
}

interface ComparisonMetrics {
  nodeCount: number;
  processNodes: number;
  totalCycleTime: number;
  avgCycleTime: number;
  avgDefectRate: number;
  avgVariation: number;
  totalCapacity: number;
  edgeCount: number;
  theoreticalThroughput: number; // Based on bottleneck
}

interface ScenarioComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ScenarioComparisonModal: React.FC<ScenarioComparisonModalProps> = ({ isOpen, onClose }) => {
  const [scenarioA, setScenarioA] = useState<ScenarioData | null>(null);
  const [scenarioB, setScenarioB] = useState<ScenarioData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const calculateMetrics = (scenario: ScenarioData): ComparisonMetrics => {
    const processNodes = scenario.nodes.filter(n => n.data.type === NodeType.PROCESS);
    const sourceNodes = scenario.nodes.filter(n => n.data.type === NodeType.SOURCE);

    const totalCycleTime = processNodes.reduce((sum, n) => sum + (n.data.cycleTime || 0), 0);
    const avgCycleTime = processNodes.length > 0 ? totalCycleTime / processNodes.length : 0;
    const avgDefectRate = processNodes.length > 0
      ? processNodes.reduce((sum, n) => sum + (n.data.defectRate || 0), 0) / processNodes.length
      : 0;
    const avgVariation = processNodes.length > 0
      ? processNodes.reduce((sum, n) => sum + (n.data.cycleTimeVariation || 0), 0) / processNodes.length
      : 0;
    const totalCapacity = scenario.nodes
      .filter(n => n.data.type === NodeType.INVENTORY)
      .reduce((sum, n) => sum + (n.data.capacity || 0), 0);

    // Find bottleneck (longest cycle time) to estimate theoretical throughput
    const bottleneckCycleTime = Math.max(...processNodes.map(n => n.data.cycleTime || 0), 1);
    const sourceRate = sourceNodes.length > 0 ? sourceNodes[0].data.cycleTime || 5 : 5;
    const theoreticalThroughput = 3600 / Math.max(bottleneckCycleTime, sourceRate);

    return {
      nodeCount: scenario.nodes.length,
      processNodes: processNodes.length,
      totalCycleTime,
      avgCycleTime,
      avgDefectRate,
      avgVariation,
      totalCapacity,
      edgeCount: scenario.edges.length,
      theoreticalThroughput
    };
  };

  const handleFileLoad = useCallback((file: File, setScenario: (s: ScenarioData) => void) => {
    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (!data.nodes || !data.edges) {
          setError('Invalid scenario file: missing nodes or edges');
          return;
        }
        setScenario(data);
      } catch (err) {
        setError('Failed to parse scenario file');
      }
    };
    reader.readAsText(file);
  }, []);

  const handleDropA = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileLoad(file, setScenarioA);
  }, [handleFileLoad]);

  const handleDropB = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileLoad(file, setScenarioB);
  }, [handleFileLoad]);

  const renderDropZone = (
    label: string,
    scenario: ScenarioData | null,
    setScenario: (s: ScenarioData) => void,
    onDrop: (e: React.DragEvent) => void
  ) => (
    <div
      onDrop={onDrop}
      onDragOver={(e) => e.preventDefault()}
      className="flex-1 p-4 rounded-xl border-2 border-dashed transition-colors"
      style={{
        borderColor: scenario ? 'var(--accent-primary)' : 'var(--border-secondary)',
        backgroundColor: scenario ? 'var(--bg-hover)' : 'var(--bg-tertiary)'
      }}
    >
      {scenario ? (
        <div className="text-center">
          <CheckCircle size={24} className="mx-auto mb-2" style={{ color: 'var(--accent-primary)' }} />
          <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
            {scenario.name || label}
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            {scenario.nodes.length} nodes, {scenario.edges.length} edges
          </p>
          <button
            onClick={() => setScenario(null as any)}
            className="mt-2 text-xs px-2 py-1 rounded"
            style={{ color: 'var(--text-muted)' }}
          >
            Remove
          </button>
        </div>
      ) : (
        <label className="cursor-pointer block text-center">
          <Upload size={24} className="mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{label}</p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            Drop JSON or click to browse
          </p>
          <input
            type="file"
            accept=".json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileLoad(file, setScenario);
            }}
          />
        </label>
      )}
    </div>
  );

  const renderMetricRow = (
    label: string,
    icon: React.ReactNode,
    valueA: number | string,
    valueB: number | string,
    format: (v: number | string) => string = (v) => String(v),
    higherIsBetter: boolean = true
  ) => {
    const numA = typeof valueA === 'number' ? valueA : parseFloat(valueA) || 0;
    const numB = typeof valueB === 'number' ? valueB : parseFloat(valueB) || 0;
    const diff = numB - numA;
    const pctDiff = numA !== 0 ? ((diff / numA) * 100) : 0;

    const isBetter = higherIsBetter ? diff > 0 : diff < 0;
    const isWorse = higherIsBetter ? diff < 0 : diff > 0;

    return (
      <div
        className="flex items-center py-3 border-b"
        style={{ borderColor: 'var(--border-primary)' }}
      >
        <div className="w-1/4 flex items-center gap-2">
          {icon}
          <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{label}</span>
        </div>
        <div className="w-1/4 text-center text-sm" style={{ color: 'var(--text-primary)' }}>
          {format(valueA)}
        </div>
        <div className="w-1/4 text-center text-sm" style={{ color: 'var(--text-primary)' }}>
          {format(valueB)}
        </div>
        <div className="w-1/4 text-center">
          {diff !== 0 && (
            <span
              className="text-xs font-medium px-2 py-1 rounded"
              style={{
                backgroundColor: isBetter ? 'rgba(16, 185, 129, 0.1)' : isWorse ? 'rgba(239, 68, 68, 0.1)' : 'var(--bg-hover)',
                color: isBetter ? '#10b981' : isWorse ? '#ef4444' : 'var(--text-muted)'
              }}
            >
              {diff > 0 ? '+' : ''}{pctDiff.toFixed(1)}%
            </span>
          )}
          {diff === 0 && (
            <span className="text-xs" style={{ color: 'var(--text-dimmed)' }}>—</span>
          )}
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  const metricsA = scenarioA ? calculateMetrics(scenarioA) : null;
  const metricsB = scenarioB ? calculateMetrics(scenarioB) : null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        className="w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden animate-slide-up"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-primary)',
          maxHeight: '90vh'
        }}
      >
        {/* Header */}
        <div
          className="px-6 py-4 flex items-center justify-between"
          style={{
            borderBottom: '1px solid var(--border-primary)',
            backgroundColor: 'var(--bg-tertiary)'
          }}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <BarChart3 size={20} style={{ color: 'var(--accent-primary)' }} />
            </div>
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              Scenario Comparison
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors hover:opacity-80"
            style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-muted)' }}
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 80px)' }}>
          {/* Error message */}
          {error && (
            <div
              className="mb-4 p-3 rounded-lg flex items-center gap-2"
              style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}
            >
              <AlertTriangle size={16} />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Drop zones */}
          <div className="flex gap-4 mb-6">
            {renderDropZone('Scenario A (Baseline)', scenarioA, setScenarioA, handleDropA)}
            <div className="flex items-center">
              <ArrowRight size={20} style={{ color: 'var(--text-dimmed)' }} />
            </div>
            {renderDropZone('Scenario B (Comparison)', scenarioB, setScenarioB, handleDropB)}
          </div>

          {/* Comparison table */}
          {metricsA && metricsB && (
            <div
              className="rounded-xl overflow-hidden"
              style={{
                backgroundColor: 'var(--bg-tertiary)',
                border: '1px solid var(--border-primary)'
              }}
            >
              {/* Table header */}
              <div
                className="flex py-3 px-4"
                style={{
                  backgroundColor: 'var(--bg-hover)',
                  borderBottom: '1px solid var(--border-primary)'
                }}
              >
                <div className="w-1/4 text-xs font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>
                  Metric
                </div>
                <div className="w-1/4 text-center text-xs font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>
                  Scenario A
                </div>
                <div className="w-1/4 text-center text-xs font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>
                  Scenario B
                </div>
                <div className="w-1/4 text-center text-xs font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>
                  Difference
                </div>
              </div>

              {/* Metrics */}
              <div className="px-4">
                {renderMetricRow(
                  'Process Nodes',
                  <Layers size={14} style={{ color: 'var(--text-muted)' }} />,
                  metricsA.processNodes,
                  metricsB.processNodes,
                  (v) => String(v),
                  false
                )}
                {renderMetricRow(
                  'Total Cycle Time',
                  <Clock size={14} style={{ color: 'var(--text-muted)' }} />,
                  metricsA.totalCycleTime,
                  metricsB.totalCycleTime,
                  (v) => `${Number(v).toFixed(1)}s`,
                  false
                )}
                {renderMetricRow(
                  'Avg Cycle Time',
                  <Clock size={14} style={{ color: 'var(--text-muted)' }} />,
                  metricsA.avgCycleTime,
                  metricsB.avgCycleTime,
                  (v) => `${Number(v).toFixed(1)}s`,
                  false
                )}
                {renderMetricRow(
                  'Avg Defect Rate',
                  <AlertTriangle size={14} style={{ color: 'var(--text-muted)' }} />,
                  metricsA.avgDefectRate,
                  metricsB.avgDefectRate,
                  (v) => `${Number(v).toFixed(1)}%`,
                  false
                )}
                {renderMetricRow(
                  'Avg Variability',
                  <Zap size={14} style={{ color: 'var(--text-muted)' }} />,
                  metricsA.avgVariation,
                  metricsB.avgVariation,
                  (v) => `±${Number(v).toFixed(1)}%`,
                  false
                )}
                {renderMetricRow(
                  'Buffer Capacity',
                  <Layers size={14} style={{ color: 'var(--text-muted)' }} />,
                  metricsA.totalCapacity,
                  metricsB.totalCapacity,
                  (v) => `${v} units`,
                  true
                )}
                {renderMetricRow(
                  'Max Throughput',
                  <Zap size={14} style={{ color: 'var(--accent-primary)' }} />,
                  metricsA.theoreticalThroughput,
                  metricsB.theoreticalThroughput,
                  (v) => `${Number(v).toFixed(0)} u/hr`,
                  true
                )}
              </div>
            </div>
          )}

          {/* Instructions when no scenarios loaded */}
          {(!scenarioA || !scenarioB) && (
            <div
              className="text-center py-8 rounded-xl"
              style={{ backgroundColor: 'var(--bg-tertiary)' }}
            >
              <BarChart3 size={32} className="mx-auto mb-3" style={{ color: 'var(--text-dimmed)' }} />
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Load two scenarios to compare their configurations
              </p>
              <p className="text-xs mt-2" style={{ color: 'var(--text-dimmed)' }}>
                Drag and drop .json scenario files or click to browse
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScenarioComparisonModal;
