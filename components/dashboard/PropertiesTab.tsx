import React from 'react';
import { Settings, Sliders, Coffee, Plus, Trash2 } from 'lucide-react';
import { AppNode, NodeType, ShiftPattern, BreakPeriod } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';

interface PropertiesTabProps {
  selectedNode: AppNode | null;
  onChange: (id: string, data: any) => void;
}

const PropertiesTab: React.FC<PropertiesTabProps> = ({
  selectedNode,
  onChange
}) => {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const isLight = !isDark;

  const handleChange = (field: string, value: string | number | ShiftPattern) => {
    if (!selectedNode) return;
    onChange(selectedNode.id, {
      ...selectedNode.data,
      [field]: value,
    });
  };

  const isProcess = selectedNode?.data.type === NodeType.PROCESS || selectedNode?.data.type === NodeType.QUALITY;
  const isInventory = selectedNode?.data.type === NodeType.INVENTORY;

  if (!selectedNode) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
        <Settings size={48} className={isLight ? 'text-slate-300' : 'text-slate-600'} strokeWidth={1} />
        <div>
          <p className={isLight ? 'text-slate-500 font-medium' : 'text-slate-400 font-medium'}>{t('properties.selectNode')}</p>
          <p className={`text-sm mt-1 ${isLight ? 'text-slate-400' : 'text-slate-600'}`}>{t('properties.clickToEdit')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className={`flex items-center gap-3 pb-4 border-b ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
        <div className={`p-2 rounded ${isLight ? 'bg-slate-100' : 'bg-slate-800'}`}>
          <Sliders size={20} className={isLight ? 'text-slate-500' : 'text-slate-400'} />
        </div>
        <div>
          <h2 className={`text-lg font-bold ${isLight ? 'text-slate-800' : 'text-slate-100'}`}>{selectedNode.data.label}</h2>
          <p className={`text-xs font-mono ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>{selectedNode.id}</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Label Input */}
        <LabelInput
          value={selectedNode.data.label}
          onChange={(value) => handleChange('label', value)}
          isLight={isLight}
        />

        {isProcess && (
          <>
            {/* Cycle Time */}
            <CycleTimeInput
              value={selectedNode.data.cycleTime}
              onChange={(value) => handleChange('cycleTime', value)}
              isLight={isLight}
            />

            {/* Cycle Time Variation */}
            <CycleTimeVariationSlider
              value={selectedNode.data.cycleTimeVariation || 0}
              cycleTime={selectedNode.data.cycleTime}
              onChange={(value) => handleChange('cycleTimeVariation', value)}
              isLight={isLight}
            />

            {/* Capacity */}
            <CapacityInput
              value={selectedNode.data.capacity || 1}
              onChange={(value) => handleChange('capacity', value)}
              isLight={isLight}
              helperText="Number of items processed simultaneously."
            />

            {/* Defect Rate */}
            <DefectRateSlider
              value={selectedNode.data.defectRate}
              onChange={(value) => handleChange('defectRate', value)}
              isLight={isLight}
            />

            {/* Shift Pattern Section */}
            <ShiftPatternEditor
              shiftPattern={selectedNode.data.shiftPattern}
              onChange={(value) => handleChange('shiftPattern', value)}
              isLight={isLight}
            />
          </>
        )}

        {isInventory && (
          <CapacityInput
            value={selectedNode.data.capacity || 10}
            onChange={(value) => handleChange('capacity', value)}
            isLight={isLight}
            label="Max Storage Capacity"
            helperText="Simulates blocking if full."
          />
        )}

        {selectedNode.data.type === NodeType.SOURCE && (
          <div>
            <label className={`block text-xs font-semibold mb-1.5 uppercase ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>Arrival Interval (sec)</label>
            <input
              type="number"
              min="1"
              className={`w-full rounded p-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all ${
                isLight
                  ? 'bg-white border border-slate-300 text-slate-800'
                  : 'bg-slate-900 border border-slate-700 text-slate-200'
              }`}
              value={selectedNode.data.cycleTime}
              onChange={(e) => handleChange('cycleTime', Number(e.target.value))}
            />
          </div>
        )}

        {/* Live Statistics */}
        <LiveStatistics stats={selectedNode.data.stats} isLight={isLight} />
      </div>
    </div>
  );
};

// Sub-components
const LabelInput: React.FC<{
  value: string;
  onChange: (value: string) => void;
  isLight: boolean;
}> = ({ value, onChange, isLight }) => (
  <div className="group">
    <label className={`block text-xs font-semibold mb-1.5 uppercase ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>Label</label>
    <input
      type="text"
      className={`w-full rounded p-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all ${
        isLight
          ? 'bg-white border border-slate-300 text-slate-800'
          : 'bg-slate-900 border border-slate-700 text-slate-200'
      }`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

const CycleTimeInput: React.FC<{
  value: number;
  onChange: (value: number) => void;
  isLight: boolean;
}> = ({ value, onChange, isLight }) => (
  <div>
    <label className={`block text-xs font-semibold mb-1.5 uppercase ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>Cycle Time (sec)</label>
    <input
      type="number"
      min="0"
      className={`w-full rounded p-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all ${
        isLight
          ? 'bg-white border border-slate-300 text-slate-800'
          : 'bg-slate-900 border border-slate-700 text-slate-200'
      }`}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
    />
  </div>
);

const CycleTimeVariationSlider: React.FC<{
  value: number;
  cycleTime: number;
  onChange: (value: number) => void;
  isLight: boolean;
}> = ({ value, cycleTime, onChange, isLight }) => (
  <div>
    <label className={`block text-xs font-semibold mb-1.5 uppercase ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>Cycle Time Variation (%)</label>
    <div className="relative">
      <input
        type="range"
        min="0"
        max="50"
        step="1"
        className={`w-full h-2 rounded-lg appearance-none cursor-pointer accent-cyan-500 ${isLight ? 'bg-slate-200' : 'bg-slate-800'}`}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <div className={`flex justify-between mt-1 text-xs font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
        <span>0%</span>
        <span className="text-cyan-500 font-bold">±{value}%</span>
        <span>50%</span>
      </div>
    </div>
    <p className={`text-[10px] mt-1 ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
      Random variation: {(cycleTime * (1 - value/100)).toFixed(1)}s - {(cycleTime * (1 + value/100)).toFixed(1)}s
    </p>
  </div>
);

const CapacityInput: React.FC<{
  value: number;
  onChange: (value: number) => void;
  isLight: boolean;
  label?: string;
  helperText?: string;
}> = ({ value, onChange, isLight, label = "Capacity (Parallel Units)", helperText }) => (
  <div>
    <label className={`block text-xs font-semibold mb-1.5 uppercase ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>{label}</label>
    <input
      type="number"
      min="1"
      className={`w-full rounded p-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all ${
        isLight
          ? 'bg-white border border-slate-300 text-slate-800'
          : 'bg-slate-900 border border-slate-700 text-slate-200'
      }`}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
    />
    {helperText && (
      <p className={`text-[10px] mt-1 ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>{helperText}</p>
    )}
  </div>
);

const DefectRateSlider: React.FC<{
  value: number;
  onChange: (value: number) => void;
  isLight: boolean;
}> = ({ value, onChange, isLight }) => (
  <div>
    <label className={`block text-xs font-semibold mb-1.5 uppercase ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>Defect Rate (%)</label>
    <div className="relative">
      <input
        type="range"
        min="0"
        max="100"
        step="0.1"
        className={`w-full h-2 rounded-lg appearance-none cursor-pointer accent-blue-500 ${isLight ? 'bg-slate-200' : 'bg-slate-800'}`}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <div className={`flex justify-between mt-1 text-xs font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
        <span>0%</span>
        <span className="text-blue-500 font-bold">{value}%</span>
        <span>100%</span>
      </div>
    </div>
  </div>
);

const ShiftPatternEditor: React.FC<{
  shiftPattern?: ShiftPattern;
  onChange: (value: ShiftPattern) => void;
  isLight: boolean;
}> = ({ shiftPattern, onChange, isLight }) => {
  const currentPattern = shiftPattern || { enabled: false, shiftDurationHours: 8, breaks: [] };

  return (
    <div className={`p-3 rounded-lg ${isLight ? 'bg-purple-50 border border-purple-200' : 'bg-purple-900/20 border border-purple-800/30'}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Coffee size={14} className="text-purple-500" />
          <label className={`text-xs font-semibold uppercase ${isLight ? 'text-purple-700' : 'text-purple-300'}`}>Shift Pattern</label>
        </div>
        <button
          onClick={() => onChange({ ...currentPattern, enabled: !currentPattern.enabled })}
          className={`relative w-10 h-5 rounded-full transition-colors ${
            currentPattern.enabled
              ? 'bg-purple-500'
              : isLight ? 'bg-slate-300' : 'bg-slate-700'
          }`}
        >
          <div
            className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
              currentPattern.enabled ? 'translate-x-5' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>

      {currentPattern.enabled && (
        <div className="space-y-3">
          <div>
            <label className={`block text-[10px] mb-1 ${isLight ? 'text-purple-600' : 'text-purple-400'}`}>Shift Duration (hours)</label>
            <input
              type="number"
              min="1"
              max="24"
              className={`w-full rounded p-2 text-sm ${
                isLight
                  ? 'bg-white border border-purple-200 text-slate-800'
                  : 'bg-slate-900 border border-purple-700/50 text-slate-200'
              }`}
              value={currentPattern.shiftDurationHours}
              onChange={(e) => onChange({ ...currentPattern, shiftDurationHours: Number(e.target.value) })}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className={`text-[10px] ${isLight ? 'text-purple-600' : 'text-purple-400'}`}>Scheduled Breaks</label>
              <button
                onClick={() => {
                  const newBreak: BreakPeriod = { startMinute: 120, durationMinutes: 30, name: 'Break' };
                  onChange({ ...currentPattern, breaks: [...currentPattern.breaks, newBreak] });
                }}
                className={`p-1 rounded transition-colors ${
                  isLight ? 'hover:bg-purple-100 text-purple-600' : 'hover:bg-purple-800/30 text-purple-400'
                }`}
              >
                <Plus size={14} />
              </button>
            </div>

            {currentPattern.breaks.length === 0 && (
              <p className={`text-[10px] text-center py-2 ${isLight ? 'text-purple-400' : 'text-purple-500'}`}>
                No breaks configured
              </p>
            )}

            {currentPattern.breaks.map((breakItem: BreakPeriod, index: number) => (
              <div key={index} className={`flex gap-2 items-center mb-2 p-2 rounded ${isLight ? 'bg-white' : 'bg-slate-800/50'}`}>
                <input
                  type="text"
                  placeholder="Name"
                  className={`w-20 text-[10px] p-1 rounded ${
                    isLight ? 'bg-slate-50 border border-slate-200' : 'bg-slate-900 border border-slate-700'
                  }`}
                  value={breakItem.name}
                  onChange={(e) => {
                    const newBreaks = [...currentPattern.breaks];
                    newBreaks[index] = { ...newBreaks[index], name: e.target.value };
                    onChange({ ...currentPattern, breaks: newBreaks });
                  }}
                />
                <div className="flex-1 flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    className={`w-12 text-[10px] p-1 rounded text-center ${
                      isLight ? 'bg-slate-50 border border-slate-200' : 'bg-slate-900 border border-slate-700'
                    }`}
                    value={breakItem.startMinute}
                    onChange={(e) => {
                      const newBreaks = [...currentPattern.breaks];
                      newBreaks[index] = { ...newBreaks[index], startMinute: Number(e.target.value) };
                      onChange({ ...currentPattern, breaks: newBreaks });
                    }}
                  />
                  <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>min</span>
                  <span className={`text-[10px] ${isLight ? 'text-slate-400' : 'text-slate-600'}`}>for</span>
                  <input
                    type="number"
                    min="1"
                    className={`w-10 text-[10px] p-1 rounded text-center ${
                      isLight ? 'bg-slate-50 border border-slate-200' : 'bg-slate-900 border border-slate-700'
                    }`}
                    value={breakItem.durationMinutes}
                    onChange={(e) => {
                      const newBreaks = [...currentPattern.breaks];
                      newBreaks[index] = { ...newBreaks[index], durationMinutes: Number(e.target.value) };
                      onChange({ ...currentPattern, breaks: newBreaks });
                    }}
                  />
                  <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>min</span>
                </div>
                <button
                  onClick={() => {
                    const newBreaks = currentPattern.breaks.filter((_: BreakPeriod, i: number) => i !== index);
                    onChange({ ...currentPattern, breaks: newBreaks });
                  }}
                  className={`p-1 rounded transition-colors ${
                    isLight ? 'hover:bg-red-100 text-red-400' : 'hover:bg-red-900/30 text-red-400'
                  }`}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>

          <p className={`text-[10px] ${isLight ? 'text-purple-500' : 'text-purple-500/70'}`}>
            Machine pauses during scheduled breaks. Shift repeats cyclically.
          </p>
        </div>
      )}
    </div>
  );
};

const LiveStatistics: React.FC<{
  stats: any;
  isLight: boolean;
}> = ({ stats, isLight }) => (
  <div className={`p-4 rounded mt-4 ${isLight ? 'bg-slate-50 border border-slate-200' : 'bg-slate-800/30 border border-slate-700/50'}`}>
    <h3 className={`text-xs font-bold uppercase mb-3 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Live Statistics</h3>
    <div className="grid grid-cols-2 gap-4 text-sm">
      <div>
        <span className={`block text-[10px] ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>Total processed</span>
        <span className={`font-mono ${isLight ? 'text-slate-700' : 'text-slate-200'}`}>{stats?.totalProcessed || 0}</span>
      </div>
      <div>
        <span className={`block text-[10px] ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>Avg Utilization</span>
        <span className={`font-mono ${isLight ? 'text-slate-700' : 'text-slate-200'}`}>{(stats?.utilization || 0).toFixed(1)}%</span>
      </div>
      <div>
        <span className={`block text-[10px] ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>Blocked Time</span>
        <span className="font-mono text-red-500">{(stats?.blockedTime || 0).toFixed(1)}s</span>
      </div>
    </div>
  </div>
);

export default PropertiesTab;
