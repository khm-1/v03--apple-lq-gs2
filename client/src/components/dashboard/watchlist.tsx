import GlassPanel from "./glass-panel";
import { Search, Plus, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { StockDisplayData } from "@/presentation/view-models/PortfolioViewModel";

interface WatchlistProps {
  stocks: StockDisplayData[];
}

export default function Watchlist({ stocks }: WatchlistProps) {

  return (
    <GlassPanel>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h3 className="text-xl font-semibold text-white mb-4 md:mb-0">Market Watchlist</h3>
        <div className="flex items-center gap-4">
          <div className="glass-morphism-dark rounded-lg px-4 py-2 flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search symbols..."
              className="bg-transparent text-white placeholder:text-slate-400 border-none outline-none text-sm w-32 md:w-40 p-0 h-auto focus-visible:ring-0"
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="glass-morphism-dark text-white hover:bg-white/20"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Symbol
          </Button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <div className="min-w-full">
          <div className="grid grid-cols-6 gap-4 pb-4 border-b border-white/10 text-slate-300 text-sm font-medium">
            <div>Symbol</div>
            <div>Price</div>
            <div>Change</div>
            <div>Volume</div>
            <div>Market Cap</div>
            <div>Action</div>
          </div>
          
          {stocks.map((stock) => {
            return (
              <div key={stock.symbol} className="grid grid-cols-6 gap-4 py-4 border-b border-white/5 hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${stock.gradientColor} flex items-center justify-center text-white text-xs font-bold`}>
                    {stock.symbol.charAt(0)}
                  </div>
                  <div>
                    <div className="text-white font-medium text-sm">{stock.symbol}</div>
                    <div className="text-slate-400 text-xs">{stock.name}</div>
                  </div>
                </div>
                <div className="text-white font-semibold">{stock.price}</div>
                <div className="flex items-center gap-1">
                  {stock.isPositive ? <TrendingUp className="w-3 h-3 text-green-400" /> : <TrendingDown className="w-3 h-3 text-red-400" />}
                  <span className={`font-medium ${stock.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                    {stock.isPositive ? '+' : ''}{stock.changePercent}
                  </span>
                </div>
                <div className="text-slate-300">{stock.volumeDisplay}</div>
                <div className="text-slate-300">{stock.marketCap}</div>
                <div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`glass-morphism-dark text-white hover:bg-white/20 text-xs px-3 py-1 h-auto ${stock.symbol === 'AAPL' ? 'pulse-glow' : ''}`}
                  >
                    Trade
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </GlassPanel>
  );
}
