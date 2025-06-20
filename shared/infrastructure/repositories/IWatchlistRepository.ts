import { WatchlistItemData } from '../../domain/entities/WatchlistItem';

export interface IWatchlistRepository {
  getByUserId(userId: number): Promise<WatchlistItemData[]>;
  getById(id: number): Promise<WatchlistItemData | null>;
  getByUserIdAndSymbol(userId: number, symbol: string): Promise<WatchlistItemData | null>;
  create(item: Omit<WatchlistItemData, 'id'>): Promise<WatchlistItemData>;
  update(id: number, item: Partial<WatchlistItemData>): Promise<WatchlistItemData>;
  delete(id: number): Promise<void>;
}
