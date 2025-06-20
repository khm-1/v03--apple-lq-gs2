import { StockSymbol } from '../value-objects/StockSymbol';
import { Money } from '../value-objects/Money';

export interface WatchlistItemData {
  id: number;
  userId: number;
  symbol: string;
  addedAt: Date;
  notes?: string;
  targetPrice?: string;
  alertEnabled: boolean;
}

export class WatchlistItem {
  constructor(private readonly data: WatchlistItemData) {
    this.validate();
  }

  get id(): number { return this.data.id; }
  get userId(): number { return this.data.userId; }
  get symbol(): StockSymbol { return new StockSymbol(this.data.symbol); }
  get addedAt(): Date { return this.data.addedAt; }
  get notes(): string { return this.data.notes || ''; }
  get alertEnabled(): boolean { return this.data.alertEnabled; }

  get targetPrice(): Money | null {
    return this.data.targetPrice ? Money.fromString(this.data.targetPrice) : null;
  }

  get daysSinceAdded(): number {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - this.addedAt.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  hasTargetPrice(): boolean {
    return this.targetPrice !== null;
  }

  hasNotes(): boolean {
    return this.notes.trim().length > 0;
  }

  shouldAlert(currentPrice: Money): boolean {
    if (!this.alertEnabled || !this.targetPrice) return false;
    return currentPrice.isGreaterThan(this.targetPrice) || currentPrice.isLessThan(this.targetPrice);
  }

  updateNotes(notes: string): WatchlistItem {
    return new WatchlistItem({
      ...this.data,
      notes: notes.trim()
    });
  }

  updateTargetPrice(targetPrice: Money | null): WatchlistItem {
    return new WatchlistItem({
      ...this.data,
      targetPrice: targetPrice?.amount.toString()
    });
  }

  toggleAlert(): WatchlistItem {
    return new WatchlistItem({
      ...this.data,
      alertEnabled: !this.data.alertEnabled
    });
  }

  private validate(): void {
    if (this.data.id <= 0) {
      throw new Error('Watchlist item ID must be positive');
    }
    if (this.data.userId <= 0) {
      throw new Error('User ID must be positive');
    }
    if (!this.data.symbol || this.data.symbol.trim().length === 0) {
      throw new Error('Stock symbol is required');
    }
  }

  toData(): WatchlistItemData {
    return { ...this.data };
  }
}
