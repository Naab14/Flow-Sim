import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '../contexts/ThemeContext';

interface KPIChartProps {
  data: any[];
  dataKey: string;
  color: string;
  label: string;
}

const KPIChart: React.FC<KPIChartProps> = ({ data, dataKey, color, label }) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  return (
    <div className="h-24 w-full">
        <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
            <defs>
            <linearGradient id={`color${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={color} stopOpacity={0}/>
            </linearGradient>
            </defs>
            <Tooltip
                contentStyle={{
                  backgroundColor: isLight ? '#ffffff' : '#1e293b',
                  borderColor: isLight ? '#e2e8f0' : '#334155',
                  borderRadius: '4px',
                  fontSize: '12px'
                }}
                itemStyle={{ color: isLight ? '#1e293b' : '#f1f5f9' }}
                labelStyle={{ display: 'none' }}
            />
            <Area
                type="monotone"
                dataKey={dataKey}
                stroke={color}
                strokeWidth={2}
                fillOpacity={1}
                fill={`url(#color${dataKey})`}
                isAnimationActive={false}
            />
        </AreaChart>
        </ResponsiveContainer>
    </div>
  );
};

export default KPIChart;
