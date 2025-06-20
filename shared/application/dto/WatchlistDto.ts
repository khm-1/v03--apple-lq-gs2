import { StockDto } from './PortfolioDto';

export interface WatchlistItemDto {
  id: number;
  symbol: string;
  addedAt: string;
  notes: string;
  targetPrice?: string;
  alertEnabled: boolean;
  daysSinceAdded: number;
  hasTargetPrice: boolean;
  hasNotes: boolean;
}

export interface CreateWatchlistItemDto {
  symbol: string;
  notes?: string;
  targetPrice?: string;
  alertEnabled?: boolean;
}

export interface UpdateWatchlistItemDto {
  notes?: string;
  targetPrice?: string;
  alertEnabled?: boolean;
}

export interface WatchlistWithStocksDto {
  items: WatchlistItemDto[];
  stocks: StockDto[];
  performance: {
    totalItems: number;
    itemsWithAlerts: number;
    averageDaysHeld: number;
    topPerformer: { symbol: string; change: string } | null;
  };
}
