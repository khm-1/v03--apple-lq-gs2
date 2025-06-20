import GlassPanel from "./glass-panel";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { StockDisplayData } from "@/presentation/view-models/PortfolioViewModel";

interface MarketOverviewProps {
  stocks: StockDisplayData[];
}

export default function MarketOverview({ stocks }: MarketOverviewProps) {
  const getProgressWidth = (changePercent: string) => {
    const change = parseFloat(changePercent.replace('%', ''));
    return Math.min(Math.abs(change) * 10 + 45, 95);
  };

  return (
    <GlassPanel>
      <h3 className="text-xl font-semibold text-white mb-6">Market Overview</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stocks.map((stock) => {
          return (
            <div key={stock.symbol} className="glass-morphism-dark rounded-xl p-4 hover-glass">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${stock.gradientColor} flex items-center justify-center text-white text-xs font-bold`}>
                    {stock.symbol.charAt(0)}
                  </div>
                  <div>
                    <div className="text-white font-medium">{stock.name}</div>
                    <div className="text-slate-400 text-xs">NASDAQ</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-semibold">{stock.price}</div>
                  <div className={`text-sm flex items-center gap-1 ${stock.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                    {stock.isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {stock.isPositive ? '+' : ''}{stock.changePercent}
                  </div>
                </div>
              </div>
              <div className="w-full bg-slate-700/50 rounded-full h-1">
                <div
                  className={`h-1 rounded-full ${stock.isPositive ? 'bg-gradient-to-r from-green-500 to-blue-500' : 'bg-gradient-to-r from-red-500 to-orange-500'}`}
                  style={{ width: `${getProgressWidth(stock.changePercent)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </GlassPanel>
  );
}
