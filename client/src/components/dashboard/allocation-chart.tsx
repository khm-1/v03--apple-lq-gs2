import { PieChart, Pie, ResponsiveContainer, Cell, Tooltip } from "recharts";
import GlassPanel from "./glass-panel";
import { mockAllocationData } from "@/lib/mock-data";

export default function AllocationChart() {
  return (
    <GlassPanel>
      <h3 className="text-xl font-semibold text-white mb-6">Portfolio Allocation</h3>
      <div className="h-48 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={mockAllocationData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {mockAllocationData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                color: 'white'
              }}
              formatter={(value: number) => [`${value}%`, 'Allocation']}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="space-y-3">
        {mockAllocationData.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-slate-300 text-sm">{item.name}</span>
            </div>
            <span className="text-white font-medium">{item.value}%</span>
          </div>
        ))}
      </div>
    </GlassPanel>
  );
}
