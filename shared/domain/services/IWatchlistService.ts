import { WatchlistItem } from '../entities/WatchlistItem';
import { Stock } from '../entities/Stock';
import { Money } from '../value-objects/Money';

export interface IWatchlistService {
  /**
   * Check if any watchlist items should trigger alerts
   */
  checkAlerts(watchlistItems: WatchlistItem[], currentStocks: Stock[]): AlertInfo[];

  /**
   * Get performance summary for watchlist
   */
  calculateWatchlistPerformance(
    watchlistItems: WatchlistItem[], 
    currentStocks: Stock[]
  ): WatchlistPerformance;
}

export interface AlertInfo {
  watchlistItem: WatchlistItem;
  currentPrice: Money;
  targetPrice: Money;
  alertType: 'above_target' | 'below_target';
}

export interface WatchlistPerformance {
  totalItems: number;
  itemsWithAlerts: number;
  averageDaysHeld: number;
  topPerformer: { symbol: string; change: string } | null;
}
