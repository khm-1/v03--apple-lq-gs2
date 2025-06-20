import { PortfolioData } from '../../domain/entities/Portfolio';

/**
 * Repository interface for portfolio data access
 */
export interface IPortfolioRepository {
  /**
   * Get portfolio by user ID
   */
  getByUserId(userId: number): Promise<PortfolioData | null>;

  /**
   * Update portfolio data
   */
  update(userId: number, portfolio: Partial<PortfolioData>): Promise<PortfolioData>;

  /**
   * Create new portfolio
   */
  create(portfolio: Omit<PortfolioData, 'id'>): Promise<PortfolioData>;

  /**
   * Delete portfolio
   */
  delete(userId: number): Promise<void>;
}
