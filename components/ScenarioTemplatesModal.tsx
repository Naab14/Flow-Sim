import React, { useState } from 'react';
import { X, FileText, Beaker, Shield, Layers, Zap, ChevronRight } from 'lucide-react';
import { scenarioTemplates, ScenarioTemplate } from '../data/scenarioTemplates';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { MarkerType } from 'reactflow';

interface ScenarioTemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadTemplate: (template: ScenarioTemplate) => void;
}

const categoryIcons: Record<ScenarioTemplate['category'], React.ReactNode> = {
  assembly: <FileText className="w-4 h-4" />,
  quality: <Shield className="w-4 h-4" />,
  buffer: <Layers className="w-4 h-4" />,
  complex: <Zap className="w-4 h-4" />
};

const categoryColors: Record<ScenarioTemplate['category'], string> = {
  assembly: 'text-blue-500 bg-blue-500/10',
  quality: 'text-purple-500 bg-purple-500/10',
  buffer: 'text-amber-500 bg-amber-500/10',
  complex: 'text-emerald-500 bg-emerald-500/10'
};

const difficultyColors: Record<ScenarioTemplate['difficulty'], string> = {
  beginner: 'text-green-500 bg-green-500/10',
  intermediate: 'text-amber-500 bg-amber-500/10',
  advanced: 'text-red-500 bg-red-500/10'
};

const ScenarioTemplatesModal: React.FC<ScenarioTemplatesModalProps> = ({
  isOpen,
  onClose,
  onLoadTemplate
}) => {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const isLight = !isDark;
  const [selectedCategory, setSelectedCategory] = useState<ScenarioTemplate['category'] | 'all'>('all');
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredTemplates = selectedCategory === 'all'
    ? scenarioTemplates
    : scenarioTemplates.filter(t => t.category === selectedCategory);

  const handleLoadTemplate = (template: ScenarioTemplate) => {
    // Prepare nodes and edges with proper styling
    const preparedNodes = template.nodes.map((n: any) => ({
      ...n,
      data: {
        ...n.data,
        stats: {
          totalProcessed: 0,
          busyTime: 0,
          blockedTime: 0,
          starvedTime: 0,
          breakTime: 0,
          utilization: 0,
          queueLength: 0,
          avgCycleTime: 0
        },
        status: 'idle',
        progress: 0
      }
    }));

    const preparedEdges = template.edges.map((e: any) => ({
      ...e,
      animated: true,
      type: e.type || 'smoothstep',
      style: { stroke: '#475569', strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#475569' }
    }));

    onLoadTemplate({
      ...template,
      nodes: preparedNodes,
      edges: preparedEdges
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`relative w-full max-w-4xl max-h-[85vh] rounded-xl shadow-2xl overflow-hidden flex flex-col ${
          isLight ? 'bg-white' : 'bg-slate-900'
        }`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${
          isLight ? 'border-slate-200' : 'border-slate-800'
        }`}>
          <div>
            <h2 className={`text-xl font-bold ${isLight ? 'text-slate-800' : 'text-white'}`}>
              <Beaker className="inline-block mr-2 text-purple-500" size={24} />
              Scenario Templates
            </h2>
            <p className={`text-sm mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Choose a pre-built scenario to explore different manufacturing configurations
            </p>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              isLight ? 'hover:bg-slate-100 text-slate-500' : 'hover:bg-slate-800 text-slate-400'
            }`}
          >
            <X size={20} />
          </button>
        </div>

        {/* Category Filter */}
        <div className={`px-6 py-3 flex gap-2 border-b ${
          isLight ? 'border-slate-200 bg-slate-50' : 'border-slate-800 bg-slate-900/50'
        }`}>
          <FilterButton
            active={selectedCategory === 'all'}
            onClick={() => setSelectedCategory('all')}
            isLight={isLight}
          >
            All
          </FilterButton>
          <FilterButton
            active={selectedCategory === 'assembly'}
            onClick={() => setSelectedCategory('assembly')}
            isLight={isLight}
          >
            <FileText size={14} className="mr-1" /> Assembly
          </FilterButton>
          <FilterButton
            active={selectedCategory === 'quality'}
            onClick={() => setSelectedCategory('quality')}
            isLight={isLight}
          >
            <Shield size={14} className="mr-1" /> Quality
          </FilterButton>
          <FilterButton
            active={selectedCategory === 'buffer'}
            onClick={() => setSelectedCategory('buffer')}
            isLight={isLight}
          >
            <Layers size={14} className="mr-1" /> Buffer
          </FilterButton>
          <FilterButton
            active={selectedCategory === 'complex'}
            onClick={() => setSelectedCategory('complex')}
            isLight={isLight}
          >
            <Zap size={14} className="mr-1" /> Complex
          </FilterButton>
        </div>

        {/* Templates Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTemplates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                isLight={isLight}
                isHovered={hoveredTemplate === template.id}
                onHover={() => setHoveredTemplate(template.id)}
                onLeave={() => setHoveredTemplate(null)}
                onLoad={() => handleLoadTemplate(template)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const FilterButton: React.FC<{
  active: boolean;
  onClick: () => void;
  isLight: boolean;
  children: React.ReactNode;
}> = ({ active, onClick, isLight, children }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center ${
      active
        ? 'bg-purple-500 text-white'
        : isLight
          ? 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
          : 'bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700'
    }`}
  >
    {children}
  </button>
);

const TemplateCard: React.FC<{
  template: ScenarioTemplate;
  isLight: boolean;
  isHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
  onLoad: () => void;
}> = ({ template, isLight, isHovered, onHover, onLeave, onLoad }) => (
  <div
    onMouseEnter={onHover}
    onMouseLeave={onLeave}
    onClick={onLoad}
    className={`group relative rounded-xl p-5 cursor-pointer transition-all duration-200 ${
      isLight
        ? 'bg-white border border-slate-200 hover:border-purple-300 hover:shadow-lg'
        : 'bg-slate-800/50 border border-slate-700 hover:border-purple-600 hover:shadow-lg hover:shadow-purple-500/10'
    } ${isHovered ? 'scale-[1.02]' : ''}`}
  >
    {/* Category & Difficulty Badges */}
    <div className="flex items-center gap-2 mb-3">
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${categoryColors[template.category]}`}>
        {categoryIcons[template.category]}
        {template.category}
      </span>
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${difficultyColors[template.difficulty]}`}>
        {template.difficulty}
      </span>
    </div>

    {/* Title */}
    <h3 className={`text-lg font-bold mb-2 ${isLight ? 'text-slate-800' : 'text-white'}`}>
      {template.name}
    </h3>

    {/* Description */}
    <p className={`text-sm leading-relaxed mb-4 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
      {template.description}
    </p>

    {/* Stats */}
    <div className="flex items-center gap-4 text-xs">
      <span className={isLight ? 'text-slate-400' : 'text-slate-500'}>
        {template.nodes.length} nodes
      </span>
      <span className={isLight ? 'text-slate-400' : 'text-slate-500'}>
        {template.edges.length} connections
      </span>
    </div>

    {/* Load Button (appears on hover) */}
    <div className={`absolute right-4 top-1/2 -translate-y-1/2 transition-opacity ${
      isHovered ? 'opacity-100' : 'opacity-0'
    }`}>
      <div className="flex items-center gap-1 px-3 py-2 bg-purple-500 text-white rounded-lg text-sm font-medium">
        Load <ChevronRight size={16} />
      </div>
    </div>
  </div>
);

export default ScenarioTemplatesModal;
