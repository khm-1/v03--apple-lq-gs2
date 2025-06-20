import { IWatchlistRepository } from './IWatchlistRepository';
import { WatchlistItemData } from '../../domain/entities/WatchlistItem';

export class MemoryWatchlistRepository implements IWatchlistRepository {
  private items = new Map<number, WatchlistItemData>();
  private userItems = new Map<number, number[]>();
  private currentId = 1;

  constructor() {
    this.initializeSampleData();
  }

  async getByUserId(userId: number): Promise<WatchlistItemData[]> {
    const itemIds = this.userItems.get(userId) || [];
    return itemIds.map(id => this.items.get(id)!).filter(Boolean);
  }

  async getById(id: number): Promise<WatchlistItemData | null> {
    return this.items.get(id) || null;
  }

  async getByUserIdAndSymbol(userId: number, symbol: string): Promise<WatchlistItemData | null> {
    const userItemIds = this.userItems.get(userId) || [];
    for (const itemId of userItemIds) {
      const item = this.items.get(itemId);
      if (item && item.symbol.toUpperCase() === symbol.toUpperCase()) {
        return item;
      }
    }
    return null;
  }

  async create(itemData: Omit<WatchlistItemData, 'id'>): Promise<WatchlistItemData> {
    const newItem: WatchlistItemData = {
      ...itemData,
      id: this.currentId++
    };

    this.items.set(newItem.id, newItem);
    
    const userItemIds = this.userItems.get(itemData.userId) || [];
    userItemIds.push(newItem.id);
    this.userItems.set(itemData.userId, userItemIds);

    return newItem;
  }

  async update(id: number, updateData: Partial<WatchlistItemData>): Promise<WatchlistItemData> {
    const existing = this.items.get(id);
    if (!existing) {
      throw new Error(`Watchlist item not found: ${id}`);
    }

    const updated = { ...existing, ...updateData };
    this.items.set(id, updated);
    return updated;
  }

  async delete(id: number): Promise<void> {
    const item = this.items.get(id);
    if (!item) return;

    this.items.delete(id);
    
    const userItemIds = this.userItems.get(item.userId) || [];
    const filteredIds = userItemIds.filter(itemId => itemId !== id);
    this.userItems.set(item.userId, filteredIds);
  }

  private initializeSampleData(): void {
    const sampleItems: WatchlistItemData[] = [
      {
        id: 1,
        userId: 1,
        symbol: 'AAPL',
        addedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        notes: 'Strong fundamentals, waiting for dip',
        targetPrice: '200.00',
        alertEnabled: true
      },
      {
        id: 2,
        userId: 1,
        symbol: 'TSLA',
        addedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        notes: 'Watching for earnings announcement',
        alertEnabled: false
      },
      {
        id: 3,
        userId: 1,
        symbol: 'NVDA',
        addedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        notes: 'AI growth potential',
        targetPrice: '900.00',
        alertEnabled: true
      }
    ];

    sampleItems.forEach(item => {
      this.items.set(item.id, item);
      const userItemIds = this.userItems.get(item.userId) || [];
      userItemIds.push(item.id);
      this.userItems.set(item.userId, userItemIds);
    });

    this.currentId = 4;
  }
}
