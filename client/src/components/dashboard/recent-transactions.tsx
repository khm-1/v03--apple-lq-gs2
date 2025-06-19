import GlassPanel from "./glass-panel";
import { ArrowUp, ArrowDown, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Transaction } from "@shared/schema";

interface RecentTransactionsProps {
  transactions: Transaction[];
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

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'buy':
        return 'bg-green-500/20';
      case 'sell':
        return 'bg-red-500/20';
      case 'dividend':
        return 'bg-blue-500/20';
      default:
        return 'bg-green-500/20';
    }
  };

  const formatTimeAgo = (timestamp: Date | string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  };

  const formatTransactionTitle = (transaction: Transaction) => {
    switch (transaction.type) {
      case 'buy':
        return `Buy ${transaction.symbol}`;
      case 'sell':
        return `Sell ${transaction.symbol}`;
      case 'dividend':
        return `Dividend ${transaction.symbol}`;
      default:
        return `${transaction.type} ${transaction.symbol}`;
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
        {transactions.slice(0, 3).map((transaction) => (
          <div key={transaction.id} className="glass-morphism-dark rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full ${getTransactionColor(transaction.type)} flex items-center justify-center`}>
                  {getTransactionIcon(transaction.type)}
                </div>
                <div>
                  <div className="text-white font-medium text-sm">
                    {formatTransactionTitle(transaction)}
                  </div>
                  <div className="text-slate-400 text-xs">
                    {formatTimeAgo(transaction.timestamp!)}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-white font-semibold text-sm">
                  {parseFloat(transaction.amount) >= 0 ? '+' : ''}${Math.abs(parseFloat(transaction.amount)).toLocaleString()}
                </div>
                {transaction.shares && (
                  <div className={`text-xs ${parseFloat(transaction.amount) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
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
