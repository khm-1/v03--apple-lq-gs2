import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ManageWatchlistUseCase } from '../../shared/application/use-cases/ManageWatchlistUseCase';

describe('ManageWatchlistUseCase', () => {
  let useCase: ManageWatchlistUseCase;
  let mockWatchlistRepo: any;
  let mockStockRepo: any;
  let mockWatchlistService: any;

  beforeEach(() => {
    mockWatchlistRepo = {
      getByUserId: vi.fn(),
      getByUserIdAndSymbol: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    mockStockRepo = {
      getAll: vi.fn(),
    };

    mockWatchlistService = {
      calculateWatchlistPerformance: vi.fn(),
    };

    useCase = new ManageWatchlistUseCase(
      mockWatchlistRepo,
      mockStockRepo,
      mockWatchlistService
    );
  });

  it('should get user watchlist successfully', async () => {
    const mockWatchlistData = [{ id: 1, userId: 1, symbol: 'AAPL', addedAt: new Date() }];
    const mockStocksData = [{ id: 1, symbol: 'AAPL', name: 'Apple Inc.', price: '150.00' }];
    const mockPerformance = { totalItems: 1, itemsWithAlerts: 0, averageDaysHeld: 5 };

    mockWatchlistRepo.getByUserId.mockResolvedValue(mockWatchlistData);
    mockStockRepo.getAll.mockResolvedValue(mockStocksData);
    mockWatchlistService.calculateWatchlistPerformance.mockReturnValue(mockPerformance);

    const result = await useCase.getUserWatchlist(1);

    expect(result.items).toHaveLength(1);
    expect(result.stocks).toHaveLength(1);
    expect(result.performance.totalItems).toBe(1);
  });

  it('should add stock to watchlist', async () => {
    const createDto = { symbol: 'AAPL', notes: 'Test note' };
    const mockCreatedItem = { id: 1, userId: 1, symbol: 'AAPL', addedAt: new Date() };

    mockWatchlistRepo.getByUserIdAndSymbol.mockResolvedValue(null);
    mockWatchlistRepo.create.mockResolvedValue(mockCreatedItem);

    const result = await useCase.addToWatchlist(1, createDto);

    expect(result.symbol).toBe('AAPL');
    expect(mockWatchlistRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ symbol: 'AAPL', userId: 1 })
    );
  });

  it('should prevent adding duplicate stocks', async () => {
    const createDto = { symbol: 'AAPL' };
    mockWatchlistRepo.getByUserIdAndSymbol.mockResolvedValue({ id: 1 });

    await expect(useCase.addToWatchlist(1, createDto))
      .rejects.toThrow('Stock already in watchlist');
  });
});
