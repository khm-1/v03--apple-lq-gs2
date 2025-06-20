import { WatchlistItem } from '../../domain/entities/WatchlistItem';
import { IWatchlistRepository } from '../../infrastructure/repositories/IWatchlistRepository';
import { IStockRepository } from '../../infrastructure/repositories/IStockRepository';
import { IWatchlistService } from '../../domain/services/IWatchlistService';
import {
  WatchlistWithStocksDto,
  WatchlistItemDto,
  CreateWatchlistItemDto,
  UpdateWatchlistItemDto
} from '../dto/WatchlistDto';
import { StockDto } from '../dto/PortfolioDto';
import { Stock } from '@shared/domain/entities/Stock';

export class ManageWatchlistUseCase {
  constructor(
    private readonly watchlistRepository: IWatchlistRepository,
    private readonly stockRepository: IStockRepository,
    private readonly watchlistService: IWatchlistService
  ) {}

  async getUserWatchlist(userId: number): Promise<WatchlistWithStocksDto> {
    try {
      const [watchlistData, stocksData] = await Promise.all([
        this.watchlistRepository.getByUserId(userId),
        this.stockRepository.getAll()
      ]);

      const watchlistItems = watchlistData.map(data => new WatchlistItem(data));
      const stocks = stocksData.map(data => new Stock(data));
      
      const performance = this.watchlistService.calculateWatchlistPerformance(
        watchlistItems, 
        stocks
      );

      return {
        items: watchlistItems.map(item => this.mapItemToDto(item)),
        stocks: stocks.map(stock => this.mapStockToDto(stock)),
        performance
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to get watchlist: ${errorMessage}`);
    }
  }

  async addToWatchlist(userId: number, createDto: CreateWatchlistItemDto): Promise<WatchlistItemDto> {
    try {
      // Check if already exists
      const existing = await this.watchlistRepository.getByUserIdAndSymbol(userId, createDto.symbol);
      if (existing) {
        throw new Error('Stock already in watchlist');
      }

      const newItemData = await this.watchlistRepository.create({
        userId,
        symbol: createDto.symbol.toUpperCase(),
        notes: createDto.notes || '',
        targetPrice: createDto.targetPrice,
        alertEnabled: createDto.alertEnabled || false,
        addedAt: new Date()
      });

      const watchlistItem = new WatchlistItem(newItemData);
      return this.mapItemToDto(watchlistItem);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to add to watchlist: ${errorMessage}`);
    }
  }

  async updateWatchlistItem(
    userId: number, 
    itemId: number, 
    updateDto: UpdateWatchlistItemDto
  ): Promise<WatchlistItemDto> {
    try {
      const existingData = await this.watchlistRepository.getById(itemId);
      if (!existingData || existingData.userId !== userId) {
        throw new Error('Watchlist item not found');
      }

      const updatedData = await this.watchlistRepository.update(itemId, updateDto);
      const watchlistItem = new WatchlistItem(updatedData);
      return this.mapItemToDto(watchlistItem);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to update watchlist item: ${errorMessage}`);
    }
  }

  async removeFromWatchlist(userId: number, itemId: number): Promise<void> {
    try {
      const existingData = await this.watchlistRepository.getById(itemId);
      if (!existingData || existingData.userId !== userId) {
        throw new Error('Watchlist item not found');
      }

      await this.watchlistRepository.delete(itemId);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to remove from watchlist: ${errorMessage}`);
    }
  }

  private mapItemToDto(item: WatchlistItem): WatchlistItemDto {
    return {
      id: item.id,
      symbol: item.symbol.value,
      addedAt: item.addedAt.toISOString(),
      notes: item.notes,
      targetPrice: item.targetPrice?.toFormattedString(),
      alertEnabled: item.alertEnabled,
      daysSinceAdded: item.daysSinceAdded,
      hasTargetPrice: item.hasTargetPrice(),
      hasNotes: item.hasNotes()
    };
  }

  private mapStockToDto(stock: Stock): StockDto {
    // Use existing stock mapping logic
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
      volumeInMillions: stock.getVolumeInMillions()
    };
  }
}
