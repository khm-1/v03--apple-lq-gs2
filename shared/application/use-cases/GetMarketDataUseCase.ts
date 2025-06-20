import { Stock } from '../../domain/entities/Stock';
import { StockDto } from '../dto/PortfolioDto';
import { IStockRepository } from '../../infrastructure/repositories/IStockRepository';

/**
 * Use case for retrieving market data
 */
export class GetMarketDataUseCase {
  constructor(
    private readonly stockRepository: IStockRepository
  ) {}

  async execute(): Promise<StockDto[]> {
    try {
      const stocksData = await this.stockRepository.getAll();
      
      const stocks = stocksData.map(data => new Stock(data));
      
      return stocks.map(stock => this.mapToDto(stock));
    } catch (error) {
      throw new Error(`Failed to get market data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getBySymbol(symbol: string): Promise<StockDto | null> {
    try {
      const stockData = await this.stockRepository.getBySymbol(symbol);
      
      if (!stockData) {
        return null;
      }

      const stock = new Stock(stockData);
      
      return this.mapToDto(stock);
    } catch (error) {
      throw new Error(`Failed to get stock data for ${symbol}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private mapToDto(stock: Stock): StockDto {
    return {
      id: stock.id,
      symbol: stock.symbol.value,
      name: stock.name,
      price: stock.price.toFormattedString(),
      change: stock.change.toFormattedString(),
      changePercent: stock.changePercent.toFormattedString(),
      volume: stock.volume,
      marketCap: stock.marketCap,
      isTrendingUp: stock.isTrendingUp(),
      performanceCategory: stock.getPerformanceCategory(),
      gradientColor: stock.getGradientColor(),
      volumeInMillions: stock.getVolumeInMillions(),
    };
  }
}
