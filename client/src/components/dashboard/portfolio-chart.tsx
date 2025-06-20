import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import GlassPanel from "./glass-panel";
import { Button } from "@/components/ui/button";
import type { PerformanceDataDto } from "@shared/application/dto/PortfolioDto";

interface PortfolioChartProps {
  performanceData?: PerformanceDataDto[];
}

export default function PortfolioChart({ performanceData }: PortfolioChartProps) {
  // Generate mock data if none provided
  const chartData = performanceData?.map(data => ({
    date: new Date(data.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    value: data.value,
    pnl: data.pnl
  })) || generateMockData();
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
          <LineChart data={chartData}>
            <XAxis
              dataKey="date"
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

function generateMockData() {
  const data = [];
  const baseValue = 1000000;
  const now = new Date();

  for (let i = 29; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const randomFactor = 0.97 + (Math.random() * 0.06);
    const trendFactor = 1 + (29 - i) * 0.001;
    const value = baseValue * randomFactor * trendFactor;

    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: Math.round(value),
      pnl: Math.round(value - baseValue)
    });
  }

  return data;
}
