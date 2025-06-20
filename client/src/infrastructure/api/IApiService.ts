import { 
  PortfolioDto, 
  StockDto, 
  TransactionDto, 
  DashboardDataDto 
} from '@shared/application/dto/PortfolioDto';

/**
 * Interface for API service
 */
export interface IApiService {
  /**
   * Get portfolio data for a user
   */
  getPortfolio(userId: number): Promise<PortfolioDto>;

  /**
   * Get all market data
   */
  getMarketData(): Promise<StockDto[]>;

  /**
   * Get stock data by symbol
   */
  getStock(symbol: string): Promise<StockDto>;

  /**
   * Get transactions for a user
   */
  getTransactions(userId: number): Promise<TransactionDto[]>;

  /**
   * Get complete dashboard data
   */
  getDashboardData(userId: number): Promise<DashboardDataDto>;
}
