import { 
  IPortfolioCalculationService, 
  PortfolioMetrics, 
  AllocationData, 
  PerformanceData, 
  RiskMetrics 
} from './IPortfolioCalculationService';
import { Portfolio } from '../entities/Portfolio';
import { Transaction } from '../entities/Transaction';
import { Stock } from '../entities/Stock';
import { Money } from '../value-objects/Money';
import { Percentage } from '../value-objects/Percentage';

/**
 * Implementation of portfolio calculation service
 */
export class PortfolioCalculationService implements IPortfolioCalculationService {
  
  calculatePortfolioMetrics(
    transactions: Transaction[],
    currentStockPrices: Map<string, Money>
  ): PortfolioMetrics {
    const positions = this.calculatePositions(transactions);
    let totalValue = Money.zero();
    let totalInvested = Money.zero();
    let successfulTrades = 0;
    let totalTrades = 0;

    // Calculate current value and P&L
    for (const [symbol, shares] of positions) {
      const currentPrice = currentStockPrices.get(symbol);
      if (currentPrice && shares !== 0) {
        const positionValue = currentPrice.multiply(Math.abs(shares));
        totalValue = totalValue.add(positionValue);
      }
    }

    // Calculate total invested and success rate
    const buyTransactions = transactions.filter(t => t.isBuy());
    const sellTransactions = transactions.filter(t => t.isSell());

    for (const transaction of buyTransactions) {
      totalInvested = totalInvested.add(transaction.amount);
    }

    // Simple success rate calculation based on profitable sells
    for (const sellTx of sellTransactions) {
      totalTrades++;
      const buyTx = this.findMatchingBuyTransaction(sellTx, buyTransactions);
      if (buyTx) {
        const buyPrice = buyTx.getPricePerShare();
        const sellPrice = sellTx.getPricePerShare();
        if (buyPrice && sellPrice && sellPrice.isGreaterThan(buyPrice)) {
          successfulTrades++;
        }
      }
    }

    const successRate = totalTrades > 0 
      ? new Percentage((successfulTrades / totalTrades) * 100)
      : Percentage.zero();

    const totalPnL = totalValue.subtract(totalInvested);
    const dailyPnL = this.calculateDailyPnL(transactions, currentStockPrices);

    return {
      totalValue,
      dailyPnL,
      totalPnL,
      successRate,
      activePositions: Array.from(positions.values()).filter(shares => shares !== 0).length,
      totalInvested,
    };
  }

  calculateAllocation(
    transactions: Transaction[],
    currentStockPrices: Map<string, Money>
  ): AllocationData[] {
    // For demo purposes, return realistic sector allocation data
    const mockAllocations: AllocationData[] = [
      {
        name: "Technology",
        value: 42.5,
        amount: new Money(531250),
        color: "#3b82f6"
      },
      {
        name: "Healthcare",
        value: 18.7,
        amount: new Money(233750),
        color: "#22c55e"
      },
      {
        name: "Financial Services",
        value: 15.3,
        amount: new Money(191250),
        color: "#a855f7"
      },
      {
        name: "Consumer Discretionary",
        value: 12.8,
        amount: new Money(160000),
        color: "#f59e0b"
      },
      {
        name: "Energy",
        value: 6.4,
        amount: new Money(80000),
        color: "#ef4444"
      },
      {
        name: "Real Estate",
        value: 4.3,
        amount: new Money(53750),
        color: "#8b5cf6"
      }
    ];

    return mockAllocations;
  }

  calculatePerformanceHistory(
    transactions: Transaction[],
    historicalPrices: Map<string, Map<Date, Money>>
  ): PerformanceData[] {
    // Generate realistic 30-day performance history
    const performanceData: PerformanceData[] = [];
    const now = new Date();
    const baseValue = 1000000; // $1M starting value

    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);

      // Generate realistic market fluctuation (±3% daily variance)
      const randomFactor = 0.97 + (Math.random() * 0.06); // 0.97 to 1.03
      const trendFactor = 1 + (29 - i) * 0.001; // Slight upward trend

      const dailyValue = baseValue * randomFactor * trendFactor;
      const dailyPnL = dailyValue - baseValue;

      performanceData.push({
        date,
        value: new Money(dailyValue),
        pnl: new Money(Math.abs(dailyPnL)),
      });
    }

    return performanceData;
  }

  calculateRiskMetrics(portfolio: Portfolio, stocks: Stock[]): RiskMetrics {
    // Simplified risk metrics calculation
    // In a real system, you'd use historical price data and more sophisticated calculations
    
    const volatilitySum = stocks.reduce((sum, stock) => 
      sum + Math.abs(stock.changePercent.value), 0
    );
    const avgVolatility = stocks.length > 0 ? volatilitySum / stocks.length : 0;
    
    return {
      volatility: new Percentage(avgVolatility),
      sharpeRatio: portfolio.getDailyReturnPercentage().value / Math.max(avgVolatility, 1),
      maxDrawdown: new Percentage(5), // Placeholder
      beta: 1.0, // Placeholder
    };
  }

  private calculatePositions(transactions: Transaction[]): Map<string, number> {
    const positions = new Map<string, number>();

    for (const transaction of transactions) {
      const symbol = transaction.symbol.value;
      const currentShares = positions.get(symbol) || 0;

      if (transaction.isBuy() && transaction.shares) {
        positions.set(symbol, currentShares + transaction.shares);
      } else if (transaction.isSell() && transaction.shares) {
        positions.set(symbol, currentShares - Math.abs(transaction.shares));
      }
    }

    return positions;
  }

  private calculateDailyPnL(
    transactions: Transaction[],
    currentStockPrices: Map<string, Money>
  ): Money {
    // Simplified daily P&L calculation
    // In a real system, you'd compare with previous day's closing values
    const todayTransactions = transactions.filter(t => 
      this.isToday(t.timestamp)
    );

    let dailyPnL = Money.zero();
    for (const transaction of todayTransactions) {
      if (transaction.isBuy()) {
        dailyPnL = dailyPnL.subtract(transaction.amount);
      } else if (transaction.isSell()) {
        dailyPnL = dailyPnL.add(transaction.amount);
      } else if (transaction.isDividend()) {
        dailyPnL = dailyPnL.add(transaction.amount);
      }
    }

    return dailyPnL;
  }

  private findMatchingBuyTransaction(
    sellTransaction: Transaction,
    buyTransactions: Transaction[]
  ): Transaction | null {
    return buyTransactions
      .filter(t => t.symbol.equals(sellTransaction.symbol))
      .find(t => t.timestamp < sellTransaction.timestamp) || null;
  }

  private isToday(date: Date): boolean {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  private getColorForSymbol(symbol: string): string {
    const colors: Record<string, string> = {
      'AAPL': '#3b82f6',
      'MSFT': '#a855f7',
      'TSLA': '#22c55e',
      'AMZN': '#fb923c',
    };
    return colors[symbol] || '#6b7280';
  }
}
