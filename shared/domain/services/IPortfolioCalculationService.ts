import { Portfolio } from '../entities/Portfolio';
import { Transaction } from '../entities/Transaction';
import { Stock } from '../entities/Stock';
import { Money } from '../value-objects/Money';
import { Percentage } from '../value-objects/Percentage';

/**
 * Interface for portfolio calculation services
 */
export interface IPortfolioCalculationService {
  /**
   * Calculate portfolio metrics from transactions
   */
  calculatePortfolioMetrics(
    transactions: Transaction[],
    currentStockPrices: Map<string, Money>
  ): PortfolioMetrics;

  /**
   * Calculate portfolio allocation by sector/stock
   */
  calculateAllocation(
    transactions: Transaction[],
    currentStockPrices: Map<string, Money>
  ): AllocationData[];

  /**
   * Calculate portfolio performance over time
   */
  calculatePerformanceHistory(
    transactions: Transaction[],
    historicalPrices: Map<string, Map<Date, Money>>
  ): PerformanceData[];

  /**
   * Calculate risk metrics for the portfolio
   */
  calculateRiskMetrics(
    portfolio: Portfolio,
    stocks: Stock[]
  ): RiskMetrics;
}

export interface PortfolioMetrics {
  totalValue: Money;
  dailyPnL: Money;
  totalPnL: Money;
  successRate: Percentage;
  activePositions: number;
  totalInvested: Money;
}

export interface AllocationData {
  name: string;
  value: number;
  amount: Money;
  color: string;
}

export interface PerformanceData {
  date: Date;
  value: Money;
  pnl: Money;
}

export interface RiskMetrics {
  volatility: Percentage;
  sharpeRatio: number;
  maxDrawdown: Percentage;
  beta: number;
}
