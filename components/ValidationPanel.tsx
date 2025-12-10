import React from 'react';
import { AlertTriangle, AlertCircle, Info, X, ChevronDown, ChevronUp } from 'lucide-react';
import { ValidationResult, ValidationWarning } from '../hooks/useValidation';
import { useTheme } from '../contexts/ThemeContext';

interface ValidationPanelProps {
  validation: ValidationResult;
  isExpanded: boolean;
  onToggle: () => void;
  onDismiss: () => void;
  onSelectNode?: (nodeId: string) => void;
}

const ValidationPanel: React.FC<ValidationPanelProps> = ({
  validation,
  isExpanded,
  onToggle,
  onDismiss,
  onSelectNode
}) => {
  const { isDark } = useTheme();
  const isLight = !isDark;

  const totalIssues = validation.errors.length + validation.warnings.length + validation.info.length;

  if (totalIssues === 0) return null;

  const getIcon = (type: ValidationWarning['type']) => {
    switch (type) {
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />;
      case 'info':
        return <Info className="w-4 h-4 text-blue-500 shrink-0" />;
    }
  };

  const getBgColor = (type: ValidationWarning['type']) => {
    switch (type) {
      case 'error':
        return isLight ? 'bg-red-50 border-red-200' : 'bg-red-900/20 border-red-800/30';
      case 'warning':
        return isLight ? 'bg-amber-50 border-amber-200' : 'bg-amber-900/20 border-amber-800/30';
      case 'info':
        return isLight ? 'bg-blue-50 border-blue-200' : 'bg-blue-900/20 border-blue-800/30';
    }
  };

  const allIssues = [
    ...validation.errors,
    ...validation.warnings,
    ...validation.info
  ];

  return (
    <div className={`absolute bottom-4 left-1/2 -translate-x-1/2 z-40 w-[500px] rounded-xl shadow-xl overflow-hidden transition-all duration-300 ${
      isLight ? 'bg-white border border-slate-200' : 'bg-slate-900 border border-slate-700'
    }`}>
      {/* Header */}
      <div
        onClick={onToggle}
        className={`flex items-center justify-between px-4 py-3 cursor-pointer ${
          isLight ? 'bg-slate-50 hover:bg-slate-100' : 'bg-slate-800/50 hover:bg-slate-800'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            {validation.errors.length > 0 && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 text-xs font-bold">
                <AlertCircle size={12} />
                {validation.errors.length}
              </span>
            )}
            {validation.warnings.length > 0 && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-xs font-bold">
                <AlertTriangle size={12} />
                {validation.warnings.length}
              </span>
            )}
            {validation.info.length > 0 && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 text-xs font-bold">
                <Info size={12} />
                {validation.info.length}
              </span>
            )}
          </div>
          <span className={`text-sm font-medium ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
            {totalIssues} {totalIssues === 1 ? 'issue' : 'issues'} found
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDismiss();
            }}
            className={`p-1 rounded transition-colors ${
              isLight ? 'hover:bg-slate-200 text-slate-400' : 'hover:bg-slate-700 text-slate-500'
            }`}
          >
            <X size={16} />
          </button>
          {isExpanded ? (
            <ChevronDown size={18} className={isLight ? 'text-slate-400' : 'text-slate-500'} />
          ) : (
            <ChevronUp size={18} className={isLight ? 'text-slate-400' : 'text-slate-500'} />
          )}
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="max-h-64 overflow-y-auto">
          {allIssues.map((issue) => (
            <div
              key={issue.id}
              onClick={() => issue.nodeId && onSelectNode?.(issue.nodeId)}
              className={`flex items-start gap-3 px-4 py-3 border-t cursor-pointer transition-colors ${
                getBgColor(issue.type)
              } ${issue.nodeId ? 'hover:opacity-80' : ''}`}
            >
              {getIcon(issue.type)}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                  {issue.title}
                </p>
                <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  {issue.message}
                </p>
              </div>
              {issue.nodeId && (
                <span className={`text-[10px] px-2 py-0.5 rounded ${
                  isLight ? 'bg-slate-200 text-slate-500' : 'bg-slate-700 text-slate-400'
                }`}>
                  Click to select
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      {isExpanded && !validation.canSimulate && (
        <div className={`px-4 py-2 text-xs font-medium border-t ${
          isLight
            ? 'bg-red-50 border-red-200 text-red-600'
            : 'bg-red-900/20 border-red-800/30 text-red-400'
        }`}>
          Fix errors before running simulation
        </div>
      )}
    </div>
  );
};

export default ValidationPanel;
