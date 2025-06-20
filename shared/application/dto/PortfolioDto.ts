/**
 * Data Transfer Objects for Portfolio operations
 */

export interface PortfolioDto {
  id: number;
  userId: number;
  totalValue: string;
  dailyPnL: string;
  successRate: string;
  activePositions: number;
  performanceStatus: string;
  isDiversified: boolean;
  averagePositionValue: string;
}

export interface StockDto {
  id: number;
  symbol: string;
  name: string;
  price: string;
  change: string;
  changePercent: string;
  volume: number;
  marketCap: string;
  isTrendingUp: boolean;
  performanceCategory: string;
  gradientColor: string;
  volumeInMillions: number;
}

export interface TransactionDto {
  id: number;
  userId: number;
  type: string;
  symbol: string;
  amount: string;
  shares: number | null;
  timestamp: Date | null;
  formattedTitle: string;
  timeAgo: string;
  iconColorClass: string;
  backgroundColorClass: string;
  pricePerShare?: string;
}

export interface AllocationDto {
  name: string;
  value: number;
  amount: string;
  color: string;
}

export interface PerformanceDataDto {
  date: string;
  value: number;
  pnl: number;
}

export interface RiskMetricsDto {
  volatility: string;
  sharpeRatio: number;
  maxDrawdown: string;
  beta: number;
}

export interface DashboardDataDto {
  portfolio: PortfolioDto;
  stocks: StockDto[];
  transactions: TransactionDto[];
  allocation: AllocationDto[];
  performanceHistory: PerformanceDataDto[];
  riskMetrics: RiskMetricsDto;
}
