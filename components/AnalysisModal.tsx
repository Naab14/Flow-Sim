import React from 'react';
import { SimulationResult } from '../types';
import { X, TrendingUp, AlertTriangle, CheckCircle, Lightbulb } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface AnalysisModalProps {
  result: SimulationResult | null;
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
}

const AnalysisModal: React.FC<AnalysisModalProps> = ({ result, isOpen, onClose, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0f172a] rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-slate-800">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900">
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <TrendingUp className="text-blue-500" />
            Process Analysis Report
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-full transition-colors">
            <X size={24} className="text-slate-500" />
          </button>
        </div>

        <div className="overflow-y-auto p-6 bg-[#020617]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-slate-300 font-medium">Gemini is analyzing your production line...</p>
              <p className="text-slate-500 text-sm">Identifying bottlenecks and calculating throughput.</p>
            </div>
          ) : result ? (
            <div className="space-y-6">
              {/* Executive Summary */}
              <div className="bg-slate-800/50 p-6 rounded-lg shadow-sm border border-slate-700">
                <h3 className="text-lg font-semibold text-slate-100 mb-3">Executive Summary</h3>
                <p className="text-slate-300 leading-relaxed">{result.analysisText}</p>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-800/50 p-5 rounded-lg shadow-sm border border-slate-700 border-l-4 border-l-red-500">
                  <div className="text-slate-400 text-sm font-medium mb-1">Max Throughput</div>
                  <div className="text-3xl font-bold text-slate-100">{result.maxThroughput.toFixed(1)} <span className="text-sm font-normal text-slate-500">units/hr</span></div>
                  <div className="mt-2 text-xs text-slate-500">Limited by bottleneck</div>
                </div>
                <div className="bg-slate-800/50 p-5 rounded-lg shadow-sm border border-slate-700 border-l-4 border-l-amber-500">
                   <div className="text-slate-400 text-sm font-medium mb-1">Total Cycle Time</div>
                   <div className="text-3xl font-bold text-slate-100">{result.totalCycleTime.toFixed(1)} <span className="text-sm font-normal text-slate-500">sec</span></div>
                   <div className="mt-2 text-xs text-slate-500">Critical path length</div>
                </div>
                <div className="bg-slate-800/50 p-5 rounded-lg shadow-sm border border-slate-700 border-l-4 border-l-green-500">
                   <div className="text-slate-400 text-sm font-medium mb-1">First Pass Yield</div>
                   <div className="text-3xl font-bold text-slate-100">{result.yield.toFixed(1)}%</div>
                   <div className="mt-2 text-xs text-slate-500">Predicted quality output</div>
                </div>
              </div>

              {/* Suggestions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="bg-slate-800/50 p-6 rounded-lg shadow-sm border border-slate-700">
                    <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
                       <Lightbulb className="text-amber-500" size={20} />
                       AI Improvement Suggestions
                    </h3>
                    <ul className="space-y-3">
                       {result.suggestions.map((s, i) => (
                          <li key={i} className="flex gap-3 items-start">
                             <div className="mt-1 min-w-[20px] h-5 w-5 bg-blue-900 text-blue-300 rounded-full flex items-center justify-center text-xs font-bold">
                                {i + 1}
                             </div>
                             <p className="text-slate-300 text-sm">{s}</p>
                          </li>
                       ))}
                    </ul>
                 </div>
                 
                 {/* Chart Placeholder */}
                 <div className="bg-slate-800/50 p-6 rounded-lg shadow-sm border border-slate-700 flex flex-col">
                    <h3 className="text-lg font-semibold text-slate-100 mb-4">Throughput Efficiency</h3>
                    <div className="flex-1 min-h-[200px]">
                       <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={[
                             { name: 'Current', value: result.maxThroughput },
                             { name: 'Target (+20%)', value: result.maxThroughput * 1.2 }
                          ]}>
                             <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                             <XAxis dataKey="name" tick={{fontSize: 12, fill: '#94a3b8'}} />
                             <YAxis tick={{fontSize: 12, fill: '#94a3b8'}} />
                             <Tooltip 
                                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }}
                                itemStyle={{ color: '#f1f5f9' }}
                             />
                             <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                {
                                   [{name: 'Current'}, {name: 'Target'}].map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={index === 0 ? '#475569' : '#3b82f6'} />
                                   ))
                                }
                             </Bar>
                          </BarChart>
                       </ResponsiveContainer>
                    </div>
                 </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-20 text-slate-500">
               No analysis data available. Run the simulation to see results.
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-slate-800 bg-slate-900 flex justify-end">
           <button 
             onClick={onClose}
             className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors font-medium border border-slate-700"
           >
             Close Report
           </button>
        </div>
      </div>
    </div>
  );
};

export default AnalysisModal;