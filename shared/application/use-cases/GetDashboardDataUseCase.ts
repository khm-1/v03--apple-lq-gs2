import { DashboardDataDto, AllocationDto, PerformanceDataDto, RiskMetricsDto } from '../dto/PortfolioDto';
import { GetPortfolioUseCase } from './GetPortfolioUseCase';
import { GetMarketDataUseCase } from './GetMarketDataUseCase';
import { GetTransactionsUseCase } from './GetTransactionsUseCase';
import { IPortfolioCalculationService } from '../../domain/services/IPortfolioCalculationService';
import { Portfolio } from '../../domain/entities/Portfolio';
import { Stock } from '../../domain/entities/Stock';
import { Transaction } from '../../domain/entities/Transaction';
import { Money } from '../../domain/value-objects/Money';

/**
 * Use case for retrieving complete dashboard data
 */
export class GetDashboardDataUseCase {
  constructor(
    private readonly getPortfolioUseCase: GetPortfolioUseCase,
    private readonly getMarketDataUseCase: GetMarketDataUseCase,
    private readonly getTransactionsUseCase: GetTransactionsUseCase,
    private readonly portfolioCalculationService: IPortfolioCalculationService
  ) {}

  async execute(userId: number): Promise<DashboardDataDto> {
    try {
      // Fetch all data in parallel
      const [portfolioDto, stocksDto, transactionsDto] = await Promise.all([
        this.getPortfolioUseCase.execute(userId),
        this.getMarketDataUseCase.execute(),
        this.getTransactionsUseCase.execute(userId),
      ]);

      if (!portfolioDto) {
        throw new Error('Portfolio not found');
      }

      // Convert DTOs back to domain entities for calculations
      const portfolio = this.createPortfolioFromDto(portfolioDto);
      const stocks = stocksDto.map(dto => this.createStockFromDto(dto));
      const transactions = transactionsDto.map(dto => this.createTransactionFromDto(dto));

      // Calculate additional metrics
      const currentStockPrices = this.createStockPriceMap(stocks);
      const allocation = this.portfolioCalculationService.calculateAllocation(transactions, currentStockPrices);
      const performanceHistory = this.portfolioCalculationService.calculatePerformanceHistory(transactions, new Map());
      const riskMetrics = this.portfolioCalculationService.calculateRiskMetrics(portfolio, stocks);

      return {
        portfolio: portfolioDto,
        stocks: stocksDto,
        transactions: transactionsDto,
        allocation: this.mapAllocationToDto(allocation),
        performanceHistory: this.mapPerformanceToDto(performanceHistory),
        riskMetrics: this.mapRiskMetricsToDto(riskMetrics),
      };
    } catch (error) {
      throw new Error(`Failed to get dashboard data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private createPortfolioFromDto(dto: any): Portfolio {
    return new Portfolio({
      id: dto.id,
      userId: dto.userId,
      totalValue: dto.totalValue.replace(/[$,]/g, ''),
      dailyPnL: dto.dailyPnL.replace(/[$,]/g, ''),
      successRate: dto.successRate.replace('%', ''),
      activePositions: dto.activePositions,
    });
  }

  private createStockFromDto(dto: any): Stock {
    return new Stock({
      id: dto.id,
      symbol: dto.symbol,
      name: dto.name,
      price: dto.price.replace(/[$,]/g, ''),
      change: dto.change.replace(/[$,]/g, ''),
      changePercent: dto.changePercent.replace('%', ''),
      volume: dto.volume,
      marketCap: dto.marketCap,
    });
  }

  private createTransactionFromDto(dto: any): Transaction {
    return new Transaction({
      id: dto.id,
      userId: dto.userId,
      type: dto.type,
      symbol: dto.symbol,
      amount: dto.amount.replace(/[$,]/g, ''),
      shares: dto.shares,
      timestamp: dto.timestamp ? new Date(dto.timestamp) : new Date(),
    });
  }

  private createStockPriceMap(stocks: Stock[]): Map<string, Money> {
    const priceMap = new Map<string, Money>();
    for (const stock of stocks) {
      priceMap.set(stock.symbol.value, stock.price);
    }
    return priceMap;
  }

  private mapAllocationToDto(allocation: any[]): AllocationDto[] {
    return allocation.map(item => ({
      name: item.name,
      value: item.value,
      amount: item.amount.toFormattedString(),
      color: item.color,
    }));
  }

  private mapPerformanceToDto(performance: any[]): PerformanceDataDto[] {
    return performance.map(item => ({
      date: item.date.toISOString(),
      value: item.value.amount,
      pnl: item.pnl.amount,
    }));
  }

  private mapRiskMetricsToDto(riskMetrics: any): RiskMetricsDto {
    return {
      volatility: riskMetrics.volatility.toFormattedString(),
      sharpeRatio: riskMetrics.sharpeRatio,
      maxDrawdown: riskMetrics.maxDrawdown.toFormattedString(),
      beta: riskMetrics.beta,
    };
  }
}
