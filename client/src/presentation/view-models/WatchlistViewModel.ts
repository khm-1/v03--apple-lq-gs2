import { WatchlistWithStocksDto, WatchlistItemDto } from '@shared/application/dto/WatchlistDto';
import { StockDto } from '@shared/application/dto/PortfolioDto';

export interface WatchlistDisplayItem {
  id: number;
  symbol: string;
  name: string;
  currentPrice: string;
  change: string;
  changePercent: string;
  isPositive: boolean;
  notes: string;
  targetPrice?: string;
  alertEnabled: boolean;
  daysSinceAdded: number;
  hasTargetPrice: boolean;
  hasNotes: boolean;
  gradientColor: string;
  alertStatus: 'none' | 'above_target' | 'below_target' | 'at_target';
}

export class WatchlistViewModel {
  constructor(private readonly data: WatchlistWithStocksDto) {}

  getWatchlistItems(): WatchlistDisplayItem[] {
    return this.data.items.map(item => {
      const stock = this.findStockBySymbol(item.symbol);
      const alertStatus = this.calculateAlertStatus(item, stock);

      return {
        id: item.id,
        symbol: item.symbol,
        name: stock?.name || item.symbol,
        currentPrice: stock?.price || 'N/A',
        change: stock?.change || '0.00',
        changePercent: stock?.changePercent || '0.00%',
        isPositive: stock?.isTrendingUp || false,
        notes: item.notes,
        targetPrice: item.targetPrice,
        alertEnabled: item.alertEnabled,
        daysSinceAdded: item.daysSinceAdded,
        hasTargetPrice: item.hasTargetPrice,
        hasNotes: item.hasNotes,
        gradientColor: stock?.gradientColor || 'from-gray-500 to-gray-600',
        alertStatus
      };
    });
  }

  getPerformanceData() {
    return {
      totalItems: this.data.performance.totalItems,
      itemsWithAlerts: this.data.performance.itemsWithAlerts,
      averageDaysHeld: this.data.performance.averageDaysHeld,
      topPerformer: this.data.performance.topPerformer
    };
  }

  getAvailableStocks(): StockDto[] {
    const watchlistSymbols = new Set(this.data.items.map(item => item.symbol));
    return this.data.stocks.filter(stock => !watchlistSymbols.has(stock.symbol));
  }

  hasItems(): boolean {
    return this.data.items.length > 0;
  }

  getItemsWithAlerts(): WatchlistDisplayItem[] {
    return this.getWatchlistItems().filter(item =>
      item.alertEnabled && item.alertStatus !== 'none'
    );
  }

  private findStockBySymbol(symbol: string): StockDto | undefined {
    return this.data.stocks.find(stock => stock.symbol === symbol);
  }

  private calculateAlertStatus(item: WatchlistItemDto, stock?: StockDto): 'none' | 'above_target' | 'below_target' | 'at_target' {
    if (!item.alertEnabled || !item.targetPrice || !stock) {
      return 'none';
    }

    const currentPrice = parseFloat(stock.price.replace(/[$,]/g, ''));
    const targetPrice = parseFloat(item.targetPrice.replace(/[$,]/g, ''));
    const tolerance = targetPrice * 0.02; // 2% tolerance

    if (Math.abs(currentPrice - targetPrice) <= tolerance) {
      return 'at_target';
    } else if (currentPrice > targetPrice) {
      return 'above_target';
    } else {
      return 'below_target';
    }
  }
}
