import React from 'react';
import { Activity, Timer, AlertTriangle, Gauge, TrendingUp, Layers, Clock, Target, Zap } from 'lucide-react';
import KPIChart from '../KPIChart';
import { GlobalStats, HistoryPoint, AppNode } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';

interface DashboardTabProps {
  simulationData: GlobalStats & { history: HistoryPoint[] };
  nodes: AppNode[];
  simulationTime: number;
  warmupTime: number;
  isWarmedUp: boolean;
}

const DashboardTab: React.FC<DashboardTabProps> = ({
  simulationData,
  nodes,
  simulationTime,
  warmupTime,
  isWarmedUp
}) => {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const isLight = !isDark;

  // Calculate warm-up progress
  const warmupProgress = warmupTime > 0 ? Math.min((simulationTime / warmupTime) * 100, 100) : 100;

  // Find bottleneck node name
  const bottleneckNode = nodes.find(n => n.id === simulationData.bottleneckNodeId);

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <h2 className={`text-lg font-bold flex items-center gap-2 ${isLight ? 'text-slate-800' : 'text-slate-100'}`}>
          <Activity className="text-emerald-500" /> {t('dashboard.title')}
        </h2>
        <span className={`text-xs font-mono animate-pulse ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
          ● {t('dashboard.live')}
        </span>
      </div>

      {/* Warm-up Progress Indicator */}
      {warmupTime > 0 && !isWarmedUp && (
        <div className={`rounded-lg p-3 ${isLight ? 'bg-amber-50 border border-amber-200' : 'bg-amber-900/30 border border-amber-700/50'}`}>
          <div className="flex items-center gap-2 mb-2">
            <Timer className="text-amber-500 animate-pulse" size={16} />
            <span className={`text-xs font-bold ${isLight ? 'text-amber-700' : 'text-amber-300'}`}>{t('warmup.inProgress')}</span>
            <span className={`text-xs ml-auto ${isLight ? 'text-amber-600' : 'text-amber-400/70'}`}>
              {Math.max(0, warmupTime - simulationTime).toFixed(0)}s {t('warmup.remaining')}
            </span>
          </div>
          <div className={`w-full rounded-full h-1.5 ${isLight ? 'bg-amber-100' : 'bg-slate-800'}`}>
            <div
              className="bg-amber-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${warmupProgress}%` }}
            />
          </div>
          <p className={`text-[10px] mt-1 ${isLight ? 'text-amber-600/70' : 'text-amber-500/60'}`}>{t('warmup.statsReset')}</p>
        </div>
      )}

      {/* Warm-up Complete Notification (shows briefly) */}
      {warmupTime > 0 && isWarmedUp && simulationTime < warmupTime + 10 && (
        <div className={`rounded-lg p-3 flex items-center gap-2 ${isLight ? 'bg-emerald-50 border border-emerald-200' : 'bg-emerald-900/30 border border-emerald-700/50'}`}>
          <Timer className="text-emerald-500" size={16} />
          <span className={`text-xs font-bold ${isLight ? 'text-emerald-700' : 'text-emerald-300'}`}>{t('warmup.complete')}</span>
        </div>
      )}

      {/* Bottleneck Alert */}
      {bottleneckNode && simulationData.bottleneckUtilization > 80 && (
        <div className={`rounded-lg p-3 flex items-center gap-3 ${isLight ? 'bg-red-50 border border-red-200' : 'bg-red-900/30 border border-red-700/50'}`}>
          <AlertTriangle className="text-red-500 shrink-0" size={20} />
          <div>
            <p className={`text-xs font-bold ${isLight ? 'text-red-700' : 'text-red-300'}`}>{t('dashboard.bottleneckDetected')}</p>
            <p className={`text-xs ${isLight ? 'text-red-600' : 'text-red-400/80'}`}>{bottleneckNode.data.label} - {simulationData.bottleneckUtilization}% {t('dashboard.utilization')}</p>
          </div>
        </div>
      )}

      {/* OEE Card */}
      <OEECard simulationData={simulationData} isLight={isLight} t={t} />

      {/* Throughput Card */}
      <ThroughputCard simulationData={simulationData} isLight={isLight} t={t} />

      {/* Stats Grid */}
      <StatsGrid simulationData={simulationData} isLight={isLight} t={t} />

      {/* WIP Chart */}
      <div className={`rounded-lg p-4 ${isLight ? 'bg-slate-50 border border-slate-200' : 'bg-slate-800/40 border border-slate-700'}`}>
        <p className={`text-xs uppercase font-semibold mb-2 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{t('dashboard.wipOverTime')}</p>
        <KPIChart data={simulationData.history} dataKey="wip" color="#f59e0b" label={t('dashboard.wip')} />
      </div>
    </div>
  );
};

// OEE Card Component
const OEECard: React.FC<{
  simulationData: GlobalStats & { history: HistoryPoint[] };
  isLight: boolean;
  t: (key: string) => string;
}> = ({ simulationData, isLight, t }) => (
  <div className={`rounded-lg p-4 ${
    isLight
      ? 'bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200'
      : 'bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-slate-700'
  }`}>
    <div className="flex justify-between items-start mb-3">
      <div>
        <p className={`text-xs uppercase font-semibold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{t('dashboard.oee')}</p>
        <p className={`text-3xl font-mono ${isLight ? 'text-slate-800' : 'text-white'}`}>
          {simulationData.oee.toFixed(1)}<span className={`text-lg ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>%</span>
        </p>
      </div>
      <Gauge size={24} className="text-blue-500"/>
    </div>
    {/* OEE Breakdown */}
    <div className="grid grid-cols-3 gap-2 text-xs">
      <div className={`p-2 rounded ${isLight ? 'bg-slate-100' : 'bg-slate-800/50'}`}>
        <span className={`block ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>{t('dashboard.availability')}</span>
        <span className="font-mono text-emerald-500">{simulationData.availability.toFixed(1)}%</span>
      </div>
      <div className={`p-2 rounded ${isLight ? 'bg-slate-100' : 'bg-slate-800/50'}`}>
        <span className={`block ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>{t('dashboard.performance')}</span>
        <span className="font-mono text-blue-500">{simulationData.performance.toFixed(1)}%</span>
      </div>
      <div className={`p-2 rounded ${isLight ? 'bg-slate-100' : 'bg-slate-800/50'}`}>
        <span className={`block ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>{t('dashboard.quality')}</span>
        <span className="font-mono text-purple-500">{simulationData.quality.toFixed(1)}%</span>
      </div>
    </div>
    {/* OEE Chart */}
    <div className="mt-3">
      <KPIChart data={simulationData.history} dataKey="oee" color="#3b82f6" label="OEE %" />
    </div>
  </div>
);

// Throughput Card Component
const ThroughputCard: React.FC<{
  simulationData: GlobalStats & { history: HistoryPoint[] };
  isLight: boolean;
  t: (key: string) => string;
}> = ({ simulationData, isLight, t }) => (
  <div className={`rounded-lg p-4 ${isLight ? 'bg-slate-50 border border-slate-200' : 'bg-slate-800/40 border border-slate-700'}`}>
    <div className="flex justify-between items-end mb-2">
      <div>
        <p className={`text-xs uppercase font-semibold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{t('dashboard.throughput')}</p>
        <p className={`text-2xl font-mono ${isLight ? 'text-slate-800' : 'text-white'}`}>
          {simulationData.throughput.toFixed(0)} <span className={`text-sm ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>{t('dashboard.throughputUnit')}</span>
        </p>
        <p className={`text-xs ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>{simulationData.throughputPerMinute} units/min</p>
      </div>
      <TrendingUp size={20} className="text-emerald-500 mb-2"/>
    </div>
    <KPIChart data={simulationData.history} dataKey="throughput" color="#10b981" label={t('dashboard.throughput')} />
  </div>
);

// Stats Grid Component
const StatsGrid: React.FC<{
  simulationData: GlobalStats;
  isLight: boolean;
  t: (key: string) => string;
}> = ({ simulationData, isLight, t }) => (
  <div className="grid grid-cols-2 gap-3">
    {/* WIP */}
    <div className={`rounded-lg p-3 ${isLight ? 'bg-slate-50 border border-slate-200' : 'bg-slate-800/40 border border-slate-700'}`}>
      <div className="flex items-center gap-2 mb-1">
        <Layers size={14} className="text-amber-500"/>
        <p className={`text-xs uppercase font-semibold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{t('dashboard.wip')}</p>
      </div>
      <p className={`text-xl font-mono ${isLight ? 'text-slate-800' : 'text-white'}`}>{simulationData.wip}</p>
    </div>

    {/* Lead Time */}
    <div className={`rounded-lg p-3 ${isLight ? 'bg-slate-50 border border-slate-200' : 'bg-slate-800/40 border border-slate-700'}`}>
      <div className="flex items-center gap-2 mb-1">
        <Clock size={14} className="text-cyan-500"/>
        <p className={`text-xs uppercase font-semibold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{t('dashboard.leadTime')}</p>
      </div>
      <p className={`text-xl font-mono ${isLight ? 'text-slate-800' : 'text-white'}`}>
        {simulationData.averageLeadTime.toFixed(1)}<span className={`text-sm ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>s</span>
      </p>
    </div>

    {/* Completed */}
    <div className={`rounded-lg p-3 ${isLight ? 'bg-slate-50 border border-slate-200' : 'bg-slate-800/40 border border-slate-700'}`}>
      <div className="flex items-center gap-2 mb-1">
        <Target size={14} className="text-green-500"/>
        <p className={`text-xs uppercase font-semibold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{t('dashboard.completed')}</p>
      </div>
      <p className={`text-xl font-mono ${isLight ? 'text-slate-800' : 'text-white'}`}>{simulationData.completedCount}</p>
    </div>

    {/* Generated */}
    <div className={`rounded-lg p-3 ${isLight ? 'bg-slate-50 border border-slate-200' : 'bg-slate-800/40 border border-slate-700'}`}>
      <div className="flex items-center gap-2 mb-1">
        <Zap size={14} className="text-blue-500"/>
        <p className={`text-xs uppercase font-semibold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{t('dashboard.generated')}</p>
      </div>
      <p className={`text-xl font-mono ${isLight ? 'text-slate-800' : 'text-white'}`}>{simulationData.totalGenerated}</p>
    </div>
  </div>
);

export default DashboardTab;
