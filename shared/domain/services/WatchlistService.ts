import { IWatchlistService, AlertInfo, WatchlistPerformance } from './IWatchlistService';
import { WatchlistItem } from '../entities/WatchlistItem';
import { Stock } from '../entities/Stock';
import { Money } from '../value-objects/Money';

/**
 * Implementation of watchlist service
 */
export class WatchlistService implements IWatchlistService {
  
  checkAlerts(watchlistItems: WatchlistItem[], currentStocks: Stock[]): AlertInfo[] {
    const alerts: AlertInfo[] = [];
    
    for (const item of watchlistItems) {
      if (!item.alertEnabled || !item.hasTargetPrice()) {
        continue;
      }
      
      const stock = this.findStockBySymbol(item.symbol.value, currentStocks);
      if (!stock) {
        continue;
      }
      
      const currentPrice = stock.price;
      const targetPrice = item.targetPrice!;
      
      // Check if current price triggers an alert
      if (this.shouldTriggerAlert(currentPrice, targetPrice)) {
        const alertType = currentPrice.isGreaterThan(targetPrice) ? 'above_target' : 'below_target';
        
        alerts.push({
          watchlistItem: item,
          currentPrice,
          targetPrice,
          alertType
        });
      }
    }
    
    return alerts;
  }

  calculateWatchlistPerformance(
    watchlistItems: WatchlistItem[], 
    currentStocks: Stock[]
  ): WatchlistPerformance {
    const totalItems = watchlistItems.length;
    
    // Count items with alerts
    const alerts = this.checkAlerts(watchlistItems, currentStocks);
    const itemsWithAlerts = alerts.length;
    
    // Calculate average days held
    const totalDays = watchlistItems.reduce((sum, item) => sum + item.daysSinceAdded, 0);
    const averageDaysHeld = totalItems > 0 ? Math.round(totalDays / totalItems) : 0;
    
    // Find top performer
    const topPerformer = this.findTopPerformer(watchlistItems, currentStocks);
    
    return {
      totalItems,
      itemsWithAlerts,
      averageDaysHeld,
      topPerformer
    };
  }

  private findStockBySymbol(symbol: string, stocks: Stock[]): Stock | null {
    return stocks.find(stock => stock.symbol.value === symbol) || null;
  }

  private shouldTriggerAlert(currentPrice: Money, targetPrice: Money): boolean {
    // Alert if price is significantly different from target (more than 2% difference)
    const tolerance = targetPrice.multiply(0.02);
    const upperBound = targetPrice.add(tolerance);
    const lowerBound = targetPrice.subtract(tolerance);
    
    return currentPrice.isGreaterThan(upperBound) || currentPrice.isLessThan(lowerBound);
  }

  private findTopPerformer(
    watchlistItems: WatchlistItem[], 
    currentStocks: Stock[]
  ): { symbol: string; change: string } | null {
    let topPerformer: { symbol: string; change: string } | null = null;
    let highestChange = -Infinity;
    
    for (const item of watchlistItems) {
      const stock = this.findStockBySymbol(item.symbol.value, currentStocks);
      if (!stock) {
        continue;
      }
      
      const changePercent = stock.changePercent.value;
      if (changePercent > highestChange) {
        highestChange = changePercent;
        topPerformer = {
          symbol: stock.symbol.value,
          change: stock.changePercent.toSignedString()
        };
      }
    }
    
    return topPerformer;
  }
}
