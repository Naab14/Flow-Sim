import { useState, useCallback } from 'react';
import { Edge } from 'reactflow';
import { AppNode, SimulationResult } from '../types';
import { analyzeFlow } from '../services/geminiService';

export interface AnalysisState {
  isModalOpen: boolean;
  isAnalyzing: boolean;
  analysisResult: SimulationResult | null;
}

export interface AnalysisActions {
  runAnalysis: (nodes: AppNode[], edges: Edge[]) => Promise<void>;
  closeModal: () => void;
  openModal: () => void;
}

export function useAnalysis(
  onError?: (message: string) => void
): [AnalysisState, AnalysisActions] {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<SimulationResult | null>(null);

  const runAnalysis = useCallback(async (nodes: AppNode[], edges: Edge[]) => {
    setIsAnalyzing(true);
    setIsModalOpen(true);
    setAnalysisResult(null);
    try {
      const result = await analyzeFlow(nodes, edges);
      setAnalysisResult(result);
    } catch (error) {
      console.error(error);
      if (onError) {
        onError('Analysis failed. Please try again.');
      }
    } finally {
      setIsAnalyzing(false);
    }
  }, [onError]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const openModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const state: AnalysisState = {
    isModalOpen,
    isAnalyzing,
    analysisResult
  };

  const actions: AnalysisActions = {
    runAnalysis,
    closeModal,
    openModal
  };

  return [state, actions];
}
