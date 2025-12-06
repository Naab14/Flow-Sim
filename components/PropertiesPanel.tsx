import React from 'react';
import { AppNode, NodeType } from '../types';
import { X } from 'lucide-react';

interface PropertiesPanelProps {
  selectedNode: AppNode | null;
  onChange: (id: string, data: any) => void;
  onClose: () => void;
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ selectedNode, onChange, onClose }) => {
  if (!selectedNode) return null;

  const handleChange = (field: string, value: string | number) => {
    onChange(selectedNode.id, {
      ...selectedNode.data,
      [field]: value,
    });
  };

  const isProcess = selectedNode.data.type === NodeType.PROCESS || selectedNode.data.type === NodeType.QUALITY;

  return (
    <div className="absolute top-4 right-4 w-72 bg-white rounded-lg shadow-xl border border-slate-200 flex flex-col overflow-hidden z-20">
      <div className="flex items-center justify-between p-3 bg-slate-50 border-b border-slate-200">
        <h3 className="font-semibold text-slate-700">Properties</h3>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
          <X size={18} />
        </button>
      </div>

      <div className="p-4 flex flex-col gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Label</label>
          <input
            type="text"
            className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
            value={selectedNode.data.label}
            onChange={(e) => handleChange('label', e.target.value)}
          />
        </div>

        {isProcess && (
          <>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Cycle Time (seconds)</label>
              <input
                type="number"
                min="0"
                className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                value={selectedNode.data.cycleTime}
                onChange={(e) => handleChange('cycleTime', Number(e.target.value))}
              />
              <p className="text-[10px] text-slate-400 mt-1">Time to process one unit.</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Defect Rate (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                value={selectedNode.data.defectRate}
                onChange={(e) => handleChange('defectRate', Number(e.target.value))}
              />
            </div>
          </>
        )}

        <div>
           <label className="block text-xs font-medium text-slate-500 mb-1">Batch Size</label>
           <input
             type="number"
             min="1"
             className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
             value={selectedNode.data.batchSize}
             onChange={(e) => handleChange('batchSize', Number(e.target.value))}
           />
        </div>
        
        <div className="pt-2 border-t border-slate-100">
           <div className="flex justify-between items-center text-xs text-slate-500">
              <span>Node ID:</span>
              <span className="font-mono">{selectedNode.id}</span>
           </div>
           <div className="flex justify-between items-center text-xs text-slate-500 mt-1">
              <span>Type:</span>
              <span className="uppercase">{selectedNode.data.type}</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default PropertiesPanel;
