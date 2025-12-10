import React from 'react';
import { Zap } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';

interface AnalysisTabProps {
  onAnalyze: () => void;
}

const AnalysisTab: React.FC<AnalysisTabProps> = ({ onAnalyze }) => {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const isLight = !isDark;

  return (
    <div className="space-y-6">
      <div className={`p-4 rounded-lg ${isLight ? 'bg-slate-50 border border-slate-200' : 'bg-slate-800/30 border border-slate-700/50'}`}>
        <div className="flex items-center gap-2 mb-2">
          <Zap className="text-purple-500" size={18} />
          <h3 className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-200'}`}>{t('analysis.title')}</h3>
        </div>
        <p className={`text-xs leading-relaxed mb-4 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
          {t('analysis.description')}
        </p>
        <button
          onClick={onAnalyze}
          className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg font-semibold shadow-lg shadow-purple-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          {t('analysis.analyzeFlow')}
          <Zap size={16} className="fill-white" />
        </button>
      </div>

      {/* Analysis Templates */}
      <div className={`p-4 rounded-lg ${isLight ? 'bg-slate-50 border border-slate-200' : 'bg-slate-800/30 border border-slate-700/50'}`}>
        <h4 className={`text-xs font-bold uppercase mb-3 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
          Quick Analysis Prompts
        </h4>
        <div className="space-y-2">
          <AnalysisPromptButton
            label="Optimize for Throughput"
            description="Find bottlenecks and maximize output"
            isLight={isLight}
            onClick={onAnalyze}
          />
          <AnalysisPromptButton
            label="Reduce WIP"
            description="Minimize work-in-progress inventory"
            isLight={isLight}
            onClick={onAnalyze}
          />
          <AnalysisPromptButton
            label="Balance Line"
            description="Equalize cycle times across stations"
            isLight={isLight}
            onClick={onAnalyze}
          />
          <AnalysisPromptButton
            label="Improve Quality"
            description="Reduce defect rates and rework"
            isLight={isLight}
            onClick={onAnalyze}
          />
        </div>
      </div>
    </div>
  );
};

const AnalysisPromptButton: React.FC<{
  label: string;
  description: string;
  isLight: boolean;
  onClick: () => void;
}> = ({ label, description, isLight, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full text-left p-3 rounded-lg transition-colors ${
      isLight
        ? 'bg-white border border-slate-200 hover:border-purple-300 hover:bg-purple-50'
        : 'bg-slate-900/50 border border-slate-700 hover:border-purple-700 hover:bg-purple-900/20'
    }`}
  >
    <span className={`block text-sm font-medium ${isLight ? 'text-slate-700' : 'text-slate-200'}`}>
      {label}
    </span>
    <span className={`text-xs ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
      {description}
    </span>
  </button>
);

export default AnalysisTab;
