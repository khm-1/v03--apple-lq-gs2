import { Portfolio } from '../../domain/entities/Portfolio';
import { PortfolioDto } from '../dto/PortfolioDto';
import { IPortfolioRepository } from '../../infrastructure/repositories/IPortfolioRepository';

/**
 * Use case for retrieving portfolio data
 */
export class GetPortfolioUseCase {
  constructor(
    private readonly portfolioRepository: IPortfolioRepository
  ) {}

  async execute(userId: number): Promise<PortfolioDto | null> {
    try {
      const portfolioData = await this.portfolioRepository.getByUserId(userId);
      
      if (!portfolioData) {
        return null;
      }

      const portfolio = new Portfolio(portfolioData);
      
      return this.mapToDto(portfolio);
    } catch (error) {
      throw new Error(`Failed to get portfolio: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private mapToDto(portfolio: Portfolio): PortfolioDto {
    const averagePositionValue = portfolio.getAveragePositionValue();
    
    return {
      id: portfolio.id,
      userId: portfolio.userId,
      totalValue: portfolio.totalValue.toFormattedString(),
      dailyPnL: portfolio.dailyPnL.toFormattedString(),
      successRate: portfolio.successRate.toFormattedString(),
      activePositions: portfolio.activePositions,
      performanceStatus: portfolio.getPerformanceStatus(),
      isDiversified: portfolio.isDiversified(),
      averagePositionValue: averagePositionValue.toFormattedString(),
    };
  }
}
