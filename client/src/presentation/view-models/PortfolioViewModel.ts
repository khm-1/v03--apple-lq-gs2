import { PortfolioDto, StockDto, TransactionDto } from '@shared/application/dto/PortfolioDto';

/**
 * View model for portfolio display data
 */
export class PortfolioViewModel {
  constructor(
    private readonly portfolio: PortfolioDto,
    private readonly stocks: StockDto[],
    private readonly transactions: TransactionDto[]
  ) {}

  // Portfolio KPI data
  getTotalValueDisplay(): string {
    return this.portfolio.totalValue;
  }

  getDailyPnLDisplay(): string {
    return this.portfolio.dailyPnL;
  }

  getDailyPnLChange(): string {
    return this.portfolio.dailyPnL;
  }

  getSuccessRateDisplay(): string {
    return this.portfolio.successRate;
  }

  getActivePositionsDisplay(): string {
    return this.portfolio.activePositions.toString();
  }

  getActivePositionsChange(): string {
    return `${this.portfolio.activePositions} Active`;
  }

  getPerformanceStatus(): string {
    return this.portfolio.performanceStatus;
  }

  isDiversified(): boolean {
    return this.portfolio.isDiversified;
  }

  // Stock data for market overview
  getStocksForDisplay(): StockDisplayData[] {
    return this.stocks.map(stock => ({
      symbol: stock.symbol,
      name: stock.name,
      price: stock.price,
      change: stock.change,
      changePercent: stock.changePercent,
      volume: stock.volume,
      marketCap: stock.marketCap,
      isPositive: stock.isTrendingUp,
      gradientColor: stock.gradientColor,
      volumeDisplay: `${stock.volumeInMillions}M`,
      performanceCategory: stock.performanceCategory,
    }));
  }

  // Transaction data for recent activity
  getRecentTransactionsForDisplay(limit: number = 3): TransactionDisplayData[] {
    return this.transactions.slice(0, limit).map(transaction => ({
      id: transaction.id,
      title: transaction.formattedTitle,
      amount: transaction.amount,
      shares: transaction.shares,
      timeAgo: transaction.timeAgo,
      iconColorClass: transaction.iconColorClass,
      backgroundColorClass: transaction.backgroundColorClass,
      type: transaction.type,
      isPositive: transaction.type === 'buy' || transaction.type === 'dividend',
    }));
  }

  // Helper methods for UI state
  isPortfolioPerformingWell(): boolean {
    return this.portfolio.performanceStatus === 'excellent' || this.portfolio.performanceStatus === 'good';
  }

  getPortfolioStatusColor(): string {
    switch (this.portfolio.performanceStatus) {
      case 'excellent':
        return 'text-green-400';
      case 'good':
        return 'text-blue-400';
      case 'average':
        return 'text-yellow-400';
      case 'poor':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  }

  hasTransactions(): boolean {
    return this.transactions.length > 0;
  }

  hasStocks(): boolean {
    return this.stocks.length > 0;
  }
}

export interface StockDisplayData {
  symbol: string;
  name: string;
  price: string;
  change: string;
  changePercent: string;
  volume: number;
  marketCap: string;
  isPositive: boolean;
  gradientColor: string;
  volumeDisplay: string;
  performanceCategory: string;
}

export interface TransactionDisplayData {
  id: number;
  title: string;
  amount: string;
  shares: number | null;
  timeAgo: string;
  iconColorClass: string;
  backgroundColorClass: string;
  type: string;
  isPositive: boolean;
}
