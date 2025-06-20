import { StockData } from '../../domain/entities/Stock';

/**
 * Repository interface for stock data access
 */
export interface IStockRepository {
  /**
   * Get all stocks
   */
  getAll(): Promise<StockData[]>;

  /**
   * Get stock by symbol
   */
  getBySymbol(symbol: string): Promise<StockData | null>;

  /**
   * Update stock data
   */
  update(symbol: string, stock: Partial<StockData>): Promise<StockData>;

  /**
   * Create new stock
   */
  create(stock: Omit<StockData, 'id'>): Promise<StockData>;

  /**
   * Delete stock
   */
  delete(symbol: string): Promise<void>;
}
