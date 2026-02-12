'use client';

import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from 'recharts';

import { cn } from '@/common/functions/cn';

interface FlavorRadarProps {
  data: {
    acidity: number;
    tannin: number;
    sweetness: number;
    alcohol: number;
    body: number;
  };
  wineType?: 'red' | 'white' | 'rose' | 'sparkling';
  className?: string;
}

const fillColors: Record<string, string> = {
  red: 'rgba(123, 45, 58, 0.4)',
  white: 'rgba(196, 149, 58, 0.4)',
  rose: 'rgba(219, 112, 147, 0.4)',
  sparkling: 'rgba(212, 168, 75, 0.35)',
};

const strokeColors: Record<string, string> = {
  red: '#7B2D3A',
  white: '#C4953A',
  rose: '#DB7093',
  sparkling: '#D4A84B',
};

export function FlavorRadar({
  data,
  wineType = 'red',
  className,
}: FlavorRadarProps) {
  const chartData = [
    { axis: 'Acidity', value: data.acidity },
    { axis: 'Tannin', value: data.tannin },
    { axis: 'Sweetness', value: data.sweetness },
    { axis: 'Alcohol', value: data.alcohol },
    { axis: 'Body', value: data.body },
  ];

  return (
    <div className={cn('w-full h-48', className)}>
      <ResponsiveContainer height="100%" width="100%">
        <RadarChart cx="50%" cy="50%" data={chartData} outerRadius="75%">
          <PolarGrid stroke="#E8E2D9" />
          <PolarAngleAxis
            dataKey="axis"
            tick={{ fontSize: 11, fill: '#5C5650' }}
          />
          <PolarRadiusAxis angle={90} domain={[0, 5]} tick={false} />
          <Radar
            dataKey="value"
            fill={fillColors[wineType]}
            name="Profile"
            stroke={strokeColors[wineType]}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
