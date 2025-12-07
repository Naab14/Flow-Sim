import React from 'react';
import { SimulationResult } from '../types';
import { X, TrendingUp, AlertTriangle, CheckCircle, Lightbulb } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useTheme } from '../contexts/ThemeContext';

interface AnalysisModalProps {
  result: SimulationResult | null;
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
}

const AnalysisModal: React.FC<AnalysisModalProps> = ({ result, isOpen, onClose, isLoading }) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border ${
        isLight ? 'bg-white border-slate-200' : 'bg-[#0f172a] border-slate-800'
      }`}>
        <div className={`p-4 border-b flex justify-between items-center ${
          isLight ? 'border-slate-200 bg-slate-50' : 'border-slate-800 bg-slate-900'
        }`}>
          <h2 className={`text-xl font-bold flex items-center gap-2 ${isLight ? 'text-slate-800' : 'text-slate-100'}`}>
            <TrendingUp className="text-blue-500" />
            Process Analysis Report
          </h2>
          <button onClick={onClose} className={`p-1 rounded-full transition-colors ${
            isLight ? 'hover:bg-slate-200' : 'hover:bg-slate-800'
          }`}>
            <X size={24} className="text-slate-500" />
          </button>
        </div>

        <div className={`overflow-y-auto p-6 ${isLight ? 'bg-slate-50' : 'bg-[#020617]'}`}>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
              <p className={`font-medium ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>Gemini is analyzing your production line...</p>
              <p className={`text-sm ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>Identifying bottlenecks and calculating throughput.</p>
            </div>
          ) : result ? (
            <div className="space-y-6">
              {/* Executive Summary */}
              <div className={`p-6 rounded-lg shadow-sm border ${
                isLight ? 'bg-white border-slate-200' : 'bg-slate-800/50 border-slate-700'
              }`}>
                <h3 className={`text-lg font-semibold mb-3 ${isLight ? 'text-slate-800' : 'text-slate-100'}`}>Executive Summary</h3>
                <p className={`leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>{result.analysisText}</p>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`p-5 rounded-lg shadow-sm border border-l-4 border-l-red-500 ${
                  isLight ? 'bg-white border-slate-200' : 'bg-slate-800/50 border-slate-700'
                }`}>
                  <div className={`text-sm font-medium mb-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Max Throughput</div>
                  <div className={`text-3xl font-bold ${isLight ? 'text-slate-800' : 'text-slate-100'}`}>{result.maxThroughput.toFixed(1)} <span className={`text-sm font-normal ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>units/hr</span></div>
                  <div className={`mt-2 text-xs ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>Limited by bottleneck</div>
                </div>
                <div className={`p-5 rounded-lg shadow-sm border border-l-4 border-l-amber-500 ${
                  isLight ? 'bg-white border-slate-200' : 'bg-slate-800/50 border-slate-700'
                }`}>
                   <div className={`text-sm font-medium mb-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Total Cycle Time</div>
                   <div className={`text-3xl font-bold ${isLight ? 'text-slate-800' : 'text-slate-100'}`}>{result.totalCycleTime.toFixed(1)} <span className={`text-sm font-normal ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>sec</span></div>
                   <div className={`mt-2 text-xs ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>Critical path length</div>
                </div>
                <div className={`p-5 rounded-lg shadow-sm border border-l-4 border-l-green-500 ${
                  isLight ? 'bg-white border-slate-200' : 'bg-slate-800/50 border-slate-700'
                }`}>
                   <div className={`text-sm font-medium mb-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>First Pass Yield</div>
                   <div className={`text-3xl font-bold ${isLight ? 'text-slate-800' : 'text-slate-100'}`}>{result.yield.toFixed(1)}%</div>
                   <div className={`mt-2 text-xs ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>Predicted quality output</div>
                </div>
              </div>

              {/* Suggestions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className={`p-6 rounded-lg shadow-sm border ${
                   isLight ? 'bg-white border-slate-200' : 'bg-slate-800/50 border-slate-700'
                 }`}>
                    <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isLight ? 'text-slate-800' : 'text-slate-100'}`}>
                       <Lightbulb className="text-amber-500" size={20} />
                       AI Improvement Suggestions
                    </h3>
                    <ul className="space-y-3">
                       {result.suggestions.map((s, i) => (
                          <li key={i} className="flex gap-3 items-start">
                             <div className={`mt-1 min-w-[20px] h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold ${
                               isLight ? 'bg-blue-100 text-blue-600' : 'bg-blue-900 text-blue-300'
                             }`}>
                                {i + 1}
                             </div>
                             <p className={`text-sm ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>{s}</p>
                          </li>
                       ))}
                    </ul>
                 </div>

                 {/* Chart Placeholder */}
                 <div className={`p-6 rounded-lg shadow-sm border flex flex-col ${
                   isLight ? 'bg-white border-slate-200' : 'bg-slate-800/50 border-slate-700'
                 }`}>
                    <h3 className={`text-lg font-semibold mb-4 ${isLight ? 'text-slate-800' : 'text-slate-100'}`}>Throughput Efficiency</h3>
                    <div className="flex-1 min-h-[200px]">
                       <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={[
                             { name: 'Current', value: result.maxThroughput },
                             { name: 'Target (+20%)', value: result.maxThroughput * 1.2 }
                          ]}>
                             <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isLight ? '#e2e8f0' : '#334155'} />
                             <XAxis dataKey="name" tick={{fontSize: 12, fill: isLight ? '#64748b' : '#94a3b8'}} />
                             <YAxis tick={{fontSize: 12, fill: isLight ? '#64748b' : '#94a3b8'}} />
                             <Tooltip
                                contentStyle={{
                                  backgroundColor: isLight ? '#ffffff' : '#1e293b',
                                  borderColor: isLight ? '#e2e8f0' : '#334155',
                                  color: isLight ? '#1e293b' : '#f1f5f9'
                                }}
                                itemStyle={{ color: isLight ? '#1e293b' : '#f1f5f9' }}
                             />
                             <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                {
                                   [{name: 'Current'}, {name: 'Target'}].map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={index === 0 ? (isLight ? '#94a3b8' : '#475569') : '#3b82f6'} />
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
            <div className={`text-center py-20 ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
               No analysis data available. Run the simulation to see results.
            </div>
          )}
        </div>
        
        <div className={`p-4 border-t flex justify-end ${
          isLight ? 'border-slate-200 bg-slate-50' : 'border-slate-800 bg-slate-900'
        }`}>
           <button
             onClick={onClose}
             className={`px-4 py-2 rounded-lg transition-colors font-medium border ${
               isLight
                 ? 'bg-white text-slate-600 hover:bg-slate-100 border-slate-300'
                 : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border-slate-700'
             }`}
           >
             Close Report
           </button>
        </div>
      </div>
    </div>
  );
};

export default AnalysisModal;