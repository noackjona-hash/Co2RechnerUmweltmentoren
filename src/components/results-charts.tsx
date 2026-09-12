'use client';

import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatCO2 } from '@/lib/utils';

interface PieEntry {
  name: string;
  value: number;
  color: string;
}

interface ComparisonEntry {
  name: string;
  value: number;
  fill: string;
}

interface CategoryBarEntry {
  name: string;
  value: number;
  fill: string;
}

export function CategoryPieChart({ data }: { data: PieEntry[] }) {
  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="w-full space-y-3">
      <div className="h-[200px] sm:h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={75}
              paddingAngle={3}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: any) => [`${formatCO2(Number(value || 0))}`, 'CO₂']}
              contentStyle={{
                borderRadius: '8px',
                border: '1px solid #e4e4e7',
                fontSize: '11px',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Clean Mobile Legend Below Chart */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
        {data.map((entry) => {
          const percent = total > 0 ? Math.round((entry.value / total) * 100) : 0;
          return (
            <div key={entry.name} className="flex items-center gap-1.5 text-[11px] text-muted-foreground min-w-0">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
              <span className="truncate text-foreground font-medium">{entry.name}</span>
              <span className="font-mono text-muted-foreground ml-auto pl-1 shrink-0">{percent}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ComparisonBarChart({ data }: { data: ComparisonEntry[] }) {
  return (
    <div className="w-full h-[240px] sm:h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
          <XAxis type="number" tick={{ fontSize: 10 }} />
          <YAxis
            dataKey="name"
            type="category"
            width={88}
            tick={{ fontSize: 10 }}
          />
          <Tooltip
            formatter={(value: any) => [`${formatCO2(Number(value || 0))}`, 'CO₂']}
            contentStyle={{
              borderRadius: '8px',
              border: '1px solid #e4e4e7',
              fontSize: '11px',
            }}
          />
          <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={16}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CategoryDetailBarChart({ data }: { data: CategoryBarEntry[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data}>
        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip
          formatter={(value: any) => [`${formatCO2(Number(value || 0))}`, 'CO₂']}
          contentStyle={{
            borderRadius: '12px',
            border: 'none',
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
          }}
        />
        <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={50}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
