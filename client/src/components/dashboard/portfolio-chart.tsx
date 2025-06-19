import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import GlassPanel from "./glass-panel";
import { mockPortfolioData } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";

export default function PortfolioChart() {
  return (
    <GlassPanel>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h3 className="text-xl font-semibold text-white mb-2">Portfolio Performance</h3>
          <p className="text-slate-300 text-sm">Past 30 days performance overview</p>
        </div>
        <div className="flex items-center gap-2 mt-4 md:mt-0">
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
            1D
          </Button>
          <Button variant="ghost" size="sm" className="text-white bg-blue-500/30 hover:bg-blue-500/40">
            7D
          </Button>
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
            1M
          </Button>
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
            1Y
          </Button>
        </div>
      </div>
      <div className="h-64 md:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={mockPortfolioData}>
            <XAxis 
              dataKey="month" 
              tick={{ fill: 'rgba(226, 232, 240, 0.7)', fontSize: 12 }}
              axisLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
              tickLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
            />
            <YAxis 
              tick={{ fill: 'rgba(226, 232, 240, 0.7)', fontSize: 12 }}
              axisLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
              tickLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                color: 'white'
              }}
              formatter={(value: number) => [`$${value.toLocaleString()}`, 'Portfolio Value']}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{ fill: '#3b82f6', strokeWidth: 2, stroke: '#ffffff', r: 4 }}
              activeDot={{ r: 6, fill: '#3b82f6' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </GlassPanel>
  );
}
