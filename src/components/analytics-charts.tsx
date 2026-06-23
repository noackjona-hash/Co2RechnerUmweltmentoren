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
import { formatCO2, NATIONAL_AVERAGE_CO2 } from '@/lib/utils';

interface PieEntry {
  name: string;
  value: number;
  color: string;
}

interface ClassComparisonEntry {
  name: string;
  value: number;
  completed: number;
}

export function SchoolCategoryPieChart({ data }: { data: PieEntry[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={4}
          dataKey="value"
          label={({ name, percent }) =>
            `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
          }
          labelLine={false}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: any) => [
            `${formatCO2(Number(value || 0))}`,
            'Ø CO₂',
          ]}
          contentStyle={{
            borderRadius: '12px',
            border: 'none',
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function SchoolClassBarChart({ data }: { data: ClassComparisonEntry[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} layout="vertical">
        <XAxis type="number" tick={{ fontSize: 12 }} />
        <YAxis
          dataKey="name"
          type="category"
          width={80}
          tick={{ fontSize: 12 }}
        />
        <Tooltip
          formatter={(value: any) => [
            `${formatCO2(Number(value || 0))}`,
            'Ø CO₂',
          ]}
          contentStyle={{
            borderRadius: '12px',
            border: 'none',
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
          }}
        />
        <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={24}>
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={
                entry.value <= NATIONAL_AVERAGE_CO2
                  ? '#10b981'
                  : '#f59e0b'
              }
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
