import { describe, it, expect } from 'vitest';
import { WatchlistItem } from '../../shared/domain/entities/WatchlistItem';
import { Money } from '../../shared/domain/value-objects/Money';

describe('WatchlistItem Entity', () => {
  const sampleData = {
    id: 1,
    userId: 1,
    symbol: 'AAPL',
    addedAt: new Date('2024-01-01'),
    notes: 'Great company',
    targetPrice: '200.00',
    alertEnabled: true
  };

  it('should create watchlist item with valid data', () => {
    const item = new WatchlistItem(sampleData);

    expect(item.id).toBe(1);
    expect(item.symbol.value).toBe('AAPL');
    expect(item.notes).toBe('Great company');
    expect(item.hasTargetPrice()).toBe(true);
    expect(item.alertEnabled).toBe(true);
  });

  it('should calculate days since added correctly', () => {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const item = new WatchlistItem({ ...sampleData, addedAt: yesterday });

    expect(item.daysSinceAdded).toBe(1);
  });

  it('should update notes correctly', () => {
    const item = new WatchlistItem(sampleData);
    const updated = item.updateNotes('New notes');

    expect(updated.notes).toBe('New notes');
    expect(item.notes).toBe('Great company'); // Original unchanged
  });

  it('should validate required fields', () => {
    expect(() => new WatchlistItem({ ...sampleData, id: 0 }))
      .toThrow('Watchlist item ID must be positive');

    expect(() => new WatchlistItem({ ...sampleData, symbol: '' }))
      .toThrow('Stock symbol is required');
  });
});
