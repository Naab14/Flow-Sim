import React, { useState, useEffect } from 'react';
import { AppNode, GlobalStats, HistoryPoint } from '../types';
import { BarChart3, Settings, PanelRightClose, PanelRightOpen } from 'lucide-react';
import { DashboardTab, PropertiesTab, AnalysisTab } from './dashboard';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

interface RightSidebarProps {
  selectedNode: AppNode | null;
  onChange: (id: string, data: any) => void;
  onAnalyze: () => void;
  simulationData: GlobalStats & { history: HistoryPoint[] };
  nodes: AppNode[];
  simulationTime?: number;
  warmupTime?: number;
  isWarmedUp?: boolean;
}

const RightSidebar: React.FC<RightSidebarProps> = ({
  selectedNode,
  onChange,
  onAnalyze,
  simulationData,
  nodes,
  simulationTime = 0,
  warmupTime = 0,
  isWarmedUp = true
}) => {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const isLight = !isDark;
  const [activeTab, setActiveTab] = useState<'dashboard' | 'properties' | 'analysis'>('dashboard');
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Switch to properties tab automatically when a node is selected
  useEffect(() => {
    if (selectedNode) setActiveTab('properties');
    else if (activeTab === 'properties') setActiveTab('dashboard');
  }, [selectedNode, activeTab]);

  if (isCollapsed) {
    return (
      <div className={`w-14 flex flex-col items-center py-4 gap-4 z-20 transition-colors duration-300 ${
        isLight ? 'bg-white border-l border-slate-200' : 'bg-[#0f172a] border-l border-slate-800'
      }`}>
        <button onClick={() => setIsCollapsed(false)} className={`p-2 rounded transition-colors ${
          isLight ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-slate-800'
        }`}>
          <PanelRightOpen size={20} />
        </button>
        <div className={`h-px w-6 ${isLight ? 'bg-slate-200' : 'bg-slate-800'}`}></div>
        <button onClick={() => { setIsCollapsed(false); setActiveTab('dashboard'); }} className="text-emerald-500 p-2"><BarChart3 size={20}/></button>
        <button onClick={() => { setIsCollapsed(false); setActiveTab('properties'); }} className="text-blue-500 p-2"><Settings size={20}/></button>
      </div>
    );
  }

  return (
    <div
      className="w-96 flex flex-col h-full z-20 shadow-xl transition-all duration-300 theme-transition"
      style={{
        backgroundColor: 'var(--bg-secondary)',
        borderLeft: '1px solid var(--border-primary)'
      }}
    >
      {/* Tabs */}
      <div className={`flex items-center ${
        isLight ? 'border-b border-slate-200 bg-slate-50' : 'border-b border-slate-800 bg-slate-900/50'
      }`}>
        <button onClick={() => setIsCollapsed(true)} className={`p-3 transition-colors ${
          isLight
            ? 'text-slate-400 hover:text-slate-600 border-r border-slate-200 hover:bg-slate-100'
            : 'text-slate-500 hover:text-slate-300 border-r border-slate-800 hover:bg-slate-900'
        }`}>
          <PanelRightClose size={18} />
        </button>
        <TabButton
          isActive={activeTab === 'dashboard'}
          onClick={() => setActiveTab('dashboard')}
          label={t('dashboard.kpis')}
          activeColor="emerald"
          isLight={isLight}
        />
        <TabButton
          isActive={activeTab === 'properties'}
          onClick={() => setActiveTab('properties')}
          label={t('dashboard.properties')}
          activeColor="blue"
          isLight={isLight}
        />
        <TabButton
          isActive={activeTab === 'analysis'}
          onClick={() => setActiveTab('analysis')}
          label={t('dashboard.analysis')}
          activeColor="purple"
          isLight={isLight}
        />
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        {activeTab === 'dashboard' && (
          <DashboardTab
            simulationData={simulationData}
            nodes={nodes}
            simulationTime={simulationTime}
            warmupTime={warmupTime}
            isWarmedUp={isWarmedUp}
          />
        )}

        {activeTab === 'properties' && (
          <PropertiesTab
            selectedNode={selectedNode}
            onChange={onChange}
          />
        )}

        {activeTab === 'analysis' && (
          <AnalysisTab onAnalyze={onAnalyze} />
        )}
      </div>
    </div>
  );
};

// Tab Button Component
const TabButton: React.FC<{
  isActive: boolean;
  onClick: () => void;
  label: string;
  activeColor: 'emerald' | 'blue' | 'purple';
  isLight: boolean;
}> = ({ isActive, onClick, label, activeColor, isLight }) => {
  const colorClasses = {
    emerald: 'text-emerald-500',
    blue: 'text-blue-500',
    purple: 'text-purple-500'
  };

  const bgClasses = {
    emerald: 'bg-emerald-500',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500'
  };

  return (
    <button
      onClick={onClick}
      className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors relative
        ${isActive
          ? `${colorClasses[activeColor]} ${isLight ? 'bg-white' : 'bg-slate-800/50'}`
          : `${isLight ? 'text-slate-400 hover:text-slate-600' : 'text-slate-500 hover:text-slate-300'}`}
      `}
    >
      {label}
      {isActive && <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${bgClasses[activeColor]}`}></div>}
    </button>
  );
};

export default RightSidebar;
