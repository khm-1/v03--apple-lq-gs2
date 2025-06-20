import GlassPanel from "./glass-panel";
import { ArrowUp, ArrowDown, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TransactionDisplayData } from "@/presentation/view-models/PortfolioViewModel";

interface RecentTransactionsProps {
  transactions: TransactionDisplayData[];
}

export default function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'buy':
        return <ArrowUp className="w-4 h-4 text-green-400" />;
      case 'sell':
        return <ArrowDown className="w-4 h-4 text-red-400" />;
      case 'dividend':
        return <Coins className="w-4 h-4 text-blue-400" />;
      default:
        return <ArrowUp className="w-4 h-4 text-green-400" />;
    }
  };



  return (
    <GlassPanel>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white">Recent Activity</h3>
        <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300 hover:bg-transparent">
          View All
        </Button>
      </div>
      <div className="space-y-4">
        {transactions.map((transaction) => (
          <div key={transaction.id} className="glass-morphism-dark rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full ${transaction.backgroundColorClass} flex items-center justify-center`}>
                  {getTransactionIcon(transaction.type)}
                </div>
                <div>
                  <div className="text-white font-medium text-sm">
                    {transaction.title}
                  </div>
                  <div className="text-slate-400 text-xs">
                    {transaction.timeAgo}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-white font-semibold text-sm">
                  {transaction.isPositive ? '+' : ''}{transaction.amount}
                </div>
                {transaction.shares && (
                  <div className={`text-xs ${transaction.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                    {transaction.shares > 0 ? '+' : ''}{transaction.shares} shares
                  </div>
                )}
                {transaction.type === 'dividend' && (
                  <div className="text-blue-400 text-xs">Quarterly</div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </GlassPanel>
  );
}
